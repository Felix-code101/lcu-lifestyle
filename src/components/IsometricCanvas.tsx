import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useGame } from '../context/GameContext';
import { createItemMesh } from './roomModelHelpers';
import { createCharacterModel, type CharacterModelInstance } from './CharacterModel';
import { CAMPUS_LOCATIONS, DEFAULT_LOCATION_ITEMS } from '../data/campusData';
import { CAMPUS_NPCS } from '../data/npcData';
import { TileInteractModal } from './TileInteractModal';
import type { RoomItem, CampusNPC, GameLocation, CharacterCustomization, RemotePlayer } from '../types/game';
import { RemoteStudentModal } from './RemoteStudentModal';
import { MapPin } from 'lucide-react';

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
    setIsWardrobeOpen,
  } = useGame();

  const [hoveredTile, setHoveredTile] = useState<{ x: number; z: number } | null>(null);
  const [activeInteractTile, setActiveInteractTile] = useState<{ x: number; z: number } | null>(null);
  const [activeInteractItem, setActiveInteractItem] = useState<RoomItem | null>(null);
  const [screenBadges, setScreenBadges] = useState<ScreenBadge[]>([]);
  const [selectedRemoteStudent, setSelectedRemoteStudent] = useState<RemotePlayer | null>(null);

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

  // Sync 3D item meshes with guaranteed fallback defaults
  const syncItems = useCallback((items: RoomItem[], loc: GameLocation) => {
    if (!itemsGroupRef.current) return;
    const group = itemsGroupRef.current;

    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
    }

    const fallbackList = DEFAULT_LOCATION_ITEMS[loc] || DEFAULT_LOCATION_ITEMS.home_hostel;
    const listToRender = items && items.length > 0 ? items : fallbackList;

    listToRender.forEach((item) => {
      const mesh = createItemMesh(item);
      group.add(mesh);
    });
  }, []);

  // Sync Characters (Player at [0, 0, 0], Roommate NPC at [3, 0, -2])
  const syncCharacters = useCallback((loc: GameLocation, custom: CharacterCustomization) => {
    if (!charactersGroupRef.current) return;
    const group = charactersGroupRef.current;

    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    // 1. Spawn Player's 3D Character on floor plane at [0, 0, 0]
    const playerInstance = createCharacterModel(custom);
    playerModelRef.current = playerInstance;
    playerInstance.group.position.set(0, 0, 0);
    playerInstance.group.rotation.y = Math.PI / 4;
    group.add(playerInstance.group);

    // 2. Spawn Room NPC (Roommate Femi at [3, 0, -2] or location NPC)
    const matchingNPC = CAMPUS_NPCS.find((n) => n.location === loc) || null;
    currentNPCRef.current = matchingNPC;

    if (matchingNPC) {
      const npcInstance = createCharacterModel(matchingNPC.customization);
      npcModelRef.current = npcInstance;
      const isHostelRoom = loc === 'home_hostel' || matchingNPC.id === 'npc_femi';
      const npcPos: [number, number, number] = isHostelRoom ? [3, 0, -2] : matchingNPC.position;
      npcInstance.group.position.set(npcPos[0], 0, npcPos[2]);
      npcInstance.group.rotation.y = matchingNPC.rotation;
      group.add(npcInstance.group);
    } else {
      npcModelRef.current = null;
    }
  }, []);

  // Reactive listeners for state updates
  useEffect(() => {
    syncItems(roomItems, currentLocation);
  }, [roomItems, currentLocation, syncItems]);

  useEffect(() => {
    syncCharacters(currentLocation, playerCustomization);
  }, [currentLocation, playerCustomization, syncCharacters]);

  // Sync Remote Multiplayer Characters in current location
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

  // Reset Camera smoothly to PerspectiveCamera [12, 14, 12] looking at [0, 1, 0]
  useEffect(() => {
    if (resetCameraTrigger > 0 && cameraRef.current && controlsRef.current) {
      const camera = cameraRef.current;
      const controls = controlsRef.current;
      camera.position.set(12, 14, 12);
      controls.target.set(0, 1, 0);
      camera.lookAt(0, 1, 0);
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

    // 2. First-person isometric PerspectiveCamera explicitly at [12, 14, 12] with fov: 45
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(12, 14, 12);
    camera.lookAt(0, 1, 0);

    // 3. Renderer with antialias and soft shadows
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    // 4. OrbitControls with shallow isometric limits looking at [0, 1, 0]
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.target.set(0, 1, 0);
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
    const pastelBlueWallMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.85 });
    const backWall = new THREE.Mesh(backWallGeo, pastelBlueWallMat);
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

      // 1. Player Badge (positioned directly over player at [0, 0, 0])
      tempVec.set(0, 3.4, 0);
      tempVec.project(camera);
      if (tempVec.z <= 1.0) {
        newBadges.push({
          id: 'player_badge',
          label: stats.username ? `${stats.username} (You)` : 'You (Student)',
          role: `Lvl ${stats.level} • ${stats.department}`,
          icon: stats.status === 'nepo' ? '👑' : '🎒',
          statusBadge: stats.status,
          screenX: (tempVec.x * 0.5 + 0.5) * containerW,
          screenY: (-tempVec.y * 0.5 + 0.5) * containerH,
          visible: true,
        });
      }

      // 2. Room NPC Badge (Roommate Femi at [3, 0, -2] or location NPC)
      const currentNPC = currentNPCRef.current;
      if (currentNPC) {
        const isHostelRoom = currentLocation === 'home_hostel' || currentNPC.id === 'npc_femi';
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

      // 3. Remote Multiplayer Peer Student Badges & Animation
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

      setScreenBadges(newBadges);

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

  // Raycaster & Mouse Hover Snapping to 18x18 Grid
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;

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
    [roomItems]
  );

  // Click Handler: Tile Interaction, Item Selection, or NPC Conversation
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;

      if (!hoveredTile) return;

      // Check if clicking near room NPC (Roommate Femi at [3, 0, -2] or location NPC)
      const currentNPC = currentNPCRef.current;
      if (currentNPC) {
        const isHostelRoom = currentLocation === 'home_hostel' || currentNPC.id === 'npc_femi';
        const targetNPCX = isHostelRoom ? 3.0 : currentNPC.position[0];
        const targetNPCZ = isHostelRoom ? -2.0 : currentNPC.position[2];
        if (
          Math.abs(targetNPCX - hoveredTile.x) < 1.0 &&
          Math.abs(targetNPCZ - hoveredTile.z) < 1.0
        ) {
          setActiveDialogueNPC(currentNPC);
          return;
        }
      }

      // Check if clicking near player avatar at [0, 0, 0] to open wardrobe
      if (
        Math.abs(0 - hoveredTile.x) < 0.8 &&
        Math.abs(0 - hoveredTile.z) < 0.8
      ) {
        setIsWardrobeOpen(true);
        return;
      }

      // Check if quick place mode is active
      if (selectedPlacingItem) {
        const occupied = roomItems.some(
          (i) => Math.abs(i.x - hoveredTile.x) < 0.7 && Math.abs(i.z - hoveredTile.z) < 0.7
        );
        if (occupied) return;

        const success = spendBalance(selectedPlacingItem.price);
        if (success) {
          addItemToRoom({
            name: selectedPlacingItem.name,
            type: selectedPlacingItem.type,
            x: hoveredTile.x,
            z: hoveredTile.z,
            rotation: 0,
            color: selectedPlacingItem.color,
          });
          setSelectedPlacingItem(null);
        }
        return;
      }

      // Check if clicking on placed object or empty tile
      const clickedItem =
        roomItems.find(
          (i) => Math.abs(i.x - hoveredTile.x) < 0.7 && Math.abs(i.z - hoveredTile.z) < 0.7
        ) || null;

      setActiveInteractTile({ x: hoveredTile.x, z: hoveredTile.z });
      setActiveInteractItem(clickedItem);
    },
    [hoveredTile, selectedPlacingItem, roomItems, spendBalance, addItemToRoom, setSelectedPlacingItem, setActiveDialogueNPC]
  );

  const currentLocData = CAMPUS_LOCATIONS.find((l) => l.id === currentLocation);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
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

      {/* Remote Peer Student Profile Inspector Modal */}
      {selectedRemoteStudent && (
        <RemoteStudentModal
          player={selectedRemoteStudent}
          onClose={() => setSelectedRemoteStudent(null)}
        />
      )}

      {/* Placement Mode Active Indicator Banner */}
      {selectedPlacingItem && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-5 py-2.5 rounded-full bg-slate-950/90 backdrop-blur-md border border-emerald-500/50 shadow-2xl text-emerald-200 text-sm animate-pulse">
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
          onClose={() => {
            setActiveInteractTile(null);
            setActiveInteractItem(null);
          }}
          onRotateItem={(id) => {
            rotateItemInRoom(id);
          }}
          onRemoveItem={(id) => {
            removeItemFromRoom(id);
          }}
        />
      )}

      {/* Grid Coordinates Tooltip */}
      {hoveredTile && !activeInteractTile && (
        <div className="absolute bottom-20 right-6 z-10 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-slate-300 text-[11px] font-mono text-slate-700 shadow-md pointer-events-none">
          Tile: ({hoveredTile.x.toFixed(1)}, {hoveredTile.z.toFixed(1)})
        </div>
      )}
    </div>
  );
};
