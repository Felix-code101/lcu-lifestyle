export interface ShortCourse {
  id: string;
  code: string;
  title: string;
  facultyGroup: 'medicine' | 'computing' | 'social_sciences' | 'law' | 'environmental' | 'arts' | 'general';
  examPrepGain: number;
  energyCost: number;
  xpGain?: number;
  description: string;
  isPractical?: boolean;
}

export const DEPARTMENTAL_SHORT_COURSES: ShortCourse[] = [
  // --- Medicine and Surgery (MBBS) & Medical Sciences ---
  {
    id: 'ana_101',
    code: 'ANA 101',
    title: 'Introduction to Human Anatomy & Osteology',
    facultyGroup: 'medicine',
    examPrepGain: 5,
    energyCost: 8,
    xpGain: 12,
    description: 'Systematic study of the skeletal framework, axial bone landmarks, and gross cranial anatomy.',
  },
  {
    id: 'phs_101',
    code: 'PHS 101',
    title: 'Cellular Physiology & Body Fluids',
    facultyGroup: 'medicine',
    examPrepGain: 5,
    energyCost: 8,
    xpGain: 12,
    description: 'Homeostatic mechanisms, membrane transport potentials, osmotic gradients, and extracellular fluid balance.',
  },
  {
    id: 'bch_101',
    code: 'BCH 101',
    title: 'Medical Biochemistry Essentials',
    facultyGroup: 'medicine',
    examPrepGain: 5,
    energyCost: 8,
    xpGain: 12,
    description: 'Molecular foundations of biomolecules, enzymatic kinetics, and clinical metabolic pathways.',
  },
  {
    id: 'histology_practical',
    code: 'Practical',
    title: 'Histology Microscope Session',
    facultyGroup: 'medicine',
    examPrepGain: 8,
    energyCost: 12,
    xpGain: 10,
    isPractical: true,
    description: 'Stained tissue section inspection, epithelial tissue slide examination, and cellular cytology.',
  },

  // --- Computer Science & Information Technology ---
  {
    id: 'csc_101',
    code: 'CSC 101',
    title: 'Intro to Problem Solving & Algorithms',
    facultyGroup: 'computing',
    examPrepGain: 5,
    energyCost: 8,
    xpGain: 12,
    description: 'Computational problem formulation, flowchart tracing, algorithm complexity, and pseudocode logic.',
  },
  {
    id: 'mat_101',
    code: 'MAT 101',
    title: 'Discrete Mathematics & Logic',
    facultyGroup: 'computing',
    examPrepGain: 5,
    energyCost: 8,
    xpGain: 12,
    description: 'Set theory, propositional logic, mathematical induction, graph theory, and Boolean algebra.',
  },
  {
    id: 'csc_105',
    code: 'CSC 105',
    title: 'Web Fundamentals & Architecture',
    facultyGroup: 'computing',
    examPrepGain: 5,
    energyCost: 8,
    xpGain: 12,
    description: 'Client-server communications, semantic DOM structure, modern stylesheet frameworks, and REST endpoints.',
  },

  // --- Social & Management Sciences (FBSS) ---
  {
    id: 'acc_101',
    code: 'ACC 101',
    title: 'Principles of Accounting',
    facultyGroup: 'social_sciences',
    examPrepGain: 5,
    energyCost: 8,
    xpGain: 12,
    description: 'Double-entry bookkeeping, trial balance reconciliations, cash book auditing, and balance sheet preparation.',
  },
  {
    id: 'bus_101',
    code: 'BUS 101',
    title: 'Business Organisation & Management',
    facultyGroup: 'social_sciences',
    examPrepGain: 5,
    energyCost: 8,
    xpGain: 12,
    description: 'Corporate structures, leadership dynamics, strategic corporate governance, and managerial planning.',
  },
  {
    id: 'eco_101',
    code: 'ECO 101',
    title: 'Introductory Microeconomics',
    facultyGroup: 'social_sciences',
    examPrepGain: 5,
    energyCost: 8,
    xpGain: 12,
    description: 'Consumer choice theory, price elasticity of demand, market equilibrium, and marginal utility.',
  },

  // --- Faculty of Law ---
  {
    id: 'ppl_101',
    code: 'PPL 101',
    title: 'Nigerian Legal System & Methods',
    facultyGroup: 'law',
    examPrepGain: 5,
    energyCost: 8,
    xpGain: 12,
    description: 'Sources of Nigerian Law, judicial precedent, statutory interpretation, and court hierarchy.',
  },
  {
    id: 'pil_101',
    code: 'PIL 101',
    title: 'Constitutional Law Principles',
    facultyGroup: 'law',
    examPrepGain: 5,
    energyCost: 8,
    xpGain: 12,
    description: 'Separation of powers, rule of law, fundamental human rights, and federalism.',
  },

  // --- Faculty of Environmental Sciences & Architecture ---
  {
    id: 'arc_101',
    code: 'ARC 101',
    title: 'Architectural Graphics & Design Drafting',
    facultyGroup: 'environmental',
    examPrepGain: 5,
    energyCost: 8,
    xpGain: 12,
    description: 'Orthographic projections, scale drafting, isometric perspectives, and site plan rendering.',
  },
  {
    id: 'bld_101',
    code: 'BLD 101',
    title: 'Building Construction Technology & Materials',
    facultyGroup: 'environmental',
    examPrepGain: 5,
    energyCost: 8,
    xpGain: 12,
    description: 'Structural foundations, masonry, reinforced concrete properties, and environmental sustainability.',
  },

  // --- Arts & Humanities ---
  {
    id: 'eng_101',
    code: 'ENG 101',
    title: 'Introduction to Literature in English',
    facultyGroup: 'arts',
    examPrepGain: 5,
    energyCost: 8,
    xpGain: 12,
    description: 'Dramatic analysis, prose fiction narrative styles, African poetics, and literary criticism.',
  },

  // --- University General Electives (GST) - Cross-departmental ---
  {
    id: 'gst_101',
    code: 'GST 101',
    title: 'Use of English & Library Skills',
    facultyGroup: 'general',
    examPrepGain: 4,
    energyCost: 6,
    xpGain: 10,
    description: 'Grammatical syntax, comprehensive academic writing, citation indexes, and research library retrieval.',
  },
  {
    id: 'gst_103',
    code: 'GST 103',
    title: 'Nigerian Peoples & Culture',
    facultyGroup: 'general',
    examPrepGain: 4,
    energyCost: 6,
    xpGain: 10,
    description: 'Historiography of Nigerian ethnic civilizations, cultural institutions, socio-economic heritage, and unity.',
  },
];

