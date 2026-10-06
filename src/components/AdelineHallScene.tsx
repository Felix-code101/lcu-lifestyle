import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useGame } from '../context/GameContext';
import { createCharacterModel, type CharacterModelInstance } from './CharacterModel';
import type { RemotePlayer } from '../types/game';
import {
  Music,
  Headphones,
  RotateCcw,
  X,
  Compass,
  Radio,
  Play,
  Pause,
  Disc,
} from 'lucide-react';

interface ScreenBadge {
  id: string;
  label: string;
  role: string;
  icon: string;
  screenX: number;
  screenY: number;
  visible: boolean;
  actionType: 'dj_booth' | 'dance_floor' | 'auditorium_seats';
}

interface TrackInfo {
  id: string;
  title: string;
  artist: string;
  tempo: string;
  genre: string;
  bpm: number;
}

const AFROBEAT_TRACKS: TrackInfo[] = [
  { id: 'track_amapiano', title: 'Amapiano Rush (Kepa Anthem)', artist: 'DJ Spin ft. LU Titans', tempo: '113 BPM', genre: 'Amapiano', bpm: 113 },
  { id: 'track_burna', title: 'Burna Campus Heat', artist: 'Burna Wave Band', tempo: '104 BPM', genre: 'Afro-Fusion', bpm: 104 },
  { id: 'track_asake', title: 'Asake Omo Ope Groove', artist: 'Asake Street Choir', tempo: '118 BPM', genre: 'Fuji-Afrobeats', bpm: 118 },
  { id: 'track_rema', title: 'Rema Calm Waves', artist: 'Afrorave Sound', tempo: '100 BPM', genre: 'Afrorave', bpm: 100 },
  { id: 'track_davido', title: 'Davido Unavailable Jam', artist: '30BG Campus Crew', tempo: '112 BPM', genre: 'Afrobeats', bpm: 112 },
];

