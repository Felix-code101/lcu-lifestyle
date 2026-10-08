import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  NavTab,
  RoomItem,
  ShopItem,
  Quest,
  PlayerStats,
  GameLocation,
  CampusActivity,
  CharacterCustomization,
  CampusNPC,
  TransitMode,
  SocioeconomicStatus,
  ActiveBetSlip,
  BetSelection,
  BillboardAd,
  LionsHallEvent,
  CharacterGender,
} from '../types/game';
import { CAMPUS_LOCATIONS, DEFAULT_LOCATION_ITEMS } from '../data/campusData';
import { DEFAULT_PLAYER_CUSTOMIZATION } from '../data/npcData';
import { supabase, type StudentAccount } from '../lib/supabase';

export interface RoomTheme {
  name: string;
  id: string;
  floorColor: string;
  wallColor: string;
  gridColor: string;
  ambientLight: string;
  directionalLight: string;
}

export const ROOM_THEMES: RoomTheme[] = [
  {
    name: 'Liids Emerald',
    id: 'lu_emerald',
    floorColor: '#1e293b',
    wallColor: '#166534',
    gridColor: '#22c55e',
    ambientLight: '#ecfdf5',
    directionalLight: '#fef08a',
  },
  {
    name: 'Classic White',
    id: 'classic_white',
    floorColor: '#f1f5f9',
    wallColor: '#ffffff',
    gridColor: '#cbd5e1',
    ambientLight: '#ffffff',
    directionalLight: '#ffffff',
  },
  {
    name: 'Cyberpunk Neon',
    id: 'cyberpunk',
    floorColor: '#181b2a',
    wallColor: '#242940',
    gridColor: '#4f46e5',
    ambientLight: '#818cf8',
    directionalLight: '#ec4899',
  },
  {
    name: 'Cozy Loft',
    id: 'cozy',
    floorColor: '#c89d7c',
    wallColor: '#ebe2d5',
    gridColor: '#b08b68',
    ambientLight: '#ffffff',
    directionalLight: '#fde047',
  },
  {
    name: 'Modern Minimalist',
    id: 'minimal',
    floorColor: '#334155',
    wallColor: '#64748b',
    gridColor: '#475569',
    ambientLight: '#e2e8f0',
    directionalLight: '#ffffff',
  },
];

export const AVAILABLE_SHOP_ITEMS: ShopItem[] = [
  {
    id: 'shop_desk',
    name: 'Developer Desk',
    type: 'desk',
    price: 3500,
    category: 'Furniture',
    description: 'High-tech work station with dual ultrawide monitors and RGB backlighting.',
    color: '#3b82f6',
    icon: 'Monitor',
  },
  {
    id: 'shop_chair',
    name: 'Ergonomic Gaming Chair',
    type: 'chair',
    price: 1500,
    category: 'Furniture',
    description: 'Lumbar support for long game development and exam revision sessions.',
    color: '#ef4444',
    icon: 'Armchair',
  },
  {
    id: 'shop_plant',
    name: 'Fiddle Leaf Fig',
    type: 'plant',
    price: 800,
    category: 'Nature',
    description: 'Boosts oxygen, relaxation, and mood in your living space.',
    color: '#22c55e',
    icon: 'Trees',
  },
  {
    id: 'shop_arcade',
    name: 'Retro Arcade Machine',
    type: 'arcade',
    price: 8000,
    category: 'Tech',
    description: 'Classic 8-bit cabinet loaded with nostalgic voxel adventures.',
    color: '#eab308',
    icon: 'Gamepad2',
  },
  {
    id: 'shop_lamp',
    name: 'Atmospheric Floor Lamp',
    type: 'lamp',
    price: 1200,
    category: 'Decor',
    description: 'Emits a warm golden glow to brighten darker room corners.',
    color: '#f97316',
    icon: 'Lamp',
  },
  {
    id: 'shop_shelf',
    name: 'Modular Bookcase',
    type: 'shelf',
    price: 2400,
    category: 'Furniture',
    description: 'Holds your lecture textbooks and academic journals.',
    color: '#8b5cf6',
    icon: 'Library',
  },
  {
    id: 'shop_crystal',
    name: 'Quantum Crystal Core',
    type: 'crystal',
    price: 12000,
    category: 'Tech',
    description: 'A floating crystalline power cell radiating mystical energy.',
    color: '#06b6d4',
    icon: 'Sparkles',
  },
  {
    id: 'shop_bunk_bed',
    name: 'LU Single Bunk Bed',
    type: 'bunk_bed',
    price: 4500,
    category: 'Furniture',
    description: 'White steel frame with comfortable blue mattress and ladder.',
    color: '#2563eb',
    icon: 'Bed',
  },
  {
    id: 'shop_locker',
    name: 'Blue Storage Locker',
    type: 'locker',
    price: 2800,
    category: 'Furniture',
    description: 'Tall dual-door steel wardrobe locker with ventilation louvres.',
    color: '#1d4ed8',
    icon: 'DoorClosed',
  },
  {
    id: 'shop_cooler',
    name: 'Student Food Cooler',
    type: 'cooler',
    price: 1200,
    category: 'Furniture',
    description: 'Insulated cooler box for chilling drinks and preserving food.',
    color: '#1e40af',
    icon: 'Box',
  },
  {
    id: 'shop_water',
    name: 'Water Gallons & Bucket',
    type: 'water_gallon',
    price: 600,
    category: 'Decor',
    description: 'Yellow water bucket and stacked 25L jerrycans for hostel survival.',
    color: '#eab308',
    icon: 'Droplets',
  },
  {
    id: 'shop_waste_bin',
    name: 'Plastic Waste Bin',
    type: 'waste_bin',
    price: 300,
    category: 'Decor',
    description: 'Durable ribbed waste bin to keep your hostel floor clean.',
    color: '#475569',
    icon: 'Trash2',
  },
  {
    id: 'shop_fan',
    name: 'Desk Electric Fan',
    type: 'fan',
    price: 1400,
    category: 'Tech',
    description: 'Essential oscillating desk fan to beat Ibadan tropical heat.',
    color: '#38bdf8',
    icon: 'Fan',
  },
  {
    id: 'shop_laptop',
    name: 'Study Laptop & Textbooks',
    type: 'laptop_and_books',
    price: 5200,
    category: 'Tech',
    description: 'Work laptop and stack of faculty textbooks for first class grades.',
    color: '#0284c7',
    icon: 'Laptop',
  },
];

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

interface GameContextType {
  currentLocation: GameLocation;
  navigateToLocation: (loc: GameLocation) => void;
  isTransitioning: boolean;
  stats: PlayerStats;
  addBalance: (amount: number) => void;
  spendBalance: (amount: number) => boolean;
  performActivity: (activity: CampusActivity) => void;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  roomItems: RoomItem[];
  addItemToRoom: (item: Omit<RoomItem, 'id'>) => void;
  removeItemFromRoom: (id: string) => void;
  rotateItemInRoom: (id: string) => void;
  selectedPlacingItem: ShopItem | null;
  setSelectedPlacingItem: (item: ShopItem | null) => void;
  showGrid: boolean;
  setShowGrid: (val: boolean | ((prev: boolean) => boolean)) => void;
  theme: RoomTheme;
  setTheme: (theme: RoomTheme) => void;
  quests: Quest[];
  claimQuest: (id: string) => void;
  toasts: Toast[];
  removeToast: (id: string) => void;
  addToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  resetCameraTrigger: number;
  triggerResetCamera: () => void;
  dayNightCycle: boolean;
  setDayNightCycle: (val: boolean | ((prev: boolean) => boolean)) => void;
  playerCustomization: CharacterCustomization;
  setPlayerCustomization: (custom: CharacterCustomization | ((prev: CharacterCustomization) => CharacterCustomization)) => void;
  activeDialogueNPC: CampusNPC | null;
  setActiveDialogueNPC: (npc: CampusNPC | null) => void;
  isWardrobeOpen: boolean;
  setIsWardrobeOpen: (val: boolean) => void;
  isPhoneOpen: boolean;
  setIsPhoneOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  awardFitnessXp: (amount: number) => void;
  applyTransitEffects: (mode: TransitMode, destinationName: string) => void;
  lastVisitedLandmarkId: string;
  setLastVisitedLandmarkId: (id: string) => void;
  removeShoes: () => void;
  wearShoes: () => void;
  isSermonModalOpen: boolean;
  setIsSermonModalOpen: (val: boolean) => void;
  completeSermon: (track: 'chapel' | 'mosque', qualityMultiplier: number, themeTitle: string) => void;

  // Campus Politics (SUG Elections)
  isElectionsModalOpen: boolean;
  setIsElectionsModalOpen: (val: boolean) => void;
  registerSugNomination: () => boolean;
  runCampaignActivity: (type: 'fliers' | 'chops' | 'speech', speechImpact?: number) => boolean;
  holdElectionVoteTally: () => { won: boolean; playerVotes: number; rivalVotes: number; totalVotes: number };

  // Student Hustles & Crime
  isHustleModalOpen: boolean;
  setIsHustleModalOpen: (val: boolean) => void;
  buySmallChopsWholesale: (quantity?: number) => boolean;
  sellSmallChopsRetail: (packs?: number) => boolean;
  takeProjectGig: (title: string, payout: number, energyCost: number, knowledgeGain: number) => boolean;
  attemptTheft: (locationName: string) => { success: boolean; cashStolen: number; itemStolen?: string; caught: boolean };

