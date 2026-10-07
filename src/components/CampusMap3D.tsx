import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import { useGame } from '../context/GameContext';
import { CAMPUS_3D_LANDMARKS } from '../data/landmarksData';
import type { Landmark3D, TransitMode, BillboardAd } from '../types/game';
import {
  createCampusTerrain,
  createScatterProps,
  createBuildingMesh,
} from './campusMap3DHelpers';
import { TransitModal } from './TransitModal';
import { AdTiles } from './AdTiles';
import { createKekeModel, type KekeModelInstance } from './KekeModel';
import { createCharacterModel, type CharacterModelInstance } from './CharacterModel';
import { findRoadPath, createTransitCurve } from '../data/campusTransitData';
import {
  Home,
  RotateCcw,
  Compass,
  Footprints,
  Megaphone,
} from 'lucide-react';

interface Badge2DPosition {
  landmark: Landmark3D;
  screenX: number;
  screenY: number;
  isBehind: boolean;
}

interface BillboardBadge2DPosition {
  billboard: BillboardAd;
  screenX: number;
  screenY: number;
  isBehind: boolean;
}

interface ActiveTransit {
  mode: TransitMode;
  landmark: Landmark3D;
  curve: THREE.CatmullRomCurve3;
  duration: number;
  elapsed: number;
  entityGroup: THREE.Group;
  charModel?: CharacterModelInstance;
  kekeModel?: KekeModelInstance;
  destMarker?: THREE.Group;
  notifiedAds?: Set<string>;
}

