import * as THREE from 'three';
import type { CharacterCustomization } from '../types/game';

// Procedural Ankara African Wax Print Texture Generator
function createAnkaraTexture(baseColorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = baseColorHex;
    ctx.fillRect(0, 0, 128, 128);

    // Traditional Ankara diamond & sunburst pattern
    ctx.strokeStyle = '#facc15'; // Gold accent
    ctx.lineWidth = 3.5;
    ctx.fillStyle = '#0284c7'; // Cyan/Teal accent

    for (let x = 0; x < 128; x += 32) {
      for (let y = 0; y < 128; y += 32) {
        ctx.beginPath();
        ctx.moveTo(x + 16, y);
        ctx.lineTo(x + 32, y + 16);
        ctx.lineTo(x + 16, y + 32);
        ctx.lineTo(x, y + 16);
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x + 16, y + 16, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Contrasting dot
        ctx.fillStyle = '#dc2626'; // Red dot
        ctx.fillRect(x + 14, y + 14, 4, 4);
        ctx.fillStyle = '#0284c7';
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

// Procedural Striped Shirt Texture
function createStripedTexture(baseColorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = baseColorHex;
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = '#ffffff';
    for (let y = 0; y < 64; y += 16) {
      ctx.fillRect(0, y, 64, 6);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 3);
  return texture;
}

// Procedural Pastor Clerical Vestment Robe Texture
function createPastorVestmentTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#0f172a'; // Jet black cassock
    ctx.fillRect(0, 0, 128, 128);

    // Royal Purple & Gold Liturgical Stole
    ctx.fillStyle = '#7e22ce';
    ctx.fillRect(36, 0, 18, 128);
    ctx.fillRect(74, 0, 18, 128);

    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.strokeRect(36, 0, 18, 128);
    ctx.strokeRect(74, 0, 18, 128);

    ctx.fillStyle = '#facc15';
    [45, 83].forEach((cx) => {
      ctx.fillRect(cx - 2, 90, 4, 18);
      ctx.fillRect(cx - 6, 96, 12, 4);
    });
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Procedural Arabian/Nigerian Jalabiya Robe Texture
function createJalabiyaTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#f8fafc'; // Pure white kaftan
    ctx.fillRect(0, 0, 128, 128);

    ctx.fillStyle = '#facc15'; // Gold chest embroidery placket
    ctx.fillRect(56, 10, 16, 70);

    ctx.fillStyle = '#059669'; // Emerald jewel dots
    for (let y = 16; y < 75; y += 12) {
      ctx.beginPath();
      ctx.arc(64, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#eab308';
    ctx.fillRect(0, 120, 128, 8);
    ctx.fillRect(0, 0, 12, 128);
    ctx.fillRect(116, 0, 12, 128);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export const DEFAULT_CHARACTER_CONFIG: CharacterCustomization = {
  skinTone: '#6d4527',
  shirtColor: '#16a34a',
  shirtPattern: 'ankara',
  pantsColor: '#1e293b',
  shoesColor: '#ffffff',
  hairStyle: 'fade',
  hairColor: '#18181b',
  accessory: 'crown',
};

export function sanitizeCustomization(cfg?: Partial<CharacterCustomization> | null): CharacterCustomization {
  return {
    skinTone: cfg?.skinTone || DEFAULT_CHARACTER_CONFIG.skinTone,
    shirtColor: cfg?.shirtColor || DEFAULT_CHARACTER_CONFIG.shirtColor,
    shirtPattern: cfg?.shirtPattern || DEFAULT_CHARACTER_CONFIG.shirtPattern,
    pantsColor: cfg?.pantsColor || DEFAULT_CHARACTER_CONFIG.pantsColor,
    shoesColor: cfg?.shoesColor || DEFAULT_CHARACTER_CONFIG.shoesColor,
    hairStyle: cfg?.hairStyle || DEFAULT_CHARACTER_CONFIG.hairStyle,
    hairColor: cfg?.hairColor || DEFAULT_CHARACTER_CONFIG.hairColor,
    accessory: cfg?.accessory || DEFAULT_CHARACTER_CONFIG.accessory,
  };
}

export interface CharacterModelInstance {
  group: THREE.Group;
  update: (delta: number, elapsed: number) => void;
  updateConfig: (newConfig?: Partial<CharacterCustomization> | null) => void;
  setWalking: (walking: boolean) => void;
}

/**
 * Creates a stylized low-poly humanoid character with customizable
 * skin tone, shirt/patterns, pants, shoes, hair styles, and floating accessories.
 */
export function createCharacterModel(initialConfig?: Partial<CharacterCustomization> | null): CharacterModelInstance {
  const root = new THREE.Group();
  // Scale down character mesh by 35% so student fits cleanly inside hostel rooms and campus walkways
  root.scale.set(0.65, 0.65, 0.65);

  let currentConfig = sanitizeCustomization(initialConfig);
  let isWalking = false;
  let walkPhase = 0;

  // Inner body group that handles idle breathing & bobbing animation
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  // References to dynamic parts for animation
  let crownMesh: THREE.Group | null = null;
  let leftArmGroup: THREE.Group | null = null;
  let rightArmGroup: THREE.Group | null = null;
  let leftLegGroup: THREE.Group | null = null;
  let rightLegGroup: THREE.Group | null = null;

  const mat = (color?: string | number, roughness = 0.5, metalness = 0.05) =>
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(color || '#6d4527'),
      roughness,
      metalness,
    });

  // Function to build / rebuild the character mesh hierarchy
  function buildCharacter(rawCfg?: Partial<CharacterCustomization> | null) {
    const cfg = sanitizeCustomization(rawCfg);

    // Clear existing body children
    while (bodyGroup.children.length > 0) {
      bodyGroup.remove(bodyGroup.children[0]);
    }
    crownMesh = null;

    const skinMat = mat(cfg.skinTone, 0.7, 0.0);
    const pantsMat = mat(cfg.pantsColor, 0.6, 0.05);
    const shoesMat = mat(cfg.shoesColor, 0.4, 0.1);
    const whiteSoleMat = mat('#ffffff', 0.3);
    const hairMat = mat(cfg.hairColor, 0.85);

    // Shirt material with pattern support
    let shirtMat: THREE.Material;
    if (cfg.shirtPattern === 'ankara') {
      const tex = createAnkaraTexture(cfg.shirtColor);
      shirtMat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.6,
        metalness: 0.05,
      });
    } else if (cfg.shirtPattern === 'stripes') {
      const tex = createStripedTexture(cfg.shirtColor);
      shirtMat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.6,
        metalness: 0.05,
      });
    } else if (cfg.shirtPattern === 'pastor_vestment') {
      const tex = createPastorVestmentTexture();
      shirtMat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.5,
        metalness: 0.1,
      });
    } else if (cfg.shirtPattern === 'jalabiya_robe') {
      const tex = createJalabiyaTexture();
      shirtMat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.6,
        metalness: 0.05,
      });
    } else {
      shirtMat = mat(cfg.shirtColor, 0.55, 0.05);
    }

    // 1 & 2. Legs, Shoes & Feet attached to Hip Pivots (Slender Cylindrical Proportions)
    const legGeo = new THREE.CylinderGeometry(0.105, 0.085, 0.82, 14);
    const shoeGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.42, 14);
    const soleGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.44, 14);

    // Left Leg Group
    const lLegPivot = new THREE.Group();
    lLegPivot.position.set(-0.20, 1.0, 0);
    leftLegGroup = lLegPivot;

    const leftLeg = new THREE.Mesh(legGeo, pantsMat);
    leftLeg.position.set(0, -0.42, 0);
    leftLeg.castShadow = true;
    lLegPivot.add(leftLeg);

    const leftShoe = new THREE.Mesh(shoeGeo, shoesMat);
    leftShoe.rotation.x = Math.PI / 2;
    leftShoe.scale.set(1.0, 0.8, 0.65);
    leftShoe.position.set(0, -0.88, 0.07);
    leftShoe.castShadow = true;
    lLegPivot.add(leftShoe);

    const leftSole = new THREE.Mesh(soleGeo, whiteSoleMat);
    leftSole.rotation.x = Math.PI / 2;
    leftSole.scale.set(1.02, 0.82, 0.25);
    leftSole.position.set(0, -0.95, 0.07);
    lLegPivot.add(leftSole);

    bodyGroup.add(lLegPivot);

    // Right Leg Group
    const rLegPivot = new THREE.Group();
    rLegPivot.position.set(0.20, 1.0, 0);
    rightLegGroup = rLegPivot;

    const rightLeg = new THREE.Mesh(legGeo, pantsMat);
    rightLeg.position.set(0, -0.42, 0);
    rightLeg.castShadow = true;
    rLegPivot.add(rightLeg);

    const rightShoe = new THREE.Mesh(shoeGeo, shoesMat);
    rightShoe.rotation.x = Math.PI / 2;
    rightShoe.scale.set(1.0, 0.8, 0.65);
    rightShoe.position.set(0, -0.88, 0.07);
    rightShoe.castShadow = true;
    rLegPivot.add(rightShoe);

    const rightSole = new THREE.Mesh(soleGeo, whiteSoleMat);
    rightSole.rotation.x = Math.PI / 2;
    rightSole.scale.set(1.02, 0.82, 0.25);
    rightSole.position.set(0, -0.95, 0.07);
    rLegPivot.add(rightSole);

    bodyGroup.add(rLegPivot);

    // Pelvis / Hips (Smooth Tapered Contours)
    const hipGeo = new THREE.CylinderGeometry(0.30, 0.26, 0.22, 18);
    const hip = new THREE.Mesh(hipGeo, pantsMat);
    hip.scale.set(1.18, 1.0, 0.72);
    hip.position.set(0, 1.05, 0);
    hip.castShadow = true;
    bodyGroup.add(hip);

    // Belt & Gold Buckle
    const beltGeo = new THREE.CylinderGeometry(0.31, 0.30, 0.06, 18);
    const belt = new THREE.Mesh(beltGeo, mat('#1e293b', 0.4));
    belt.scale.set(1.19, 1.0, 0.73);
    belt.position.set(0, 1.13, 0);
    bodyGroup.add(belt);

    const buckleGeo = new THREE.BoxGeometry(0.10, 0.07, 0.03);
    const buckle = new THREE.Mesh(buckleGeo, mat('#facc15', 0.2, 0.8));
    buckle.position.set(0, 1.13, 0.21);
    bodyGroup.add(buckle);

    // 3. Torso / Shirt (Tapered Collegiate Cylinder)
    const torsoGeo = new THREE.CylinderGeometry(0.34, 0.29, 0.94, 18);
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.scale.set(1.22, 1.0, 0.68);
    torso.position.set(0, 1.63, 0);
    torso.castShadow = true;
    torso.receiveShadow = true;
    bodyGroup.add(torso);

    // Flowing lower robe extension for Jalabiya or Pastor Cassock
    if (cfg.shirtPattern === 'jalabiya_robe' || cfg.shirtPattern === 'pastor_vestment') {
      const robeLowerGeo = new THREE.CylinderGeometry(0.31, 0.40, 0.64, 18);
      const robeLower = new THREE.Mesh(robeLowerGeo, shirtMat);
      robeLower.scale.set(1.2, 1.0, 0.72);
      robeLower.position.set(0, 0.88, 0);
      robeLower.castShadow = true;
      bodyGroup.add(robeLower);
    }

    // Clean Shirt Collar
    const collarGeo = new THREE.CylinderGeometry(0.18, 0.20, 0.08, 16);
    const collar = new THREE.Mesh(collarGeo, mat('#f8fafc', 0.4));
    collar.scale.set(1.15, 1.0, 0.85);
    collar.position.set(0, 2.08, 0);
    bodyGroup.add(collar);

    // 4. Arms & Hands (Slender Cylindrical Joints)
    const sleeveGeo = new THREE.CylinderGeometry(0.10, 0.09, 0.36, 14);
    const forearmGeo = new THREE.CylinderGeometry(0.075, 0.065, 0.38, 14);
    const handGeo = new THREE.SphereGeometry(0.075, 12, 10);

    // Left Arm Hierarchy
    const lArm = new THREE.Group();
    lArm.position.set(-0.44, 1.95, 0);
    leftArmGroup = lArm;

    const lSleeve = new THREE.Mesh(sleeveGeo, shirtMat);
    lSleeve.position.set(0, -0.18, 0);
    lSleeve.castShadow = true;
    lArm.add(lSleeve);

    const lForearm = new THREE.Mesh(forearmGeo, skinMat);
    lForearm.position.set(0, -0.50, 0);
    lForearm.castShadow = true;
    lArm.add(lForearm);

    const lHand = new THREE.Mesh(handGeo, skinMat);
    lHand.scale.set(0.85, 1.1, 0.9);
    lHand.position.set(0, -0.72, 0);
    lHand.castShadow = true;
    lArm.add(lHand);

    bodyGroup.add(lArm);

    // Right Arm Hierarchy
    const rArm = new THREE.Group();
    rArm.position.set(0.44, 1.95, 0);
    rightArmGroup = rArm;

    const rSleeve = new THREE.Mesh(sleeveGeo, shirtMat);
    rSleeve.position.set(0, -0.18, 0);
    rSleeve.castShadow = true;
    rArm.add(rSleeve);

    const rForearm = new THREE.Mesh(forearmGeo, skinMat);
    rForearm.position.set(0, -0.50, 0);
    rForearm.castShadow = true;
    rArm.add(rForearm);

    const rHand = new THREE.Mesh(handGeo, skinMat);
    rHand.scale.set(0.85, 1.1, 0.9);
    rHand.position.set(0, -0.72, 0);
    rHand.castShadow = true;
    rArm.add(rHand);

    bodyGroup.add(rArm);

    // 5. Neck - Smooth slender cylinder
    const neckGeo = new THREE.CylinderGeometry(0.11, 0.13, 0.22, 16);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.set(0, 2.15, 0);
    bodyGroup.add(neck);

    // 6. Head & Stylized Facial Features (Streamlined Humanoid Sphere)
    const headGeo = new THREE.SphereGeometry(0.38, 24, 20);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.scale.set(1.0, 1.08, 0.98);
    head.position.set(0, 2.58, 0);
    head.castShadow = true;
    bodyGroup.add(head);

    // Stylized Cute Eyes
    const eyeMat = mat('#0f172a', 0.2);
    const eyeHighlightMat = mat('#ffffff', 0.1);
    const eyeGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const eyeHighGeo = new THREE.SphereGeometry(0.018, 8, 8);

    // Left Eye
    const lEye = new THREE.Mesh(eyeGeo, eyeMat);
    lEye.scale.set(0.9, 1.15, 0.4);
    lEye.position.set(-0.14, 2.62, 0.35);
    bodyGroup.add(lEye);

    const lHigh = new THREE.Mesh(eyeHighGeo, eyeHighlightMat);
    lHigh.position.set(-0.125, 2.65, 0.375);
    bodyGroup.add(lHigh);

    // Right Eye
    const rEye = new THREE.Mesh(eyeGeo, eyeMat);
    rEye.scale.set(0.9, 1.15, 0.4);
    rEye.position.set(0.14, 2.62, 0.35);
    bodyGroup.add(rEye);

    const rHigh = new THREE.Mesh(eyeHighGeo, eyeHighlightMat);
    rHigh.position.set(0.155, 2.65, 0.375);
    bodyGroup.add(rHigh);

    // Subtle Friendly Smile
    const mouthGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.02, 12);
    const mouthMat = mat('#451a03', 0.5);
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.rotation.x = Math.PI / 2;
    mouth.scale.set(1.0, 0.4, 0.4);
    mouth.position.set(0, 2.42, 0.37);
    bodyGroup.add(mouth);

    // Stylized Ears
    const earGeo = new THREE.SphereGeometry(0.075, 12, 10);
    const lEar = new THREE.Mesh(earGeo, skinMat);
    lEar.scale.set(0.4, 1.0, 0.6);
    lEar.position.set(-0.38, 2.58, -0.02);
    bodyGroup.add(lEar);

    const rEar = new THREE.Mesh(earGeo, skinMat);
    rEar.scale.set(0.4, 1.0, 0.6);
    rEar.position.set(0.38, 2.58, -0.02);
    bodyGroup.add(rEar);

    // 7. Hair Styles conforming to rounded skull
    switch (cfg.hairStyle) {
      case 'short': {
        const hairGeo = new THREE.SphereGeometry(0.395, 20, 16);
        const hair = new THREE.Mesh(hairGeo, hairMat);
        hair.scale.set(1.02, 1.04, 1.02);
        hair.position.set(0, 2.64, -0.02);
        bodyGroup.add(hair);
        break;
      }

      case 'afro': {
        const afroGeo = new THREE.SphereGeometry(0.48, 20, 18);
        const afro = new THREE.Mesh(afroGeo, hairMat);
        afro.position.set(0, 2.78, -0.02);
        afro.castShadow = true;
        bodyGroup.add(afro);

        const puffGeo = new THREE.SphereGeometry(0.24, 14, 12);
        const pL = new THREE.Mesh(puffGeo, hairMat);
        pL.position.set(-0.35, 2.70, -0.02);
        bodyGroup.add(pL);

        const pR = new THREE.Mesh(puffGeo, hairMat);
        pR.position.set(0.35, 2.70, -0.02);
        bodyGroup.add(pR);
        break;
      }

      case 'fade': {
        const fadeCapGeo = new THREE.CylinderGeometry(0.36, 0.38, 0.30, 20);
        const fade = new THREE.Mesh(fadeCapGeo, hairMat);
        fade.position.set(0, 2.82, -0.02);
        fade.castShadow = true;
        bodyGroup.add(fade);

        const fadeTopGeo = new THREE.SphereGeometry(0.36, 20, 12);
        const fadeTop = new THREE.Mesh(fadeTopGeo, hairMat);
        fadeTop.scale.set(1.0, 0.5, 1.0);
        fadeTop.position.set(0, 2.95, -0.02);
        bodyGroup.add(fadeTop);
        break;
      }

      case 'dreads': {
        const topGeo = new THREE.SphereGeometry(0.42, 20, 16);
        const topDreads = new THREE.Mesh(topGeo, hairMat);
        topDreads.scale.set(1.02, 0.8, 1.02);
        topDreads.position.set(0, 2.75, -0.02);
        bodyGroup.add(topDreads);

        const locGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.55, 8);
        const ringGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.05, 8);
        const goldMat = mat('#facc15', 0.2, 0.8);

        [-0.26, 0.26, -0.12, 0.12].forEach((lx, idx) => {
          const loc = new THREE.Mesh(locGeo, hairMat);
          loc.position.set(lx, 2.50, -0.26);
          loc.rotation.z = lx * -0.2;
          bodyGroup.add(loc);

          if (idx % 2 === 0) {
            const ring = new THREE.Mesh(ringGeo, goldMat);
            ring.position.set(lx, 2.38, -0.26);
            bodyGroup.add(ring);
          }
        });
        break;
      }

      case 'braids': {
        const scalpGeo = new THREE.SphereGeometry(0.395, 20, 16);
        const scalp = new THREE.Mesh(scalpGeo, hairMat);
        scalp.scale.set(1.01, 1.02, 1.01);
        scalp.position.set(0, 2.62, -0.02);
        bodyGroup.add(scalp);

        const braidGeo = new THREE.CylinderGeometry(0.035, 0.03, 0.62, 8);
        [-0.28, 0.28, -0.16, 0.16].forEach((bx) => {
          const bMesh = new THREE.Mesh(braidGeo, hairMat);
          bMesh.position.set(bx, 2.45, -0.14);
          bMesh.rotation.z = bx * -0.15;
          bodyGroup.add(bMesh);
        });
        break;
      }

      case 'bob': {
        const bobCapGeo = new THREE.SphereGeometry(0.42, 20, 16);
        const bobTop = new THREE.Mesh(bobCapGeo, hairMat);
        bobTop.scale.set(1.04, 1.02, 1.04);
        bobTop.position.set(0, 2.66, -0.02);
        bodyGroup.add(bobTop);

        const sideGeo = new THREE.CylinderGeometry(0.12, 0.10, 0.52, 12);
        const bL = new THREE.Mesh(sideGeo, hairMat);
        bL.scale.set(0.6, 1.0, 1.2);
        bL.position.set(-0.35, 2.50, 0);
        bodyGroup.add(bL);

        const bR = new THREE.Mesh(sideGeo, hairMat);
        bR.scale.set(0.6, 1.0, 1.2);
        bR.position.set(0.35, 2.50, 0);
        bodyGroup.add(bR);
        break;
      }

      case 'ponytail': {
        const pCapGeo = new THREE.SphereGeometry(0.40, 20, 16);
        const pTop = new THREE.Mesh(pCapGeo, hairMat);
        pTop.scale.set(1.02, 1.02, 1.02);
        pTop.position.set(0, 2.64, -0.02);
        bodyGroup.add(pTop);

        const tieGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.06, 12);
        const tieMat = mat('#facc15', 0.2, 0.8);
        const tie = new THREE.Mesh(tieGeo, tieMat);
        tie.rotation.x = Math.PI / 2;
        tie.position.set(0, 2.82, -0.36);
        bodyGroup.add(tie);

        const tailGeo = new THREE.CylinderGeometry(0.08, 0.05, 0.60, 12);
        const tail = new THREE.Mesh(tailGeo, hairMat);
        tail.rotation.x = 0.2;
        tail.position.set(0, 2.52, -0.42);
        bodyGroup.add(tail);
        break;
      }

      case 'gele': {
        const geleMat = mat('#d97706', 0.3, 0.4);
        const wrapBaseGeo = new THREE.CylinderGeometry(0.42, 0.40, 0.28, 16);
        const wrapBase = new THREE.Mesh(wrapBaseGeo, geleMat);
        wrapBase.position.set(0, 2.88, 0);
        bodyGroup.add(wrapBase);

        const fanGeo = new THREE.CylinderGeometry(0.55, 0.45, 0.20, 16);
        const fan = new THREE.Mesh(fanGeo, geleMat);
        fan.scale.set(1.2, 1.0, 0.6);
        fan.position.set(0, 3.08, 0.02);
        fan.rotation.x = -0.15;
        bodyGroup.add(fan);
        break;
      }

      case 'waves': {
        const waveGeo = new THREE.SphereGeometry(0.395, 20, 16);
        const waves = new THREE.Mesh(waveGeo, hairMat);
        waves.scale.set(1.02, 1.03, 1.02);
        waves.position.set(0, 2.63, -0.02);
        bodyGroup.add(waves);
        break;
      }

      case 'none':
      default:
        break;
    }

    // 8. Accessories (Crown, Cap, Glasses, Robes)
    if (cfg.accessory === 'crown') {
      const crown = new THREE.Group();
      crown.position.set(0, 3.25, 0);

      const crownGoldMat = new THREE.MeshStandardMaterial({
        color: '#facc15',
        roughness: 0.25,
        metalness: 0.85,
        emissive: new THREE.Color('#eab308'),
        emissiveIntensity: 0.25,
      });

      const cBaseGeo = new THREE.CylinderGeometry(0.30, 0.32, 0.10, 16);
      const cBase = new THREE.Mesh(cBaseGeo, crownGoldMat);
      crown.add(cBase);

      const pointMat = crownGoldMat;
      const pointGeo = new THREE.ConeGeometry(0.07, 0.20, 4);
      const jewelGeo = new THREE.SphereGeometry(0.035, 8, 8);
      const rubyMat = mat('#dc2626', 0.1, 0.5);
      const emeraldMat = mat('#16a34a', 0.1, 0.5);

      for (let p = 0; p < 5; p++) {
        const angle = (p * (2 * Math.PI)) / 5;
        const px = Math.sin(angle) * 0.29;
        const pz = Math.cos(angle) * 0.29;

        const tip = new THREE.Mesh(pointGeo, pointMat);
        tip.position.set(px, 0.12, pz);
        crown.add(tip);

        const gem = new THREE.Mesh(jewelGeo, p % 2 === 0 ? rubyMat : emeraldMat);
        gem.position.set(px, 0.22, pz);
        crown.add(gem);
      }

      crownMesh = crown;
      bodyGroup.add(crown);
    } else if (cfg.accessory === 'cap') {
      const capMat = mat('#1d4ed8', 0.5);
      const capDomeGeo = new THREE.SphereGeometry(0.41, 20, 14);
      const capDome = new THREE.Mesh(capDomeGeo, capMat);
      capDome.scale.set(1.02, 0.9, 1.02);
      capDome.position.set(0, 2.70, 0.02);
      bodyGroup.add(capDome);

      const visorGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.04, 16, 1, false, 0, Math.PI);
      const visor = new THREE.Mesh(visorGeo, capMat);
      visor.position.set(0, 2.64, 0.32);
      visor.rotation.x = 0.14;
      bodyGroup.add(visor);
    } else if (cfg.accessory === 'glasses') {
      const frameMat = mat('#0f172a', 0.2, 0.8);
      const glassMat = new THREE.MeshStandardMaterial({
        color: '#38bdf8',
        roughness: 0.1,
        metalness: 0.3,
        transparent: true,
        opacity: 0.6,
      });

      const lensGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.02, 16);

      const lLens = new THREE.Mesh(lensGeo, glassMat);
      lLens.rotation.x = Math.PI / 2;
      lLens.position.set(-0.15, 2.62, 0.37);
      bodyGroup.add(lLens);

      const rLens = new THREE.Mesh(lensGeo, glassMat);
      rLens.rotation.x = Math.PI / 2;
      rLens.position.set(0.15, 2.62, 0.37);
      bodyGroup.add(rLens);

      const bridgeGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.12, 8);
      const bridge = new THREE.Mesh(bridgeGeo, frameMat);
      bridge.rotation.z = Math.PI / 2;
      bridge.position.set(0, 2.63, 0.38);
      bodyGroup.add(bridge);
    } else if (cfg.accessory === 'pastor_collar') {
      const collarBandGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.07, 16);
      const collarBand = new THREE.Mesh(collarBandGeo, mat('#09090b', 0.3));
      collarBand.position.set(0, 2.14, 0);
      bodyGroup.add(collarBand);

      const tabGeo = new THREE.BoxGeometry(0.07, 0.05, 0.02);
      const tabMesh = new THREE.Mesh(tabGeo, mat('#ffffff', 0.2));
      tabMesh.position.set(0, 2.14, 0.13);
      bodyGroup.add(tabMesh);

      const crossMesh = new THREE.Group();
      crossMesh.position.set(0, 1.76, 0.22);
      const crossGoldMat = mat('#facc15', 0.2, 0.85);
      const crossVert = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.15, 0.02), crossGoldMat);
      const crossHoriz = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.035, 0.02), crossGoldMat);
      crossHoriz.position.set(0, 0.03, 0);
      crossMesh.add(crossVert);
      crossMesh.add(crossHoriz);
      bodyGroup.add(crossMesh);
    } else if (cfg.accessory === 'alfa_cap') {
      const capGeo = new THREE.CylinderGeometry(0.36, 0.38, 0.22, 18);
      const capMat = mat('#f8fafc', 0.6);
      const alfaCap = new THREE.Mesh(capGeo, capMat);
      alfaCap.position.set(0, 2.94, -0.02);
      alfaCap.castShadow = true;
      bodyGroup.add(alfaCap);

      const rimGeo = new THREE.CylinderGeometry(0.385, 0.385, 0.04, 18);
      const rimMat = mat('#facc15', 0.3, 0.7);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.position.set(0, 2.85, -0.02);
      bodyGroup.add(rim);
    } else if (cfg.accessory === 'prayer_beads') {
      const beadsGroup = new THREE.Group();
      beadsGroup.position.set(0, 1.82, 0.20);
      const beadGeo = new THREE.SphereGeometry(0.020, 6, 6);
      const beadMat = mat('#78350f', 0.3, 0.2);

      for (let b = 0; b < 16; b++) {
        const angle = (b / 16) * Math.PI * 2;
        const bx = Math.sin(angle) * 0.15;
        const by = Math.cos(angle) * 0.20;
        const bead = new THREE.Mesh(beadGeo, beadMat);
        bead.position.set(bx, by, 0);
        beadsGroup.add(bead);
      }

      const tasselGeo = new THREE.CylinderGeometry(0.012, 0.030, 0.09, 6);
      const tasselMat = mat('#16a34a', 0.4);
      const tassel = new THREE.Mesh(tasselGeo, tasselMat);
      tassel.position.set(0, -0.25, 0);
      beadsGroup.add(tassel);

      bodyGroup.add(beadsGroup);
    }
  }

  // Initial build
  buildCharacter(currentConfig);

  // Animation Update Loop
  const update = (delta: number, elapsed: number) => {
    if (isWalking) {
      // Snappy walking pace matching arcade traversal speed
      walkPhase += delta * 16;

      // Leg swinging back and forth using Math.sin(walkPhase)
      if (leftLegGroup && rightLegGroup) {
        leftLegGroup.rotation.x = Math.sin(walkPhase) * 0.85;
        rightLegGroup.rotation.x = -Math.sin(walkPhase) * 0.85;
      }

      // Dynamic arm counter-swinging
      if (leftArmGroup && rightArmGroup) {
        leftArmGroup.rotation.x = -Math.sin(walkPhase) * 0.75;
        rightArmGroup.rotation.x = Math.sin(walkPhase) * 0.75;
      }

      // Vertical bounce / bobbing to torso and head
      const stepBob = Math.abs(Math.sin(walkPhase)) * 0.16;
      bodyGroup.position.y = stepBob;

      // Natural subtle lateral sway
      bodyGroup.rotation.z = Math.sin(walkPhase * 0.5) * 0.06;
    } else {
      bodyGroup.rotation.z = 0;
      // Return legs to neutral standing position
      if (leftLegGroup) leftLegGroup.rotation.x = 0;
      if (rightLegGroup) rightLegGroup.rotation.x = 0;

      // Gentle vertical idle bobbing & breathing
      const bob = Math.sin(elapsed * 2.8) * 0.03;
      bodyGroup.position.y = bob;

      // Idle subtle arm swing
      if (leftArmGroup && rightArmGroup) {
        leftArmGroup.rotation.x = Math.sin(elapsed * 2.8) * 0.08;
        rightArmGroup.rotation.x = -Math.sin(elapsed * 2.8) * 0.08;
      }
    }

    // 3. Floating gold crown hover & slow majestic spin (image_22.png)
    if (crownMesh) {
      crownMesh.rotation.y = elapsed * 1.2;
      crownMesh.position.y = 3.32 + Math.sin(elapsed * 3.5) * 0.06;
    }
  };

  const updateConfig = (newConfig?: Partial<CharacterCustomization> | null) => {
    currentConfig = sanitizeCustomization(newConfig);
    buildCharacter(currentConfig);
  };

  const setWalking = (walking: boolean) => {
    isWalking = walking;
    if (!walking) {
      walkPhase = 0;
      if (leftLegGroup) leftLegGroup.rotation.x = 0;
      if (rightLegGroup) rightLegGroup.rotation.x = 0;
    }
  };

  return {
    group: root,
    update,
    updateConfig,
    setWalking,
  };
}
