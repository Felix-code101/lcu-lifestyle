export interface ShortCourse {
  id: string;
  code: string;
  title: string;
  facultyGroup: 'medicine' | 'computing' | 'social_sciences' | 'law' | 'environmental' | 'arts' | 'general' | 'mass_comm';
  examPrepGain: number;
  energyCost: number;
  xpGain?: number;
  description: string;
  isPractical?: boolean;
}

export interface ShortCourseLesson {
  id: string;
  lessonNumber: number; // 1 to 5
  title: string;
  code: string;
  durationMinutes: number; // e.g. 15 min
  energyCost: number; // e.g. 10 energy
  examPrepGain: number; // e.g. 5
  xpGain: number; // e.g. 25
  description: string;
}

export interface DepartmentCurriculumTrack {
  departmentKey: string;
  careerTitle: string;
  avatarIcon: string;
  subtitle: string;
  perks: string[];
  completionRewardText: string;
  lessons: ShortCourseLesson[];
}

export const DEPARTMENT_CURRICULUM_TRACKS: Record<string, DepartmentCurriculumTrack> = {
  // 1. Mass Communication: Media & Broadcasting
  mass_communication: {
    departmentKey: 'mass_communication',
    careerTitle: 'Mass Communication: Media & Broadcasting',
    avatarIcon: '🎙️',
    subtitle: 'LCU Faculty of Social & Management Sciences · Professional Broadcaster & Journalist Track',
    perks: ['+15% Exam Prep', 'Media Certificate', 'Broadcasting Studio Access'],
    completionRewardText:
      '🎓 Finish all 5 lessons: An official LCU Departmental Certificate on your student profile, +15% CGPA boost on exams, and unlocked career opportunities.',
    lessons: [
      {
        id: 'mac_lesson_1',
        lessonNumber: 1,
        code: 'MAC 101',
        title: 'Introduction to Print & Broadcast Journalism',
        durationMinutes: 15,
        energyCost: 10,
        examPrepGain: 5,
        xpGain: 25,
        description: 'Core journalistic ethics, inverted pyramid story structure, and newsroom editorial pipelines.',
      },
      {
        id: 'mac_lesson_2',
        lessonNumber: 2,
        code: 'MAC 102',
        title: 'Radio Production & Audio Editing Techniques',
        durationMinutes: 15,
        energyCost: 10,
        examPrepGain: 5,
        xpGain: 25,
        description: 'Studio soundboards, microphone techniques, podcast mixing, and digital audio workstations.',
      },
      {
        id: 'mac_lesson_3',
        lessonNumber: 3,
        code: 'MAC 103',
        title: 'News Writing, Ethics & Defamation Law',
        durationMinutes: 15,
        energyCost: 10,
        examPrepGain: 5,
        xpGain: 25,
        description: 'Libel, slander, media defamation safeguards, and constitutional press freedom in Nigeria.',
      },
      {
        id: 'mac_lesson_4',
        lessonNumber: 4,
        code: 'MAC 104',
        title: 'Television Presentation & Camera Operations',
        durationMinutes: 15,
        energyCost: 10,
        examPrepGain: 5,
        xpGain: 25,
        description: 'Teleprompter reading, live multi-camera broadcast direction, lighting keys, and anchor body language.',
      },
      {
        id: 'mac_lesson_5',
        lessonNumber: 5,
        code: 'MAC 105',
        title: 'Public Relations & Corporate Advertising',
        durationMinutes: 15,
        energyCost: 10,
        examPrepGain: 5,
        xpGain: 35,
        description: 'Strategic crisis communication, press conferences, viral ad campaigns, and brand reputation management.',
      },
    ],
  },

  // 2. Doctor: Medicine & Surgery (MBBS)
  mbbs: {
    departmentKey: 'mbbs',
    careerTitle: 'Doctor: Medicine & Surgery (MBBS)',
    avatarIcon: '🩺',
    subtitle: 'LCU College of Medicine & Health Sciences · Clinical Physician & Surgeon Foundation',
    perks: ['+15% Exam Prep', 'Medical Badge', 'Clinical Rotations'],
    completionRewardText:
      '🎓 Finish all 5 lessons: An official LCU Departmental Certificate on your student profile, +15% CGPA boost on exams, and unlocked career opportunities.',
    lessons: [
      {
        id: 'med_lesson_1',
        lessonNumber: 1,
        code: 'MBB 101',
        title: 'What Doctors Do: Medical Ethics & Orientation',
        durationMinutes: 15,
        energyCost: 10,
        examPrepGain: 5,
        xpGain: 25,
        description: 'The Hippocratic Oath, patient-doctor confidentiality, clinical empathy, and bedside demeanor.',
      },
      {
        id: 'med_lesson_2',
        lessonNumber: 2,
        code: 'ANA 101',
        title: 'Gross Anatomy: Bones, Muscles & Organ Systems',
        durationMinutes: 15,
        energyCost: 10,
        examPrepGain: 5,
        xpGain: 25,
        description: 'Axial skeleton landmarks, musculoskeletal kinetics, visceral organ orientation, and thoracic cavities.',
      },
      {
        id: 'med_lesson_3',
        lessonNumber: 3,
        code: 'PHS 101',
        title: 'Cellular Physiology & Blood Dynamics',
        durationMinutes: 15,
        energyCost: 10,
        examPrepGain: 5,
        xpGain: 25,
        description: 'Electrochemical membrane potentials, cardiac action cycles, arterial hemodynamics, and hematopoiesis.',
      },
      {
        id: 'med_lesson_4',
        lessonNumber: 4,
        code: 'BCH 101',
        title: 'Medical Biochemistry & Metabolic Pathways',
        durationMinutes: 15,
        energyCost: 10,
        examPrepGain: 5,
        xpGain: 25,
        description: 'Cellular Krebs cycle respiration, enzyme catalysis, lipid transport, and diagnostic clinical markers.',
      },
      {
        id: 'med_lesson_5',
        lessonNumber: 5,
        code: 'CLI 101',
        title: 'Ward Rounds Prep: Patient Vitals & Clinical Examination',
        durationMinutes: 15,
        energyCost: 10,
        examPrepGain: 5,
        xpGain: 35,
        description: 'Stethoscope auscultation, sphygmomanometer blood pressure diagnostics, and systematic bedside examination.',
      },
    ],
  },

  // 3. Software Engineer: Computer Science & Computing
  computing: {
    departmentKey: 'computing',
    careerTitle: 'Software Engineer: Computer Science & Computing',
    avatarIcon: '💻',
    subtitle: 'LCU Faculty of Natural & Applied Sciences · High-Performance Software Development Track',
    perks: ['+15% Exam Prep', 'Coding Certificate', 'Tech Lab Clearance'],
    completionRewardText:
      '🎓 Finish all 5 lessons: An official LCU Departmental Certificate on your student profile, +15% CGPA boost on exams, and unlocked career opportunities.',
    lessons: [
      {
        id: 'csc_lesson_1',
        lessonNumber: 1,
        code: 'CSC 101',
        title: 'Computational Logic & Algorithm Design',
        durationMinutes: 15,
        energyCost: 10,
        examPrepGain: 5,
        xpGain: 25,
        description: 'Asymptotic complexity, Big-O analysis, flowchart recursion, and deterministic problem decomposition.',
      },
      {
        id: 'csc_lesson_2',
        lessonNumber: 2,
        code: 'CSC 102',
        title: 'Data Structures & Memory Management',
        durationMinutes: 15,
        energyCost: 10,
        examPrepGain: 5,
        xpGain: 25,
        description: 'Dynamic memory pointers, stack vs heap allocation, balanced binary search trees, and hash indexing.',
      },
      {
        id: 'csc_lesson_3',
        lessonNumber: 3,
        code: 'CSC 103',
        title: 'Object-Oriented Programming Patterns',
        durationMinutes: 15,
        energyCost: 10,
        examPrepGain: 5,
        xpGain: 25,
        description: 'Encapsulation boundaries, inheritance polymorphism, SOLID patterns, and loosely coupled modular design.',
      },
      {
        id: 'csc_lesson_4',
        lessonNumber: 4,
        code: 'CSC 104',
        title: 'Database Schemas & SQL Fundamentals',
        durationMinutes: 15,
        energyCost: 10,
        examPrepGain: 5,
        xpGain: 25,
        description: 'Relational table normalization (3NF), ACID guarantees, execution query plans, and foreign key indexes.',
      },
      {
        id: 'csc_lesson_5',
        lessonNumber: 5,
        code: 'CSC 105',
        title: 'Full-Stack Web Architecture & APIs',
        durationMinutes: 15,
        energyCost: 10,
        examPrepGain: 5,
        xpGain: 35,
        description: 'RESTful API contracts, asynchronous event handling, distributed state caching, and cloud deployment.',
      },
    ],
  },

  // 4. Faculty of Law: Barrister & Solicitor
  law: {
    departmentKey: 'law',
    careerTitle: 'Barrister & Solicitor: Faculty of Law',
    avatarIcon: '⚖️',
    subtitle: 'LCU Faculty of Law · Jurisprudence & Appellate Moot Court Track',
    perks: ['+15% Exam Prep', 'Bar Advocate Badge', 'Moot Court Access'],
    completionRewardText:
      '🎓 Finish all 5 lessons: An official LCU Departmental Certificate on your student profile, +15% CGPA boost on exams, and unlocked career opportunities.',
    lessons: [
      {
        id: 'law_lesson_1',
        lessonNumber: 1,
        code: 'LAW 101',
        title: 'Nigerian Legal System & Sources of Law',
        durationMinutes: 15,
        energyCost: 10,
        examPrepGain: 5,
        xpGain: 25,
        description: 'Judicial precedent, English common law doctrines, customary laws, and court hierarchy.',
      },
      {
        id: 'law_lesson_2',
        lessonNumber: 2,
        code: 'LAW 102',
        title: 'Constitutional Powers & Fundamental Rights',
        durationMinutes: 15,
        energyCost: 10,
        examPrepGain: 5,
        xpGain: 25,
        description: 'Constitutional supremacy, federal executive separation of powers, and judicial review remedies.',
      },
      {
        id: 'law_lesson_3',
        lessonNumber: 3,
        code: 'LAW 103',
        title: 'Criminal Law Principles & Penal Codes',
        durationMinutes: 15,
        energyCost: 10,
        examPrepGain: 5,
        xpGain: 25,
        description: 'Actus reus, mens rea criminal intent, strict liability offences, and standard of proof beyond reasonable doubt.',
      },
      {
        id: 'law_lesson_4',
        lessonNumber: 4,
        code: 'LAW 104',
        title: 'Law of Contract & Commercial Transactions',
        durationMinutes: 15,
        energyCost: 10,
        examPrepGain: 5,
        xpGain: 25,
        description: 'Offer, acceptance, consideration, breach of covenants, and commercial damage remedies.',
      },
      {
        id: 'law_lesson_5',
        lessonNumber: 5,
        code: 'LAW 105',
        title: 'Appellate Advocacy & Moot Court Trial Prep',
        durationMinutes: 15,
        energyCost: 10,
        examPrepGain: 5,
        xpGain: 35,
        description: 'Brief writing, legal argument oral presentations, trial cross-examinations, and moot court courtroom sessions.',
      },
    ],
  },

  // 5. Business Administration, Accounting & Economics
  business: {
    departmentKey: 'business',
    careerTitle: 'Business Executive: Accounting & Finance',
    avatarIcon: '📊',
    subtitle: 'LCU Faculty of Social & Management Sciences · Corporate Finance & Strategy Track',
    perks: ['+15% Exam Prep', 'Financial Analyst Badge', 'Corporate Audit Clearance'],
    completionRewardText:
      '🎓 Finish all 5 lessons: An official LCU Departmental Certificate on your student profile, +15% CGPA boost on exams, and unlocked career opportunities.',
    lessons: [
      {
        id: 'bus_lesson_1',
        lessonNumber: 1,
        code: 'ACC 101',
        title: 'Principles of Accounting & Financial Records',
        durationMinutes: 15,
        energyCost: 10,
        examPrepGain: 5,
        xpGain: 25,
        description: 'Double-entry bookkeeping, trial balance reconciliations, cash book auditing, and balance sheet preparation.',
      },
      {
        id: 'bus_lesson_2',
        lessonNumber: 2,
        code: 'ECO 101',
        title: 'Managerial Economics & Market Structures',
        durationMinutes: 15,
        energyCost: 10,
        examPrepGain: 5,
        xpGain: 25,
        description: 'Price elasticity of demand, cost minimization, monopoly vs perfect competition, and macroeconomic equilibrium.',
      },
      {
        id: 'bus_lesson_3',
        lessonNumber: 3,
        code: 'BUS 101',
        title: 'Corporate Governance & Organizational Leadership',
        durationMinutes: 15,
        energyCost: 10,
        examPrepGain: 5,
        xpGain: 25,
        description: 'Strategic management, executive decision-making, organizational structure, and corporate leadership.',
      },
      {
        id: 'bus_lesson_4',
        lessonNumber: 4,
        code: 'ACC 102',
        title: 'Taxation Laws & Financial Auditing',
        durationMinutes: 15,
        energyCost: 10,
        examPrepGain: 5,
        xpGain: 25,
        description: 'Corporate income tax, statutory audit verification, compliance checks, and internal accounting controls.',
      },
      {
        id: 'bus_lesson_5',
        lessonNumber: 5,
        code: 'FIN 101',
        title: 'Investment Banking & Business Valuation',
        durationMinutes: 15,
        energyCost: 10,
        examPrepGain: 5,
        xpGain: 35,
        description: 'Discounted cash flow (DCF), mergers & acquisitions, equity valuation models, and capital portfolio risk.',
      },
    ],
  },

  // 6. Architecture & Environmental Sciences
  environmental: {
    departmentKey: 'environmental',
    careerTitle: 'Architect & Urban Designer: Environmental Sciences',
    avatarIcon: '📐',
    subtitle: 'LCU Faculty of Environmental Sciences · Design Drafting & Construction Track',
    perks: ['+15% Exam Prep', 'Studio Drafting Badge', 'CAD Studio Access'],
    completionRewardText:
      '🎓 Finish all 5 lessons: An official LCU Departmental Certificate on your student profile, +15% CGPA boost on exams, and unlocked career opportunities.',
    lessons: [
      {
        id: 'env_lesson_1',
        lessonNumber: 1,
        code: 'ARC 101',
        title: 'Architectural Graphics & Orthographic Drafting',
        durationMinutes: 15,
        energyCost: 10,
        examPrepGain: 5,
        xpGain: 25,
        description: 'Projections, scale drafting, isometric perspectives, and architectural drawing techniques.',
      },
      {
        id: 'env_lesson_2',
        lessonNumber: 2,
        code: 'BLD 101',
        title: 'Building Materials & Structural Foundations',
        durationMinutes: 15,
        energyCost: 10,
        examPrepGain: 5,
        xpGain: 25,
        description: 'Reinforced concrete, load-bearing masonry, soil mechanics, and building foundation footings.',
      },
      {
        id: 'env_lesson_3',
        lessonNumber: 3,
        code: 'ARC 102',
        title: 'Environmental Sustainability & Passive Design',
        durationMinutes: 15,
        energyCost: 10,
        examPrepGain: 5,
        xpGain: 25,
        description: 'Solar building orientation, natural cross-ventilation, rainwater harvesting, and bioclimatic architecture.',
      },
      {
        id: 'env_lesson_4',
        lessonNumber: 4,
        code: 'BLD 102',
        title: 'Building Services & Electrical/Plumbing Schemas',
        durationMinutes: 15,
        energyCost: 10,
        examPrepGain: 5,
        xpGain: 25,
        description: 'HVAC ducting, water reticulation, drainage layout, and building fire safety systems.',
      },
      {
        id: 'env_lesson_5',
        lessonNumber: 5,
        code: 'ARC 105',
        title: 'Studio Thesis & Master Site Plan Presentation',
        durationMinutes: 15,
        energyCost: 10,
        examPrepGain: 5,
        xpGain: 35,
        description: 'Spatial urban planning, 3D architectural rendering, and master plan design jury presentation.',
      },
    ],
  },
};