function createBillboardTexture(bb: BillboardAd): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    if (bb.isBooked) {
      ctx.fillStyle = bb.bannerColor || '#10b981';
      ctx.fillRect(0, 0, 512, 256);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, 502, 246);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(bb.businessName || 'Brand Sponsor', 256, 85);

      ctx.font = '22px sans-serif';
      ctx.fillStyle = '#f8fafc';
      const sloganText = bb.slogan || 'Welcome to Campus';
      ctx.fillText(sloganText.length > 36 ? sloganText.slice(0, 34) + '...' : sloganText, 256, 145);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.fillRect(80, 185, 352, 45);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('⭐ OFFICIAL LU CAMPUS PARTNER', 256, 214);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 512, 256);

      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, 502, 246);

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 34px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('📢 SPACE AVAILABLE', 256, 90);

      ctx.fillStyle = '#334155';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('Click to Advertise Your Brand', 256, 150);

      ctx.fillStyle = '#059669';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('₦25,000 / Week • High Traffic', 256, 208);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export const CampusMap3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    navigateToLocation,
    applyTransitEffects,
    lastVisitedLandmarkId,
    setLastVisitedLandmarkId,
    playerCustomization,
    billboards,
    setSelectedBillboard,
    setIsBillboardModalOpen,
    addToast,
  } = useGame();

  const [badgePositions, setBadgePositions] = useState<Badge2DPosition[]>([]);
  const [billboardPositions, setBillboardPositions] = useState<BillboardBadge2DPosition[]>([]);
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark3D | null>(null);
  const [transitHUD, setTransitHUD] = useState<{
    mode: TransitMode;
    landmark: Landmark3D;
    progress: number;
  } | null>(null);

  // Three.js References
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<MapControls | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const activeTransitRef = useRef<ActiveTransit | null>(null);
  const transitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completeTransitRef = useRef<((transit: ActiveTransit) => void) | null>(null);

  // Recenter camera onto central Senate Building
  const handleRecenter = useCallback(() => {
    if (controlsRef.current && cameraRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      cameraRef.current.position.set(38, 52, 38);
      cameraRef.current.updateProjectionMatrix();
      controlsRef.current.update();
      addToast('Campus view centered onto Senate Building', 'info');
    }
  }, [addToast]);

  // Guaranteed Transit Completion & Epsilon Handshake
  const completeTransit = useCallback(
    (transit: ActiveTransit) => {
      // Clear safety net timeout
      if (transitTimeoutRef.current) {
        clearTimeout(transitTimeoutRef.current);
        transitTimeoutRef.current = null;
      }

      if (!activeTransitRef.current) return;

      const arrivedLandmark = transit.landmark;
      const arrivedMode = transit.mode;
      const destinationKey = arrivedLandmark.destinationScene || 'home_hostel';

      // 1. Immediately force 100% progress on HUD
      setTransitHUD((prev) => (prev ? { ...prev, progress: 100 } : null));

      // 2. Clean up 3D meshes safely from scene
      try {
        if (sceneRef.current) {
          if (transit.entityGroup) sceneRef.current.remove(transit.entityGroup);
          if (transit.destMarker) sceneRef.current.remove(transit.destMarker);
        }
      } catch (err) {
        console.warn('Mesh cleanup warning:', err);
      }
      activeTransitRef.current = null;

      // 3. Apply stats effects and record visited landmark
      applyTransitEffects(arrivedMode, arrivedLandmark.name);
      setLastVisitedLandmarkId(arrivedLandmark.id);

      // 4. Force unblock UI (isTraveling = false) and navigate to destination scene
      setTimeout(() => {
        setTransitHUD(null);
        navigateToLocation(destinationKey);
      }, 200);
    },
    [applyTransitEffects, navigateToLocation, setLastVisitedLandmarkId]
  );

  useEffect(() => {
    completeTransitRef.current = completeTransit;
  }, [completeTransit]);

  // Start Trekking or Keke transit
  const handleStartTransit = useCallback(
    (mode: TransitMode) => {
      if (!selectedLandmark || activeTransitRef.current || !sceneRef.current) return;

      const originId = lastVisitedLandmarkId || 'hostels_male';
      const destId = selectedLandmark.id;
      const landmarkToTravel = selectedLandmark;

      // Close modal
      setSelectedLandmark(null);

      // Find path along campus asphalt roads
      const waypoints = findRoadPath(originId, destId);
      const curve = createTransitCurve(waypoints);

      // Spawn entity at origin waypoint
      const startPos = curve.getPointAt(0);

      let entityGroup: THREE.Group;
      let charModel: CharacterModelInstance | undefined;
      let kekeModel: KekeModelInstance | undefined;

      if (mode === 'trek') {
        charModel = createCharacterModel(playerCustomization);
        charModel.setWalking(true);
        charModel.group.scale.set(1.4, 1.4, 1.4);
        charModel.group.position.copy(startPos);
        entityGroup = charModel.group;
        sceneRef.current.add(entityGroup);
      } else {
        kekeModel = createKekeModel();
        kekeModel.group.scale.set(1.25, 1.25, 1.25);
        kekeModel.group.position.copy(startPos);
        entityGroup = kekeModel.group;
        sceneRef.current.add(entityGroup);
      }

      // Add a luminous pulsing arrival dropoff ring at destination
      const destPos = waypoints[waypoints.length - 1];
      const destMarker = new THREE.Group();
      destMarker.position.set(destPos.x, 0.10, destPos.z);
      const ringGeo = new THREE.RingGeometry(0.8, 1.4, 24);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMesh = new THREE.Mesh(
        ringGeo,
        new THREE.MeshBasicMaterial({
          color: mode === 'trek' ? '#10b981' : '#f59e0b',
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
          polygonOffset: true,
          polygonOffsetFactor: -2.0,
          polygonOffsetUnits: -6.0,
          depthWrite: false,
        })
      );
      destMarker.add(ringMesh);
      sceneRef.current.add(destMarker);

      // Snappy Arcade Timing: Keke is ~2.5s, Trekking is ~3.1s (~24% slower)
      const duration = mode === 'trek' ? 3.1 : 2.5;

      activeTransitRef.current = {
        mode,
        landmark: landmarkToTravel,
        curve,
        duration,
        elapsed: 0,
        entityGroup,
        charModel,
        kekeModel,
        destMarker,
      };

      setTransitHUD({
        mode,
        landmark: landmarkToTravel,
        progress: 0,
      });

      // Guaranteed Fallback Timeout Safety Net (4.5s max duration)
      if (transitTimeoutRef.current) {
        clearTimeout(transitTimeoutRef.current);
      }
      transitTimeoutRef.current = setTimeout(() => {
        if (activeTransitRef.current) {
          console.warn('Transit fallback timeout safety net triggered (4.5s limit reached)');
          completeTransitRef.current?.(activeTransitRef.current);
        }
      }, 4500);

      addToast(
        mode === 'trek'
          ? `🚶 Started trekking to ${landmarkToTravel.name}...`
          : `🛺 Boarded Keke shuttle to ${landmarkToTravel.name}!`,
        'info'
      );
    },
    [selectedLandmark, lastVisitedLandmarkId, playerCustomization, addToast]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene with clean bright white background
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#ffffff');

    // 2. Perspective Camera with near: 0.5, far: 500, fov: 35 for optimal depth precision
    const aspect = width / height;
    const camera = new THREE.PerspectiveCamera(35, aspect, 0.5, 500);
    cameraRef.current = camera;
    camera.position.set(38, 52, 38);
    camera.lookAt(0, 0, 0);

    // 3. Renderer with antialias and logarithmicDepthBuffer to eliminate z-fighting
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      logarithmicDepthBuffer: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    // 4. MapControls for smooth click-and-drag panning and scroll zoom
    const controls = new MapControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.screenSpacePanning = false; // pan along ground XZ
    controls.minDistance = 20;
    controls.maxDistance = 150;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;

    // 5. Lighting: Soft ambient light + clean directional sun
    const hemiLight = new THREE.HemisphereLight('#ffffff', '#f1f5f9', 1.25);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight('#fffdf7', 1.5);
    dirLight.position.set(40, 65, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 160;
    const d = 48;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0001;
    dirLight.shadow.normalBias = 0.03;
    scene.add(dirLight);

    // Soft sky fill light for architectural clarity
    const fillLight = new THREE.DirectionalLight('#e0f2fe', 0.45);
    fillLight.position.set(-35, 45, -35);
    scene.add(fillLight);

    // 6. Build Detailed Campus Environment
    const terrain = createCampusTerrain();
    scene.add(terrain);

    const scatterProps = createScatterProps();
    scene.add(scatterProps);

    // Add all detailed Landmark Buildings
    CAMPUS_3D_LANDMARKS.forEach((lm) => {
      const buildingMesh = createBuildingMesh(lm);
      scene.add(buildingMesh);
    });

    // Add Dedicated Low-Poly Roadside Billboard Stands facing campus roads
    billboards.forEach((bb) => {
      const bbGroup = new THREE.Group();
      bbGroup.position.set(bb.position[0], 0, bb.position[2]);
      bbGroup.rotation.y = bb.rotation;

      // Two steel support posts
      [-1.5, 1.5].forEach((px) => {
        const post = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 3.4, 0.12),
          new THREE.MeshStandardMaterial({ color: '#64748b', metalness: 0.7, roughness: 0.3 })
        );
        post.position.set(px, 1.7, 0);
        post.castShadow = true;
        bbGroup.add(post);
      });

      // Frame backboard
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(4.4, 2.4, 0.16),
        new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.4 })
      );
      frame.position.set(0, 2.7, 0);
      frame.castShadow = true;
      bbGroup.add(frame);

      // Sign Display Face with Dynamic Canvas Texture
      const tex = createBillboardTexture(bb);
      const faceMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.3 });
      const face = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.2), faceMat);
      face.position.set(0, 2.7, 0.09);
      bbGroup.add(face);

      scene.add(bbGroup);
    });

    // 7. Animation Loop & Screen Projection of 3D Badges
    let animationFrameId: number;
    const tempVec = new THREE.Vector3();
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Handle Live 3D Transit along Campus Roads
      if (activeTransitRef.current) {
        try {
          const transit = activeTransitRef.current;
          transit.elapsed += delta;
          const rawProgress = Math.min(1.0, transit.elapsed / transit.duration);

          // Smooth linear progression with gentle ease-out braking near destination
          const progress = Math.min(
            1.0,
            rawProgress < 0.85
              ? rawProgress
              : 0.85 + (rawProgress - 0.85) * (1 - (rawProgress - 0.85) * 0.5)
          );

          // Update progress UI HUD (clamped 0 to 100)
          const displayProgress = Math.min(100, Math.round(rawProgress * 100));
          setTransitHUD((prev) => (prev ? { ...prev, progress: displayProgress } : null));

          // Pulse destination dropoff marker
          if (transit.destMarker) {
            const pulse = 1.0 + Math.sin(elapsed * 10) * 0.25;
            transit.destMarker.scale.set(pulse, 1, pulse);
          }

          // Interpolate along curve safely clamped to [0, 1]
          const clampedT = Math.max(0, Math.min(1.0, progress));
          const pos = transit.curve.getPointAt(clampedT);
          transit.entityGroup.position.copy(pos);

          // Point entity facing direction of travel towards upcoming waypoint along road path
          if (clampedT < 0.96) {
            const lookAheadT = Math.min(1.0, clampedT + 0.04);
            const lookTarget = transit.curve.getPointAt(lookAheadT);
            const dx = lookTarget.x - pos.x;
            const dz = lookTarget.z - pos.z;
            if (dx * dx + dz * dz > 0.0001) {
              transit.entityGroup.lookAt(lookTarget.x, pos.y, lookTarget.z);
            }
          }

          // Advance character or keke animations
          if (transit.charModel) {
            transit.charModel.update(delta, elapsed);
          }
          if (transit.kekeModel) {
            transit.kekeModel.update(delta, elapsed, true);
          }

          // Proximity detection to active billboards along roads
          billboards.forEach((bb) => {
            if (bb.isBooked && bb.businessName) {
              const bbDist = pos.distanceTo(new THREE.Vector3(bb.position[0], 0, bb.position[2]));
              if (bbDist < 10) {
                if (!transit.notifiedAds) transit.notifiedAds = new Set();
                if (!transit.notifiedAds.has(bb.id)) {
                  transit.notifiedAds.add(bb.id);
                  addToast(`📢 Road Signboard: Check out "${bb.businessName}" — ${bb.slogan}!`, 'info');
                }
              }
            }
          });

          // Camera Follow: Keep camera tracking smoothly above/behind moving entity
          controls.target.lerp(pos, 0.12);
          const isoOffset = new THREE.Vector3(38, 52, 38);
          camera.position.copy(controls.target).add(isoOffset);

          // Transit Completion & Epsilon Check:
          // Do not rely on strict equality (progress === 1 or exact coordinate match).
          // If progress >= 0.98 OR remainingDistance < 0.2, immediately force completion
          const destPos = transit.curve.getPointAt(1.0);
          const remainingDistance = pos.distanceTo(destPos);

          if (rawProgress >= 0.98 || remainingDistance < 0.2 || transit.elapsed >= transit.duration) {
            completeTransitRef.current?.(transit);
          }
        } catch (transitErr) {
          console.error('Error during 3D transit animation:', transitErr);
          if (activeTransitRef.current) {
            completeTransitRef.current?.(activeTransitRef.current);
          }
        }
      }

      // Clamping map boundaries
      if (controls.target.x < -38) controls.target.x = -38;
      if (controls.target.x > 38) controls.target.x = 38;
      if (controls.target.z < -38) controls.target.z = -38;
      if (controls.target.z > 38) controls.target.z = 38;

      controls.update();

      // Project 3D building coordinates to 2D screen pixels
      const containerW = container.clientWidth;
      const containerH = container.clientHeight;

      const newPositions: Badge2DPosition[] = CAMPUS_3D_LANDMARKS.map((lm) => {
        tempVec.set(lm.position[0], lm.position[1] + 0.12 + lm.badgeHeight, lm.position[2]);
        tempVec.project(camera);

        const isBehind = tempVec.z > 1.0;
        const screenX = (tempVec.x * 0.5 + 0.5) * containerW;
        const screenY = (-tempVec.y * 0.5 + 0.5) * containerH;

        return {
          landmark: lm,
          screenX,
          screenY,
          isBehind,
        };
      });

      setBadgePositions(newPositions);

      // Project 3D billboard stands to 2D screen pixels
      const newBbPositions: BillboardBadge2DPosition[] = billboards.map((bb) => {
        tempVec.set(bb.position[0], bb.position[1] + 4.2, bb.position[2]);
        tempVec.project(camera);

        const isBehind = tempVec.z > 1.0;
        const screenX = (tempVec.x * 0.5 + 0.5) * containerW;
        const screenY = (-tempVec.y * 0.5 + 0.5) * containerH;

        return {
          billboard: bb,
          screenX,
          screenY,
          isBehind,
        };
      });

      setBillboardPositions(newBbPositions);

      renderer.render(scene, camera);
    };

    animate();

    // 8. Handle Window Resize
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
      if (transitTimeoutRef.current) {
        clearTimeout(transitTimeoutRef.current);
        transitTimeoutRef.current = null;
      }
      cancelAnimationFrame(animationFrameId);

      // Clean up any remaining transit entity
      if (activeTransitRef.current && sceneRef.current) {
        try {
          sceneRef.current.remove(activeTransitRef.current.entityGroup);
          if (activeTransitRef.current.destMarker) {
            sceneRef.current.remove(activeTransitRef.current.destMarker);
          }
        } catch {
          // ignore
        }
        activeTransitRef.current = null;
      }
      setTransitHUD(null);

      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const isTraveling = transitHUD !== null;

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-white">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing bg-white" />

      {/* Floating 2D HTML Pill Badges Projected over 3D Landmarks */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {badgePositions.map(({ landmark, screenX, screenY, isBehind }) => {
          if (isBehind) return null;
          // Skip if offscreen
          if (
            screenX < -80 ||
            screenX > window.innerWidth + 80 ||
            screenY < -50 ||
            screenY > window.innerHeight + 50
          ) {
            return null;
          }

          const isSelected = selectedLandmark?.id === landmark.id;

          return (
            <div
              key={landmark.id}
              style={{
                left: `${screenX}px`,
                top: `${screenY}px`,
                transform: 'translate(-50%, -100%)',
              }}
              className="absolute pointer-events-auto transition-transform duration-75"
            >
              {/* Pill Badge Container */}
              <button
                disabled={isTraveling}
                onClick={() => setSelectedLandmark(landmark)}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 ${
                  isTraveling
                    ? 'opacity-60 cursor-not-allowed bg-white/80 text-slate-500 shadow-none'
                    : isSelected
                    ? 'bg-emerald-600 text-white shadow-2xl scale-110 ring-2 ring-emerald-400 cursor-pointer'
                    : 'bg-white/95 hover:bg-white text-slate-800 hover:text-slate-950 shadow-lg border border-slate-200/90 hover:scale-105 hover:shadow-xl cursor-pointer'
                }`}
              >
                {/* Icon Circle */}
                <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs shrink-0 shadow-2xs">
                  {landmark.icon}
                </span>

                {/* Real Landmark Name */}
                <span className="text-[11px] sm:text-xs font-bold tracking-tight whitespace-nowrap">
                  {landmark.name}
                </span>
              </button>

              {/* Downward pointer anchor stem pointing to building top */}
              <div
                className={`w-0 h-0 mx-auto border-x-4 border-x-transparent border-t-6 transition-colors ${
                  isSelected ? 'border-t-emerald-600' : 'border-t-white/95'
                }`}
              />
            </div>
          );
        })}

        {/* Floating 2D HTML Pill Badges for Roadside Billboards */}
        {billboardPositions.map(({ billboard, screenX, screenY, isBehind }) => {
          if (isBehind) return null;
          if (
            screenX < -80 ||
            screenX > window.innerWidth + 80 ||
            screenY < -50 ||
            screenY > window.innerHeight + 50
          ) {
            return null;
          }

          return (
            <div
              key={billboard.id}
              style={{
                left: `${screenX}px`,
                top: `${screenY}px`,
                transform: 'translate(-50%, -100%)',
              }}
              className="absolute pointer-events-auto transition-transform duration-75"
            >
              <button
                disabled={isTraveling}
                onClick={() => {
                  setSelectedBillboard(billboard);
                  setIsBillboardModalOpen(true);
                }}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                  billboard.isBooked
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg scale-105'
                    : 'bg-white/95 hover:bg-white text-slate-800 shadow-md border border-slate-200 hover:scale-105'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs shrink-0">
                  <Megaphone className="w-3 h-3" />
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold tracking-tight whitespace-nowrap">
                  {billboard.isBooked ? billboard.businessName : '📢 Space Available (₦25k)'}
                </span>
              </button>
              <div
                className={`w-0 h-0 mx-auto border-x-4 border-x-transparent border-t-5 ${
                  billboard.isBooked ? 'border-t-emerald-600' : 'border-t-white/95'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Top Controls Overlay */}
      <div className="absolute top-20 left-4 right-4 z-30 pointer-events-none flex items-center justify-between gap-3">
        {/* Left: Campus Badge & Return to Hostel (Home) */}
        <div className="pointer-events-auto flex items-center gap-2.5">
          <button
            onClick={() => navigateToLocation('home_hostel')}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-500/50 hover:border-emerald-600 text-emerald-700 hover:text-emerald-900 shadow-xl transition-all active:scale-95 text-xs font-bold cursor-pointer"
          >
            <Home className="w-4 h-4 text-emerald-600" />
            <span>Return to Hostel (Home)</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-md text-xs font-semibold text-slate-700">
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>Liids University (LU) • Campus 3D</span>
          </div>
        </div>

        {/* Right: Map Recenter & Guide Hint */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedBillboard(billboards[0]);
              setIsBillboardModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Megaphone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ad Stand</span>
          </button>

          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm text-[11px] text-slate-600 font-mono">
            <span>🖱️ Drag to pan • Scroll to zoom</span>
          </div>

          <button
            onClick={handleRecenter}
            title="Recenter Camera onto Senate Building"
            className="p-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Active Transit Tracking HUD Overlay */}
      {transitHUD && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 px-5 py-2.5 rounded-2xl bg-white/98 backdrop-blur-2xl border border-slate-200 shadow-2xl flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl shrink-0 border border-emerald-200 shadow-xs">
            {transitHUD.mode === 'trek' ? (
              <Footprints className="w-5 h-5 text-emerald-600 animate-pulse" />
            ) : (
              '🛺'
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-900">
                {transitHUD.mode === 'trek' ? 'Trekking to' : 'Commuting via Keke to'}{' '}
                {transitHUD.landmark.name}
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300">
                {transitHUD.progress}%
              </span>
            </div>
            <div className="w-44 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1 border border-slate-200">
              <div
                className={`h-full transition-all duration-100 ${
                  transitHUD.mode === 'trek'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500'
                }`}
                style={{ width: `${transitHUD.progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* White-Themed Travel Selection Modal (Trek Am vs Enter Keke) */}
      {selectedLandmark && !isTraveling && (
        <TransitModal
          landmark={selectedLandmark}
          onClose={() => setSelectedLandmark(null)}
          onSelectTransit={handleStartTransit}
        />
      )}

      {/* Billboard Advertising Modal */}
      <AdTiles />
    </div>
  );
};
