import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGame } from '../context/GameContext';
import type {
  SocioeconomicStatus,
  CharacterCustomization,
  CharacterGender,
  HairStyle,
  ShirtPattern,
  AccessoryType,
} from '../types/game';
import {
  LU_FACULTIES,
} from '../data/departmentsData';
import {
  authenticateStudent,
  saveStudentAccount,
  checkStudentAccountExists,
  registerStudentToDatabase,
  saveRegisteredStudent,
  type StudentAccount,
} from '../lib/supabase';
import { createCharacterModel, type CharacterModelInstance } from './CharacterModel';
import {
  DEFAULT_PLAYER_CUSTOMIZATION,
  DEFAULT_FEMALE_CUSTOMIZATION,
} from '../data/npcData';
import {
  GraduationCap,
  Crown,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  User,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shuffle,
  ArrowRight,
  Scissors,
  Shirt,
  LogIn,
  UserPlus,
} from 'lucide-react';

const SKIN_TONES = [
  { label: 'Deep Melanin', color: '#3b2314' },
  { label: 'Warm Espresso', color: '#523620' },
  { label: 'Rich Cocoa', color: '#6d4527' },
  { label: 'Warm Bronze', color: '#8c5835' },
  { label: 'Golden Caramel', color: '#a66f48' },
  { label: 'Honey Tan', color: '#c58b5e' },
  { label: 'Warm Ivory', color: '#e0ad88' },
];

const MALE_HAIR_STYLES: { id: HairStyle; label: string }[] = [
  { id: 'fade', label: 'High Fade' },
  { id: 'waves', label: '360 Waves' },
  { id: 'afro', label: 'Afro Puff' },
  { id: 'dreads', label: 'Dreadlocks' },
  { id: 'braids', label: 'Cornrows' },
  { id: 'short', label: 'Buzz Cut' },
  { id: 'none', label: 'Clean Shave' },
];

const FEMALE_HAIR_STYLES: { id: HairStyle; label: string }[] = [
  { id: 'braids', label: 'Box Braids' },
  { id: 'bob', label: 'Sleek Bob' },
  { id: 'ponytail', label: 'High Ponytail' },
  { id: 'afro', label: 'Afro Puff' },
  { id: 'dreads', label: 'Goddess Locs' },
  { id: 'gele', label: 'Royal Gele' },
  { id: 'short', label: 'Natural Cut' },
  { id: 'none', label: 'Clean Shave' },
];

const HAIR_COLORS = [
  { label: 'Natural Black', color: '#18181b' },
  { label: 'Dark Brown', color: '#3f2415' },
  { label: 'Golden Blonde', color: '#ca8a04' },
  { label: 'Burgundy Red', color: '#881337' },
  { label: 'Icy Silver', color: '#94a3b8' },
];

const SHIRT_COLORS = [
  { label: 'LU Emerald', color: '#16a34a' },
  { label: 'Royal Blue', color: '#2563eb' },
  { label: 'Sunset Gold', color: '#eab308' },
  { label: 'Crimson Red', color: '#dc2626' },
  { label: 'Crisp White', color: '#f8fafc' },
  { label: 'Sleek Slate', color: '#1e293b' },
  { label: 'Royal Violet', color: '#8b5cf6' },
  { label: 'Coral Pink', color: '#f43f5e' },
];

const SHIRT_PATTERNS: { id: ShirtPattern; label: string }[] = [
  { id: 'ankara', label: 'Ankara Wax' },
  { id: 'plain', label: 'Solid Color' },
  { id: 'stripes', label: 'Varsity Stripe' },
  { id: 'pastor_vestment', label: 'Clerical Robe' },
  { id: 'jalabiya_robe', label: 'Gold Jalabiya' },
];

const PANTS_COLORS = [
  { label: 'Midnight Navy', color: '#1e293b' },
  { label: 'Classic Black', color: '#0f172a' },
  { label: 'Denim Blue', color: '#3b82f6' },
  { label: 'Khaki Beige', color: '#d4a373' },
  { label: 'Forest Green', color: '#166534' },
  { label: 'Light Slate', color: '#94a3b8' },
];

