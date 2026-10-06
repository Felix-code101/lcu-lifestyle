import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useGame } from '../context/GameContext';
import { createCharacterModel, type CharacterModelInstance } from './CharacterModel';
import { CAMPUS_NPCS } from '../data/npcData';
import { RemoteStudentModal } from './RemoteStudentModal';
import type { RemotePlayer, CampusNPC } from '../types/game';
import {
  RotateCcw,
  ArrowRight,
  Target,
  Ticket,
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
  actionType?: 'penalty' | 'betting' | 'coach' | 'keeper';
}

export const SportsComplexScene: React.FC<{ remotePlayers?: RemotePlayer[] }> = ({ remotePlayers = [] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    playerCustomization,
    resetCameraTrigger,
    navigateToLocation,
    setIsPenaltyModalOpen,
    setIsBettingModalOpen,
  } = useGame();

  const [screenBadges, setScreenBadges] = useState<ScreenBadge[]>([]);
  const [selectedRemoteStudent, setSelectedRemoteStudent] = useState<RemotePlayer | null>(null);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const charactersGroupRef = useRef<THREE.Group | null>(null);
  const remotePlayersGroupRef = useRef<THREE.Group | null>(null);
  const remotePlayerModelsRef = useRef<Map<string, { model: CharacterModelInstance; player: RemotePlayer }>>(new Map());
  const playerModelRef = useRef<CharacterModelInstance | null>(null);
  const keeperModelRef = useRef<CharacterModelInstance | null>(null);
  const coachModelRef = useRef<CharacterModelInstance | null>(null);

  // Find NPCs
  const keeperNPC = CAMPUS_NPCS.find((n) => n.id === 'npc_keeper_tobi') || {
    id: 'npc_keeper_tobi',
    name: 'Tobi "The Wall"',
    role: 'Varsity 1st-Choice Goalkeeper',
    avatarIcon: '🧤',
    location: 'sports_arena',
    position: [0, 0, -5.2],
    rotation: 0,
    customization: {
      skinTone: '#6d4527',
      shirtColor: '#facc15',
      shirtPattern: 'plain',
      pantsColor: '#1e293b',
      shoesColor: '#0284c7',
      hairStyle: 'fade',
      hairColor: '#18181b',
      accessory: 'none',
    },
    dialogueIntro: "You think you can beat me from the spot? Nobody scores past Tobi at the LU Arena without serious technique!",
    dialogueLines: [],
    options: [],
  };

  const coachNPC = CAMPUS_NPCS.find((n) => n.id === 'npc_coach_segun') || {
    id: 'npc_coach_segun',
    name: 'Coach Segun',
    role: 'Varsity Athletics & Bet Manager',
    avatarIcon: '🧢',
    location: 'sports_arena',
    position: [4.2, 0, 3.8],
    rotation: -Math.PI / 3,
    customization: {
      skinTone: '#452a17',
      shirtColor: '#10b981',
      shirtPattern: 'stripes',
      pantsColor: '#1e293b',
      shoesColor: '#ffffff',
      hairStyle: 'short',
      hairColor: '#18181b',
      accessory: 'cap',
    },
    dialogueIntro: "Welcome to LU Sports Arena! Ready to test your penalty strikes against the varsity keeper?",
    dialogueLines: [],
    options: [],
  };

  // Reset Camera Angle
  const handleResetCamera = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(13, 14, 13);
    controlsRef.current.target.set(0, 1.2, 0);
    controlsRef.current.update();
  }, []);

  useEffect(() => {
    if (resetCameraTrigger > 0) {
      handleResetCamera();
    }
  }, [resetCameraTrigger, handleResetCamera]);

  // Sync Remote Multiplayer Players inside Sports Arena
  useEffect(() => {
    const group = remotePlayersGroupRef.current;
    if (!group) return;

    const arenaPlayers = remotePlayers.filter((p) => p.location === 'sports_arena');
    const currentMap = remotePlayerModelsRef.current;

    for (const [id, item] of currentMap.entries()) {
      if (!arenaPlayers.some((p) => p.id === id)) {
        group.remove(item.model.group);
        currentMap.delete(id);
      }
    }

    arenaPlayers.forEach((p, idx) => {
      const defaultX = idx % 2 === 0 ? 3.5 : -3.5;
      const defaultZ = idx % 2 === 0 ? 2.0 : -2.0;
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
    scene.background = new THREE.Color('#090d16');

    // 2. Camera setup: Isometric Perspective
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 1000);
    camera.position.set(13, 14, 13);
    cameraRef.current = camera;

    // 3. Renderer
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
    controls.maxDistance = 30;
    controls.target.set(0, 1.2, 0);
    controlsRef.current = controls;

    // 5. Lighting: Stadium Floodlights & Ambient
    const ambientLight = new THREE.AmbientLight('#ecfdf5', 1.2);
    scene.add(ambientLight);

    const mainStadiumSun = new THREE.DirectionalLight('#f0fdf4', 1.6);
    mainStadiumSun.position.set(12, 22, 10);
    scene.add(mainStadiumSun);

    // Focused downward floodlight over goal & penalty spot
    const pitchSpot = new THREE.SpotLight('#ffffff', 2.4, 28, Math.PI / 3, 0.35);
    pitchSpot.position.set(0, 12, -1.0);
    pitchSpot.target.position.set(0, 0, -2.5);
    scene.add(pitchSpot);
    scene.add(pitchSpot.target);

    // 6. Artificial Turf Football Pitch with Mowed Lawn Stripes & White Markings
    const pitchW = 18;
    const pitchL = 22;
    const turfCanvas = document.createElement('canvas');
    turfCanvas.width = 512;
    turfCanvas.height = 512;
    const ctx = turfCanvas.getContext('2d');
    if (ctx) {
      // Base grass color
      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, 0, 512, 512);

      // Alternating mowed stripes
      ctx.fillStyle = '#166534';
      for (let y = 0; y < 512; y += 64) {
        ctx.fillRect(0, y, 512, 32);
      }

      // Crisp White Pitch Markings
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;

      // Outer Touchlines & Goal Line
      ctx.strokeRect(32, 32, 448, 448);

      // Penalty Box Rectangle (Top half towards goal)
      ctx.strokeRect(96, 32, 320, 180);

      // 6-Yard Goal Box
      ctx.strokeRect(176, 32, 160, 70);

      // Penalty Spot (12 yards out)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(256, 150, 6, 0, Math.PI * 2);
      ctx.fill();

      // Penalty D-Arc (outside box)
      ctx.beginPath();
      ctx.arc(256, 150, 48, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();

      // Halfway Line & Center Circle (towards bottom)
      ctx.beginPath();
      ctx.moveTo(32, 380);
      ctx.lineTo(480, 380);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(256, 380, 56, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(256, 380, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    const turfTexture = new THREE.CanvasTexture(turfCanvas);
    const turfGeo = new THREE.PlaneGeometry(pitchW, pitchL);
    turfGeo.rotateX(-Math.PI / 2);
    const turfMat = new THREE.MeshStandardMaterial({
      map: turfTexture,
      roughness: 0.8,
      metalness: 0.05,
    });
    const pitchMesh = new THREE.Mesh(turfGeo, turfMat);
    pitchMesh.position.set(0, 0, 0);
    scene.add(pitchMesh);

    // Track Surrounding Pitch (Red-brick Tartan Athletic Running Track)
    const trackGeo = new THREE.PlaneGeometry(pitchW + 6, pitchL + 6);
    trackGeo.rotateX(-Math.PI / 2);
    const trackMat = new THREE.MeshStandardMaterial({ color: '#991b1b', roughness: 0.85 });
    const trackMesh = new THREE.Mesh(trackGeo, trackMat);
    trackMesh.position.set(0, -0.02, 0);
    scene.add(trackMesh);

    // 7. Full 3D Football Goal Posts with Translucent Net
    const goalGroup = new THREE.Group();
    goalGroup.position.set(0, 0, -7.5);

    const postMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3, metalness: 0.4 });
    const postRadius = 0.08;
    const goalWidth = 5.6;
    const goalHeight = 2.4;
    const goalDepth = 1.6;

    // Left Post
    const leftPost = new THREE.Mesh(new THREE.CylinderGeometry(postRadius, postRadius, goalHeight, 16), postMat);
    leftPost.position.set(-goalWidth / 2, goalHeight / 2, 0);
    goalGroup.add(leftPost);

    // Right Post
    const rightPost = new THREE.Mesh(new THREE.CylinderGeometry(postRadius, postRadius, goalHeight, 16), postMat);
    rightPost.position.set(goalWidth / 2, goalHeight / 2, 0);
    goalGroup.add(rightPost);

    // Top Crossbar
    const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(postRadius, postRadius, goalWidth, 16), postMat);
    crossbar.rotateZ(Math.PI / 2);
    crossbar.position.set(0, goalHeight, 0);
    goalGroup.add(crossbar);

    // Rear Net Support Stanchions (Angled back)
    [-goalWidth / 2, goalWidth / 2].forEach((x) => {
      const rearPost = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, goalHeight, 8), postMat);
      rearPost.position.set(x, goalHeight / 2, -goalDepth);
      goalGroup.add(rearPost);

      const topBar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, goalDepth, 8), postMat);
      topBar.rotateX(Math.PI / 2);
      topBar.position.set(x, goalHeight, -goalDepth / 2);
      goalGroup.add(topBar);
    });

    // Semi-Transparent Goal Net Box
    const netMat = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.45,
      roughness: 0.9,
      side: THREE.DoubleSide,
    });
    const netBox = new THREE.Mesh(new THREE.BoxGeometry(goalWidth, goalHeight, goalDepth), netMat);
    netBox.position.set(0, goalHeight / 2, -goalDepth / 2);
    goalGroup.add(netBox);

    scene.add(goalGroup);

    // 8. 3D Football on the Penalty Spot
    const ballGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const ballMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.4 });
    const soccerBall = new THREE.Mesh(ballGeo, ballMat);
    soccerBall.position.set(0, 0.22, -2.4); // At penalty spot
    scene.add(soccerBall);

    // 9. Digital Stadium Scoreboard
    const scoreboardGroup = new THREE.Group();
    scoreboardGroup.position.set(0, 0, -10.2);

    // Truss Support Pillars
    const trussMat = new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.7, roughness: 0.3 });
    [-3.2, 3.2].forEach((px) => {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 6.5, 8), trussMat);
      pillar.position.set(px, 3.25, 0);
      scoreboardGroup.add(pillar);
    });

    // Main Scoreboard Housing
    const boardMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.4 });
    const boardHousing = new THREE.Mesh(new THREE.BoxGeometry(7.2, 2.8, 0.4), boardMat);
    boardHousing.position.set(0, 5.4, 0);
    scoreboardGroup.add(boardHousing);

    // LED Screen (Emissive Black/Cyan)
    const ledScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(6.8, 2.4),
      new THREE.MeshStandardMaterial({
        color: '#0284c7',
        emissive: '#0369a1',
        emissiveIntensity: 0.7,
      })
    );
    ledScreen.position.set(0, 5.4, 0.21);
    scoreboardGroup.add(ledScreen);

    scene.add(scoreboardGroup);

    // 10. Four Corner Stadium Floodlight Towers
    const floodlightPositions: [number, number][] = [
      [-9.8, -10.5],
      [9.8, -10.5],
      [-9.8, 10.5],
      [9.8, 10.5],
    ];

    floodlightPositions.forEach(([fx, fz]) => {
      const towerGroup = new THREE.Group();
      towerGroup.position.set(fx, 0, fz);

      // Steel Lattice Mast
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 8.5, 8), trussMat);
      mast.position.set(0, 4.25, 0);
      towerGroup.add(mast);

      // Light Bank Frame
      const headFrame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 0.3), boardMat);
      headFrame.position.set(0, 8.6, 0);
      headFrame.lookAt(0, 0, 0);
      towerGroup.add(headFrame);

      // Emissive Floodlight Bulbs
      const bulbGeo = new THREE.BoxGeometry(1.4, 1.0, 0.05);
      const bulbMat = new THREE.MeshStandardMaterial({
        color: '#ffffff',
        emissive: '#f8fafc',
        emissiveIntensity: 2.2,
      });
      const bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.set(0, 8.6, 0.16);
      bulb.lookAt(0, 0, 0);
      towerGroup.add(bulb);

      scene.add(towerGroup);
    });

    // 11. Campus Bet & Booking Center Kiosk (Sideline Pavilion)
    const kioskGroup = new THREE.Group();
    kioskGroup.position.set(6.8, 0, 3.2);
    kioskGroup.rotation.y = -Math.PI / 4;

    // Kiosk Floor Platform
    const platformMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.3 });
    const platform = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.2, 3.2), platformMat);
    platform.position.set(0, 0.1, 0);
    kioskGroup.add(platform);

    // Curved Modern Service Counter
    const counterDeskMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.25 });
    const counterDesk = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.15, 0.8), counterDeskMat);
    counterDesk.position.set(0, 0.65, 0.5);
    kioskGroup.add(counterDesk);

    // Neon Emerald Trim Panel on Desk Front
    const neonPanelMat = new THREE.MeshStandardMaterial({
      color: '#10b981',
      emissive: '#059669',
      emissiveIntensity: 0.5,
    });
    const neonPanel = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.85, 0.05), neonPanelMat);
    neonPanel.position.set(0, 0.65, 0.91);
    kioskGroup.add(neonPanel);

    // Betting Terminal Desktop Monitor on Counter
    const pcScreen = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.5, 0.06),
      new THREE.MeshStandardMaterial({ color: '#0f172a' })
    );
    pcScreen.position.set(-0.8, 1.5, 0.5);
    kioskGroup.add(pcScreen);

    // Screen Display face (Betting 1X2 odds)
    const screenFace = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 0.44),
      new THREE.MeshStandardMaterial({
        color: '#10b981',
        emissive: '#059669',
        emissiveIntensity: 0.7,
      })
    );
    screenFace.position.set(-0.8, 1.5, 0.54);
    kioskGroup.add(screenFace);

    // Ticket Printer
    const printer = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.25, 0.35),
      new THREE.MeshStandardMaterial({ color: '#334155' })
    );
    printer.position.set(0.8, 1.35, 0.5);
    kioskGroup.add(printer);

    // Canopy Roof over Kiosk
    const canopyMat = new THREE.MeshStandardMaterial({ color: '#047857', roughness: 0.5 });
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.15, 3.4), canopyMat);
    canopy.position.set(0, 3.4, 0);
    kioskGroup.add(canopy);

    // Canopy Signboard: "CAMPUS BET & BOOKING"
    const signBoard = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.6, 0.1),
      new THREE.MeshStandardMaterial({
        color: '#facc15',
        emissive: '#eab308',
        emissiveIntensity: 0.3,
      })
    );
    signBoard.position.set(0, 3.75, 1.6);
    kioskGroup.add(signBoard);

    scene.add(kioskGroup);

    // 12. Spectator Bleachers & Tiered Grandstand (Left Sideline)
    const bleacherGroup = new THREE.Group();
    bleacherGroup.position.set(-8.5, 0, 0);
    bleacherGroup.rotation.y = Math.PI / 2;

    const bleacherBaseMat = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.6 });
    const seatBlueMat = new THREE.MeshStandardMaterial({ color: '#1e3a8a', roughness: 0.4 });
    const seatGoldMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.4 });

    // 3 Tiers
    [0, 1, 2].forEach((tier) => {
      const step = new THREE.Mesh(new THREE.BoxGeometry(12, 0.45, 1.0), bleacherBaseMat);
      step.position.set(0, (tier + 1) * 0.45 - 0.22, tier * 0.9);
      bleacherGroup.add(step);

      // Seats on step
      const seatMat = tier % 2 === 0 ? seatBlueMat : seatGoldMat;
      const seatBar = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.1, 0.6), seatMat);
      seatBar.position.set(0, (tier + 1) * 0.45 + 0.05, tier * 0.9);
      bleacherGroup.add(seatBar);
    });

    scene.add(bleacherGroup);

    // 13. Characters Group
    const charactersGroup = new THREE.Group();
    charactersGroupRef.current = charactersGroup;
    scene.add(charactersGroup);

    // Remote Players Group
    const remoteGroup = new THREE.Group();
    remotePlayersGroupRef.current = remoteGroup;
    scene.add(remoteGroup);

    // Create Goalkeeper Tobi on Goal Line
    const keeperModel = createCharacterModel(keeperNPC.customization);
    keeperModel.group.position.set(0, 0, -6.8); // On goal line
    keeperModel.group.rotation.y = 0; // Facing penalty taker
    charactersGroup.add(keeperModel.group);
    keeperModelRef.current = keeperModel;

    // Create Coach Segun at Betting Kiosk Counter
    const coachModel = createCharacterModel(coachNPC.customization);
    coachModel.group.position.set(5.8, 0, 2.4); // Behind kiosk desk
    coachModel.group.rotation.y = -Math.PI / 3;
    charactersGroup.add(coachModel.group);
    coachModelRef.current = coachModel;

    // Create Local Player Avatar behind Penalty Spot
    const playerModel = createCharacterModel(playerCustomization);
    playerModel.group.position.set(0, 0, -0.6); // Ready to strike
    playerModel.group.rotation.y = Math.PI; // Facing goal
    charactersGroup.add(playerModel.group);
    playerModelRef.current = playerModel;

    // 14. Screen Badges 3D -> 2D Projection helper
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

      // 1. Penalty Spot Hotspot Badge
      const spotProj = project([0, 1.8, -2.4]);
      newBadges.push({
        id: 'badge_penalty_spot',
        label: '1v1 Penalty Shootout',
        role: 'Duel Tobi (Best of 3)',
        icon: '⚽',
        screenX: spotProj.x,
        screenY: spotProj.y,
        visible: spotProj.visible,
        actionType: 'penalty',
      });

      // 2. Campus Bet Kiosk Hotspot Badge
      const kioskProj = project([6.8, 2.6, 3.2]);
      newBadges.push({
        id: 'badge_bet_kiosk',
        label: 'Campus Bet Terminal',
        role: '1X2 Odds & ACCAs',
        icon: '🎰',
        screenX: kioskProj.x,
        screenY: kioskProj.y,
        visible: kioskProj.visible,
        actionType: 'betting',
      });

      // 3. Goalkeeper Tobi Badge
      const keeperProj = project([0, 2.3, -6.8]);
      newBadges.push({
        id: 'badge_keeper_tobi',
        label: 'Tobi "The Wall"',
        role: 'Titans Goalkeeper',
        icon: '🧤',
        screenX: keeperProj.x,
        screenY: keeperProj.y,
        visible: keeperProj.visible,
        isNPC: true,
        npc: keeperNPC,
        actionType: 'keeper',
      });

      // 4. Coach Segun Badge
      const coachProj = project([5.8, 2.3, 2.4]);
      newBadges.push({
        id: 'badge_coach_segun',
        label: 'Coach Segun',
        role: 'Athletics & Bet Manager',
        icon: '🧢',
        screenX: coachProj.x,
        screenY: coachProj.y,
        visible: coachProj.visible,
        isNPC: true,
        npc: coachNPC,
        actionType: 'coach',
      });

      // 5. Remote Players Badges
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

    // 15. Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Goalkeeper idle stance
      if (keeperModelRef.current) {
        keeperModelRef.current.update(delta, time);
        keeperModelRef.current.group.position.x = Math.sin(time * 1.5) * 0.35;
      }

      // Coach idle
      if (coachModelRef.current) {
        coachModelRef.current.update(delta, time);
        coachModelRef.current.group.position.y = Math.sin(time * 2.0) * 0.015;
      }

      // Local Player
      if (playerModelRef.current) {
        playerModelRef.current.update(delta, time);
        playerModelRef.current.group.position.y = Math.sin(time * 2.2 + 0.5) * 0.018;
      }

      // Remote Players
      remotePlayerModelsRef.current.forEach(({ model }) => {
        model.update(delta, time);
      });

      controls.update();
      renderer.render(scene, camera);
      updateBadges();
    };

    animate();

    // 16. Resize Handler
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
  }, [playerCustomization]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 select-none">
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Scene Header Banner */}
      <div className="absolute top-4 left-4 z-20 pointer-events-auto">
        <div className="flex items-center gap-2.5 p-2 sm:p-2.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-lg text-slate-800">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 border border-emerald-400 text-white flex items-center justify-center shadow-md text-lg">
            ⚽
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs sm:text-sm font-black tracking-tight text-slate-900">
                LU Sports Arena & Stadium
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                Floodlit Turf
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              1v1 Penalty Shootout • Campus Bet Booking Terminal
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
                  if (badge.actionType === 'penalty' || badge.actionType === 'keeper') {
                    setIsPenaltyModalOpen(true);
                  } else if (badge.actionType === 'betting' || badge.actionType === 'coach') {
                    setIsBettingModalOpen(true);
                  } else if (badge.isRemotePlayer && badge.remotePlayer) {
                    setSelectedRemoteStudent(badge.remotePlayer);
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
          onClick={() => setIsPenaltyModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Target className="w-4 h-4 text-yellow-300" />
          <span>Play 1v1 Penalty Shootout</span>
        </button>

        <button
          onClick={() => setIsBettingModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs border border-slate-200 shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Ticket className="w-4 h-4 text-emerald-600" />
          <span>Campus Bet Terminal</span>
        </button>
      </div>

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
