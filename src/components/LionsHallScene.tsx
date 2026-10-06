import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useGame } from '../context/GameContext';
import { createCharacterModel, type CharacterModelInstance } from './CharacterModel';
import type { RemotePlayer, LionsHallEvent } from '../types/game';
import {
  Sparkles,
  PartyPopper,
  Vote,
  RotateCcw,
  X,
  Compass,
  Smile,
} from 'lucide-react';

interface ScreenBadge {
  id: string;
  label: string;
  role: string;
  icon: string;
  screenX: number;
  screenY: number;
  visible: boolean;
  actionType: 'host_terminal' | 'dj_booth' | 'cocktail_lounge';
}

export const LionsHallScene: React.FC<{ remotePlayers: RemotePlayer[] }> = ({ remotePlayers }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const {
    stats,
    navigateToLocation,
    playerCustomization,
    activeLionsHallEvent,
    isLionsEventModalOpen,
    setIsLionsEventModalOpen,
    hostLionsHallEvent,
    addToast,
  } = useGame();

  const [screenBadges, setScreenBadges] = useState<ScreenBadge[]>([]);

  // Refs for animated models & lights
  const localPlayerModelRef = useRef<CharacterModelInstance | null>(null);
  const dancingNPCsRef = useRef<CharacterModelInstance[]>([]);
  const charactersGroupRef = useRef<THREE.Group | null>(null);
  const partyLightsRef = useRef<THREE.PointLight[]>([]);

  // Remote Players model cache
  const remotePlayerModelsRef = useRef<Map<string, { model: CharacterModelInstance; player: RemotePlayer }>>(new Map());
  const remotePlayersGroupRef = useRef<THREE.Group | null>(null);

  // Sync Remote Players
  useEffect(() => {
    const group = remotePlayersGroupRef.current;
    if (!group) return;

    const hallPlayers = remotePlayers.filter((p) => p.location === 'lions_hall');
    const currentMap = remotePlayerModelsRef.current;

    for (const [id, item] of currentMap.entries()) {
      if (!hallPlayers.some((p) => p.id === id)) {
        group.remove(item.model.group);
        currentMap.delete(id);
      }
    }

    hallPlayers.forEach((p, idx) => {
      const defaultX = idx % 2 === 0 ? 2.5 : -2.5;
      const defaultZ = idx % 2 === 0 ? 1.5 : -1.5;
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

  // Reset Camera
  const handleResetCamera = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(12, 13, 12);
    controlsRef.current.target.set(0, 1.2, 0);
    controlsRef.current.update();
  }, []);

  // Three.js Scene Setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene with clean bright studio background
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#f8fafc');

    // 2. Camera: Isometric angle
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 1000);
    camera.position.set(12, 13, 12);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 1.2, 0);
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 6;
    controls.maxDistance = 28;
    controls.update();

    // 5. Lighting: Crisp clean ambient lighting + golden party accents
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.4);
    scene.add(ambientLight);

    const dirSun = new THREE.DirectionalLight('#fff7ed', 1.2);
    dirSun.position.set(15, 25, 12);
    dirSun.castShadow = true;
    scene.add(dirSun);

    // Party Spotlights (Pulsing colors for active events)
    const partySpot1 = new THREE.PointLight('#f59e0b', 1.5, 15);
    partySpot1.position.set(-4, 4.5, -3);
    scene.add(partySpot1);

    const partySpot2 = new THREE.PointLight('#ec4899', 1.5, 15);
    partySpot2.position.set(4, 4.5, -3);
    scene.add(partySpot2);

    const partySpot3 = new THREE.PointLight('#38bdf8', 1.2, 15);
    partySpot3.position.set(0, 5, 2);
    scene.add(partySpot3);

    partyLightsRef.current = [partySpot1, partySpot2, partySpot3];

    // 6. Hall Floor: Polished Porcelain Tiles with Gold Border
    const floorMat = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      roughness: 0.18,
      metalness: 0.15,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Gold Inlay Perimeter Border
    const borderMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.3, metalness: 0.6 });
    const borderL = new THREE.Mesh(new THREE.BoxGeometry(16.2, 0.04, 0.2), borderMat);
    borderL.position.set(0, 0.02, 7.9);
    scene.add(borderL);

    // 7. Hall Walls: Clean Off-White with Modern Acoustic Slats
    const wallMat = new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.6 });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(16, 6, 0.4), wallMat);
    backWall.position.set(0, 3, -8);
    scene.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 6, 16), wallMat);
    leftWall.position.set(-8, 3, 0);
    scene.add(leftWall);

    // 8. Event Stage Riser Area (Front Center)
    const stageGroup = new THREE.Group();
    stageGroup.position.set(0, 0, -4.5);

    const stageRiserMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.4 });
    const stageRiser = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.6, 4.2), stageRiserMat);
    stageRiser.position.y = 0.3;
    stageRiser.receiveShadow = true;
    stageGroup.add(stageRiser);

    // Stage Front LED Neon Glow Strip
    const stageGlowStrip = new THREE.Mesh(
      new THREE.BoxGeometry(9.6, 0.08, 0.1),
      new THREE.MeshStandardMaterial({ color: '#f59e0b', emissive: '#f59e0b', emissiveIntensity: 1.5 })
    );
    stageGlowStrip.position.set(0, 0.58, 2.15);
    stageGroup.add(stageGlowStrip);

    // DJ Riser Table & Gear
    const djDeskMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.3 });
    const djDesk = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.0, 1.0), djDeskMat);
    djDesk.position.set(0, 1.1, 0);
    stageGroup.add(djDesk);

    // DJ Turntable Jog Wheels
    [-0.7, 0.7].forEach((jx) => {
      const platter = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.28, 0.06, 24),
        new THREE.MeshStandardMaterial({ color: '#38bdf8', emissive: '#0284c7', emissiveIntensity: 0.8 })
      );
      platter.position.set(jx, 1.63, 0);
      stageGroup.add(platter);
    });

    // Laptop Stand on DJ Booth
    const laptopBase = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.03, 0.35), new THREE.MeshStandardMaterial({ color: '#94a3b8' }));
    laptopBase.position.set(0, 1.62, -0.15);
    stageGroup.add(laptopBase);

    // Concert Sound Speaker Stacks (Left & Right of Stage)
    [-4.2, 4.2].forEach((sx) => {
      const speakerGroup = new THREE.Group();
      speakerGroup.position.set(sx, 0, -3.8);

      const cabinet = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.4, 0.9), new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.8 }));
      cabinet.position.y = 1.2;
      speakerGroup.add(cabinet);

      // Woofer Cones
      [0.6, 1.3, 1.9].forEach((wy) => {
        const cone = new THREE.Mesh(
          new THREE.CylinderGeometry(0.26, 0.26, 0.05, 16),
          new THREE.MeshStandardMaterial({ color: '#334155' })
        );
        cone.rotation.x = Math.PI / 2;
        cone.position.set(0, wy, 0.46);
        speakerGroup.add(cone);
      });

      scene.add(speakerGroup);
    });

    // Backdrop LED Screen ("LIONS HALL EVENTS")
    const backdropGeo = new THREE.BoxGeometry(7.5, 3.2, 0.15);
    const backdropMat = new THREE.MeshStandardMaterial({
      color: '#0f172a',
      emissive: '#b45309',
      emissiveIntensity: 0.6,
      roughness: 0.3,
    });
    const backdrop = new THREE.Mesh(backdropGeo, backdropMat);
    backdrop.position.set(0, 3.2, -7.8);
    scene.add(backdrop);

    scene.add(stageGroup);

    // 9. Cocktail High-Tables & Lounge Stools
    const tablePositions: [number, number][] = [
      [-4.0, 2.5],
      [4.0, 2.5],
      [-4.0, 5.5],
      [4.0, 5.5],
    ];

    const cocktailMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.2, metalness: 0.2 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.8, roughness: 0.2 });

    tablePositions.forEach(([tx, tz]) => {
      const tableGroup = new THREE.Group();
      tableGroup.position.set(tx, 0, tz);

      // Chrome Pole
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.1, 16), chromeMat);
      pole.position.y = 0.55;
      tableGroup.add(pole);

      // Round Base
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.04, 24), chromeMat);
      base.position.y = 0.02;
      tableGroup.add(base);

      // Round Table Top
      const top = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.05, 24), cocktailMat);
      top.position.y = 1.1;
      tableGroup.add(top);

      // Glowing Cocktail Glass on Table
      const drink = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.05, 0.18, 12),
        new THREE.MeshStandardMaterial({ color: '#f59e0b', emissive: '#f59e0b', emissiveIntensity: 0.8, transparent: true, opacity: 0.85 })
      );
      drink.position.set(0, 1.22, 0);
      tableGroup.add(drink);

      scene.add(tableGroup);
    });

    // 10. Interactive Event Hosting Terminal Kiosk near Stage Front Left
    const terminalGroup = new THREE.Group();
    terminalGroup.position.set(-3.2, 0, -1.8);

    const termStand = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.2, 0.4), new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.3 }));
    termStand.position.y = 0.6;
    terminalGroup.add(termStand);

    const termScreen = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.45, 0.08),
      new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#f59e0b', emissiveIntensity: 0.7 })
    );
    termScreen.position.set(0, 1.25, 0.15);
    termScreen.rotation.x = -Math.PI / 6;
    terminalGroup.add(termScreen);

    scene.add(terminalGroup);

    // 11. Characters Group
    const charactersGroup = new THREE.Group();
    charactersGroupRef.current = charactersGroup;
    scene.add(charactersGroup);

    const remoteGroup = new THREE.Group();
    remotePlayersGroupRef.current = remoteGroup;
    scene.add(remoteGroup);

    // Local Player Avatar on the Dance Floor
    const localPlayer = createCharacterModel(playerCustomization);
    localPlayer.group.position.set(0, 0, 1.2);
    localPlayer.group.rotation.y = Math.PI;
    charactersGroup.add(localPlayer.group);
    localPlayerModelRef.current = localPlayer;

    // Dancing NPCs when event is hosted (or 2 party vibes by default)
    const npcs: CharacterModelInstance[] = [];
    const npcConfigs = [
      { pos: [-1.4, 0, 0.4], skin: '#6d4527', shirt: '#ec4899', pants: '#1e293b' },
      { pos: [1.4, 0, 0.4], skin: '#8c5835', shirt: '#3b82f6', pants: '#0f172a' },
      { pos: [-1.8, 0, 2.6], skin: '#452a17', shirt: '#10b981', pants: '#334155' },
      { pos: [1.8, 0, 2.6], skin: '#a26a42', shirt: '#f59e0b', pants: '#18181b' },
    ];

    npcConfigs.forEach((cfg) => {
      const m = createCharacterModel({
        skinTone: cfg.skin,
        shirtColor: cfg.shirt,
        shirtPattern: 'plain',
        pantsColor: cfg.pants,
        shoesColor: '#ffffff',
        hairStyle: 'short',
        hairColor: '#18181b',
        accessory: 'none',
      });
      m.group.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
      m.group.rotation.y = Math.PI / 4;
      charactersGroup.add(m.group);
      npcs.push(m);
    });
    dancingNPCsRef.current = npcs;

    // 12. Screen Badges Projection
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

      // 1. Host Event Terminal Badge
      const termProj = project([-3.2, 1.8, -1.8]);
      newBadges.push({
        id: 'badge_terminal',
        label: 'Host an Event',
        role: 'Raves, Dinners & Rallies',
        icon: '🦁',
        screenX: termProj.x,
        screenY: termProj.y,
        visible: termProj.visible,
        actionType: 'host_terminal',
      });

      // 2. DJ Stage Riser Badge
      const stageProj = project([0, 2.2, -4.5]);
      newBadges.push({
        id: 'badge_stage',
        label: activeLionsHallEvent ? activeLionsHallEvent.title : 'Main Stage Riser',
        role: activeLionsHallEvent ? 'Party Active!' : 'Concert Sound System',
        icon: '🎶',
        screenX: stageProj.x,
        screenY: stageProj.y,
        visible: stageProj.visible,
        actionType: 'dj_booth',
      });

      // 3. Cocktail Lounge Badge
      const loungeProj = project([4.0, 1.8, 4.0]);
      newBadges.push({
        id: 'badge_lounge',
        label: 'Cocktail High-Tables',
        role: 'Socialize & Chill',
        icon: '🍸',
        screenX: loungeProj.x,
        screenY: loungeProj.y,
        visible: loungeProj.visible,
        actionType: 'cocktail_lounge',
      });

      setScreenBadges(newBadges);
    };

    // 13. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Controls update
      controls.update();

      // Animate dancing avatars (rhythmic bouncy groove)
      dancingNPCsRef.current.forEach((npc, i) => {
        const bounce = Math.sin(elapsed * 5 + i * 1.5) * 0.08;
        npc.group.position.y = Math.max(0, bounce);
        npc.group.rotation.y += Math.sin(elapsed * 2 + i) * 0.015;
        npc.update(delta, elapsed);
      });

      // Animate party lights color oscillation
      if (partyLightsRef.current.length > 0) {
        const hue1 = (elapsed * 0.15) % 1;
        const hue2 = (elapsed * 0.15 + 0.33) % 1;
        partyLightsRef.current[0].color.setHSL(hue1, 0.9, 0.5);
        partyLightsRef.current[1].color.setHSL(hue2, 0.9, 0.5);
      }

      // Update local player model
      if (localPlayerModelRef.current) {
        if (activeLionsHallEvent) {
          const bounce = Math.sin(elapsed * 5.5) * 0.08;
          localPlayerModelRef.current.group.position.y = Math.max(0, bounce);
        }
        localPlayerModelRef.current.update(delta, elapsed);
      }

      updateBadges();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      controls.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [playerCustomization, activeLionsHallEvent]);

  // Event Selection Options
  const eventOptions: LionsHallEvent[] = [
    {
      type: 'rave',
      title: 'Fresher Welcome Rave',
      cost: 15000,
      moodGain: 25,
      description: 'Summons dancing student crowds, activates golden party strobes, and cranks up the campus mood.',
    },
    {
      type: 'dinner',
      title: 'Departmental Dinner & Awards',
      cost: 60000,
      moodGain: 60,
      popularityGain: 15,
      description: 'Prestigious black-tie awards gala. Awards +60 Mood and significantly boosts student social standing.',
    },
    {
      type: 'rally',
      title: 'SUG Campaign Mega Rally',
      cost: 120000,
      moodGain: 40,
      popularityGain: 30,
      description: 'Packs Lions Hall with passionate comrades and supporters, boosting election poll numbers by +30%!',
    },
  ];

  const handleSelectEvent = (event: LionsHallEvent) => {
    const success = hostLionsHallEvent(event);
    if (success) {
      setIsLionsEventModalOpen(false);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-white">
      {/* 3D Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing bg-white" />

      {/* Top Location HUD Bar */}
      <div className="absolute top-20 left-4 right-4 z-20 pointer-events-none flex items-center justify-between gap-3">
        {/* Left: Location Banner & Return Button */}
        <div className="pointer-events-auto flex items-center gap-2.5">
          <button
            onClick={() => navigateToLocation('campus_map')}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 hover:border-amber-500 text-slate-800 hover:text-amber-800 shadow-md transition-all active:scale-95 text-xs font-bold cursor-pointer"
          >
            <Compass className="w-4 h-4 text-amber-500" />
            <span>Return to Campus Map</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm text-xs font-semibold text-slate-700">
            <PartyPopper className="w-4 h-4 text-amber-500" />
            <span>Lions Hall • LU Events & Nightlife</span>
          </div>
        </div>

        {/* Right: Camera Reset & Quick Host Button */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setIsLionsEventModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Host Event</span>
          </button>

          <button
            onClick={handleResetCamera}
            title="Reset Camera Angle"
            className="p-2.5 rounded-2xl bg-white/95 border border-slate-200 shadow-sm text-slate-700 hover:text-slate-900 transition-all cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Screen Badges Projected over 3D Elements */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {screenBadges.map((badge) => {
          if (!badge.visible) return null;
          return (
            <div
              key={badge.id}
              style={{
                left: `${badge.screenX}px`,
                top: `${badge.screenY}px`,
                transform: 'translate(-50%, -100%)',
              }}
              className="absolute pointer-events-auto transition-transform duration-75"
            >
              <button
                onClick={() => {
                  if (badge.actionType === 'host_terminal') {
                    setIsLionsEventModalOpen(true);
                  } else if (badge.actionType === 'dj_booth') {
                    addToast('🔊 Concert line-array sound system running crystal clear!', 'info');
                  } else {
                    addToast('🍸 You chilled at the cocktail high-table and enjoyed the music.', 'info');
                  }
                }}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/95 hover:bg-white text-slate-800 shadow-lg border border-slate-200/90 hover:scale-105 transition-all cursor-pointer"
              >
                <span className="w-6 h-6 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xs shrink-0">
                  {badge.icon}
                </span>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 leading-tight">
                    {badge.label}
                  </span>
                  <span className="text-[10px] text-amber-600 font-medium">
                    {badge.role}
                  </span>
                </div>
              </button>
              <div className="w-0 h-0 mx-auto border-x-4 border-x-transparent border-t-6 border-t-white" />
            </div>
          );
        })}
      </div>

      {/* Event Hosting Modal (Strict White / Light Theme) */}
      {isLionsEventModalOpen && (
        <div
          onClick={() => setIsLionsEventModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-200 pointer-events-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg p-6 rounded-3xl bg-white border border-slate-200 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-200 text-slate-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shadow-xs">
                  <PartyPopper className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Host an Event at Lions Hall
                  </h3>
                  <p className="text-xs text-slate-500">
                    Book premier venue stages for student entertainment and political rallies
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsLionsEventModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Student Cash */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-semibold text-slate-600">Your Student Balance:</span>
              <span className="text-sm font-black text-amber-700 font-mono">
                ₦{stats.balance.toLocaleString()}
              </span>
            </div>

            {/* Event Options List */}
            <div className="flex flex-col gap-3">
              {eventOptions.map((opt) => {
                const canAfford = stats.balance >= opt.cost;
                const isRave = opt.type === 'rave';
                const isDinner = opt.type === 'dinner';

                return (
                  <div
                    key={opt.type}
                    className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-400 transition-all shadow-xs flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {isRave ? '🎉' : isDinner ? '🏆' : '📢'}
                        </span>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                            {opt.title}
                          </h4>
                          <span className="text-xs font-black text-amber-600 font-mono">
                            ₦{opt.cost.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <button
                        disabled={!canAfford}
                        onClick={() => handleSelectEvent(opt)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          canAfford
                            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm active:scale-95'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                        }`}
                      >
                        {canAfford ? 'Host Event' : 'Insufficient Cash'}
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {opt.description}
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        <Smile className="w-3 h-3 text-emerald-600" />
                        +{opt.moodGain} Mood
                      </span>
                      {opt.popularityGain && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                          <Vote className="w-3 h-3 text-blue-600" />
                          +{opt.popularityGain}% Poll Popularity
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
