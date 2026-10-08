export interface FacultyInfo {
  faculty: string;
  departments: string[];
}

export const LU_FACULTIES: FacultyInfo[] = [
  {
    faculty: 'Faculty of Computing & Information Technology',
    departments: [
      'Software Engineering',
      'Computer Science',
      'Cyber Security',
      'Information Technology',
    ],
  },
  {
    faculty: 'Faculty of Basic Medical & Health Sciences',
    departments: [
      'Nursing Science',
      'Medical Laboratory Science',
      'Public Health',
      'Physiology',
      'Anatomy',
    ],
  },
  {
    faculty: 'Faculty of Social & Management Sciences (FBSS)',
    departments: [
      'Mass Communication',
      'Business Administration',
      'Accounting & Finance',
      'Economics',
      'International Relations & Diplomacy',
      'Public Administration',
    ],
  },
  {
    faculty: 'Faculty of Law',
    departments: [
      'Private & Property Law',
      'Public & International Law',
      'Commercial Law',
    ],
  },
  {
    faculty: 'Faculty of Environmental Sciences & Architecture',
    departments: [
      'Architecture',
      'Estate Management',
      'Building Technology',
    ],
  },
  {
    faculty: 'Faculty of Arts & Humanities',
    departments: [
      'English & Literary Studies',
      'Performing & Film Arts',
      'History & Diplomatic Studies',
    ],
  },
];

// Helper to look up faculty for any given department
export function getFacultyForDepartment(departmentName: string): string {
  for (const f of LU_FACULTIES) {
    if (f.departments.includes(departmentName)) {
      return f.faculty;
    }
  }
  return 'Faculty of Computing & Information Technology';
}

// Flat list of all departments with their faculty
export const ALL_LU_DEPARTMENTS = LU_FACULTIES.flatMap((f) =>
  f.departments.map((d) => ({
    name: d,
    faculty: f.faculty,
  }))
);
