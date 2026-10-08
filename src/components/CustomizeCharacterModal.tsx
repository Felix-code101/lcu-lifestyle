import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useGame } from '../context/GameContext';
import { createCharacterModel, type CharacterModelInstance } from './CharacterModel';
import type { CharacterCustomization, HairStyle, AccessoryType, ShirtPattern, CharacterGender } from '../types/game';
import {
  X,
  Sparkles,
  Shuffle,
  Check,
  Crown,
  Shirt,
  User,
  Scissors,
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

const MALE_HAIR_STYLES: { id: HairStyle; label: string; icon: string }[] = [
  { id: 'fade', label: 'High Fade', icon: '💈' },
  { id: 'waves', label: '360 Waves', icon: '🌊' },
  { id: 'afro', label: 'Afro Puff', icon: '✨' },
  { id: 'dreads', label: 'Dreadlocks', icon: '🦁' },
  { id: 'braids', label: 'Cornrows', icon: '🪮' },
  { id: 'short', label: 'Buzz Cut', icon: '✂️' },
  { id: 'none', label: 'Clean Shave', icon: '✨' },
];

const FEMALE_HAIR_STYLES: { id: HairStyle; label: string; icon: string }[] = [
  { id: 'bob', label: 'Sleek Bob', icon: '💁‍♀️' },
  { id: 'ponytail', label: 'High Ponytail', icon: '👱‍♀️' },
  { id: 'gele', label: 'Traditional Gele', icon: '👑' },
  { id: 'braids', label: 'Fulani Braids', icon: '🪮' },
  { id: 'afro', label: 'Afro Puff', icon: '✨' },
  { id: 'dreads', label: 'Sisterlocks', icon: '🦁' },
  { id: 'short', label: 'Chic Pixie Cut', icon: '✂️' },
  { id: 'none', label: 'Natural Clean', icon: '✨' },
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

const SHIRT_PATTERNS: { id: ShirtPattern; label: string; badge?: string }[] = [
  { id: 'ankara', label: 'Ankara Wax' },
  { id: 'plain', label: 'Solid Color' },
  { id: 'stripes', label: 'Varsity Stripe' },
  { id: 'pastor_vestment', label: 'Clerical Cassock & Stole', badge: 'Pastor Rank 3' },
  { id: 'jalabiya_robe', label: 'Gold Embroidered Jalabiya', badge: 'Alfa Rank 3' },
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

const ACCESSORIES: { id: AccessoryType; label: string; icon: string; badge?: string; desc?: string }[] = [
  { id: 'crown', label: 'Gold Crown', icon: '👑', desc: 'Floating 3D gold royal crown' },
  { id: 'cap', label: 'Varsity Cap', icon: '🧢', desc: 'Campus student style' },
  { id: 'glasses', label: 'Study Glasses', icon: '👓', desc: 'Intellectual wire-frames' },
  { id: 'pastor_collar', label: 'Clerical Collar & Cross', icon: '✝️', badge: 'Pastor Rank 3', desc: 'White tab collar with golden pectoral cross' },
  { id: 'alfa_cap', label: 'Kufi Prayer Cap', icon: '👳', badge: 'Alfa Rank 3', desc: 'Embroidered Islamic cylindrical kufi cap' },
  { id: 'prayer_beads', label: 'Tasbih Prayer Beads', icon: '📿', badge: 'Rank 2+', desc: 'Polished mahogany beads with emerald tassel' },
  { id: 'none', label: 'None', icon: '❌', desc: 'No accessory' },
];

type CustomTab = 'skin' | 'hair' | 'shirt' | 'pants' | 'shoes' | 'accessories';

export const CustomizeCharacterModal: React.FC = () => {
  const { playerCustomization, setPlayerCustomization, setIsWardrobeOpen, addToast, stats } = useGame();

  const [draftConfig, setDraftConfig] = useState<CharacterCustomization>({
    gender: playerCustomization.gender || stats.gender || 'male',
    ...playerCustomization,
  });
  const [activeTab, setActiveTab] = useState<CustomTab>('shirt');

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const characterInstanceRef = useRef<CharacterModelInstance | null>(null);

  const currentGender = draftConfig.gender || 'male';
  const currentHairStyles = currentGender === 'female' ? FEMALE_HAIR_STYLES : MALE_HAIR_STYLES;

  const handleGenderSwitch = (newGender: CharacterGender) => {
    const defaultHair = newGender === 'female' ? 'bob' : 'fade';
    setDraftConfig((prev) => ({
      ...prev,
      gender: newGender,
      hairStyle: defaultHair,
    }));
    addToast(`Switched avatar base to ${newGender === 'female' ? 'Female' : 'Male'} student!`, 'info');
  };

  // 3D Turntable Preview Scene Setup
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f8fafc');

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 5.2);
    camera.lookAt(0, 1.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.5, 0);
    controls.enablePan = false;
    controls.minDistance = 3.5;
    controls.maxDistance = 7.0;
    controls.minPolarAngle = Math.PI / 4;
    controls.maxPolarAngle = Math.PI / 1.8;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0;

    // Studio Lighting
    const hemiLight = new THREE.HemisphereLight('#ffffff', '#e2e8f0', 1.4);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#fffdf5', 1.8);
    keyLight.position.set(4, 5, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#e0f2fe', 0.8);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    // Circular Display Turntable Pedestal
    const pedGeo = new THREE.CylinderGeometry(1.2, 1.3, 0.2, 32);
    const pedMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3 });
    const pedestal = new THREE.Mesh(pedGeo, pedMat);
    pedestal.position.y = -0.1;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Initial character model instance
    const charInstance = createCharacterModel(draftConfig);
    characterInstanceRef.current = charInstance;
    scene.add(charInstance.group);

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      controls.update();
      charInstance.update(delta, elapsed);
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update 3D preview whenever draftConfig changes
  useEffect(() => {
    if (characterInstanceRef.current) {
      characterInstanceRef.current.updateConfig(draftConfig);
    }
  }, [draftConfig]);

  // Save changes to state & localStorage
  const handleSave = () => {
    setPlayerCustomization(draftConfig);
    addToast('Avatar style saved to student profile! 🌟', 'success');
    setIsWardrobeOpen(false);
  };

  // Generate random stylish combination
  const handleRandomize = () => {
    const activeHairList = (draftConfig.gender || 'male') === 'female' ? FEMALE_HAIR_STYLES : MALE_HAIR_STYLES;
    const randomSkin = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)].color;
    const randomHair = activeHairList[Math.floor(Math.random() * activeHairList.length)].id;
    const randomHairColor = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)].color;
    const randomShirt = SHIRT_COLORS[Math.floor(Math.random() * SHIRT_COLORS.length)].color;
    const randomPattern = SHIRT_PATTERNS[Math.floor(Math.random() * SHIRT_PATTERNS.length)].id;
    const randomPants = PANTS_COLORS[Math.floor(Math.random() * PANTS_COLORS.length)].color;
    const randomShoes = SHOES_COLORS[Math.floor(Math.random() * SHOES_COLORS.length)].color;
    const randomAcc = ACCESSORIES[Math.floor(Math.random() * ACCESSORIES.length)].id;

    setDraftConfig((prev) => ({
      ...prev,
      skinTone: randomSkin,
      hairStyle: randomHair,
      hairColor: randomHairColor,
      shirtColor: randomShirt,
      shirtPattern: randomPattern,
      pantsColor: randomPants,
      shoesColor: randomShoes,
      accessory: randomAcc,
    }));
    addToast('Randomized outfit!', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[90vh] max-h-[720px] rounded-3xl bg-white border border-slate-200 shadow-2xl flex flex-col md:flex-row overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={() => setIsWardrobeOpen(false)}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Column: Interactive 3D Turntable Preview */}
        <div className="relative w-full md:w-5/12 h-64 md:h-full bg-slate-50 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200">
          <div ref={canvasContainerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Turntable Hint */}
          <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-xs text-[11px] font-semibold text-slate-600 flex items-center gap-1.5 pointer-events-none">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>3D Studio Preview</span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between gap-2 pointer-events-auto">
            <button
              onClick={handleRandomize}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 shadow-sm transition-colors"
            >
              <Shuffle className="w-3.5 h-3.5 text-indigo-500" />
              <span>Randomize</span>
            </button>
            <span className="text-[10px] text-slate-400 font-mono">Drag to rotate 360°</span>
          </div>
        </div>

        {/* Right Column: Customization Controls & Tabs */}
        <div className="w-full md:w-7/12 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">Student Wardrobe</h2>
                <p className="text-xs text-slate-500">Customize your avatar appearance on campus</p>
              </div>
            </div>

            {/* Gender Toggle */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => handleGenderSwitch('male')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  (draftConfig.gender || 'male') === 'male'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                👨 Male
              </button>
              <button
                type="button"
                onClick={() => handleGenderSwitch('female')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  draftConfig.gender === 'female'
                    ? 'bg-pink-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                👩 Female
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 px-5 pt-3 pb-2 border-b border-slate-100 overflow-x-auto">
            {[
              { id: 'shirt', label: 'Shirt / Top', icon: Shirt },
              { id: 'hair', label: 'Hair', icon: Scissors },
              { id: 'skin', label: 'Skin', icon: User },
              { id: 'pants', label: 'Pants', icon: Shirt },
              { id: 'shoes', label: 'Shoes', icon: Check },
              { id: 'accessories', label: 'Accessory', icon: Crown },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as CustomTab)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Panels */}
          <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-5">
            {/* 1. Shirt Tab */}
            {activeTab === 'shirt' && (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                    Shirt Style & Pattern
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SHIRT_PATTERNS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setDraftConfig((prev) => ({ ...prev, shirtPattern: p.id }))}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex flex-col justify-between ${
                          draftConfig.shirtPattern === p.id
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span>{p.label}</span>
                        {p.badge && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300 w-fit mt-1.5 font-bold">
                            {p.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                    Shirt Color Palette
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {SHIRT_COLORS.map((c) => (
                      <button
                        key={c.color}
                        onClick={() => setDraftConfig((prev) => ({ ...prev, shirtColor: c.color }))}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                          draftConfig.shirtColor === c.color
                            ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/50'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full shrink-0 shadow-xs border border-black/10"
                          style={{ backgroundColor: c.color }}
                        />
                        <span className="text-[11px] font-semibold text-slate-800 leading-tight">
                          {c.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* 2. Hair Tab */}
            {activeTab === 'hair' && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Hair Style ({currentGender === 'female' ? 'Female' : 'Male'})
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {currentGender === 'female' ? '8 feminine styles' : '7 masculine styles'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {currentHairStyles.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => setDraftConfig((prev) => ({ ...prev, hairStyle: h.id }))}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                          draftConfig.hairStyle === h.id
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="text-base">{h.icon}</span>
                        <span className="truncate">{h.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                    Hair Color
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {HAIR_COLORS.map((c) => (
                      <button
                        key={c.color}
                        onClick={() => setDraftConfig((prev) => ({ ...prev, hairColor: c.color }))}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                          draftConfig.hairColor === c.color
                            ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/50'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full shrink-0 shadow-xs border border-black/10"
                          style={{ backgroundColor: c.color }}
                        />
                        <span className="text-[11px] font-semibold text-slate-800">{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* 3. Skin Tone Tab */}
            {activeTab === 'skin' && (
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                  Skin Tone Palette
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {SKIN_TONES.map((s) => (
                    <button
                      key={s.color}
                      onClick={() => setDraftConfig((prev) => ({ ...prev, skinTone: s.color }))}
                      className={`flex items-center gap-2.5 p-2.5 rounded-2xl border transition-all ${
                        draftConfig.skinTone === s.color
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className="w-7 h-7 rounded-full shrink-0 shadow-md border-2 border-white"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="text-xs font-bold text-slate-800">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Pants Tab */}
            {activeTab === 'pants' && (
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                  Pants & Trousers Color
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PANTS_COLORS.map((c) => (
                    <button
                      key={c.color}
                      onClick={() => setDraftConfig((prev) => ({ ...prev, pantsColor: c.color }))}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                        draftConfig.pantsColor === c.color
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full shrink-0 shadow-xs border border-black/10"
                        style={{ backgroundColor: c.color }}
                      />
                      <span className="text-xs font-semibold text-slate-800">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Shoes Tab */}
            {activeTab === 'shoes' && (
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                  Shoes & Footwear
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {SHOES_COLORS.map((c) => (
                    <button
                      key={c.color}
                      onClick={() => setDraftConfig((prev) => ({ ...prev, shoesColor: c.color }))}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                        draftConfig.shoesColor === c.color
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full shrink-0 shadow-xs border border-black/10"
                        style={{ backgroundColor: c.color }}
                      />
                      <span className="text-xs font-semibold text-slate-800">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Accessories Tab */}
            {activeTab === 'accessories' && (
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                  Accessories & Headwear
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ACCESSORIES.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => setDraftConfig((prev) => ({ ...prev, accessory: acc.id }))}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
                        draftConfig.accessory === acc.id
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/70'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-2xl shrink-0">{acc.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-900">{acc.label}</span>
                          {acc.badge && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300 font-bold">
                              {acc.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">
                          {acc.desc || 'Campus fashion style'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50/80">
            <button
              onClick={() => setIsWardrobeOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Save & Wear Outfit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
