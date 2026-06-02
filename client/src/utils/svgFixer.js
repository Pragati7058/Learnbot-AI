/**
 * fixSvg — parse AI-generated SVG, detect overlaps, reposition nodes.
 * Works for both diagrams and flowcharts.
 */
export function fixSvg(rawSvg, type = "diagram") {
  if (!rawSvg) return rawSvg;

  // ── 1. Parse into DOM ─────────────────────────────────────
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawSvg, "image/svg+xml");
  const svg = doc.querySelector("svg");
  if (!svg) return rawSvg;

  // ── 2. Force correct viewBox & dimensions ─────────────────
  if (type === "flowchart") {
    svg.setAttribute("viewBox", "0 0 440 580");
    svg.setAttribute("width",   "440");
    svg.setAttribute("height",  "580");
    fixFlowchart(svg);
  } else {
    svg.setAttribute("viewBox", "0 0 640 400");
    svg.setAttribute("width",   "640");
    svg.setAttribute("height",  "400");
    fixDiagram(svg);
  }

  // ── 3. Ensure all text is readable ────────────────────────
  enforceTextVisibility(svg);

  return new XMLSerializer().serializeToString(doc);
}

/* ── FLOWCHART FIXER ──────────────────────────────────────────
   Flowcharts should be purely vertical. Re-stack all shape
   groups from top to bottom with fixed 90px spacing.          */
function fixFlowchart(svg) {
  const CX     = 220;   // horizontal center
  const START_Y = 60;   // first shape center y
  const STEP    = 92;   // y increment per shape
  const W = 440, H = 580;

  // Collect every shape element (not bg rect, not lines, not text labels)
  const shapes = getShapeElements(svg);
  if (shapes.length === 0) return;

  // Cap at 6 shapes so they all fit
  const capped = shapes.slice(0, 6);

  // Reposition each shape and its associated text
  capped.forEach((el, i) => {
    const cy = START_Y + i * STEP;
    repositionShape(el, CX, cy, svg);
  });

  // Redraw all connector lines
  redrawFlowchartArrows(svg, capped, CX, START_Y, STEP);

  // Fix background rect
  const bg = svg.querySelector("rect:first-child") || svg.querySelector("rect");
  if (bg && !bg.getAttribute("stroke")) {
    bg.setAttribute("x", "0");
    bg.setAttribute("y", "0");
    bg.setAttribute("width",  String(W));
    bg.setAttribute("height", String(H));
    bg.setAttribute("fill",   "#070707");
  }
}

/* ── DIAGRAM FIXER ────────────────────────────────────────────
   Diagrams can be multi-row grids. Re-layout nodes in a grid
   with guaranteed minimum spacing.                            */
function fixDiagram(svg) {
  const W = 640, H = 400;
  const NODE_W = 130, NODE_H = 44;
  const PAD_X = 50, PAD_Y = 55;
  const COL_W = 170, ROW_H = 90;

  const shapes = getShapeElements(svg);
  if (shapes.length === 0) return;

  const capped = shapes.slice(0, 7);
  const cols   = capped.length <= 3 ? capped.length : Math.ceil(Math.sqrt(capped.length));

  capped.forEach((el, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx  = PAD_X + NODE_W / 2 + col * COL_W;
    const cy  = PAD_Y + NODE_H / 2 + row * ROW_H;
    repositionShape(el, cx, cy, svg);
  });

  // Fix background
  const bg = svg.querySelector("rect:first-child") || svg.querySelector("rect");
  if (bg && !bg.getAttribute("stroke")) {
    bg.setAttribute("x", "0");
    bg.setAttribute("y", "0");
    bg.setAttribute("width",  String(W));
    bg.setAttribute("height", String(H));
    bg.setAttribute("fill",   "#070707");
  }
}