export const AdelineHallScene: React.FC<{ remotePlayers: RemotePlayer[] }> = ({ remotePlayers }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const {
    stats,
    navigateToLocation,
    playerCustomization,
    isMusicRequestModalOpen,
    setIsMusicRequestModalOpen,
    activeTrackTitle,
    requestTrack,
    addToast,
  } = useGame();

  const [screenBadges, setScreenBadges] = useState<ScreenBadge[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<TrackInfo>(AFROBEAT_TRACKS[0]);

  // Audio Context Ref for Web Audio API synthesis
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioIntervalRef = useRef<number | null>(null);

  // Models refs
  const djModelRef = useRef<CharacterModelInstance | null>(null);
  const localPlayerModelRef = useRef<CharacterModelInstance | null>(null);
  const audienceModelsRef = useRef<CharacterModelInstance[]>([]);
  const remotePlayerModelsRef = useRef<Map<string, { model: CharacterModelInstance; player: RemotePlayer }>>(new Map());
  const remotePlayersGroupRef = useRef<THREE.Group | null>(null);

  // Web Audio Synthesizer: Plays melodic Afrobeat beat loop
  const startAfrobeatSynth = useCallback((bpm: number) => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (audioIntervalRef.current) {
        window.clearInterval(audioIntervalRef.current);
      }

      const beatMs = (60 / bpm) * 1000 * 0.5; // Eighth note step
      let step = 0;

      audioIntervalRef.current = window.setInterval(() => {
        if (!ctx || ctx.state !== 'running') return;
        const now = ctx.currentTime;

        // Kick / Log-drum on beats 0, 3, 4, 6
        if (step % 8 === 0 || step % 8 === 3 || step % 8 === 6) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(140, now);
          osc.frequency.exponentialRampToValueAtTime(38, now + 0.12);
          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.2);
        }

        // Shaker / Hi-hat on every offbeat
        if (step % 2 === 1) {
          const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          for (let i = 0; i < noiseBuffer.length; i++) {
            output[i] = Math.random() * 2 - 1;
          }
          const whiteNoise = ctx.createBufferSource();
          whiteNoise.buffer = noiseBuffer;
          const filter = ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.value = 6000;
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
          whiteNoise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          whiteNoise.start(now);
        }

        // Afrobeat Marimba / Kalimba Chord Stabs
        if (step % 4 === 2) {
          const freqs = [330, 392, 494, 587];
          const note = freqs[(step / 4) % freqs.length];
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(note, now);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.25);
        }

        step = (step + 1) % 16;
      }, beatMs);

      setIsPlayingAudio(true);
    } catch {
      // Audio not supported in environment
    }
  }, []);

  const stopAfrobeatSynth = useCallback(() => {
    if (audioIntervalRef.current) {
      window.clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
    setIsPlayingAudio(false);
  }, []);

  // Sync Remote Players
  useEffect(() => {
    const group = remotePlayersGroupRef.current;
    if (!group) return;

    const hallPlayers = remotePlayers.filter((p) => p.location === 'adeline_hall');
    const currentMap = remotePlayerModelsRef.current;

    for (const [id, item] of currentMap.entries()) {
      if (!hallPlayers.some((p) => p.id === id)) {
        group.remove(item.model.group);
        currentMap.delete(id);
      }
    }

    hallPlayers.forEach((p, idx) => {
      const defaultX = idx % 2 === 0 ? 3.0 : -3.0;
      const defaultZ = idx % 2 === 0 ? 1.0 : -1.0;
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

  const handleResetCamera = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(13, 13, 13);
    controlsRef.current.target.set(0, 1.2, 0);
    controlsRef.current.update();
  }, []);

  // 3D Scene Lifecycle
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#f8fafc');

    // 2. Camera
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 1000);
    camera.position.set(13, 13, 13);
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

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#fff1f2', 1.25);
    dirLight.position.set(12, 22, 14);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Subtle Pink/Purple Stage Spotlights
    const stagePinkLight = new THREE.PointLight('#ec4899', 1.6, 14);
    stagePinkLight.position.set(-3.5, 4.5, -3.2);
    scene.add(stagePinkLight);

    const stageBlueLight = new THREE.PointLight('#8b5cf6', 1.4, 14);
    stageBlueLight.position.set(3.5, 4.5, -3.2);
    scene.add(stageBlueLight);

    // 6. Floor: Crisp Light Porcelain Flooring
    const floorMat = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      roughness: 0.22,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.6 });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(16, 6, 0.4), wallMat);
    backWall.position.set(0, 3, -8);
    scene.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 6, 16), wallMat);
    leftWall.position.set(-8, 3, 0);
    scene.add(leftWall);

    // Acoustic Slats on Back Wall
    [-6, -4, -2, 0, 2, 4, 6].forEach((ax) => {
      const slat = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 5.0, 0.1),
        new THREE.MeshStandardMaterial({ color: '#fbcfe8', roughness: 0.4 })
      );
      slat.position.set(ax, 3.0, -7.75);
      scene.add(slat);
    });

    // 7. Central Stage Riser & DJ Booth
    const stageRiserMat = new THREE.MeshStandardMaterial({ color: '#1e1b4b', roughness: 0.4 });
    const stageRiser = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.6, 4.2), stageRiserMat);
    stageRiser.position.set(0, 0.3, -4.5);
    scene.add(stageRiser);

    // Neon Edge Trim
    const neonTrim = new THREE.Mesh(
      new THREE.BoxGeometry(8.6, 0.08, 0.1),
      new THREE.MeshStandardMaterial({ color: '#ec4899', emissive: '#ec4899', emissiveIntensity: 1.6 })
    );
    neonTrim.position.set(0, 0.58, -2.35);
    scene.add(neonTrim);

    // DJ Booth Desk (Fronted with "DJ SPIN / ADELINE BEATS" Neon Billboard)
    const djBoothGroup = new THREE.Group();
    djBoothGroup.position.set(0, 0, -3.8);

    const deskMat = new THREE.MeshStandardMaterial({ color: '#09090b', roughness: 0.3 });
    const desk = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.1, 1.0), deskMat);
    desk.position.y = 1.15;
    djBoothGroup.add(desk);

    // DJ Front Neon Faceplate
    const signFace = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.8, 0.05),
      new THREE.MeshStandardMaterial({ color: '#831843', emissive: '#ec4899', emissiveIntensity: 0.8 })
    );
    signFace.position.set(0, 1.15, 0.53);
    djBoothGroup.add(signFace);

    // Turntables & Headphones
    [-0.7, 0.7].forEach((tx) => {
      const turntable = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 0.05, 24),
        new THREE.MeshStandardMaterial({ color: '#18181b', metalness: 0.7 })
      );
      turntable.position.set(tx, 1.73, 0);
      djBoothGroup.add(turntable);

      // Gold Record Disc
      const vinyl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.24, 0.02, 24),
        new THREE.MeshStandardMaterial({ color: '#09090b' })
      );
      vinyl.position.set(tx, 1.77, 0);
      djBoothGroup.add(vinyl);
    });

    scene.add(djBoothGroup);

    // 8. Auditorium Seating Benches
    [-3.8, 3.8].forEach((bx) => {
      [1.5, 4.0].forEach((bz) => {
        const benchGroup = new THREE.Group();
        benchGroup.position.set(bx, 0, bz);

        const bench = new THREE.Mesh(
          new THREE.BoxGeometry(2.6, 0.45, 0.8),
          new THREE.MeshStandardMaterial({ color: '#fdf2f8', roughness: 0.5 })
        );
        bench.position.y = 0.22;
        benchGroup.add(bench);

        // Violet Cushion
        const cushion = new THREE.Mesh(
          new THREE.BoxGeometry(2.5, 0.1, 0.7),
          new THREE.MeshStandardMaterial({ color: '#db2777', roughness: 0.4 })
        );
        cushion.position.y = 0.48;
        benchGroup.add(cushion);

        scene.add(benchGroup);
      });
    });

    // 9. Characters
    const charactersGroup = new THREE.Group();
    scene.add(charactersGroup);

    const remoteGroup = new THREE.Group();
    remotePlayersGroupRef.current = remoteGroup;
    scene.add(remoteGroup);

    // DJ Spin Model behind the turntables
    const djModel = createCharacterModel({
      skinTone: '#6d4527',
      shirtColor: '#ec4899',
      shirtPattern: 'plain',
      pantsColor: '#18181b',
      shoesColor: '#ffffff',
      hairStyle: 'dreads',
      hairColor: '#18181b',
      accessory: 'cap',
    });
    djModel.group.position.set(0, 0.6, -4.8);
    djModel.group.rotation.y = 0;
    charactersGroup.add(djModel.group);
    djModelRef.current = djModel;

    // Local Player on Dance Floor
    const localPlayer = createCharacterModel(playerCustomization);
    localPlayer.group.position.set(0, 0, 0.5);
    localPlayer.group.rotation.y = Math.PI;
    charactersGroup.add(localPlayer.group);
    localPlayerModelRef.current = localPlayer;

    // Dancing Students
    const audAvatars: CharacterModelInstance[] = [];
    const danceConfigs = [
      { pos: [-1.8, 0, 0.0], skin: '#452a17', shirt: '#3b82f6', pants: '#1e293b' },
      { pos: [1.8, 0, 0.0], skin: '#8c5835', shirt: '#f59e0b', pants: '#0f172a' },
      { pos: [0, 0, 2.5], skin: '#6d4527', shirt: '#10b981', pants: '#334155' },
    ];

    danceConfigs.forEach((cfg) => {
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
      charactersGroup.add(m.group);
      audAvatars.push(m);
    });
    audienceModelsRef.current = audAvatars;

    // 10. Screen Badges Projection
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

      // 1. DJ Spin Request Booth Badge
      const djProj = project([0, 2.4, -3.8]);
      newBadges.push({
        id: 'badge_dj_booth',
        label: 'DJ Spin Beats Booth',
        role: 'Request Afrobeat Jam (₦500)',
        icon: '🎧',
        screenX: djProj.x,
        screenY: djProj.y,
        visible: djProj.visible,
        actionType: 'dj_booth',
      });

      // 2. Dance Floor Badge
      const danceProj = project([0, 1.8, 0.8]);
      newBadges.push({
        id: 'badge_dance',
        label: 'Adeline Dance Floor',
        role: 'Groove & Vibe',
        icon: '💃',
        screenX: danceProj.x,
        screenY: danceProj.y,
        visible: danceProj.visible,
        actionType: 'dance_floor',
      });

      setScreenBadges(newBadges);
    };

    // 11. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      controls.update();

      // Animate DJ Spin head nodding / hand scratching
      if (djModelRef.current) {
        const djNod = Math.sin(elapsed * 7) * 0.05;
        djModelRef.current.group.position.y = 0.6 + djNod;
        djModelRef.current.update(delta, elapsed);
      }

      // Animate dancing avatars
      audienceModelsRef.current.forEach((m, i) => {
        const bounce = Math.sin(elapsed * 6 + i * 1.8) * 0.07;
        m.group.position.y = Math.max(0, bounce);
        m.group.rotation.y += Math.sin(elapsed * 3 + i) * 0.015;
        m.update(delta, elapsed);
      });

      if (localPlayerModelRef.current) {
        if (isPlayingAudio) {
          const pBounce = Math.sin(elapsed * 6) * 0.07;
          localPlayerModelRef.current.group.position.y = Math.max(0, pBounce);
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
      stopAfrobeatSynth();
      renderer.dispose();
      controls.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [playerCustomization, isPlayingAudio, stopAfrobeatSynth]);

  // Handle Track Selection
  const handleSelectTrack = (track: TrackInfo) => {
    const success = requestTrack(track.title);
    if (success) {
      setCurrentTrack(track);
      startAfrobeatSynth(track.bpm);
      setIsMusicRequestModalOpen(false);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-white">
      {/* 3D Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing bg-white" />

      {/* Top Location HUD Bar */}
      <div className="absolute top-20 left-4 right-4 z-20 pointer-events-none flex items-center justify-between gap-3">
        {/* Left: Location Banner & Return */}
        <div className="pointer-events-auto flex items-center gap-2.5">
          <button
            onClick={() => {
              stopAfrobeatSynth();
              navigateToLocation('campus_map');
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 hover:border-pink-500 text-slate-800 hover:text-pink-800 shadow-md transition-all active:scale-95 text-xs font-bold cursor-pointer"
          >
            <Compass className="w-4 h-4 text-pink-500" />
            <span>Return to Campus Map</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm text-xs font-semibold text-slate-700">
            <Music className="w-4 h-4 text-pink-500" />
            <span>Adeline Hall • DJ Spin Beats Hub</span>
          </div>
        </div>

        {/* Right: Audio Player Pill & Request Track Button */}
        <div className="pointer-events-auto flex items-center gap-2">
          {isPlayingAudio && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-pink-50 border border-pink-200 text-pink-800 text-xs font-bold animate-pulse">
              <Radio className="w-4 h-4 text-pink-600 animate-spin" />
              <span>Playing: {activeTrackTitle || currentTrack.title}</span>
              <button
                onClick={stopAfrobeatSynth}
                className="p-1 rounded-lg hover:bg-pink-100 text-pink-700 transition-colors"
                title="Stop Audio"
              >
                <Pause className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={() => setIsMusicRequestModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Disc className="w-4 h-4 text-white" />
            <span>Request Track (₦500)</span>
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
                  if (badge.actionType === 'dj_booth') {
                    setIsMusicRequestModalOpen(true);
                  } else {
                    addToast('💃 You hit the dance floor to Afrobeat grooves!', 'info');
                  }
                }}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/95 hover:bg-white text-slate-800 shadow-lg border border-slate-200/90 hover:scale-105 transition-all cursor-pointer"
              >
                <span className="w-6 h-6 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center text-xs shrink-0">
                  {badge.icon}
                </span>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 leading-tight">
                    {badge.label}
                  </span>
                  <span className="text-[10px] text-pink-600 font-medium">
                    {badge.role}
                  </span>
                </div>
              </button>
              <div className="w-0 h-0 mx-auto border-x-4 border-x-transparent border-t-6 border-t-white" />
            </div>
          );
        })}
      </div>

      {/* Music Request Bottom Sheet / Modal (Strict White / Light Theme) */}
      {isMusicRequestModalOpen && (
        <div
          onClick={() => setIsMusicRequestModalOpen(false)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-5 bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-200 pointer-events-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-bottom-6 duration-200 text-slate-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center border border-pink-200 shadow-xs">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    DJ Spin Track Request
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tip DJ Spin ₦500 to spin your favorite campus anthem on the main sound system
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsMusicRequestModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Balance & Tip Notice */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-semibold text-slate-600">Request Fee:</span>
              <span className="text-sm font-black text-pink-600 font-mono">
                ₦500 / Track
              </span>
            </div>

            {/* Curated Afrobeat Playlist */}
            <div className="flex flex-col gap-2.5 max-h-[55vh] overflow-y-auto pr-1">
              {AFROBEAT_TRACKS.map((t) => {
                const canAfford = stats.balance >= 500;
                const isSelected = currentTrack.id === t.id && isPlayingAudio;

                return (
                  <div
                    key={t.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-pink-50 border-pink-300 shadow-xs'
                        : 'bg-white border-slate-200/90 hover:border-pink-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-pink-100/70 text-pink-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {isSelected ? <Play className="w-4 h-4 animate-pulse" /> : <Music className="w-4 h-4" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900">
                          {t.title}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {t.artist} • <span className="font-mono text-pink-600 font-semibold">{t.tempo}</span>
                        </span>
                      </div>
                    </div>

                    <button
                      disabled={!canAfford}
                      onClick={() => handleSelectTrack(t)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                        canAfford
                          ? 'bg-pink-600 hover:bg-pink-700 text-white shadow-xs active:scale-95'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      }`}
                    >
                      {isSelected ? 'Playing' : 'Request (₦500)'}
                    </button>
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
