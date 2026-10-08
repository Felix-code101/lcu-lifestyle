import type { CampusNPC, CharacterCustomization } from '../types/game';

export const DEFAULT_PLAYER_CUSTOMIZATION: CharacterCustomization = {
  gender: 'male',
  skinTone: '#6d4527', // Rich Melanin
  shirtColor: '#16a34a', // University Green
  shirtPattern: 'ankara', // African Wax Print
  pantsColor: '#1e293b', // Midnight Navy
  shoesColor: '#ffffff', // Clean White Sneakers
  hairStyle: 'fade', // High-Top Fade
  hairColor: '#18181b', // Natural Black
  accessory: 'crown', // Floating Gold Crown
};

export const DEFAULT_FEMALE_CUSTOMIZATION: CharacterCustomization = {
  gender: 'female',
  skinTone: '#6d4527', // Rich Melanin
  shirtColor: '#f43f5e', // Coral Pink
  shirtPattern: 'ankara', // African Wax Print
  pantsColor: '#1e293b', // Midnight Navy
  shoesColor: '#ffffff', // Clean White Sneakers
  hairStyle: 'braids', // Box Braids
  hairColor: '#18181b', // Natural Black
  accessory: 'crown', // Floating Gold Crown
};

export const CAMPUS_NPCS: CampusNPC[] = [
  {
    id: 'npc_femi',
    name: 'Femi (Roommate)',
    role: 'Hostel Roommate',
    avatarIcon: '🎒',
    location: 'home_hostel',
    position: [3, 0, -2],
    rotation: -Math.PI / 4,
    customization: {
      skinTone: '#523620',
      shirtColor: '#eab308',
      shirtPattern: 'plain',
      pantsColor: '#3b82f6',
      shoesColor: '#ffffff',
      hairStyle: 'short',
      hairColor: '#18181b',
      accessory: 'cap',
    },
    dialogueIntro: "Yo my guy! How far? You don prepare for test?",
    dialogueLines: [
      "Bro, Dr. Adeleke said his assignment is due by 4 PM sharp!",
      "I get past questions on my laptop if you wan cram together.",
      "Make we sharp go cafeteria later chop Mama Ronke Jollof rice!",
    ],
    options: [
      {
        id: 'borrow_notes',
        label: 'Borrow Lecture Handouts',
        energyCost: 5,
        cgpaGain: 0.04,
        rewardText: '+0.04 CGPA • -5⚡',
        responseMessage: "Here are my notes bro! Make sure you return them before 5 PM.",
      },
      {
        id: 'play_fifa',
        label: 'Play FIFA Match on Laptop',
        energyCost: 10,
        moodGain: 25,
        durationMinutes: 30,
        rewardText: '+25 Mood • -10⚡',
        responseMessage: "Goooaaal! Bro you need more practice! That was an easy 3-0 win for me haha.",
      },
      {
        id: 'gist_gossip',
        label: 'Gist About Campus Life',
        moodGain: 15,
        energyGain: 5,
        durationMinutes: 15,
        rewardText: '+15 Mood • +5⚡',
        responseMessage: "Did you hear what happened at the Senate Building yesterday? Pure vibes!",
      },
    ],
  },

  {
    id: 'npc_dr_adeleke',
    name: 'Dr. Adeleke (Lecturer)',
    role: 'Senior Faculty Lecturer',
    avatarIcon: '👨‍🏫',
    location: 'lecture_theatre',
    position: [1.2, 0, -2.8],
    rotation: 0.15,
    customization: {
      skinTone: '#3b2314',
      shirtColor: '#f8fafc',
      shirtPattern: 'plain',
      pantsColor: '#0f172a',
      shoesColor: '#18181b',
      hairStyle: 'fade',
      hairColor: '#94a3b8',
      accessory: 'glasses',
    },
    dialogueIntro: "Good day, scholar. Diligence precedes academic distinction.",
    dialogueLines: [
      "Welcome to the Faculty of Basic & Applied Sciences. Are you prepared for today's lecture?",
      "To maintain First-Class Honours, your CGPA must consistently remain above 4.50.",
      "The university library and IT center have all reference papers for your term thesis.",
    ],
    options: [
      {
        id: 'discuss_past_questions',
        label: 'Discuss Exam Past Questions',
        energyCost: 20,
        cgpaGain: 0.08,
        durationMinutes: 60,
        rewardText: '+0.08 CGPA • -20⚡',
        responseMessage: "Excellent inquiry. Always pay close attention to Section B on the exam syllabus.",
      },
      {
        id: 'submit_paper',
        label: 'Submit Mid-Term Research Paper',
        energyCost: 10,
        cgpaGain: 0.05,
        cashGain: 1500,
        rewardText: '+0.05 CGPA • +₦1,500 Academic Grant',
        responseMessage: "Very well structured paper! Your research methodology is commended.",
      },
      {
        id: 'academic_mentorship',
        label: 'Seek Honours Mentorship',
        energyCost: 15,
        cgpaGain: 0.04,
        moodGain: 10,
        durationMinutes: 45,
        rewardText: '+0.04 CGPA • +10 Mood',
        responseMessage: "Keep this determination, scholar. Liids University expects leaders of character.",
      },
    ],
  },

  {
    id: 'npc_mama_ronke',
    name: 'Mama Ronke (Food Vendor)',
    role: 'Main Cafeteria Food Hub Vendor',
    avatarIcon: '🍲',
    location: 'cafeteria',
    position: [0, 0, -2.4],
    rotation: 0,
    customization: {
      skinTone: '#8c5835',
      shirtColor: '#dc2626',
      shirtPattern: 'ankara',
      pantsColor: '#166534',
      shoesColor: '#ffffff',
      hairStyle: 'braids',
      hairColor: '#18181b',
      accessory: 'none',
    },
    dialogueIntro: "E kaabo, my student! Hot smoky party Jollof rice dey ready for you!",
    dialogueLines: [
      "Come chop food make body strong for reading! Food na fuel for first-class brain.",
      "We get hot Jollof, fried dodo, grilled peppered chicken, and chilled Zobo drink.",
      "God bless your studies my pikin, you go pass all your exams with flying colors!",
    ],
    options: [
      {
        id: 'buy_jollof',
        label: 'Buy Party Jollof & Dodo Plate',
        cost: 1500,
        energyGain: 40,
        moodGain: 25,
        durationMinutes: 20,
        rewardText: '+40⚡ • +25 Mood • -₦1,500',
        responseMessage: "Here is your steaming hot plate of Jollof rice with two big dodo! Enjoy am!",
      },
      {
        id: 'buy_zobo',
        label: 'Buy Chilled Cold Zobo Drink',
        cost: 500,
        energyGain: 20,
        moodGain: 15,
        durationMinutes: 10,
        rewardText: '+20⚡ • +15 Mood • -₦500',
        responseMessage: "Ice cold ginger-flavoured Zobo drink for you. Refreshing!",
      },
      {
        id: 'buy_combo',
        label: 'Executive Platter (Jollof + Asun + Drinks)',
        cost: 3000,
        energyGain: 65,
        moodGain: 45,
        durationMinutes: 30,
        rewardText: '+65⚡ • +45 Mood • -₦3,000',
        responseMessage: "Oya! Big boy platter served with hot peppered goat meat and fresh juice!",
      },
    ],
  },
  {
    id: 'npc_nurse_funke',
    name: 'Nurse Funke',
    role: 'Chief Nursing Officer',
    avatarIcon: '👩‍⚕️',
    location: 'medical_centre',
    position: [0, 0, 1.8],
    rotation: Math.PI,
    customization: {
      skinTone: '#6d4527',
      shirtColor: '#f8fafc', // Clinical White Nursing Uniform
      shirtPattern: 'plain',
      pantsColor: '#0284c7', // Medical Blue Scrubs Pants
      shoesColor: '#ffffff',
      hairStyle: 'braids',
      hairColor: '#18181b',
      accessory: 'glasses',
    },
    dialogueIntro: "Welcome to Liids University Medical Centre. Please sit down. How can we care for your health today, student?",
    dialogueLines: [
      "Exam stress is no joke! If you feel faint or dizzy, do not hesitate to report here immediately.",
      "Always drink clean water and avoid taking unnecessary all-nighters without proper nutrition.",
      "The University Clinic is equipped with oxygen concentrators, glucose infusions, and 24-hour emergency triage.",
    ],
    options: [
      {
        id: 'buy_glucose_drip',
        label: 'Buy Multivitamins / Glucose Drip',
        cost: 3500,
        energyGain: 40,
        moodGain: 20,
        durationMinutes: 30,
        rewardText: '+40⚡ • Removes Exhaustion • -₦3,500',
        responseMessage: "Administering oral glucose solution and therapeutic multivitamin injection. Your clinical stamina is rapidly recovering!",
      },
      {
        id: 'collect_medical_note',
        label: 'Collect Medical Exemption Note',
        cost: 5000,
        moodGain: 15,
        durationMinutes: 15,
        rewardText: 'Official Hospital Exemption Note • -₦5,000',
        responseMessage: "Doctor's certified Medical Exemption Note stamped and signed! You can present this at any academic tribunal or test inquiry.",
      },
      {
        id: 'vitals_check',
        label: 'Free Blood Pressure & Vitals Check',
        energyGain: 10,
        moodGain: 10,
        durationMinutes: 15,
        rewardText: '+10⚡ • +10 Mood • FREE',
        responseMessage: "BP is 118/76 mmHg. Resting pulse: 72 bpm. Temperature normal. You are medically fit for your coursework!",
      },
    ],
  },
  {
    id: 'npc_guesthouse_concierge',
    name: 'Mr. Babatunde (VIP Concierge)',
    role: 'Guesthouse Front Desk Manager',
    avatarIcon: '🛎️',
    location: 'guesthouse',
    position: [-2.2, 0, 1.5],
    rotation: Math.PI / 4,
    customization: {
      skinTone: '#452a17',
      shirtColor: '#1e293b', // Tailored Executive Navy Suit
      shirtPattern: 'plain',
      pantsColor: '#0f172a',
      shoesColor: '#18181b',
      hairStyle: 'short',
      hairColor: '#18181b',
      accessory: 'glasses',
    },
    dialogueIntro: "Good day, distinguished scholar. Welcome to the Liids University (LU) 5-Star Luxury Guesthouse & VIP Lodge.",
    dialogueLines: [
      "Our presidential and executive suites feature plush king-sized beds, Italian marble bath suites, and 24/7 room service.",
      "Whether lodging for a romantic date night or quiet luxury cramming, your comfort is guaranteed.",
      "Only the finest hospitality for Liids University royalty and esteemed guests.",
    ],
    options: [
      {
        id: 'book_luxury_suite',
        label: 'Book 5-Star VIP Suite (Soft Life)',
        cost: 45000,
        energyGain: 100,
        moodGain: 100,
        durationMinutes: 120,
        rewardText: 'Full 100% Recharge • +50 Popularity XP • -₦45,000',
        responseMessage: "Room keycard issued for Presidential Suite 101. Luxury duvet, mini-bar, and soft life activated! Sleep like royalty.",
      },
      {
        id: 'order_room_service',
        label: 'Order Gourmet Room Service Breakfast',
        cost: 8500,
        energyGain: 45,
        moodGain: 30,
        durationMinutes: 30,
        rewardText: '+45⚡ • +30 Mood • -₦8,500',
        responseMessage: "Continental eggs benedict, fresh orange juice, and hot buttered toast delivered to your bedside table!",
      },
    ],
  },
  {
    id: 'npc_coach_segun',
    name: 'Coach Segun',
    role: 'Varsity Athletics & Bet Manager',
    avatarIcon: '🧢',
    location: 'sports_arena',
    position: [4.2, 0, 3.8],
    rotation: -Math.PI / 3,
    customization: {
      skinTone: '#452a17',
      shirtColor: '#10b981', // Sporty Tracksuit Emerald
      shirtPattern: 'stripes',
      pantsColor: '#1e293b',
      shoesColor: '#ffffff',
      hairStyle: 'short',
      hairColor: '#18181b',
      accessory: 'cap',
    },
    dialogueIntro: "Welcome to LU Sports Arena! Ready to test your penalty strikes against the varsity keeper or place a winning ticket on our inter-faculty derbies?",
    dialogueLines: [
      "The Titans vs UI Pioneers derby is coming up this weekend! Odds on a home victory are looking juicy.",
      "A sharp striker keeps their eyes on the keeper's hips. Hit the corners with power and you can't lose!",
      "Campus Bet terminal pays out instantly into student wallets. Play responsibly and back your faculty!",
    ],
    options: [
      {
        id: 'start_shootout_option',
        label: 'Play 1v1 Penalty Shootout',
        energyCost: 15,
        moodGain: 15,
        durationMinutes: 15,
        rewardText: '2x Stake Payout • +30 Fitness XP',
        responseMessage: "Step up to the penalty spot! Pick your corner and unleash the strike!",
      },
      {
        id: 'open_betting_option',
        label: 'Open Campus Bet Terminal (1X2 Odds)',
        durationMinutes: 5,
        rewardText: 'Instant Wallet Payouts • Singles & ACCAs',
        responseMessage: "Terminal initialized! Check out today's fixtures and assemble your accumulator slip.",
      },
      {
        id: 'sprint_fitness_drill',
        label: 'High-Intensity Sprint Drill',
        energyCost: 20,
        moodGain: 20,
        durationMinutes: 20,
        rewardText: '+25 Fitness XP • +20 Mood • -20⚡',
        responseMessage: "Lap times looking rapid! Your cardiovascular stamina and speed increased!",
      },
    ],
  },
  {
    id: 'npc_keeper_tobi',
    name: 'Tobi "The Wall"',
    role: 'Varsity 1st-Choice Goalkeeper',
    avatarIcon: '🧤',
    location: 'sports_arena',
    position: [0, 0, -5.2],
    rotation: 0,
    customization: {
      skinTone: '#6d4527',
      shirtColor: '#facc15', // Neon Yellow Goalkeeper Jersey
      shirtPattern: 'plain',
      pantsColor: '#1e293b',
      shoesColor: '#0284c7',
      hairStyle: 'fade',
      hairColor: '#18181b',
      accessory: 'none',
    },
    dialogueIntro: "You think you can beat me from the spot? Nobody scores past Tobi at the LU Arena without serious technique!",
    dialogueLines: [
      "I've saved 8 out of 10 penalties in the Higher Education Cup this season. Put your money where your mouth is!",
      "Aim for the postage stamp if you dare, but watch your power or you'll sky it over the bar!",
    ],
    options: [
      {
        id: 'challenge_penalty_keeper',
        label: 'Challenge Tobi to 1v1 Shootout',
        energyCost: 15,
        durationMinutes: 15,
        rewardText: '₦1,000 to ₦20,000 Stake Duel',
        responseMessage: "Ball placed on the penalty spot! Let's see what you've got!",
      },
    ],
  },
  {
    id: 'npc_dj_spin',
    name: 'DJ Spin',
    role: 'Resident Campus DJ & Sound Curator',
    avatarIcon: '🎧',
    location: 'adeline_hall',
    position: [0, 0, -2.5],
    rotation: 0,
    customization: {
      skinTone: '#6d4527',
      shirtColor: '#ec4899',
      shirtPattern: 'plain',
      pantsColor: '#18181b',
      shoesColor: '#ffffff',
      hairStyle: 'dreads',
      hairColor: '#18181b',
      accessory: 'cap',
    },
    dialogueIntro: "Yo! Welcome to Adeline Beats booth! I'm DJ Spin, holding it down with the hottest Afrobeat anthems on campus. Need a song drop?",
    dialogueLines: [
      "Whether it's Amapiano log drums or classic Burna vibes, we keep the campus moving!",
      "Drop a ₦500 request tip and I'll spin whatever campus anthem you and your friends want to groove to.",
      "Lions Hall and Adeline Hall are the true nightlife pulse of Liids University (LU)!",
    ],
    options: [
      {
        id: 'request_music_track',
        label: 'Request a Track (₦500 Tip)',
        cost: 500,
        moodGain: 20,
        durationMinutes: 10,
        rewardText: 'DJ Plays Selected Afrobeat Jam • Avatars Dance',
        responseMessage: "Bet! Dropping your requested jam on the main system right now. Turn up!",
      },
    ],
  },
];