/* ── Collect shape elements (rects, ellipses, polygons that are nodes) ── */
function getShapeElements(svg) {
  const results = [];

  // Collect rects that look like nodes (not background, not title bar)
  svg.querySelectorAll("rect").forEach(el => {
    const w = parseFloat(el.getAttribute("width")  || 0);
    const h = parseFloat(el.getAttribute("height") || 0);
    const x = parseFloat(el.getAttribute("x")      || 0);
    const y = parseFloat(el.getAttribute("y")      || 0);
    // Skip: full-width bg rects, title bar rects, shadow rects
    if (w > 500) return;          // background
    if (h > 60)  return;          // too tall for a node
    if (w < 40)  return;          // too small
    const fill = el.getAttribute("fill") || "";
    if (fill === "#070707" || fill === "none") return;
    // Skip shadow rects (slightly offset duplicates)
    results.push({ el, type: "rect", cx: x + w / 2, cy: y + h / 2, w, h });
  });

  // Ellipses (terminal nodes)
  svg.querySelectorAll("ellipse").forEach(el => {
    const cx = parseFloat(el.getAttribute("cx") || 0);
    const cy = parseFloat(el.getAttribute("cy") || 0);
    const rx = parseFloat(el.getAttribute("rx") || 0);
    const ry = parseFloat(el.getAttribute("ry") || 0);
    if (rx < 10) return;
    results.push({ el, type: "ellipse", cx, cy, w: rx * 2, h: ry * 2 });
  });

  // Polygons (diamonds, IO parallelograms)
  svg.querySelectorAll("polygon").forEach(el => {
    const pts = el.getAttribute("points") || "";
    if (!pts || el.closest("marker")) return;  // skip arrowhead polygons
    const coords = parsePoints(pts);
    if (coords.length < 3) return;
    const xs = coords.map(p => p[0]);
    const ys = coords.map(p => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    if (maxX - minX < 30) return;
    results.push({ el, type: "polygon", cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, w: maxX - minX, h: maxY - minY, pts: coords });
  });

  // Sort top-to-bottom then left-to-right
  results.sort((a, b) => a.cy !== b.cy ? a.cy - b.cy : a.cx - b.cx);

  // Deduplicate overlapping shapes (shadows create dupes)
  const deduped = [];
  for (const item of results) {
    const dup = deduped.find(d => Math.abs(d.cx - item.cx) < 20 && Math.abs(d.cy - item.cy) < 20);
    if (!dup) deduped.push(item);
  }

  return deduped;
}

/* ── Reposition a shape and its nearest text label ─────────── */
function repositionShape(item, newCx, newCy, svg) {
  const { el, type, cx: oldCx, cy: oldCy, w, h, pts } = item;
  const dx = newCx - oldCx;
  const dy = newCy - oldCy;

  if (type === "rect") {
    const x = parseFloat(el.getAttribute("x") || 0);
    const y = parseFloat(el.getAttribute("y") || 0);
    el.setAttribute("x", String(x + dx));
    el.setAttribute("y", String(y + dy));
    // Move shadow rect too (sibling just before)
    const prev = el.previousElementSibling;
    if (prev && prev.tagName === "rect") {
      const px = parseFloat(prev.getAttribute("x") || 0);
      const py = parseFloat(prev.getAttribute("y") || 0);
      const pw = parseFloat(prev.getAttribute("width") || 0);
      if (pw < 200) { // shadow
        prev.setAttribute("x", String(px + dx));
        prev.setAttribute("y", String(py + dy));
      }
    }
  } else if (type === "ellipse") {
    const ocx = parseFloat(el.getAttribute("cx") || 0);
    const ocy = parseFloat(el.getAttribute("cy") || 0);
    el.setAttribute("cx", String(ocx + dx));
    el.setAttribute("cy", String(ocy + dy));
  } else if (type === "polygon") {
    const newPts = pts.map(([px, py]) => `${px + dx},${py + dy}`).join(" ");
    el.setAttribute("points", newPts);
  }

  // Move the nearest text label
  moveNearestText(svg, oldCx, oldCy, dx, dy);
}

/* ── Move the closest text element to (oldCx, oldCy) ──────── */
function moveNearestText(svg, oldCx, oldCy, dx, dy) {
  let best = null, bestDist = 999;
  svg.querySelectorAll("text").forEach(t => {
    const tx = parseFloat(t.getAttribute("x") || 0);
    const ty = parseFloat(t.getAttribute("y") || 0);
    const dist = Math.hypot(tx - oldCx, ty - oldCy);
    if (dist < bestDist && dist < 80) { bestDist = dist; best = t; }
  });
  if (best) {
    const tx = parseFloat(best.getAttribute("x") || 0);
    const ty = parseFloat(best.getAttribute("y") || 0);
    best.setAttribute("x", String(tx + dx));
    best.setAttribute("y", String(ty + dy));
    // Also move tspans
    best.querySelectorAll("tspan").forEach(ts => {
      const tsx = ts.getAttribute("x");
      if (tsx !== null) ts.setAttribute("x", String(parseFloat(tsx) + dx));
    });
  }
}

/* ── Redraw arrows for flowchart ──────────────────────────── */
function redrawFlowchartArrows(svg, shapes, cx, startY, step) {
  // Remove all existing lines
  svg.querySelectorAll("line").forEach(l => l.remove());

  const ns = "http://www.w3.org/2000/svg";

  shapes.forEach((item, i) => {
    if (i === shapes.length - 1) return;
    const curY  = startY + i * step;
    const nextY = startY + (i + 1) * step;

    // Bottom of current shape
    const y1 = curY + getShapeHalfH(item);
    // Top of next shape
    const y2 = nextY - getShapeHalfH(shapes[i + 1]);

    if (y2 <= y1) return; // no room for arrow

    const line = doc_createElement(svg, ns, "line");
    line.setAttribute("x1", String(cx));
    line.setAttribute("y1", String(y1 + 2));
    line.setAttribute("x2", String(cx));
    line.setAttribute("y2", String(y2 - 2));
    line.setAttribute("stroke", "#d4d4d4");
    line.setAttribute("stroke-width", "1.5");
    line.setAttribute("marker-end", "url(#arr)");
    svg.appendChild(line);
  });
}

function getShapeHalfH(item) {
  if (item.type === "ellipse") return parseFloat(item.el.getAttribute("ry") || 22);
  if (item.type === "polygon") return item.h / 2;
  return parseFloat(item.el.getAttribute("height") || 40) / 2;
}

function doc_createElement(svg, ns, tag) {
  return svg.ownerDocument.createElementNS(ns, tag);
}

/* ── Ensure all text has a visible fill ───────────────────── */
function enforceTextVisibility(svg) {
  svg.querySelectorAll("text, tspan").forEach(el => {
    const fill = el.getAttribute("fill");
    if (!fill || fill === "none" || fill === "black" || fill === "#000") {
      el.setAttribute("fill", "#f5f5f5");
    }
  });
}

/* ── Parse SVG points string → [[x,y],...] ────────────────── */
function parsePoints(str) {
  return str.trim().split(/[\s,]+/).reduce((acc, val, i, arr) => {
    if (i % 2 === 0) acc.push([parseFloat(val), parseFloat(arr[i + 1] || 0)]);
    return acc;
  }, []);
}
