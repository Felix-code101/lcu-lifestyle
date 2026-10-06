import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useGame } from '../context/GameContext';
import { createCharacterModel, type CharacterModelInstance } from './CharacterModel';
import { CAMPUS_NPCS } from '../data/npcData';
import { RemoteStudentModal } from './RemoteStudentModal';
import type { RemotePlayer, CampusNPC } from '../types/game';
import {
  Sparkles,
  Bed,
  Heart,
  X,
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
  actionType?: 'bed' | 'minibar' | 'concierge' | 'armchair';
}

export const GuesthouseScene: React.FC<{ remotePlayers?: RemotePlayer[] }> = ({ remotePlayers = [] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    stats,
    spendBalance,
    addToast,
    playerCustomization,
    setStats,
    setActiveDialogueNPC,
    resetCameraTrigger,
  } = useGame();

  const [screenBadges, setScreenBadges] = useState<ScreenBadge[]>([]);
  const [selectedRemoteStudent, setSelectedRemoteStudent] = useState<RemotePlayer | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isLodgeFadeActive, setIsLodgeFadeActive] = useState(false);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const charactersGroupRef = useRef<THREE.Group | null>(null);
  const remotePlayersGroupRef = useRef<THREE.Group | null>(null);
  const remotePlayerModelsRef = useRef<Map<string, { model: CharacterModelInstance; player: RemotePlayer }>>(new Map());
  const playerModelRef = useRef<CharacterModelInstance | null>(null);
  const conciergeModelRef = useRef<CharacterModelInstance | null>(null);

  // Perform "Lodge Room / Date Night" Social Action
  const handleLodgeSuite = () => {
    const SUITE_FEE = 45000;
    if (stats.balance < SUITE_FEE) {
      addToast(`❌ Insufficient funds! Booking an Executive Suite requires ₦${SUITE_FEE.toLocaleString()}.`, 'warning');
      return;
    }

    if (spendBalance(SUITE_FEE)) {
      setIsBookingModalOpen(false);
      setIsLodgeFadeActive(true);

      setTimeout(() => {
        setStats((prev) => ({
          ...prev,
          energy: prev.maxEnergy,
          mood: 100,
          xp: prev.xp + 50,
          guesthouseNightsLodged: (prev.guesthouseNightsLodged || 0) + 1,
        }));
        addToast('✨ Soft life activated. You lodged in luxury at the Guesthouse! (+100%⚡, +100% Mood, +50 XP)', 'success');
      }, 1400);

      setTimeout(() => {
        setIsLodgeFadeActive(false);
      }, 2800);
    }
  };

  // Perform Minibar Drink action
  const handleMinibarDrink = () => {
    const DRINK_FEE = 3500;
    if (stats.balance < DRINK_FEE) {
      addToast('❌ Insufficient funds for VIP mini-bar beverages.', 'warning');
      return;
    }
    if (spendBalance(DRINK_FEE)) {
      setStats((prev) => ({
        ...prev,
        energy: Math.min(prev.maxEnergy, prev.energy + 25),
        mood: Math.min(100, prev.mood + 20),
      }));
      addToast('🍾 Chilled premium mocktail & sparking water poured from the suite mini-bar! (+25⚡, +20 Mood)', 'success');
    }
  };

  // Reset Camera View
  const handleResetCamera = useCallback(() => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(11, 12, 11);
      controlsRef.current.target.set(0, 1.2, 0);
      cameraRef.current.lookAt(0, 1.2, 0);
      cameraRef.current.updateProjectionMatrix();
      controlsRef.current.update();
      addToast('Camera centered on Guesthouse Executive Suite', 'info');
    }
  }, [addToast]);

  useEffect(() => {
    if (resetCameraTrigger > 0) {
      handleResetCamera();
    }
  }, [resetCameraTrigger, handleResetCamera]);

  // Sync Remote Multiplayer Characters
  useEffect(() => {
    if (!remotePlayersGroupRef.current) return;
    const group = remotePlayersGroupRef.current;
    const currentMap = remotePlayerModelsRef.current;

    const activeIds = new Set(remotePlayers.map((p) => p.id));
    currentMap.forEach((entry, id) => {
      if (!activeIds.has(id)) {
        group.remove(entry.model.group);
        currentMap.delete(id);
      }
    });

    remotePlayers.forEach((p, idx) => {
      const defaultX = idx % 2 === 0 ? 2.5 + idx * 0.8 : -2.5 - idx * 0.8;
      const defaultZ = idx % 2 === 0 ? 1.8 : -1.8;
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
    scene.background = new THREE.Color('#0f172a'); // Sophisticated deep midnight

    // 2. Camera setup: Isometric Perspective
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 1000);
    camera.position.set(11, 12, 11);
    cameraRef.current = camera;

    // 3. Renderer with soft shadow & tone mapping
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

    // 5. Lighting: Warm luxury 5-star ambiance with headboard & ceiling spot
    const ambientLight = new THREE.AmbientLight('#fff5ea', 1.3);
    scene.add(ambientLight);

    const mainSun = new THREE.DirectionalLight('#fed7aa', 1.8);
    mainSun.position.set(12, 18, 10);
    scene.add(mainSun);

    // Warm ceiling downlight focused over king bed
    const ceilingSpot = new THREE.SpotLight('#fef08a', 2.4, 18, Math.PI / 4, 0.4);
    ceilingSpot.position.set(0, 7.8, -2.5);
    ceilingSpot.target.position.set(0, 0, -2.5);
    scene.add(ceilingSpot);
    scene.add(ceilingSpot.target);

    // Bedside Lamp PointLights (Warm 2700K Glow)
    const leftLampLight = new THREE.PointLight('#f59e0b', 1.5, 6);
    leftLampLight.position.set(-3.2, 2.2, -3.8);
    scene.add(leftLampLight);

    const rightLampLight = new THREE.PointLight('#f59e0b', 1.5, 6);
    rightLampLight.position.set(3.2, 2.2, -3.8);
    scene.add(rightLampLight);

    // Headboard Hidden Accent Backlight (Indirect Architectural Glow)
    const headboardLight = new THREE.PointLight('#fbbf24', 2.0, 7);
    headboardLight.position.set(0, 2.6, -4.9);
    scene.add(headboardLight);

    // 6. Polished Porcelain Tile Floor with Reflective Sheen
    const floorSize = 16;
    const floorGeo = new THREE.PlaneGeometry(floorSize, floorSize);
    floorGeo.rotateX(-Math.PI / 2);

    // Procedural marble tile grid texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f8fafc'; // Pure ivory tile
      ctx.fillRect(0, 0, 512, 512);

      // Subtle fine grid grout lines
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 4;
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

      // High-end gold floor inlay border
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 6;
      ctx.strokeRect(16, 16, 480, 480);
    }
    const tileTexture = new THREE.CanvasTexture(canvas);
    tileTexture.wrapS = THREE.RepeatWrapping;
    tileTexture.wrapT = THREE.RepeatWrapping;
    tileTexture.repeat.set(2, 2);

    const floorMat = new THREE.MeshStandardMaterial({
      map: tileTexture,
      roughness: 0.15, // Polished high-sheen reflection
      metalness: 0.08,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.set(0, 0, 0);
    scene.add(floorMesh);

    // Subtle Persian Area Rug Under Bed
    const rugGeo = new THREE.BoxGeometry(7.2, 0.03, 6.2);
    const rugMat = new THREE.MeshStandardMaterial({ color: '#1e3a8a', roughness: 0.85 });
    const rugMesh = new THREE.Mesh(rugGeo, rugMat);
    rugMesh.position.set(0, 0.02, -2.8);
    scene.add(rugMesh);

    // 7. Executive Suite Walls (Back Wall & Left Wall)
    const wallGroup = new THREE.Group();

    // Back Wall (Champagne Taupe with Walnut Accent Paneling)
    const backWallGeo = new THREE.BoxGeometry(floorSize, 6.5, 0.25);
    const backWallMat = new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.4 });
    const backWall = new THREE.Mesh(backWallGeo, backWallMat);
    backWall.position.set(0, 3.25, -floorSize / 2);
    wallGroup.add(backWall);

    // Walnut Headboard Feature Slat Panel (Behind King Bed)
    const featureWallGeo = new THREE.BoxGeometry(6.4, 4.2, 0.1);
    const featureWallMat = new THREE.MeshStandardMaterial({ color: '#3e2723', roughness: 0.35 });
    const featureWall = new THREE.Mesh(featureWallGeo, featureWallMat);
    featureWall.position.set(0, 2.4, -floorSize / 2 + 0.15);
    wallGroup.add(featureWall);

    // Left Wall
    const leftWallGeo = new THREE.BoxGeometry(0.25, 6.5, floorSize);
    const leftWallMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.4 });
    const leftWall = new THREE.Mesh(leftWallGeo, leftWallMat);
    leftWall.position.set(-floorSize / 2, 3.25, 0);
    wallGroup.add(leftWall);

    // Luxury Modern Abstract Artwork in Gold Frame
    const artFrameGeo = new THREE.BoxGeometry(0.08, 2.2, 3.2);
    const artFrameMat = new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.2, metalness: 0.8 });
    const artFrame = new THREE.Mesh(artFrameGeo, artFrameMat);
    artFrame.position.set(-floorSize / 2 + 0.15, 3.5, 1.2);
    wallGroup.add(artFrame);

    const artCanvasGeo = new THREE.BoxGeometry(0.02, 2.0, 3.0);
    const artCanvasMat = new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.3 });
    const artCanvas = new THREE.Mesh(artCanvasGeo, artCanvasMat);
    artCanvas.position.set(-floorSize / 2 + 0.2, 3.5, 1.2);
    wallGroup.add(artCanvas);

    scene.add(wallGroup);

    // 8. 3D Furniture Assets (Procedural High-Fidelity)
    const furnitureGroup = new THREE.Group();

    // --- A. PLUSH LUXURY KING-SIZED BED ---
    const bedGroup = new THREE.Group();
    bedGroup.position.set(0, 0, -3.2);

    // Wooden bed platform base
    const bedBaseGeo = new THREE.BoxGeometry(4.2, 0.5, 4.8);
    const bedBaseMat = new THREE.MeshStandardMaterial({ color: '#271c19', roughness: 0.3 });
    const bedBase = new THREE.Mesh(bedBaseGeo, bedBaseMat);
    bedBase.position.set(0, 0.25, 0);
    bedGroup.add(bedBase);

    // Padded upholstered Headboard
    const headboardGeo = new THREE.BoxGeometry(4.4, 2.2, 0.35);
    const headboardMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.5 });
    const headboard = new THREE.Mesh(headboardGeo, headboardMat);
    headboard.position.set(0, 1.35, -2.25);
    bedGroup.add(headboard);

    // Gold LED Backlight Strip on Top of Headboard
    const ledStripGeo = new THREE.BoxGeometry(4.2, 0.08, 0.1);
    const ledStripMat = new THREE.MeshStandardMaterial({
      color: '#fef08a',
      emissive: new THREE.Color('#f59e0b'),
      emissiveIntensity: 2.2,
    });
    const ledStrip = new THREE.Mesh(ledStripGeo, ledStripMat);
    ledStrip.position.set(0, 2.45, -2.25);
    bedGroup.add(ledStrip);

    // Thick Plush Mattress
    const mattressGeo = new THREE.BoxGeometry(3.8, 0.7, 4.4);
    const mattressMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.4 });
    const mattress = new THREE.Mesh(mattressGeo, mattressMat);
    mattress.position.set(0, 0.75, 0.1);
    bedGroup.add(mattress);

    // Crisp White Duvet with Royal Blue Fold Runner
    const duvetGeo = new THREE.BoxGeometry(3.85, 0.2, 3.2);
    const duvetMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.3 });
    const duvet = new THREE.Mesh(duvetGeo, duvetMat);
    duvet.position.set(0, 1.15, 0.6);
    bedGroup.add(duvet);

    // Gold Runner
    const runnerGeo = new THREE.BoxGeometry(3.88, 0.22, 0.8);
    const runnerMat = new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.3 });
    const runner = new THREE.Mesh(runnerGeo, runnerMat);
    runner.position.set(0, 1.16, 1.2);
    bedGroup.add(runner);

    // 4 Fluffy Layered Pillows
    for (let p = -1; p <= 1; p += 2) {
      // Bottom pillows
      const pillowGeo = new THREE.BoxGeometry(1.3, 0.22, 0.8);
      const pillowMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3 });
      const pillow = new THREE.Mesh(pillowGeo, pillowMat);
      pillow.position.set(p * 1.0, 1.22, -1.4);
      pillow.rotation.x = 0.2;
      bedGroup.add(pillow);

      // Top decorative pillows (Liids University emerald accent)
      const topPillowGeo = new THREE.BoxGeometry(0.9, 0.2, 0.6);
      const topPillowMat = new THREE.MeshStandardMaterial({ color: '#047857', roughness: 0.4 });
      const topPillow = new THREE.Mesh(topPillowGeo, topPillowMat);
      topPillow.position.set(p * 1.0, 1.35, -1.1);
      topPillow.rotation.x = 0.35;
      bedGroup.add(topPillow);
    }

    furnitureGroup.add(bedGroup);

    // --- B. SLEEK WOODEN NIGHTSTANDS (LEFT & RIGHT) ---
    [-3.2, 3.2].forEach((xPos) => {
      const standGroup = new THREE.Group();
      standGroup.position.set(xPos, 0, -4.5);

      // Nightstand cabinet
      const standGeo = new THREE.BoxGeometry(1.4, 1.2, 1.2);
      const standMat = new THREE.MeshStandardMaterial({ color: '#3e2723', roughness: 0.35 });
      const stand = new THREE.Mesh(standGeo, standMat);
      stand.position.set(0, 0.6, 0);
      standGroup.add(stand);

      // Brass lamp base
      const lampBaseGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.1, 16);
      const lampBaseMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.8, roughness: 0.2 });
      const lampBase = new THREE.Mesh(lampBaseGeo, lampBaseMat);
      lampBase.position.set(0, 1.25, 0);
      standGroup.add(lampBase);

      const lampPoleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.7, 8);
      const lampPole = new THREE.Mesh(lampPoleGeo, lampBaseMat);
      lampPole.position.set(0, 1.6, 0);
      standGroup.add(lampPole);

      // Lampshade with warm emissive light
      const shadeGeo = new THREE.CylinderGeometry(0.35, 0.5, 0.6, 16);
      const shadeMat = new THREE.MeshStandardMaterial({
        color: '#fef3c7',
        emissive: new THREE.Color('#f59e0b'),
        emissiveIntensity: 0.9,
        roughness: 0.2,
      });
      const shade = new THREE.Mesh(shadeGeo, shadeMat);
      shade.position.set(0, 2.05, 0);
      standGroup.add(shade);

      furnitureGroup.add(standGroup);
    });

    // --- C. MINI-BAR REFRIGERATOR & CREDENZA ---
    const minibarGroup = new THREE.Group();
    minibarGroup.position.set(-5.5, 0, 1.8);
    minibarGroup.rotation.y = Math.PI / 2;

    const credenzaGeo = new THREE.BoxGeometry(2.4, 1.5, 1.2);
    const credenzaMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.3 });
    const credenza = new THREE.Mesh(credenzaGeo, credenzaMat);
    credenza.position.set(0, 0.75, 0);
    minibarGroup.add(credenza);

    // Glass Mini-fridge door
    const glassGeo = new THREE.BoxGeometry(1.4, 1.1, 0.05);
    const glassMat = new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      transparent: true,
      opacity: 0.65,
      roughness: 0.1,
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(0, 0.75, 0.62);
    minibarGroup.add(glass);

    // Mini champagne bottle on credenza
    const bottleGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.6, 12);
    const bottleMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.2, metalness: 0.3 });
    const bottle = new THREE.Mesh(bottleGeo, bottleMat);
    bottle.position.set(0.6, 1.8, 0);
    minibarGroup.add(bottle);

    furnitureGroup.add(minibarGroup);

    // --- D. MODERN VELVET LOUNGE ARMCHAIR & COFFEE TABLE ---
    const loungeGroup = new THREE.Group();
    loungeGroup.position.set(4.2, 0, 1.5);
    loungeGroup.rotation.y = -Math.PI / 3;

    // Chair base
    const chairBaseGeo = new THREE.BoxGeometry(1.8, 0.6, 1.8);
    const chairMat = new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.4 }); // Royal cyan velvet
    const chairBase = new THREE.Mesh(chairBaseGeo, chairMat);
    chairBase.position.set(0, 0.4, 0);
    loungeGroup.add(chairBase);

    // Backrest
    const chairBackGeo = new THREE.BoxGeometry(1.8, 1.4, 0.4);
    const chairBack = new THREE.Mesh(chairBackGeo, chairMat);
    chairBack.position.set(0, 1.2, -0.7);
    loungeGroup.add(chairBack);

    // Brass armrests
    const armGeo = new THREE.BoxGeometry(0.2, 0.6, 1.6);
    const armMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.8, roughness: 0.2 });
    [-0.9, 0.9].forEach((ax) => {
      const arm = new THREE.Mesh(armGeo, armMat);
      arm.position.set(ax, 0.8, 0);
      loungeGroup.add(arm);
    });

    // Sleek glass coffee table
    const tableGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.08, 24);
    const tableMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.15, metalness: 0.2 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(1.4, 0.6, 0.5);
    loungeGroup.add(table);

    furnitureGroup.add(loungeGroup);

    // Tall indoor tropical palm
    const palmGeo = new THREE.CylinderGeometry(0.35, 0.25, 0.8, 16);
    const palmMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.2 });
    const palmPot = new THREE.Mesh(palmGeo, palmMat);
    palmPot.position.set(6.2, 0.4, -5.8);
    furnitureGroup.add(palmPot);

    const palmLeavesGeo = new THREE.SphereGeometry(1.1, 8, 8);
    const palmLeavesMat = new THREE.MeshStandardMaterial({ color: '#16a34a', roughness: 0.6 });
    const palmLeaves = new THREE.Mesh(palmLeavesGeo, palmLeavesMat);
    palmLeaves.position.set(6.2, 1.6, -5.8);
    palmLeaves.scale.set(1.1, 1.8, 1.1);
    furnitureGroup.add(palmLeaves);

    scene.add(furnitureGroup);

    // 9. Character Groups
    const charactersGroup = new THREE.Group();
    charactersGroupRef.current = charactersGroup;
    scene.add(charactersGroup);

    // Local Player (Spawn at [0, 0, 1.2])
    const playerInstance = createCharacterModel(playerCustomization);
    playerModelRef.current = playerInstance;
    playerInstance.group.position.set(0, 0, 1.2);
    playerInstance.group.rotation.y = Math.PI / 4;
    charactersGroup.add(playerInstance.group);

    // VIP Concierge Mr. Babatunde (at reception desk [-2.2, 0, 3.8])
    const conciergeNPC = CAMPUS_NPCS.find((n) => n.id === 'npc_guesthouse_concierge');
    if (conciergeNPC) {
      const conciergeInstance = createCharacterModel(conciergeNPC.customization);
      conciergeModelRef.current = conciergeInstance;
      conciergeInstance.group.position.set(-2.2, 0, 3.8);
      conciergeInstance.group.rotation.y = Math.PI / 4;
      charactersGroup.add(conciergeInstance.group);
    }

    // Remote multiplayer group
    const remoteGroup = new THREE.Group();
    remotePlayersGroupRef.current = remoteGroup;
    scene.add(remoteGroup);

    // 10. Animation & Badge Projection Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();
    const tempVec = new THREE.Vector3();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      controls.update();

      if (playerModelRef.current) {
        playerModelRef.current.update(delta, elapsed);
      }
      if (conciergeModelRef.current) {
        conciergeModelRef.current.update(delta, elapsed);
      }

      remotePlayerModelsRef.current.forEach(({ model }) => {
        model.update(delta, elapsed);
      });

      // Project Badges
      const containerW = container.clientWidth;
      const containerH = container.clientHeight;
      const newBadges: ScreenBadge[] = [];

      // 1. Suite King Bed Hotspot
      tempVec.set(0, 2.2, -3.2);
      tempVec.project(camera);
      if (tempVec.z <= 1.0) {
        newBadges.push({
          id: 'badge_suite_bed',
          label: 'Presidential Suite (₦45k)',
          role: 'Book Suite / Carry Date',
          icon: '👑',
          screenX: (tempVec.x * 0.5 + 0.5) * containerW,
          screenY: (-tempVec.y * 0.5 + 0.5) * containerH,
          visible: true,
          actionType: 'bed',
        });
      }

      // 2. Mini-Bar Hotspot
      tempVec.set(-5.5, 2.4, 1.8);
      tempVec.project(camera);
      if (tempVec.z <= 1.0) {
        newBadges.push({
          id: 'badge_minibar',
          label: 'VIP Suite Mini-Bar',
          role: 'Chilled Mocktails & Drinks (₦3,500)',
          icon: '🍾',
          screenX: (tempVec.x * 0.5 + 0.5) * containerW,
          screenY: (-tempVec.y * 0.5 + 0.5) * containerH,
          visible: true,
          actionType: 'minibar',
        });
      }

      // 3. Concierge Mr. Babatunde
      tempVec.set(-2.2, 3.4, 3.8);
      tempVec.project(camera);
      if (tempVec.z <= 1.0 && conciergeNPC) {
        newBadges.push({
          id: conciergeNPC.id,
          label: conciergeNPC.name,
          role: conciergeNPC.role,
          icon: conciergeNPC.avatarIcon,
          screenX: (tempVec.x * 0.5 + 0.5) * containerW,
          screenY: (-tempVec.y * 0.5 + 0.5) * containerH,
          visible: true,
          isNPC: true,
          npc: conciergeNPC,
        });
      }

      // 4. Remote Peers at Guesthouse
      remotePlayerModelsRef.current.forEach(({ model, player }) => {
        tempVec.set(model.group.position.x, 3.4, model.group.position.z);
        tempVec.project(camera);
        if (tempVec.z <= 1.0) {
          newBadges.push({
            id: `remote_${player.id}`,
            label: player.username,
            role: `${player.department}`,
            icon: player.status === 'nepo' ? '👑' : '🎒',
            statusBadge: player.status,
            screenX: (tempVec.x * 0.5 + 0.5) * containerW,
            screenY: (-tempVec.y * 0.5 + 0.5) * containerH,
            visible: true,
            isRemotePlayer: true,
            remotePlayer: player,
          });
        }
      });

      setScreenBadges(newBadges);
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
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
  }, [playerCustomization]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* 3D Canvas Mount */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Top Banner Tag */}
      <div className="absolute top-20 left-6 z-20 pointer-events-none flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-amber-500/40 text-amber-300 shadow-xl">
        <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
        <span className="text-xs font-black uppercase tracking-wider">
          University 5-Star Luxury Guesthouse
        </span>
      </div>

      {/* Floating Action Button (Book Suite) */}
      <div className="absolute bottom-24 right-6 z-20 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={() => setIsBookingModalOpen(true)}
          className="py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-xl shadow-amber-950/40 flex items-center gap-2 transition-all active:scale-95 border border-yellow-200 cursor-pointer"
        >
          <Bed className="w-4 h-4" />
          <span>Book Presidential Suite (₦45,000)</span>
        </button>
      </div>

      {/* Floating Badges */}
      {screenBadges.map((badge) => (
        <div
          key={badge.id}
          style={{
            left: `${badge.screenX}px`,
            top: `${badge.screenY}px`,
            transform: 'translate(-50%, -100%)',
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (badge.actionType === 'bed') {
              setIsBookingModalOpen(true);
            } else if (badge.actionType === 'minibar') {
              handleMinibarDrink();
            } else if (badge.isRemotePlayer && badge.remotePlayer) {
              setSelectedRemoteStudent(badge.remotePlayer);
            } else if (badge.isNPC && badge.npc) {
              setActiveDialogueNPC(badge.npc);
            }
          }}
          className={`absolute z-20 pointer-events-auto cursor-pointer group flex flex-col items-center select-none transition-transform duration-150 hover:scale-105 active:scale-95 ${
            badge.visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/95 backdrop-blur-md shadow-xl border ${
              badge.actionType === 'bed'
                ? 'border-amber-400 ring-2 ring-amber-400/40'
                : badge.actionType === 'minibar'
                ? 'border-sky-400 ring-2 ring-sky-400/30'
                : 'border-slate-700'
            } transition-all`}
          >
            <span className="text-sm shrink-0">{badge.icon}</span>
            <div className="flex flex-col text-left">
              <span className="text-xs font-black text-white leading-none">
                {badge.label}
              </span>
              {badge.role && (
                <span className="text-[10px] text-amber-300 font-semibold leading-none mt-0.5 max-w-[150px] truncate">
                  {badge.role}
                </span>
              )}
            </div>
          </div>
          <div className="w-2 h-2 bg-slate-900 border-r border-b border-amber-500/50 transform rotate-45 -mt-1 shadow-xs" />
        </div>
      ))}

      {/* Suite Booking & "Carry Date" Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md pointer-events-auto">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border-2 border-amber-500/60 shadow-2xl p-6 text-slate-100 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30 mb-3 border border-yellow-200">
                <Bed className="w-8 h-8" />
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider">
                5-Star Presidential Suite
              </span>
              <h3 className="text-xl font-black text-white mt-1">Lodge Room / Date Night</h3>
              <p className="text-xs text-slate-400 mt-1">
                Indulge in maximum luxury lodging. High-thread count duvet, headboard ambient lighting, and undisturbed peace.
              </p>
            </div>

            <div className="my-5 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Suite Rate</span>
                <span className="font-extrabold text-amber-300 font-mono text-sm">₦45,000 / Night</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800 pt-1.5">
                <span className="text-slate-400">Energy & Stamina</span>
                <span className="font-extrabold text-emerald-400">Max Recharged (100%⚡)</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800 pt-1.5">
                <span className="text-slate-400">Student Mood</span>
                <span className="font-extrabold text-yellow-300">Max Ecstatic (100% 😊)</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800 pt-1.5">
                <span className="text-slate-400">Campus Popularity</span>
                <span className="font-extrabold text-teal-300">+50 Popularity XP</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="w-1/3 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLodgeSuite}
                className="w-2/3 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition-all active:scale-95 flex items-center justify-center gap-1.5 border border-yellow-200 cursor-pointer"
              >
                <Heart className="w-4 h-4 fill-slate-950" />
                <span>Confirm Lodging (Soft Life)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stylish Fade-to-Black Soft Life Transition */}
      {isLodgeFadeActive && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-700 pointer-events-auto">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 shadow-2xl mb-4 animate-pulse">
            <Sparkles className="w-10 h-10" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-300 tracking-wide uppercase">
            ✨ Soft Life Activated
          </h2>
          <p className="text-sm text-slate-300 mt-2 max-w-md">
            You lodged in luxury at the Liids University Guesthouse. Full rest achieved, undisturbed peace, and royal treatment.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-mono text-emerald-400">
            <span>⚡ Energy: 100%</span>
            <span>•</span>
            <span>😊 Mood: 100%</span>
            <span>•</span>
            <span>👑 Popularity: +50 XP</span>
          </div>
        </div>
      )}

      {/* Remote Peer Student Inspector Modal */}
      {selectedRemoteStudent && (
        <RemoteStudentModal
          player={selectedRemoteStudent}
          onClose={() => setSelectedRemoteStudent(null)}
        />
      )}
    </div>
  );
};
