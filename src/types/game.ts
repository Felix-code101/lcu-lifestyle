export type GameLocation =
  | 'home_hostel'
  | 'campus_map'
  | 'cafeteria'
  | 'lecture_theatre'
  | 'library'
  | 'sports_arena'
  | 'chapel'
  | 'mosque'
  | 'guesthouse'
  | 'medical_centre'
  | 'lions_hall'
  | 'adeline_hall'
  | 'sub';

export type NavTab = 'map' | 'build' | 'inventory' | 'shop' | 'quests' | 'settings' | null;

export interface RoomItem {
  id: string;
  name: string;
  type:
    | 'desk'
    | 'plant'
    | 'chair'
    | 'arcade'
    | 'shelf'
    | 'lamp'
    | 'crystal'
    | 'bed'
    | 'bunk_bed'
    | 'locker'
    | 'cooler'
    | 'water_gallon'
    | 'waste_bin'
    | 'fan'
    | 'laptop_and_books'
    | 'podium'
    | 'whiteboard'
    | 'food_counter'
    | 'dining_table'
    | 'bookshelf'
    | 'sports_hoop'
    | 'pew'
    | 'pulpit'
    | 'altar_keyboard'
    | 'bible_stand'
    | 'prayer_rug'
    | 'minbar'
    | 'mihrab'
    | 'ablution_fountain'
    | 'shoe_rack';
  x: number;
  z: number;
  rotation: number;
  color: string;
}

export interface ShopItem {
  id: string;
  name: string;
  type: RoomItem['type'];
  price: number;
  category: 'Furniture' | 'Tech' | 'Nature' | 'Decor' | 'Academic';
  description: string;
  color: string;
  icon: string;
}

export interface Quest {
  id: string;
  title: string;
  reward: number;
  completed: boolean;
  progress: number;
  maxProgress: number;
}

export type SpiritualTrack = 'none' | 'chapel' | 'mosque';
export type SocioeconomicStatus = 'nepo' | 'lapo';

export interface SemesterRecord {
  level: number;
  semester: 1 | 2;
  score: number;
  gpa: number;
  grade: string;
  semesterTitle: string;
}

export interface PlayerStats {
  // Matriculation & Identity
  isRegistered: boolean;
  username: string;
  department: string;
  faculty?: string;
  matricNo: string;
  academicLevel: string; // "100 Level (Fresher)"
  status: SocioeconomicStatus; // 'nepo' (15%) or 'lapo' (85%)
  gender?: CharacterGender;
  email?: string;
  isAdmin: boolean;
  activeLoanAmount: number;

  balance: number;
  energy: number;
  maxEnergy: number;
  cgpa: number | null;
  gpa: number | null;
  classesAttended: number; // 0 to 3 for the active semester
  currentLevel: 100 | 200 | 300 | 400;
  currentSemester: 1 | 2;
  calendarSeason: 'semester_1' | 'semester_2' | 'long_vacation';
  isLongVacation: boolean;
  completedSemesters: SemesterRecord[];
  knowledge: number;
  mood: number;
  level: number;
  xp: number;
  maxXp: number;
  fitnessLevel: number;
  fitnessXp: number;
  fitnessMaxXp: number;
  spiritualTrack: SpiritualTrack;
  piety: number;
  spiritualRank: number; // 1 to 3
  spiritualTitle: string; // e.g. "Fellowship Member", "Choir / Usher", "Campus Pastor", "Jama'ah", "Mu'adhin", "Campus Alfa"
  removedShoes?: boolean;

  // Campus Politics (SUG President Race)
  isSugCandidate: boolean;
  hasWonSugElection: boolean;
  campaignPopularity: number; // 0 to 100%
  campaignFundsSpent: number;
  fliersPrinted: number;
  chopsShared: number;
  speechesDelivered: number;

  // Student Hustles
  smallChopsStock: number; // Wholesale packs held in backpack
  hustleEarnings: number;

  // Crime & Campus Security
  disciplinaryStrikes: number; // 0 to 3
  isSuspended: boolean;
  suspensionDaysRemaining: number;
  lastCrimeLocation?: string;

  // Exam & Malpractice
  invigilatorAlertness: number; // 0 to 100%
  isTakingExam: boolean;
  examScore?: number;
  hasMedicalExemptionNote?: boolean;

  // Guesthouse & Healthcare Status
  guesthouseNightsLodged?: number;
  isCollapsed?: boolean;

  // Sports Complex & Campus Betting
  penaltiesWon?: number;
  penaltiesLost?: number;
  bettingSlipsWon?: number;
  bettingEarnings?: number;

