const paths = {
  chat: (
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  ),
  notes: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </>
  ),
  summary: (
    <>
      <line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="8" y1="18" x2="17" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="3.5" cy="6" r="1" fill="currentColor"/>
      <circle cx="3.5" cy="12" r="1" fill="currentColor"/>
      <circle cx="3.5" cy="18" r="1" fill="currentColor"/>
    </>
  ),
  cards: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="2" fill="none"/>
      <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="2"/>
    </>
  ),
  diagram: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" fill="none"/>
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" fill="none"/>
      <rect x="8.5" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M6.5 10v2a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <line x1="12" y1="10" x2="12" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </>
  ),
  flowchart: (
    <>
      <ellipse cx="12" cy="4" rx="5" ry="2.5" stroke="currentColor" strokeWidth="2" fill="none"/>
      <rect x="7" y="9" width="10" height="5" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
      <polygon points="12,17 17,20 12,23 7,20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round"/>
      <line x1="12" y1="6.5" x2="12" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="12" y1="14" x2="12" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </>
  ),
  code: (
    <>
      <polyline points="16 18 22 12 16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <polyline points="8 6 2 12 8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </>
  ),
  formula: (
    <>
      <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M6.5 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" fill="currentColor"/>
      <path d="M17.5 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" fill="currentColor"/>
      <path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </>
  ),
  quiz: (
    <>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </>
  ),
  history: (
    <>
      <polyline points="12 8 12 12 14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M3.05 11a9 9 0 1 0 .5-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <polyline points="3 3 3 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </>
  ),
  download: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </>
  ),
  star: (
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  ),
  trash: (
    <>
      <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </>
  ),
  send: (
    <>
      <line x1="22" y1="2" x2="11" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </>
  ),
  logo: (
    <>
      {/* antenna */}
      <line x1="12" y1="2" x2="12" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="1.5" r="1.5" fill="currentColor"/>
      {/* head */}
      <rect x="4" y="5" width="16" height="11" rx="3" stroke="currentColor" strokeWidth="2" fill="none"/>
      {/* eyes */}
      <circle cx="9" cy="10" r="1.5" fill="currentColor"/>
      <circle cx="15" cy="10" r="1.5" fill="currentColor"/>
      {/* mouth */}
      <line x1="9" y1="13" x2="15" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      {/* legs */}
      <line x1="9" y1="16" x2="9" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="15" y1="16" x2="15" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </>
  ),
  key: (
    <>
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </>
  ),
};

export default function Icon({ name, size = 16, style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ flexShrink: 0, ...style }}
    >
      {paths[name] || null}
    </svg>
  );
}