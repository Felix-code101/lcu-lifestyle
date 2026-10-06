import * as THREE from 'three';
import type { RoomItem } from '../types/game';

export function createItemMesh(item: RoomItem): THREE.Group {
  const group = new THREE.Group();
  group.name = item.id;
  group.position.set(item.x, 0, item.z);
  group.rotation.y = item.rotation;

  // Helpers for materials
  const mat = (color: string | number, roughness = 0.5, metalness = 0.1) =>
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness,
      metalness,
    });

  const baseColor = item.color || '#3b82f6';

  switch (item.type) {
    case 'bed': {
      // Bed frame
      const frameGeo = new THREE.BoxGeometry(2.4, 0.4, 1.4);
      const frame = new THREE.Mesh(frameGeo, mat('#451a03', 0.7));
      frame.position.y = 0.2;
      frame.castShadow = true;
      group.add(frame);

      // Mattress
      const matGeo = new THREE.BoxGeometry(2.3, 0.35, 1.3);
      const mattress = new THREE.Mesh(matGeo, mat('#f8fafc', 0.9));
      mattress.position.y = 0.55;
      mattress.castShadow = true;
      group.add(mattress);

      // Blanket / Duvet (Liids University Green/Gold accent)
      const duvetGeo = new THREE.BoxGeometry(1.6, 0.38, 1.32);
      const duvet = new THREE.Mesh(duvetGeo, mat('#15803d', 0.8));
      duvet.position.set(-0.35, 0.56, 0);
      duvet.castShadow = true;
      group.add(duvet);

      // Pillow
      const pilGeo = new THREE.BoxGeometry(0.5, 0.18, 0.9);
      const pillow = new THREE.Mesh(pilGeo, mat('#ffffff', 0.95));
      pillow.position.set(0.8, 0.75, 0);
      pillow.castShadow = true;
      group.add(pillow);

      // Headboard
      const headGeo = new THREE.BoxGeometry(0.12, 1.1, 1.4);
      const headboard = new THREE.Mesh(headGeo, mat('#451a03', 0.7));
      headboard.position.set(1.15, 0.55, 0);
      headboard.castShadow = true;
      group.add(headboard);
      break;
    }

    case 'whiteboard': {
      // Aluminum Stand Legs
      const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.8, 8);
      const legMat = mat('#94a3b8', 0.2, 0.8);
      const leftLeg = new THREE.Mesh(legGeo, legMat);
      leftLeg.position.set(-1.6, 1.4, 0);
      leftLeg.castShadow = true;
      group.add(leftLeg);

      const rightLeg = new THREE.Mesh(legGeo, legMat);
      rightLeg.position.set(1.6, 1.4, 0);
      rightLeg.castShadow = true;
      group.add(rightLeg);

      // Whiteboard board
      const boardGeo = new THREE.BoxGeometry(3.2, 1.8, 0.06);
      const boardMat = new THREE.MeshStandardMaterial({
        color: '#f8fafc',
        roughness: 0.2,
      });
      const board = new THREE.Mesh(boardGeo, boardMat);
      board.position.set(0, 2.0, 0);
      board.castShadow = true;
      group.add(board);

      // Board Frame
      const frameGeo = new THREE.BoxGeometry(3.3, 1.9, 0.05);
      const frame = new THREE.Mesh(frameGeo, mat('#1e293b', 0.4, 0.3));
      frame.position.set(0, 2.0, -0.01);
      group.add(frame);

      // Written Lecture Notes Simulation (Liids University header)
      const textGeo1 = new THREE.BoxGeometry(2.4, 0.1, 0.07);
      const textMat1 = new THREE.MeshBasicMaterial({ color: '#166534' }); // LU green text
      const t1 = new THREE.Mesh(textGeo1, textMat1);
      t1.position.set(0, 2.5, 0.01);
      group.add(t1);

      const textGeo2 = new THREE.BoxGeometry(1.8, 0.06, 0.07);
      const textMat2 = new THREE.MeshBasicMaterial({ color: '#1e3a8a' }); // blue diagram line
      const t2 = new THREE.Mesh(textGeo2, textMat2);
      t2.position.set(-0.3, 2.2, 0.01);
      group.add(t2);

      const textGeo3 = new THREE.BoxGeometry(1.4, 0.06, 0.07);
      const t3 = new THREE.Mesh(textGeo3, textMat2);
      t3.position.set(-0.5, 1.9, 0.01);
      group.add(t3);

      // Marker Tray
      const trayGeo = new THREE.BoxGeometry(2.0, 0.04, 0.2);
      const tray = new THREE.Mesh(trayGeo, mat('#64748b', 0.3, 0.7));
      tray.position.set(0, 1.08, 0.08);
      group.add(tray);
      break;
    }

    case 'podium': {
      // Base
      const baseGeo = new THREE.BoxGeometry(1.0, 0.1, 0.9);
      const baseMesh = new THREE.Mesh(baseGeo, mat('#1e293b', 0.5));
      baseMesh.position.y = 0.05;
      group.add(baseMesh);

      // Podium column
      const colGeo = new THREE.BoxGeometry(0.7, 1.6, 0.6);
      const col = new THREE.Mesh(colGeo, mat('#15803d', 0.4)); // University green
      col.position.y = 0.85;
      col.castShadow = true;
      group.add(col);

      // Podium slanted top
      const topGeo = new THREE.BoxGeometry(1.1, 0.12, 0.8);
      const top = new THREE.Mesh(topGeo, mat('#b45309', 0.3)); // polished wood
      top.position.set(0, 1.7, 0);
      top.rotation.x = -0.2;
      top.castShadow = true;
      group.add(top);

      // University Crest Plaque
      const crestGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.04, 16);
      const crestMat = new THREE.MeshStandardMaterial({
        color: '#eab308',
        emissive: new THREE.Color('#ca8a04'),
        emissiveIntensity: 0.3,
        metalness: 0.8,
        roughness: 0.2,
      });
      const crest = new THREE.Mesh(crestGeo, crestMat);
      crest.rotation.x = Math.PI / 2;
      crest.position.set(0, 1.1, 0.31);
      group.add(crest);

      // Gooseneck Mic
      const micPole = new THREE.CylinderGeometry(0.015, 0.015, 0.4, 8);
      const mic = new THREE.Mesh(micPole, mat('#0f172a', 0.1, 0.9));
      mic.position.set(0.3, 1.9, 0.1);
      mic.rotation.x = 0.4;
      group.add(mic);
      break;
    }

    case 'food_counter': {
      // Counter Base
      const countGeo = new THREE.BoxGeometry(3.4, 1.2, 1.2);
      const count = new THREE.Mesh(countGeo, mat('#1e293b', 0.3, 0.2));
      count.position.y = 0.6;
      count.castShadow = true;
      group.add(count);

      // Countertop stainless steel
      const topGeo = new THREE.BoxGeometry(3.5, 0.1, 1.3);
      const topMat = mat('#e2e8f0', 0.1, 0.85);
      const top = new THREE.Mesh(topGeo, topMat);
      top.position.y = 1.25;
      top.castShadow = true;
      group.add(top);

      // Hot food warmer trays (Jollof, Chicken, Fried Rice)
      const trayColors = ['#dc2626', '#f59e0b', '#b45309'];
      [-0.9, 0, 0.9].forEach((tx, idx) => {
        const trayGeo = new THREE.BoxGeometry(0.7, 0.08, 0.65);
        const trayMesh = new THREE.Mesh(trayGeo, mat(trayColors[idx], 0.6));
        trayMesh.position.set(tx, 1.32, 0.1);
        group.add(trayMesh);
      });

      // Sneeze glass guard
      const glassGeo = new THREE.BoxGeometry(3.3, 0.6, 0.05);
      const glassMat = new THREE.MeshStandardMaterial({
        color: '#bae6fd',
        transparent: true,
        opacity: 0.45,
        roughness: 0.1,
      });
      const glass = new THREE.Mesh(glassGeo, glassMat);
      glass.position.set(0, 1.6, 0.45);
      group.add(glass);

      // Warm heating food light
      const foodLight = new THREE.PointLight('#fef08a', 2.2, 5);
      foodLight.position.set(0, 1.8, 0.2);
      group.add(foodLight);
      break;
    }

    case 'dining_table': {
      // Cafeteria Table
      const tableTopGeo = new THREE.CylinderGeometry(1.1, 1.1, 0.08, 20);
      const tableTop = new THREE.Mesh(tableTopGeo, mat('#f8fafc', 0.3));
      tableTop.position.y = 0.95;
      tableTop.castShadow = true;
      group.add(tableTop);

      // Pillar leg
      const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.95, 12);
      const leg = new THREE.Mesh(legGeo, mat('#334155', 0.2, 0.8));
      leg.position.y = 0.475;
      leg.castShadow = true;
      group.add(leg);

      const footGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.04, 16);
      const foot = new THREE.Mesh(footGeo, mat('#1e293b', 0.2, 0.8));
      foot.position.y = 0.02;
      group.add(foot);

      // 4 Stools around table
      const stoolAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
      stoolAngles.forEach((ang) => {
        const stoolX = Math.cos(ang) * 1.35;
        const stoolZ = Math.sin(ang) * 1.35;

        const seatGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.06, 16);
        const seat = new THREE.Mesh(seatGeo, mat(baseColor, 0.5));
        seat.position.set(stoolX, 0.55, stoolZ);
        seat.castShadow = true;
        group.add(seat);

        const stoolLeg = new THREE.CylinderGeometry(0.04, 0.04, 0.55, 8);
        const sl = new THREE.Mesh(stoolLeg, mat('#334155', 0.2, 0.8));
        sl.position.set(stoolX, 0.275, stoolZ);
        sl.castShadow = true;
        group.add(sl);
      });
      break;
    }

    case 'bookshelf': {
      // Library Bookshelf
      const w = 2.6, h = 3.0, d = 0.7;
      const shelfMat = mat('#3e2723', 0.6);

      const frameGeo = new THREE.BoxGeometry(w, h, d);
      const frame = new THREE.Mesh(frameGeo, shelfMat);
      frame.position.y = h / 2;
      frame.castShadow = true;
      group.add(frame);

      // Multiple rows of books with emissive accents
      const bookColors = ['#15803d', '#1d4ed8', '#b91c1c', '#d97706', '#7c3aed', '#0f766e'];
      [-0.9, -0.4, 0.1, 0.6, 1.0].forEach((bx, idx) => {
        [0.8, 1.6, 2.4].forEach((by) => {
          const bGeo = new THREE.BoxGeometry(0.22, 0.55, 0.72);
          const bMesh = new THREE.Mesh(bGeo, mat(bookColors[(idx + Math.floor(by)) % bookColors.length], 0.7));
          bMesh.position.set(bx, by, 0);
          group.add(bMesh);
        });
      });
      break;
    }

    case 'sports_hoop': {
      // Basketball hoop pole
      const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.8, 12);
      const pole = new THREE.Mesh(poleGeo, mat('#334155', 0.2, 0.8));
      pole.position.set(0, 1.9, 0);
      pole.castShadow = true;
      group.add(pole);

      // Overhang arm
      const armGeo = new THREE.BoxGeometry(0.1, 0.1, 1.2);
      const arm = new THREE.Mesh(armGeo, mat('#334155', 0.2, 0.8));
      arm.position.set(0, 3.4, 0.5);
      arm.rotation.x = -0.3;
      group.add(arm);

      // Backboard
      const bbGeo = new THREE.BoxGeometry(1.6, 1.1, 0.06);
      const bbMat = new THREE.MeshStandardMaterial({
        color: '#ffffff',
        roughness: 0.2,
      });
      const bb = new THREE.Mesh(bbGeo, bbMat);
      bb.position.set(0, 3.5, 1.1);
      bb.castShadow = true;
      group.add(bb);

      // Rim
      const rimGeo = new THREE.TorusGeometry(0.3, 0.03, 8, 16);
      const rimMat = new THREE.MeshStandardMaterial({ color: '#ea580c', roughness: 0.3 });
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.set(0, 3.1, 1.45);
      group.add(rim);

      // Court ball (basketball on floor)
      const ballGeo = new THREE.SphereGeometry(0.22, 16, 16);
      const ballMat = new THREE.MeshStandardMaterial({ color: '#f97316', roughness: 0.5 });
      const ball = new THREE.Mesh(ballGeo, ballMat);
      ball.position.set(0.6, 0.22, 0.8);
      ball.castShadow = true;
      group.add(ball);
      break;
    }

    case 'desk': {
      const isStudentDesk =
        baseColor === '#ca8a04' ||
        item.name.toLowerCase().includes('wooden') ||
        item.name.toLowerCase().includes('student');

      if (isStudentDesk) {
        // Simple Wooden Student Desk
        const woodMat = mat('#d97706', 0.65, 0.05); // Warm honey oak
        const legMat = mat('#f8fafc', 0.35, 0.2); // White steel legs
        const darkHandleMat = mat('#1e293b', 0.2, 0.8);

        // Tabletop
        const topGeo = new THREE.BoxGeometry(2.3, 0.1, 1.2);
        const topMesh = new THREE.Mesh(topGeo, woodMat);
        topMesh.position.y = 0.95;
        topMesh.castShadow = true;
        topMesh.receiveShadow = true;
        group.add(topMesh);

        // 4 Clean White Metal Legs
        const legGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.95, 8);
        const legPositions = [
          [-1.0, 0.475, -0.45],
          [1.0, 0.475, -0.45],
          [-1.0, 0.475, 0.45],
          [1.0, 0.475, 0.45],
        ];
        legPositions.forEach(([lx, ly, lz]) => {
          const leg = new THREE.Mesh(legGeo, legMat);
          leg.position.set(lx, ly, lz);
          leg.castShadow = true;
          group.add(leg);
        });

        // Built-in Drawer Unit on Left Side
        const drawerGeo = new THREE.BoxGeometry(0.7, 0.3, 0.9);
        const drawer = new THREE.Mesh(drawerGeo, woodMat);
        drawer.position.set(-0.7, 0.72, 0);
        drawer.castShadow = true;
        group.add(drawer);

        // Silver handle
        const handleGeo = new THREE.BoxGeometry(0.18, 0.03, 0.04);
        const handle = new THREE.Mesh(handleGeo, darkHandleMat);
        handle.position.set(-0.7, 0.72, 0.47);
        group.add(handle);

        // Modesty Panel / Backboard
        const backPanelGeo = new THREE.BoxGeometry(2.1, 0.4, 0.03);
        const backPanel = new THREE.Mesh(backPanelGeo, woodMat);
        backPanel.position.set(0, 0.7, -0.45);
        group.add(backPanel);
      } else {
        // Tabletop
        const topGeo = new THREE.BoxGeometry(2.2, 0.12, 1.2);
        const topMesh = new THREE.Mesh(topGeo, mat('#334155', 0.4, 0.2));
        topMesh.position.y = 1.0;
        topMesh.castShadow = true;
        topMesh.receiveShadow = true;
        group.add(topMesh);

        // Legs
        const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.0, 8);
        const legMat = mat('#0f172a', 0.2, 0.8);
        const legPositions = [
          [-0.95, 0.5, -0.45],
          [0.95, 0.5, -0.45],
          [-0.95, 0.5, 0.45],
          [0.95, 0.5, 0.45],
        ];
        legPositions.forEach(([lx, ly, lz]) => {
          const leg = new THREE.Mesh(legGeo, legMat);
          leg.position.set(lx, ly, lz);
          leg.castShadow = true;
          group.add(leg);
        });

        // Dual Monitors
        const standGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8);
        const stand = new THREE.Mesh(standGeo, legMat);
        stand.position.set(0, 1.2, -0.2);
        group.add(stand);

        const screenGeo = new THREE.BoxGeometry(0.9, 0.5, 0.04);
        const screenMat1 = new THREE.MeshStandardMaterial({
          color: '#0f172a',
          emissive: new THREE.Color('#38bdf8'),
          emissiveIntensity: 0.6,
        });
        const screenMat2 = new THREE.MeshStandardMaterial({
          color: '#0f172a',
          emissive: new THREE.Color('#ec4899'),
          emissiveIntensity: 0.6,
        });

        const monitor1 = new THREE.Mesh(screenGeo, screenMat1);
        monitor1.position.set(-0.48, 1.4, -0.2);
        monitor1.rotation.y = 0.15;
        group.add(monitor1);

        const monitor2 = new THREE.Mesh(screenGeo, screenMat2);
        monitor2.position.set(0.48, 1.4, -0.2);
        monitor2.rotation.y = -0.15;
        group.add(monitor2);

        // Keyboard & mousepad
        const padGeo = new THREE.BoxGeometry(1.2, 0.01, 0.45);
        const pad = new THREE.Mesh(padGeo, mat('#1e293b', 0.8));
        pad.position.set(0, 1.065, 0.15);
        group.add(pad);

        const kbGeo = new THREE.BoxGeometry(0.6, 0.02, 0.2);
        const kb = new THREE.Mesh(kbGeo, mat(baseColor, 0.3));
        kb.position.set(-0.1, 1.08, 0.15);
        group.add(kb);
      }
      break;
    }

    case 'chair': {
      const isPlasticChair =
        baseColor === '#1d4ed8' ||
        item.name.toLowerCase().includes('plastic') ||
        item.name.toLowerCase().includes('student');

      if (isPlasticChair) {
        // Nigerian University Moulded Plastic Chair
        const plasticMat = mat('#1d4ed8', 0.4, 0.1); // Vibrant blue plastic
        const legMat = mat('#94a3b8', 0.2, 0.8); // Steel tubular legs

        // Curved Seat
        const seatGeo = new THREE.BoxGeometry(0.68, 0.06, 0.65);
        const seat = new THREE.Mesh(seatGeo, plasticMat);
        seat.position.y = 0.52;
        seat.castShadow = true;
        group.add(seat);

        // Backrest with ventilated slat
        const backGeo = new THREE.BoxGeometry(0.65, 0.58, 0.05);
        const back = new THREE.Mesh(backGeo, plasticMat);
        back.position.set(0, 0.82, -0.3);
        back.rotation.x = -0.08;
        back.castShadow = true;
        group.add(back);

        // Backrest handle opening
        const cutGeo = new THREE.BoxGeometry(0.25, 0.08, 0.08);
        const cutMat = mat('#0f172a', 0.9);
        const cut = new THREE.Mesh(cutGeo, cutMat);
        cut.position.set(0, 1.02, -0.32);
        group.add(cut);

        // 4 Angled Tubular Legs
        const legGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.54, 8);
        const legPos = [
          [-0.26, 0.26, -0.24, -0.1, 0.1],
          [0.26, 0.26, -0.24, -0.1, -0.1],
          [-0.26, 0.26, 0.24, 0.1, 0.1],
          [0.26, 0.26, 0.24, 0.1, -0.1],
        ];
        legPos.forEach(([lx, ly, lz, rx, rz]) => {
          const leg = new THREE.Mesh(legGeo, legMat);
          leg.position.set(lx, ly, lz);
          leg.rotation.x = rx;
          leg.rotation.z = rz;
          leg.castShadow = true;
          group.add(leg);
        });
      } else {
        // Base & Wheels
        const baseGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.05, 5);
        const baseMesh = new THREE.Mesh(baseGeo, mat('#0f172a', 0.3, 0.6));
        baseMesh.position.y = 0.1;
        group.add(baseMesh);

        const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8);
        const pole = new THREE.Mesh(poleGeo, mat('#64748b', 0.1, 0.9));
        pole.position.y = 0.3;
        group.add(pole);

        // Seat cushion
        const seatGeo = new THREE.BoxGeometry(0.7, 0.12, 0.7);
        const seatMat = mat(baseColor, 0.4);
        const seat = new THREE.Mesh(seatGeo, seatMat);
        seat.position.y = 0.55;
        seat.castShadow = true;
        group.add(seat);

        // Backrest
        const backGeo = new THREE.BoxGeometry(0.65, 0.85, 0.1);
        const back = new THREE.Mesh(backGeo, seatMat);
        back.position.set(0, 1.0, -0.3);
        back.rotation.x = -0.05;
        back.castShadow = true;
        group.add(back);

        // Headrest
        const headGeo = new THREE.BoxGeometry(0.4, 0.2, 0.08);
        const head = new THREE.Mesh(headGeo, mat('#1e293b'));
        head.position.set(0, 1.45, -0.32);
        group.add(head);
      }
      break;
    }

    case 'plant': {
      // Pot
      const potGeo = new THREE.CylinderGeometry(0.35, 0.25, 0.6, 16);
      const pot = new THREE.Mesh(potGeo, mat('#d97706', 0.7));
      pot.position.y = 0.3;
      pot.castShadow = true;
      group.add(pot);

      // Soil
      const soilGeo = new THREE.CylinderGeometry(0.33, 0.33, 0.05, 16);
      const soil = new THREE.Mesh(soilGeo, mat('#3f2314', 0.9));
      soil.position.y = 0.58;
      group.add(soil);

      // Stem
      const stemGeo = new THREE.CylinderGeometry(0.03, 0.04, 1.1, 8);
      const stem = new THREE.Mesh(stemGeo, mat('#15803d'));
      stem.position.y = 0.9;
      group.add(stem);

      // Lush Leaves
      const leafGeo = new THREE.SphereGeometry(0.25, 8, 8);
      leafGeo.scale(1.2, 0.2, 2.0);
      const leafMat = mat('#22c55e', 0.6);

      const leafAngles = [0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3];
      leafAngles.forEach((angle, idx) => {
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        const height = 0.7 + (idx % 3) * 0.3;
        leaf.position.set(0, height, 0);
        leaf.rotation.y = angle;
        leaf.rotation.x = 0.35;
        leaf.castShadow = true;
        group.add(leaf);
      });
      break;
    }

    case 'arcade': {
      const cabShape = new THREE.Shape();
      cabShape.moveTo(0, 0);
      cabShape.lineTo(0.9, 0);
      cabShape.lineTo(0.9, 1.4);
      cabShape.lineTo(0.5, 1.8);
      cabShape.lineTo(0.4, 2.1);
      cabShape.lineTo(0.9, 2.2);
      cabShape.lineTo(0.9, 2.4);
      cabShape.lineTo(0, 2.4);
      cabShape.closePath();

      const extrudeSettings = { depth: 0.9, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.02, bevelThickness: 0.02 };
      const cabGeo = new THREE.ExtrudeGeometry(cabShape, extrudeSettings);
      const cabMesh = new THREE.Mesh(cabGeo, mat('#18181b', 0.3));
      cabMesh.position.set(-0.45, 0, -0.45);
      cabMesh.castShadow = true;
      group.add(cabMesh);

      // Glowing Marquee
      const marqGeo = new THREE.BoxGeometry(0.85, 0.25, 0.05);
      const marqMat = new THREE.MeshStandardMaterial({
        color: '#facc15',
        emissive: new THREE.Color('#facc15'),
        emissiveIntensity: 0.8,
      });
      const marquee = new THREE.Mesh(marqGeo, marqMat);
      marquee.position.set(0, 2.2, 0.43);
      group.add(marquee);

      const scGeo = new THREE.BoxGeometry(0.7, 0.55, 0.05);
      const scMat = new THREE.MeshStandardMaterial({
        color: '#0284c7',
        emissive: new THREE.Color('#38bdf8'),
        emissiveIntensity: 0.9,
      });
      const sc = new THREE.Mesh(scGeo, scMat);
      sc.position.set(0, 1.7, 0.2);
      sc.rotation.x = -0.4;
      group.add(sc);
      break;
    }

    case 'shelf': {
      const frameMat = mat('#78350f', 0.6);
      const w = 1.4, h = 2.4, d = 0.5;

      const backGeo = new THREE.BoxGeometry(w, h, 0.04);
      const backMesh = new THREE.Mesh(backGeo, frameMat);
      backMesh.position.set(0, h / 2, -d / 2);
      backMesh.castShadow = true;
      group.add(backMesh);

      const sideGeo = new THREE.BoxGeometry(0.06, h, d);
      const leftSide = new THREE.Mesh(sideGeo, frameMat);
      leftSide.position.set(-w / 2 + 0.03, h / 2, 0);
      group.add(leftSide);

      const rightSide = new THREE.Mesh(sideGeo, frameMat);
      rightSide.position.set(w / 2 - 0.03, h / 2, 0);
      group.add(rightSide);

      const shelfPlankGeo = new THREE.BoxGeometry(w, 0.05, d);
      [0.05, 0.8, 1.5, 2.35].forEach((sy) => {
        const shelf = new THREE.Mesh(shelfPlankGeo, frameMat);
        shelf.position.set(0, sy, 0);
        shelf.castShadow = true;
        group.add(shelf);
      });

      const bookColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];
      [-0.4, -0.2, 0, 0.2, 0.35].forEach((bx, idx) => {
        const bookGeo = new THREE.BoxGeometry(0.08, 0.45, 0.3);
        const book = new THREE.Mesh(bookGeo, mat(bookColors[idx % bookColors.length], 0.7));
        book.position.set(bx, 1.05, 0);
        book.castShadow = true;
        group.add(book);
      });
      break;
    }

    case 'lamp': {
      const baseGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 16);
      const base = new THREE.Mesh(baseGeo, mat('#0f172a', 0.2, 0.8));
      base.position.y = 0.025;
      group.add(base);

      const poleGeo = new THREE.CylinderGeometry(0.03, 0.03, 2.5, 8);
      const pole = new THREE.Mesh(poleGeo, mat('#64748b', 0.2, 0.9));
      pole.position.y = 1.25;
      group.add(pole);

      const shadeGeo = new THREE.ConeGeometry(0.35, 0.5, 16, 1, true);
      const shadeMat = new THREE.MeshStandardMaterial({
        color: '#fed7aa',
        roughness: 0.3,
        side: THREE.DoubleSide,
      });
      const shade = new THREE.Mesh(shadeGeo, shadeMat);
      shade.position.y = 2.4;
      group.add(shade);

      const bulbGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const bulbMat = new THREE.MeshStandardMaterial({
        color: '#fef08a',
        emissive: new THREE.Color('#fef08a'),
        emissiveIntensity: 1.0,
      });
      const bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.y = 2.3;
      group.add(bulb);

      const lampLight = new THREE.PointLight('#fef08a', 2.0, 5);
      lampLight.position.y = 2.3;
      lampLight.castShadow = true;
      group.add(lampLight);
      break;
    }

    case 'crystal': {
      const pedGeo = new THREE.CylinderGeometry(0.4, 0.5, 0.5, 8);
      const ped = new THREE.Mesh(pedGeo, mat('#1e293b', 0.4, 0.5));
      ped.position.y = 0.25;
      ped.castShadow = true;
      group.add(ped);

      const cryGeo = new THREE.OctahedronGeometry(0.45, 0);
      const cryMat = new THREE.MeshStandardMaterial({
        color: '#06b6d4',
        emissive: new THREE.Color('#22d3ee'),
        emissiveIntensity: 0.8,
        roughness: 0.1,
        metalness: 0.2,
        transparent: true,
        opacity: 0.9,
      });
      const crystalMesh = new THREE.Mesh(cryGeo, cryMat);
      crystalMesh.position.y = 1.2;
      crystalMesh.name = 'floating_crystal';
      group.add(crystalMesh);

      const pointLight = new THREE.PointLight('#22d3ee', 2.5, 6);
      pointLight.position.y = 1.2;
      group.add(pointLight);
      break;
    }

    case 'bunk_bed': {
      // 1. Single hostel bunk bed (white frame, clean blue mattress)
      const frameMat = mat('#f8fafc', 0.35, 0.25); // Clean white tubular metal frame
      const mattressMat = mat('#2563eb', 0.8, 0.05); // Clean blue mattress
      const sheetMat = mat('#60a5fa', 0.85); // Folded bedsheet
      const pillowMat = mat('#ffffff', 0.95); // White pillow

      const bedLength = 3.0;
      const bedWidth = 1.5;
      const postHeight = 2.4;

      // 4 White Vertical Corner Posts
      const postGeo = new THREE.CylinderGeometry(0.045, 0.045, postHeight, 8);
      const postOffsets = [
        [-bedWidth / 2, postHeight / 2, -bedLength / 2],
        [bedWidth / 2, postHeight / 2, -bedLength / 2],
        [-bedWidth / 2, postHeight / 2, bedLength / 2],
        [bedWidth / 2, postHeight / 2, bedLength / 2],
      ];
      postOffsets.forEach(([px, py, pz]) => {
        const post = new THREE.Mesh(postGeo, frameMat);
        post.position.set(px, py, pz);
        post.castShadow = true;
        group.add(post);
      });

      // Lower Bed Rails
      const railSideGeo = new THREE.BoxGeometry(0.05, 0.1, bedLength);
      const leftRail = new THREE.Mesh(railSideGeo, frameMat);
      leftRail.position.set(-bedWidth / 2, 0.45, 0);
      leftRail.castShadow = true;
      group.add(leftRail);

      const rightRail = new THREE.Mesh(railSideGeo, frameMat);
      rightRail.position.set(bedWidth / 2, 0.45, 0);
      rightRail.castShadow = true;
      group.add(rightRail);

      const railEndGeo = new THREE.BoxGeometry(bedWidth, 0.1, 0.05);
      const headRail = new THREE.Mesh(railEndGeo, frameMat);
      headRail.position.set(0, 0.45, -bedLength / 2);
      group.add(headRail);

      const footRail = new THREE.Mesh(railEndGeo, frameMat);
      footRail.position.set(0, 0.45, bedLength / 2);
      group.add(footRail);

      // Top Safety Guardrails (Upper bunk framework)
      const topRailSideGeo = new THREE.BoxGeometry(0.04, 0.08, bedLength);
      const topLeftRail = new THREE.Mesh(topRailSideGeo, frameMat);
      topLeftRail.position.set(-bedWidth / 2, 2.1, 0);
      group.add(topLeftRail);

      const topRightRail = new THREE.Mesh(topRailSideGeo, frameMat);
      topRightRail.position.set(bedWidth / 2, 2.1, 0);
      group.add(topRightRail);

      // Top Bunk Slats
      const topSlatGeo = new THREE.BoxGeometry(bedWidth, 0.04, bedLength);
      const topSlat = new THREE.Mesh(topSlatGeo, frameMat);
      topSlat.position.set(0, 2.05, 0);
      group.add(topSlat);

      // Side Ladder (on right side)
      const rungGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.35, 6);
      rungGeo.rotateZ(Math.PI / 2);
      for (let i = 0; i < 4; i++) {
        const rung = new THREE.Mesh(rungGeo, frameMat);
        rung.position.set(bedWidth / 2 + 0.03, 0.5 + i * 0.45, 0.5);
        group.add(rung);
      }

      // Main Mattress (Clean Blue)
      const matGeo = new THREE.BoxGeometry(bedWidth - 0.1, 0.32, bedLength - 0.15);
      const mattress = new THREE.Mesh(matGeo, mattressMat);
      mattress.position.set(0, 0.62, 0);
      mattress.castShadow = true;
      mattress.receiveShadow = true;
      group.add(mattress);

      // Folded Bed Duvet / Runner (Light Blue)
      const duvetGeo = new THREE.BoxGeometry(bedWidth - 0.08, 0.34, 1.4);
      const duvet = new THREE.Mesh(duvetGeo, sheetMat);
      duvet.position.set(0, 0.64, 0.6);
      duvet.castShadow = true;
      group.add(duvet);

      // Clean White Pillow
      const pilGeo = new THREE.BoxGeometry(bedWidth - 0.3, 0.16, 0.6);
      const pillow = new THREE.Mesh(pilGeo, pillowMat);
      pillow.position.set(0, 0.85, -bedLength / 2 + 0.45);
      pillow.castShadow = true;
      group.add(pillow);

      // Pair of hostel slippers under the bed
      const slipperMat = mat('#10b981', 0.5);
      const slipperGeo = new THREE.BoxGeometry(0.18, 0.04, 0.38);
      const slip1 = new THREE.Mesh(slipperGeo, slipperMat);
      slip1.position.set(bedWidth / 2 + 0.15, 0.02, 0);
      group.add(slip1);
      const slip2 = new THREE.Mesh(slipperGeo, slipperMat);
      slip2.position.set(bedWidth / 2 + 0.15, 0.02, 0.45);
      group.add(slip2);

      break;
    }

    case 'locker': {
      // Blue Storage Locker or Cupboard
      const blueBodyMat = mat('#1d4ed8', 0.4, 0.3); // Deep university blue
      const blueDoorMat = mat('#2563eb', 0.45, 0.2); // Slightly lighter door
      const darkPlinthMat = mat('#0f172a', 0.8);
      const silverHandleMat = mat('#e2e8f0', 0.1, 0.9);

      const lockerW = 1.4;
      const lockerH = 3.2;
      const lockerD = 0.9;

      // Base Plinth
      const plinthGeo = new THREE.BoxGeometry(lockerW, 0.2, lockerD);
      const plinth = new THREE.Mesh(plinthGeo, darkPlinthMat);
      plinth.position.y = 0.1;
      plinth.castShadow = true;
      group.add(plinth);

      // Locker Body
      const bodyGeo = new THREE.BoxGeometry(lockerW, lockerH, lockerD);
      const body = new THREE.Mesh(bodyGeo, blueBodyMat);
      body.position.y = lockerH / 2 + 0.2;
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);

      // Left and Right Locker Doors
      const doorW = lockerW / 2 - 0.03;
      const doorH = lockerH - 0.15;
      const doorGeo = new THREE.BoxGeometry(doorW, doorH, 0.04);

      const leftDoor = new THREE.Mesh(doorGeo, blueDoorMat);
      leftDoor.position.set(-doorW / 2 - 0.01, lockerH / 2 + 0.2, lockerD / 2 + 0.02);
      leftDoor.castShadow = true;
      group.add(leftDoor);

      const rightDoor = new THREE.Mesh(doorGeo, blueDoorMat);
      rightDoor.position.set(doorW / 2 + 0.01, lockerH / 2 + 0.2, lockerD / 2 + 0.02);
      rightDoor.castShadow = true;
      group.add(rightDoor);

      // Handles & Keyholes
      const handleGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.25, 8);
      const leftHandle = new THREE.Mesh(handleGeo, silverHandleMat);
      leftHandle.position.set(-0.08, 1.7, lockerD / 2 + 0.06);
      group.add(leftHandle);

      const rightHandle = new THREE.Mesh(handleGeo, silverHandleMat);
      rightHandle.position.set(0.08, 1.7, lockerD / 2 + 0.06);
      group.add(rightHandle);

      // Ventilation Louvres on Doors (Horizontal slots)
      const louvreMat = mat('#1e3a8a', 0.6);
      const louvreGeo = new THREE.BoxGeometry(0.35, 0.03, 0.01);
      for (let i = 0; i < 3; i++) {
        const lLeft = new THREE.Mesh(louvreGeo, louvreMat);
        lLeft.position.set(-doorW / 2 - 0.01, 2.7 + i * 0.08, lockerD / 2 + 0.05);
        group.add(lLeft);

        const lRight = new THREE.Mesh(louvreGeo, louvreMat);
        lRight.position.set(doorW / 2 + 0.01, 2.7 + i * 0.08, lockerD / 2 + 0.05);
        group.add(lRight);
      }

      // Name Card Tag
      const tagGeo = new THREE.BoxGeometry(0.35, 0.12, 0.01);
      const tagMat = mat('#ffffff', 0.5);
      const tag = new THREE.Mesh(tagGeo, tagMat);
      tag.position.set(0, 3.1, lockerD / 2 + 0.04);
      group.add(tag);
      break;
    }

    case 'cooler': {
      // Blue Food Cooler (Insulated Coleman / Thermocool style)
      const coolerBlueMat = mat('#1d4ed8', 0.45, 0.1);
      const whiteLidMat = mat('#f8fafc', 0.35, 0.1);
      const darkAccentMat = mat('#334155', 0.4);

      const cW = 0.95;
      const cH = 0.65;
      const cD = 0.65;

      // Cooler Blue Tub Base
      const tubGeo = new THREE.BoxGeometry(cW, cH, cD);
      const tub = new THREE.Mesh(tubGeo, coolerBlueMat);
      tub.position.y = cH / 2;
      tub.castShadow = true;
      group.add(tub);

      // White Insulated Lid
      const lidGeo = new THREE.BoxGeometry(cW + 0.04, 0.14, cD + 0.04);
      const lid = new THREE.Mesh(lidGeo, whiteLidMat);
      lid.position.y = cH + 0.07;
      lid.castShadow = true;
      group.add(lid);

      // Lid Recessed Handle
      const handleG = new THREE.BoxGeometry(0.3, 0.04, 0.12);
      const lHandle = new THREE.Mesh(handleG, darkAccentMat);
      lHandle.position.set(0, cH + 0.15, 0);
      group.add(lHandle);

      // White Side Carry Handles
      const sideHandleGeo = new THREE.BoxGeometry(0.04, 0.12, 0.22);
      const sHandleL = new THREE.Mesh(sideHandleGeo, whiteLidMat);
      sHandleL.position.set(-cW / 2 - 0.02, cH * 0.7, 0);
      group.add(sHandleL);

      const sHandleR = new THREE.Mesh(sideHandleGeo, whiteLidMat);
      sHandleR.position.set(cW / 2 + 0.02, cH * 0.7, 0);
      group.add(sHandleR);

      // White LU emblem print on cooler front
      const emblemGeo = new THREE.BoxGeometry(0.25, 0.15, 0.01);
      const emblem = new THREE.Mesh(emblemGeo, whiteLidMat);
      emblem.position.set(0, cH * 0.5, cD / 2 + 0.01);
      group.add(emblem);

      break;
    }

    case 'water_gallon': {
      // Utility & Food Corner: Bucket and a stack of gallons/bottles
      const yellowBucketMat = mat('#eab308', 0.5); // Yellow Nigerian student plastic bucket
      const wireMat = mat('#94a3b8', 0.2, 0.8);
      const kegYellowMat = mat('#facc15', 0.6); // 25L Jerrycan Yellow
      const kegWhiteMat = mat('#f8fafc', 0.6);  // 25L Jerrycan White
      const waterBlueMat = new THREE.MeshStandardMaterial({
        color: '#0284c7',
        roughness: 0.1,
        metalness: 0.1,
        transparent: true,
        opacity: 0.75,
      });

      // 1. Student Yellow Plastic Bucket
      const bucketGeo = new THREE.CylinderGeometry(0.36, 0.28, 0.65, 16);
      const bucket = new THREE.Mesh(bucketGeo, yellowBucketMat);
      bucket.position.set(-0.45, 0.325, 0.25);
      bucket.castShadow = true;
      group.add(bucket);

      // Bucket Wire Handle
      const bailGeo = new THREE.TorusGeometry(0.37, 0.02, 6, 16, Math.PI);
      const bail = new THREE.Mesh(bailGeo, wireMat);
      bail.rotation.z = Math.PI / 2;
      bail.position.set(-0.45, 0.68, 0.25);
      group.add(bail);

      // 2. Stack of 25L Jerrycans (Yellow & White)
      const kegGeo = new THREE.BoxGeometry(0.42, 0.62, 0.32);
      const capGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.08, 12);
      const redCapMat = mat('#dc2626', 0.4);

      // Jerrycan 1 (Bottom Yellow)
      const keg1 = new THREE.Mesh(kegGeo, kegYellowMat);
      keg1.position.set(0.32, 0.31, -0.2);
      keg1.castShadow = true;
      group.add(keg1);

      const cap1 = new THREE.Mesh(capGeo, redCapMat);
      cap1.position.set(0.32, 0.66, -0.2);
      group.add(cap1);

      // Jerrycan 2 (Beside / Stacked White)
      const keg2 = new THREE.Mesh(kegGeo, kegWhiteMat);
      keg2.position.set(-0.18, 0.31, -0.32);
      keg2.castShadow = true;
      group.add(keg2);

      const cap2 = new THREE.Mesh(capGeo, mat('#2563eb', 0.4));
      cap2.position.set(-0.18, 0.66, -0.32);
      group.add(cap2);

      // 3. 19L Blue Transparent Water Dispenser Bottle
      const bottleBaseGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.65, 16);
      const bottle = new THREE.Mesh(bottleBaseGeo, waterBlueMat);
      bottle.position.set(0.35, 0.325, 0.3);
      bottle.castShadow = true;
      group.add(bottle);

      const neckGeo = new THREE.CylinderGeometry(0.08, 0.16, 0.18, 16);
      const neck = new THREE.Mesh(neckGeo, waterBlueMat);
      neck.position.set(0.35, 0.73, 0.3);
      group.add(neck);

      const bCapGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.06, 12);
      const bCap = new THREE.Mesh(bCapGeo, mat('#ffffff'));
      bCap.position.set(0.35, 0.84, 0.3);
      group.add(bCap);

      break;
    }

    case 'waste_bin': {
      // Plastic waste bin
      const binMat = mat('#475569', 0.6); // Slate grey plastic
      const binGeo = new THREE.CylinderGeometry(0.26, 0.2, 0.55, 14);
      const bin = new THREE.Mesh(binGeo, binMat);
      bin.position.y = 0.275;
      bin.castShadow = true;
      group.add(bin);

      // Rim ring
      const rimGeo = new THREE.TorusGeometry(0.26, 0.02, 6, 14);
      rimGeo.rotateX(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, binMat);
      rim.position.y = 0.55;
      group.add(rim);

      // Crumpled paper inside
      const paperGeo = new THREE.DodecahedronGeometry(0.07);
      const paperMat = mat('#ffffff', 0.9);
      const p1 = new THREE.Mesh(paperGeo, paperMat);
      p1.position.set(0.04, 0.45, 0.02);
      group.add(p1);

      const p2 = new THREE.Mesh(paperGeo, paperMat);
      p2.position.set(-0.05, 0.48, -0.04);
      group.add(p2);

      break;
    }

    case 'fan': {
      // Small Desk Electric Fan
      const baseMat = mat('#0f172a', 0.4, 0.3);
      const fanBodyMat = mat('#e2e8f0', 0.3, 0.4);
      const bladeMat = mat('#38bdf8', 0.3);

      // Circular weighted desk base
      const fBaseGeo = new THREE.CylinderGeometry(0.22, 0.24, 0.06, 16);
      const fBase = new THREE.Mesh(fBaseGeo, baseMat);
      fBase.position.y = 0.03;
      fBase.castShadow = true;
      group.add(fBase);

      // Push button controls on base
      const btnGeo = new THREE.BoxGeometry(0.03, 0.03, 0.08);
      const btn1 = new THREE.Mesh(btnGeo, mat('#ef4444'));
      btn1.position.set(-0.06, 0.07, 0.1);
      group.add(btn1);

      const btn2 = new THREE.Mesh(btnGeo, mat('#22c55e'));
      btn2.position.set(0.04, 0.07, 0.1);
      group.add(btn2);

      // Upright stem
      const stemGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.45, 8);
      const stem = new THREE.Mesh(stemGeo, fanBodyMat);
      stem.position.y = 0.28;
      group.add(stem);

      // Motor head
      const motorGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.18, 12);
      motorGeo.rotateX(Math.PI / 2);
      const motor = new THREE.Mesh(motorGeo, fanBodyMat);
      motor.position.set(0, 0.52, -0.06);
      group.add(motor);

      // Fan Cage / Grill (Torus outline)
      const cageGeo = new THREE.TorusGeometry(0.25, 0.015, 6, 20);
      const cage = new THREE.Mesh(cageGeo, fanBodyMat);
      cage.position.set(0, 0.52, 0.06);
      group.add(cage);

      // Fan Blades (3 blades inside cage)
      for (let b = 0; b < 3; b++) {
        const bladeGeo = new THREE.BoxGeometry(0.08, 0.22, 0.015);
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.position.set(0, 0.52, 0.06);
        blade.rotation.z = (b * (2 * Math.PI)) / 3;
        group.add(blade);
      }

      break;
    }

    case 'laptop_and_books': {
      // Personal Touches: A stack of textbooks and a laptop on the desk
      const laptopMat = mat('#1e293b', 0.2, 0.8);
      const screenMat = new THREE.MeshStandardMaterial({
        color: '#0284c7',
        emissive: new THREE.Color('#38bdf8'),
        emissiveIntensity: 0.8,
        roughness: 0.1,
      });

      // 1. Open Laptop
      const lapBaseGeo = new THREE.BoxGeometry(0.65, 0.03, 0.45);
      const lapBase = new THREE.Mesh(lapBaseGeo, laptopMat);
      lapBase.position.set(-0.35, 0.015, 0);
      lapBase.castShadow = true;
      group.add(lapBase);

      const keyGeo = new THREE.BoxGeometry(0.55, 0.005, 0.25);
      const keyMesh = new THREE.Mesh(keyGeo, mat('#090d16', 0.8));
      keyMesh.position.set(-0.35, 0.035, -0.04);
      group.add(keyMesh);

      const screenLidGeo = new THREE.BoxGeometry(0.65, 0.45, 0.025);
      const screenLid = new THREE.Mesh(screenLidGeo, laptopMat);
      screenLid.position.set(-0.35, 0.22, -0.22);
      screenLid.rotation.x = -0.25;
      screenLid.castShadow = true;
      group.add(screenLid);

      const displayGeo = new THREE.BoxGeometry(0.58, 0.38, 0.005);
      const display = new THREE.Mesh(displayGeo, screenMat);
      display.position.set(-0.35, 0.22, -0.205);
      display.rotation.x = -0.25;
      group.add(display);

      // 2. Stack of University Textbooks
      const bookColors = ['#dc2626', '#2563eb', '#16a34a'];
      const pageMat = mat('#ffffff', 0.9);

      for (let i = 0; i < 3; i++) {
        const coverMat = mat(bookColors[i], 0.7);
        const bW = 0.48 - i * 0.02;
        const bD = 0.62 - i * 0.02;
        const bH = 0.09;
        const yPos = 0.045 + i * 0.1;

        const bookCoverGeo = new THREE.BoxGeometry(bW, bH, bD);
        const bookCover = new THREE.Mesh(bookCoverGeo, coverMat);
        bookCover.position.set(0.42, yPos, 0.02 + i * 0.02);
        bookCover.rotation.y = 0.1 * i;
        bookCover.castShadow = true;
        group.add(bookCover);

        const pageGeo = new THREE.BoxGeometry(bW - 0.03, bH - 0.02, bD - 0.03);
        const pages = new THREE.Mesh(pageGeo, pageMat);
        pages.position.set(0.425, yPos, 0.025 + i * 0.02);
        pages.rotation.y = 0.1 * i;
        group.add(pages);
      }

      break;
    }

    case 'pew': {
      // ✝️ Chapel Mahogany Pew Bench
      const pewWood = mat('#78350f', 0.6, 0.05); // Polished mahogany
      const kneelerMat = mat('#991b1b', 0.8); // Burgundy kneeler cushion

      // Seat Bench
      const seat = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.1, 0.65), pewWood);
      seat.position.set(0, 0.52, 0);
      seat.castShadow = true;
      group.add(seat);

      // Angled Backrest
      const back = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.72, 0.09), pewWood);
      back.position.set(0, 0.88, -0.28);
      back.rotation.x = 0.1;
      back.castShadow = true;
      group.add(back);

      // Hymnal / Bible Book Rack on Back
      const rack = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.16, 0.08), pewWood);
      rack.position.set(0, 0.76, -0.36);
      group.add(rack);

      // 3 Hymn Books in Rack
      [-1.0, 0, 1.0].forEach((bx, idx) => {
        const book = new THREE.Mesh(
          new THREE.BoxGeometry(0.35, 0.18, 0.06),
          mat(idx === 1 ? '#dc2626' : '#1e3a8a', 0.7)
        );
        book.position.set(bx, 0.82, -0.36);
        group.add(book);
      });

      // Carved Side End-Panels
      [-1.8, 1.8].forEach((px) => {
        const sidePanel = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.15, 0.75), pewWood);
        sidePanel.position.set(px, 0.58, -0.05);
        sidePanel.castShadow = true;
        group.add(sidePanel);
      });

      // Lower Fold-Down Padded Kneeler
      const kneeler = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.08, 0.22), kneelerMat);
      kneeler.position.set(0, 0.14, 0.38);
      kneeler.castShadow = true;
      group.add(kneeler);
      break;
    }

    case 'pulpit': {
      // ✝️ Chapel Altar Preacher Pulpit
      const oakMat = mat('#451a03', 0.5, 0.05);
      const goldMat = new THREE.MeshStandardMaterial({
        color: '#facc15',
        metalness: 0.85,
        roughness: 0.2,
      });

      // Stepped Foundation Plinth
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.16, 1.3), oakMat);
      base.position.y = 0.08;
      base.castShadow = true;
      group.add(base);

      // Main Podium Column
      const column = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.3, 0.95), oakMat);
      column.position.y = 0.8;
      column.castShadow = true;
      group.add(column);

      // Front Golden Cross Inlay
      const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 0.04), goldMat);
      crossV.position.set(0, 0.9, 0.5);
      group.add(crossV);

      const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.04), goldMat);
      crossH.position.set(0, 1.05, 0.5);
      group.add(crossH);

      // Slanted Top Reading Desk
      const topDesk = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.1, 1.05), oakMat);
      topDesk.position.set(0, 1.5, 0.02);
      topDesk.rotation.x = 0.18;
      topDesk.castShadow = true;
      group.add(topDesk);

      // Velvet Red Preacher Runner Cloth
      const cloth = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 0.02), mat('#b91c1c', 0.8));
      cloth.position.set(0, 1.32, 0.51);
      group.add(cloth);

      // Gooseneck Stage Microphone
      const micPole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35, 8), mat('#0f172a', 0.2, 0.9));
      micPole.position.set(0.4, 1.68, 0.1);
      micPole.rotation.z = -0.3;
      group.add(micPole);

      const micHead = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), mat('#cbd5e1', 0.2, 0.8));
      micHead.position.set(0.32, 1.82, 0.1);
      group.add(micHead);
      break;
    }

    case 'altar_keyboard': {
      // 🎹 Chapel Altar Synthesizer & Sound Setup
      const darkMetal = mat('#1e293b', 0.3, 0.7);

      // Metal X-Stand Legs
      [-0.65, 0.65].forEach((sx) => {
        const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.95, 8), darkMetal);
        leg1.position.set(sx, 0.45, 0);
        leg1.rotation.z = 0.4;
        group.add(leg1);

        const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.95, 8), darkMetal);
        leg2.position.set(sx, 0.45, 0);
        leg2.rotation.z = -0.4;
        group.add(leg2);
      });

      // Keyboard Synthesizer Body
      const synthBody = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.14, 0.55), darkMetal);
      synthBody.position.set(0, 0.9, 0);
      synthBody.castShadow = true;
      group.add(synthBody);

      // White Piano Keys
      const keysWhite = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.04, 0.3), mat('#ffffff', 0.2));
      keysWhite.position.set(0, 0.97, 0.1);
      group.add(keysWhite);

      // Black Piano Keys
      const keysBlack = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 0.18), mat('#0f172a', 0.4));
      keysBlack.position.set(0, 0.99, 0.04);
      group.add(keysBlack);

      // Glowing LED Screen on Keyboard
      const synthScreen = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.02, 0.12),
        new THREE.MeshStandardMaterial({
          color: '#38bdf8',
          emissive: new THREE.Color('#0284c7'),
          emissiveIntensity: 0.8,
        })
      );
      synthScreen.position.set(0, 0.98, -0.15);
      group.add(synthScreen);

      // Singer Microphone on Boom Stand
      const micStand = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.6, 8), darkMetal);
      micStand.position.set(-1.1, 0.8, 0.2);
      group.add(micStand);

      const boomArm = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.65, 8), darkMetal);
      boomArm.position.set(-0.95, 1.55, 0.1);
      boomArm.rotation.z = -0.6;
      group.add(boomArm);

      // Stage Audio Amp Speakers
      [-1.3, 1.3].forEach((spx) => {
        const amp = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.7, 0.4), mat('#0f172a', 0.6));
        amp.position.set(spx, 0.35, -0.35);
        amp.castShadow = true;
        group.add(amp);

        const grille = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.58, 0.02), mat('#334155', 0.9));
        grille.position.set(spx, 0.35, -0.14);
        group.add(grille);
      });
      break;
    }

    case 'bible_stand': {
      // 📖 Devotional Holy Bible Altar Stand
      const brassMat = new THREE.MeshStandardMaterial({
        color: '#facc15',
        metalness: 0.8,
        roughness: 0.25,
      });

      // Tripod Base & Stem
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 1.25, 8), brassMat);
      stem.position.y = 0.62;
      stem.castShadow = true;
      group.add(stem);

      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.08, 12), brassMat);
      foot.position.y = 0.04;
      group.add(foot);

      // Slanted Brass Book Tray
      const tray = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.05, 0.7), brassMat);
      tray.position.set(0, 1.28, 0);
      tray.rotation.x = 0.25;
      group.add(tray);

      // Large Open Holy Bible Pages
      const leftPage = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 0.55), mat('#ffffff', 0.8));
      leftPage.position.set(-0.21, 1.32, 0);
      leftPage.rotation.x = 0.25;
      leftPage.rotation.z = -0.06;
      group.add(leftPage);

      const rightPage = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 0.55), mat('#ffffff', 0.8));
      rightPage.position.set(0.21, 1.32, 0);
      rightPage.rotation.x = 0.25;
      rightPage.rotation.z = 0.06;
      group.add(rightPage);

      // Red Silk Bookmark Ribbon
      const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 0.45), mat('#dc2626', 0.7));
      ribbon.position.set(0, 1.34, 0.05);
      ribbon.rotation.x = 0.25;
      group.add(ribbon);
      break;
    }

    case 'prayer_rug': {
      // 🕌 Ornate Emerald & Gold Islamic Prayer Carpet
      // Velvet Carpet Base
      const rug = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 0.03, 2.2),
        new THREE.MeshStandardMaterial({
          color: '#047857', // Deep Emerald Green
          roughness: 0.85,
        })
      );
      rug.position.y = 0.015;
      rug.receiveShadow = true;
      group.add(rug);

      // Gold Arabesque Outer Border
      const goldTrimMat = new THREE.MeshStandardMaterial({
        color: '#facc15',
        roughness: 0.3,
        metalness: 0.7,
      });

      const borderT = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.035, 0.06), goldTrimMat);
      borderT.position.set(0, 0.018, -1.02);
      group.add(borderT);

      const borderB = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.035, 0.06), goldTrimMat);
      borderB.position.set(0, 0.018, 1.02);
      group.add(borderB);

      // 3 Mihrab Arch Silhouettes (facing Qiblah)
      [-1.1, 0, 1.1].forEach((rx) => {
        const archTop = new THREE.Mesh(
          new THREE.TorusGeometry(0.28, 0.025, 8, 16, Math.PI),
          goldTrimMat
        );
        archTop.rotation.x = -Math.PI / 2;
        archTop.position.set(rx, 0.02, -0.6);
        group.add(archTop);

        const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.9), goldTrimMat);
        sideL.position.set(rx - 0.28, 0.02, -0.15);
        group.add(sideL);

        const sideR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.9), goldTrimMat);
        sideR.position.set(rx + 0.28, 0.02, -0.15);
        group.add(sideR);
      });
      break;
    }

    case 'minbar': {
      // 🕌 Traditional 3-Step Wooden Minbar Pulpit
      const woodMat = mat('#78350f', 0.5, 0.05); // Polished Cedar

      // Step 1
      const s1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 0.65), woodMat);
      s1.position.set(0, 0.125, 0.65);
      s1.castShadow = true;
      group.add(s1);

      // Step 2
      const s2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 0.65), woodMat);
      s2.position.set(0, 0.25, 0);
      s2.castShadow = true;
      group.add(s2);

      // Step 3 (Top Platform)
      const s3 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.75, 0.8), woodMat);
      s3.position.set(0, 0.375, -0.7);
      s3.castShadow = true;
      group.add(s3);

      // Imam Preacher Seat
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.35, 0.5), woodMat);
      seat.position.set(0, 0.92, -0.7);
      group.add(seat);

      // Side Balustrade Railings
      [-0.58, 0.58].forEach((rx) => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, 2.0), woodMat);
        rail.position.set(rx, 0.75, 0);
        rail.castShadow = true;
        group.add(rail);
      });

      // Arched Wooden Canopy Crown
      const canopy = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.5, 4), woodMat);
      canopy.position.set(0, 1.8, -0.7);
      canopy.rotation.y = Math.PI / 4;
      group.add(canopy);
      break;
    }

    case 'mihrab': {
      // 🕌 Wall Qiblah Prayer Mihrab Alcove
      const marbleMat = mat('#f8fafc', 0.2);
      const emeraldMat = new THREE.MeshStandardMaterial({
        color: '#065f46',
        emissive: new THREE.Color('#047857'),
        emissiveIntensity: 0.3,
        roughness: 0.3,
      });

      // Recessed Wall Alcove
      const alcove = new THREE.Mesh(new THREE.BoxGeometry(2.4, 4.2, 0.6), emeraldMat);
      alcove.position.set(0, 2.1, 0);
      alcove.receiveShadow = true;
      group.add(alcove);

      // Outer Marble Pillars
      [-1.15, 1.15].forEach((px) => {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 4.2, 12), marbleMat);
        pillar.position.set(px, 2.1, 0.25);
        pillar.castShadow = true;
        group.add(pillar);
      });

      // Horseshoe Arch Crown
      const arch = new THREE.Mesh(
        new THREE.TorusGeometry(1.15, 0.16, 12, 24, Math.PI),
        marbleMat
      );
      arch.position.set(0, 4.1, 0.25);
      group.add(arch);

      // Hanging Brass Sanctuary Lamp
      const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.2, 6), mat('#facc15', 0.3, 0.8));
      chain.position.set(0, 3.2, 0);
      group.add(chain);

      const lamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 12, 12),
        new THREE.MeshStandardMaterial({
          color: '#fef08a',
          emissive: new THREE.Color('#facc15'),
          emissiveIntensity: 0.9,
        })
      );
      lamp.position.set(0, 2.5, 0);
      group.add(lamp);
      break;
    }

    case 'ablution_fountain': {
      // 💧 Entrance Wudu Ablution Fountain
      const stoneMat = mat('#e2e8f0', 0.4);
      const waterMat = new THREE.MeshStandardMaterial({
        color: '#38bdf8',
        emissive: new THREE.Color('#0284c7'),
        emissiveIntensity: 0.4,
        roughness: 0.1,
      });

      // Basin Pool
      const basin = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 0.45, 16), stoneMat);
      basin.position.y = 0.225;
      basin.castShadow = true;
      group.add(basin);

      // Water Surface
      const pool = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.04, 16), waterMat);
      pool.position.y = 0.42;
      group.add(pool);

      // Central Spout Pillar
      const centralSpout = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 1.1, 12), stoneMat);
      centralSpout.position.y = 0.8;
      group.add(centralSpout);

      // 4 Water Faucets / Spigots
      [0, Math.PI / 2, Math.PI, -Math.PI / 2].forEach((rot) => {
        const faucet = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.25), mat('#cbd5e1', 0.2, 0.9));
        faucet.position.set(Math.sin(rot) * 0.35, 0.85, Math.cos(rot) * 0.35);
        faucet.rotation.y = rot;
        group.add(faucet);
      });

      // 4 Low Stone Stools around fountain
      [
        [-1.6, 0], [1.6, 0], [0, -1.6], [0, 1.6]
      ].forEach(([sx, sz]) => {
        const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.28, 0.3, 12), stoneMat);
        stool.position.set(sx, 0.15, sz);
        stool.castShadow = true;
        group.add(stool);
      });
      break;
    }

    case 'shoe_rack': {
      // 👟 Entrance Shoe Rack (Mosque Norm)
      const woodMat = mat('#451a03', 0.6);

      // 2 Shelves
      const shelf1 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.06, 0.55), woodMat);
      shelf1.position.set(0, 0.1, 0);
      group.add(shelf1);

      const shelf2 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.06, 0.55), woodMat);
      shelf2.position.set(0, 0.45, 0);
      group.add(shelf2);

      // Side supports
      [-0.88, 0.88].forEach((sx) => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.75, 0.55), woodMat);
        post.position.set(sx, 0.375, 0);
        group.add(post);
      });

      // 4 Pairs of Removed Student Shoes
      const shoeColors = ['#ffffff', '#0f172a', '#b45309', '#2563eb'];
      [-0.5, 0.5].forEach((sx, idx) => {
        // Shelf 1 shoes
        const shoe1 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.38), mat(shoeColors[idx], 0.7));
        shoe1.position.set(sx - 0.1, 0.18, 0);
        group.add(shoe1);

        const shoe2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.38), mat(shoeColors[idx], 0.7));
        shoe2.position.set(sx + 0.1, 0.18, 0);
        group.add(shoe2);

        // Shelf 2 shoes
        const shoe3 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.38), mat(shoeColors[idx + 2], 0.7));
        shoe3.position.set(sx - 0.1, 0.53, 0);
        group.add(shoe3);

        const shoe4 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.38), mat(shoeColors[idx + 2], 0.7));
        shoe4.position.set(sx + 0.1, 0.53, 0);
        group.add(shoe4);
      });
      break;
    }
  }

  return group;
}