  // Lions Hall & Billboard Stats
  billboardsBooked?: number;
  eventsHosted?: number;
  trackRequestsDelivered?: number;

  inGameHours: number;
  inGameMinutes: number;
  day: number;
}

export interface MatchFixture {
  id: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  odds: {
    home: number;
    draw: number;
    away: number;
  };
  kickoff: string;
}

export interface BetSelection {
  fixtureId: string;
  matchTitle: string;
  pick: '1' | 'X' | '2';
  pickLabel: string;
  odds: number;
}

export interface ActiveBetSlip {
  id: string;
  selections: BetSelection[];
  stake: number;
  totalOdds: number;
  potentialPayout: number;
  status: 'pending' | 'running' | 'won' | 'lost';
  placedAt: number;
  matchResults?: Record<string, { homeScore: number; awayScore: number; outcome: '1' | 'X' | '2' }>;
}

export interface BillboardAd {
  id: string;
  name: string;
  roadName: string;
  position: [number, number, number];
  rotation: number;
  isBooked: boolean;
  businessName?: string;
  slogan?: string;
  bannerColor?: string;
  bannerUrl?: string;
  bookedAt?: number;
}

export type LionsHallEventType = 'rave' | 'dinner' | 'rally';

export interface LionsHallEvent {
  type: LionsHallEventType;
  title: string;
  cost: number;
  moodGain: number;
  popularityGain?: number;
  description: string;
}

export interface RemotePlayer {
  id: string;
  username: string;
  matricNo: string;
  department: string;
  level: string;
  status: SocioeconomicStatus;
  location: GameLocation;
  position: [number, number, number];
  rotation: number;
  isWalking: boolean;
  customization: CharacterCustomization;
  lastSeen: number;
}

export interface RegisteredStudent {
  id: string;
  username: string;
  matricNo: string;
  department: string;
  faculty?: string;
  level: string;
  status: SocioeconomicStatus;
  gender?: CharacterGender;
  email?: string;
  balance: number;
  cgpa: number | null;
  createdAt: string;
  lastActive: string;
  isOnline: boolean;
}

export type TransitMode = 'trek' | 'keke';

export interface CampusActivity {
  id: string;
  title: string;
  description: string;
  energyCost: number;
  cashCost: number;
  cgpaGain: number;
  moodGain: number;
  energyGain?: number;
  pietyGain?: number;
  cashGain?: number;
  durationMinutes: number;
  requiredRank?: number;
  isCoursework?: boolean;
  isHolidayHustle?: boolean;
  requiresHoliday?: boolean;
  isExam?: boolean;
}

export interface CampusLocationInfo {
  id: GameLocation;
  name: string;
  subtitle: string;
  description: string;
  energyCost: number;
  travelMinutes: number;
  accentColor: string;
  tag: string;
  activities: CampusActivity[];
}

export interface Landmark3D {
  id: string;
  name: string;
  category: string;
  icon: string;
  color: string;
  position: [number, number, number];
  badgeHeight: number;
  destinationScene?: GameLocation;
  subtitle: string;
  description: string;
  energyCost: number;
  travelMinutes: number;
  features: string[];
}

export type CharacterGender = 'male' | 'female';

export type HairStyle =
  | 'short'
  | 'fade'
  | 'afro'
  | 'dreads'
  | 'braids'
  | 'waves'
  | 'bob'
  | 'ponytail'
  | 'gele'
  | 'none';

export type AccessoryType =
  | 'none'
  | 'crown'
  | 'cap'
  | 'glasses'
  | 'pastor_collar'
  | 'alfa_cap'
  | 'prayer_beads';
export type ShirtPattern =
  | 'plain'
  | 'ankara'
  | 'stripes'
  | 'pastor_vestment'
  | 'jalabiya_robe';

export interface CharacterCustomization {
  gender?: CharacterGender;
  skinTone: string;
  shirtColor: string;
  shirtPattern: ShirtPattern;
  pantsColor: string;
  shoesColor: string;
  hairStyle: HairStyle;
  hairColor: string;
  accessory: AccessoryType;
}

export interface NPCOption {
  id: string;
  label: string;
  cost?: number;
  rewardText: string;
  energyGain?: number;
  energyCost?: number;
  cgpaGain?: number;
  moodGain?: number;
  cashGain?: number;
  durationMinutes?: number;
  responseMessage: string;
}

export interface CampusNPC {
  id: string;
  name: string;
  role: string;
  avatarIcon: string;
  location: GameLocation;
  position: [number, number, number];
  rotation: number;
  customization: CharacterCustomization;
  dialogueIntro: string;
  dialogueLines: string[];
  options: NPCOption[];
}