  // Exam Hall & Disciplinary Tribunal
  isExamModalOpen: boolean;
  setIsExamModalOpen: (val: boolean) => void;
  isTribunalModalOpen: boolean;
  setIsTribunalModalOpen: (val: boolean) => void;
  startExamSession: () => void;
  submitExamLegitimate: () => {
    score: number;
    grade: string;
    gpa: number;
    cgpa: number;
    cgpaChange: number;
    isSeasonComplete: boolean;
    nextPhaseText: string;
  };
  resumeNextSession: () => void;
  sneakExpoCheat: () => { caught: boolean; currentAlertness: number; scoreBoost: number };
  submitTribunalDefense: (defenseStrategy: 'innocent' | 'confess' | 'blame_roommate' | 'medical_exemption') => { verdict: 'guilty' | 'probation' | 'acquitted'; penaltyDesc: string };

  // Healthcare & University Medical Centre
  triggerEmergencyCollapse: () => void;
  admitToClinic: () => void;
  buyGlucoseDripTreatment: () => boolean;
  buyMedicalExemptionNote: () => boolean;
  restOnClinicBed: () => void;

  // Sports Arena, Penalty Shootout & Campus Betting
  isPenaltyModalOpen: boolean;
  setIsPenaltyModalOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  isBettingModalOpen: boolean;
  setIsBettingModalOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  completePenaltyShootout: (won: boolean, stake: number) => void;
  activeBetSlips: ActiveBetSlip[];
  placeBetSlip: (selections: BetSelection[], stake: number, totalOdds: number, potentialPayout: number) => ActiveBetSlip | null;
  settleBetSlip: (slipId: string, won: boolean, payout: number, results?: Record<string, { homeScore: number; awayScore: number; outcome: '1' | 'X' | '2' }>) => void;

  // Matriculation, Socioeconomic Status & Admin
  isAdminOpen: boolean;
  setIsAdminOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  registerStudentProfile: (profile: {
    username: string;
    matricNo: string;
    department: string;
    faculty?: string;
    status: SocioeconomicStatus;
    gender?: CharacterGender;
    email?: string;
    balance: number;
    mood: number;
  }) => void;
  loginStudentProfile: (account: StudentAccount) => void;
  signOutStudent: () => void;
  setSocioeconomicStatus: (status: SocioeconomicStatus, newBalance?: number) => void;
  takeLapoLoan: () => boolean;
  repayLapoLoan: () => boolean;
  setStats: React.Dispatch<React.SetStateAction<PlayerStats>>;

  // Campus Billboards & Ad System
  billboards: BillboardAd[];
  selectedBillboard: BillboardAd | null;
  setSelectedBillboard: (bb: BillboardAd | null) => void;
  isBillboardModalOpen: boolean;
  setIsBillboardModalOpen: (val: boolean) => void;
  bookBillboard: (id: string, businessName: string, slogan: string, bannerUrl?: string, bannerColor?: string) => boolean;

  // Lions Hall (Party & Events Venue)
  activeLionsHallEvent: LionsHallEvent | null;
  isLionsEventModalOpen: boolean;
  setIsLionsEventModalOpen: (val: boolean) => void;
  hostLionsHallEvent: (event: LionsHallEvent) => boolean;

  // Adeline Hall (DJ Booth & Music Requests)
  isMusicRequestModalOpen: boolean;
  setIsMusicRequestModalOpen: (val: boolean) => void;
  activeTrackTitle: string | null;
  requestTrack: (trackTitle: string) => boolean;
}

