export const API_BASE = import.meta.env.VITE_API_URL || 'https://codewizrds-deploy.onrender.com';

export const PRIORITY_STYLE = {
  Stat:    'bg-red-100 text-red-700 border-red-200',
  Urgent:  'bg-amber-100 text-amber-700 border-amber-200',
  Routine: 'bg-slate-100 text-slate-600 border-slate-200',
};

export const STATUS_STYLE = {
  Pending:   'bg-orange-100 text-orange-700 border-orange-200',
  Dispensed: 'bg-green-100 text-green-700 border-green-200',
  Rejected:  'bg-red-100 text-red-500 border-red-200',
};

export const CATEGORIES = ['All','Analgesic','Antibiotic','Cardiac','IV Fluid','Emergency','Antihypertensive','Antidiabetic','Anticoagulant','Neuro','Steroid','Respiratory','Antacid','General'];