export function getCurriculumTrackForDepartment(departmentName: string): DepartmentCurriculumTrack {
  const deptLower = (departmentName || '').toLowerCase();

  if (
    deptLower.includes('mass') ||
    deptLower.includes('communication') ||
    deptLower.includes('journal') ||
    deptLower.includes('media')
  ) {
    return DEPARTMENT_CURRICULUM_TRACKS.mass_communication;
  }

  if (
    deptLower.includes('medicine') ||
    deptLower.includes('mbbs') ||
    deptLower.includes('nurs') ||
    deptLower.includes('anat') ||
    deptLower.includes('physio') ||
    deptLower.includes('health') ||
    deptLower.includes('med')
  ) {
    return DEPARTMENT_CURRICULUM_TRACKS.mbbs;
  }

  if (
    deptLower.includes('law') ||
    deptLower.includes('juris')
  ) {
    return DEPARTMENT_CURRICULUM_TRACKS.law;
  }

  if (
    deptLower.includes('architect') ||
    deptLower.includes('estate') ||
    deptLower.includes('build') ||
    deptLower.includes('environ')
  ) {
    return DEPARTMENT_CURRICULUM_TRACKS.environmental;
  }

  if (
    deptLower.includes('account') ||
    deptLower.includes('bus') ||
    deptLower.includes('econ') ||
    deptLower.includes('finance') ||
    deptLower.includes('admin') ||
    deptLower.includes('diplomacy') ||
    deptLower.includes('management')
  ) {
    return DEPARTMENT_CURRICULUM_TRACKS.business;
  }

  // Default to Computing / Computer Science
  return DEPARTMENT_CURRICULUM_TRACKS.computing;
}

