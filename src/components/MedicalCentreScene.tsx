import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useGame } from '../context/GameContext';
import { createCharacterModel, type CharacterModelInstance } from './CharacterModel';
import { CAMPUS_NPCS } from '../data/npcData';
import { RemoteStudentModal } from './RemoteStudentModal';
import type { RemotePlayer, CampusNPC } from '../types/game';
import {
  Bed,
  Activity,
  RotateCcw,
  X,
  Stethoscope,
  Pill,
  ShieldCheck,
  ClipboardList,
  ArrowRight,
} from 'lucide-react';

interface ScreenBadge {
  id: string;
  label: string;
  role?: string;
  icon?: string;
  screenX: number;
  screenY: number;
  visible: boolean;
  isNPC?: boolean;
  npc?: CampusNPC;
  isRemotePlayer?: boolean;
  remotePlayer?: RemotePlayer;
  statusBadge?: string;
  actionType?: 'bed' | 'nurse' | 'cabinet' | 'counter';
}

export const MedicalCentreScene: React.FC<{ remotePlayers?: RemotePlayer[] }> = ({ remotePlayers = [] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    stats,
    addToast,
    playerCustomization,
    setStats,
    resetCameraTrigger,
    navigateToLocation,
    buyGlucoseDripTreatment,
    buyMedicalExemptionNote,
    restOnClinicBed,
  } = useGame();

  const [screenBadges, setScreenBadges] = useState<ScreenBadge[]>([]);
  const [selectedRemoteStudent, setSelectedRemoteStudent] = useState<RemotePlayer | null>(null);
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const [isBedRestModalOpen, setIsBedRestModalOpen] = useState(false);
  const [isPharmacyModalOpen, setIsPharmacyModalOpen] = useState(false);
  const [isRestingAnimation, setIsRestingAnimation] = useState(false);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const charactersGroupRef = useRef<THREE.Group | null>(null);
  const remotePlayersGroupRef = useRef<THREE.Group | null>(null);
  const remotePlayerModelsRef = useRef<Map<string, { model: CharacterModelInstance; player: RemotePlayer }>>(new Map());
  const playerModelRef = useRef<CharacterModelInstance | null>(null);
  const nurseModelRef = useRef<CharacterModelInstance | null>(null);

  // Find Nurse Funke NPC data
  const nurseNPC = CAMPUS_NPCS.find((n) => n.id === 'npc_nurse_funke') || {
    id: 'npc_nurse_funke',
    name: 'Nurse Funke',
    role: 'Chief Nursing Officer',
    avatarIcon: '👩‍⚕️',
    location: 'medical_centre',
    position: [0, 0, 1.4],
    rotation: Math.PI,
    customization: {
      skinTone: '#6d4527',
      shirtColor: '#f8fafc',
      shirtPattern: 'plain',
      pantsColor: '#0284c7',
      shoesColor: '#ffffff',
      hairStyle: 'braids',
      hairColor: '#18181b',
      accessory: 'glasses',
    },
    dialogueIntro: "Welcome to Liids University Medical Centre. How can we care for your health today?",
    dialogueLines: [
      "Exam stress is no joke! If you feel faint or dizzy, do not hesitate to report here immediately.",
      "Always drink clean water and avoid taking unnecessary all-nighters without proper nutrition.",
    ],
    options: [],
  };

  // Treatment Handlers
  const handleGlucoseDrip = () => {
    if (buyGlucoseDripTreatment()) {
      setIsConsultModalOpen(false);
    }
  };

  const handleExemptionNote = () => {
    if (buyMedicalExemptionNote()) {
      setIsConsultModalOpen(false);
    }
  };

  const handleVitalsCheck = () => {
    setStats((prev) => ({
      ...prev,
      energy: Math.min(prev.maxEnergy, prev.energy + 10),
      mood: Math.min(100, prev.mood + 10),
      xp: prev.xp + 15,
    }));
    addToast('🩺 BP & Vitals Check: 118/76 mmHg. Resting pulse: 72 bpm. Heart rhythm normal! (+10%⚡, +10 Mood)', 'success');
    setIsConsultModalOpen(false);
  };

  const handleBedRest = () => {
    setIsBedRestModalOpen(false);
    setIsRestingAnimation(true);

    if (playerModelRef.current) {
      // Position avatar on clinic bed
      playerModelRef.current.group.position.set(-2.8, 1.1, -2.5);
      playerModelRef.current.group.rotation.y = Math.PI / 2;
    }

    setTimeout(() => {
      restOnClinicBed();
    }, 1200);

    setTimeout(() => {
      if (playerModelRef.current) {
        // Return avatar to standing position in front of desk
        playerModelRef.current.group.position.set(0, 0, 3.2);
        playerModelRef.current.group.rotation.y = 0;
      }
      setIsRestingAnimation(false);
    }, 2800);
  };

  // Reset Camera Angle
  const handleResetCamera = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(11, 12, 11);
    controlsRef.current.target.set(0, 1.2, 0);
    controlsRef.current.update();
  }, []);

  useEffect(() => {
    if (resetCameraTrigger > 0) {
      handleResetCamera();
    }
  }, [resetCameraTrigger, handleResetCamera]);

  // Sync Remote Multiplayer Players inside Medical Centre
  useEffect(() => {
    const group = remotePlayersGroupRef.current;
    if (!group) return;

    const clinicPlayers = remotePlayers.filter((p) => p.location === 'medical_centre');
    const currentMap = remotePlayerModelsRef.current;

    // Remove disconnected or moved players
    for (const [id, item] of currentMap.entries()) {
      if (!clinicPlayers.some((p) => p.id === id)) {
        group.remove(item.model.group);
        currentMap.delete(id);
      }
    }

    // Add or update active players in clinic
    clinicPlayers.forEach((p, idx) => {
      const defaultX = idx % 2 === 0 ? 3.6 : -4.2;
      const defaultZ = idx % 2 === 0 ? 2.2 : 2.5;
      const px = p.position[0] === 0 ? defaultX : p.position[0];
      const pz = p.position[2] === 0 ? defaultZ : p.position[2];

      if (!currentMap.has(p.id)) {
        const model = createCharacterModel(p.customization);
        model.group.position.set(px, 0, pz);
        model.group.rotation.y = p.rotation;
        model.setWalking(p.isWalking);
        group.add(model.group);
        currentMap.set(p.id, { model, player: p });
      } else {
        const existing = currentMap.get(p.id)!;
        existing.model.group.position.set(px, 0, pz);
        existing.model.group.rotation.y = p.rotation;
        existing.model.setWalking(p.isWalking);
        existing.player = p;
      }
    });
  }, [remotePlayers]);

  // Three.js 3D Scene Initialization
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#0f172a');

    // 2. Camera setup: Isometric Perspective
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 1000);
    camera.position.set(11, 12, 11);
    cameraRef.current = camera;

    // 3. Renderer with antialiasing and ACESFilmicToneMapping
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.15;
    controls.minDistance = 6;
    controls.maxDistance = 26;
    controls.target.set(0, 1.2, 0);
    controlsRef.current = controls;

    // 5. Lighting: Cool bright clinical fluorescent lighting
    const ambientLight = new THREE.AmbientLight('#f0fdfa', 1.35);
    scene.add(ambientLight);

    const mainDaylight = new THREE.DirectionalLight('#e0f2fe', 1.45);
    mainDaylight.position.set(10, 18, 8);
    scene.add(mainDaylight);

    // Overhead Clinical Fluorescent Tube Downlight
    const ceilingClinicSpot = new THREE.SpotLight('#f8fafc', 2.2, 20, Math.PI / 3, 0.35);
    ceilingClinicSpot.position.set(0, 8.5, 0);
    ceilingClinicSpot.target.position.set(0, 0, 0);
    scene.add(ceilingClinicSpot);
    scene.add(ceilingClinicSpot.target);

    // Cool bedside spot lights over patient beds
    const leftBedLight = new THREE.PointLight('#e0f2fe', 1.4, 7);
    leftBedLight.position.set(-2.8, 3.2, -2.5);
    scene.add(leftBedLight);

    const rightBedLight = new THREE.PointLight('#e0f2fe', 1.4, 7);
    rightBedLight.position.set(2.8, 3.2, -2.5);
    scene.add(rightBedLight);

    // 6. Glossy White Linoleum Floor with Reflective Sheen & Mint Clinical Grid
    const floorSize = 16;
    const floorGeo = new THREE.PlaneGeometry(floorSize, floorSize);
    floorGeo.rotateX(-Math.PI / 2);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f8fafc'; // Crisp white linoleum
      ctx.fillRect(0, 0, 512, 512);

      // Delicate clinical mint grid lines
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 3;
      for (let i = 0; i <= 512; i += 64) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 512);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(512, i);
        ctx.stroke();
      }

      // Medical Green Border Inlay
      ctx.strokeStyle = '#0d9488';
      ctx.lineWidth = 5;
      ctx.strokeRect(16, 16, 480, 480);
    }
    const tileTexture = new THREE.CanvasTexture(canvas);
    tileTexture.wrapS = THREE.RepeatWrapping;
    tileTexture.wrapT = THREE.RepeatWrapping;
    tileTexture.repeat.set(2, 2);

    const floorMat = new THREE.MeshStandardMaterial({
      map: tileTexture,
      roughness: 0.18, // Clean high sheen
      metalness: 0.05,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.set(0, 0, 0);
    scene.add(floorMesh);

    // 7. Pale Blue / Mint Green Walls with Medical Baseboard Stripe
    const wallGroup = new THREE.Group();

    // Back Wall (Soft Mint Cyan)
    const backWallGeo = new THREE.BoxGeometry(floorSize, 6.5, 0.25);
    const backWallMat = new THREE.MeshStandardMaterial({ color: '#f0fdfa', roughness: 0.5 });
    const backWall = new THREE.Mesh(backWallGeo, backWallMat);
    backWall.position.set(0, 3.25, -floorSize / 2);
    wallGroup.add(backWall);

    // Back Wall Medical Trim Stripe (Teal / Medical Green)
    const backTrimGeo = new THREE.BoxGeometry(floorSize, 0.35, 0.3);
    const backTrimMat = new THREE.MeshStandardMaterial({ color: '#0d9488', roughness: 0.3 });
    const backTrim = new THREE.Mesh(backTrimGeo, backTrimMat);
    backTrim.position.set(0, 2.8, -floorSize / 2 + 0.05);
    wallGroup.add(backTrim);

    // Left Wall (Soft Mint)
    const leftWallGeo = new THREE.BoxGeometry(0.25, 6.5, floorSize);
    const leftWallMat = new THREE.MeshStandardMaterial({ color: '#f0fdfa', roughness: 0.5 });
    const leftWall = new THREE.Mesh(leftWallGeo, leftWallMat);
    leftWall.position.set(-floorSize / 2, 3.25, 0);
    wallGroup.add(leftWall);

    // Left Wall Trim Stripe
    const leftTrimGeo = new THREE.BoxGeometry(0.3, 0.35, floorSize);
    const leftTrim = new THREE.Mesh(leftTrimGeo, backTrimMat);
    leftTrim.position.set(-floorSize / 2 + 0.05, 2.8, 0);
    wallGroup.add(leftTrim);

    // Medical Centre Wall Red Cross Sign Plaque
    const signPlaqueGeo = new THREE.BoxGeometry(3.6, 1.6, 0.08);
    const signPlaqueMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3 });
    const signPlaque = new THREE.Mesh(signPlaqueGeo, signPlaqueMat);
    signPlaque.position.set(0, 4.6, -floorSize / 2 + 0.16);
    wallGroup.add(signPlaque);

    // Red Cross Horizontal Bar
    const crossHGeo = new THREE.BoxGeometry(1.4, 0.45, 0.12);
    const crossMat = new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.2, emissive: '#dc2626', emissiveIntensity: 0.2 });
    const crossH = new THREE.Mesh(crossHGeo, crossMat);
    crossH.position.set(0, 4.6, -floorSize / 2 + 0.2);
    wallGroup.add(crossH);

    // Red Cross Vertical Bar
    const crossVGeo = new THREE.BoxGeometry(0.45, 1.4, 0.12);
    const crossV = new THREE.Mesh(crossVGeo, crossMat);
    crossV.position.set(0, 4.6, -floorSize / 2 + 0.2);
    wallGroup.add(crossV);

    scene.add(wallGroup);

    // 8. Overhead Fluorescent Ceiling Fixtures
    const ceilingLightsGroup = new THREE.Group();
    [-3, 3].forEach((lx) => {
      const fixtureGeo = new THREE.BoxGeometry(4.2, 0.12, 0.6);
      const fixtureMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.4 });
      const fixture = new THREE.Mesh(fixtureGeo, fixtureMat);
      fixture.position.set(lx, 6.2, 0);
      ceilingLightsGroup.add(fixture);

      // Emissive tube
      const tubeGeo = new THREE.BoxGeometry(3.8, 0.05, 0.35);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: '#ffffff',
        emissive: '#f8fafc',
        emissiveIntensity: 1.6,
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      tube.position.set(lx, 6.13, 0);
      ceilingLightsGroup.add(tube);
    });
    scene.add(ceilingLightsGroup);

    // 9. Function to Build a Detailed Hospital Bed with IV Drip Pole and Privacy Curtains
    const buildHospitalBed = (bedX: number, bedZ: number) => {
      const bedGroup = new THREE.Group();
      bedGroup.position.set(bedX, 0, bedZ);

      // Chromed tubular base frame
      const frameMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.8, roughness: 0.2 });
      const baseFrame = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.5, 4.2), frameMat);
      baseFrame.position.set(0, 0.35, 0);
      bedGroup.add(baseFrame);

      // 4 Wheels / Castors
      const wheelGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 12);
      wheelGeo.rotateZ(Math.PI / 2);
      const wheelMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.6 });
      [
        [-1.0, 0.1, -1.9],
        [1.0, 0.1, -1.9],
        [-1.0, 0.1, 1.9],
        [1.0, 0.1, 1.9],
      ].forEach(([wx, wy, wz]) => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.position.set(wx, wy, wz);
        bedGroup.add(wheel);
      });

      // Pure White Medical Mattress
      const mattressMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.4 });
      const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.35, 3.9), mattressMat);
      mattress.position.set(0, 0.75, 0);
      bedGroup.add(mattress);

      // Raised Incline Backrest / Pillow Support
      const backrest = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.3, 1.2), mattressMat);
      backrest.position.set(0, 0.9, -1.25);
      backrest.rotation.x = 0.2;
      bedGroup.add(backrest);

      // Clinical Pillow
      const pillowGeo = new THREE.BoxGeometry(1.6, 0.18, 0.85);
      const pillowMat = new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.6 });
      const pillow = new THREE.Mesh(pillowGeo, pillowMat);
      pillow.position.set(0, 1.08, -1.35);
      pillow.rotation.x = 0.2;
      bedGroup.add(pillow);

      // Seafoam Blue Clinical Duvet / Folded Sheet
      const sheetMat = new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.5 });
      const sheet = new THREE.Mesh(new THREE.BoxGeometry(2.12, 0.22, 2.5), sheetMat);
      sheet.position.set(0, 0.88, 0.65);
      bedGroup.add(sheet);

      // Folded white sheet turnback
      const foldMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.4 });
      const fold = new THREE.Mesh(new THREE.BoxGeometry(2.14, 0.24, 0.35), foldMat);
      fold.position.set(0, 0.9, -0.5);
      bedGroup.add(fold);

      // Chrome Bed Safety Rails (Left & Right)
      [-1.12, 1.12].forEach((rx) => {
        const railTop = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.4, 8), frameMat);
        railTop.rotateX(Math.PI / 2);
        railTop.position.set(rx, 1.2, 0.2);
        bedGroup.add(railTop);

        [-0.8, 0, 0.8].forEach((rz) => {
          const railPost = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8), frameMat);
          railPost.position.set(rx, 0.9, 0.2 + rz);
          bedGroup.add(railPost);
        });
      });

      // Chrome Headboard & Footboard
      const headboard = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.1, 0.08), frameMat);
      headboard.position.set(0, 1.0, -2.0);
      bedGroup.add(headboard);

      const footboard = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.75, 0.08), frameMat);
      footboard.position.set(0, 0.8, 2.0);
      bedGroup.add(footboard);

      // Bedside Monitor Cart / Vitals Screen
      const cartMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.3 });
      const cart = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.1, 0.7), cartMat);
      cart.position.set(1.5, 0.55, -1.6);
      bedGroup.add(cart);

      // Monitor Screen with ECG Waveform (Glowing Green)
      const monitorBody = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.42, 0.1), new THREE.MeshStandardMaterial({ color: '#1e293b' }));
      monitorBody.position.set(1.5, 1.35, -1.6);
      bedGroup.add(monitorBody);

      const ecgScreen = new THREE.Mesh(
        new THREE.PlaneGeometry(0.48, 0.34),
        new THREE.MeshStandardMaterial({
          color: '#10b981',
          emissive: '#059669',
          emissiveIntensity: 0.8,
        })
      );
      ecgScreen.position.set(1.5, 1.35, -1.54);
      bedGroup.add(ecgScreen);

      // Chrome IV Drip Stand
      const ivGroup = new THREE.Group();
      ivGroup.position.set(-1.5, 0, -1.6);

      // Base with wheels
      const ivBase = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.08, 6), frameMat);
      ivBase.position.set(0, 0.08, 0);
      ivGroup.add(ivBase);

      // Main Vertical Pole
      const ivPole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 3.4, 8), frameMat);
      ivPole.position.set(0, 1.7, 0);
      ivGroup.add(ivPole);

      // Double Hook Crossbar at top
      const ivCross = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8), frameMat);
      ivCross.rotateZ(Math.PI / 2);
      ivCross.position.set(0, 3.3, 0);
      ivGroup.add(ivCross);

      // Saline IV Drip Bag (Translucent Pale Blue with measurement markings)
      const bagMat = new THREE.MeshStandardMaterial({
        color: '#e0f2fe',
        transparent: true,
        opacity: 0.85,
        roughness: 0.1,
      });
      const ivBag = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.35, 0.08), bagMat);
      ivBag.position.set(-0.16, 3.0, 0);
      ivGroup.add(ivBag);

      // Second multivitamin bag (amber-tinted)
      const vitaminBagMat = new THREE.MeshStandardMaterial({
        color: '#fef08a',
        transparent: true,
        opacity: 0.85,
        roughness: 0.1,
      });
      const vitaminBag = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.35, 0.08), vitaminBagMat);
      vitaminBag.position.set(0.16, 3.0, 0);
      ivGroup.add(vitaminBag);

      // Plastic IV Drip Chamber & Tube
      const tubeLine = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 1.8, 6),
        new THREE.MeshStandardMaterial({ color: '#f8fafc', transparent: true, opacity: 0.7 })
      );
      tubeLine.position.set(-0.16, 2.0, 0.2);
      tubeLine.rotation.x = 0.2;
      ivGroup.add(tubeLine);

      bedGroup.add(ivGroup);

      // Blue Privacy Curtains Overhead Track & Curtain Mesh
      const curtainTrackMat = new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.7, roughness: 0.3 });
      const curtainRail = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.06, 0.06), curtainTrackMat);
      curtainRail.position.set(0, 5.2, 0);
      bedGroup.add(curtainRail);

      // Hanging Pale Blue Privacy Curtain
      const curtainMat = new THREE.MeshStandardMaterial({
        color: '#7dd3fc',
        roughness: 0.7,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.88,
      });
      const curtainMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 3.8), curtainMat);
      curtainMesh.position.set(0, 3.3, 0);
      curtainMesh.rotateY(Math.PI / 2);
      curtainMesh.position.x = -1.35;
      bedGroup.add(curtainMesh);

      scene.add(bedGroup);
      return bedGroup;
    };

    // Mount Bed 1 & Bed 2
    buildHospitalBed(-2.8, -2.5);
    buildHospitalBed(2.8, -2.5);

    // 10. Nurse Triage Reception Counter & Examination Desk
    const deskGroup = new THREE.Group();
    deskGroup.position.set(0, 0, 1.4);

    // Modern Curved/L-shaped Reception Counter
    const deskCounterMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.25 });
    const deskMain = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1.15, 0.85), deskCounterMat);
    deskMain.position.set(0, 0.58, 0);
    deskGroup.add(deskMain);

    // Front Decorative Panel (Calm Teal Finish)
    const deskPanelMat = new THREE.MeshStandardMaterial({ color: '#0f766e', roughness: 0.3 });
    const deskPanel = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.85, 0.05), deskPanelMat);
    deskPanel.position.set(0, 0.55, 0.44);
    deskGroup.add(deskPanel);

    // Desk Countertop Surface
    const topSurfaceMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.15 });
    const topSurface = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.08, 1.05), topSurfaceMat);
    topSurface.position.set(0, 1.18, 0);
    deskGroup.add(topSurface);

    // Desktop PC Monitor on Triage Counter
    const pcBase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.03, 12), new THREE.MeshStandardMaterial({ color: '#334155' }));
    pcBase.position.set(-0.8, 1.24, 0);
    deskGroup.add(pcBase);

    const pcStand = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8), new THREE.MeshStandardMaterial({ color: '#64748b' }));
    pcStand.position.set(-0.8, 1.38, 0);
    deskGroup.add(pcStand);

    const pcScreen = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.48, 0.05),
      new THREE.MeshStandardMaterial({ color: '#0f172a' })
    );
    pcScreen.position.set(-0.8, 1.58, 0);
    deskGroup.add(pcScreen);

    // Monitor Display Face (Liids University Medical Portal Display)
    const pcFace = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 0.42),
      new THREE.MeshStandardMaterial({
        color: '#0284c7',
        emissive: '#0369a1',
        emissiveIntensity: 0.6,
      })
    );
    pcFace.position.set(-0.8, 1.58, 0.03);
    deskGroup.add(pcFace);

    // Keyboard & Mouse
    const keyboard = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.18), new THREE.MeshStandardMaterial({ color: '#475569' }));
    keyboard.position.set(-0.8, 1.23, 0.28);
    deskGroup.add(keyboard);

    // Medical Chart Clipboard
    const clipboardMat = new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.7 });
    const clipboard = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.02, 0.45), clipboardMat);
    clipboard.position.set(0.7, 1.23, 0.1);
    clipboard.rotation.y = 0.2;
    deskGroup.add(clipboard);

    // Stethoscope lying on counter
    const stethTorus = new THREE.Mesh(
      new THREE.TorusGeometry(0.14, 0.02, 8, 16, Math.PI * 1.5),
      new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.4 })
    );
    stethTorus.rotateX(Math.PI / 2);
    stethTorus.position.set(1.4, 1.23, 0.12);
    deskGroup.add(stethTorus);

    // Nurse Swivel Desk Chair (Stationed for Nurse Funke)
    const chairMat = new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.5 });
    const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.12, 0.65), chairMat);
    chairSeat.position.set(0, 0.65, -0.6);
    deskGroup.add(chairSeat);

    const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.7, 0.1), chairMat);
    chairBack.position.set(0, 1.05, -0.9);
    deskGroup.add(chairBack);

    scene.add(deskGroup);

    // 11. Large Pharmacy & Medicine Storage Cabinet (Left Wall)
    const cabinetGroup = new THREE.Group();
    cabinetGroup.position.set(-6.2, 0, 1.2);
    cabinetGroup.rotation.y = Math.PI / 2;

    // Cabinet Main Frame
    const cabFrameMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3 });
    const cabBody = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.8, 0.7), cabFrameMat);
    cabBody.position.set(0, 1.9, 0);
    cabinetGroup.add(cabBody);

    // Glass Display Doors
    const cabGlassMat = new THREE.MeshStandardMaterial({
      color: '#e2e8f0',
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
    });
    const cabGlass = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.6, 0.04), cabGlassMat);
    cabGlass.position.set(0, 2.2, 0.36);
    cabinetGroup.add(cabGlass);

    // Cabinet Glass Shelves & Medicine Bottles
    [1.5, 2.2, 2.9].forEach((sy) => {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.04, 0.55), cabGlassMat);
      shelf.position.set(0, sy, 0);
      cabinetGroup.add(shelf);

      // Pill bottles & syrup flasks on shelves
      [-0.8, -0.4, 0, 0.4, 0.8].forEach((bx, idx) => {
        const bottleColor = idx % 2 === 0 ? '#d97706' : '#ffffff';
        const bottleMat = new THREE.MeshStandardMaterial({ color: bottleColor, roughness: 0.2 });
        const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.2, 10), bottleMat);
        bottle.position.set(bx, sy + 0.11, 0);
        cabinetGroup.add(bottle);

        // Bottle Cap
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 8), new THREE.MeshStandardMaterial({ color: '#ffffff' }));
        cap.position.set(bx, sy + 0.23, 0);
        cabinetGroup.add(cap);
      });
    });

    scene.add(cabinetGroup);

    // 12. Mobile Emergency Crash Cart & First Aid Box (Right Wall)
    const cartGroup = new THREE.Group();
    cartGroup.position.set(5.8, 0, 1.2);

    const crashBodyMat = new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.3 });
    const crashBody = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 0.9), crashBodyMat);
    crashBody.position.set(0, 0.75, 0);
    cartGroup.add(crashBody);

    // White First Aid Box with Red Cross
    const faBox = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.32, 0.45), new THREE.MeshStandardMaterial({ color: '#ffffff' }));
    faBox.position.set(0, 1.6, 0);
    cartGroup.add(faBox);

    const faCrossH = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.08, 0.02), crossMat);
    faCrossH.position.set(0, 1.6, 0.23);
    cartGroup.add(faCrossH);

    const faCrossV = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.25, 0.02), crossMat);
    faCrossV.position.set(0, 1.6, 0.23);
    cartGroup.add(faCrossV);

    scene.add(cartGroup);

    // 13. Waiting Chairs & Weighing Scale
    const waitingGroup = new THREE.Group();
    waitingGroup.position.set(-5.6, 0, -2.5);

    // Two Blue Vinyl Waiting Chairs
    [-0.8, 0.8].forEach((cx) => {
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.7), chairMat);
      seat.position.set(cx, 0.45, 0);
      waitingGroup.add(seat);

      const seatBack = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.65, 0.1), chairMat);
      seatBack.position.set(cx, 0.8, -0.32);
      waitingGroup.add(seatBack);

      const seatLegs = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6), new THREE.MeshStandardMaterial({ color: '#94a3b8' }));
      seatLegs.position.set(cx, 0.2, 0);
      waitingGroup.add(seatLegs);
    });

    // Medical Physician Weighing Scale with Chrome Height Rod
    const scaleBase = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 0.7), new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.3 }));
    scaleBase.position.set(2.4, 0.06, 0);
    waitingGroup.add(scaleBase);

    const scaleRod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.5, 8), new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.8 }));
    scaleRod.position.set(2.4, 1.3, -0.28);
    waitingGroup.add(scaleRod);

    const scaleGauge = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 16), new THREE.MeshStandardMaterial({ color: '#ffffff' }));
    scaleGauge.rotateX(Math.PI / 2);
    scaleGauge.position.set(2.4, 2.4, -0.28);
    waitingGroup.add(scaleGauge);

    scene.add(waitingGroup);

    // 14. Decorative Medicinal Plant / Purifying Palm
    const plantGroup = new THREE.Group();
    plantGroup.position.set(5.8, 0, -4.5);

    const potMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.3 });
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.35, 0.85, 16), potMat);
    pot.position.set(0, 0.42, 0);
    plantGroup.add(pot);

    const soilMat = new THREE.MeshStandardMaterial({ color: '#3e2723', roughness: 0.9 });
    const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.08, 16), soilMat);
    soil.position.set(0, 0.84, 0);
    plantGroup.add(soil);

    const leafMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.6 });
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 1.4, 6), leafMat);
      stem.position.set(Math.cos(angle) * 0.22, 1.4, Math.sin(angle) * 0.22);
      stem.rotation.z = Math.cos(angle) * 0.4;
      stem.rotation.x = Math.sin(angle) * 0.4;
      plantGroup.add(stem);
    }
    scene.add(plantGroup);

    // 15. Characters Group
    const charactersGroup = new THREE.Group();
    charactersGroupRef.current = charactersGroup;
    scene.add(charactersGroup);

    // Remote Players Group
    const remoteGroup = new THREE.Group();
    remotePlayersGroupRef.current = remoteGroup;
    scene.add(remoteGroup);

    // Create Nurse Funke NPC Character Model
    const nurseModel = createCharacterModel(nurseNPC.customization);
    nurseModel.group.position.set(0, 0, 0.6); // Standing behind triage desk
    nurseModel.group.rotation.y = Math.PI; // Facing patient entrance
    charactersGroup.add(nurseModel.group);
    nurseModelRef.current = nurseModel;

    // Create Local Player Avatar
    const playerModel = createCharacterModel(playerCustomization);
    playerModel.group.position.set(0, 0, 3.2); // Standing at reception counter
    playerModel.group.rotation.y = 0; // Facing counter / nurse
    charactersGroup.add(playerModel.group);
    playerModelRef.current = playerModel;

    // 16. Screen Badges 3D -> 2D Projection helper
    const updateBadges = () => {
      if (!cameraRef.current || !containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;

      const project = (pos: [number, number, number]) => {
        const v = new THREE.Vector3(...pos);
        v.project(cameraRef.current!);
        const x = (v.x * 0.5 + 0.5) * w;
        const y = (-(v.y * 0.5) + 0.5) * h;
        const visible = v.z < 1.0;
        return { x, y, visible };
      };

      const newBadges: ScreenBadge[] = [];

      // 1. Nurse Funke Badge
      const nurseProj = project([0, 2.3, 0.6]);
      newBadges.push({
        id: 'badge_nurse_funke',
        label: 'Nurse Funke',
        role: 'Chief Nursing Officer',
        icon: '👩‍⚕️',
        screenX: nurseProj.x,
        screenY: nurseProj.y,
        visible: nurseProj.visible,
        isNPC: true,
        npc: nurseNPC,
        actionType: 'nurse',
      });

      // 2. Bed 1 (Patient Bed) Badge
      const bedProj = project([-2.8, 1.8, -2.5]);
      newBadges.push({
        id: 'badge_bed_1',
        label: 'Clinic Bed 1',
        role: 'Rest & Recover (+25%⚡)',
        icon: '🛏️',
        screenX: bedProj.x,
        screenY: bedProj.y,
        visible: bedProj.visible,
        actionType: 'bed',
      });

      // 3. Pharmacy & Medicine Cabinet Badge
      const cabProj = project([-6.2, 2.8, 1.2]);
      newBadges.push({
        id: 'badge_pharmacy',
        label: 'Pharmacy Cabinet',
        role: 'Vitamins & Supplies',
        icon: '💊',
        screenX: cabProj.x,
        screenY: cabProj.y,
        visible: cabProj.visible,
        actionType: 'cabinet',
      });

      // 4. Remote Players Badges
      remotePlayerModelsRef.current.forEach(({ model, player }) => {
        const pPos: [number, number, number] = [
          model.group.position.x,
          model.group.position.y + 2.1,
          model.group.position.z,
        ];
        const proj = project(pPos);
        newBadges.push({
          id: `player_${player.id}`,
          label: player.username,
          role: `${player.level} • ${player.department}`,
          icon: player.status === 'nepo' ? '👑' : '⚡',
          screenX: proj.x,
          screenY: proj.y,
          visible: proj.visible,
          isRemotePlayer: true,
          remotePlayer: player,
          statusBadge: player.status === 'nepo' ? 'NEPO' : 'LAPO',
        });
      });

      setScreenBadges(newBadges);
    };

    // 17. Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Idle breathing for Nurse Funke
      if (nurseModelRef.current) {
        nurseModelRef.current.update(delta, time);
        nurseModelRef.current.group.position.y = Math.sin(time * 2.0) * 0.015;
      }

      // Idle breathing for Local Player
      if (playerModelRef.current) {
        playerModelRef.current.update(delta, time);
        if (!isRestingAnimation) {
          playerModelRef.current.group.position.y = Math.sin(time * 2.2 + 0.5) * 0.018;
        }
      }

      // Update remote player animations
      remotePlayerModelsRef.current.forEach(({ model }) => {
        model.update(delta, time);
      });

      controls.update();
      renderer.render(scene, camera);
      updateBadges();
    };

    animate();

    // 18. Resize handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [playerCustomization, isRestingAnimation]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 select-none">
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Scene Header Banner */}
      <div className="absolute top-4 left-4 z-20 pointer-events-auto">
        <div className="flex items-center gap-2.5 p-2 sm:p-2.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-lg text-slate-800">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 border border-emerald-400 text-white flex items-center justify-center shadow-md">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs sm:text-sm font-black tracking-tight text-slate-900">
                LU Medical Centre
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                24/7 Triage
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              University Healthcare • Ward & Pharmacy
            </p>
          </div>
        </div>
      </div>

      {/* Top Right Quick Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
        <button
          onClick={handleResetCamera}
          title="Reset Camera Angle"
          className="p-2 sm:p-2.5 rounded-2xl bg-white/90 hover:bg-white text-slate-700 hover:text-emerald-700 border border-slate-200 shadow-md backdrop-blur-md transition-all active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={() => navigateToLocation('campus_map')}
          className="flex items-center gap-1.5 px-3.5 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
        >
          <span>Campus Map</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2D Interactive Screen Badges Over 3D Scene */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {screenBadges.map((badge) => {
          if (!badge.visible) return null;
          return (
            <div
              key={badge.id}
              style={{
                transform: `translate(${badge.screenX}px, ${badge.screenY}px) translate(-50%, -100%)`,
              }}
              className="absolute left-0 top-0 pointer-events-auto transition-transform duration-75"
            >
              <button
                onClick={() => {
                  if (badge.isNPC && badge.npc) {
                    setIsConsultModalOpen(true);
                  } else if (badge.isRemotePlayer && badge.remotePlayer) {
                    setSelectedRemoteStudent(badge.remotePlayer);
                  } else if (badge.actionType === 'bed') {
                    setIsBedRestModalOpen(true);
                  } else if (badge.actionType === 'cabinet') {
                    setIsPharmacyModalOpen(true);
                  }
                }}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 hover:bg-white text-slate-800 border border-slate-300/80 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer backdrop-blur-md"
              >
                <span className="text-base leading-none group-hover:scale-110 transition-transform">
                  {badge.icon}
                </span>
                <div className="text-left leading-tight">
                  <div className="text-xs font-black text-slate-900 group-hover:text-emerald-700 flex items-center gap-1">
                    <span>{badge.label}</span>
                    {badge.statusBadge && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-amber-100 text-amber-800">
                        {badge.statusBadge}
                      </span>
                    )}
                  </div>
                  {badge.role && (
                    <div className="text-[10px] text-slate-500 font-medium">
                      {badge.role}
                    </div>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Floating Action Menu Buttons at Bottom Right */}
      <div className="absolute bottom-20 right-4 z-20 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={() => setIsConsultModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Stethoscope className="w-4 h-4" />
          <span>Consult Nurse Funke</span>
        </button>

        <button
          onClick={() => setIsBedRestModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs border border-slate-200 shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Bed className="w-4 h-4 text-sky-600" />
          <span>Rest on Clinic Bed</span>
        </button>
      </div>

      {/* Bed Resting Animation Toast Overlay */}
      {isRestingAnimation && (
        <div className="absolute inset-0 z-40 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center animate-in fade-in duration-300 pointer-events-none">
          <div className="p-6 rounded-3xl bg-white/95 border border-slate-200 shadow-2xl flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-md animate-bounce">
              <Bed className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">Resting on Clinic Bed</h3>
            <p className="text-xs text-slate-500 max-w-xs">
              Vitals monitored by hospital telemetry. Recharging physical stamina and soothing academic stress...
            </p>
          </div>
        </div>
      )}

      {/* Nurse Funke Consultation Modal */}
      {isConsultModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 pointer-events-auto bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 sm:px-6 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-xl shadow-inner">
                  👩‍⚕️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black tracking-tight">
                      Nurse Funke
                    </h2>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider bg-emerald-400 text-slate-950">
                      Chief Nursing Officer
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200">
                    Liids University Medical Consultation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsConsultModalOpen(false)}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4">
              {/* Dialogue Bubble */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-xs sm:text-sm text-emerald-950 leading-relaxed font-medium">
                "{nurseNPC.dialogueIntro}"
              </div>

              {/* Treatment Options */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Available Treatments & Medical Services
                </h4>

                {/* Option 1: Glucose Drip */}
                <button
                  onClick={handleGlucoseDrip}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all text-left flex items-center justify-between group cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Pill className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-emerald-700">
                        Buy Multivitamins / Glucose Drip
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Instantly restores +40%⚡ Energy and cleanses exhaustion.
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-black text-emerald-600">
                      ₦3,500
                    </span>
                  </div>
                </button>

                {/* Option 2: Medical Exemption Note */}
                <button
                  onClick={handleExemptionNote}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all text-left flex items-center justify-between group cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-teal-600" />
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-emerald-700">
                        Collect Medical Exemption Note
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Official excuse docket. Used to guarantee acquittal at Exam Tribunal!
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-black text-emerald-600">
                      ₦5,000
                    </span>
                  </div>
                </button>

                {/* Option 3: Free Vitals Check */}
                <button
                  onClick={handleVitalsCheck}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all text-left flex items-center justify-between group cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-sky-600" />
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-emerald-700">
                        Free Blood Pressure & Vitals Check
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Quick pulse and temperature examination (+10%⚡, +10 Mood).
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-black text-sky-600">
                      FREE
                    </span>
                  </div>
                </button>
              </div>

              {/* Status Note */}
              {stats.hasMedicalExemptionNote && (
                <div className="p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-300 flex items-center gap-2 text-[11px] font-bold text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>You currently have an active Medical Exemption Note in your backpack!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bed Rest Interaction Modal */}
      {isBedRestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 pointer-events-auto bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200">
            <div className="p-4 sm:px-6 bg-gradient-to-r from-sky-800 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bed className="w-5 h-5 text-sky-300" />
                <h3 className="text-base font-black">Clinic Bed Recovery</h3>
              </div>
              <button
                onClick={() => setIsBedRestModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Lie down on the comfortable hospital bed to recharge your stamina under clinical observation.
              </p>

              <div className="p-3 bg-sky-50 border border-sky-200 rounded-2xl flex items-center justify-between text-xs font-bold text-sky-900">
                <span>Stamina Gain:</span>
                <span className="text-sky-600 font-mono">+25%⚡ Energy • +10 Mood</span>
              </div>

              <button
                onClick={handleBedRest}
                className="w-full py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-sky-600/30 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <Bed className="w-4 h-4" />
                <span>Rest on Clinic Bed</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pharmacy Cabinet Overview Modal */}
      {isPharmacyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 pointer-events-auto bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200">
            <div className="p-4 sm:px-6 bg-gradient-to-r from-teal-800 to-emerald-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Pill className="w-5 h-5 text-teal-300" />
                <h3 className="text-base font-black">Hospital Pharmacy & Supplies</h3>
              </div>
              <button
                onClick={() => setIsPharmacyModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              <p className="text-xs text-slate-600 leading-relaxed">
                Stocked with licensed multivitamins, glucose drips, anti-malaria medications, first-aid bandages, and clinical certs.
              </p>

              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-slate-800">Multivitamin Infusion</span>
                  </div>
                  <span className="text-emerald-600 font-mono font-bold">₦3,500</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-teal-600" />
                    <span className="font-bold text-slate-800">Hospital Exemption Note</span>
                  </div>
                  <span className="text-emerald-600 font-mono font-bold">₦5,000</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsPharmacyModalOpen(false);
                  setIsConsultModalOpen(true);
                }}
                className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
              >
                Order via Nurse Funke
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remote Student Profile Modal */}
      {selectedRemoteStudent && (
        <RemoteStudentModal
          player={selectedRemoteStudent}
          onClose={() => setSelectedRemoteStudent(null)}
        />
      )}
    </div>
  );
};
