import * as THREE from 'three';
import type { Landmark3D } from '../types/game';

// Helper for standard materials
const mat = (color: string | number, roughness = 0.55, metalness = 0.1) =>
  new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness,
    metalness,
  });

/**
 * Creates the bright, clean campus terrain with lawns, asphalt roads, pedestrian curbs,
 * roundabout, canal, and bridges designed for a crisp white background.
 */
export function createCampusTerrain(): THREE.Group {
  const terrain = new THREE.Group();

  // 1. Vibrant Green University Lawn
  const lawnGeo = new THREE.PlaneGeometry(112, 112);
  lawnGeo.rotateX(-Math.PI / 2);
  const lawnMat = mat('#16a34a', 0.85, 0.05); // Clean emerald grass
  const lawn = new THREE.Mesh(lawnGeo, lawnMat);
  lawn.receiveShadow = true;
  terrain.add(lawn);

  // Clean Light Gray Base Plinth underneath map (complements white background)
  const plinthGeo = new THREE.BoxGeometry(112.4, 2.0, 112.4);
  const plinthMat = mat('#e2e8f0', 0.9, 0.05);
  const plinth = new THREE.Mesh(plinthGeo, plinthMat);
  plinth.position.y = -1.0;
  plinth.receiveShadow = true;
  terrain.add(plinth);

  // 2. Asphalt Roads & Walkways (Z = 0.02)
  const roadMat = mat('#334155', 0.8, 0.15); // Smooth dark slate asphalt

  // North-South Main Boulevard
  const nsRoadGeo = new THREE.PlaneGeometry(5.4, 100);
  nsRoadGeo.rotateX(-Math.PI / 2);
  const nsRoad = new THREE.Mesh(nsRoadGeo, roadMat);
  nsRoad.position.set(0, 0.02, 0);
  nsRoad.receiveShadow = true;
  terrain.add(nsRoad);

  // East-West Cross Boulevard
  const ewRoadGeo = new THREE.PlaneGeometry(100, 5.4);
  ewRoadGeo.rotateX(-Math.PI / 2);
  const ewRoad = new THREE.Mesh(ewRoadGeo, roadMat);
  ewRoad.position.set(0, 0.02, 0);
  ewRoad.receiveShadow = true;
  terrain.add(ewRoad);

  // Center Roundabout around Senate Building
  const roundGeo = new THREE.RingGeometry(5.2, 11.2, 36);
  roundGeo.rotateX(-Math.PI / 2);
  const roundRoad = new THREE.Mesh(roundGeo, roadMat);
  roundRoad.position.set(0, 0.022, 0);
  roundRoad.receiveShadow = true;
  terrain.add(roundRoad);

  // Roundabout Center Island (Plaza lawn)
  const islandGeo = new THREE.CircleGeometry(5.1, 36);
  islandGeo.rotateX(-Math.PI / 2);
  const islandMat = mat('#22c55e', 0.8);
  const island = new THREE.Mesh(islandGeo, islandMat);
  island.position.set(0, 0.03, 0);
  terrain.add(island);

  // Branch Roads:
  // North-West road to Law Faculty
  const nwRoadGeo = new THREE.PlaneGeometry(30, 4.2);
  nwRoadGeo.rotateX(-Math.PI / 2);
  const nwRoad = new THREE.Mesh(nwRoadGeo, roadMat);
  nwRoad.position.set(-20, 0.02, -20);
  terrain.add(nwRoad);

  // North-East road to ICT Center
  const neRoadGeo = new THREE.PlaneGeometry(30, 4.2);
  neRoadGeo.rotateX(-Math.PI / 2);
  const neRoad = new THREE.Mesh(neRoadGeo, roadMat);
  neRoad.position.set(20, 0.02, -20);
  terrain.add(neRoad);

  // South-West road to Hostels & SUB
  const swRoadGeo = new THREE.PlaneGeometry(34, 4.2);
  swRoadGeo.rotateX(-Math.PI / 2);
  const swRoad = new THREE.Mesh(swRoadGeo, roadMat);
  swRoad.position.set(-20, 0.02, 22);
  terrain.add(swRoad);

  // South-East road to Stadium
  const seRoadGeo = new THREE.PlaneGeometry(30, 4.2);
  seRoadGeo.rotateX(-Math.PI / 2);
  const seRoad = new THREE.Mesh(seRoadGeo, roadMat);
  seRoad.position.set(20, 0.02, 22);
  terrain.add(seRoad);

  // 3. Blue Water Canal
  const waterGeo = new THREE.PlaneGeometry(105, 4.8);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshStandardMaterial({
    color: '#0284c7',
    emissive: new THREE.Color('#0369a1'),
    emissiveIntensity: 0.35,
    roughness: 0.1,
    metalness: 0.2,
    transparent: true,
    opacity: 0.9,
  });
  const canal = new THREE.Mesh(waterGeo, waterMat);
  canal.position.set(0, 0.015, -10);
  canal.rotation.y = 0.07;
  terrain.add(canal);

  // Canal Stone Banks
  const bankMat = mat('#94a3b8', 0.7);
  const bankNorth = new THREE.Mesh(new THREE.BoxGeometry(105, 0.18, 0.45), bankMat);
  bankNorth.position.set(0, 0.08, -12.5);
  bankNorth.rotation.y = 0.07;
  terrain.add(bankNorth);

  const bankSouth = new THREE.Mesh(new THREE.BoxGeometry(105, 0.18, 0.45), bankMat);
  bankSouth.position.set(0, 0.08, -7.5);
  bankSouth.rotation.y = 0.07;
  terrain.add(bankSouth);

  // Central North-South Bridge over Canal
  const bridgeGeo = new THREE.BoxGeometry(5.8, 0.28, 5.4);
  const bridgeMat = mat('#cbd5e1', 0.6);
  const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
  bridge.position.set(0, 0.14, -10);
  bridge.castShadow = true;
  terrain.add(bridge);

  // White Bridge Railings
  const railGeo = new THREE.BoxGeometry(0.2, 0.65, 5.4);
  const railMat = mat('#ffffff', 0.3);
  const railLeft = new THREE.Mesh(railGeo, railMat);
  railLeft.position.set(-2.8, 0.45, -10);
  terrain.add(railLeft);

  const railRight = new THREE.Mesh(railGeo, railMat);
  railRight.position.set(2.8, 0.45, -10);
  terrain.add(railRight);

  return terrain;
}