const SHOES_COLORS = [
  { label: 'Crisp White', color: '#ffffff' },
  { label: 'Jet Black', color: '#18181b' },
  { label: 'Sport Red', color: '#ef4444' },
  { label: 'Royal Blue', color: '#3b82f6' },
  { label: 'Tan Leather', color: '#92400e' },
];

const ACCESSORIES: { id: AccessoryType; label: string; icon: string }[] = [
  { id: 'crown', label: 'Gold Crown', icon: '👑' },
  { id: 'cap', label: 'Varsity Cap', icon: '🧢' },
  { id: 'glasses', label: 'Study Glasses', icon: '👓' },
  { id: 'pastor_collar', label: 'Pastor Cross', icon: '✝️' },
  { id: 'alfa_cap', label: 'Kufi Cap', icon: '👳' },
  { id: 'prayer_beads', label: 'Tasbih Beads', icon: '📿' },
  { id: 'none', label: 'None', icon: '❌' },
];

export const MatriculationModal: React.FC = () => {
  const { stats, registerStudentProfile, loginStudentProfile, setPlayerCustomization, addToast } = useGame();

  // Mode: 'signin' | 'register_info' | 'fate_roll' | 'customize'
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [registerStep, setRegisterStep] = useState<'info' | 'fate' | 'customize'>('info');

  // Sign In Form States
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<CharacterGender>('male');
  const [selectedFaculty, setSelectedFaculty] = useState<string>(LU_FACULTIES[0].faculty);
  const [department, setDepartment] = useState<string>(LU_FACULTIES[0].departments[0]);
  const [generatedMatricNo, setGeneratedMatricNo] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Socioeconomic Roll States
  const [isRolling, setIsRolling] = useState(false);
  const [rollingCandidate, setRollingCandidate] = useState<SocioeconomicStatus>('lapo');
  const [rollResult, setRollResult] = useState<SocioeconomicStatus | null>(null);

  // Character Customization Draft
  const [draftCustomization, setDraftCustomization] = useState<CharacterCustomization>({
    ...DEFAULT_PLAYER_CUSTOMIZATION,
    gender: 'male',
  });
  const [customTab, setCustomTab] = useState<'hair' | 'outfit' | 'skin' | 'shoes' | 'accessories'>('hair');

  // 3D Turntable Ref
  const canvasRef = useRef<HTMLDivElement>(null);
  const characterInstanceRef = useRef<CharacterModelInstance | null>(null);

  // Generate random Matric No preview
  useEffect(() => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    setGeneratedMatricNo(`LU/24/${randomDigits}`);
  }, []);

  // Update department options when faculty changes
  const currentFacultyDepartments =
    LU_FACULTIES.find((f) => f.faculty === selectedFaculty)?.departments || LU_FACULTIES[0].departments;

  const handleFacultyChange = (newFaculty: string) => {
    setSelectedFaculty(newFaculty);
    const facultyObj = LU_FACULTIES.find((f) => f.faculty === newFaculty);
    if (facultyObj && facultyObj.departments.length > 0) {
      setDepartment(facultyObj.departments[0]);
    }
  };

  // Sync draft customization gender
  const handleGenderChange = (newGender: CharacterGender) => {
    setGender(newGender);
    setDraftCustomization({
      ...(newGender === 'female' ? DEFAULT_FEMALE_CUSTOMIZATION : DEFAULT_PLAYER_CUSTOMIZATION),
      gender: newGender,
      hairStyle: newGender === 'female' ? 'braids' : 'fade',
      shirtColor: newGender === 'female' ? '#f43f5e' : '#16a34a',
    });
  };

  // Initialize & Update 3D Turntable when in 'customize' step
  useEffect(() => {
    if (registerStep !== 'customize' || !canvasRef.current) return;

    const container = canvasRef.current;
    container.innerHTML = '';

    const width = container.clientWidth || 240;
    const height = container.clientHeight || 280;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50);
    camera.position.set(0, 1.9, 4.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xcfd8dc, 1.2);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(3, 5, 4);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    backLight.position.set(-3, 3, -3);
    scene.add(backLight);

    // Platform
    const platGeo = new THREE.CylinderGeometry(1.2, 1.3, 0.1, 32);
    const platMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 });
    const platform = new THREE.Mesh(platGeo, platMat);
    platform.position.y = -0.05;
    platform.receiveShadow = true;
    scene.add(platform);

    const charInstance = createCharacterModel(draftCustomization);
    charInstance.group.position.set(0, 0, 0);
    scene.add(charInstance.group);
    characterInstanceRef.current = charInstance;

    let animId: number;
    let elapsed = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      elapsed += 1 / 60;
      if (charInstance.group) {
        charInstance.group.rotation.y += 0.008;
      }
      charInstance.update(1 / 60, elapsed);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [registerStep]);

  // Update 3D preview whenever draftCustomization changes
  useEffect(() => {
    if (characterInstanceRef.current) {
      characterInstanceRef.current.updateConfig(draftCustomization);
    }
  }, [draftCustomization]);

  // If already registered, do not render modal
  if (stats.isRegistered) {
    return null;
  }

  // =========================================================================
  // SIGN IN SUBMISSION HANDLER
  // =========================================================================
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanId = loginIdentifier.trim();
    const cleanPass = loginPassword.trim();

    if (!cleanId || !cleanPass) {
      setLoginError('Please enter your Username / Matric No and password.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const match = await authenticateStudent(cleanId, cleanPass);
      if (match) {
        loginStudentProfile(match);
      } else {
        setLoginError('Invalid credentials. Check your username/matric number and password.');
      }
    } catch {
      setLoginError('Authentication error. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // =========================================================================
  // SIGN UP STEP 1 SUBMISSION -> FATE ROLL
  // =========================================================================
  const handleProceedToFateRoll = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');

    const trimmedUser = username.trim();
    const cleanPass = password.trim();

    if (!trimmedUser || trimmedUser.length < 3) {
      setRegisterError('Student username must be at least 3 characters long.');
      return;
    }

    if (!cleanPass || cleanPass.length < 4) {
      setRegisterError('Please choose a password with at least 4 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { usernameExists, emailExists } = await checkStudentAccountExists(trimmedUser, email);
      if (usernameExists) {
        setRegisterError(`The username "${trimmedUser}" is already taken. Please choose another.`);
        setIsSubmitting(false);
        return;
      }
      if (emailExists) {
        setRegisterError('This email is already associated with an account. Sign in instead.');
        setIsSubmitting(false);
        return;
      }
    } catch {
      // Continue gracefully
    }
    setIsSubmitting(false);

    // Proceed to Fate Roll step
    setRegisterStep('fate');
    setIsRolling(true);

    // 15% Nepo Baby / 85% Lapo Hustler probability
    const outcome: SocioeconomicStatus = Math.random() < 0.15 ? 'nepo' : 'lapo';

    let toggleCount = 0;
    const interval = setInterval(() => {
      setRollingCandidate((prev) => (prev === 'nepo' ? 'lapo' : 'nepo'));
      toggleCount++;
      if (toggleCount >= 18) {
        clearInterval(interval);
        setRollingCandidate(outcome);
        setRollResult(outcome);
        setIsRolling(false);
      }
    }, 110);
  };

  // =========================================================================
  // PROCEED FROM FATE ROLL TO CHARACTER CUSTOMIZATION
  // =========================================================================
  const handleProceedToCustomization = () => {
    setRegisterStep('customize');
  };

  // =========================================================================
  // FINALIZE REGISTRATION & ENTER CAMPUS
  // =========================================================================
  const handleFinalizeRegistration = async () => {
    if (!rollResult) return;

    const matricNo = generatedMatricNo;
    const studentId = `student_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const initialBalance = rollResult === 'nepo' ? 250000 : 15000;
    const initialMood = rollResult === 'nepo' ? 100 : 85;

    const account: StudentAccount = {
      username: username.trim(),
      matricNo,
      password: password.trim(),
      email: email.trim() || undefined,
      gender,
      department,
      faculty: selectedFaculty,
      level: '100 Level (Fresher)',
      status: rollResult,
      balance: initialBalance,
      customization: draftCustomization,
      createdAt: new Date().toISOString(),
    };

    // Save account locally & to database
    await saveStudentAccount(account);

    // Explicitly upsert student to Supabase backend
    await registerStudentToDatabase({
      matricNo,
      fullName: username.trim(),
      password: password.trim(),
      pin: password.trim(),
      email: email.trim() || undefined,
      gender,
      faculty: selectedFaculty,
      department,
      level: '100 Level (Fresher)',
      status: rollResult === 'nepo' ? 'Nepo Baby' : 'Lapo Hustler',
      cash: initialBalance,
      classesAttended: 0,
    });

    // Save to legacy registry database for compatibility
    await saveRegisteredStudent({
      id: studentId,
      username: username.trim(),
      matricNo,
      department,
      level: '100 Level (Fresher)',
      status: rollResult,
      gender,
      email: email.trim() || undefined,
      balance: initialBalance,
      cgpa: null,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      isOnline: true,
    });

    // Save customized avatar
    setPlayerCustomization(draftCustomization);

    // Update GameContext state
    registerStudentProfile({
      username: username.trim(),
      matricNo,
      department,
      faculty: selectedFaculty,
      status: rollResult,
      gender,
      email: email.trim() || undefined,
      balance: initialBalance,
      mood: initialMood,
    });

    if (rollResult === 'nepo') {
      addToast(`👑 Welcome to Liids University, Scholar! You rolled NEPO BABY status with ₦250,000!`, 'success');
    } else {
      addToast(`🎒 Welcome to Liids University, Hustler! You rolled LAPO status with micro-loan access and hustle boosts!`, 'success');
    }
  };

  // Randomize Character Outfit
  const handleRandomize = () => {
    const randomSkin = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)].color;
    const hairList = gender === 'female' ? FEMALE_HAIR_STYLES : MALE_HAIR_STYLES;
    const randomHair = hairList[Math.floor(Math.random() * hairList.length)].id;
    const randomHairColor = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)].color;
    const randomShirt = SHIRT_COLORS[Math.floor(Math.random() * SHIRT_COLORS.length)].color;
    const randomPattern = SHIRT_PATTERNS[Math.floor(Math.random() * SHIRT_PATTERNS.length)].id;
    const randomPants = PANTS_COLORS[Math.floor(Math.random() * PANTS_COLORS.length)].color;
    const randomShoes = SHOES_COLORS[Math.floor(Math.random() * SHOES_COLORS.length)].color;
    const randomAcc = ACCESSORIES[Math.floor(Math.random() * ACCESSORIES.length)].id;

    setDraftCustomization({
      gender,
      skinTone: randomSkin,
      hairStyle: randomHair,
      hairColor: randomHairColor,
      shirtColor: randomShirt,
      shirtPattern: randomPattern,
      pantsColor: randomPants,
      shoesColor: randomShoes,
      accessory: randomAcc,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto pointer-events-auto">
      <div className="relative w-full max-w-2xl my-auto rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Decorative Top Accent Banner */}
        <div className="h-3 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600" />

        {/* Portal Header */}
        <div className="px-6 pt-5 pb-3 text-center border-b border-slate-200">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md border border-emerald-400 mb-2">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            Liids University (LU), Ibadan
          </h2>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mt-0.5">
            STUDENT PORTAL & CAMPUS LIFE 2026/2027
          </p>

          {/* Mode Switcher Tabs (Sign In vs Register) - Only on initial screens */}
          {registerStep === 'info' && (
            <div className="mt-4 flex rounded-xl bg-slate-100 p-1 max-w-xs mx-auto border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setLoginError('');
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setRegisterError('');
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                <span>New Student</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6">
          {/* ================================================================= */}
          {/* SCREEN 1: SIGN IN TAB                                             */}
          {/* ================================================================= */}
          {authMode === 'signin' && registerStep === 'info' && (
            <form onSubmit={handleSignIn} className="space-y-4 max-w-md mx-auto">
              <div className="text-center mb-4">
                <h3 className="text-sm font-bold text-slate-900">Sign in to Your Student Account</h3>
                <p className="text-xs text-slate-500 mt-0.5">Enter your Username, Matric No, or Email to continue</p>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Username / Matric / Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Username, Matric No, or Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. Femi_Codes or LU/24/0982"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter student password"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{isLoggingIn ? 'Signing In...' : 'Sign In to Campus'}</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
                >
                  Fresher or new scholar? Click here to Register as New Student →
                </button>
              </div>
            </form>
          )}

          {/* ================================================================= */}
          {/* SCREEN 2: REGISTER STEP 1 (STUDENT INFO & GENDER & DEPARTMENTS)   */}
          {/* ================================================================= */}
          {authMode === 'register' && registerStep === 'info' && (
            <form onSubmit={handleProceedToFateRoll} className="space-y-3.5">
              {registerError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{registerError}</span>
                </div>
              )}

              {/* Username & Password Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Username */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Student Username / Alias <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <User className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. Adebayo_LU"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Create Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 4 characters"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-9 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Optional Email & Gender Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Optional Email */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Mail className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. student@leadcity.edu.ng"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Optional: for notices and account recovery</span>
                </div>

                {/* Gender-Based Character Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Character Gender <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleGenderChange('male')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        gender === 'male'
                          ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-400/40 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-base">👦</span>
                      <span>Male</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenderChange('female')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        gender === 'female'
                          ? 'bg-pink-50 border-pink-500 text-pink-700 ring-2 ring-pink-400/40 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-base">👧</span>
                      <span>Female</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Faculty & Department Selection */}
              <div className="space-y-3 pt-1 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Faculty <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedFaculty}
                    onChange={(e) => handleFacultyChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                  >
                    {LU_FACULTIES.map((f) => (
                      <option key={f.faculty} value={f.faculty}>
                        {f.faculty}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                  >
                    {currentFacultyDepartments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Matric No & Level Preview */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span className="font-mono">
                  Matric: <strong className="text-emerald-700">{generatedMatricNo}</strong>
                </span>
                <span className="font-semibold text-slate-700">100 Level (Fresher)</span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? 'Verifying...' : 'Proceed to Socioeconomic Fate Roll'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                >
                  Already registered? Switch to Sign In →
                </button>
              </div>
            </form>
          )}

          {/* ================================================================= */}
          {/* SCREEN 3: FATE ROLL (NEPO BABY 15% vs LAPO HUSTLER 85%)          */}
          {/* ================================================================= */}
          {registerStep === 'fate' && (
            <div className="space-y-4 text-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Step 2 of 3 • Socioeconomic Allocation
                </span>
                <h3 className="text-base font-black text-slate-900 mt-0.5">
                  The Great Nigerian Campus Fate Roll
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Every LU fresher is placed by divine luck into one of two campus classes:
                </p>
              </div>

              {/* Rolling Animation Card */}
              <div
                className={`p-6 rounded-3xl border-2 transition-all duration-200 ${
                  rollingCandidate === 'nepo'
                    ? 'bg-gradient-to-br from-amber-50 to-yellow-100/60 border-amber-400 shadow-xl'
                    : 'bg-gradient-to-br from-emerald-50 to-teal-100/60 border-emerald-400 shadow-xl'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-md mb-3 bg-white border border-slate-200">
                  {rollingCandidate === 'nepo' ? '👑' : '🎒'}
                </div>

                <div className="text-xs font-black uppercase tracking-wider text-slate-500">
                  {isRolling ? 'Rolling Random Destiny...' : 'Allocated Socioeconomic Status:'}
                </div>

                <h2
                  className={`text-2xl font-black mt-1 ${
                    rollingCandidate === 'nepo' ? 'text-amber-800' : 'text-emerald-800'
                  }`}
                >
                  {rollingCandidate === 'nepo' ? '👑 NEPO BABY (15% Luck)' : '🎒 LAPO HUSTLER (85% Realities)'}
                </h2>

                <div className="mt-3 text-xs text-slate-600 max-w-sm mx-auto">
                  {rollingCandidate === 'nepo' ? (
                    <span>
                      Granted <strong>₦250,000 monthly allowance</strong>, pristine starting mood, and -50% energy drain!
                    </span>
                  ) : (
                    <span>
                      Starts with <strong>₦15,000 pocket money</strong>, access to LAPO micro-loans, and +50% XP profit on campus hustles!
                    </span>
                  )}
                </div>
              </div>

              {/* Action: Proceed to Customization */}
              {!isRolling && rollResult && (
                <div className="pt-2 animate-in fade-in duration-300">
                  <button
                    onClick={handleProceedToCustomization}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Customize Your {gender === 'female' ? 'Female' : 'Male'} Character Avatar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* SCREEN 4: IMMEDIATE GENDER-BASED CHARACTER CUSTOMIZATION         */}
          {/* ================================================================= */}
          {registerStep === 'customize' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Step 3 of 3 • Character Studio
                  </span>
                  <h3 className="text-base font-black text-slate-900">
                    Design Your Student Avatar ({gender === 'female' ? 'Female' : 'Male'})
                  </h3>
                </div>

                <button
                  onClick={handleRandomize}
                  title="Randomize style"
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Random</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Left: 3D Turntable Preview */}
                <div className="md:col-span-5 h-64 md:h-72 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden">
                  <div ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-white/90 backdrop-blur-xs text-[10px] font-semibold text-slate-600 border border-slate-200 shadow-2xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    <span>3D Live Avatar</span>
                  </div>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-900/60 text-white text-[9px] font-mono pointer-events-none">
                    Auto-rotating • 3D View
                  </div>
                </div>

                {/* Right: Customization Controls */}
                <div className="md:col-span-7 flex flex-col justify-between">
                  {/* Category Tabs */}
                  <div className="flex gap-1 overflow-x-auto no-scrollbar border-b border-slate-200 pb-1.5 mb-2.5">
                    {[
                      { id: 'hair', label: 'Hairstyle', icon: Scissors },
                      { id: 'outfit', label: 'Outfit', icon: Shirt },
                      { id: 'skin', label: 'Skin Tone', icon: User },
                      { id: 'shoes', label: 'Shoes', icon: CheckCircle2 },
                      { id: 'accessories', label: 'Accessories', icon: Crown },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setCustomTab(tab.id as any)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer ${
                            customTab === tab.id
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab Panels */}
                  <div className="max-h-52 overflow-y-auto pr-1 space-y-3">
                    {/* 1. Hairstyle Tab */}
                    {customTab === 'hair' && (
                      <div className="space-y-2.5">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                            {gender === 'female' ? 'Female Hairstyles' : 'Male Hairstyles'}
                          </label>
                          <div className="grid grid-cols-2 gap-1.5">
                            {(gender === 'female' ? FEMALE_HAIR_STYLES : MALE_HAIR_STYLES).map((h) => (
                              <button
                                key={h.id}
                                onClick={() => setDraftCustomization((p) => ({ ...p, hairStyle: h.id }))}
                                className={`p-2 rounded-xl text-xs font-bold border text-left transition-all cursor-pointer ${
                                  draftCustomization.hairStyle === h.id
                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-400'
                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                {h.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                            Hair Color
                          </label>
                          <div className="flex gap-1.5 flex-wrap">
                            {HAIR_COLORS.map((c) => (
                              <button
                                key={c.color}
                                onClick={() => setDraftCustomization((p) => ({ ...p, hairColor: c.color }))}
                                title={c.label}
                                className={`w-7 h-7 rounded-xl border-2 transition-transform cursor-pointer ${
                                  draftCustomization.hairColor === c.color ? 'scale-110 border-emerald-500 ring-2 ring-emerald-300' : 'border-slate-300'
                                }`}
                                style={{ backgroundColor: c.color }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2. Outfit Tab */}
                    {customTab === 'outfit' && (
                      <div className="space-y-2.5">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                            Fabric Style & Pattern
                          </label>
                          <div className="grid grid-cols-2 gap-1.5">
                            {SHIRT_PATTERNS.map((p) => (
                              <button
                                key={p.id}
                                onClick={() => setDraftCustomization((prev) => ({ ...prev, shirtPattern: p.id }))}
                                className={`p-2 rounded-xl text-xs font-bold border text-left transition-all cursor-pointer ${
                                  draftCustomization.shirtPattern === p.id
                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-400'
                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                            Shirt / Blouse Color
                          </label>
                          <div className="flex gap-1.5 flex-wrap">
                            {SHIRT_COLORS.map((c) => (
                              <button
                                key={c.color}
                                onClick={() => setDraftCustomization((p) => ({ ...p, shirtColor: c.color }))}
                                title={c.label}
                                className={`w-7 h-7 rounded-xl border-2 transition-transform cursor-pointer ${
                                  draftCustomization.shirtColor === c.color ? 'scale-110 border-emerald-500 ring-2 ring-emerald-300' : 'border-slate-300'
                                }`}
                                style={{ backgroundColor: c.color }}
                              />
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                            Pants / Trousers Color
                          </label>
                          <div className="flex gap-1.5 flex-wrap">
                            {PANTS_COLORS.map((c) => (
                              <button
                                key={c.color}
                                onClick={() => setDraftCustomization((p) => ({ ...p, pantsColor: c.color }))}
                                title={c.label}
                                className={`w-7 h-7 rounded-xl border-2 transition-transform cursor-pointer ${
                                  draftCustomization.pantsColor === c.color ? 'scale-110 border-emerald-500 ring-2 ring-emerald-300' : 'border-slate-300'
                                }`}
                                style={{ backgroundColor: c.color }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 3. Skin Tone Tab */}
                    {customTab === 'skin' && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
                          Select Skin Tone
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {SKIN_TONES.map((s) => (
                            <button
                              key={s.color}
                              onClick={() => setDraftCustomization((p) => ({ ...p, skinTone: s.color }))}
                              className={`p-2 rounded-xl border flex items-center gap-2 text-xs font-semibold cursor-pointer transition-all ${
                                draftCustomization.skinTone === s.color
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-400'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <span className="w-5 h-5 rounded-lg border border-black/10 shrink-0" style={{ backgroundColor: s.color }} />
                              <span>{s.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 4. Shoes Tab */}
                    {customTab === 'shoes' && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
                          Footwear Color
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {SHOES_COLORS.map((s) => (
                            <button
                              key={s.color}
                              onClick={() => setDraftCustomization((p) => ({ ...p, shoesColor: s.color }))}
                              className={`p-2 rounded-xl border flex items-center gap-2 text-xs font-semibold cursor-pointer transition-all ${
                                draftCustomization.shoesColor === s.color
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-400'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <span className="w-5 h-5 rounded-lg border border-black/10 shrink-0" style={{ backgroundColor: s.color }} />
                              <span>{s.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 5. Accessories Tab */}
                    {customTab === 'accessories' && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
                          Student Accessory
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {ACCESSORIES.map((a) => (
                            <button
                              key={a.id}
                              onClick={() => setDraftCustomization((p) => ({ ...p, accessory: a.id }))}
                              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                                draftCustomization.accessory === a.id
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-400'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <span className="text-base">{a.icon}</span>
                              <span>{a.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Final Submit Button */}
                  <div className="pt-3 border-t border-slate-200">
                    <button
                      onClick={handleFinalizeRegistration}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Avatar & Enter Liids University 🎓</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
