const User      = require("../models/User");
const StudyPlan = require("../models/StudyPlan");
const { sendEmail } = require("./email");

const getWeekRange = () => {
  const now   = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 7);
  return { start, end: now };
};

const buildReportHTML = (user, plans, { start, end }) => {
  const totalTasks  = plans.reduce((a, p) => a + p.tasks.length, 0);
  const doneTasks   = plans.reduce((a, p) => a + p.tasks.filter(t => t.done).length, 0);
  const pct         = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const overdue     = plans.filter(p => p.targetDate && new Date(p.targetDate) < end && !p.tasks.every(t => t.done));
  const upcoming    = plans.filter(p => p.targetDate && new Date(p.targetDate) >= end);

  const planRows = plans.map(p => {
    const done = p.tasks.filter(t => t.done).length;
    const total = p.tasks.length;
    const pp = total ? Math.round((done / total) * 100) : 0;
    const due = p.targetDate ? new Date(p.targetDate).toDateString() : "No date";
    return `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#1e293b">${p.subject}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b">${done}/${total}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;">
          <div style="background:#e2e8f0;border-radius:4px;height:6px;width:80px">
            <div style="background:#6366f1;border-radius:4px;height:6px;width:${pp * 0.8}px"></div>
          </div>
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b">${due}</td>
      </tr>`;
  }).join("");

  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f8fafc;font-family:sans-serif">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">

    <div style="background:#6366f1;padding:28px 32px">
      <div style="font-size:22px;font-weight:700;color:#fff">📚 Weekly Study Report</div>
      <div style="font-size:13px;color:#c7d2fe;margin-top:4px">
        ${start.toDateString()} – ${end.toDateString()}
      </div>
    </div>

    <div style="padding:24px 32px">
      <p style="font-size:15px;color:#334155;margin:0 0 20px">Hi <strong>${user.name}</strong>, here's your weekly summary on CoreLogic.</p>

      <div style="display:flex;gap:12px;margin-bottom:24px">
        ${[
          ["Total plans",   plans.length,  "#eef2ff", "#6366f1"],
          ["Tasks done",    `${doneTasks}/${totalTasks}`, "#f0fdf4", "#16a34a"],
          ["Completion",    `${pct}%`,     "#fff7ed", "#ea580c"],
          ["Overdue",       overdue.length,"#fef2f2", "#dc2626"],
        ].map(([l,v,bg,c]) => `
          <div style="flex:1;background:${bg};border-radius:8px;padding:12px;text-align:center">
            <div style="font-size:20px;font-weight:700;color:${c}">${v}</div>
            <div style="font-size:11px;color:#64748b;margin-top:2px">${l}</div>
          </div>`).join("")}
      </div>

      ${plans.length > 0 ? `
      <div style="margin-bottom:24px">
        <div style="font-size:13px;font-weight:700;color:#475569;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.05em">Study plans</div>
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="background:#f8fafc">
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#94a3b8;font-weight:500">Subject</th>
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#94a3b8;font-weight:500">Tasks</th>
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#94a3b8;font-weight:500">Progress</th>
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#94a3b8;font-weight:500">Due</th>
            </tr>
          </thead>
          <tbody>${planRows}</tbody>
        </table>
      </div>` : `<p style="color:#94a3b8;font-size:13px">No active study plans this week.</p>`}

      ${upcoming.length > 0 ? `
      <div style="background:#f0fdf4;border-radius:8px;padding:14px;margin-bottom:20px">
        <div style="font-size:12px;font-weight:700;color:#16a34a;margin-bottom:6px">Upcoming deadlines</div>
        ${upcoming.map(p => `
          <div style="font-size:13px;color:#334155;margin-bottom:4px">
            • <strong>${p.subject}</strong> — due ${new Date(p.targetDate).toDateString()}
          </div>`).join("")}
      </div>` : ""}

      ${overdue.length > 0 ? `
      <div style="background:#fef2f2;border-radius:8px;padding:14px;margin-bottom:20px">
        <div style="font-size:12px;font-weight:700;color:#dc2626;margin-bottom:6px">Overdue plans</div>
        ${overdue.map(p => `
          <div style="font-size:13px;color:#334155;margin-bottom:4px">
            • <strong>${p.subject}</strong> — was due ${new Date(p.targetDate).toDateString()}
          </div>`).join("")}
      </div>` : ""}

      <a href="${process.env.APP_URL}" style="display:inline-block;padding:10px 22px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-size:13px;font-weight:700">
        Open CoreLogic →
      </a>
    </div>

    <div style="padding:16px 32px;border-top:1px solid #f1f5f9;font-size:11px;color:#94a3b8">
      You're receiving this because you have an account on CoreLogic. Weekly reports send every Monday at 8 AM.
    </div>
  </div>
</body>
</html>`;
};

const sendWeeklyReports = async () => {
  console.log("📊 Running weekly report cron...");
  const range = getWeekRange();
  const users = await User.find({});
  let sent = 0;

  for (const user of users) {
    try {
      const plans = await StudyPlan.find({ user: user._id });
      if (plans.length === 0) continue;

      const html = buildReportHTML(user, plans, range);
      const ok = await sendEmail({
        to:      user.email,
        subject: `📊 Your weekly study report — ${new Date().toDateString()}`,
        html,
      });
      if (ok) sent++;
    } catch (e) {
      console.error(`Report failed for ${user.email}:`, e.message);
    }
  }
  console.log(`✅ Weekly reports sent: ${sent}/${users.length}`);
};

module.exports = { sendWeeklyReports };