// Convert track lessons to legacy ShortCourse items for backwards compatibility
export const DEPARTMENTAL_SHORT_COURSES: ShortCourse[] = Object.values(DEPARTMENT_CURRICULUM_TRACKS).flatMap((track) =>
  track.lessons.map((lesson) => ({
    id: lesson.id,
    code: lesson.code,
    title: lesson.title,
    facultyGroup: track.departmentKey as any,
    examPrepGain: lesson.examPrepGain,
    energyCost: lesson.energyCost,
    xpGain: lesson.xpGain,
    description: lesson.description,
  }))
);

export function getCoursesForDepartment(departmentName: string): {
  departmentalCourses: ShortCourse[];
  generalElectives: ShortCourse[];
  categoryTitle: string;
} {
  const track = getCurriculumTrackForDepartment(departmentName);
  const departmentalCourses: ShortCourse[] = track.lessons.map((lesson) => ({
    id: lesson.id,
    code: lesson.code,
    title: lesson.title,
    facultyGroup: track.departmentKey as any,
    examPrepGain: lesson.examPrepGain,
    energyCost: lesson.energyCost,
    xpGain: lesson.xpGain,
    description: lesson.description,
  }));

  return {
    departmentalCourses,
    generalElectives: [],
    categoryTitle: track.careerTitle,
  };
}