export function getCoursesForDepartment(departmentName: string): {
  departmentalCourses: ShortCourse[];
  generalElectives: ShortCourse[];
  categoryTitle: string;
} {
  const deptLower = (departmentName || '').toLowerCase();

  let category: 'medicine' | 'computing' | 'social_sciences' | 'law' | 'environmental' | 'arts' | 'general' = 'computing';
  let categoryTitle = 'Computer Science';

  if (
    deptLower.includes('medicine') ||
    deptLower.includes('mbbs') ||
    deptLower.includes('nurs') ||
    deptLower.includes('anat') ||
    deptLower.includes('physio') ||
    deptLower.includes('med') ||
    deptLower.includes('health') ||
    deptLower.includes('lab')
  ) {
    category = 'medicine';
    categoryTitle = 'Medicine and Surgery (MBBS)';
  } else if (
    deptLower.includes('law') ||
    deptLower.includes('juris')
  ) {
    category = 'law';
    categoryTitle = 'Faculty of Law';
  } else if (
    deptLower.includes('architect') ||
    deptLower.includes('estate') ||
    deptLower.includes('build') ||
    deptLower.includes('environ')
  ) {
    category = 'environmental';
    categoryTitle = 'Environmental Sciences & Architecture';
  } else if (
    deptLower.includes('account') ||
    deptLower.includes('bus') ||
    deptLower.includes('econ') ||
    deptLower.includes('mass') ||
    deptLower.includes('public admin') ||
    deptLower.includes('diplomacy') ||
    deptLower.includes('finance') ||
    deptLower.includes('management')
  ) {
    category = 'social_sciences';
    categoryTitle = 'Social & Management Sciences (FBSS)';
  } else if (
    deptLower.includes('english') ||
    deptLower.includes('theatre') ||
    deptLower.includes('film') ||
    deptLower.includes('history') ||
    deptLower.includes('arts')
  ) {
    category = 'arts';
    categoryTitle = 'Faculty of Arts & Humanities';
  } else if (
    deptLower.includes('computer') ||
    deptLower.includes('soft') ||
    deptLower.includes('cyber') ||
    deptLower.includes('info')
  ) {
    category = 'computing';
    categoryTitle = 'Computer Science';
  }

  const departmentalCourses = DEPARTMENTAL_SHORT_COURSES.filter(
    (c) => c.facultyGroup === category
  );

  const generalElectives = DEPARTMENTAL_SHORT_COURSES.filter(
    (c) => c.facultyGroup === 'general'
  );

  return {
    departmentalCourses: departmentalCourses.length > 0 ? departmentalCourses : DEPARTMENTAL_SHORT_COURSES.filter(c => c.facultyGroup === 'computing'),
    generalElectives,
    categoryTitle,
  };
}