/**
 * Creates low-poly decorative props: trees, street lamps, billboards, cars.
 */
export function createScatterProps(): THREE.Group {
  const props = new THREE.Group();

  // Trees
  const treeColors = ['#15803d', '#166534', '#22c55e', '#14532d', '#4ade80'];
  const treePositions: [number, number][] = [
    [-8, -5], [-12, -7], [-15, -12], [-6, -14], [-18, -4],
    [8, -5], [12, -7], [16, -12], [7, -14], [18, -4],
    [-7, 8], [-12, 12], [-8, 16], [-15, 14], [-6, 26],
    [7, 8], [11, 14], [9, 18], [14, 12], [8, 28],
    [-28, -2], [-32, 6], [-30, 16], [-28, -26], [28, -2],
    [32, 6], [30, 16], [32, -26], [-14, 34], [14, 34],
    [-4, 32], [4, 32], [-18, 38], [18, 38], [-35, -12],
    [35, -12], [-35, 24], [35, 24], [0, -18], [0, -22],
    [-18, -34], [18, -34], [-34, -22], [34, -22], [-12, 28],
  ];

  treePositions.forEach(([x, z], idx) => {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, 0, z);

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.18, 0.25, 1.4, 6);
    const trunk = new THREE.Mesh(trunkGeo, mat('#451a03', 0.9));
    trunk.position.y = 0.7;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Multi-tier foliage
    const folGeo1 = new THREE.ConeGeometry(1.2, 2.0, 7);
    const leafColor = treeColors[idx % treeColors.length];
    const foliage1 = new THREE.Mesh(folGeo1, mat(leafColor, 0.7));
    foliage1.position.y = 2.0;
    foliage1.castShadow = true;
    treeGroup.add(foliage1);

    const folGeo2 = new THREE.ConeGeometry(0.85, 1.4, 7);
    const foliage2 = new THREE.Mesh(folGeo2, mat(leafColor, 0.6));
    foliage2.position.y = 2.9;
    foliage2.castShadow = true;
    treeGroup.add(foliage2);

    props.add(treeGroup);
  });

  // Street Lamps along Main Boulevards
  const lampPositions: [number, number][] = [
    [-3.2, -30], [-3.2, -20], [-3.2, -3], [-3.2, 12], [-3.2, 24], [-3.2, 36],
    [3.2, -30], [3.2, -20], [3.2, -3], [3.2, 12], [3.2, 24], [3.2, 36],
    [-30, 3.2], [-18, 3.2], [18, 3.2], [30, 3.2],
    [-30, -3.2], [-18, -3.2], [18, -3.2], [30, -3.2],
  ];

  lampPositions.forEach(([lx, lz]) => {
    const lamp = new THREE.Group();
    lamp.position.set(lx, 0, lz);

    const poleGeo = new THREE.CylinderGeometry(0.04, 0.05, 3.0, 6);
    const pole = new THREE.Mesh(poleGeo, mat('#1e293b', 0.2, 0.8));
    pole.position.y = 1.5;
    lamp.add(pole);

    const headGeo = new THREE.SphereGeometry(0.18, 8, 8);
    const headMat = new THREE.MeshStandardMaterial({
      color: '#fef08a',
      emissive: new THREE.Color('#facc15'),
      emissiveIntensity: 0.8,
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 3.0;
    lamp.add(head);

    props.add(lamp);
  });

  // Green Campus Billboards
  const billboardData: { pos: [number, number, number]; rot: number }[] = [
    { pos: [-4, 0, 36], rot: 0.3 },
    { pos: [4, 0, 36], rot: -0.3 },
    { pos: [-14, 0, 16], rot: Math.PI / 2 },
    { pos: [14, 0, 16], rot: -Math.PI / 2 },
  ];

  billboardData.forEach((b) => {
    const bb = new THREE.Group();
    bb.position.set(b.pos[0], b.pos[1], b.pos[2]);
    bb.rotation.y = b.rot;

    [-1.0, 1.0].forEach((px) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.2, 6), mat('#334155', 0.3, 0.7));
      post.position.set(px, 1.6, 0);
      bb.add(post);
    });

    const board = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.5, 0.08), mat('#166534', 0.4));
    board.position.set(0, 2.5, 0);
    board.castShadow = true;
    bb.add(board);

    const poster = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.3, 0.09),
      new THREE.MeshStandardMaterial({
        color: '#f8fafc',
        emissive: new THREE.Color('#ecfdf5'),
        emissiveIntensity: 0.2,
      })
    );
    poster.position.set(0, 2.5, 0.01);
    bb.add(poster);

    props.add(bb);
  });

  // Low-Poly Cars & Yellow Danfo Minibuses
  const carData: { pos: [number, number, number]; rot: number; color: string; isDanfo?: boolean }[] = [
    { pos: [-1.4, 0, 28], rot: 0, color: '#facc15', isDanfo: true },
    { pos: [1.4, 0, 16], rot: Math.PI, color: '#3b82f6' },
    { pos: [-1.4, 0, -22], rot: 0, color: '#ef4444' },
    { pos: [1.4, 0, -34], rot: Math.PI, color: '#facc15', isDanfo: true },
    { pos: [24, 0, 1.4], rot: Math.PI / 2, color: '#ffffff' },
    { pos: [-24, 0, -1.4], rot: -Math.PI / 2, color: '#10b981' },
    { pos: [-8, 0, 1.8], rot: Math.PI / 2, color: '#0f172a' },
    { pos: [8, 0, 1.8], rot: -Math.PI / 2, color: '#facc15', isDanfo: true },
  ];

  carData.forEach((c) => {
    const car = new THREE.Group();
    car.position.set(c.pos[0], 0, c.pos[2]);
    car.rotation.y = c.rot;

    if (c.isDanfo) {
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 2.4), mat('#eab308', 0.4));
      body.position.y = 0.65;
      body.castShadow = true;
      car.add(body);

      const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.12, 2.3), mat('#18181b', 0.2));
      stripe.position.y = 0.6;
      car.add(stripe);

      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 0.35, 0.05),
        new THREE.MeshStandardMaterial({ color: '#38bdf8', roughness: 0.1 })
      );
      glass.position.set(0, 0.85, 1.18);
      car.add(glass);
    } else {
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 2.2), mat(c.color, 0.4));
      body.position.y = 0.35;
      body.castShadow = true;
      car.add(body);

      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.4, 1.2), mat('#0f172a', 0.2));
      cabin.position.set(0, 0.7, -0.1);
      cabin.castShadow = true;
      car.add(cabin);
    }

    const wheelGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.15, 8);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = mat('#1e293b', 0.9);
    [[-0.65, 0.2, 0.7], [0.65, 0.2, 0.7], [-0.65, 0.2, -0.7], [0.65, 0.2, -0.7]].forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(wx, wy, wz);
      car.add(wheel);
    });

    props.add(car);
  });

  return props;
}