export const DEFAULT_CAMPUS_BILLBOARDS: BillboardAd[] = [
  {
    id: 'bb_north',
    name: 'Billboard North (Senate Way)',
    roadName: 'North Senate Boulevard',
    position: [6, 0, -18],
    rotation: 0,
    isBooked: false,
  },
  {
    id: 'bb_south',
    name: 'Billboard South (Gateway)',
    roadName: 'South Gateway Expressway',
    position: [-6, 0, 18],
    rotation: 0,
    isBooked: false,
  },
  {
    id: 'bb_east',
    name: 'Billboard East (Faculties)',
    roadName: 'East Faculties Boulevard',
    position: [18, 0, 6],
    rotation: Math.PI / 2,
    isBooked: false,
  },
  {
    id: 'bb_west',
    name: 'Billboard West (Hostels Way)',
    roadName: 'West Library & Hostels Way',
    position: [-18, 0, -6],
    rotation: Math.PI / 2,
    isBooked: false,
  },
];

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & Location
  const [currentLocation, setCurrentLocation] = useState<GameLocation>('home_hostel');
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [lastVisitedLandmarkId, setLastVisitedLandmarkId] = useState<string>('hostels_male');

  // Student Stats (Liids University Profile)
  const [stats, setStats] = useState<PlayerStats>(() => {
    const defaultStats: PlayerStats = {
      isRegistered: false,
      username: '',
      department: 'Software Engineering',
      matricNo: 'LU/24/0981',
      academicLevel: '100 Level (Fresher)',
      status: 'lapo',
      isAdmin: false,
      activeLoanAmount: 0,
      balance: 15000,
      energy: 90,
      maxEnergy: 100,
      cgpa: null, // Pending until first exam
      gpa: null,
      classesAttended: 0,
      currentLevel: 100,
      currentSemester: 1,
      calendarSeason: 'semester_1',
      isLongVacation: false,
      completedSemesters: [],
      knowledge: 480,
      mood: 85,
      level: 1,
      xp: 120,
      maxXp: 500,
      fitnessLevel: 1,
      fitnessXp: 0,
      fitnessMaxXp: 50,
      spiritualTrack: 'none',
      piety: 0,
      spiritualRank: 1,
      spiritualTitle: 'Student',
      removedShoes: false,
      isSugCandidate: false,
      hasWonSugElection: false,
      campaignPopularity: 0,
      campaignFundsSpent: 0,
      fliersPrinted: 0,
      chopsShared: 0,
      speechesDelivered: 0,
      smallChopsStock: 0,
      hustleEarnings: 0,
      disciplinaryStrikes: 0,
      isSuspended: false,
      suspensionDaysRemaining: 0,
      invigilatorAlertness: 0,
      isTakingExam: false,
      hasMedicalExemptionNote: false,
      guesthouseNightsLodged: 0,
      isCollapsed: false,
      penaltiesWon: 0,
      penaltiesLost: 0,
      bettingSlipsWon: 0,
      bettingEarnings: 0,
      inGameHours: 10,
      inGameMinutes: 30,
      day: 1,
    };

    try {
      const saved = localStorage.getItem('lu_player_profile') || localStorage.getItem('lcu_player_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isRegistered) {
          const completedSemesters = Array.isArray(parsed.completedSemesters) ? parsed.completedSemesters : [];
          // If no completed exams yet, ensure fresher starts with pending CGPA
          const effectiveCgpa = completedSemesters.length > 0 ? (parsed.cgpa ?? null) : null;
          return {
            ...defaultStats,
            ...parsed,
            completedSemesters,
            cgpa: effectiveCgpa,
            gpa: parsed.gpa ?? null,
            classesAttended: parsed.classesAttended ?? 0,
            currentLevel: parsed.currentLevel ?? 100,
            currentSemester: parsed.currentSemester ?? 1,
            calendarSeason: parsed.calendarSeason ?? 'semester_1',
            isLongVacation: parsed.isLongVacation ?? false,
            isRegistered: true,
          };
        }
      }
    } catch {
      // ignore
    }
    return defaultStats;
  });

  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.location.hash === '#admin';
    }
    return false;
  });

  const [activeTab, setActiveTab] = useState<NavTab>(null);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [dayNightCycle, setDayNightCycle] = useState<boolean>(true);
  const [theme, setTheme] = useState<RoomTheme>(ROOM_THEMES[0]);
  const [selectedPlacingItem, setSelectedPlacingItem] = useState<ShopItem | null>(null);
  const [resetCameraTrigger, setResetCameraTrigger] = useState<number>(0);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Character Customization & NPCs
  const [playerCustomization, setPlayerCustomizationState] = useState<CharacterCustomization>(() => {
    try {
      const saved = localStorage.getItem('lu_character_customization') || localStorage.getItem('lcu_character_customization');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_PLAYER_CUSTOMIZATION;
  });

  const setPlayerCustomization = useCallback(
    (update: CharacterCustomization | ((prev: CharacterCustomization) => CharacterCustomization)) => {
      setPlayerCustomizationState((prev) => {
        const next = typeof update === 'function' ? update(prev) : update;
        try {
          localStorage.setItem('lu_character_customization', JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    []
  );

  const [activeDialogueNPC, setActiveDialogueNPC] = useState<CampusNPC | null>(null);
  const [isWardrobeOpen, setIsWardrobeOpen] = useState<boolean>(false);
  const [isPhoneOpen, setIsPhoneOpen] = useState<boolean>(false);
  const [isSermonModalOpen, setIsSermonModalOpen] = useState<boolean>(false);
  const [isElectionsModalOpen, setIsElectionsModalOpen] = useState<boolean>(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState<boolean>(false);
  const [isTribunalModalOpen, setIsTribunalModalOpen] = useState<boolean>(false);
  const [isHustleModalOpen, setIsHustleModalOpen] = useState<boolean>(false);
  const [isPenaltyModalOpen, setIsPenaltyModalOpen] = useState<boolean>(false);
  const [isBettingModalOpen, setIsBettingModalOpen] = useState<boolean>(false);
  const [activeBetSlips, setActiveBetSlips] = useState<ActiveBetSlip[]>(() => {
    try {
      const saved = localStorage.getItem('lu_bet_slips') || localStorage.getItem('lcu_bet_slips');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Campus Billboards State
  const [billboards, setBillboards] = useState<BillboardAd[]>(() => {
    try {
      const saved = localStorage.getItem('lu_campus_billboards');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_CAMPUS_BILLBOARDS;
  });
  const [selectedBillboard, setSelectedBillboard] = useState<BillboardAd | null>(null);
  const [isBillboardModalOpen, setIsBillboardModalOpen] = useState<boolean>(false);

  // Lions Hall Party Events State
  const [activeLionsHallEvent, setActiveLionsHallEvent] = useState<LionsHallEvent | null>(null);
  const [isLionsEventModalOpen, setIsLionsEventModalOpen] = useState<boolean>(false);

  // Adeline Hall Music Request State
  const [isMusicRequestModalOpen, setIsMusicRequestModalOpen] = useState<boolean>(false);
  const [activeTrackTitle, setActiveTrackTitle] = useState<string | null>(null);

  // Auto-Dismiss Modals & Placement Tools on Navigation Tab Change
  useEffect(() => {
    setSelectedPlacingItem(null);
    setActiveDialogueNPC(null);
    setIsWardrobeOpen(false);
    setIsSermonModalOpen(false);
    setIsElectionsModalOpen(false);
    setIsExamModalOpen(false);
    setIsTribunalModalOpen(false);
    setIsHustleModalOpen(false);
    setIsPenaltyModalOpen(false);
    setIsBettingModalOpen(false);
    setIsBillboardModalOpen(false);
    setIsLionsEventModalOpen(false);
    setIsMusicRequestModalOpen(false);
  }, [activeTab]);

  // Persistent room items per location
  const [locationItemsMap, setLocationItemsMap] = useState<Record<GameLocation, RoomItem[]>>({
    ...DEFAULT_LOCATION_ITEMS,
  });

  const roomItems =
    locationItemsMap[currentLocation] && locationItemsMap[currentLocation].length > 0
      ? locationItemsMap[currentLocation]
      : (DEFAULT_LOCATION_ITEMS[currentLocation] || DEFAULT_LOCATION_ITEMS.home_hostel);

  const [quests, setQuests] = useState<Quest[]>([
    { id: 'q1', title: 'Maintain 4.50+ First Class CGPA', reward: 5000, completed: true, progress: 4.52, maxProgress: 4.50 },
    { id: 'q2', title: 'Attend 3 FBSS Lectures', reward: 3000, completed: false, progress: 1, maxProgress: 3 },
    { id: 'q3', title: 'Visit Liids University Central Bukka for Lunch', reward: 1500, completed: false, progress: 0, maxProgress: 1 },
    { id: 'q4', title: 'Complete Library Research Cram', reward: 4000, completed: false, progress: 0, maxProgress: 1 },
  ]);

  const addToast = useCallback((message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addBalance = useCallback((amount: number) => {
    setStats((prev) => ({
      ...prev,
      balance: prev.balance + amount,
    }));
    addToast(`+₦${amount.toLocaleString()} received into student account!`, 'success');
  }, [addToast]);

  const spendBalance = useCallback((amount: number): boolean => {
    let success = false;
    setStats((prev) => {
      if (prev.balance >= amount) {
        success = true;
        return {
          ...prev,
          balance: prev.balance - amount,
          xp: prev.xp + Math.floor(amount * 0.05),
        };
      }
      return prev;
    });

    if (success) {
      addToast(`-₦${amount.toLocaleString()} paid!`, 'info');
    } else {
      addToast('❌ Insufficient student funds in bank balance!', 'warning');
    }
    return success;
  }, [addToast]);

  const registerStudentProfile = useCallback(
    (profile: {
      username: string;
      matricNo: string;
      department: string;
      faculty?: string;
      status: SocioeconomicStatus;
      gender?: CharacterGender;
      email?: string;
      balance: number;
      mood: number;
    }) => {
      setStats((prev) => {
        const next: PlayerStats = {
          ...prev,
          isRegistered: true,
          username: profile.username,
          matricNo: profile.matricNo,
          department: profile.department,
          faculty: profile.faculty,
          academicLevel: '100 Level (Fresher)',
          status: profile.status,
          gender: profile.gender || 'male',
          email: profile.email,
          balance: profile.balance,
          mood: profile.mood,
          cgpa: null,
          gpa: null,
          classesAttended: 0,
          currentLevel: 100,
          currentSemester: 1,
          calendarSeason: 'semester_1',
          isLongVacation: false,
          completedSemesters: [],
          activeLoanAmount: 0,
        };
        try {
          localStorage.setItem('lu_player_profile', JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    []
  );

  const loginStudentProfile = useCallback(
    (account: StudentAccount) => {
      setStats((prev) => {
        const next: PlayerStats = {
          ...prev,
          isRegistered: true,
          username: account.username,
          matricNo: account.matricNo,
          department: account.department,
          faculty: account.faculty,
          academicLevel: account.level || '100 Level (Fresher)',
          status: account.status || 'lapo',
          gender: account.gender || 'male',
          email: account.email,
          balance: account.balance ?? 15000,
          cgpa: null,
          gpa: null,
        };
        try {
          localStorage.setItem('lu_player_profile', JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });

      if (account.customization) {
        setPlayerCustomization(account.customization);
      }
      addToast(`🎓 Welcome back to Liids University, ${account.username}!`, 'success');
    },
    [addToast, setPlayerCustomization]
  );

  const signOutStudent = useCallback(() => {
    setStats((prev) => {
      const reset: PlayerStats = {
        ...prev,
        isRegistered: false,
      };
      try {
        localStorage.removeItem('lu_player_profile');
      } catch {
        // ignore
      }
      return reset;
    });
    addToast('👋 Logged out of student portal. See you next lecture!', 'info');
  }, [addToast]);

  const setSocioeconomicStatus = useCallback(
    (newStatus: SocioeconomicStatus, newBalance?: number) => {
      setStats((prev) => {
        const next: PlayerStats = {
          ...prev,
          status: newStatus,
          balance:
            newBalance !== undefined
              ? newBalance
              : newStatus === 'nepo'
              ? Math.max(prev.balance, 250000)
              : prev.balance,
        };
        try {
          localStorage.setItem('lu_player_profile', JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
      addToast(
        newStatus === 'nepo'
          ? '👑 Status updated to NEPO BABY! ₦250k Platinum allowance & -50% energy drain active!'
          : '🎒 Status updated to LAPO HUSTLER! Micro-loan access & +50% hustle bonuses active!',
        'success'
      );
    },
    [addToast]
  );

  // Realtime Subscription: Sync Admin Balance / Cash Updates to Player HUD in Real Time
  useEffect(() => {
    if (!stats.matricNo || !supabase) return;

    const channel = supabase
      .channel('student-balance-sync')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'students',
          filter: `matric_no=eq.${stats.matricNo}`,
        },
        (payload: any) => {
          if (!payload.new) return;
          const hasCash = payload.new.cash !== undefined && payload.new.cash !== null;
          const hasStatus = Boolean(payload.new.status);

          if (hasCash || hasStatus) {
            const newCash = hasCash ? Number(payload.new.cash) : undefined;
            const newStatus: SocioeconomicStatus | undefined = hasStatus
              ? (String(payload.new.status).toLowerCase().includes('nepo') ? 'nepo' : 'lapo')
              : undefined;

            setStats((prev) => {
              const updated = {
                ...prev,
                ...(newCash !== undefined ? { balance: newCash } : {}),
                ...(newStatus !== undefined ? { status: newStatus } : {}),
              };
              try {
                localStorage.setItem('lu_player_profile', JSON.stringify(updated));
              } catch {
                // ignore
              }
              return updated;
            });

            if (newCash !== undefined) {
              addToast(`💰 Live HUD Update: Cash balance updated to ₦${newCash.toLocaleString()}`, 'success');
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [stats.matricNo, addToast]);

  // Auto-Dismiss Modals on Bottom Navigation Tab Change
  useEffect(() => {
    // Reset any active sub-modals or placement tools when changing main tabs
    setSelectedPlacingItem(null);
    setActiveDialogueNPC(null);
    setIsWardrobeOpen(false);
  }, [activeTab]);

  const takeLapoLoan = useCallback((): boolean => {
    if (stats.status !== 'lapo') {
      addToast('❌ Student micro-loans are reserved for LAPO status scholars!', 'warning');
      return false;
    }
    if (stats.activeLoanAmount > 0) {
      addToast('⚠️ You already have an active student micro-loan of ₦10,000! Repay it first.', 'warning');
      return false;
    }

    setStats((prev) => {
      const next: PlayerStats = {
        ...prev,
        balance: prev.balance + 10000,
        activeLoanAmount: 10000,
      };
      try {
        localStorage.setItem('lu_player_profile', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

    addToast('💳 ₦10,000 Lapo Emergency Student Micro-Loan disbursed to your wallet!', 'success');
    return true;
  }, [stats.status, stats.activeLoanAmount, addToast]);

  const repayLapoLoan = useCallback((): boolean => {
    if (stats.activeLoanAmount <= 0) {
      addToast('✅ You have no active student loans to settle.', 'info');
      return false;
    }
    if (stats.balance < stats.activeLoanAmount) {
      addToast(`❌ Insufficient funds to repay micro-loan (Need ₦${stats.activeLoanAmount.toLocaleString()}).`, 'warning');
      return false;
    }

    setStats((prev) => {
      const next: PlayerStats = {
        ...prev,
        balance: prev.balance - prev.activeLoanAmount,
        activeLoanAmount: 0,
        xp: prev.xp + 50,
      };
      try {
        localStorage.setItem('lu_player_profile', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

    addToast('🎉 ₦10,000 Lapo Micro-Loan settled in full! Credit rating restored (+50 XP)!', 'success');
    return true;
  }, [stats.activeLoanAmount, stats.balance, addToast]);

  const awardFitnessXp = useCallback(
    (amount: number) => {
      setStats((prev) => {
        let newXp = prev.fitnessXp + amount;
        let newLevel = prev.fitnessLevel;
        let newMaxXp = prev.fitnessMaxXp;
        let newMaxEnergy = prev.maxEnergy;
        let newEnergy = prev.energy;

        while (newXp >= newMaxXp) {
          newXp -= newMaxXp;
          newLevel += 1;
          newMaxXp = Math.round(newMaxXp * 1.5);
          newMaxEnergy += 10;
          newEnergy = newMaxEnergy;
          addToast(
            `🎉 Fitness Level Up! Now Level ${newLevel}! Max Energy increased to ${newMaxEnergy}⚡!`,
            'success'
          );
        }

        return {
          ...prev,
          fitnessLevel: newLevel,
          fitnessXp: newXp,
          fitnessMaxXp: newMaxXp,
          maxEnergy: newMaxEnergy,
          energy: newEnergy,
        };
      });
    },
    [addToast]
  );

  const applyTransitEffects = useCallback(
    (mode: TransitMode, destinationName: string) => {
      if (mode === 'trek') {
        setStats((prev) => {
          // Trekking drains -20% Energy, reduced with fitness training
          const staminaDrainReduction = Math.min(8, (prev.fitnessLevel - 1) * 2);
          const energyDrain = Math.max(10, 20 - staminaDrainReduction);
          const newEnergy = Math.max(0, prev.energy - energyDrain);
          let newXp = prev.fitnessXp + 15;
          let newLevel = prev.fitnessLevel;
          let newMaxXp = prev.fitnessMaxXp;
          let newMaxEnergy = prev.maxEnergy;
          let finalEnergy = newEnergy;

          if (newXp >= newMaxXp) {
            newXp -= newMaxXp;
            newLevel += 1;
            newMaxXp = Math.round(newMaxXp * 1.5);
            newMaxEnergy += 10;
            finalEnergy = newMaxEnergy;
            setTimeout(() => {
              addToast(
                `🎉 Fitness Level Up! Now Level ${newLevel}! Max Energy increased to ${newMaxEnergy}⚡!`,
                'success'
              );
            }, 600);
          }

          return {
            ...prev,
            energy: finalEnergy,
            maxEnergy: newMaxEnergy,
            fitnessLevel: newLevel,
            fitnessXp: newXp,
            fitnessMaxXp: newMaxXp,
            mood: Math.min(100, prev.mood + 4),
          };
        });
        addToast(`🚶 Trekked to ${destinationName}! (-20%⚡ Energy, +15 Fitness XP)`, 'success');
      } else {
        // Keke Napep costs ₦250, -2% Energy, 0 Fitness XP
        setStats((prev) => ({
          ...prev,
          balance: Math.max(0, prev.balance - 250),
          energy: Math.max(0, prev.energy - 2),
        }));
        addToast(`🛺 Keke ride to ${destinationName}! (-₦250, -2%⚡ Energy)`, 'info');
      }
    },
    [addToast]
  );

  // Navigate between campus locations with energy and travel time cost
  const navigateToLocation = useCallback(
    (target: GameLocation) => {
      if (target === currentLocation) {
        setActiveTab(null);
        return;
      }

      if (stats.isSuspended && target !== 'home_hostel') {
        addToast(
          `⛔ Access Denied! You are currently on University Suspension (${stats.suspensionDaysRemaining} day(s) remaining). Campus premises restricted to hostel!`,
          'warning'
        );
        return;
      }

      if (target === 'campus_map') {
        setCurrentLocation('campus_map');
        setActiveTab(null);
        return;
      }

      const targetInfo = CAMPUS_LOCATIONS.find((l) => l.id === target);
      const isFromCampusMap = currentLocation === 'campus_map';
      const energyCost = isFromCampusMap ? 0 : (targetInfo?.energyCost || 5);
      const travelMins = isFromCampusMap ? 0 : (targetInfo?.travelMinutes || 10);

      // Check if student has sufficient stamina to trek/commute (skip check if already navigated on campus map)
      if (!isFromCampusMap && stats.energy < energyCost) {
        addToast(`⚠️ Too exhausted to travel! Rest or eat food first (Energy: ${stats.energy}/${energyCost}).`, 'warning');
        return;
      }

      // Smooth transition
      setIsTransitioning(true);
      setActiveTab(null);

      setTimeout(() => {
        if (!isFromCampusMap && (energyCost > 0 || travelMins > 0)) {
          setStats((prev) => {
            let newMin = prev.inGameMinutes + travelMins;
            let newHour = prev.inGameHours;
            let newDay = prev.day;
            if (newMin >= 60) {
              newHour += Math.floor(newMin / 60);
              newMin = newMin % 60;
            }
            if (newHour >= 24) {
              newDay += Math.floor(newHour / 24);
              newHour = newHour % 24;
            }

            return {
              ...prev,
              energy: Math.max(0, prev.energy - energyCost),
              inGameMinutes: newMin,
              inGameHours: newHour,
              day: newDay,
              mood: Math.max(0, Math.min(100, prev.mood - 2)),
            };
          });
        }

        if (target === 'mosque') {
          setStats((prev) => ({ ...prev, removedShoes: false }));
        }

        setCurrentLocation(target);
        setIsTransitioning(false);
        const destinationLabel = targetInfo?.name || (target === 'sub' ? 'Student Union Building' : target);
        if (isFromCampusMap) {
          addToast(`📍 Entered ${destinationLabel}!`, 'info');
        } else {
          addToast(`Arrived at ${destinationLabel}! (-${energyCost}⚡, +${travelMins}m travel)`, 'info');
        }
      }, 450);
    },
    [currentLocation, stats.energy, addToast]
  );

  // Perform location-specific student actions (attend class, study, eat, workout, worship)
  const performActivity = useCallback(
    (activity: CampusActivity) => {
      // Exam Activity Trigger & Clearance Check
      if (activity.id === 'write_exam' || activity.isExam) {
        if (stats.isLongVacation) {
          addToast('🏖️ Lecture rooms are closed during Annual Long Vacation! Relax in hostel or take on holiday hustles.', 'warning');
          return;
        }
        if ((stats.classesAttended || 0) < 3) {
          addToast(
            `❌ Examination Clearance Denied! You must attend at least 3 lectures/tutorials before sitting for the semester exam (Currently: ${stats.classesAttended || 0}/3).`,
            'warning'
          );
          return;
        }
        startExamSession();
        return;
      }

      if (activity.requiredRank && stats.spiritualRank < activity.requiredRank) {
        addToast(
          `🔒 Locked: Requires Spiritual Rank ${activity.requiredRank} (${
            activity.requiredRank === 2 ? "Choir / Usher or Mu'adhin" : 'Campus Pastor or Campus Alfa'
          })!`,
          'warning'
        );
        return;
      }

      // Nepo perk: 50% energy drain reduction
      const actualEnergyCost = stats.status === 'nepo' ? Math.round(activity.energyCost * 0.5) : activity.energyCost;

      if (actualEnergyCost > 0 && stats.energy < actualEnergyCost) {
        addToast(`❌ Too tired! Need at least ${actualEnergyCost}⚡ energy. Rest in hostel or grab food!`, 'warning');
        return;
      }

      if (activity.cashCost > 0 && stats.balance < activity.cashCost) {
        addToast(`❌ Not enough cash! Requires ₦${activity.cashCost.toLocaleString()}.`, 'warning');
        return;
      }

      const isCoursework =
        activity.id === 'attend_lecture' ||
        activity.id === 'evening_tutorial' ||
        activity.id === 'read_library' ||
        activity.isCoursework === true ||
        activity.title === 'Attend a Lecture' ||
        activity.title === 'Evening Tutorial Class' ||
        activity.title === 'Read in the Main Library';

      let updatedAttendance = stats.classesAttended || 0;

      setStats((prev) => {
        let newMin = prev.inGameMinutes + activity.durationMinutes;
        let newHour = prev.inGameHours;
        let newDay = prev.day;
        if (newMin >= 60) {
          newHour += Math.floor(newMin / 60);
          newMin = newMin % 60;
        }
        if (newHour >= 24) {
          newDay += Math.floor(newHour / 24);
          newHour = newHour % 24;
        }

        const costToDeduct = prev.status === 'nepo' ? Math.round(activity.energyCost * 0.5) : activity.energyCost;
        const newEnergy = activity.energyGain
          ? Math.min(prev.maxEnergy, prev.energy + activity.energyGain)
          : Math.max(0, prev.energy - costToDeduct);

        // CGPA remains null for freshers until semester examination
        const newCgpa = prev.cgpa !== null ? Math.min(5.0, Number((prev.cgpa + activity.cgpaGain).toFixed(2))) : null;
        const knowledgeBonus = isCoursework ? 40 : Math.round(activity.cgpaGain * 400);
        const newKnowledge = prev.knowledge + knowledgeBonus;
        const newMood = Math.max(0, Math.min(100, prev.mood + activity.moodGain));
        const cashIncome = activity.cashGain || 0;
        const newBalance = prev.balance - activity.cashCost + cashIncome;
        const earnedXp = Math.round(activity.durationMinutes * 0.8 + activity.cgpaGain * 500 + (isCoursework ? 50 : 0));

        const nextAttendance = isCoursework ? Math.min(3, (prev.classesAttended || 0) + 1) : (prev.classesAttended || 0);
        updatedAttendance = nextAttendance;

        // Spiritual progression & Piety
        const pietyGain = activity.pietyGain || 0;
        const newPiety = prev.piety + pietyGain;
        let track = prev.spiritualTrack;
        if (activity.id.startsWith('chapel') || currentLocation === 'chapel') {
          track = 'chapel';
        } else if (activity.id.startsWith('mosque') || currentLocation === 'mosque') {
          track = 'mosque';
        }

        let newRank = prev.spiritualRank;
        if (newPiety >= 250) {
          newRank = 3;
        } else if (newPiety >= 100) {
          newRank = Math.max(2, newRank);
        }

        let newTitle = prev.spiritualTitle;
        if (track === 'chapel') {
          if (newRank >= 3) newTitle = 'Campus Pastor';
          else if (newRank === 2) newTitle = 'Choir / Usher';
          else newTitle = 'Fellowship Member';
        } else if (track === 'mosque') {
          if (newRank >= 3) newTitle = 'Campus Alfa';
          else if (newRank === 2) newTitle = "Mu'adhin";
          else newTitle = "Jama'ah";
        }

        if (newRank > prev.spiritualRank) {
          setTimeout(() => {
            if (newRank === 2) {
              addToast(`🎉 Promoted to Spiritual Rank 2: ${newTitle}! Keep serving!`, 'success');
            } else if (newRank === 3) {
              addToast(`🌟 Ordained to Rank 3: ${newTitle}! Clerical & Traditional vestments unlocked in Wardrobe!`, 'success');
            }
          }, 600);
        }

        const hasMedicalNote =
          activity.id === 'collect_medical_note' ? true : prev.hasMedicalExemptionNote;

        return {
          ...prev,
          balance: newBalance,
          energy: newEnergy,
          cgpa: newCgpa,
          classesAttended: nextAttendance,
          knowledge: newKnowledge,
          mood: newMood,
          xp: prev.xp + earnedXp,
          piety: newPiety,
          spiritualTrack: track,
          spiritualRank: newRank,
          spiritualTitle: newTitle,
          hasMedicalExemptionNote: hasMedicalNote,
          inGameMinutes: newMin,
          inGameHours: newHour,
          day: newDay,
        };
      });

      if (isCoursework) {
        setTimeout(() => {
          if (updatedAttendance >= 3) {
            addToast(`🎓 3/3 Coursework units completed! Semester Examination Hall clearance approved!`, 'success');
          } else {
            addToast(`📚 Attendance recorded (${updatedAttendance}/3 lectures attended for exam clearance)`, 'info');
          }
        }, 150);
      }

      const gainsMsg = [
        activity.pietyGain ? `+${activity.pietyGain} Piety` : '',
        activity.cashGain ? `+₦${activity.cashGain.toLocaleString()}` : '',
        activity.moodGain ? `+${activity.moodGain} Mood` : '',
      ]
        .filter(Boolean)
        .join(', ');

      addToast(`Completed: "${activity.title}"! ${gainsMsg ? `(${gainsMsg})` : ''}`, 'success');
    },
    [stats.energy, stats.balance, stats.spiritualRank, currentLocation, addToast]
  );

  const removeShoes = useCallback(() => {
    setStats((prev) => ({
      ...prev,
      removedShoes: true,
      piety: prev.piety + 15,
      mood: Math.min(100, prev.mood + 5),
    }));
    addToast('👟 Shoes removed and placed on entrance shoe rack! (+15 Piety, +5 Mood)', 'success');
  }, [addToast]);

  const wearShoes = useCallback(() => {
    setStats((prev) => ({
      ...prev,
      removedShoes: false,
    }));
    addToast('👞 Retrieved shoes from entrance rack.', 'info');
  }, [addToast]);

  const completeSermon = useCallback(
    (track: 'chapel' | 'mosque', qualityMultiplier: number, themeTitle: string) => {
      const baseHonorarium = 5000;
      const honorarium = Math.round(baseHonorarium * qualityMultiplier);
      const pietyGain = Math.round(75 * qualityMultiplier);

      setStats((prev) => {
        const newPiety = prev.piety + pietyGain;
        let newRank = prev.spiritualRank;
        if (newPiety >= 250) newRank = 3;
        else if (newPiety >= 100) newRank = Math.max(2, newRank);

        const newTitle = track === 'chapel' ? 'Campus Pastor' : 'Campus Alfa';

        return {
          ...prev,
          balance: prev.balance + honorarium,
          piety: newPiety,
          spiritualTrack: track,
          spiritualRank: newRank,
          spiritualTitle: newTitle,
          mood: 100,
          xp: prev.xp + 300,
        };
      });

      addToast(
        `🕊️ Delivered inspiring ${track === 'chapel' ? 'Sunday Sermon' : 'Friday Khutbah'} on "${themeTitle}"! Blessed with ₦${honorarium.toLocaleString()} offerings/sadaqah and +${pietyGain} Piety!`,
        'success'
      );
    },
    [addToast]
  );

  // --- Campus Politics (SUG Elections) ---
  const registerSugNomination = useCallback((): boolean => {
    if (stats.isSugCandidate) {
      addToast('You are already a certified candidate for SUG President!', 'info');
      return true;
    }
    if (stats.isSuspended || stats.disciplinaryStrikes > 0) {
      addToast('❌ Disqualified! Candidate must have 0 disciplinary strikes and no active suspensions.', 'warning');
      return false;
    }
    if (stats.cgpa !== null && stats.cgpa < 3.0) {
      addToast(`❌ Academic Disqualification! Minimum CGPA of 3.0 required (Current: ${stats.cgpa.toFixed(2)}).`, 'warning');
      return false;
    }
    if (stats.balance < 100000) {
      addToast(`❌ Insufficient funds! ₦100,000 Nomination Fee required (Balance: ₦${stats.balance.toLocaleString()}).`, 'warning');
      return false;
    }

    setStats((prev) => ({
      ...prev,
      balance: prev.balance - 100000,
      isSugCandidate: true,
      campaignPopularity: 25,
      campaignFundsSpent: prev.campaignFundsSpent + 100000,
      xp: prev.xp + 150,
    }));
    addToast('🗳️ Nomination Accepted! Certified to contest for LU SUG President! (-₦100,000)', 'success');
    return true;
  }, [stats.isSugCandidate, stats.isSuspended, stats.disciplinaryStrikes, stats.cgpa, stats.balance, addToast]);

  const runCampaignActivity = useCallback(
    (type: 'fliers' | 'chops' | 'speech', speechImpact = 18): boolean => {
      if (!stats.isSugCandidate) {
        addToast('❌ Register and pay nomination fee before launching campaign activities!', 'warning');
        return false;
      }

      if (type === 'fliers') {
        const cost = 15000;
        if (stats.balance < cost) {
          addToast(`❌ Need ₦${cost.toLocaleString()} to print campaign posters & fliers!`, 'warning');
          return false;
        }
        setStats((prev) => ({
          ...prev,
          balance: prev.balance - cost,
          campaignFundsSpent: prev.campaignFundsSpent + cost,
          campaignPopularity: Math.min(100, prev.campaignPopularity + 14),
          fliersPrinted: prev.fliersPrinted + 150,
          energy: Math.max(0, prev.energy - 8),
          xp: prev.xp + 60,
        }));
        addToast('📄 Distributed 150 glossy campaign fliers across hostels & faculties! (+14% Popularity)', 'success');
        return true;
      }

      if (type === 'chops') {
        const cost = 30000;
        if (stats.balance < cost) {
          addToast(`❌ Need ₦${cost.toLocaleString()} to cater small chops & drinks for students!`, 'warning');
          return false;
        }
        setStats((prev) => ({
          ...prev,
          balance: prev.balance - cost,
          campaignFundsSpent: prev.campaignFundsSpent + cost,
          campaignPopularity: Math.min(100, prev.campaignPopularity + 24),
          chopsShared: prev.chopsShared + 60,
          energy: Math.max(0, prev.energy - 10),
          xp: prev.xp + 100,
        }));
        addToast('🥟 Shared 60 packs of hot small chops in common rooms! Hall erupted in cheers! (+24% Popularity)', 'success');
        return true;
      }

      if (type === 'speech') {
        if (stats.energy < 15) {
          addToast('❌ Too exhausted to address the Freedom Lawn crowd! Need at least 15⚡ energy.', 'warning');
          return false;
        }
        setStats((prev) => ({
          ...prev,
          energy: Math.max(0, prev.energy - 15),
          campaignPopularity: Math.min(100, Math.max(0, prev.campaignPopularity + speechImpact)),
          speechesDelivered: prev.speechesDelivered + 1,
          mood: Math.min(100, prev.mood + 15),
          xp: prev.xp + 120,
        }));
        addToast(
          `🎤 Addressed Amphitheatre rally! Crowd response generated ${speechImpact >= 0 ? `+${speechImpact}%` : `${speechImpact}%`} Student Popularity!`,
          'success'
        );
        return true;
      }

      return false;
    },
    [stats.isSugCandidate, stats.balance, stats.energy, addToast]
  );

  const holdElectionVoteTally = useCallback(() => {
    const totalVotes = 1200;
    const popRatio = stats.campaignPopularity / 100;
    const cgpaBonus = stats.cgpa !== null ? (stats.cgpa >= 4.5 ? 0.08 : stats.cgpa >= 3.5 ? 0.04 : 0) : 0.02;
    const strikePenalty = stats.disciplinaryStrikes * 0.15;
    const playerRatio = Math.max(0.12, Math.min(0.88, (popRatio * 0.75) + cgpaBonus - strikePenalty + (Math.random() * 0.06 - 0.03)));

    const playerVotes = Math.round(totalVotes * playerRatio);
    const rivalVotes = totalVotes - playerVotes;
    const won = playerVotes > rivalVotes;

    if (won) {
      setStats((prev) => ({
        ...prev,
        hasWonSugElection: true,
        balance: prev.balance + 50000,
        mood: 100,
        xp: prev.xp + 600,
      }));
      addToast(`🏆 VICTORY! Elected Liids University (LU) SUG President with ${playerVotes.toLocaleString()} votes! (+₦50,000 Allowance)`, 'success');
    } else {
      setStats((prev) => ({
        ...prev,
        mood: Math.max(10, prev.mood - 30),
      }));
      addToast(`💔 Defeated in the polls (${playerVotes.toLocaleString()} vs ${rivalVotes.toLocaleString()}). Regroup and contest next session!`, 'warning');
    }

    return { won, playerVotes, rivalVotes, totalVotes };
  }, [stats.campaignPopularity, stats.cgpa, stats.disciplinaryStrikes, addToast]);

  // --- Student Hustles & Crime ---
  const buySmallChopsWholesale = useCallback((quantity = 1): boolean => {
    const costPerPack = 3000;
    const totalCost = costPerPack * quantity;
    if (stats.balance < totalCost) {
      addToast(`❌ Need ₦${totalCost.toLocaleString()} to purchase ${quantity} box(es) of small chops!`, 'warning');
      return false;
    }
    setStats((prev) => ({
      ...prev,
      balance: prev.balance - totalCost,
      smallChopsStock: prev.smallChopsStock + quantity,
    }));
    addToast(`📦 Purchased ${quantity} wholesale pack(s) of small chops from Bukka bakery (-₦${totalCost.toLocaleString()}). Ready to hawk!`, 'success');
    return true;
  }, [stats.balance, addToast]);

  const sellSmallChopsRetail = useCallback((packs = 1): boolean => {
    if (stats.smallChopsStock < packs) {
      addToast(`❌ No small chops left in your bag! Visit wholesale caterer to restock.`, 'warning');
      return false;
    }
    if (stats.energy < 5 * packs) {
      addToast(`❌ Too fatigued to hawk across lecture halls! Need at least ${5 * packs}⚡.`, 'warning');
      return false;
    }

    const isLapo = stats.status === 'lapo';
    const baseSalePrice = 6500;
    const salePricePerPack = isLapo ? 7500 : baseSalePrice;
    const revenue = salePricePerPack * packs;
    const profit = (salePricePerPack - 3000) * packs;
    const xpBonus = isLapo ? Math.round(35 * packs * 1.5) : 35 * packs;

    setStats((prev) => ({
      ...prev,
      balance: prev.balance + revenue,
      smallChopsStock: prev.smallChopsStock - packs,
      hustleEarnings: prev.hustleEarnings + revenue,
      energy: Math.max(0, prev.energy - (5 * packs)),
      mood: Math.min(100, prev.mood + 6),
      xp: prev.xp + xpBonus,
    }));
    addToast(
      `💰 Sold ${packs} small chops pack(s)! Made ₦${revenue.toLocaleString()} (₦${profit.toLocaleString()} clean profit${
        isLapo ? ' + Lapo Hustler Perk' : ''
      })!`,
      'success'
    );
    return true;
  }, [stats.smallChopsStock, stats.energy, stats.status, addToast]);

  const takeProjectGig = useCallback((title: string, payout: number, energyCost: number, knowledgeGain: number): boolean => {
    if (stats.energy < energyCost) {
      addToast(`❌ Too exhausted for this coursework gig! Need at least ${energyCost}⚡ energy.`, 'warning');
      return false;
    }

    const isLapo = stats.status === 'lapo';
    const finalPayout = isLapo ? Math.round(payout * 1.5) : payout;
    const finalXp = isLapo ? Math.round(payout * 0.03 * 1.5) : Math.round(payout * 0.03);

    setStats((prev) => ({
      ...prev,
      balance: prev.balance + finalPayout,
      energy: Math.max(0, prev.energy - energyCost),
      knowledge: prev.knowledge + knowledgeGain,
      hustleEarnings: prev.hustleEarnings + finalPayout,
      xp: prev.xp + finalXp,
      mood: Math.min(100, prev.mood + 5),
    }));
    addToast(
      `💻 Completed "${title}" gig! Earned +₦${finalPayout.toLocaleString()}${
        isLapo ? ' (includes +50% Lapo Hustle Bonus!)' : ''
      } and +${knowledgeGain} KP!`,
      'success'
    );
    return true;
  }, [stats.energy, stats.status, addToast]);

  const attemptTheft = useCallback((locationName: string): { success: boolean; cashStolen: number; itemStolen?: string; caught: boolean } => {
    if (stats.energy < 15) {
      addToast('❌ Too fatigued to pull off a quick getaway! Need at least 15⚡.', 'warning');
      return { success: false, cashStolen: 0, caught: false };
    }

    // 40% chance of interception
    const caught = Math.random() < 0.40;

    if (caught) {
      const bailFine = Math.min(stats.balance, 10000);
      setStats((prev) => {
        const newStrikes = prev.disciplinaryStrikes + 1;
        return {
          ...prev,
          balance: Math.max(0, prev.balance - bailFine),
          energy: Math.max(0, prev.energy - 20),
          disciplinaryStrikes: newStrikes,
          mood: Math.max(0, prev.mood - 40),
          lastCrimeLocation: locationName,
        };
      });

      addToast(
        `🚨 BUSTED BY CAMPUS SECURITY! Intercepted at ${locationName}! Fined ₦${bailFine.toLocaleString()} bail & received +1 Disciplinary Strike!`,
        'warning'
      );

      if (stats.disciplinaryStrikes + 1 >= 3) {
        setTimeout(() => {
          setIsTribunalModalOpen(true);
        }, 1200);
      }

      return { success: false, cashStolen: 0, caught: true };
    } else {
      const cashStolen = Math.floor(Math.random() * 12000) + 4000;
      setStats((prev) => ({
        ...prev,
        balance: prev.balance + cashStolen,
        energy: Math.max(0, prev.energy - 12),
        mood: Math.min(100, prev.mood + 10),
        xp: prev.xp + 60,
        lastCrimeLocation: locationName,
      }));
      addToast(`🤫 High risk score! Snatched unattended envelope at ${locationName}! Slipped away with ₦${cashStolen.toLocaleString()}!`, 'success');
      return { success: true, cashStolen, caught: false };
    }
  }, [stats.energy, stats.balance, stats.disciplinaryStrikes, addToast]);

  // --- Exam Hall & Disciplinary Tribunal ---
  const startExamSession = useCallback(() => {
    if (stats.isLongVacation) {
      addToast(
        '🏖️ Lecture rooms are closed during Annual Long Vacation! Relax in hostel or take on holiday hustles.',
        'warning'
      );
      return;
    }
    if ((stats.classesAttended || 0) < 3) {
      addToast(
        `❌ Exam Clearance Denied! You must attend at least 3 lectures/tutorials before sitting for the exam (Currently: ${stats.classesAttended || 0}/3).`,
        'warning'
      );
      return;
    }
    setStats((prev) => ({
      ...prev,
      invigilatorAlertness: 0,
      isTakingExam: true,
    }));
    setIsExamModalOpen(true);
  }, [stats.isLongVacation, stats.classesAttended, addToast]);

  const submitExamLegitimate = useCallback((): {
    score: number;
    grade: string;
    gpa: number;
    cgpa: number;
    cgpaChange: number;
    isSeasonComplete: boolean;
    nextPhaseText: string;
  } => {
    const kpBonus = Math.min(45, Math.floor(stats.knowledge / 20));
    const rawScore = 52 + kpBonus + Math.floor(Math.random() * 10);
    const score = Math.min(100, Math.max(35, rawScore));

    let grade = 'F';
    let gpa = 0.0;
    if (score >= 70) {
      grade = 'A';
      gpa = 5.0;
    } else if (score >= 60) {
      grade = 'B';
      gpa = 4.0;
    } else if (score >= 50) {
      grade = 'C';
      gpa = 3.0;
    } else if (score >= 45) {
      grade = 'D';
      gpa = 2.0;
    } else {
      grade = 'F';
      gpa = 0.0;
    }

    const currentLvl = stats.currentLevel || 100;
    const currentSem = stats.currentSemester || 1;

    const newSemRecord = {
      level: currentLvl,
      semester: currentSem,
      score,
      gpa,
      grade,
      semesterTitle: `${currentLvl}L Semester ${currentSem}`,
    };

    const updatedCompleted = [...(stats.completedSemesters || []), newSemRecord];
    const totalGpa = updatedCompleted.reduce((acc, curr) => acc + curr.gpa, 0);
    const newCgpa = Number((totalGpa / updatedCompleted.length).toFixed(2));

    const isFinishingSemester2 = currentSem === 2;
    const nextSeason = isFinishingSemester2 ? 'long_vacation' : 'semester_2';
    const nextPhaseText = isFinishingSemester2
      ? 'Annual Long Vacation (July – October)'
      : 'Semester 2 (April – June)';

    setStats((prev) => ({
      ...prev,
      gpa,
      cgpa: newCgpa,
      currentSemester: isFinishingSemester2 ? 2 : 2,
      calendarSeason: nextSeason,
      isLongVacation: isFinishingSemester2,
      classesAttended: 0,
      completedSemesters: updatedCompleted,
      energy: Math.max(0, prev.energy - 25),
      isTakingExam: false,
      examScore: score,
      mood: Math.min(100, prev.mood + 20),
      xp: prev.xp + 200,
    }));

    if (isFinishingSemester2) {
      addToast(
        `🏖️ 2nd Semester Concluded! Exam Score: ${score}% (${grade} - GPA ${gpa.toFixed(2)}). Cumulative CGPA: ${newCgpa.toFixed(2)}. Annual Long Vacation has begun (July – October)!`,
        'success'
      );
    } else {
      addToast(
        `📝 Semester 1 Exam Submitted! Exam Score: ${score}% (${grade} - GPA ${gpa.toFixed(2)}). Cumulative CGPA: ${newCgpa.toFixed(2)}. Resuming Semester 2 (April – June)!`,
        'success'
      );
    }

    return {
      score,
      grade,
      gpa,
      cgpa: newCgpa,
      cgpaChange: gpa,
      isSeasonComplete: isFinishingSemester2,
      nextPhaseText,
    };
  }, [stats.knowledge, stats.currentLevel, stats.currentSemester, stats.completedSemesters, addToast]);

  const resumeNextSession = useCallback(() => {
    setStats((prev) => {
      let nextLvl: 100 | 200 | 300 | 400 = 200;
      let nextAcademicTitle = '200 Level (Sophomore)';

      if (prev.currentLevel === 100) {
        nextLvl = 200;
        nextAcademicTitle = '200 Level (Sophomore)';
      } else if (prev.currentLevel === 200) {
        nextLvl = 300;
        nextAcademicTitle = '300 Level (Penultimate)';
      } else if (prev.currentLevel === 300) {
        nextLvl = 400;
        nextAcademicTitle = '400 Level (Final Year)';
      } else {
        nextLvl = 400;
        nextAcademicTitle = 'Graduated (Alumnus)';
      }

      return {
        ...prev,
        currentLevel: nextLvl,
        academicLevel: nextAcademicTitle,
        currentSemester: 1,
        calendarSeason: 'semester_1',
        isLongVacation: false,
        classesAttended: 0,
        energy: Math.min(prev.maxEnergy, Math.max(prev.energy, 80)),
        mood: Math.min(100, Math.max(prev.mood, 80)),
        level: prev.level + 1,
      };
    });

    addToast(
      '🎓 Resumed Next Academic Session (October)! New session matriculated into Semester 1 (November – March). Lecture rooms are now open!',
      'success'
    );
  }, [addToast]);

  const sneakExpoCheat = useCallback((): { caught: boolean; currentAlertness: number; scoreBoost: number } => {
    const alertnessIncrease = Math.floor(Math.random() * 15) + 30;
    const nextAlertness = stats.invigilatorAlertness + alertnessIncrease;
    const caught = nextAlertness >= 100;

    if (caught) {
      setStats((prev) => ({
        ...prev,
        invigilatorAlertness: 100,
        isTakingExam: false,
        disciplinaryStrikes: prev.disciplinaryStrikes + 1,
        mood: Math.max(0, prev.mood - 50),
      }));
      addToast('🚨 CAUGHT CHEATING! Invigilator seized your expo & signed a Malpractice Docket! Summoned to Tribunal!', 'warning');
      setIsExamModalOpen(false);
      setIsTribunalModalOpen(true);
      return { caught: true, currentAlertness: 100, scoreBoost: 0 };
    } else {
      setStats((prev) => ({
        ...prev,
        invigilatorAlertness: nextAlertness,
        knowledge: prev.knowledge + 25,
      }));
      addToast(`👀 Expo glance successful! Answers copied! (Invigilator Alertness: ${nextAlertness}%)`, 'info');
      return { caught: false, currentAlertness: nextAlertness, scoreBoost: 15 };
    }
  }, [stats.invigilatorAlertness, addToast]);

  const submitTribunalDefense = useCallback((defenseStrategy: 'innocent' | 'confess' | 'blame_roommate' | 'medical_exemption') => {
    let verdict: 'guilty' | 'probation' | 'acquitted' = 'guilty';
    let penaltyDesc = '';

    if (defenseStrategy === 'medical_exemption') {
      verdict = 'acquitted';
      penaltyDesc = 'Presented official LU Medical Centre Exemption Note! The Tribunal recognized acute clinical distress and dismissed all charges without penalty.';
      setStats((prev) => ({
        ...prev,
        hasMedicalExemptionNote: false,
        isSuspended: false,
        suspensionDaysRemaining: 0,
        mood: Math.min(100, prev.mood + 30),
        xp: prev.xp + 100,
      }));
    } else if (defenseStrategy === 'innocent') {
      if (Math.random() < 0.20) {
        verdict = 'acquitted';
        penaltyDesc = 'Evidence dismissed on technicality! Discharged with stern warning.';
        setStats((prev) => ({
          ...prev,
          mood: Math.min(100, prev.mood + 20),
        }));
      } else {
        verdict = 'guilty';
        penaltyDesc = 'Guilty of Examination Malpractice! 2-day suspension, -0.80 CGPA dock, SUG candidacy revoked.';
        setStats((prev) => ({
          ...prev,
          isSuspended: true,
          suspensionDaysRemaining: 2,
          cgpa: prev.cgpa !== null ? Math.max(1.0, Number((prev.cgpa - 0.80).toFixed(2))) : null,
          isSugCandidate: false,
          disciplinaryStrikes: prev.disciplinaryStrikes + 1,
          mood: Math.max(0, prev.mood - 40),
        }));
      }
    } else if (defenseStrategy === 'confess') {
      verdict = 'probation';
      penaltyDesc = 'Tribunal showed leniency for remorse. Placed on Disciplinary Probation: -0.30 CGPA dock, community service.';
      setStats((prev) => ({
        ...prev,
        cgpa: prev.cgpa !== null ? Math.max(1.5, Number((prev.cgpa - 0.30).toFixed(2))) : null,
        isSugCandidate: false,
        disciplinaryStrikes: prev.disciplinaryStrikes + 1,
        mood: Math.max(10, prev.mood - 20),
      }));
    } else {
      verdict = 'guilty';
      penaltyDesc = 'Guilty of Malpractice & False Accusation! 3-day suspension, -1.0 CGPA dock, maximum penalty applied.';
      setStats((prev) => ({
        ...prev,
        isSuspended: true,
        suspensionDaysRemaining: 3,
        cgpa: prev.cgpa !== null ? Math.max(1.0, Number((prev.cgpa - 1.00).toFixed(2))) : null,
        isSugCandidate: false,
        disciplinaryStrikes: prev.disciplinaryStrikes + 2,
        mood: Math.max(0, prev.mood - 50),
      }));
    }

    addToast(`⚖️ Tribunal Ruling: ${verdict.toUpperCase()}! ${penaltyDesc}`, verdict === 'acquitted' ? 'success' : 'warning');
    return { verdict, penaltyDesc };
  }, [addToast]);

  const addItemToRoom = useCallback((item: Omit<RoomItem, 'id'>) => {
    const id = 'item_' + Date.now();
    setLocationItemsMap((prev) => ({
      ...prev,
      [currentLocation]: [...(prev[currentLocation] || []), { ...item, id }],
    }));
    addToast(`Placed ${item.name} in current room!`, 'success');
  }, [currentLocation, addToast]);

  const removeItemFromRoom = useCallback((id: string) => {
    setLocationItemsMap((prev) => ({
      ...prev,
      [currentLocation]: (prev[currentLocation] || []).filter((i) => i.id !== id),
    }));
    addToast('Item removed from room.', 'info');
  }, [currentLocation, addToast]);

  const rotateItemInRoom = useCallback((id: string) => {
    setLocationItemsMap((prev) => ({
      ...prev,
      [currentLocation]: (prev[currentLocation] || []).map((i) =>
        i.id === id ? { ...i, rotation: (i.rotation + Math.PI / 2) % (Math.PI * 2) } : i
      ),
    }));
    addToast('Item rotated 90°', 'info');
  }, [currentLocation, addToast]);

  const claimQuest = useCallback((id: string) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === id && !q.completed && q.progress >= q.maxProgress) {
          addBalance(q.reward);
          return { ...q, completed: true };
        }
        return q;
      })
    );
  }, [addBalance]);

  const triggerResetCamera = useCallback(() => {
    setResetCameraTrigger((prev) => prev + 1);
    addToast('Isometric camera angle reset', 'info');
  }, [addToast]);

  // Healthcare & University Medical Centre Systems
  const triggerEmergencyCollapse = useCallback(() => {
    setStats((prev) => ({
      ...prev,
      isCollapsed: true,
      energy: 0,
    }));
    addToast('🚨 CRITICAL COLLAPSE! You passed out from acute physical exhaustion!', 'warning');
  }, [addToast]);

  const admitToClinic = useCallback(() => {
    setCurrentLocation('medical_centre');
    setStats((prev) => ({
      ...prev,
      isCollapsed: false,
      energy: 45, // Restored on hospital bed
      mood: Math.max(prev.mood, 50),
      xp: prev.xp + 30,
    }));
    addToast('🚑 Admitted to University Medical Centre! Rehydrated with IV drip on clinic bed (+45%⚡ Energy).', 'success');
  }, [addToast]);

  const buyGlucoseDripTreatment = useCallback((): boolean => {
    const cost = 3500;
    if (stats.balance < cost) {
      addToast(`❌ Insufficient funds! Multivitamin / Glucose Drip costs ₦${cost.toLocaleString()}.`, 'warning');
      return false;
    }
    setStats((prev) => ({
      ...prev,
      balance: prev.balance - cost,
      energy: Math.min(prev.maxEnergy, prev.energy + 40),
      mood: Math.min(100, prev.mood + 20),
      xp: prev.xp + 25,
    }));
    addToast('💉 Administered Multivitamins & Glucose Drip! Stamina revitalized (+40%⚡ Energy, +20 Mood)!', 'success');
    return true;
  }, [stats.balance, addToast]);

  const buyMedicalExemptionNote = useCallback((): boolean => {
    const cost = 5000;
    if (stats.balance < cost) {
      addToast(`❌ Insufficient funds! Medical Exemption Note costs ₦${cost.toLocaleString()}.`, 'warning');
      return false;
    }
    setStats((prev) => ({
      ...prev,
      balance: prev.balance - cost,
      hasMedicalExemptionNote: true,
      mood: Math.min(100, prev.mood + 15),
      xp: prev.xp + 35,
    }));
    addToast('📋 Official LU Medical Exemption Note collected! Stamped by Nurse Funke and kept in bag.', 'success');
    return true;
  }, [stats.balance, addToast]);

  const restOnClinicBed = useCallback(() => {
    setStats((prev) => ({
      ...prev,
      energy: Math.min(prev.maxEnergy, prev.energy + 25),
      mood: Math.min(100, prev.mood + 10),
      xp: prev.xp + 15,
    }));
    addToast('🛏️ Rested comfortably on clinic bed! Vital signs stabilized (+25%⚡ Energy, +10 Mood).', 'success');
  }, [addToast]);

  // Check for 0% Energy Emergency Collapse
  useEffect(() => {
    if (stats.energy <= 0 && !stats.isCollapsed) {
      setStats((prev) => ({
        ...prev,
        isCollapsed: true,
      }));
      addToast('🚨 CRITICAL COLLAPSE! You passed out from acute exhaustion!', 'warning');
    }
  }, [stats.energy, stats.isCollapsed, addToast]);

  // Sports Complex & Campus Football Betting Systems
  const completePenaltyShootout = useCallback((won: boolean, stake: number) => {
    if (won) {
      setStats((prev) => ({
        ...prev,
        balance: prev.balance + stake * 2,
        mood: Math.min(100, prev.mood + 25),
        penaltiesWon: (prev.penaltiesWon || 0) + 1,
        xp: prev.xp + 100,
      }));
      awardFitnessXp(30);
      addToast(`⚽ Penalty Shootout VICTORY! Won ₦${(stake * 2).toLocaleString()} (+30 Fitness XP, +25 Mood)!`, 'success');
    } else {
      setStats((prev) => ({
        ...prev,
        balance: Math.max(0, prev.balance - stake),
        energy: Math.max(0, prev.energy - 15),
        mood: Math.max(0, prev.mood - 15),
        penaltiesLost: (prev.penaltiesLost || 0) + 1,
      }));
      addToast(`❌ Penalty Shootout Defeat! Lost ₦${stake.toLocaleString()} (-15⚡ Energy, -15 Mood).`, 'warning');
    }
  }, [awardFitnessXp, addToast]);

  const placeBetSlip = useCallback((selections: BetSelection[], stake: number, totalOdds: number, potentialPayout: number): ActiveBetSlip | null => {
    if (stats.balance < stake) {
      addToast(`❌ Insufficient student funds! Bet stake requires ₦${stake.toLocaleString()}`, 'warning');
      return null;
    }

    if (spendBalance(stake)) {
      const newSlip: ActiveBetSlip = {
        id: 'slip_' + Date.now(),
        selections,
        stake,
        totalOdds,
        potentialPayout,
        status: 'pending',
        placedAt: Date.now(),
      };

      setActiveBetSlips((prev) => {
        const next = [newSlip, ...prev];
        try {
          localStorage.setItem('lu_bet_slips', JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });

      addToast(`🎟️ Bet Slip Confirmed! Staked ₦${stake.toLocaleString()} on ${selections.length} fixture(s) (Odds: ${totalOdds}x)!`, 'success');
      return newSlip;
    }
    return null;
  }, [stats.balance, spendBalance, addToast]);

  const settleBetSlip = useCallback((slipId: string, won: boolean, payout: number, results?: Record<string, { homeScore: number; awayScore: number; outcome: '1' | 'X' | '2' }>) => {
    setActiveBetSlips((prev) => {
      const next = prev.map((s) => (s.id === slipId ? { ...s, status: won ? ('won' as const) : ('lost' as const), matchResults: results } : s));
      try {
        localStorage.setItem('lu_bet_slips', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

    if (won) {
      addBalance(payout);
      setStats((prev) => ({
        ...prev,
        bettingSlipsWon: (prev.bettingSlipsWon || 0) + 1,
        bettingEarnings: (prev.bettingEarnings || 0) + payout,
        mood: Math.min(100, prev.mood + 30),
        xp: prev.xp + 150,
      }));
      addToast(`🎉 BOOM! Your bet slip won ₦${payout.toLocaleString()}! Credited to your student wallet!`, 'success');
    } else {
      addToast('💔 Bet slip lost. Better luck on the next accumulator!', 'info');
    }
  }, [addBalance, addToast]);

  const bookBillboard = useCallback((id: string, businessName: string, slogan: string, bannerUrl?: string, bannerColor = '#10b981'): boolean => {
    const cost = 25000;
    if (stats.balance < cost) {
      addToast(`❌ Insufficient funds! Booking a campus billboard requires ₦${cost.toLocaleString()}`, 'warning');
      return false;
    }

    if (spendBalance(cost)) {
      setBillboards((prev) => {
        const next = prev.map((bb) =>
          bb.id === id
            ? {
                ...bb,
                isBooked: true,
                businessName,
                slogan,
                bannerUrl,
                bannerColor,
                bookedAt: Date.now(),
              }
            : bb
        );
        try {
          localStorage.setItem('lu_campus_billboards', JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });

      setStats((prev) => ({
        ...prev,
        billboardsBooked: (prev.billboardsBooked || 0) + 1,
        xp: prev.xp + 250,
      }));

      addToast(`📢 Billboard Booked! "${businessName}" is now actively advertised on campus!`, 'success');
      return true;
    }
    return false;
  }, [stats.balance, spendBalance, addToast]);

  const hostLionsHallEvent = useCallback((event: LionsHallEvent): boolean => {
    if (stats.balance < event.cost) {
      addToast(`❌ Insufficient funds to host ${event.title}! (Requires ₦${event.cost.toLocaleString()})`, 'warning');
      return false;
    }

    if (spendBalance(event.cost)) {
      setActiveLionsHallEvent(event);
      setStats((prev) => ({
        ...prev,
        eventsHosted: (prev.eventsHosted || 0) + 1,
        mood: Math.min(100, prev.mood + event.moodGain),
        campaignPopularity: event.popularityGain
          ? Math.min(100, prev.campaignPopularity + event.popularityGain)
          : prev.campaignPopularity,
        xp: prev.xp + Math.floor(event.cost * 0.04),
      }));

      addToast(`🦁 Party Activated! ${event.title} is now rocking Lions Hall! (+${event.moodGain} Mood${event.popularityGain ? `, +${event.popularityGain}% Popularity` : ''})`, 'success');
      return true;
    }
    return false;
  }, [stats.balance, spendBalance, addToast]);

  const requestTrack = useCallback((trackTitle: string): boolean => {
    const tip = 500;
    if (stats.balance < tip) {
      addToast('❌ Insufficient funds! DJ Spin request tip requires ₦500', 'warning');
      return false;
    }

    if (spendBalance(tip)) {
      setActiveTrackTitle(trackTitle);
      setStats((prev) => ({
        ...prev,
        trackRequestsDelivered: (prev.trackRequestsDelivered || 0) + 1,
        mood: Math.min(100, prev.mood + 20),
        xp: prev.xp + 25,
      }));
      addToast(`🎶 DJ accepted your request! Now playing "${trackTitle}".`, 'success');
      return true;
    }
    return false;
  }, [stats.balance, spendBalance, addToast]);

  // In-game dynamic clock
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => {
        let newMin = prev.inGameMinutes + 1;
        let newHour = prev.inGameHours;
        let newDay = prev.day;

        if (newMin >= 60) {
          newMin = 0;
          newHour += 1;
        }
        if (newHour >= 24) {
          newHour = 0;
          newDay += 1;
        }

        // Slight natural energy drain every 5 game minutes
        const energyDrain = newMin % 5 === 0 ? 1 : 0;

        return {
          ...prev,
          inGameMinutes: newMin,
          inGameHours: newHour,
          day: newDay,
          energy: Math.max(0, prev.energy - energyDrain),
        };
      });
    }, 1000); // 1 real sec = 1 in-game minute

    return () => clearInterval(interval);
  }, []);

  return (
    <GameContext.Provider
      value={{
        currentLocation,
        navigateToLocation,
        isTransitioning,
        stats,
        addBalance,
        spendBalance,
        performActivity,
        activeTab,
        setActiveTab,
        roomItems,
        addItemToRoom,
        removeItemFromRoom,
        rotateItemInRoom,
        selectedPlacingItem,
        setSelectedPlacingItem,
        showGrid,
        setShowGrid,
        theme,
        setTheme,
        quests,
        claimQuest,
        toasts,
        removeToast,
        addToast,
        resetCameraTrigger,
        triggerResetCamera,
        dayNightCycle,
        setDayNightCycle,
        playerCustomization,
        setPlayerCustomization,
        activeDialogueNPC,
        setActiveDialogueNPC,
        isWardrobeOpen,
        setIsWardrobeOpen,
        isPhoneOpen,
        setIsPhoneOpen,
        awardFitnessXp,
        applyTransitEffects,
        lastVisitedLandmarkId,
        setLastVisitedLandmarkId,
        removeShoes,
        wearShoes,
        isSermonModalOpen,
        setIsSermonModalOpen,
        completeSermon,
        isElectionsModalOpen,
        setIsElectionsModalOpen,
        registerSugNomination,
        runCampaignActivity,
        holdElectionVoteTally,
        isHustleModalOpen,
        setIsHustleModalOpen,
        buySmallChopsWholesale,
        sellSmallChopsRetail,
        takeProjectGig,
        attemptTheft,
        isExamModalOpen,
        setIsExamModalOpen,
        isTribunalModalOpen,
        setIsTribunalModalOpen,
        startExamSession,
        submitExamLegitimate,
        resumeNextSession,
        sneakExpoCheat,
        submitTribunalDefense,
        triggerEmergencyCollapse,
        admitToClinic,
        buyGlucoseDripTreatment,
        buyMedicalExemptionNote,
        restOnClinicBed,
        isPenaltyModalOpen,
        setIsPenaltyModalOpen,
        isBettingModalOpen,
        setIsBettingModalOpen,
        completePenaltyShootout,
        activeBetSlips,
        placeBetSlip,
        settleBetSlip,
        isAdminOpen,
        setIsAdminOpen,
        registerStudentProfile,
        loginStudentProfile,
        signOutStudent,
        setSocioeconomicStatus,
        takeLapoLoan,
        repayLapoLoan,
        setStats,
        billboards,
        selectedBillboard,
        setSelectedBillboard,
        isBillboardModalOpen,
        setIsBillboardModalOpen,
        bookBillboard,
        activeLionsHallEvent,
        isLionsEventModalOpen,
        setIsLionsEventModalOpen,
        hostLionsHallEvent,
        isMusicRequestModalOpen,
        setIsMusicRequestModalOpen,
        activeTrackTitle,
        requestTrack,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
