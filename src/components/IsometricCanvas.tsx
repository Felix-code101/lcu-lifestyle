import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useGame } from '../context/GameContext';
import { createItemMesh } from './roomModelHelpers';
import { createCharacterModel, type CharacterModelInstance } from './CharacterModel';
import { CAMPUS_LOCATIONS, DEFAULT_LOCATION_ITEMS, getDefaultHostelItems } from '../data/campusData';
import { CAMPUS_NPCS } from '../data/npcData';
import { TileInteractModal } from './TileInteractModal';
import type { RoomItem, CampusNPC, GameLocation, CharacterCustomization, RemotePlayer } from '../types/game';
import { RemoteStudentModal } from './RemoteStudentModal';
import { MapPin } from 'lucide-react';
import { soundManager } from '../lib/soundManager';
import { getStudentAccounts, saveStudentAccount, supabase } from '../lib/supabase';

export interface HostelInteractiveAction {
  type: 'bed' | 'bath' | 'study' | 'wardrobe' | 'sweep';
  icon: string;
  label: string;
  duration: number; // in seconds
  description: string;
}

export function getHostelItemAction(item: RoomItem): HostelInteractiveAction | null {
  if (item.type === 'bunk_bed' || item.type === 'bed') {
    return {
      type: 'bed',
      icon: '🛏️',
      label: 'Sleep & Rest',
      duration: 5,
      description: 'Restores Energy to 100%, advances in-game clock by 4 hours',
    };
  }
  if (item.type === 'water_gallon') {
    return {
      type: 'bath',
      icon: '🚿',
      label: 'Take a Bath',
      duration: 4,
      description: 'Hygiene/Mood +25%, Energy +10%',
    };
  }
  if (item.type === 'desk' || item.type === 'laptop_and_books' || item.type === 'chair') {
    return {
      type: 'study',
      icon: '📖',
      label: 'Self Study & Revision',
      duration: 6,
      description: '+3% Exam Preparation, -8 Energy',
    };
  }
  if (item.type === 'locker') {
    return {
      type: 'wardrobe',
      icon: '👕',
      label: 'Change Clothes',
      duration: 0,
      description: 'Open wardrobe & customize outfit',
    };
  }
  if (item.type === 'waste_bin') {
    return {
      type: 'sweep',
      icon: '🧹',
      label: 'Sweep Room',
      duration: 3,
      description: 'Room cleanliness set to 100%, +5 XP',
    };
  }
  return null;
}

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
}