/**
 * Builds the 3D high-detail architectural models for every specific Liids University (LU) landmark.
 */
export function createBuildingMesh(landmark: Landmark3D): THREE.Group {
  const group = new THREE.Group();
  group.name = landmark.id;
  group.position.set(landmark.position[0], landmark.position[1], landmark.position[2]);

  // Shared detailed window material
  const glassMat = new THREE.MeshStandardMaterial({
    color: '#38bdf8',
    emissive: new THREE.Color('#0284c7'),
    emissiveIntensity: 0.4,
    roughness: 0.15,
  });

  switch (landmark.id) {
    case 'senate_building': {
      // 🏛️ Senate Building (Admin Complex)
      // Stepped Foundation Plinth
      const plinth1 = new THREE.Mesh(new THREE.BoxGeometry(15, 0.4, 13), mat('#e2e8f0'));
      plinth1.position.y = 0.2;
      plinth1.receiveShadow = true;
      group.add(plinth1);

      const plinth2 = new THREE.Mesh(new THREE.BoxGeometry(14, 0.3, 12), mat('#cbd5e1'));
      plinth2.position.y = 0.55;
      group.add(plinth2);

      // Main Admin Wing (Floor 1-2)
      const mainBlock = new THREE.Mesh(new THREE.BoxGeometry(13, 3.2, 10.5), mat('#f8fafc', 0.4));
      mainBlock.position.y = 2.3;
      mainBlock.castShadow = true;
      group.add(mainBlock);

      // Grand Entrance Colonnade (8 Pillars)
      for (let px = -4.5; px <= 4.5; px += 1.5) {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 3.4, 10), mat('#ffffff', 0.2));
        pillar.position.set(px, 2.3, 5.5);
        pillar.castShadow = true;
        group.add(pillar);
      }

      // Colonnade Entablature & Balcony
      const entablature = new THREE.Mesh(new THREE.BoxGeometry(11, 0.5, 2.2), mat('#15803d', 0.3)); // LU Green
      entablature.position.set(0, 4.2, 5.2);
      entablature.castShadow = true;
      group.add(entablature);

      // Central Council Secretariat Tower (Floor 3-4)
      const tower = new THREE.Mesh(new THREE.BoxGeometry(8, 3.2, 8), mat('#ffffff', 0.3));
      tower.position.y = 5.5;
      tower.castShadow = true;
      group.add(tower);

      // Clock Tower Crown & Belfry
      const clockBox = new THREE.Mesh(new THREE.BoxGeometry(5.2, 2.2, 5.2), mat('#15803d', 0.3));
      clockBox.position.y = 8.2;
      clockBox.castShadow = true;
      group.add(clockBox);

      // Gold Clock Faces on 4 sides
      const clockDiscMat = new THREE.MeshStandardMaterial({
        color: '#facc15',
        emissive: new THREE.Color('#eab308'),
        emissiveIntensity: 0.6,
        metalness: 0.8,
      });
      [
        [0, 8.2, 2.65, 0],
        [0, 8.2, -2.65, Math.PI],
        [2.65, 8.2, 0, Math.PI / 2],
        [-2.65, 8.2, 0, -Math.PI / 2],
      ].forEach(([cx, cy, cz, ry]) => {
        const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.06, 16), clockDiscMat);
        disc.rotation.x = Math.PI / 2;
        disc.rotation.z = ry;
        disc.position.set(cx, cy, cz);
        group.add(disc);
      });

      // Gold Spire & University Crest Finial
      const spire = new THREE.Mesh(new THREE.ConeGeometry(0.9, 3.2, 8), mat('#ca8a04', 0.2, 0.9));
      spire.position.y = 10.9;
      spire.castShadow = true;
      group.add(spire);

      // Window Grids on Façade
      const winGeo = new THREE.BoxGeometry(11, 0.9, 0.06);
      const win1 = new THREE.Mesh(winGeo, glassMat);
      win1.position.set(0, 2.4, 5.28);
      group.add(win1);

      const win2 = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.9, 0.06), glassMat);
      win2.position.set(0, 5.6, 4.03);
      group.add(win2);
      break;
    }

    case 'main_gate': {
      // 🚪 LU Main Gate 1 Entrance
      // Grand Roadside Pillars
      [-4.0, 4.0].forEach((gx) => {
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 4.4, 1.6), mat('#1e293b', 0.4));
        pillar.position.set(gx, 2.2, 0);
        pillar.castShadow = true;
        group.add(pillar);
      });

      // Grand Entrance Archway Beam
      const archBeam = new THREE.Mesh(new THREE.BoxGeometry(10.2, 1.4, 1.8), mat('#15803d', 0.3)); // University Green
      archBeam.position.set(0, 4.9, 0);
      archBeam.castShadow = true;
      group.add(archBeam);

      // Gold "LIIDS UNIVERSITY (LU)" Signboard Panel
      const signPanel = new THREE.Mesh(
        new THREE.BoxGeometry(8.5, 0.8, 0.08),
        new THREE.MeshStandardMaterial({
          color: '#facc15',
          emissive: new THREE.Color('#ca8a04'),
          emissiveIntensity: 0.4,
          metalness: 0.8,
        })
      );
      signPanel.position.set(0, 4.9, 0.95);
      group.add(signPanel);

      // Central Security Guard Tollhouse
      const guard = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.4, 1.8), mat('#ffffff'));
      guard.position.set(0, 1.2, 0);
      guard.castShadow = true;
      group.add(guard);

      const guardRoof = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.25, 2.2), mat('#0f172a'));
      guardRoof.position.set(0, 2.5, 0);
      group.add(guardRoof);

      // Boom Barriers (Red & white stripes)
      [-2.1, 2.1].forEach((bx) => {
        const barrier = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 0.1), mat('#ef4444'));
        barrier.position.set(bx, 0.9, 0);
        group.add(barrier);
      });

      // Landscaped Planters
      [-5.5, 5.5].forEach((px) => {
        const planter = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.7, 0.6, 12), mat('#ca8a04', 0.6));
        planter.position.set(px, 0.3, 0);
        group.add(planter);

        const bush = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 8), mat('#22c55e', 0.7));
        bush.position.set(px, 0.9, 0);
        group.add(bush);
      });
      break;
    }

    case 'law_faculty': {
      // ⚖️ Faculty of Law Building
      // Stereobate Base
      const base = new THREE.Mesh(new THREE.BoxGeometry(13, 0.6, 9.5), mat('#e2e8f0'));
      base.position.y = 0.3;
      group.add(base);

      // Courthouse Main Hall
      const hall = new THREE.Mesh(new THREE.BoxGeometry(12, 3.8, 8.5), mat('#f8fafc', 0.3));
      hall.position.y = 2.5;
      hall.castShadow = true;
      group.add(hall);

      // 6 Classical Colonnade Columns
      for (let x = -4.2; x <= 4.2; x += 1.68) {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 3.8, 10), mat('#ffffff', 0.2));
        col.position.set(x, 2.5, 4.6);
        col.castShadow = true;
        group.add(col);
      }

      // Classical Triangular Pediment Roof
      const pedShape = new THREE.Shape();
      pedShape.moveTo(-6.2, 0);
      pedShape.lineTo(0, 2.2);
      pedShape.lineTo(6.2, 0);
      pedShape.closePath();
      const pedGeo = new THREE.ExtrudeGeometry(pedShape, { depth: 9.0, bevelEnabled: false });
      const ped = new THREE.Mesh(pedGeo, mat('#1e293b', 0.4));
      ped.position.set(0, 4.4, -4.5);
      ped.castShadow = true;
      group.add(ped);

      // Scales of Justice Emblem
      const emblem = new THREE.Mesh(
        new THREE.CircleGeometry(0.65, 16),
        new THREE.MeshStandardMaterial({
          color: '#eab308',
          emissive: new THREE.Color('#ca8a04'),
          emissiveIntensity: 0.5,
          metalness: 0.8,
        })
      );
      emblem.position.set(0, 5.2, 4.55);
      group.add(emblem);

      // Side Moot Court Wing
      const wing = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.8, 6.0), mat('#e2e8f0'));
      wing.position.set(7.5, 1.7, 0);
      wing.castShadow = true;
      group.add(wing);
      break;
    }

    case 'ict_center': {
      // 💻 Information Tech Center (ICT)
      // Stepped Modern Slate & Steel Block
      const main = new THREE.Mesh(new THREE.BoxGeometry(11, 5.0, 8.5), mat('#0f172a', 0.3));
      main.position.y = 2.5;
      main.castShadow = true;
      group.add(main);

      // Luminous Glass Curtain Ribbon Wall
      const curtain = new THREE.Mesh(new THREE.BoxGeometry(9.6, 4.2, 0.08), glassMat);
      curtain.position.set(0, 2.5, 4.28);
      group.add(curtain);

      // Rooftop Solar Panel Arrays
      [-2.5, 2.5].forEach((sx) => {
        const solar = new THREE.Mesh(
          new THREE.BoxGeometry(3.2, 0.1, 2.4),
          new THREE.MeshStandardMaterial({ color: '#1e3a8a', roughness: 0.2, metalness: 0.8 })
        );
        solar.position.set(sx, 5.3, 1.5);
        solar.rotation.x = -0.25;
        group.add(solar);
      });

      // Rooftop Satellite Uplink Dish
      const dishMount = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.4, 6), mat('#94a3b8'));
      dishMount.position.set(0, 5.7, -1.5);
      group.add(dishMount);

      const dish = new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 14, 8, 0, Math.PI * 2, 0, Math.PI / 3),
        mat('#f1f5f9', 0.2, 0.8)
      );
      dish.rotation.x = Math.PI * 0.7;
      dish.position.set(0, 6.4, -1.5);
      dish.castShadow = true;
      group.add(dish);

      // Server Room Cooling Units
      const acUnit = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.0, 1.4), mat('#475569'));
      acUnit.position.set(-3.5, 5.5, -2.0);
      group.add(acUnit);
      break;
    }

    case 'library': {
      // 📚 University Library
      const plinth = new THREE.Mesh(new THREE.BoxGeometry(13.5, 0.5, 10.5), mat('#64748b'));
      plinth.position.y = 0.25;
      group.add(plinth);

      // Main Library Block (Rich scholarly brick/wood tone)
      const body = new THREE.Mesh(new THREE.BoxGeometry(12, 4.8, 9), mat('#78350f', 0.6));
      body.position.y = 2.65;
      body.castShadow = true;
      group.add(body);

      // Double-Height Glass Facade
      const win = new THREE.Mesh(new THREE.BoxGeometry(8.5, 3.2, 0.08), glassMat);
      win.position.set(0, 2.8, 4.54);
      group.add(win);

      // Glass Skylight Lantern Roof
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(3.4, 1.8, 4),
        new THREE.MeshStandardMaterial({
          color: '#38bdf8',
          emissive: new THREE.Color('#38bdf8'),
          emissiveIntensity: 0.4,
          transparent: true,
          opacity: 0.85,
        })
      );
      roof.position.set(0, 5.9, 0);
      roof.rotation.y = Math.PI / 4;
      group.add(roof);

      // Front Plaza: Open Stone Book Monument
      const monBase = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 1.2), mat('#cbd5e1'));
      monBase.position.set(0, 0.3, 5.8);
      group.add(monBase);

      const book = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.16, 0.9), mat('#ffffff'));
      book.position.set(0, 0.72, 5.8);
      book.rotation.x = 0.35;
      group.add(book);
      break;
    }

    case 'chapel': {
      // ⛪ Campus Chapel
      // High-pitched Nave
      const nave = new THREE.Mesh(new THREE.BoxGeometry(5.2, 3.6, 7.5), mat('#f8fafc', 0.3));
      nave.position.y = 1.8;
      nave.castShadow = true;
      group.add(nave);

      // Pitched Roof
      const roofShape = new THREE.Shape();
      roofShape.moveTo(-2.8, 0);
      roofShape.lineTo(0, 1.8);
      roofShape.lineTo(2.8, 0);
      roofShape.closePath();
      const roofGeo = new THREE.ExtrudeGeometry(roofShape, { depth: 7.9, bevelEnabled: false });
      const roof = new THREE.Mesh(roofGeo, mat('#334155', 0.4));
      roof.position.set(0, 3.6, -3.95);
      roof.castShadow = true;
      group.add(roof);

      // Bell Tower Spire
      const tower = new THREE.Mesh(new THREE.BoxGeometry(2.0, 5.2, 2.0), mat('#f8fafc'));
      tower.position.set(0, 2.6, 3.5);
      tower.castShadow = true;
      group.add(tower);

      const spire = new THREE.Mesh(new THREE.ConeGeometry(1.2, 3.2, 8), mat('#1e293b'));
      spire.position.set(0, 6.8, 3.5);
      spire.castShadow = true;
      group.add(spire);

      // Gold Cross
      const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.1, 0.12), mat('#eab308', 0.2, 0.9));
      crossV.position.set(0, 8.8, 3.5);
      group.add(crossV);

      const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.12, 0.12), mat('#eab308', 0.2, 0.9));
      crossH.position.set(0, 9.0, 3.5);
      group.add(crossH);
      break;
    }

    case 'mosque': {
      // 🕌 Campus Mosque
      // Square Prayer Sanctuary
      const sanctuary = new THREE.Mesh(new THREE.BoxGeometry(6.5, 3.6, 6.5), mat('#f8fafc', 0.3));
      sanctuary.position.y = 1.8;
      sanctuary.castShadow = true;
      group.add(sanctuary);

      // Islamic Green Trim Archway
      const trim = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.4, 6.8), mat('#15803d', 0.3));
      trim.position.y = 3.8;
      group.add(trim);

      // Magnificent Central Emerald Dome
      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(2.2, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        mat('#15803d', 0.2, 0.4)
      );
      dome.position.set(0, 3.9, 0);
      dome.castShadow = true;
      group.add(dome);

      // Crescent Moon Finial atop Dome
      const crescent = new THREE.Mesh(
        new THREE.TorusGeometry(0.35, 0.08, 8, 16, Math.PI * 1.5),
        mat('#facc15', 0.2, 0.9)
      );
      crescent.position.set(0, 6.4, 0);
      group.add(crescent);

      // Tall Slender Minaret Tower with wrap-around balconies
      const minBase = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 7.2, 12), mat('#f1f5f9'));
      minBase.position.set(3.8, 3.6, 3.2);
      minBase.castShadow = true;
      group.add(minBase);

      const minBalc = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.2, 12), mat('#15803d'));
      minBalc.position.set(3.8, 6.8, 3.2);
      group.add(minBalc);

      const minTop = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.6, 12), mat('#15803d'));
      minTop.position.set(3.8, 7.8, 3.2);
      group.add(minTop);
      break;
    }

    case 'cafeteria': {
      // 🥗 Main Cafeteria (Food Hub & Bukka)
      // Wide Pavilion Building
      const pavilion = new THREE.Mesh(new THREE.BoxGeometry(11, 3.2, 8.5), mat('#f59e0b', 0.4)); // Warm terracotta
      pavilion.position.y = 1.6;
      pavilion.castShadow = true;
      group.add(pavilion);

      // Pitched Overhang Canopy Roof
      const roof = new THREE.Mesh(new THREE.BoxGeometry(11.8, 0.45, 9.2), mat('#b45309', 0.4));
      roof.position.y = 3.4;
      roof.castShadow = true;
      group.add(roof);

      // Front Dining Hall Windows
      const win = new THREE.Mesh(new THREE.BoxGeometry(8.5, 1.8, 0.06), glassMat);
      win.position.set(0, 1.8, 4.28);
      group.add(win);

      // Outdoor Dining Terrace with 4 Umbrella Tables
      [[-3.2, 5.5], [3.2, 5.5], [-3.2, 7.5], [3.2, 7.5]].forEach(([ux, uz], idx) => {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 6), mat('#64748b'));
        pole.position.set(ux, 0.9, uz);
        group.add(pole);

        const umbMat = mat(idx % 2 === 0 ? '#ef4444' : '#f59e0b', 0.5);
        const umbrella = new THREE.Mesh(new THREE.ConeGeometry(1.1, 0.55, 8), umbMat);
        umbrella.position.set(ux, 1.8, uz);
        umbrella.castShadow = true;
        group.add(umbrella);

        const table = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.08, 12), mat('#ffffff'));
        table.position.set(ux, 0.6, uz);
        group.add(table);
      });
      break;
    }

    case 'sub': {
      // 🎭 Student Union Building (SUB)
      // Geometric Student Centre with Lounges
      const subMain = new THREE.Mesh(new THREE.BoxGeometry(10.5, 4.2, 8), mat('#f8fafc', 0.3));
      subMain.position.y = 2.1;
      subMain.castShadow = true;
      group.add(subMain);

      // Vibrant Rose/Red Student Affairs Accent Wing
      const wing = new THREE.Mesh(new THREE.BoxGeometry(5.0, 3.2, 7.0), mat('#e11d48', 0.4));
      wing.position.set(4.0, 1.6, 1.0);
      wing.castShadow = true;
      group.add(wing);

      // Second-floor Lounge Balcony
      const balc = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.3, 1.8), mat('#334155', 0.3));
      balc.position.set(-2.0, 2.5, 4.5);
      group.add(balc);

      // Outdoor Mini Amphitheatre Steps
      [0.2, 0.4, 0.6].forEach((sy, idx) => {
        const step = new THREE.Mesh(new THREE.CylinderGeometry(2.5 - idx * 0.5, 2.5 - idx * 0.5, 0.15, 16, 1, false, 0, Math.PI), mat('#cbd5e1'));
        step.position.set(-3.0, sy, -4.5);
        step.rotation.y = Math.PI;
        group.add(step);
      });
      break;
    }

    case 'pg_school': {
      // 🎓 Post-Graduate School
      // Executive Corporate-Academic Block
      const base = new THREE.Mesh(new THREE.BoxGeometry(12, 0.4, 9), mat('#334155'));
      base.position.y = 0.2;
      group.add(base);

      const block = new THREE.Mesh(new THREE.BoxGeometry(11, 4.6, 8), mat('#f8fafc', 0.3));
      block.position.y = 2.5;
      block.castShadow = true;
      group.add(block);

      // Executive Indigo Tinted Glass Ribbons
      const ribMat = new THREE.MeshStandardMaterial({
        color: '#3730a3',
        emissive: new THREE.Color('#4338ca'),
        emissiveIntensity: 0.5,
        roughness: 0.2,
      });
      const glassRibbon1 = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.8, 0.08), ribMat);
      glassRibbon1.position.set(0, 2.0, 4.04);
      group.add(glassRibbon1);

      const glassRibbon2 = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.8, 0.08), ribMat);
      glassRibbon2.position.set(0, 3.6, 4.04);
      group.add(glassRibbon2);

      // Penthouse Executive Boardroom Suite
      const ph = new THREE.Mesh(new THREE.BoxGeometry(7.0, 1.6, 5.0), mat('#1e293b', 0.2));
      ph.position.y = 5.6;
      ph.castShadow = true;
      group.add(ph);
      break;
    }

    case 'stadium': {
      // ⚽ LU Stadium & Arena
      // Red Athletics Track
      const track = new THREE.Mesh(new THREE.BoxGeometry(15, 0.05, 11.5), mat('#dc2626', 0.9));
      track.position.y = 0.03;
      track.receiveShadow = true;
      group.add(track);

      // Green Football Pitch with Lines
      const field = new THREE.Mesh(new THREE.BoxGeometry(12, 0.06, 8.5), mat('#15803d', 0.8));
      field.position.y = 0.04;
      group.add(field);

      // White Center Circle & Touchlines
      const centerCircle = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.3, 16), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
      centerCircle.rotateX(-Math.PI / 2);
      centerCircle.position.set(0, 0.075, 0);
      group.add(centerCircle);

      // Goalposts
      [[-5.8, 0], [5.8, 0]].forEach(([gx, gz]) => {
        const goal = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.6, 1.4), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
        goal.position.set(gx, 0.3, gz);
        group.add(goal);
      });

      // Covered Grandstand Bleachers
      const stand = new THREE.Mesh(new THREE.BoxGeometry(14, 1.8, 2.6), mat('#64748b', 0.6));
      stand.position.set(0, 0.9, -5.2);
      stand.castShadow = true;
      group.add(stand);

      const roofStand = new THREE.Mesh(new THREE.BoxGeometry(14.4, 0.25, 3.4), mat('#0284c7', 0.4));
      roofStand.position.set(0, 2.2, -4.8);
      group.add(roofStand);

      // 4 Tall Stadium Floodlight Towers
      [[-7, 5.2], [7, 5.2], [-7, -5.2], [7, -5.2]].forEach(([fx, fz]) => {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 5.0, 6), mat('#334155'));
        p.position.set(fx, 2.5, fz);
        group.add(p);

        const lampHead = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 0.35, 0.25),
          new THREE.MeshStandardMaterial({
            color: '#fef08a',
            emissive: new THREE.Color('#facc15'),
            emissiveIntensity: 0.9,
          })
        );
        lampHead.position.set(fx, 5.0, fz);
        group.add(lampHead);
      });
      break;
    }

    case 'hostels_male': {
      // 🏠 hostels (male) - Emerald Hall
      const dorm = new THREE.Mesh(new THREE.BoxGeometry(10, 4.8, 7.5), mat('#15803d', 0.4)); // Emerald green block
      dorm.position.y = 2.4;
      dorm.castShadow = true;
      group.add(dorm);

      // Individual Room Balcony Openings
      for (let by = 1.4; by <= 4.2; by += 1.4) {
        for (let bx = -3.6; bx <= 3.6; bx += 2.4) {
          const balc = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 0.4), mat('#ffffff', 0.2));
          balc.position.set(bx, by, 3.9);
          group.add(balc);
        }
      }

      // Rooftop Water Tanks
      const tank1 = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.2, 12), mat('#0f172a'));
      tank1.position.set(-2.5, 5.4, 1.5);
      group.add(tank1);

      const tank2 = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.2, 12), mat('#0f172a'));
      tank2.position.set(2.5, 5.4, 1.5);
      group.add(tank2);
      break;
    }

    case 'hostels_female': {
      // 🏡 hostels (female) - Pearl Hall
      const dorm = new THREE.Mesh(new THREE.BoxGeometry(9.5, 4.8, 7.5), mat('#f8fafc', 0.3));
      dorm.position.y = 2.4;
      dorm.castShadow = true;
      group.add(dorm);

      // Rose/Pink Accent Trim
      const trim = new THREE.Mesh(new THREE.BoxGeometry(9.7, 0.4, 7.7), mat('#db2777', 0.4));
      trim.position.y = 4.9;
      group.add(trim);

      // Balcony Openings
      for (let by = 1.4; by <= 4.2; by += 1.4) {
        for (let bx = -3.2; bx <= 3.2; bx += 2.2) {
          const balc = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 0.4), mat('#fce7f3', 0.2));
          balc.position.set(bx, by, 3.9);
          group.add(balc);
        }
      }

      const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 1.2, 12), mat('#334155'));
      tank.position.set(0, 5.4, 1.0);
      group.add(tank);
      break;
    }

    case 'medical_centre': {
      // 🏥 Medical Centre
      const clinic = new THREE.Mesh(new THREE.BoxGeometry(9.5, 3.4, 7.0), mat('#ffffff', 0.3));
      clinic.position.y = 1.7;
      clinic.castShadow = true;
      group.add(clinic);

      // Emergency Ambulance Entrance Canopy (Red)
      const canopy = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.25, 2.5), mat('#dc2626', 0.4));
      canopy.position.set(-2.0, 2.5, 4.6);
      group.add(canopy);

      // Red Cross Signage on Front
      const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.4, 0.08), mat('#dc2626'));
      crossV.position.set(2.4, 2.5, 3.55);
      group.add(crossV);

      const crossH = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, 0.08), mat('#dc2626'));
      crossH.position.set(2.4, 2.5, 3.55);
      group.add(crossH);

      // Parked Ambulance Van
      const amb = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 2.2), mat('#ffffff'));
      amb.position.set(-2.0, 0.5, 4.8);
      amb.castShadow = true;
      group.add(amb);
      break;
    }

    case 'guesthouse': {
      // 🏨 University Guesthouse
      const lodge = new THREE.Mesh(new THREE.BoxGeometry(9.5, 3.6, 7.5), mat('#f8fafc', 0.3));
      lodge.position.y = 1.8;
      lodge.castShadow = true;
      group.add(lodge);

      // Pitched Hipped Roof in Slate Blue
      const roofShape = new THREE.Shape();
      roofShape.moveTo(-5.0, 0);
      roofShape.lineTo(0, 1.8);
      roofShape.lineTo(5.0, 0);
      roofShape.closePath();
      const roof = new THREE.Mesh(
        new THREE.ExtrudeGeometry(roofShape, { depth: 7.9, bevelEnabled: false }),
        mat('#0284c7', 0.4)
      );
      roof.position.set(0, 3.6, -3.95);
      roof.castShadow = true;
      group.add(roof);

      // Entrance Portico
      const portico = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.2, 2.0), mat('#0284c7'));
      portico.position.set(0, 2.4, 4.6);
      group.add(portico);

      [-1.4, 1.4].forEach((px) => {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.4, 8), mat('#ffffff'));
        pillar.position.set(px, 1.2, 4.6);
        group.add(pillar);
      });
      break;
    }

    case 'lions_hall': {
      // 🦁 Lions Hall (Party & Events Venue)
      const mainHall = new THREE.Mesh(new THREE.BoxGeometry(8.5, 3.8, 7.0), mat('#f8fafc', 0.3));
      mainHall.position.y = 1.9;
      mainHall.castShadow = true;
      group.add(mainHall);

      // Gold Roof Fascia & Flat Riser
      const roof = new THREE.Mesh(new THREE.BoxGeometry(9.0, 0.4, 7.5), mat('#f59e0b', 0.4));
      roof.position.y = 3.9;
      group.add(roof);

      // Event Glass Entrance Lobby
      const glassLobby = new THREE.Mesh(
        new THREE.BoxGeometry(5.0, 2.6, 1.2),
        new THREE.MeshStandardMaterial({ color: '#fef3c7', roughness: 0.1, metalness: 0.6, transparent: true, opacity: 0.85 })
      );
      glassLobby.position.set(0, 1.3, 3.8);
      group.add(glassLobby);

      // Entrance Marquee (LIONS HALL Banner)
      const marquee = new THREE.Mesh(
        new THREE.BoxGeometry(5.4, 0.6, 0.2),
        new THREE.MeshStandardMaterial({ color: '#b45309', emissive: '#f59e0b', emissiveIntensity: 0.5 })
      );
      marquee.position.set(0, 2.9, 4.45);
      group.add(marquee);

      // 2 Festive Party Spotlights on roof corners
      [-3.5, 3.5].forEach((sx) => {
        const spot = new THREE.Mesh(
          new THREE.ConeGeometry(0.3, 0.6, 8),
          new THREE.MeshStandardMaterial({ color: '#f59e0b', emissive: '#f59e0b', emissiveIntensity: 0.8 })
        );
        spot.position.set(sx, 4.3, 2.8);
        spot.rotation.x = -Math.PI / 4;
        group.add(spot);
      });
      break;
    }

    case 'adeline_hall': {
      // 🎧 Adeline Hall (Auditorium & DJ Beats Center)
      const audHall = new THREE.Mesh(new THREE.BoxGeometry(8.2, 3.6, 7.2), mat('#ffffff', 0.25));
      audHall.position.y = 1.8;
      audHall.castShadow = true;
      group.add(audHall);

      // Curved Auditorium Stepped Roof (Deep Violet/Magenta)
      const audRoof = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.5, 7.6), mat('#ec4899', 0.4));
      audRoof.position.y = 3.7;
      group.add(audRoof);

      // Glass Portico
      const frontGlass = new THREE.Mesh(
        new THREE.BoxGeometry(4.8, 2.4, 1.0),
        new THREE.MeshStandardMaterial({ color: '#fdf2f8', roughness: 0.1, transparent: true, opacity: 0.85 })
      );
      frontGlass.position.set(0, 1.2, 3.8);
      group.add(frontGlass);

      // "ADELINE BEATS" LED Neon Signage
      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(4.6, 0.5, 0.2),
        new THREE.MeshStandardMaterial({ color: '#9d174d', emissive: '#ec4899', emissiveIntensity: 0.6 })
      );
      sign.position.set(0, 2.7, 4.35);
      group.add(sign);

      // 2 Sound Speaker Stacks flanking entrance
      [-3.0, 3.0].forEach((spx) => {
        const speaker = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.6, 0.8), mat('#18181b', 0.8));
        speaker.position.set(spx, 0.8, 3.6);
        group.add(speaker);
      });
      break;
    }
  }

  return group;
}
