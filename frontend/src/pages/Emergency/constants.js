// Shared constants for Emergency module
export const HOSPITAL = { lat: 28.5672, lng: 77.2100, name: 'AIIMS Delhi' };
export const API = import.meta.env.VITE_API_URL || 'https://codewizrds-deploy.onrender.com';

export const SEV_DOT  = { Critical: 'bg-red-500',   Moderate: 'bg-amber-400', Stable: 'bg-green-500' };
export const SEV_TEXT = { Critical: 'text-red-700',  Moderate: 'text-amber-700', Stable: 'text-green-700' };
export const SEV_BG   = { Critical: 'bg-red-50 border-red-200', Moderate: 'bg-amber-50 border-amber-200', Stable: 'bg-green-50 border-green-200' };

export const STATUS_COLOR = {
  Dispatched:    'bg-blue-100 text-blue-700',
  Acknowledged:  'bg-purple-100 text-purple-700',
  'En Route':    'bg-amber-100 text-amber-700',
  Arrived:       'bg-green-100 text-green-700',
  Completed:     'bg-slate-100 text-slate-600',
};

export const FLEET_COLOR = {
  Available:   'bg-green-100 text-green-700 border-green-200',
  Busy:        'bg-red-100 text-red-700 border-red-200',
  Maintenance: 'bg-slate-100 text-slate-500 border-slate-200',
};

// Role → view mapping (no user-switching allowed)
// er_doctor/dept_head are blocked at router level — they never reach this page
export const ROLE_VIEW = {
  paramedic: 'Paramedic',
  acc:       'ACC',
  dispatcher:'ACC',
  admin:     'ACC',
};

export const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; }
  body { font-family: 'Manrope', sans-serif; }
  .glass { background: rgba(255,255,255,0.82); backdrop-filter: blur(20px); }
  .ghost-border { border: 1px solid rgba(235,187,181,0.25); }
  .pulsing-red { animation: pulse-red 2s infinite; }
  @keyframes pulse-red {
    0%   { box-shadow: 0 0 0 0 rgba(188,0,12,0.6); }
    70%  { box-shadow: 0 0 0 14px rgba(188,0,12,0); }
    100% { box-shadow: 0 0 0 0 rgba(188,0,12,0); }
  }
  .leaflet-pane, .leaflet-control { z-index: 10 !important; }
  .leaflet-top, .leaflet-bottom   { z-index: 11 !important; }
  .slide-in { animation: slideIn 0.3s ease; }
  @keyframes slideIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
`;