export const IsometricCanvas: React.FC<{ remotePlayers?: RemotePlayer[] }> = ({ remotePlayers = [] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    roomItems,
    addItemToRoom,
    removeItemFromRoom,
    rotateItemInRoom,
    selectedPlacingItem,
    setSelectedPlacingItem,
    spendBalance,
    stats,
    resetCameraTrigger,
    dayNightCycle,
    currentLocation,
    isTransitioning,
    playerCustomization,
    setActiveDialogueNPC,
    activeDialogueNPC,
    setIsWardrobeOpen,
    isWardrobeOpen,
    activeTab,
    isPhoneOpen,
    addToast,
    setStats,
  } = useGame();

  const [hoveredTile, setHoveredTile] = useState<{ x: number; z: number } | null>(null);
  const [activeInteractTile, setActiveInteractTile] = useState<{ x: number; z: number } | null>(null);
  const [activeInteractItem, setActiveInteractItem] = useState<RoomItem | null>(null);
  const [screenBadges, setScreenBadges] = useState<ScreenBadge[]>([]);
  const [selectedRemoteStudent, setSelectedRemoteStudent] = useState<RemotePlayer | null>(null);
  const pointerDownPosRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Player autonomous movement & location tracking
  const playerPositionRef = useRef<{ x: number; z: number }>({ x: 0, z: 0 });
  const playerTargetRef = useRef<{ x: number; z: number; onArrival?: () => void } | null>(null);

  // Interactive objects Sims-Style floating bubble state
  interface FloatingBubbleState {
    item: RoomItem;
    action: HostelInteractiveAction;
  }
  const [activeBubble, setActiveBubble] = useState<FloatingBubbleState | null>(null);
  const activeBubbleRef = useRef<FloatingBubbleState | null>(null);
  activeBubbleRef.current = activeBubble;
  const [bubbleScreenPos, setBubbleScreenPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Active running interaction state
  interface ActiveActionState {
    action: HostelInteractiveAction;
    item: RoomItem;
    startTime: number;
    durationMs: number;
  }
  const [activeAction, setActiveAction] = useState<ActiveActionState | null>(null);
  const activeActionRef = useRef<ActiveActionState | null>(null);
  activeActionRef.current = activeAction;

  const [actionProgress, setActionProgress] = useState<number>(0);
  const [actionRemainingSec, setActionRemainingSec] = useState<number>(0);
  const [overheadScreenPos, setOverheadScreenPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [bedScreenPos, setBedScreenPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Handle action start
  const handleStartAction = useCallback(
    (action: HostelInteractiveAction, item: RoomItem) => {
      setActiveBubble(null);

      if (action.type === 'wardrobe') {
        soundManager.playClick();
        setIsWardrobeOpen(true);
        return;
      }

      // Lock player movement
      playerTargetRef.current = null;
      if (playerModelRef.current) {
        playerModelRef.current.setWalking(false);
      }

      const durationMs = action.duration * 1000;
      const newAction: ActiveActionState = {
        action,
        item,
        startTime: Date.now(),
        durationMs,
      };

      activeActionRef.current = newAction;
      setActiveAction(newAction);
      setActionProgress(0);
      setActionRemainingSec(action.duration);

      // Animation / Poses / Initial Audio
      if (action.type === 'bed') {
        if (playerModelRef.current) {
          playerModelRef.current.group.position.set(item.x, 0.82, item.z);
          playerModelRef.current.group.rotation.set(0, 0, Math.PI / 2);
          playerPositionRef.current = { x: item.x, z: item.z };
        }
      } else if (action.type === 'bath') {
        soundManager.playSplash();
      } else if (action.type === 'study') {
        soundManager.playStudy();
        if (playerModelRef.current) {
          playerModelRef.current.group.position.set(item.x, 0, item.z + 1.0);
          playerModelRef.current.group.rotation.set(0, Math.PI, 0);
          playerPositionRef.current = { x: item.x, z: item.z + 1.0 };
        }
      } else if (action.type === 'sweep') {
        soundManager.playSweep();
      }
    },
    [setIsWardrobeOpen]
  );

  // Handle action completion
  const handleCompleteAction = useCallback(
    (actionState: ActiveActionState) => {
      const { action, item } = actionState;
      activeActionRef.current = null;
      setActiveAction(null);
      setActionProgress(100);

      // Play success chime
      soundManager.playChime();

      // Reset avatar orientation if sleeping or studying
      if (action.type === 'bed') {
        if (playerModelRef.current) {
          playerModelRef.current.group.position.set(item.x + 1.2, 0, item.z);
          playerModelRef.current.group.rotation.set(0, Math.PI / 4, 0);
          playerPositionRef.current = { x: item.x + 1.2, z: item.z };
        }
      } else if (action.type === 'study') {
        if (playerModelRef.current) {
          playerModelRef.current.group.rotation.set(0, Math.PI / 4, 0);
        }
      }

      // Apply stat rewards
      setStats((prev) => {
        let next = { ...prev };
        if (action.type === 'bed') {
          let newHour = prev.inGameHours + 4;
          let newDay = prev.day;
          if (newHour >= 24) {
            newHour = newHour % 24;
            newDay += 1;
          }
          next = {
            ...prev,
            energy: prev.maxEnergy,
            inGameHours: newHour,
            day: newDay,
          };
          addToast('🛏️ Well rested! Energy restored to 100% (+4 hours in-game)', 'success');
        } else if (action.type === 'bath') {
          next = {
            ...prev,
            mood: Math.min(100, prev.mood + 25),
            cleanliness: Math.min(100, (prev.cleanliness ?? 100) + 25),
            energy: Math.min(prev.maxEnergy, prev.energy + 10),
          };
          addToast('🚿 Fresh & clean! Mood +25%, Energy +10%', 'success');
        } else if (action.type === 'study') {
          next = {
            ...prev,
            examPrep: Math.min(100, (prev.examPrep ?? 0) + 3),
            energy: Math.max(0, prev.energy - 8),
            knowledge: prev.knowledge + 15,
            xp: prev.xp + 8,
          };
          addToast('📖 Revision completed! Exam Prep +3%, Energy -8', 'success');
        } else if (action.type === 'sweep') {
          next = {
            ...prev,
            cleanliness: 100,
            xp: prev.xp + 5,
          };
          addToast('🧹 Room swept clean! Cleanliness 100%, +5 XP', 'success');
        }

        // Persist to localStorage & Supabase
        try {
          localStorage.setItem('lu_player_profile', JSON.stringify(next));
          getStudentAccounts()
            .then(async (accounts) => {
              const idx = accounts.findIndex(
                (a) => a.matricNo.toLowerCase() === next.matricNo.toLowerCase()
              );
              if (idx >= 0) {
                accounts[idx].balance = next.balance;
                await saveStudentAccount(accounts[idx]);
              }
            })
            .catch(() => {});

          if (supabase && next.matricNo) {
            Promise.resolve(
              supabase
                .from('students')
                .update({
                  lastActive: new Date().toISOString(),
                })
                .eq('matricNo', next.matricNo)
            ).catch(() => {});
          }
        } catch {
          // ignore
        }

        return next;
      });
    },
    [setStats, addToast]
  );

  // Active action progress heartbeat
  useEffect(() => {
    if (!activeAction) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - activeAction.startTime;
      const progress = Math.min(100, (elapsed / activeAction.durationMs) * 100);
      const remainingSec = Math.max(0, Math.ceil((activeAction.durationMs - elapsed) / 1000));

      setActionProgress(progress);
      setActionRemainingSec(remainingSec);

      // Gentle splash mid-bath
      if (activeAction.action.type === 'bath' && elapsed > 1800 && elapsed < 1900) {
        soundManager.playSplash();
      }

      if (elapsed >= activeAction.durationMs) {
        clearInterval(interval);
        handleCompleteAction(activeAction);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [activeAction, handleCompleteAction]);

  // Reset selected tile, placement coordinates, and active interaction state
  const handleClosePlacement = useCallback(() => {
    setActiveInteractTile(null);
    setActiveInteractItem(null);
    setActiveBubble(null);
    setHoveredTile(null);
    setSelectedPlacingItem(null);
    if (tileHighlightRef.current) {
      tileHighlightRef.current.visible = false;
    }
  }, [setSelectedPlacingItem]);

  // Auto-Dismiss Modals & Placement Tools on Navigation Tab or Location Change
  useEffect(() => {
    handleClosePlacement();
    setActiveBubble(null);
    if (currentLocation !== 'home_hostel') {
      activeActionRef.current = null;
      setActiveAction(null);
      playerTargetRef.current = null;
    }
  }, [activeTab, currentLocation, isPhoneOpen, handleClosePlacement]);

  // Strict Hostel Placement Gating: Abort and warn if placement triggered outside personal hostel room
  useEffect(() => {
    const isHostel = currentLocation === 'home_hostel' || (currentLocation as string) === 'hostel';
    if (!isHostel && selectedPlacingItem) {
      setSelectedPlacingItem(null);
      addToast('Furniture can only be placed inside your personal hostel room!', 'warning');
      soundManager.playError();
    }
  }, [currentLocation, selectedPlacingItem, setSelectedPlacingItem, addToast]);

  // Three.js Scene References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const itemsGroupRef = useRef<THREE.Group | null>(null);
  const charactersGroupRef = useRef<THREE.Group | null>(null);
  const remotePlayersGroupRef = useRef<THREE.Group | null>(null);
  const remotePlayerModelsRef = useRef<Map<string, { model: CharacterModelInstance; player: RemotePlayer }>>(new Map());
  const tileHighlightRef = useRef<THREE.Mesh | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const clockSecondHandRef = useRef<THREE.Mesh | null>(null);

  // Character instances
  const playerModelRef = useRef<CharacterModelInstance | null>(null);
  const npcModelRef = useRef<CharacterModelInstance | null>(null);
  const currentNPCRef = useRef<CampusNPC | null>(null);

  // Sync 3D item meshes with gender-aware hostel room template fallback
  const syncItems = useCallback((items: RoomItem[], loc: GameLocation) => {
    if (!itemsGroupRef.current) return;
    const group = itemsGroupRef.current;

    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
    }

    const isFemale =
      stats.gender === 'female' ||
      (stats.assignedHostel &&
        (stats.assignedHostel.toLowerCase().includes('female') ||
          stats.assignedHostel.toLowerCase().includes('queen') ||
          stats.assignedHostel.toLowerCase().includes('ruby')));

    const fallbackList =
      loc === 'home_hostel'
        ? getDefaultHostelItems(isFemale ? 'female' : 'male', stats.assignedHostel)
        : (DEFAULT_LOCATION_ITEMS[loc] || DEFAULT_LOCATION_ITEMS.home_hostel);
    const listToRender = items && items.length > 0 ? items : fallbackList;

    listToRender.forEach((item) => {
      const mesh = createItemMesh(item);
      group.add(mesh);
    });
  }, [stats.gender, stats.assignedHostel]);

  // Sync Characters (Player at [0, 0, 0], Roommate NPC at [3, 0, -2])
  const syncCharacters = useCallback(
    (loc: GameLocation, custom: CharacterCustomization) => {
      if (!charactersGroupRef.current) return;
      const group = charactersGroupRef.current;

      while (group.children.length > 0) {
        group.remove(group.children[0]);
      }

      // 1. Spawn Player's 3D Character on floor plane at dynamic playerPosition
      const playerInstance = createCharacterModel(custom);
      playerModelRef.current = playerInstance;
      playerInstance.group.position.set(playerPositionRef.current.x, 0, playerPositionRef.current.z);
      playerInstance.group.rotation.y = Math.PI / 4;
      group.add(playerInstance.group);

      // 2. Spawn Room NPC (Gender-based Roommate: Strictly private instance with designated gender-matching roommate)
      let matchingNPC: CampusNPC | null = null;
      if (loc === 'home_hostel') {
        if (stats.roommateEvicted) {
          // Roommate evicted: strictly solo private instance
          matchingNPC = null;
        } else {
          const isFemale = stats.gender === 'female';
          if (isFemale) {
            // Strictly female roommate (Zainab), exclude any male NPCs (Chike, Yinka, Femi)
            matchingNPC =
              CAMPUS_NPCS.find(
                (n) =>
                  n.id === 'npc_zainab' ||
                  (n.location === 'home_hostel' &&
                    (n.gender === 'female' || n.customization.gender === 'female') &&
                    n.id !== 'npc_femi' &&
                    n.id !== 'npc_chike')
              ) || null;
          } else {
            // Strictly male roommate (Femi), exclude any female NPCs (Zainab, Chioma)
            matchingNPC =
              CAMPUS_NPCS.find(
                (n) =>
                  n.id === 'npc_femi' ||
                  (n.location === 'home_hostel' &&
                    (n.gender === 'male' || n.customization.gender === 'male') &&
                    n.id !== 'npc_zainab' &&
                    n.id !== 'npc_chioma')
              ) || null;
          }
        }
      } else {
        matchingNPC = CAMPUS_NPCS.find((n) => n.location === loc) || null;
      }

      currentNPCRef.current = matchingNPC;

      if (matchingNPC) {
        const npcInstance = createCharacterModel(matchingNPC.customization);
        npcModelRef.current = npcInstance;
        const isHostelRoom = loc === 'home_hostel' || matchingNPC.id === 'npc_femi' || matchingNPC.id === 'npc_zainab';
        const npcPos: [number, number, number] = isHostelRoom ? [3, 0, -2] : matchingNPC.position;
        npcInstance.group.position.set(npcPos[0], 0, npcPos[2]);
        npcInstance.group.rotation.y = matchingNPC.rotation;
        group.add(npcInstance.group);
      } else {
        npcModelRef.current = null;
      }
    },
    [stats.roommateEvicted, stats.gender]
  );

  // Reactive listeners for state updates
  useEffect(() => {
    syncItems(roomItems, currentLocation);
  }, [roomItems, currentLocation, syncItems]);

  useEffect(() => {
    syncCharacters(currentLocation, playerCustomization);
  }, [currentLocation, playerCustomization, syncCharacters]);

  // Sync Remote Multiplayer Characters in current location (Hostel room is private client instance)
  useEffect(() => {
    if (!remotePlayersGroupRef.current) return;
    const group = remotePlayersGroupRef.current;
    const currentMap = remotePlayerModelsRef.current;

    // Personal Isolated Room Instance: Never render remote players in hostel room
    if (currentLocation === 'home_hostel') {
      currentMap.forEach((entry) => {
        group.remove(entry.model.group);
      });
      currentMap.clear();
      return;
    }

    const activeIds = new Set(remotePlayers.map((p) => p.id));
    currentMap.forEach((entry, id) => {
      if (!activeIds.has(id)) {
        group.remove(entry.model.group);
        currentMap.delete(id);
      }
    });

    remotePlayers.forEach((p, idx) => {
      const defaultX = idx % 2 === 0 ? 2.2 + idx * 0.9 : -2.2 - idx * 0.9;
      const defaultZ = idx % 2 === 0 ? 1.4 : -1.4;
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

  // Reset Camera smoothly to PerspectiveCamera [12.5, 14.5, 12.5] looking at [0, 0.75, 0]
  useEffect(() => {
    if (resetCameraTrigger > 0 && cameraRef.current && controlsRef.current) {
      const camera = cameraRef.current;
      const controls = controlsRef.current;
      camera.position.set(12.5, 14.5, 12.5);
      controls.target.set(0, 0.75, 0);
      camera.lookAt(0, 0.75, 0);
      camera.updateProjectionMatrix();
      controls.update();
    }
  }, [resetCameraTrigger]);

  // Dynamic Day/Night Lighting
  useEffect(() => {
    if (!dirLightRef.current || !hemiLightRef.current) return;

    if (!dayNightCycle) {
      dirLightRef.current.position.set(-18, 16, -4);
      dirLightRef.current.color.set('#fffdf5');
      dirLightRef.current.intensity = 1.6;
      hemiLightRef.current.color.set('#ffffff');
      hemiLightRef.current.groundColor.set('#f1f5f9');
      hemiLightRef.current.intensity = 1.35;
      return;
    }

    const h = stats.inGameHours + stats.inGameMinutes / 60;
    if (h >= 6 && h < 18) {
      dirLightRef.current.position.set(-18, 16, -4);
      dirLightRef.current.color.set('#fffdf5');
      dirLightRef.current.intensity = 1.6;
      hemiLightRef.current.color.set('#ffffff');
      hemiLightRef.current.groundColor.set('#f1f5f9');
      hemiLightRef.current.intensity = 1.35;
    } else if (h >= 18 && h < 21) {
      dirLightRef.current.position.set(-18, 10, 6);
      dirLightRef.current.color.set('#fed7aa');
      dirLightRef.current.intensity = 1.4;
      hemiLightRef.current.color.set('#fef08a');
      hemiLightRef.current.groundColor.set('#e2e8f0');
      hemiLightRef.current.intensity = 1.1;
    } else {
      dirLightRef.current.position.set(-14, 14, -8);
      dirLightRef.current.color.set('#93c5fd');
      dirLightRef.current.intensity = 0.7;
      hemiLightRef.current.color.set('#cbd5e1');
      hemiLightRef.current.groundColor.set('#94a3b8');
      hemiLightRef.current.intensity = 0.85;
    }
  }, [stats.inGameHours, stats.inGameMinutes, dayNightCycle]);

  // Main Three.js Scene Initialization
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene with clean bright white background
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#ffffff');

    // 2. First-person isometric PerspectiveCamera explicitly at [12.5, 14.5, 12.5] with fov: 40
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(12.5, 14.5, 12.5);
    camera.lookAt(0, 0.75, 0);

    // 3. Renderer with antialias and soft shadows
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    // 4. OrbitControls with shallow isometric limits looking at [0, 0.75, 0]
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.target.set(0, 0.75, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 6;
    controls.maxDistance = 45;
    controls.minPolarAngle = Math.PI / 6;
    controls.maxPolarAngle = Math.PI / 2.3;
    controls.update();

    // 5. Lighting: Ambient light (intensity: 1.2) + directional sunlight pointing at [0, 0, 0]
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight('#ffffff', '#f1f5f9', 0.65);
    hemiLightRef.current = hemiLight;
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight('#fffdf5', 1.5);
    dirLightRef.current = dirLight;
    dirLight.position.set(-18, 16, -4);
    dirLight.target.position.set(0, 0, 0);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 60;
    const d = 16;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0001;
    dirLight.shadow.normalBias = 0.03;
    scene.add(dirLight);
    scene.add(dirLight.target);

    const fillLight = new THREE.DirectionalLight('#e0f2fe', 0.5);
    fillLight.position.set(14, 12, 14);
    fillLight.target.position.set(0, 0, 0);
    scene.add(fillLight);
    scene.add(fillLight.target);

    const deskLampLight = new THREE.PointLight('#fef08a', 1.2, 10);
    deskLampLight.position.set(-2.5, 2.5, -7.0);
    scene.add(deskLampLight);

    // 6. Base Foundation Plinth (18.2 x 0.8 x 18.2)
    const plinthGeo = new THREE.BoxGeometry(18.2, 0.8, 18.2);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: '#e2e8f0',
      roughness: 0.85,
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = -0.4;
    plinth.receiveShadow = true;
    scene.add(plinth);

    // 7. Procedural 18x18 Floor Tile Grid
    const floorGroup = new THREE.Group();
    scene.add(floorGroup);

    const floorSlabGeo = new THREE.BoxGeometry(18, 0.1, 18);
    const floorSlabMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.75 });
    const floorSlab = new THREE.Mesh(floorSlabGeo, floorSlabMat);
    floorSlab.position.y = -0.05;
    floorSlab.receiveShadow = true;
    floorGroup.add(floorSlab);

    const tilePlaneGeo = new THREE.PlaneGeometry(0.96, 0.96);
    tilePlaneGeo.rotateX(-Math.PI / 2);
    const tilePlaneMat = new THREE.MeshStandardMaterial({
      roughness: 0.7,
      metalness: 0.05,
    });

    const instancedTiles = new THREE.InstancedMesh(tilePlaneGeo, tilePlaneMat, 324);
    instancedTiles.receiveShadow = true;
    const dummy = new THREE.Object3D();
    const colorWhite = new THREE.Color('#f8fafc');
    const colorLightGrey = new THREE.Color('#f1f5f9');

    let instanceIdx = 0;
    for (let ix = 0; ix < 18; ix++) {
      for (let iz = 0; iz < 18; iz++) {
        const tx = -9 + ix + 0.5;
        const tz = -9 + iz + 0.5;
        dummy.position.set(tx, 0.002, tz);
        dummy.updateMatrix();
        instancedTiles.setMatrixAt(instanceIdx, dummy.matrix);

        const isAlt = (ix + iz) % 2 === 0;
        instancedTiles.setColorAt(instanceIdx, isAlt ? colorWhite : colorLightGrey);
        instanceIdx++;
      }
    }
    instancedTiles.instanceMatrix.needsUpdate = true;
    if (instancedTiles.instanceColor) instancedTiles.instanceColor.needsUpdate = true;
    floorGroup.add(instancedTiles);

    const gridLinePoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 18; i++) {
      const coord = -9 + i;
      gridLinePoints.push(new THREE.Vector3(-9, 0.006, coord));
      gridLinePoints.push(new THREE.Vector3(9, 0.006, coord));
      gridLinePoints.push(new THREE.Vector3(coord, 0.006, -9));
      gridLinePoints.push(new THREE.Vector3(coord, 0.006, 9));
    }
    const gridLineGeo = new THREE.BufferGeometry().setFromPoints(gridLinePoints);
    const gridLineMat = new THREE.LineBasicMaterial({
      color: '#cbd5e1',
      transparent: true,
      opacity: 0.65,
    });
    const gridLines = new THREE.LineSegments(gridLineGeo, gridLineMat);
    floorGroup.add(gridLines);

    // 8. Room Walls (Corner at -9, -9)
    const wallsGroup = new THREE.Group();
    scene.add(wallsGroup);

    const wallHeight = 7.0;
    const wallThick = 0.4;

    const leftWallGeo = new THREE.BoxGeometry(wallThick, wallHeight, 18.0);
    const whiteWallMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.85 });
    const leftWall = new THREE.Mesh(leftWallGeo, whiteWallMat);
    leftWall.position.set(-9 - wallThick / 2, wallHeight / 2, 0);
    leftWall.receiveShadow = true;
    leftWall.castShadow = true;
    wallsGroup.add(leftWall);

    const backWallGeo = new THREE.BoxGeometry(18.0 + wallThick, wallHeight, wallThick);
    const isFemale = stats.gender === 'female';
    const backWallColor =
      currentLocation === 'home_hostel'
        ? (isFemale ? '#cbd5e1' : '#94a3b8')
        : '#94a3b8';
    const backWallMat = new THREE.MeshStandardMaterial({ color: backWallColor, roughness: 0.85 });
    const backWall = new THREE.Mesh(backWallGeo, backWallMat);
    backWall.position.set(-wallThick / 2, wallHeight / 2, -9 - wallThick / 2);
    backWall.receiveShadow = true;
    backWall.castShadow = true;
    wallsGroup.add(backWall);

    const skirtingMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.4 });
    const skirtLeftGeo = new THREE.BoxGeometry(0.08, 0.28, 18.0);
    const skirtLeft = new THREE.Mesh(skirtLeftGeo, skirtingMat);
    skirtLeft.position.set(-8.95, 0.14, 0);
    wallsGroup.add(skirtLeft);

    const skirtBackGeo = new THREE.BoxGeometry(18.0, 0.28, 0.08);
    const skirtBack = new THREE.Mesh(skirtBackGeo, skirtingMat);
    skirtBack.position.set(0, 0.14, -8.95);
    wallsGroup.add(skirtBack);

    // Large Hostel Window on Left Wall
    const windowFrameGeo = new THREE.BoxGeometry(0.12, 3.2, 4.4);
    const windowFrameMat = new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.4 });
    const windowFrame = new THREE.Mesh(windowFrameGeo, windowFrameMat);
    windowFrame.position.set(-8.92, 3.8, -2.5);
    wallsGroup.add(windowFrame);

    const windowGlassGeo = new THREE.BoxGeometry(0.05, 3.0, 4.2);
    const windowGlassMat = new THREE.MeshStandardMaterial({
      color: '#bae6fd',
      emissive: new THREE.Color('#38bdf8'),
      emissiveIntensity: 0.45,
      transparent: true,
      opacity: 0.65,
    });
    const windowGlass = new THREE.Mesh(windowGlassGeo, windowGlassMat);
    windowGlass.position.set(-8.9, 3.8, -2.5);
    wallsGroup.add(windowGlass);

    const sillGeo = new THREE.BoxGeometry(0.25, 0.08, 4.6);
    const sill = new THREE.Mesh(sillGeo, skirtingMat);
    sill.position.set(-8.85, 2.18, -2.5);
    wallsGroup.add(sill);

    // Wall Clock
    const clockFaceGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.08, 24);
    const clockFaceMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.2 });
    const clockFace = new THREE.Mesh(clockFaceGeo, clockFaceMat);
    clockFace.rotation.x = Math.PI / 2;
    clockFace.position.set(3.5, 4.6, -8.92);
    wallsGroup.add(clockFace);

    const clockRimGeo = new THREE.TorusGeometry(0.66, 0.05, 8, 24);
    const clockRimMat = new THREE.MeshStandardMaterial({ color: '#1e293b' });
    const clockRim = new THREE.Mesh(clockRimGeo, clockRimMat);
    clockRim.position.set(3.5, 4.6, -8.91);
    wallsGroup.add(clockRim);

    const handGeo = new THREE.BoxGeometry(0.02, 0.42, 0.02);
    const handMat = new THREE.MeshBasicMaterial({ color: '#ef4444' });
    const hand = new THREE.Mesh(handGeo, handMat);
    hand.position.set(3.5, 4.8, -8.87);
    clockSecondHandRef.current = hand;
    wallsGroup.add(hand);

    // Timetable / Calendar on Wall
    const boardFrameGeo = new THREE.BoxGeometry(3.6, 2.2, 0.06);
    const boardFrameMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.3 });
    const boardFrame = new THREE.Mesh(boardFrameGeo, boardFrameMat);
    boardFrame.position.set(-2.5, 4.5, -8.92);
    wallsGroup.add(boardFrame);

    const boardInnerGeo = new THREE.BoxGeometry(3.4, 2.0, 0.02);
    const boardInnerMat = new THREE.MeshStandardMaterial({
      color: '#0f172a',
      emissive: new THREE.Color('#166534'),
      emissiveIntensity: 0.2,
    });
    const boardInner = new THREE.Mesh(boardInnerGeo, boardInnerMat);
    boardInner.position.set(-2.5, 4.5, -8.88);
    wallsGroup.add(boardInner);

    // 9. Interactive Hover Tile Highlight Plane
    const tileGeo = new THREE.PlaneGeometry(1, 1);
    tileGeo.rotateX(-Math.PI / 2);
    const tileMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const tileHighlight = new THREE.Mesh(tileGeo, tileMat);
    tileHighlight.position.set(0, 0.015, 0);
    tileHighlight.visible = false;
    tileHighlightRef.current = tileHighlight;
    scene.add(tileHighlight);

    // 10. Items Group for placed furniture (populated immediately on mount)
    const itemsGroup = new THREE.Group();
    itemsGroupRef.current = itemsGroup;
    scene.add(itemsGroup);
    syncItems(roomItems, currentLocation);

    // 11. Characters Group (Player & Campus NPCs populated immediately on mount)
    const charactersGroup = new THREE.Group();
    charactersGroupRef.current = charactersGroup;
    scene.add(charactersGroup);
    syncCharacters(currentLocation, playerCustomization);

    // 11b. Remote Multiplayer Characters Group
    const remotePlayersGroup = new THREE.Group();
    remotePlayersGroupRef.current = remotePlayersGroup;
    scene.add(remotePlayersGroup);

    // 12. Animation Loop & Screen Projection for Floating Badges
    let animationFrameId: number;
    const clock = new THREE.Clock();
    const tempVec = new THREE.Vector3();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      controls.update();

      // Handle player autonomous walking towards target
      if (playerTargetRef.current && playerModelRef.current) {
        const curX = playerPositionRef.current.x;
        const curZ = playerPositionRef.current.z;
        const targetX = playerTargetRef.current.x;
        const targetZ = playerTargetRef.current.z;
        const dx = targetX - curX;
        const dz = targetZ - curZ;
        const dist = Math.hypot(dx, dz);

        if (dist > 0.08) {
          playerModelRef.current.setWalking(true);
          const targetAngle = Math.atan2(dx, dz);
          playerModelRef.current.group.rotation.y = targetAngle;

          const speed = 4.8;
          const moveDist = Math.min(dist, speed * delta);
          const nx = curX + (dx / dist) * moveDist;
          const nz = curZ + (dz / dist) * moveDist;
          playerPositionRef.current = { x: nx, z: nz };
          playerModelRef.current.group.position.set(nx, 0, nz);
        } else {
          // Arrived at destination!
          playerPositionRef.current = { x: targetX, z: targetZ };
          playerModelRef.current.group.position.set(targetX, 0, targetZ);
          playerModelRef.current.setWalking(false);
          const onArrival = playerTargetRef.current.onArrival;
          playerTargetRef.current = null;
          if (onArrival) {
            onArrival();
          }
        }
      }

      // Update Character animations (Breathing, bobbing, floating crown)
      if (playerModelRef.current) {
        playerModelRef.current.update(delta, elapsed);
      }
      if (npcModelRef.current) {
        npcModelRef.current.update(delta, elapsed);
      }

      // Rotate clock hand
      if (clockSecondHandRef.current) {
        clockSecondHandRef.current.rotation.z = -elapsed * (Math.PI / 30);
      }

      // Project 3D positions to 2D screen pixels for floating badges
      const containerW = container.clientWidth;
      const containerH = container.clientHeight;
      const newBadges: ScreenBadge[] = [];

      // 1. Player Badge (positioned directly over player avatar)
      tempVec.set(playerPositionRef.current.x, 3.4, playerPositionRef.current.z);
      tempVec.project(camera);
      if (tempVec.z <= 1.0) {
        newBadges.push({
          id: 'player_badge',
          label: stats.username ? `${stats.username} (You)` : 'You (Student)',
          role: activeActionRef.current
            ? `${activeActionRef.current.action.label}...`
            : `Lvl ${stats.level} • ${stats.department}`,
          icon: stats.status === 'nepo' ? '👑' : '🎒',
          statusBadge: stats.status,
          screenX: (tempVec.x * 0.5 + 0.5) * containerW,
          screenY: (-tempVec.y * 0.5 + 0.5) * containerH,
          visible: true,
        });
      }

      // 2. Room NPC Badge (Roommate at [3, 0, -2] or location NPC)
      const currentNPC = currentNPCRef.current;
      if (currentNPC) {
        const isHostelRoom =
          currentLocation === 'home_hostel' ||
          currentNPC.id === 'npc_femi' ||
          currentNPC.id === 'npc_zainab';
        if (!isHostelRoom || !stats.roommateEvicted) {
          const badgeX = isHostelRoom ? 3.0 : currentNPC.position[0];
          const badgeZ = isHostelRoom ? -2.0 : currentNPC.position[2];
          tempVec.set(badgeX, 3.4, badgeZ);
          tempVec.project(camera);
          if (tempVec.z <= 1.0) {
            newBadges.push({
              id: currentNPC.id,
              label: currentNPC.name,
              role: currentNPC.role,
              icon: currentNPC.avatarIcon,
              screenX: (tempVec.x * 0.5 + 0.5) * containerW,
              screenY: (-tempVec.y * 0.5 + 0.5) * containerH,
              visible: true,
              isNPC: true,
              npc: currentNPC,
            });
          }
        }
      }

      // 3. Remote Multiplayer Peer Student Badges & Animation (Exempt in private hostel room)
      if (currentLocation !== 'home_hostel') {
        remotePlayerModelsRef.current.forEach(({ model, player }) => {
          model.update(delta, elapsed);
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
      }

      setScreenBadges(newBadges);

      // 4. Project active Sims floating bubble
      if (activeBubbleRef.current) {
        tempVec.set(activeBubbleRef.current.item.x, 2.3, activeBubbleRef.current.item.z);
        tempVec.project(camera);
        if (tempVec.z <= 1.0) {
          setBubbleScreenPos({
            x: (tempVec.x * 0.5 + 0.5) * containerW,
            y: (-tempVec.y * 0.5 + 0.5) * containerH,
          });
        }
      }

      // 5. Project overhead action progress and bed particles
      if (activeActionRef.current) {
        tempVec.set(playerPositionRef.current.x, 3.0, playerPositionRef.current.z);
        tempVec.project(camera);
        if (tempVec.z <= 1.0) {
          setOverheadScreenPos({
            x: (tempVec.x * 0.5 + 0.5) * containerW,
            y: (-tempVec.y * 0.5 + 0.5) * containerH,
          });
        }

        if (activeActionRef.current.action.type === 'bed') {
          tempVec.set(activeActionRef.current.item.x, 2.3, activeActionRef.current.item.z);
          tempVec.project(camera);
          if (tempVec.z <= 1.0) {
            setBedScreenPos({
              x: (tempVec.x * 0.5 + 0.5) * containerW,
              y: (-tempVec.y * 0.5 + 0.5) * containerH,
            });
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // 13. Handle Window Resize
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

  // Raycaster & Mouse Hover Snapping to 18x18 Grid (Strictly Personal Hostel Room Only)
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;

      const isHostel = currentLocation === 'home_hostel' || (currentLocation as string) === 'hostel';
      // Outside personal hostel room: completely disable raycast grid tile snapping and placement mode
      if (!isHostel) {
        if (tileHighlightRef.current) {
          tileHighlightRef.current.visible = false;
        }
        setHoveredTile(null);
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const targetPoint = new THREE.Vector3();

      if (raycaster.ray.intersectPlane(groundPlane, targetPoint)) {
        // Enforce room boundary coordinates strictly within [-8.5, 8.5]
        if (targetPoint.x >= -8.5 && targetPoint.x <= 8.5 && targetPoint.z >= -8.5 && targetPoint.z <= 8.5) {
          const gridX = Math.floor(targetPoint.x) + 0.5;
          const gridZ = Math.floor(targetPoint.z) + 0.5;

          setHoveredTile({ x: gridX, z: gridZ });

          if (tileHighlightRef.current) {
            tileHighlightRef.current.visible = true;
            tileHighlightRef.current.position.set(gridX, 0.015, gridZ);

            const occupied = roomItems.some(
              (i) => Math.abs(i.x - gridX) < 0.7 && Math.abs(i.z - gridZ) < 0.7
            );

            (tileHighlightRef.current.material as THREE.MeshBasicMaterial).color.set(
              occupied ? 0x2563eb : 0x10b981
            );
          }
          return;
        }
      }

      if (tileHighlightRef.current) {
        tileHighlightRef.current.visible = false;
      }
      setHoveredTile(null);
    },
    [roomItems, currentLocation]
  );

  // Capture pointer down position to differentiate clean taps from camera drags / pans
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    // Only capture if target is container or canvas
    if (e.target !== containerRef.current && (e.target as HTMLElement)?.tagName !== 'CANVAS') return;
    pointerDownPosRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  }, []);

  // Handle tap / pointer up: only trigger tile interaction on a clean, stationary tap on canvas
  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      if (!pointerDownPosRef.current) return;

      const dx = e.clientX - pointerDownPosRef.current.x;
      const dy = e.clientY - pointerDownPosRef.current.y;
      const elapsed = Date.now() - pointerDownPosRef.current.time;
      pointerDownPosRef.current = null;

      // If user dragged to rotate / pan camera (> 8px) or held (> 500ms), do not open placement
      if (Math.hypot(dx, dy) > 8 || elapsed > 500) return;

      // If clicked target is not the container or canvas element, ignore
      if (e.target !== containerRef.current && (e.target as HTMLElement)?.tagName !== 'CANVAS') return;

      // If an interaction action is currently in progress, movement and clicks are locked
      if (activeActionRef.current !== null) {
        return;
      }

      // If any modal, drawer, or phone is active, do not open placement
      if (
        activeInteractTile !== null ||
        selectedRemoteStudent !== null ||
        isWardrobeOpen ||
        isPhoneOpen ||
        activeDialogueNPC !== null ||
        activeTab !== null
      ) {
        return;
      }

      if (!containerRef.current || !cameraRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const targetPoint = new THREE.Vector3();

      if (raycaster.ray.intersectPlane(groundPlane, targetPoint)) {
        if (targetPoint.x >= -9 && targetPoint.x <= 9 && targetPoint.z >= -9 && targetPoint.z <= 9) {
          const gridX = Math.floor(targetPoint.x) + 0.5;
          const gridZ = Math.floor(targetPoint.z) + 0.5;

          // Check if clicking near room NPC (Roommate at [3, 0, -2] or location NPC)
          const currentNPC = currentNPCRef.current;
          if (currentNPC) {
            const isHostelRoom =
              currentLocation === 'home_hostel' ||
              currentNPC.id === 'npc_femi' ||
              currentNPC.id === 'npc_zainab';
            if (!isHostelRoom || !stats.roommateEvicted) {
              const targetNPCX = isHostelRoom ? 3.0 : currentNPC.position[0];
              const targetNPCZ = isHostelRoom ? -2.0 : currentNPC.position[2];
              if (
                Math.abs(targetNPCX - gridX) < 1.0 &&
                Math.abs(targetNPCZ - gridZ) < 1.0
              ) {
                setActiveDialogueNPC(currentNPC);
                return;
              }
            }
          }

          // Check if clicking near player avatar to open wardrobe
          if (
            Math.abs(playerPositionRef.current.x - gridX) < 0.8 &&
            Math.abs(playerPositionRef.current.z - gridZ) < 0.8
          ) {
            setIsWardrobeOpen(true);
            return;
          }

          const isHostel = currentLocation === 'home_hostel' || (currentLocation as string) === 'hostel';

          // Check if quick place mode is active
          if (selectedPlacingItem) {
            if (!isHostel) {
              setSelectedPlacingItem(null);
              addToast('Furniture can only be placed inside your personal hostel room!', 'warning');
              soundManager.playError();
              return;
            }

            // Strictly within hostel boundary coordinates (-8.5 to 8.5)
            if (gridX < -8.5 || gridX > 8.5 || gridZ < -8.5 || gridZ > 8.5) {
              addToast('Cannot place furniture outside room boundaries!', 'warning');
              soundManager.playError();
              return;
            }

            const occupied = roomItems.some(
              (i) => Math.abs(i.x - gridX) < 0.7 && Math.abs(i.z - gridZ) < 0.7
            );
            if (occupied) {
              soundManager.playError();
              return;
            }

            const success = spendBalance(selectedPlacingItem.price);
            if (success) {
              addItemToRoom({
                name: selectedPlacingItem.name,
                type: selectedPlacingItem.type,
                x: gridX,
                z: gridZ,
                rotation: 0,
                color: selectedPlacingItem.color,
              });
              setSelectedPlacingItem(null);
            }
            return;
          }

          // Open Tile Interaction / Placement Modal strictly when in personal hostel room
          if (!isHostel) {
            return;
          }

          // Strictly within room boundary coordinates (-8.5 to 8.5)
          if (gridX < -8.5 || gridX > 8.5 || gridZ < -8.5 || gridZ > 8.5) {
            return;
          }

          const clickedItem =
            roomItems.find(
              (i) => Math.abs(i.x - gridX) < 0.7 && Math.abs(i.z - gridZ) < 0.7
            ) || null;

          const hostelAction = clickedItem ? getHostelItemAction(clickedItem) : null;

          // If clicking an interactive hostel object (Bed, Bucket, Desk, Locker, Bin)
          if (clickedItem && hostelAction) {
            const dist = Math.hypot(
              clickedItem.x - playerPositionRef.current.x,
              clickedItem.z - playerPositionRef.current.z
            );

            // Within close proximity (< 2.2 units)
            if (dist < 2.2) {
              playerTargetRef.current = null;
              if (playerModelRef.current) {
                playerModelRef.current.setWalking(false);
              }

              if (hostelAction.type === 'wardrobe') {
                soundManager.playClick();
                setIsWardrobeOpen(true);
                return;
              }

              // Compute initial screen position for floating bubble
              const v = new THREE.Vector3(clickedItem.x, 2.3, clickedItem.z);
              v.project(cameraRef.current);
              setBubbleScreenPos({
                x: (v.x * 0.5 + 0.5) * rect.width,
                y: (-v.y * 0.5 + 0.5) * rect.height,
              });
              setActiveBubble({ item: clickedItem, action: hostelAction });
              return;
            }

            // Outside proximity: move player toward adjacent grid tile before triggering menu
            const vx = playerPositionRef.current.x - clickedItem.x;
            const vz = playerPositionRef.current.z - clickedItem.z;
            const len = Math.hypot(vx, vz) || 1;
            const standX = Math.max(-8.5, Math.min(8.5, Math.round((clickedItem.x + (vx / len) * 1.5) * 2) / 2));
            const standZ = Math.max(-8.5, Math.min(8.5, Math.round((clickedItem.z + (vz / len) * 1.5) * 2) / 2));

            setActiveBubble(null);
            playerTargetRef.current = {
              x: standX,
              z: standZ,
              onArrival: () => {
                if (hostelAction.type === 'wardrobe') {
                  soundManager.playClick();
                  setIsWardrobeOpen(true);
                } else {
                  if (cameraRef.current && containerRef.current) {
                    const r = containerRef.current.getBoundingClientRect();
                    const v = new THREE.Vector3(clickedItem.x, 2.3, clickedItem.z);
                    v.project(cameraRef.current);
                    setBubbleScreenPos({
                      x: (v.x * 0.5 + 0.5) * r.width,
                      y: (-v.y * 0.5 + 0.5) * r.height,
                    });
                  }
                  setActiveBubble({ item: clickedItem, action: hostelAction });
                }
              },
            };
            return;
          }

          // If clicking an empty floor tile in the hostel room: walk avatar to tile
          if (!clickedItem) {
            setActiveBubble(null);
            setActiveInteractTile(null);
            playerTargetRef.current = { x: gridX, z: gridZ };
            return;
          }

          // Other furniture items (plants, lamps, etc.): open standard tile modal
          setActiveBubble(null);
          setActiveInteractTile({ x: gridX, z: gridZ });
          setActiveInteractItem(clickedItem);
        }
      }
    },
    [
      activeInteractTile,
      selectedRemoteStudent,
      isWardrobeOpen,
      isPhoneOpen,
      activeDialogueNPC,
      activeTab,
      currentLocation,
      selectedPlacingItem,
      roomItems,
      spendBalance,
      addItemToRoom,
      setSelectedPlacingItem,
      setActiveDialogueNPC,
      setIsWardrobeOpen,
      addToast,
    ]
  );

  const currentLocData = CAMPUS_LOCATIONS.find((l) => l.id === currentLocation);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className="relative w-full h-full cursor-pointer select-none"
    >
      {/* Travel Transition Curtain */}
      {isTransitioning && (
        <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-600 mb-4 animate-bounce shadow-sm">
            <MapPin className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-wide mb-1">
            Travelling across Liids University Campus...
          </h2>
          <p className="text-sm text-emerald-600 font-mono font-medium">Heading to {currentLocData?.name}</p>
        </div>
      )}

      {/* Floating 3D Projected Screen Badges for Player, Remote Students & Campus NPCs */}
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
            if (badge.isRemotePlayer && badge.remotePlayer) {
              setSelectedRemoteStudent(badge.remotePlayer);
            } else if (badge.isNPC && badge.npc) {
              setActiveDialogueNPC(badge.npc);
            } else {
              setIsWardrobeOpen(true);
            }
          }}
          className={`absolute z-20 pointer-events-auto cursor-pointer group flex flex-col items-center select-none transition-transform duration-150 hover:scale-105 active:scale-95 ${
            badge.visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Badge Pill Container */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md shadow-xl border ${
              badge.statusBadge === 'nepo'
                ? 'border-amber-400 ring-2 ring-amber-400/30'
                : badge.statusBadge === 'lapo'
                ? 'border-emerald-400 ring-2 ring-emerald-400/30'
                : 'border-slate-200/90 group-hover:border-emerald-500'
            } transition-all`}
          >
            <span className="text-sm shrink-0">{badge.icon}</span>
            <div className="flex flex-col text-left">
              <span className="text-xs font-black text-slate-900 leading-none flex items-center gap-1">
                {badge.label}
                {badge.statusBadge === 'nepo' && (
                  <span className="text-[8px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-bold border border-amber-300">
                    NEPO
                  </span>
                )}
                {badge.statusBadge === 'lapo' && (
                  <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                    LAPO
                  </span>
                )}
              </span>
              {badge.role && (
                <span className="text-[10px] text-emerald-600 font-semibold leading-none mt-0.5 max-w-[140px] truncate">
                  {badge.role}
                </span>
              )}
            </div>
          </div>

          {/* Stem Triangle Pointer */}
          <div className="w-2 h-2 bg-white border-r border-b border-slate-200 transform rotate-45 -mt-1 shadow-xs" />
        </div>
      ))}

      {/* 1. Sims-Style Floating Action Bubble above Interactive Objects */}
      {activeBubble && (
        <div
          style={{
            left: `${bubbleScreenPos.x}px`,
            top: `${bubbleScreenPos.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute z-30 pointer-events-auto flex flex-col items-center animate-in zoom-in-95 duration-150 select-none"
        >
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-slate-200/90 flex flex-col gap-1 z-30">
            <button
              onClick={() => handleStartAction(activeBubble.action, activeBubble.item)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-blue-50 text-slate-800 text-xs font-semibold transition-colors shadow-xs active:scale-95 cursor-pointer"
            >
              <span className="text-base">{activeBubble.action.icon}</span>
              <span>{activeBubble.action.label}</span>
            </button>
            <button
              onClick={() => {
                setActiveInteractTile({ x: activeBubble.item.x, z: activeBubble.item.z });
                setActiveInteractItem(activeBubble.item);
                setActiveBubble(null);
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 text-[11px] font-medium transition-colors cursor-pointer"
            >
              <span>⚙️</span>
              <span>Move / Rotate</span>
            </button>
          </div>
          <div className="w-2.5 h-2.5 bg-white border-r border-b border-slate-200 transform rotate-45 -mt-1 shadow-xs" />
        </div>
      )}

      {/* 2. 3D Overhead Action Progress Bar Above Player */}
      {activeAction && (
        <div
          style={{
            left: `${overheadScreenPos.x}px`,
            top: `${overheadScreenPos.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
          className="absolute z-40 pointer-events-none flex flex-col items-center select-none"
        >
          <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl px-4 py-2.5 shadow-2xl border border-emerald-500/50 flex flex-col items-center min-w-[190px] animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 mb-1.5 w-full justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-base animate-bounce">{activeAction.action.icon}</span>
                <span className="text-xs font-bold text-white tracking-wide">
                  {activeAction.action.type === 'bath'
                    ? 'Taking a bath...'
                    : activeAction.action.type === 'bed'
                    ? 'Sleeping...'
                    : activeAction.action.type === 'study'
                    ? 'Self studying...'
                    : 'Sweeping room...'}
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-extrabold">
                {actionRemainingSec}s
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden p-0.5 border border-slate-700">
              <div
                className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 h-full rounded-full transition-all duration-75 ease-out shadow-sm"
                style={{ width: `${actionProgress}%` }}
              />
            </div>
          </div>
          <div className="w-2.5 h-2.5 bg-slate-900 border-r border-b border-emerald-500/50 transform rotate-45 -mt-1 shadow-xs" />
        </div>
      )}

      {/* 3. Floating 💤 Particles for Sleep & Rest */}
      {activeAction && activeAction.action.type === 'bed' && (
        <div
          style={{
            left: `${bedScreenPos.x}px`,
            top: `${bedScreenPos.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
          className="absolute z-40 pointer-events-none flex items-center justify-center select-none"
        >
          <span className="text-2xl animate-float-z1 text-blue-400 font-black drop-shadow-md">💤</span>
          <span className="text-lg animate-float-z2 text-indigo-400 font-black drop-shadow-md -ml-2 -mt-4">💤</span>
          <span className="text-xl animate-float-z3 text-sky-400 font-black drop-shadow-md -mr-2 -mt-8">💤</span>
        </div>
      )}

      {/* Remote Peer Student Profile Inspector Modal */}
      {selectedRemoteStudent && (
        <RemoteStudentModal
          player={selectedRemoteStudent}
          onClose={() => setSelectedRemoteStudent(null)}
        />
      )}

      {/* Placement Mode Active Indicator Banner (Strictly Personal Hostel Room Only) */}
      {selectedPlacingItem && (currentLocation === 'home_hostel' || (currentLocation as string) === 'hostel') && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-5 py-2.5 rounded-full bg-slate-950/90 backdrop-blur-md border border-emerald-500/50 shadow-2xl text-emerald-200 text-sm animate-pulse pointer-events-auto"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span>
            Placing <strong>{selectedPlacingItem.name}</strong> • Click any valid floor tile
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPlacingItem(null);
            }}
            className="ml-2 px-2.5 py-0.5 text-xs bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-red-200 rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Interactive Tile Modal ('Place Object' or 'Interact' Menu) */}
      {activeInteractTile && (
        <TileInteractModal
          tileCoord={activeInteractTile}
          selectedItem={activeInteractItem}
          onClose={handleClosePlacement}
          onRotateItem={(id) => {
            rotateItemInRoom(id);
          }}
          onRemoveItem={(id) => {
            removeItemFromRoom(id);
          }}
        />
      )}

      {/* Grid Coordinates Tooltip (Strictly Personal Hostel Room Only) */}
      {hoveredTile && !activeInteractTile && (currentLocation === 'home_hostel' || (currentLocation as string) === 'hostel') && (
        <div className="absolute bottom-20 right-6 z-10 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-slate-300 text-[11px] font-mono text-slate-700 shadow-md pointer-events-none">
          Tile: ({hoveredTile.x.toFixed(1)}, {hoveredTile.z.toFixed(1)})
        </div>
      )}
    </div>
  );
};
