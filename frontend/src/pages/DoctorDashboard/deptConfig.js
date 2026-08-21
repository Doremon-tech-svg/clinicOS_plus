// Maps role to their permitted department tabs
export const ROLE_DEPTS = {
  er_doctor: ['Emergency'],
  dept_head: [], // resolved from user.department
  admin:     ['Emergency','Cardiology','Surgery','Neurology','Maternity','ICU','Lab','Radiology','OPD','Nursing'],
};

export function getDoctorDepts(user) {
  if (!user) return [];
  if (user.role === 'admin') return ROLE_DEPTS.admin;
  if (user.role === 'er_doctor') return ['Emergency'];
  // dept_head: their own department
  if (user.role === 'dept_head' && user.department) return [user.department];
  return [];
}
