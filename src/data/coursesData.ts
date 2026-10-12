export interface QuizOption {
  label: 'A' | 'B' | 'C';
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctIndex: number; // 0, 1, or 2
  explanation: string;
}

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
  overviewNotes: string[];
  quiz: QuizQuestion[];
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
  // ==========================================================================
  // 1. Mass Communication: Media & Broadcasting
  // ==========================================================================
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
        overviewNotes: [
          'The Inverted Pyramid is the golden rule of journalism: place the most critical information (Who, What, Where, When, Why) in the opening lead paragraph.',
          'Journalistic Objectivity requires separating personal opinion from verifiable factual reporting with multiple independent sources.',
          'Gatekeeping in newsrooms refers to the editorial process of deciding which stories reach the public based on news value, timeliness, and public interest.',
          'Off-the-record agreements mean information is provided solely for journalist context and cannot be quoted or attributed directly.',
        ],
        quiz: [
          {
            id: 'mac_1_q1',
            question: 'What is the primary rule of the Inverted Pyramid news writing structure?',
            options: [
              { label: 'A', text: 'Put the most critical news and facts in the opening lead paragraph' },
              { label: 'B', text: 'Save the biggest reveal for the final paragraph like a mystery novel' },
              { label: 'C', text: 'Write exclusively in chronological order starting from midnight' },
            ],
            correctIndex: 0,
            explanation: 'The Inverted Pyramid places the essential 5 Ws and H at the very top so readers immediately get key facts.',
          },
          {
            id: 'mac_1_q2',
            question: 'What does journalistic "Gatekeeping" refer to in a media house?',
            options: [
              { label: 'A', text: 'Locking studio gates after 6:00 PM for security' },
              { label: 'B', text: 'The editorial process of filtering and selecting which news stories get published' },
              { label: 'C', text: 'Charging citizens money before interviewing them on camera' },
            ],
            correctIndex: 1,
            explanation: 'Gatekeeping describes how editors and journalists evaluate, select, and filter news items before dissemination.',
          },
          {
            id: 'mac_1_q3',
            question: 'When a source gives information "Off the record", how must the journalist treat it?',
            options: [
              { label: 'A', text: 'Publish it immediately with the source’s full name in the headline' },
              { label: 'B', text: 'Use it strictly for context without quoting or directly attributing to the source' },
              { label: 'C', text: 'Post it anonymously on campus gossip blogs for clicks' },
            ],
            correctIndex: 1,
            explanation: 'Off-the-record information cannot be quoted or made public; it helps the reporter understand background context.',
          },
          {
            id: 'mac_1_q4',
            question: 'What distinguishes hard news from an editorial opinion piece?',
            options: [
              { label: 'A', text: 'Hard news focuses on verified factual reporting; editorials represent opinions or stance' },
              { label: 'B', text: 'Hard news is only printed on hard cardboard paper' },
              { label: 'C', text: 'Editorials never require any research or writing effort' },
            ],
            correctIndex: 0,
            explanation: 'Hard news provides unbiased factual reporting, whereas an editorial expresses institutional or personal commentary.',
          },
          {
            id: 'mac_1_q5',
            question: 'Which of the following is considered a core ethical breach for a professional journalist in Nigeria?',
            options: [
              { label: 'A', text: 'Accepting brown envelopes (cash bribes) to suppress or alter a story' },
              { label: 'B', text: 'Double-checking phone numbers of press sources before publishing' },
              { label: 'C', text: 'Recording studio audio interviews in a soundproof room' },
            ],
            correctIndex: 0,
            explanation: 'Accepting financial inducements ("brown envelopes") severely breaches journalistic integrity and objectivity.',
          },
        ],
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
        overviewNotes: [
          'Cardioid microphones pick up sound primarily from the front, rejecting ambient background noise—ideal for studio radio hosts.',
          'Decibel audio levels must remain below 0 dBFS to prevent digital clipping distortion and ear fatigue.',
          'The Station Clock (format wheel) divides every 60-minute hour into segments for news bulletins, commercials, music, and station IDs.',
          'Pop filters disperse explosive plosive consonants (P, B sounds) to protect microphone diaphragms.',
        ],
        quiz: [
          {
            id: 'mac_2_q1',
            question: 'Which microphone polar pattern is most suitable for a solo radio studio presenter to avoid ambient noise?',
            options: [
              { label: 'A', text: 'Omnidirectional (picks up sound equally from all directions)' },
              { label: 'B', text: 'Cardioid (picks up sound directly in front and rejects rear noise)' },
              { label: 'C', text: 'Figure-8 (picks up front and back equally)' },
            ],
            correctIndex: 1,
            explanation: 'Cardioid microphones focus on the presenter’s voice right in front of the mic capsule, suppressing room echoes.',
          },
          {
            id: 'mac_2_q2',
            question: 'What occurs when recorded audio peaks above 0 dBFS on a digital mixing soundboard?',
            options: [
              { label: 'A', text: 'Digital clipping and harsh harmonic distortion' },
              { label: 'B', text: 'The audio automatically converts into surround sound' },
              { label: 'C', text: 'The microphone battery becomes fully charged' },
            ],
            correctIndex: 0,
            explanation: 'Exceeding 0 dBFS in digital audio causes clipping, where waveform peaks are harshly truncated into distortion.',
          },
          {
            id: 'mac_2_q3',
            question: 'What is the purpose of a mesh pop filter positioned in front of a studio condenser microphone?',
            options: [
              { label: 'A', text: 'To soften explosive plosive air bursts from "P" and "B" sounds' },
              { label: 'B', text: 'To amplify the presenter’s pitch by two full octaves' },
              { label: 'C', text: 'To display the radio station’s logo to the studio audience' },
            ],
            correctIndex: 0,
            explanation: 'Pop filters diffuse rapid breath bursts from plosive letters, preventing low-frequency thumps in recordings.',
          },
          {
            id: 'mac_2_q4',
            question: 'In radio programming, what is a "Format Wheel" or "Station Clock"?',
            options: [
              { label: 'A', text: 'A visual schedule breaking down each hour into music, ads, news, and IDs' },
              { label: 'B', text: 'The wheel used by DJs to transport vinyl turntables between vans' },
              { label: 'C', text: 'A timer that cuts off power to the studio transmitters at sunset' },
            ],
            correctIndex: 0,
            explanation: 'A format wheel charts every minute of a 60-minute radio broadcast hour to guarantee broadcast discipline.',
          },
          {
            id: 'mac_2_q5',
            question: 'What technique involves lowering background music volume whenever the presenter starts speaking?',
            options: [
              { label: 'A', text: 'Audio Ducking / Sidechain Compression' },
              { label: 'B', text: 'Phasing Cancellation' },
              { label: 'C', text: 'Pitch Shifting' },
            ],
            correctIndex: 0,
            explanation: 'Audio ducking automatically attenuates background bed music so voice commentary remains clear and intelligible.',
          },
        ],
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
        overviewNotes: [
          'Defamation is classified into Libel (published in permanent form, such as print or broadcast) and Slander (transient spoken words).',
          'Section 39 of the 1999 Constitution of Nigeria guarantees freedom of expression and the press.',
          'The strongest defenses against a defamation lawsuit are Truth/Justification, Fair Comment on matters of public interest, and Qualified Privilege.',
          'Sub Judice rule restricts journalists from publishing commentary that could prejudice an active trial currently before a court.',
        ],
        quiz: [
          {
            id: 'mac_3_q1',
            question: 'What is the key legal distinction between Libel and Slander?',
            options: [
              { label: 'A', text: 'Libel is written/permanent defamation, while Slander is spoken/transient defamation' },
              { label: 'B', text: 'Libel only applies to politicians, while Slander applies to athletes' },
              { label: 'C', text: 'There is no difference; they are interchangeable legal terms' },
            ],
            correctIndex: 0,
            explanation: 'Libel is defamation in durable, recorded form (print, TV, audio, web), whereas Slander is transient oral defamation.',
          },
          {
            id: 'mac_3_q2',
            question: 'Which constitutional section provides the basis for freedom of expression and press in Nigeria?',
            options: [
              { label: 'A', text: 'Section 39 of the 1999 Constitution' },
              { label: 'B', text: 'Section 4 of the Police Act' },
              { label: 'C', text: 'Section 12 of the Land Use Decree' },
            ],
            correctIndex: 0,
            explanation: 'Section 39 of the Nigerian Constitution guarantees the right to freedom of expression and the press.',
          },
          {
            id: 'mac_3_q3',
            question: 'What is the absolute complete defense against a civil action for defamation in court?',
            options: [
              { label: 'A', text: 'Justification (proving the published statement is completely true in substance)' },
              { label: 'B', text: 'Claiming you copied the news from a popular WhatsApp group' },
              { label: 'C', text: 'Apologizing on social media three weeks after the trial starts' },
            ],
            correctIndex: 0,
            explanation: 'If a journalist can prove that the defamatory allegation is true in fact and substance, the defense of justification succeeds.',
          },
          {
            id: 'mac_3_q4',
            question: 'What does the "Sub Judice" legal doctrine caution journalists against doing?',
            options: [
              { label: 'A', text: 'Publishing commentary that could bias or prejudice a case actively under trial' },
              { label: 'B', text: 'Interviewing sports athletes after winning an international match' },
              { label: 'C', text: 'Taking photos outside court building hallways with permission' },
            ],
            correctIndex: 0,
            explanation: 'Sub judice prevents media trials from compromising judge or jury decisions on pending active court cases.',
          },
          {
            id: 'mac_3_q5',
            question: 'Why must journalists attribute controversial claims to named reputable sources?',
            options: [
              { label: 'A', text: 'To maintain credibility, accountability, and protect against unfounded liability' },
              { label: 'B', text: 'Because search engines do not rank articles without 50 names' },
              { label: 'C', text: 'To fill up extra column space when writing on slow news days' },
            ],
            correctIndex: 0,
            explanation: 'Attribution establishes evidentiary integrity and informs the audience about who is making the assertion.',
          },
        ],
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
        overviewNotes: [
          'Three-Point Lighting consists of Key Light (main illumination), Fill Light (softens harsh shadows), and Back Light (separates subject from background).',
          'The Rule of Thirds positions points of interest along the intersection points of a 3x3 grid for pleasing visual composition.',
          'White Balance calibrates the camera sensor to the color temperature of the lighting environment (e.g. 3200K tungsten vs 5600K daylight).',
          'Floor Managers communicate with television anchors using non-verbal standardized hand signals during live tapings.',
        ],
        quiz: [
          {
            id: 'mac_4_q1',
            question: 'What three light sources comprise standard television studio 3-Point Lighting?',
            options: [
              { label: 'A', text: 'Key Light, Fill Light, and Back Light' },
              { label: 'B', text: 'Flashlight, Ceiling Tube, and Candle' },
              { label: 'C', text: 'Red Light, Blue Light, and Green Strobe' },
            ],
            correctIndex: 0,
            explanation: 'Key provides primary light, Fill reduces contrast shadows, and Back light outlines the subject from behind.',
          },
          {
            id: 'mac_4_q2',
            question: 'How should an anchor read from a camera-mounted teleprompter naturally?',
            options: [
              { label: 'A', text: 'Blink rhythmically, maintain natural vocal inflections, and keep eye movements centered' },
              { label: 'B', text: 'Stare unblinkingly and point a finger directly at the glass lens' },
              { label: 'C', text: 'Read with a monotone voice while looking at the studio floor' },
            ],
            correctIndex: 0,
            explanation: 'Skilled anchors engage viewers by treating the lens as a conversational partner, avoiding robotic eye darting.',
          },
          {
            id: 'mac_4_q3',
            question: 'What is the "Rule of Thirds" in television framing and cinematography?',
            options: [
              { label: 'A', text: 'Dividing the screen into a 3x3 grid and placing key subjects along the grid lines' },
              { label: 'B', text: 'Only shooting three seconds of footage before cutting away' },
              { label: 'C', text: 'Allowing only three crew members inside the television control room' },
            ],
            correctIndex: 0,
            explanation: 'The Rule of Thirds creates balanced, visually compelling frames by aligning subjects with horizontal/vertical thirds.',
          },
          {
            id: 'mac_4_q4',
            question: 'Why must broadcast cameras be White Balanced before shooting in a new environment?',
            options: [
              { label: 'A', text: 'To calibrate true whites according to the color temperature of ambient lights' },
              { label: 'B', text: 'To wipe the camera memory card clean for today’s production' },
              { label: 'C', text: 'To brighten the video image by 500% regardless of shadows' },
            ],
            correctIndex: 0,
            explanation: 'Different light sources have varying color temperatures (tungsten vs daylight); white balance ensures accurate color reproduction.',
          },
          {
            id: 'mac_4_q5',
            question: 'When the floor manager draws a hand across the neck in a horizontal slice, what does this signal?',
            options: [
              { label: 'A', text: 'Cut immediately / Stop speaking' },
              { label: 'B', text: 'Speak faster / Speed up the delivery' },
              { label: 'C', text: 'Stand up and smile at the camera' },
            ],
            correctIndex: 0,
            explanation: 'The "throat slash" hand signal is the universal television cue meaning "Cut transmission" or stop speaking now.',
          },
        ],
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
        overviewNotes: [
          'Public Relations builds mutual goodwill and understanding between an organization and its publics, differing from paid advertising.',
          'In Crisis Communications, organizations must issue timely, transparent holding statements to curb misinformation and reputational harm.',
          'Cost Per Mille (CPM) measures advertising cost per 1,000 impressions or views delivered to an audience.',
          'Earned Media includes organic news coverage, press writeups, and viral word-of-mouth achieved without direct media buy costs.',
        ],
        quiz: [
          {
            id: 'mac_5_q1',
            question: 'What is the primary difference between Public Relations (PR) and Advertising?',
            options: [
              { label: 'A', text: 'PR earns editorial coverage and trust; advertising purchases paid space and total control' },
              { label: 'B', text: 'PR is exclusively practiced by government ministries, while ads are only on radio' },
              { label: 'C', text: 'PR is completely illegal in corporate businesses' },
            ],
            correctIndex: 0,
            explanation: 'Advertising is paid media with guaranteed placement; PR focuses on earned media through credibility and media relations.',
          },
          {
            id: 'mac_5_q2',
            question: 'What does the advertising metric "CPM" stand for in digital and print media planning?',
            options: [
              { label: 'A', text: 'Cost Per Mille (Cost per 1,000 impressions)' },
              { label: 'B', text: 'Customer Payment Method' },
              { label: 'C', text: 'Campaign Promotional Metric' },
            ],
            correctIndex: 0,
            explanation: 'Mille is Latin for thousand; CPM measures the financial cost required to reach 1,000 views or audience members.',
          },
          {
            id: 'mac_5_q3',
            question: 'During a sudden corporate crisis, what is the role of a PR "Holding Statement"?',
            options: [
              { label: 'A', text: 'A brief immediate response acknowledging the incident while full facts are verified' },
              { label: 'B', text: 'A contract forcing journalists to delete photos from their smartphones' },
              { label: 'C', text: 'A payment voucher issued to calm protesting shareholders' },
            ],
            correctIndex: 0,
            explanation: 'A holding statement acknowledges the event, expresses empathy, and prevents dangerous speculation while investigations proceed.',
          },
          {
            id: 'mac_5_q4',
            question: 'What is "Earned Media" in a public relations campaign?',
            options: [
              { label: 'A', text: 'Unpaid publicity gained through promotional efforts, news coverage, and customer buzz' },
              { label: 'B', text: 'Salary paid to TV cameramen at the end of each month' },
              { label: 'C', text: 'Commercials bought during primetime television matches' },
            ],
            correctIndex: 0,
            explanation: 'Earned media is third-party organic endorsement from journalists or consumers, carrying high credibility.',
          },
          {
            id: 'mac_5_q5',
            question: 'What standard section must conclude every official corporate press release?',
            options: [
              { label: 'A', text: 'Boilerplate (standard paragraph summarizing who the organization is and media contact info)' },
              { label: 'B', text: 'A recipe for campus Bukka jollof rice' },
              { label: 'C', text: 'A list of all personal staff email passwords' },
            ],
            correctIndex: 0,
            explanation: 'The boilerplate provides verified company background information and spokesperson contact details for press inquiries.',
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // 2. Doctor: Medicine & Surgery (MBBS)
  // ==========================================================================
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
        overviewNotes: [
          'Primum non nocere ("First, do no harm") is the foundational ethical premise of medical practice.',
          'The four pillars of medical ethics: Autonomy (respecting patient choice), Beneficence (acting in the patient’s best interest), Non-maleficence (preventing harm), and Justice (fair resource distribution).',
          'Informed Consent requires the patient to be mentally competent, fully informed of risks, and granting voluntary permission without coercion.',
          'Doctor-Patient Confidentiality must only be breached under explicit legal mandates (such as court subpoenas or reporting epidemic infectious threats).',
        ],
        quiz: [
          {
            id: 'med_1_q1',
            question: 'What is the core meaning of the foundational medical ethical maxim "Primum non nocere"?',
            options: [
              { label: 'A', text: 'First, do no harm' },
              { label: 'B', text: 'Always charge for prescription consultation' },
              { label: 'C', text: 'Never question a senior consultant’s diagnosis' },
            ],
            correctIndex: 0,
            explanation: '"Primum non nocere" reminds doctors to consider potential harms before intervening with surgical or pharmaceutical procedures.',
          },
          {
            id: 'med_1_q2',
            question: 'Which of the four pillars of biomedical ethics upholds a competent patient’s right to decline a treatment?',
            options: [
              { label: 'A', text: 'Autonomy' },
              { label: 'B', text: 'Beneficence' },
              { label: 'C', text: 'Justice' },
            ],
            correctIndex: 0,
            explanation: 'Autonomy establishes that competent adult patients possess the legal and moral authority to make their own healthcare decisions.',
          },
          {
            id: 'med_1_q3',
            question: 'What is required for Medical Informed Consent to be legally and ethically valid?',
            options: [
              { label: 'A', text: 'Voluntary agreement by a competent patient after full disclosure of risks and alternatives' },
              { label: 'B', text: 'A signed cheque presented to the hospital accountant' },
              { label: 'C', text: 'Verbal consent obtained while the patient is under deep general anesthesia' },
            ],
            correctIndex: 0,
            explanation: 'Informed consent requires cognitive competence, clear comprehension of risks, and unforced voluntary decision-making.',
          },
          {
            id: 'med_1_q4',
            question: 'Under which of the following circumstances may a physician ethically breach doctor-patient confidentiality?',
            options: [
              { label: 'A', text: 'When the patient poses an imminent, life-threatening danger to others or has a notifiable epidemic disease' },
              { label: 'B', text: 'When chatting with hostel roommates over cafeteria lunch' },
              { label: 'C', text: 'Whenever a local journalist offers payment for patient records' },
            ],
            correctIndex: 0,
            explanation: 'Confidentiality may be overridden strictly when public safety is critically endangered or mandated by statutory public health laws.',
          },
          {
            id: 'med_1_q5',
            question: 'What does the ethical principle of "Justice" govern in clinical practice?',
            options: [
              { label: 'A', text: 'Fair, equitable distribution of healthcare resources without discrimination' },
              { label: 'B', text: 'Arresting patients who forget their appointment dates' },
              { label: 'C', text: 'Ensuring private hospital suites are reserved for wealthy patrons' },
            ],
            correctIndex: 0,
            explanation: 'Justice mandates fair allocation of scarce medical resources and non-discriminatory patient treatment.',
          },
        ],
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
        overviewNotes: [
          'The human body in anatomical position stands erect, facing forward, arms at sides with palms turned forward.',
          'The Femur is the longest, heaviest, and strongest bone in the human body.',
          'The human skeletal system divides into the Axial skeleton (skull, vertebral column, ribs, sternum - 80 bones) and Appendicular skeleton (limbs and girdles - 126 bones).',
          'Tendons attach muscles to bones, while Ligaments connect bones to other bones at articular joints.',
        ],
        quiz: [
          {
            id: 'med_2_q1',
            question: 'What is the longest, heaviest, and strongest bone in the adult human body?',
            options: [
              { label: 'A', text: 'Femur (thigh bone)' },
              { label: 'B', text: 'Tibia (shin bone)' },
              { label: 'C', text: 'Humerus (upper arm bone)' },
            ],
            correctIndex: 0,
            explanation: 'The femur bears substantial mechanical body weight and is both the longest and strongest human bone.',
          },
          {
            id: 'med_2_q2',
            question: 'What tissue connects skeletal muscle directly to bone to transfer kinetic force?',
            options: [
              { label: 'A', text: 'Tendon' },
              { label: 'B', text: 'Ligament' },
              { label: 'C', text: 'Cartilage disc' },
            ],
            correctIndex: 0,
            explanation: 'Tendons attach muscles to bones, whereas ligaments connect bone to bone across articular joints.',
          },
          {
            id: 'med_2_q3',
            question: 'Which of the following bones belongs to the Axial Skeleton?',
            options: [
              { label: 'A', text: 'Sternum (breastbone)' },
              { label: 'B', text: 'Radius (forearm)' },
              { label: 'C', text: 'Femur (thigh)' },
            ],
            correctIndex: 0,
            explanation: 'The axial skeleton forms the central longitudinal axis, including the skull, spine, ribs, and sternum.',
          },
          {
            id: 'med_2_q4',
            question: 'In the standard anatomical position, how are the palms of the hands oriented?',
            options: [
              { label: 'A', text: 'Facing anteriorly (forward)' },
              { label: 'B', text: 'Facing posteriorly (backward)' },
              { label: 'C', text: 'Turned inwards touching the thighs' },
            ],
            correctIndex: 0,
            explanation: 'In the universal anatomical reference position, the subject stands upright with palms facing anteriorly (forward).',
          },
          {
            id: 'med_2_q5',
            question: 'Which vital organ is located predominantly in the right upper quadrant (RUQ) of the human abdomen?',
            options: [
              { label: 'A', text: 'Liver' },
              { label: 'B', text: 'Spleen' },
              { label: 'C', text: 'Descending Colon' },
            ],
            correctIndex: 0,
            explanation: 'The liver occupies the bulk of the right upper quadrant beneath the right hemidiaphragm.',
          },
        ],
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
        overviewNotes: [
          'Red blood cells (Erythrocytes) utilize iron-containing Hemoglobin to transport oxygen from lungs to systemic tissues.',
          'Normal resting adult blood pressure is clinically benchmarked around 120/80 mmHg (systolic/diastolic).',
          'The Sinoatrial (SA) Node in the right atrium serves as the natural electrical pacemaker of the heart.',
          'Type O-negative blood is regarded as the universal red blood cell donor because it lacks A, B, and Rh surface antigens.',
        ],
        quiz: [
          {
            id: 'med_3_q1',
            question: 'What is the primary physiological function of hemoglobin inside red blood cells (erythrocytes)?',
            options: [
              { label: 'A', text: 'Reversibly binding and transporting oxygen to tissues' },
              { label: 'B', text: 'Filtering nitrogenous urea waste through glomeruli' },
              { label: 'C', text: 'Synthesizing digestive bile salts for emulsification' },
            ],
            correctIndex: 0,
            explanation: 'Hemoglobin binds oxygen molecules in pulmonary capillaries and releases them into metabolizing peripheral tissues.',
          },
          {
            id: 'med_3_q2',
            question: 'What anatomical structure functions as the primary electrical pacemaker of the normal human heart?',
            options: [
              { label: 'A', text: 'Sinoatrial (SA) Node' },
              { label: 'B', text: 'Atrioventricular (AV) Node' },
              { label: 'C', text: 'Purkinje Fibres' },
            ],
            correctIndex: 0,
            explanation: 'The SA node in the right atrial wall spontaneously depolarizes at 60-100 beats per minute, pacing normal sinus rhythm.',
          },
          {
            id: 'med_3_q3',
            question: 'Which blood group is universally accepted for emergency red blood cell transfusions when typing is pending?',
            options: [
              { label: 'A', text: 'O Negative (O-)' },
              { label: 'B', text: 'AB Positive (AB+)' },
              { label: 'C', text: 'A Positive (A+)' },
            ],
            correctIndex: 0,
            explanation: 'O-negative RBCs lack A, B, and Rh D surface antigens, preventing acute hemolytic transfusion reactions.',
          },
          {
            id: 'med_3_q4',
            question: 'What represents the normal resting heart rate range for a healthy adult at rest?',
            options: [
              { label: 'A', text: '60 to 100 beats per minute' },
              { label: 'B', text: '120 to 160 beats per minute' },
              { label: 'C', text: '20 to 40 beats per minute' },
            ],
            correctIndex: 0,
            explanation: 'A normal resting pulse is between 60 and 100 bpm; below 60 is bradycardia, and above 100 is tachycardia.',
          },
          {
            id: 'med_3_q5',
            question: 'What active membrane protein maintains the resting membrane potential in human neurons and muscle cells?',
            options: [
              { label: 'A', text: 'Sodium-Potassium ATPase pump (Na+/K+ pump)' },
              { label: 'B', text: 'Calcium Hydroxide Channel' },
              { label: 'C', text: 'Glucose Permease Valve' },
            ],
            correctIndex: 0,
            explanation: 'The Na+/K+ pump pumps 3 Na+ ions out for every 2 K+ ions pumped in, maintaining cellular electronegativity.',
          },
        ],
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
        overviewNotes: [
          'Adenosine Triphosphate (ATP) is the primary cellular chemical currency used to power cellular reactions.',
          'Glycolysis occurs in the cytoplasm, breaking down 1 glucose molecule into 2 pyruvate molecules under anaerobic or aerobic conditions.',
          'Enzymes accelerate biological biochemical reactions by lowering the activation energy barrier without being consumed.',
          'Insulin is secreted by pancreatic beta cells to facilitate cellular glucose uptake and glycogen storage.',
        ],
        quiz: [
          {
            id: 'med_4_q1',
            question: 'What universal biochemical molecule serves as the direct energy currency for human cellular work?',
            options: [
              { label: 'A', text: 'Adenosine Triphosphate (ATP)' },
              { label: 'B', text: 'Cholesterol Ester' },
              { label: 'C', text: 'Ribonucleic Acid (RNA)' },
            ],
            correctIndex: 0,
            explanation: 'ATP hydrolysis into ADP + Pi releases chemical free energy utilized for muscular contraction and active ion transport.',
          },
          {
            id: 'med_4_q2',
            question: 'Where inside the human cell does the process of Glycolysis take place?',
            options: [
              { label: 'A', text: 'Cytoplasm (Cytosol)' },
              { label: 'B', text: 'Mitochondrial Matrix' },
              { label: 'C', text: 'Nucleolus' },
            ],
            correctIndex: 0,
            explanation: 'Glycolysis occurs entirely within the cytosol, whereas the Citric Acid Cycle occurs inside mitochondria.',
          },
          {
            id: 'med_4_q3',
            question: 'How do biological enzymes accelerate metabolic chemical reactions in human biochemistry?',
            options: [
              { label: 'A', text: 'By lowering the activation energy required for the transition state' },
              { label: 'B', text: 'By increasing the core body temperature up to 60°C' },
              { label: 'C', text: 'By permanently destroying substrate molecules into gas' },
            ],
            correctIndex: 0,
            explanation: 'Enzymes stabilize reaction transition states, lowering the energy hurdle required for reactants to become products.',
          },
          {
            id: 'med_4_q4',
            question: 'Which pancreatic hormone stimulates peripheral cells to absorb glucose from circulating blood?',
            options: [
              { label: 'A', text: 'Insulin (secreted by beta cells)' },
              { label: 'B', text: 'Glucagon (secreted by alpha cells)' },
              { label: 'C', text: 'Thyroxine (secreted by thyroid)' },
            ],
            correctIndex: 0,
            explanation: 'Insulin promotes GLUT-4 transporter translocation, clearing postprandial glucose into skeletal muscle and adipose tissue.',
          },
          {
            id: 'med_4_q5',
            question: 'What elevated enzyme is clinically assessed as a hallmark biomarker of acute myocardial infarction (heart attack)?',
            options: [
              { label: 'A', text: 'Cardiac Troponin (cTnI / cTnT)' },
              { label: 'B', text: 'Salivary Amylase' },
              { label: 'C', text: 'Pepsinogen II' },
            ],
            correctIndex: 0,
            explanation: 'Cardiac troponins are highly sensitive and specific intracellular cardiac proteins released into circulation upon myocardial necrosis.',
          },
        ],
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
        overviewNotes: [
          'The four cardinal vital signs are Blood Pressure, Heart Rate, Respiratory Rate, and Core Body Temperature (often with Oxygen Saturation SpO2 as the 5th).',
          'The Stethoscope diaphragm is designed to transmit high-pitched sounds (lung sounds, normal heart sounds), while the bell captures low-pitched sounds (gallops, murmurs).',
          'Normal adult resting respiratory rate is 12 to 20 breaths per minute.',
          'The four classical steps of physical examination are Inspection, Palpation, Percussion, and Auscultation (in abdominal exams, auscultation precedes palpation to avoid falsifying bowel sounds).',
        ],
        quiz: [
          {
            id: 'med_5_q1',
            question: 'What is the correct sequence of examination in a systematic clinical abdominal exam?',
            options: [
              { label: 'A', text: 'Inspection ➔ Auscultation ➔ Percussion ➔ Palpation' },
              { label: 'B', text: 'Deep Palpation ➔ Vigorous Percussion ➔ Inspection ➔ Auscultation' },
              { label: 'C', text: 'Auscultation ➔ Discharge ➔ Prescription ➔ Inspection' },
            ],
            correctIndex: 0,
            explanation: 'In the abdomen, auscultation must precede palpation and percussion so manual pressure does not distort intestinal peristaltic bowel sounds.',
          },
          {
            id: 'med_5_q2',
            question: 'When measuring blood pressure with an inflatable sphygmomanometer cuff, which artery is compressed and auscultated?',
            options: [
              { label: 'A', text: 'Brachial Artery' },
              { label: 'B', text: 'Femoral Artery' },
              { label: 'C', text: 'Carotid Artery' },
            ],
            correctIndex: 0,
            explanation: 'The blood pressure cuff is placed over the upper arm to compress the brachial artery in the antecubital fossa.',
          },
          {
            id: 'med_5_q3',
            question: 'What does an adult core body temperature of 38.5°C (101.3°F) clinically indicate?',
            options: [
              { label: 'A', text: 'Pyrexia (Fever)' },
              { label: 'B', text: 'Hypothermia' },
              { label: 'C', text: 'Normal baseline temperature' },
            ],
            correctIndex: 0,
            explanation: 'Normal body temperature is approximately 36.5°C to 37.5°C. A reading of 38.5°C indicates pyrexia (fever).',
          },
          {
            id: 'med_5_q4',
            question: 'What part of the stethoscope chestpiece is primarily utilized for detecting high-pitched breath and heart sounds?',
            options: [
              { label: 'A', text: 'The flat, wide Diaphragm' },
              { label: 'B', text: 'The cupped Bell' },
              { label: 'C', text: 'The rubber earpieces' },
            ],
            correctIndex: 0,
            explanation: 'The diaphragm transmits higher-frequency sounds like S1/S2 heart sounds and vesicular breath sounds.',
          },
          {
            id: 'med_5_q5',
            question: 'What is the normal adult respiratory rate at rest?',
            options: [
              { label: 'A', text: '12 to 20 breaths per minute' },
              { label: 'B', text: '35 to 50 breaths per minute' },
              { label: 'C', text: '3 to 6 breaths per minute' },
            ],
            correctIndex: 0,
            explanation: 'Healthy adult eupnea (normal quiet breathing) ranges from 12 to 20 cycles per minute.',
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // 3. Software Engineer: Computer Science & Computing
  // ==========================================================================
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
        overviewNotes: [
          'Big-O notation describes the upper bound of execution time or memory space as input size n grows asymptotically.',
          'Binary Search divides a sorted array in half repeatedly, achieving logarithmic time complexity of O(log n).',
          'A recursive function must have at least one base case that terminates recursion to avoid infinite call stack overflow.',
          'Fundamental Boolean logic gates: AND requires all inputs true, OR requires at least one true, and NOT inverts the input.',
        ],
        quiz: [
          {
            id: 'csc_1_q1',
            question: 'What is the worst-case time complexity of Binary Search on a sorted array of n items?',
            options: [
              { label: 'A', text: 'O(log n)' },
              { label: 'B', text: 'O(n²)' },
              { label: 'C', text: 'O(n!)' },
            ],
            correctIndex: 0,
            explanation: 'Binary Search halves the search space at each iteration, resulting in logarithmic O(log n) time.',
          },
          {
            id: 'csc_1_q2',
            question: 'What will be the output of a two-input AND logic gate when inputs are A=1 (True) and B=0 (False)?',
            options: [
              { label: 'A', text: '0 (False)' },
              { label: 'B', text: '1 (True)' },
              { label: 'C', text: 'Null / Undefined' },
            ],
            correctIndex: 0,
            explanation: 'An AND gate only outputs 1 when all of its inputs are 1. Since B is 0, the output is 0.',
          },
          {
            id: 'csc_1_q3',
            question: 'Why must every recursive algorithm include a well-defined "Base Case"?',
            options: [
              { label: 'A', text: 'To terminate the recursive calls and prevent a stack overflow error' },
              { label: 'B', text: 'To accelerate the CPU clock speed above 5.0 GHz' },
              { label: 'C', text: 'To convert all integer variables into double precision floats' },
            ],
            correctIndex: 0,
            explanation: 'Without a base case, recursive functions call themselves indefinitely until memory call stack overflows.',
          },
          {
            id: 'csc_1_q4',
            question: 'What is the binary (base-2) equivalent of decimal number 13?',
            options: [
              { label: 'A', text: '1101' },
              { label: 'B', text: '1011' },
              { label: 'C', text: '1110' },
            ],
            correctIndex: 0,
            explanation: '13 in base 2 is 8 + 4 + 0 + 1 = 1101₂.',
          },
          {
            id: 'csc_1_q5',
            question: 'What does an algorithm with O(1) time complexity signify?',
            options: [
              { label: 'A', text: 'Constant time: execution takes the same time regardless of input size n' },
              { label: 'B', text: 'It can only execute on a single CPU core' },
              { label: 'C', text: 'It requires exactly one megabyte of RAM' },
            ],
            correctIndex: 0,
            explanation: 'O(1) signifies constant time complexity; performance does not degrade as the dataset grows.',
          },
        ],
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
        overviewNotes: [
          'Stack memory provides automatic, fast LIFO (Last-In, First-Out) allocation for local function frames.',
          'Heap memory provides dynamic, manually managed (or garbage-collected) memory for variables with lifespans beyond function returns.',
          'Hash Tables achieve average O(1) time complexity for insertions and lookups by mapping keys via a hash function.',
          'Linked Lists allow efficient O(1) head insertions without contiguous block reallocation, unlike contiguous arrays.',
        ],
        quiz: [
          {
            id: 'csc_2_q1',
            question: 'Which fundamental data structure operates strictly on a Last-In, First-Out (LIFO) protocol?',
            options: [
              { label: 'A', text: 'Stack' },
              { label: 'B', text: 'Queue' },
              { label: 'C', text: 'Binary Tree' },
            ],
            correctIndex: 0,
            explanation: 'A Stack pushes and pops items from the top, strictly observing LIFO ordering.',
          },
          {
            id: 'csc_2_q2',
            question: 'What is the average time complexity to look up a key in a well-balanced Hash Table?',
            options: [
              { label: 'A', text: 'O(1)' },
              { label: 'B', text: 'O(n)' },
              { label: 'C', text: 'O(n²)' },
            ],
            correctIndex: 0,
            explanation: 'Hash functions map keys directly to array buckets, providing O(1) constant time lookups on average.',
          },
          {
            id: 'csc_2_q3',
            question: 'What is the key difference between Stack memory and Heap memory in operating system execution?',
            options: [
              { label: 'A', text: 'Stack is fast and automatically managed for function calls; Heap is dynamic and flexible' },
              { label: 'B', text: 'Stack stores files on hard drives; Heap stores files in cloud servers' },
              { label: 'C', text: 'Stack memory can only store strings, while Heap stores only integers' },
            ],
            correctIndex: 0,
            explanation: 'Stack memory handles local execution frames rapidly, whereas Heap provides dynamically allocated memory.',
          },
          {
            id: 'csc_2_q4',
            question: 'What problem occurs when dynamically allocated Heap memory is never deallocated or freed in C/C++?',
            options: [
              { label: 'A', text: 'Memory Leak' },
              { label: 'B', text: 'Kernel Panic Cache' },
              { label: 'C', text: 'Deadlock Inversion' },
            ],
            correctIndex: 0,
            explanation: 'Unfreed heap allocations accumulate over time, wasting RAM in what is known as a memory leak.',
          },
          {
            id: 'csc_2_q5',
            question: 'What is the primary advantage of a Doubly Linked List over a Singly Linked List?',
            options: [
              { label: 'A', text: 'Bidirectional traversal (can traverse forward and backward)' },
              { label: 'B', text: 'Uses 50% less RAM memory than an array' },
              { label: 'C', text: 'Guarantees automatic sorting of all elements' },
            ],
            correctIndex: 0,
            explanation: 'Each node in a doubly linked list stores both next and previous pointers, enabling bidirectional navigation.',
          },
        ],
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
        overviewNotes: [
          'Encapsulation bundles data and methods that operate on that data inside a class while restricting direct access from outside.',
          'Polymorphism allows subclasses to provide specific implementations of methods defined by superclasses or interfaces.',
          'The Single Responsibility Principle (SRP) dictates that a software module or class should have one, and only one, reason to change.',
          'An Interface specifies what methods a class must implement without defining concrete implementation details.',
        ],
        quiz: [
          {
            id: 'csc_3_q1',
            question: 'Which core OOP pillar hides the internal state of an object and enforces access through public getters/setters?',
            options: [
              { label: 'A', text: 'Encapsulation' },
              { label: 'B', text: 'Recursion' },
              { label: 'C', text: 'Compilation' },
            ],
            correctIndex: 0,
            explanation: 'Encapsulation safeguards internal object fields from unintended modification by exposing controlled interfaces.',
          },
          {
            id: 'csc_3_q2',
            question: 'In the SOLID software principles, what does the "S" stand for?',
            options: [
              { label: 'A', text: 'Single Responsibility Principle' },
              { label: 'B', text: 'Static State Protection' },
              { label: 'C', text: 'Synchronous Processing' },
            ],
            correctIndex: 0,
            explanation: 'The Single Responsibility Principle states that a class should do one job and have only one reason to change.',
          },
          {
            id: 'csc_3_q3',
            question: 'What concept allows a single function name or method to execute different behaviors depending on the receiving object type?',
            options: [
              { label: 'A', text: 'Polymorphism' },
              { label: 'B', text: 'Normalization' },
              { label: 'C', text: 'De-allocation' },
            ],
            correctIndex: 0,
            explanation: 'Polymorphism allows derived classes to override base methods (e.g., shape.draw() behaving differently for Circle and Square).',
          },
          {
            id: 'csc_3_q4',
            question: 'What is the key difference between an Interface and an Abstract Class in object-oriented programming?',
            options: [
              { label: 'A', text: 'An interface defines method signatures only; an abstract class can contain concrete implemented code' },
              { label: 'B', text: 'Interfaces can only be instantiated with the new keyword directly' },
              { label: 'C', text: 'Abstract classes cannot have any constructors or member variables' },
            ],
            correctIndex: 0,
            explanation: 'Interfaces define a pure contract of methods, whereas abstract classes can share default implemented code.',
          },
          {
            id: 'csc_3_q5',
            question: 'What design pattern ensures a class has only one single instance globally accessible throughout an application?',
            options: [
              { label: 'A', text: 'Singleton Pattern' },
              { label: 'B', text: 'Observer Pattern' },
              { label: 'C', text: 'Factory Method' },
            ],
            correctIndex: 0,
            explanation: 'The Singleton pattern restricts instantiation of a class to a single global instance.',
          },
        ],
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
        overviewNotes: [
          'A Primary Key uniquely identifies each row in a database table and cannot contain NULL values.',
          'Foreign Keys enforce referential integrity between linked relational database tables.',
          'ACID properties (Atomicity, Consistency, Isolation, Durability) guarantee reliable database transactions even through crashes.',
          'Database Normalization (1NF, 2NF, 3NF) eliminates redundant data anomalies and prevents update discrepancies.',
        ],
        quiz: [
          {
            id: 'csc_4_q1',
            question: 'Which constraint ensures that every record in a database table has a unique, non-null identity?',
            options: [
              { label: 'A', text: 'Primary Key' },
              { label: 'B', text: 'Check Constraint' },
              { label: 'C', text: 'Foreign Default' },
            ],
            correctIndex: 0,
            explanation: 'Primary keys uniquely identify rows in a table and forbid null values.',
          },
          {
            id: 'csc_4_q2',
            question: 'In transactional database systems, what does the "A" in ACID represent?',
            options: [
              { label: 'A', text: 'Atomicity (all operations succeed together or all roll back)' },
              { label: 'B', text: 'Asynchronous (operations happen in the background)' },
              { label: 'C', text: 'Authentication (user must enter a password)' },
            ],
            correctIndex: 0,
            explanation: 'Atomicity guarantees that a multi-step transaction completes entirely or is rolled back completely if any step fails.',
          },
          {
            id: 'csc_4_q3',
            question: 'Which SQL keyword is used to eliminate duplicate rows from the query result set?',
            options: [
              { label: 'A', text: 'DISTINCT' },
              { label: 'B', text: 'UNIQUE_ONLY' },
              { label: 'C', text: 'FILTER' },
            ],
            correctIndex: 0,
            explanation: 'SELECT DISTINCT returns only unique values across the specified columns.',
          },
          {
            id: 'csc_4_q4',
            question: 'What is the purpose of adding a B-Tree Index to a frequently queried database column?',
            options: [
              { label: 'A', text: 'To dramatically speed up data retrieval and WHERE clause lookups' },
              { label: 'B', text: 'To encrypt the column so hackers cannot read it' },
              { label: 'C', text: 'To compress the hard drive storage size by 90%' },
            ],
            correctIndex: 0,
            explanation: 'Indexes create ordered reference structures that allow the query planner to avoid full table scans.',
          },
          {
            id: 'csc_4_q5',
            question: 'What requirement must a relational table meet to satisfy First Normal Form (1NF)?',
            options: [
              { label: 'A', text: 'All column values must be atomic (no repeating groups or arrays in single cells)' },
              { label: 'B', text: 'All table names must be typed in capital letters' },
              { label: 'C', text: 'Every table must have at least ten columns' },
            ],
            correctIndex: 0,
            explanation: '1NF requires that each column contains indivisible atomic values and that each record is unique.',
          },
        ],
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
        overviewNotes: [
          'RESTful APIs use HTTP methods semantics: GET for reading, POST for creating, PUT for updating, and DELETE for removing resources.',
          'HTTP status code series: 2xx represents Success, 4xx represents Client Error (e.g. 404 Not Found), and 5xx represents Server Error.',
          'Cross-Origin Resource Sharing (CORS) is a browser security mechanism that restricts resources requested from another domain.',
          'JSON (JavaScript Object Notation) is a lightweight, human-readable format for serializing structured data across networks.',
        ],
        quiz: [
          {
            id: 'csc_5_q1',
            question: 'What HTTP response status code indicates that the requested web resource could not be found on the server?',
            options: [
              { label: 'A', text: '404 Not Found' },
              { label: 'B', text: '200 OK' },
              { label: 'C', text: '500 Internal Server Error' },
            ],
            correctIndex: 0,
            explanation: 'HTTP 404 indicates that the client was able to communicate with the server, but the requested endpoint does not exist.',
          },
          {
            id: 'csc_5_q2',
            question: 'Which HTTP method is semantically designed to retrieve data without altering server state?',
            options: [
              { label: 'A', text: 'GET' },
              { label: 'B', text: 'POST' },
              { label: 'C', text: 'DELETE' },
            ],
            correctIndex: 0,
            explanation: 'HTTP GET is a safe, idempotent method intended strictly for reading and retrieving resources.',
          },
          {
            id: 'csc_5_q3',
            question: 'What browser security policy restricts client web pages from requesting APIs hosted on different domains?',
            options: [
              { label: 'A', text: 'CORS (Cross-Origin Resource Sharing)' },
              { label: 'B', text: 'DNS Routing' },
              { label: 'C', text: 'TCP Handshake' },
            ],
            correctIndex: 0,
            explanation: 'CORS governs cross-domain HTTP requests and prevents malicious scripts from accessing sensitive endpoints.',
          },
          {
            id: 'csc_5_q4',
            question: 'Why is JSON preferred over XML in modern REST APIs?',
            options: [
              { label: 'A', text: 'It is lightweight, concise, and maps directly to native JavaScript data types' },
              { label: 'B', text: 'It cannot be read or intercepted by internet routers' },
              { label: 'C', text: 'It requires zero bandwidth to transmit across fibers' },
            ],
            correctIndex: 0,
            explanation: 'JSON is compact, human-readable, and parsed natively in modern programming languages without heavy XML parsers.',
          },
          {
            id: 'csc_5_q5',
            question: 'What is the role of a JWT (JSON Web Token) in modern web applications?',
            options: [
              { label: 'A', text: 'Stateless transmission of cryptographically signed user authentication claims' },
              { label: 'B', text: 'Compressing large video files for faster streaming' },
              { label: 'C', text: 'Converting JavaScript code into machine binary code' },
            ],
            correctIndex: 0,
            explanation: 'JWTs allow servers to authenticate user identity securely across distributed services without central session lookups.',
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // 4. Faculty of Law: Barrister & Solicitor
  // ==========================================================================
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
        overviewNotes: [
          'The Nigerian Legal System draws from Nigerian Legislation, Received English Law (Common Law, Equity, Statutes of General Application), Customary Law, and Judicial Precedent.',
          'The Supreme Court of Nigeria is the apex court; its decisions are binding on all subordinate courts across the federation.',
          'Stare Decisis (Judicial Precedent) requires lower courts to follow legal principles decided in earlier cases by superior courts.',
          'Equity was developed to mitigate the rigid technicalities and harshness of English Common Law.',
        ],
        quiz: [
          {
            id: 'law_1_q1',
            question: 'What is the apex and final court of appeal in the Nigerian judicial hierarchy?',
            options: [
              { label: 'A', text: 'Supreme Court of Nigeria' },
              { label: 'B', text: 'Court of Appeal' },
              { label: 'C', text: 'Federal High Court' },
            ],
            correctIndex: 0,
            explanation: 'The Supreme Court of Nigeria is the highest court in the nation; its decisions are final and binding.',
          },
          {
            id: 'law_1_q2',
            question: 'What legal doctrine compels lower courts to follow the decisions of higher courts in similar cases?',
            options: [
              { label: 'A', text: 'Stare Decisis (Judicial Precedent)' },
              { label: 'B', text: 'Habeas Corpus' },
              { label: 'C', text: 'Ultra Vires' },
            ],
            correctIndex: 0,
            explanation: 'Stare decisis promotes legal certainty by requiring courts to stand by established judicial precedents.',
          },
          {
            id: 'law_1_q3',
            question: 'Which of the following is NOT one of the traditional sources of Nigerian law?',
            options: [
              { label: 'A', text: 'Twitter/X opinion polls' },
              { label: 'B', text: 'The Constitution and Nigerian statutes' },
              { label: 'C', text: 'Customary law and judicial precedents' },
            ],
            correctIndex: 0,
            explanation: 'Social media opinions hold no judicial weight; Nigerian law derives from statutes, received English law, customary law, and precedent.',
          },
          {
            id: 'law_1_q4',
            question: 'Why was the body of law known as "Equity" developed alongside Common Law?',
            options: [
              { label: 'A', text: 'To soften the harshness and procedural rigidity of the common law writ system' },
              { label: 'B', text: 'To allow landlords to evict tenants without court orders' },
              { label: 'C', text: 'To abolish all written laws in England' },
            ],
            correctIndex: 0,
            explanation: 'Equity was established by the Court of Chancery to deliver natural fairness where common law remedies were deficient.',
          },
          {
            id: 'law_1_q5',
            question: 'What must be proven for a Customary Law rule to be enforceable in a Nigerian court?',
            options: [
              { label: 'A', text: 'It must not be repugnant to natural justice, equity, and good conscience' },
              { label: 'B', text: 'It must be written in Latin on parchment scrolls' },
              { label: 'C', text: 'It must be ratified by the British Parliament' },
            ],
            correctIndex: 0,
            explanation: 'The repugnancy test invalidates customary laws that conflict with fundamental human rights or natural justice.',
          },
        ],
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
        overviewNotes: [
          'Section 1(1) of the 1999 Constitution establishes Constitutional Supremacy: any law inconsistent with the Constitution is void to the extent of its inconsistency.',
          'Chapter IV of the Constitution enshrines Fundamental Rights: Right to Life, Dignity of Human Person, Personal Liberty, and Fair Hearing.',
          'The Doctrine of Separation of Powers divides government authority among the Legislature (makes law), Executive (enforces law), and Judiciary (interprets law).',
          'Judicial Review empowers courts to strike down ultra vires executive actions or unconstitutional legislative enactments.',
        ],
        quiz: [
          {
            id: 'law_2_q1',
            question: 'What happens if a state or federal statute conflicts with a provision of the 1999 Nigerian Constitution?',
            options: [
              { label: 'A', text: 'The statute is void to the extent of its inconsistency with the Constitution' },
              { label: 'B', text: 'The Constitution is automatically amended to accommodate the statute' },
              { label: 'C', text: 'The Governor decides which document to follow' },
            ],
            correctIndex: 0,
            explanation: 'By Section 1(3) of the 1999 Constitution, the Constitution is supreme and overrides any conflicting enactment.',
          },
          {
            id: 'law_2_q2',
            question: 'Which chapter of the 1999 Constitution of Nigeria contains Fundamental Rights?',
            options: [
              { label: 'A', text: 'Chapter IV' },
              { label: 'B', text: 'Chapter I' },
              { label: 'C', text: 'Chapter VIII' },
            ],
            correctIndex: 0,
            explanation: 'Chapter IV contains the codified Fundamental Rights, including right to personal liberty, dignity, and fair hearing.',
          },
          {
            id: 'law_2_q3',
            question: 'What does the constitutional principle of "Separation of Powers" mandate?',
            options: [
              { label: 'A', text: 'Legislature, Executive, and Judiciary must maintain distinct powers and checks and balances' },
              { label: 'B', text: 'The President can dismiss all Supreme Court judges without cause' },
              { label: 'C', text: 'Judges make federal tax laws directly in courtrooms' },
            ],
            correctIndex: 0,
            explanation: 'Separation of powers prevents tyrannical concentration of governance authority within any single branch.',
          },
          {
            id: 'law_2_q4',
            question: 'What natural justice maxim embodies the right to a Fair Hearing under Section 36?',
            options: [
              { label: 'A', text: 'Audi alteram partem (hear the other side)' },
              { label: 'B', text: 'Caveat emptor (buyer beware)' },
              { label: 'C', text: 'Res ipsa loquitur (the thing speaks for itself)' },
            ],
            correctIndex: 0,
            explanation: '"Audi alteram partem" mandates that no person shall be condemned or judged without an opportunity to present their defense.',
          },
          {
            id: 'law_2_q5',
            question: 'What prerogative writ is issued to order the release of a citizen unlawfully detained without trial?',
            options: [
              { label: 'A', text: 'Habeas Corpus' },
              { label: 'B', text: 'Mandamus' },
              { label: 'C', text: 'Certiorari' },
            ],
            correctIndex: 0,
            explanation: 'Habeas Corpus commands the detaining authority to produce the person before the court and show legal justification.',
          },
        ],
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
        overviewNotes: [
          'A criminal conviction generally requires the concurrence of Actus Reus (the prohibited physical act) and Mens Rea (the culpable mental state).',
          'The standard of proof in criminal trials in Nigeria is "Beyond reasonable doubt" (Section 135, Evidence Act 2011).',
          'Strict liability offences are exceptions where conviction does not require proof of mens rea (e.g. traffic or regulatory violations).',
          'The presumption of innocence (Section 36(5)) guarantees every accused person is presumed innocent until proven guilty by law.',
        ],
        quiz: [
          {
            id: 'law_3_q1',
            question: 'What two fundamental elements must generally coincide to constitute a crime under Nigerian criminal law?',
            options: [
              { label: 'A', text: 'Actus Reus (physical act) and Mens Rea (guilty mind)' },
              { label: 'B', text: 'A police siren and a pair of handcuffs' },
              { label: 'C', text: 'A written confession and cash payment' },
            ],
            correctIndex: 0,
            explanation: 'Except in strict liability offences, crime requires both wrongful conduct (actus reus) and mental intent (mens rea).',
          },
          {
            id: 'law_3_q2',
            question: 'What is the required standard of proof for the prosecution to convict an accused person in a criminal trial?',
            options: [
              { label: 'A', text: 'Proof beyond reasonable doubt' },
              { label: 'B', text: 'Balance of probabilities (51% certainty)' },
              { label: 'C', text: 'Popular consensus on social media' },
            ],
            correctIndex: 0,
            explanation: 'The state bears the high burden of proving guilt beyond reasonable doubt to protect innocent citizens from wrongful conviction.',
          },
          {
            id: 'law_3_q3',
            question: 'What is a "Strict Liability" offence in criminal jurisprudence?',
            options: [
              { label: 'A', text: 'An offence where the prosecution does not need to prove wrongful mental intent (mens rea)' },
              { label: 'B', text: 'A crime that is punishable strictly by community sweeping' },
              { label: 'C', text: 'An offence committed only by lawyers in court' },
            ],
            correctIndex: 0,
            explanation: 'Strict liability offences penalize the commission of the act itself regardless of knowledge or intent (e.g. food safety violations).',
          },
          {
            id: 'law_3_q4',
            question: 'Under Section 36(5) of the 1999 Constitution, how is an accused person treated throughout a criminal trial?',
            options: [
              { label: 'A', text: 'Presumed innocent until proven guilty according to law' },
              { label: 'B', text: 'Presumed guilty until they pay bail money' },
              { label: 'C', text: 'Forced to plead guilty at the first hearing' },
            ],
            correctIndex: 0,
            explanation: 'The presumption of innocence is a sacred constitutional protection placing the entire burden of proof on the prosecution.',
          },
          {
            id: 'law_3_q5',
            question: 'What legal defense negates criminal culpability if an accused suffered a total defect of reason from disease of the mind?',
            options: [
              { label: 'A', text: 'Defense of Insanity (M’Naghten Rules)' },
              { label: 'B', text: 'Defense of Bad Weather' },
              { label: 'C', text: 'Defense of Forgetfulness' },
            ],
            correctIndex: 0,
            explanation: 'Insanity negates mens rea if the defendant was incapable of understanding the nature of the act or that it was wrong.',
          },
        ],
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
        overviewNotes: [
          'The essential elements of a valid contract are: Offer, Acceptance, Consideration, Intention to create legal relations, and Capacity.',
          'An Invitation to Treat (e.g., goods displayed in shop windows or auction catalogues) is not an offer capable of acceptance.',
          'Consideration must be sufficient in the eyes of the law, but it need not be economically adequate.',
          'Remedies for breach of contract include Damages, Specific Performance, Injunction, and Rescission.',
        ],
        quiz: [
          {
            id: 'law_4_q1',
            question: 'Which of the following is legally categorized as an "Invitation to Treat" rather than a binding offer?',
            options: [
              { label: 'A', text: 'Display of goods with price tags on a supermarket shelf' },
              { label: 'B', text: 'A signed contract delivered and executed by both parties' },
              { label: 'C', text: 'An unconditional tender bid award letter' },
            ],
            correctIndex: 0,
            explanation: 'Goods displayed on shelves invite customers to make an offer at the checkout counter (Pharmaceutical Society v Boots).',
          },
          {
            id: 'law_4_q2',
            question: 'What is the fundamental legal rule concerning "Consideration" in contract law?',
            options: [
              { label: 'A', text: 'Consideration must be sufficient in law, but need not be economically adequate' },
              { label: 'B', text: 'Consideration must always exceed one million Naira in cash' },
              { label: 'C', text: 'Past consideration is always valid for future promises' },
            ],
            correctIndex: 0,
            explanation: 'Courts do not police commercial bargains; as long as consideration has recognizable value, it is legally sufficient.',
          },
          {
            id: 'law_4_q3',
            question: 'What equitable remedy compels a defaulting party to perform their exact contractual obligation (e.g. selling unique land)?',
            options: [
              { label: 'A', text: 'Specific Performance' },
              { label: 'B', text: 'Punitive Damages' },
              { label: 'C', text: 'Subpoena ad testificandum' },
            ],
            correctIndex: 0,
            explanation: 'Specific performance is an equitable order compelling actual completion when monetary damages are inadequate.',
          },
          {
            id: 'law_4_q4',
            question: 'What is the legal consequence of a counter-offer made during contract negotiations?',
            options: [
              { label: 'A', text: 'It completely destroys and terminates the original offer' },
              { label: 'B', text: 'It automatically binds both parties to the original offer' },
              { label: 'C', text: 'It doubles the price of the transaction' },
            ],
            correctIndex: 0,
            explanation: 'A counter-offer operates as a rejection that extinguishes the initial offer (Hyde v Wrench).',
          },
          {
            id: 'law_4_q5',
            question: 'In domestic and social agreements between family members, what is the default legal presumption?',
            options: [
              { label: 'A', text: 'There is no intention to create legally binding relations' },
              { label: 'B', text: 'The agreement is automatically enforced by the police' },
              { label: 'C', text: 'The agreement carries treble damages' },
            ],
            correctIndex: 0,
            explanation: 'Social arrangements between relatives (Balfour v Balfour) are presumed non-binding unless clearly evidenced otherwise.',
          },
        ],
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
        overviewNotes: [
          'Appellate advocacy focuses on errors of law or perverse factual determinations by the trial judge, rather than re-hearing witness testimonies.',
          'Cross-examination allows counsel to test the credibility, accuracy, and truthfulness of opposing witnesses using leading questions.',
          'The Appellant Brief must articulate clear Grounds of Appeal and distillate concise Issues for Determination.',
          'Courtroom etiquette mandates addressing High Court and appellate judges as "My Lord" or "Your Lordship" with decorum.',
        ],
        quiz: [
          {
            id: 'law_5_q1',
            question: 'During Cross-Examination of an opposing witness, what style of questions is an advocate permitted to ask?',
            options: [
              { label: 'A', text: 'Leading questions (questions suggesting the desired answer)' },
              { label: 'B', text: 'Only vague rhetorical philosophical questions' },
              { label: 'C', text: 'No questions at all; only written essays' },
            ],
            correctIndex: 0,
            explanation: 'Unlike Examination-in-Chief, cross-examination allows leading questions to probe veracity and test credibility.',
          },
          {
            id: 'law_5_q2',
            question: 'How must an advocate properly address a High Court Judge during court proceedings in Nigeria?',
            options: [
              { label: 'A', text: '"My Lord" or "Your Lordship"' },
              { label: 'B', text: '"Chairman" or "Oga Boss"' },
              { label: 'C', text: '"Fellow Citizen"' },
            ],
            correctIndex: 0,
            explanation: 'Judicial decorum requires addressing superior court judges as "My Lord" or "Your Lordship" (or "Your Ladyship").',
          },
          {
            id: 'law_5_q3',
            question: 'What is the purpose of formulating "Issues for Determination" in an Appellate Brief?',
            options: [
              { label: 'A', text: 'To crystallize multiple grounds of appeal into succinct legal questions for the court to decide' },
              { label: 'B', text: 'To introduce new hearsay evidence that was rejected by the trial judge' },
              { label: 'C', text: 'To list the personal bank accounts of all lawyers involved' },
            ],
            correctIndex: 0,
            explanation: 'Issues for determination distill sprawling grounds of appeal into sharp, decisive legal questions.',
          },
          {
            id: 'law_5_q4',
            question: 'What does an advocate mean when stating "My Lord, the trial judgment is against the weight of evidence"?',
            options: [
              { label: 'A', text: 'The trial judge’s findings of fact are unsupported by or contrary to the evidence led at trial' },
              { label: 'B', text: 'The physical paper document weighs more than ten kilograms' },
              { label: 'C', text: 'The court stenographer used too much heavy ink' },
            ],
            correctIndex: 0,
            explanation: 'This standard ground of appeal asserts that the trial court’s factual conclusions are perverse based on the record.',
          },
          {
            id: 'law_5_q5',
            question: 'What is the primary role of an amicus curiae in complex appellate proceedings?',
            options: [
              { label: 'A', text: 'A "friend of the court" invited to provide impartial expert legal guidance' },
              { label: 'B', text: 'A bodyguard hired to protect the appellant' },
              { label: 'C', text: 'A journalist recording video for television blogs' },
            ],
            correctIndex: 0,
            explanation: 'An amicus curiae is an independent legal authority requested by the court to advise on intricate legal dilemmas.',
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // 5. Business Administration, Accounting & Economics
  // ==========================================================================
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
        overviewNotes: [
          'The fundamental Accounting Equation: Assets = Liabilities + Owner’s Equity.',
          'Double-Entry Bookkeeping mandates that every financial transaction has equal and opposite debit and credit effects.',
          'Debit increases Assets and Expenses; Credit increases Liabilities, Equity, and Revenue.',
          'The Trial Balance verifies mathematical equilibrium between total debits and total credits before balance sheet preparation.',
        ],
        quiz: [
          {
            id: 'bus_1_q1',
            question: 'What is the foundational accounting balance sheet equation?',
            options: [
              { label: 'A', text: 'Assets = Liabilities + Owner’s Equity' },
              { label: 'B', text: 'Assets = Revenue - Expenses' },
              { label: 'C', text: 'Liabilities = Cash + Bank Loan' },
            ],
            correctIndex: 0,
            explanation: 'Every balance sheet balances because total economic resources (Assets) equal claims by creditors (Liabilities) and owners (Equity).',
          },
          {
            id: 'bus_1_q2',
            question: 'In double-entry bookkeeping, what effect does a DEBIT entry have on an Asset account?',
            options: [
              { label: 'A', text: 'It increases the asset balance' },
              { label: 'B', text: 'It decreases the asset balance' },
              { label: 'C', text: 'It sets the asset balance to zero' },
            ],
            correctIndex: 0,
            explanation: 'Debits increase assets and expenses; credits decrease assets and increase liabilities and equity.',
          },
          {
            id: 'bus_1_q3',
            question: 'What is the primary purpose of compiling a Trial Balance at the end of an accounting period?',
            options: [
              { label: 'A', text: 'To verify that total debit balances equal total credit balances mathematically' },
              { label: 'B', text: 'To calculate the income tax owed to federal authorities' },
              { label: 'C', text: 'To distribute dividends directly to shareholders' },
            ],
            correctIndex: 0,
            explanation: 'A trial balance tests arithmetic equality across the general ledger prior to drafting final financial statements.',
          },
          {
            id: 'bus_1_q4',
            question: 'What does the "Accrual Principle" in financial reporting require?',
            options: [
              { label: 'A', text: 'Revenues and expenses must be recognized when earned or incurred, regardless of cash movement' },
              { label: 'B', text: 'Transactions are only recorded when paper cash physically touches the cashier counter' },
              { label: 'C', text: 'Companies can only buy inventory using bank loans' },
            ],
            correctIndex: 0,
            explanation: 'Accrual accounting reflects true economic activity in the period it happens rather than waiting for cash settlement.',
          },
          {
            id: 'bus_1_q5',
            question: 'Which financial statement summarizes a company’s operational revenues, costs, and net profit over a fiscal year?',
            options: [
              { label: 'A', text: 'Income Statement (Profit & Loss Statement)' },
              { label: 'B', text: 'Statement of Financial Position' },
              { label: 'C', text: 'Bank Reconciliation Certificate' },
            ],
            correctIndex: 0,
            explanation: 'The Income Statement reflects operational performance over a specific period of time.',
          },
        ],
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
        overviewNotes: [
          'The Law of Demand states that, ceteris paribus, as price rises, quantity demanded falls.',
          'Price Elasticity of Demand measures how sensitively consumer demand reacts to fluctuations in product pricing.',
          'In Perfect Competition, firms are price takers with zero economic profit in long-run equilibrium.',
          'Marginal Cost equals Marginal Revenue (MC = MR) is the universal profit-maximization condition for all firms.',
        ],
        quiz: [
          {
            id: 'bus_2_q1',
            question: 'At what operating output level does a business maximize its overall economic profit?',
            options: [
              { label: 'A', text: 'Where Marginal Revenue equals Marginal Cost (MR = MC)' },
              { label: 'B', text: 'Where total price equals zero' },
              { label: 'C', text: 'Where employee headcount is at its absolute maximum' },
            ],
            correctIndex: 0,
            explanation: 'When MR > MC, producing more adds profit; when MR < MC, producing more adds loss. The optimum is MR = MC.',
          },
          {
            id: 'bus_2_q2',
            question: 'If a 10% increase in price causes quantity demanded to drop by 25%, what is the Price Elasticity of Demand?',
            options: [
              { label: 'A', text: '2.5 (Elastic demand)' },
              { label: 'B', text: '0.4 (Inelastic demand)' },
              { label: 'C', text: '1.0 (Unitary elasticity)' },
            ],
            correctIndex: 0,
            explanation: 'Elasticity = % change in Q / % change in P = 25% / 10% = 2.5. Since > 1, demand is elastic.',
          },
          {
            id: 'bus_2_q3',
            question: 'What defines a "Monopoly" market structure?',
            options: [
              { label: 'A', text: 'A single seller dominating the market with significant barriers to entry and no close substitutes' },
              { label: 'B', text: 'Thousands of small farmers selling identical maize grains' },
              { label: 'C', text: 'A market where the government provides all goods completely free' },
            ],
            correctIndex: 0,
            explanation: 'Monopolies have price-setting power because high entry barriers prevent competitive market entry.',
          },
          {
            id: 'bus_2_q4',
            question: 'What economic phrase describes "all other influencing factors remaining constant"?',
            options: [
              { label: 'A', text: 'Ceteris paribus' },
              { label: 'B', text: 'Laissez-faire' },
              { label: 'C', text: 'Quid pro quo' },
            ],
            correctIndex: 0,
            explanation: '"Ceteris paribus" is essential in economic modeling to isolate the relationship between two specific variables.',
          },
          {
            id: 'bus_2_q5',
            question: 'What is an "Opportunity Cost" in managerial business decision-making?',
            options: [
              { label: 'A', text: 'The value of the next best alternative foregone when making a choice' },
              { label: 'B', text: 'The fee paid to register a company name with CAC' },
              { label: 'C', text: 'The interest rate charged on bank overdrafts' },
            ],
            correctIndex: 0,
            explanation: 'Opportunity cost accounts for what is sacrificed when scarce capital or time is deployed on one path over another.',
          },
        ],
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
        overviewNotes: [
          'Corporate Governance encompasses the rules, practices, and processes by which a firm is directed and controlled.',
          'The Agency Problem arises from the separation of ownership (shareholders) and control (managers).',
          'SWOT Analysis evaluates internal Strengths and Weaknesses against external Opportunities and Threats.',
          'A Board of Directors owes fiduciary duties of Care and Loyalty to protect shareholder value.',
        ],
        quiz: [
          {
            id: 'bus_3_q1',
            question: 'What is the classic "Agency Problem" in modern corporate governance?',
            options: [
              { label: 'A', text: 'Conflict of interest between corporate managers (agents) and shareholders (principals)' },
              { label: 'B', text: 'Secret agents spying on rival marketing firms' },
              { label: 'C', text: 'Real estate agents charging high fees on office leases' },
            ],
            correctIndex: 0,
            explanation: 'When managers prioritize personal perks over shareholder wealth maximization, an agency conflict exists.',
          },
          {
            id: 'bus_3_q2',
            question: 'What four components make up a strategic business SWOT Analysis matrix?',
            options: [
              { label: 'A', text: 'Strengths, Weaknesses, Opportunities, Threats' },
              { label: 'B', text: 'Sales, Wealth, Operations, Turnover' },
              { label: 'C', text: 'Salary, Wages, Overtime, Taxation' },
            ],
            correctIndex: 0,
            explanation: 'SWOT combines internal organizational factors (S/W) with external macroeconomic environments (O/T).',
          },
          {
            id: 'bus_3_q3',
            question: 'What fiduciary duty requires corporate directors to act in good faith and avoid conflicts of interest?',
            options: [
              { label: 'A', text: 'Duty of Loyalty' },
              { label: 'B', text: 'Duty of Expansion' },
              { label: 'C', text: 'Duty of Taxation' },
            ],
            correctIndex: 0,
            explanation: 'The Duty of Loyalty prevents directors from self-dealing or subordinating corporate interests to personal gain.',
          },
          {
            id: 'bus_3_q4',
            question: 'What role does an Independent Non-Executive Director play on a corporate board?',
            options: [
              { label: 'A', text: 'Provides objective oversight without operational conflicts of interest' },
              { label: 'B', text: 'Manages daily factory production shifts' },
              { label: 'C', text: 'Signs daily staff attendance register' },
            ],
            correctIndex: 0,
            explanation: 'Independent directors bring impartial judgment to executive compensation, auditing, and corporate compliance.',
          },
          {
            id: 'bus_3_q5',
            question: 'What leadership style encourages active participation, team input, and collaborative decision-making?',
            options: [
              { label: 'A', text: 'Democratic / Participative Leadership' },
              { label: 'B', text: 'Autocratic Leadership' },
              { label: 'C', text: 'Laissez-faire Abrogation' },
            ],
            correctIndex: 0,
            explanation: 'Democratic leadership engages team members in strategy formulation, improving engagement and innovation.',
          },
        ],
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
        overviewNotes: [
          'Value Added Tax (VAT) in Nigeria is currently 7.5% levied on taxable goods and services.',
          'Companies Income Tax (CIT) is levied by the Federal Inland Revenue Service (FIRS) on corporate profits.',
          'An External Audit expresses an independent opinion on whether financial statements show a true and fair view.',
          'Segregation of Duties is a foundational internal control ensuring no single employee controls an entire transaction lifecycle.',
        ],
        quiz: [
          {
            id: 'bus_4_q1',
            question: 'What is the standard Value Added Tax (VAT) rate on applicable commercial goods and services in Nigeria?',
            options: [
              { label: 'A', text: '7.5%' },
              { label: 'B', text: '25%' },
              { label: 'C', text: '1.5%' },
            ],
            correctIndex: 0,
            explanation: 'The standard statutory VAT rate in Nigeria established by the Finance Act is 7.5%.',
          },
          {
            id: 'bus_4_q2',
            question: 'What is the primary objective of an independent Statutory Financial Audit?',
            options: [
              { label: 'A', text: 'To express an opinion on whether financial statements provide a true and fair view' },
              { label: 'B', text: 'To guarantee that the company can never go bankrupt' },
              { label: 'C', text: 'To prepare daily invoices for sales reps' },
            ],
            correctIndex: 0,
            explanation: 'Auditors evaluate evidence to provide reasonable assurance that financial reports are free of material misstatement.',
          },
          {
            id: 'bus_4_q3',
            question: 'What federal revenue agency is charged with assessing and collecting federal corporate taxes in Nigeria?',
            options: [
              { label: 'A', text: 'Federal Inland Revenue Service (FIRS)' },
              { label: 'B', text: 'Nigerian Ports Authority' },
              { label: 'C', text: 'National Orientation Agency' },
            ],
            correctIndex: 0,
            explanation: 'The FIRS administers federal taxes including Companies Income Tax (CIT), VAT, and Petroleum Profits Tax.',
          },
          {
            id: 'bus_4_q4',
            question: 'Why is "Segregation of Duties" a critical internal accounting control?',
            options: [
              { label: 'A', text: 'It prevents fraud and errors by dividing authorization, custody, and recordkeeping' },
              { label: 'B', text: 'It ensures all staff work in separate air-conditioned offices' },
              { label: 'C', text: 'It cuts staff payroll expenses by half' },
            ],
            correctIndex: 0,
            explanation: 'Separating transaction authorization from asset custody prevents unilateral fraud and collusion.',
          },
          {
            id: 'bus_4_q5',
            question: 'What is the legal difference between Tax Avoidance and Tax Evasion?',
            options: [
              { label: 'A', text: 'Tax Avoidance is legal tax planning; Tax Evasion is illegal criminal non-payment' },
              { label: 'B', text: 'Both are criminal felonies punishable by life imprisonment' },
              { label: 'C', text: 'Tax Evasion is only practiced by registered non-profits' },
            ],
            correctIndex: 0,
            explanation: 'Avoidance utilizes statutory allowances legally; evasion uses fraud, concealment, or falsification illegally.',
          },
        ],
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
        overviewNotes: [
          'The Time Value of Money establishes that ₦1 today is worth more than ₦1 in the future due to earning capacity and inflation.',
          'Net Present Value (NPV) discounts projected future cash flows back to the present; a positive NPV creates economic value.',
          'The Weighted Average Cost of Capital (WACC) represents a firm’s average cost of financing across equity and debt.',
          'Diversification across non-correlated asset classes reduces unsystematic portfolio risk.',
        ],
        quiz: [
          {
            id: 'bus_5_q1',
            question: 'Why is a Naira received today worth more than a Naira received three years from now?',
            options: [
              { label: 'A', text: 'Time Value of Money (earning potential through interest and erosion from inflation)' },
              { label: 'B', text: 'Because future bank notes are printed on plastic' },
              { label: 'C', text: 'Because banks only accept older currency serial numbers' },
            ],
            correctIndex: 0,
            explanation: 'Money available now can earn compound interest, while future money is subject to inflation risk and opportunity loss.',
          },
          {
            id: 'bus_5_q2',
            question: 'If a proposed capital investment has a Net Present Value (NPV) greater than zero, what should the manager do?',
            options: [
              { label: 'A', text: 'Accept the project: it generates return in excess of the cost of capital' },
              { label: 'B', text: 'Reject the project immediately to avoid debt' },
              { label: 'C', text: 'Wait five years before reviewing the proposal' },
            ],
            correctIndex: 0,
            explanation: 'A positive NPV indicates that project returns exceed the discount rate hurdle, increasing firm equity value.',
          },
          {
            id: 'bus_5_q3',
            question: 'What does WACC represent in corporate valuation models?',
            options: [
              { label: 'A', text: 'Weighted Average Cost of Capital' },
              { label: 'B', text: 'Worldwide Asset Credit Committee' },
              { label: 'C', text: 'Weekly Accounting Cash Clearance' },
            ],
            correctIndex: 0,
            explanation: 'WACC calculates the blended required return demanded by lenders and shareholders according to capital structure weights.',
          },
          {
            id: 'bus_5_q4',
            question: 'What type of investment risk can be minimized through portfolio diversification?',
            options: [
              { label: 'A', text: 'Unsystematic (company-specific / idiosyncratic) Risk' },
              { label: 'B', text: 'Systematic (market-wide macroeconomic) Risk' },
              { label: 'C', text: 'Currency Devaluation Risk' },
            ],
            correctIndex: 0,
            explanation: 'Holding a basket of diverse stocks eliminates company-specific vulnerabilities, leaving only market-wide systematic risk.',
          },
          {
            id: 'bus_5_q5',
            question: 'In an Initial Public Offering (IPO), what is the primary role of the Investment Bank underwriter?',
            options: [
              { label: 'A', text: 'Valuing the company, underwriting the share issuance, and selling shares to institutional investors' },
              { label: 'B', text: 'Arresting corporate executives who miss sales quotas' },
              { label: 'C', text: 'Writing daily computer code for the client’s customer support app' },
            ],
            correctIndex: 0,
            explanation: 'Underwriters guide private companies into public markets by pricing securities and marketing them to institutional capital.',
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // 6. Architecture & Environmental Sciences
  // ==========================================================================
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
        overviewNotes: [
          'Orthographic Projection presents a 3D object in 2D views: Plans (top view), Elevations (exterior side view), and Sections (cut-through view).',
          'A Floor Plan is a horizontal sectional slice taken typically 1.2 to 1.5 meters above floor level.',
          'Standard metric drafting scales include 1:100 (for full house floor plans) and 1:20 (for detailed junction construction drawings).',
          'Line Weight hierarchy creates drawing depth: cut structural walls use thick lines, while fixtures and hatching use thin lines.',
        ],
        quiz: [
          {
            id: 'env_1_q1',
            question: 'What is an architectural "Floor Plan" in orthographic projection?',
            options: [
              { label: 'A', text: 'A horizontal sectional cut looking downward from approximately 1.2m above floor level' },
              { label: 'B', text: 'A painting of the exterior roof taken from an airplane' },
              { label: 'C', text: 'A list of furniture prices posted on a wall' },
            ],
            correctIndex: 0,
            explanation: 'Floor plans slice horizontally through window openings to illustrate walls, doors, and interior spatial arrangements.',
          },
          {
            id: 'env_1_q2',
            question: 'Which drawing view reveals vertical heights, floor-to-ceiling volumes, and structural foundations cut down the middle?',
            options: [
              { label: 'A', text: 'Building Section' },
              { label: 'B', text: 'Roof Plan' },
              { label: 'C', text: 'Site Location Map' },
            ],
            correctIndex: 0,
            explanation: 'A cross section cuts vertically through a building to reveal structural slabs, stairs, foundation footings, and vertical space.',
          },
          {
            id: 'env_1_q3',
            question: 'What drafting scale means 1 centimetre on the paper drawing represents 100 centimetres (1 metre) in reality?',
            options: [
              { label: 'A', text: '1:100 scale' },
              { label: 'B', text: '1:1 scale' },
              { label: 'C', text: '1:1000 scale' },
            ],
            correctIndex: 0,
            explanation: '1:100 scale reduces 100 real-world units into 1 unit on paper, standard for building layout drawings.',
          },
          {
            id: 'env_1_q4',
            question: 'Why do architectural drawings employ distinct line weights (thin, medium, thick lines)?',
            options: [
              { label: 'A', text: 'To establish visual hierarchy and distinguish sliced structural elements from background fixtures' },
              { label: 'B', text: 'To use up old ink pens before they dry out' },
              { label: 'C', text: 'Because city planning councils reject colored drawings' },
            ],
            correctIndex: 0,
            explanation: 'Thick lines represent cut structural elements (walls/columns), while lighter lines indicate surface textures and fixtures.',
          },
          {
            id: 'env_1_q5',
            question: 'What is the primary characteristic of an Isometric projection drawing?',
            options: [
              { label: 'A', text: '3D pictorial view where horizontal axes are drawn at 30 degrees without vanishing point convergence' },
              { label: 'B', text: 'A photographic panorama taken with wide-angle fish eye lenses' },
              { label: 'C', text: 'A 2D contour map showing mountain elevations' },
            ],
            correctIndex: 0,
            explanation: 'Isometric projections project 3D geometry with parallel lines at 30° angles, preserving measurable scaled dimensions.',
          },
        ],
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
        overviewNotes: [
          'Reinforced Concrete combines concrete (high compressive strength) with steel rebar (high tensile strength).',
          'Foundations distribute superstructural building loads safely into subsoil without exceeding bearing capacity.',
          'Strip Foundations are standard for shallow residential masonry walls in stable soil.',
          'Differential Settlement occurs when different parts of a foundation settle unequally, creating structural diagonal wall cracking.',
        ],
        quiz: [
          {
            id: 'env_2_q1',
            question: 'Why is steel reinforcement embedded inside structural concrete elements (beams and slabs)?',
            options: [
              { label: 'A', text: 'Concrete is strong in compression but weak in tension; steel provides high tensile strength' },
              { label: 'B', text: 'To conduct electrical ground current during thunder storms' },
              { label: 'C', text: 'To prevent birds from nesting on the roof' },
            ],
            correctIndex: 0,
            explanation: 'Concrete resists compressive crushing while steel resists pulling tensile forces, creating a composite material.',
          },
          {
            id: 'env_2_q2',
            question: 'What type of foundation footing is most common for single-story residential masonry walls in stable Nigerian soil?',
            options: [
              { label: 'A', text: 'Strip Foundation' },
              { label: 'B', text: 'Deep Caisson Pile' },
              { label: 'C', text: 'Floating Pontoon' },
            ],
            correctIndex: 0,
            explanation: 'Continuous reinforced concrete strip footings run beneath continuous load-bearing blockwork walls.',
          },
          {
            id: 'env_2_q3',
            question: 'What is "Differential Settlement" in structural engineering?',
            options: [
              { label: 'A', text: 'Unequal settling of different parts of a building’s foundation, leading to diagonal cracking' },
              { label: 'B', text: 'Negotiating building construction bills with bricklayers' },
              { label: 'C', text: 'The natural drying of cement mortar after 24 hours' },
            ],
            correctIndex: 0,
            explanation: 'When one side of a building sinks faster than another, shear stresses distort frames and crack masonry.',
          },
          {
            id: 'env_2_q4',
            question: 'What is the standard nominal mortar mix ratio (Cement : Sand) used for laying sandcrete blocks in Nigeria?',
            options: [
              { label: 'A', text: '1 : 4 or 1 : 6' },
              { label: 'B', text: '1 : 25' },
              { label: 'C', text: '10 : 1' },
            ],
            correctIndex: 0,
            explanation: 'A 1:4 to 1:6 cement-to-sharp sand ratio provides appropriate bonding and strength for block masonry.',
          },
          {
            id: 'env_2_q5',
            question: 'What is the primary function of a Damp-Proof Course (DPC) membrane in wall construction?',
            options: [
              { label: 'A', text: 'To prevent rising capillary groundwater from seeping up into interior masonry walls' },
              { label: 'B', text: 'To act as a fire extinguishing layer in case of kitchen blazes' },
              { label: 'C', text: 'To prevent termites from eating electrical cables' },
            ],
            correctIndex: 0,
            explanation: 'A waterproof DPC barrier laid above ground level blocks capillary moisture from climbing up masonry walls.',
          },
        ],
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
        overviewNotes: [
          'Passive Solar Design in tropical climates minimizes direct heat gain by orienting long facades along the East-West axis with shading devices.',
          'Cross-Ventilation utilizes pressure differentials between windward positive pressure and leeward negative pressure to naturally cool interiors.',
          'Thermal Mass materials (stone, thick earth blocks) absorb daytime heat and release it during cooler night periods.',
          'Brise-Soleil (sunshades) block harsh midday high-angle tropical sun while admitting diffused ambient natural daylight.',
        ],
        quiz: [
          {
            id: 'env_3_q1',
            question: 'How should long building facades be oriented in tropical climates like Nigeria to minimize solar heat gain?',
            options: [
              { label: 'A', text: 'East-West longitudinal axis (windows facing North and South)' },
              { label: 'B', text: 'Facing directly into the rising East sun with giant unshaded glass' },
              { label: 'C', text: 'Facings do not impact thermal temperatures in architecture' },
            ],
            correctIndex: 0,
            explanation: 'Facing main glazing North and South prevents intense morning (East) and afternoon (West) solar radiation from heating interiors.',
          },
          {
            id: 'env_3_q2',
            question: 'How does natural "Cross-Ventilation" function effectively inside a building room?',
            options: [
              { label: 'A', text: 'By placing openings on opposing walls to allow wind to flow through from high to low pressure zones' },
              { label: 'B', text: 'By keeping all doors and windows sealed airtight at all times' },
              { label: 'C', text: 'By running large diesel generators on the balcony' },
            ],
            correctIndex: 0,
            explanation: 'Openings on opposite or adjacent walls create continuous cross breezes driven by natural pressure gradients.',
          },
          {
            id: 'env_3_q3',
            question: 'What architectural element is specifically engineered to shade window openings from high-angle solar glare?',
            options: [
              { label: 'A', text: 'Brise-soleil (Sunshade / Louver overhang)' },
              { label: 'B', text: 'Lightning Rod' },
              { label: 'C', text: 'Parapet gutter' },
            ],
            correctIndex: 0,
            explanation: 'Brise-soleil architectural louvers block direct intense sunlight while preserving natural daylighting.',
          },
          {
            id: 'env_3_q4',
            question: 'What is the "Stack Effect" in passive architectural ventilation?',
            options: [
              { label: 'A', text: 'Warm indoor air naturally rises and escapes through high clerestory vents, pulling in cooler air below' },
              { label: 'B', text: 'Stacking bricks in towers to stop strong storms' },
              { label: 'C', text: 'Piling up architectural textbooks in drafting studios' },
            ],
            correctIndex: 0,
            explanation: 'Warm air is buoyant and rises; exhausting it high up draws in fresh cooler air through low openings.',
          },
          {
            id: 'env_3_q5',
            question: 'What sustainable design strategy collects surface precipitation runoff from building roofs for non-potable reuse?',
            options: [
              { label: 'A', text: 'Rainwater Harvesting' },
              { label: 'B', text: 'Desalination Boiling' },
              { label: 'C', text: 'Subsoil Siphon' },
            ],
            correctIndex: 0,
            explanation: 'Rainwater harvesting channels roof runoff through gutters into storage tanks for landscaping and toilet flushing.',
          },
        ],
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
        overviewNotes: [
          'Drainage layouts rely on gravity falls (typically 1:40 for soil pipes) to transport waste to inspection chambers and septic tanks.',
          'P-traps and S-traps beneath plumbing fixtures maintain water seals that prevent noxious sewer gases from backing into rooms.',
          'Soil pipes carry foul waste from water closets (toilets), while Waste pipes convey sullage from sinks, showers, and basins.',
          'Fire safety engineering balances Passive protections (fire-resistant doors, escape stairwells) and Active systems (sprinklers, smoke alarms).',
        ],
        quiz: [
          {
            id: 'env_4_q1',
            question: 'What is the crucial hygienic function of the water seal maintained inside a plumbing P-trap beneath a sink?',
            options: [
              { label: 'A', text: 'To prevent foul sewer gases and insects from rising up through drain pipes into the room' },
              { label: 'B', text: 'To heat up cold tap water before it enters the basin' },
              { label: 'C', text: 'To filter out fine sand from drinking water' },
            ],
            correctIndex: 0,
            explanation: 'The curved trap holds standing water that forms an airtight barrier against sewer fumes.',
          },
          {
            id: 'env_4_q2',
            question: 'What is the distinction between a "Soil Pipe" and a "Waste Pipe" in sanitary plumbing?',
            options: [
              { label: 'A', text: 'Soil pipes convey blackwater from toilets; waste pipes convey greywater from sinks and showers' },
              { label: 'B', text: 'Soil pipes are buried in dirt; waste pipes are hung from the roof' },
              { label: 'C', text: 'Soil pipes carry drinking water; waste pipes carry electrical wiring' },
            ],
            correctIndex: 0,
            explanation: 'Soil discharge contains blackwater from WCs, while waste discharge is greywater from baths and washbasins.',
          },
          {
            id: 'env_4_q3',
            question: 'What minimum slope/fall gradient is standard for horizontal underground foul drainage pipe runs?',
            options: [
              { label: 'A', text: '1 in 40 (or 1 in 60)' },
              { label: 'B', text: '1 in 2 (steep cliff)' },
              { label: 'C', text: '0 in 100 (completely flat horizontal)' },
            ],
            correctIndex: 0,
            explanation: 'A 1:40 to 1:60 gradient provides self-cleansing velocity so liquids carry solid matter without stranding.',
          },
          {
            id: 'env_4_q4',
            question: 'Which of the following is considered a "Passive" building fire protection measure?',
            options: [
              { label: 'A', text: 'Fire-resistant compartment walls and self-closing fire doors' },
              { label: 'B', text: 'Ceiling automated water sprinkler nozzles' },
              { label: 'C', text: 'Battery-powered smoke alarm sirens' },
            ],
            correctIndex: 0,
            explanation: 'Passive fire safety contains blazes through structural fire compartments and fire doors without mechanical activation.',
          },
          {
            id: 'env_4_q5',
            question: 'What is the function of an electrical Residual Current Device (RCD) / Earth Leakage Circuit Breaker?',
            options: [
              { label: 'A', text: 'To rapidly disconnect electrical circuits when leakage current to earth is detected, preventing fatal shocks' },
              { label: 'B', text: 'To double the incoming voltage for heavy machinery' },
              { label: 'C', text: 'To track monthly electrical consumption units' },
            ],
            correctIndex: 0,
            explanation: 'RCDs detect dangerous residual leakage currents escaping from damaged appliances, tripping power in milliseconds.',
          },
        ],
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
        overviewNotes: [
          'A Master Site Plan coordinates vehicular circulation, pedestrian boulevards, zoning setbacks, green parks, and building footprints.',
          'Zoning regulations dictate Floor Area Ratio (FAR), maximum building heights, and property boundary setbacks.',
          'Universal Accessibility mandates wheelchair access ramps with maximum slopes of 1:12 and step-free entrances.',
          'Architectural Defense Juries evaluate conceptual design rationale, programmatic spatial flow, contextual sustainability, and structural feasibility.',
        ],
        quiz: [
          {
            id: 'env_5_q1',
            question: 'What is the maximum recommended ramp gradient for universal wheelchair accessibility under international standards?',
            options: [
              { label: 'A', text: '1 : 12 (1 unit vertical rise for every 12 units horizontal run)' },
              { label: 'B', text: '1 : 2 (very steep stairs)' },
              { label: 'C', text: '1 : 1 (45-degree angle slope)' },
            ],
            correctIndex: 0,
            explanation: 'A 1:12 slope ensures wheelchair users can ascend safely without excessive physical strain or tipping.',
          },
          {
            id: 'env_5_q2',
            question: 'What does "Floor Area Ratio" (FAR) or Plot Ratio measure in urban planning zoning?',
            options: [
              { label: 'A', text: 'The ratio of a building’s total gross floor area to the total area of the land plot' },
              { label: 'B', text: 'The price of ceramic floor tiles per square metre' },
              { label: 'C', text: 'The number of cars parked in the basement' },
            ],
            correctIndex: 0,
            explanation: 'FAR governs building density and bulk: total floor area divided by land area.',
          },
          {
            id: 'env_5_q3',
            question: 'What is a "Setback" in municipal planning laws?',
            options: [
              { label: 'A', text: 'The mandatory minimum distance a building must be situated away from property lines and roads' },
              { label: 'B', text: 'A delay caused by bad weather during concrete casting' },
              { label: 'C', text: 'The financial penalty charged when an architect submits late plans' },
            ],
            correctIndex: 0,
            explanation: 'Setbacks ensure road expansion room, privacy, natural daylighting, and emergency vehicle access between properties.',
          },
          {
            id: 'env_5_q4',
            question: 'In urban circulation design, why should pedestrian walkways be separated from vehicular roads?',
            options: [
              { label: 'A', text: 'To protect pedestrian safety, eliminate conflict points, and encourage walkable communities' },
              { label: 'B', text: 'To allow automobiles to drive at highway speeds in school corridors' },
              { label: 'C', text: 'Because asphalt dissolves when walked on by shoes' },
            ],
            correctIndex: 0,
            explanation: 'Segregating pedestrians from vehicular traffic significantly reduces collision risks and fosters livable environments.',
          },
          {
            id: 'env_5_q5',
            question: 'During a final architectural design studio defense, what does the concept of "Circulation" describe?',
            options: [
              { label: 'A', text: 'The fluid pathway and movement of people through and around spaces in a building' },
              { label: 'B', text: 'The rotation of ceiling fans in the presentation hall' },
              { label: 'C', text: 'The number of printed copies of the portfolio given to lecturers' },
            ],
            correctIndex: 0,
            explanation: 'Circulation analyzes how occupants navigate hallways, entrances, stairs, and rooms efficiently.',
          },
        ],
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
    deptLower.includes('media') ||
    deptLower.includes('broadcasting')
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
    deptLower.includes('med') ||
    deptLower.includes('surg') ||
    deptLower.includes('doctor')
  ) {
    return DEPARTMENT_CURRICULUM_TRACKS.mbbs;
  }

  if (
    deptLower.includes('law') ||
    deptLower.includes('juris') ||
    deptLower.includes('barrister') ||
    deptLower.includes('solicitor')
  ) {
    return DEPARTMENT_CURRICULUM_TRACKS.law;
  }

  if (
    deptLower.includes('architect') ||
    deptLower.includes('estate') ||
    deptLower.includes('build') ||
    deptLower.includes('environ') ||
    deptLower.includes('urban')
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
