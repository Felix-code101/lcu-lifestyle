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

    // 1 & 2. Legs, Shoes & Feet attached to Hip Pivots for natural walk animation
    const shoeGeo = new THREE.BoxGeometry(0.28, 0.2, 0.46);
    const soleGeo = new THREE.BoxGeometry(0.29, 0.06, 0.48);
    const legGeo = new THREE.BoxGeometry(0.24, 0.82, 0.28);

    // Left Leg Group
    const lLegPivot = new THREE.Group();
    lLegPivot.position.set(-0.22, 1.0, 0);
    leftLegGroup = lLegPivot;

    const leftLeg = new THREE.Mesh(legGeo, pantsMat);
    leftLeg.position.set(0, -0.42, 0);
    leftLeg.castShadow = true;
    lLegPivot.add(leftLeg);

    const leftShoe = new THREE.Mesh(shoeGeo, shoesMat);
    leftShoe.position.set(0, -0.9, 0.04);
    leftShoe.castShadow = true;
    lLegPivot.add(leftShoe);

    const leftSole = new THREE.Mesh(soleGeo, whiteSoleMat);
    leftSole.position.set(0, -0.97, 0.04);
    lLegPivot.add(leftSole);

    bodyGroup.add(lLegPivot);

    // Right Leg Group
    const rLegPivot = new THREE.Group();
    rLegPivot.position.set(0.22, 1.0, 0);
    rightLegGroup = rLegPivot;

    const rightLeg = new THREE.Mesh(legGeo, pantsMat);
    rightLeg.position.set(0, -0.42, 0);
    rightLeg.castShadow = true;
    rLegPivot.add(rightLeg);

    const rightShoe = new THREE.Mesh(shoeGeo, shoesMat);
    rightShoe.position.set(0, -0.9, 0.04);
    rightShoe.castShadow = true;
    rLegPivot.add(rightShoe);

    const rightSole = new THREE.Mesh(soleGeo, whiteSoleMat);
    rightSole.position.set(0, -0.97, 0.04);
    rLegPivot.add(rightSole);

    bodyGroup.add(rLegPivot);

    // Pelvis / Hips
    const hipGeo = new THREE.BoxGeometry(0.72, 0.22, 0.36);
    const hip = new THREE.Mesh(hipGeo, pantsMat);
    hip.position.set(0, 1.05, 0);
    hip.castShadow = true;
    bodyGroup.add(hip);

    // Belt & Gold Buckle
    const beltGeo = new THREE.BoxGeometry(0.73, 0.06, 0.37);
    const belt = new THREE.Mesh(beltGeo, mat('#1e293b', 0.4));
    belt.position.set(0, 1.13, 0);
    bodyGroup.add(belt);

    const buckleGeo = new THREE.BoxGeometry(0.12, 0.08, 0.03);
    const buckle = new THREE.Mesh(buckleGeo, mat('#facc15', 0.2, 0.8));
    buckle.position.set(0, 1.13, 0.19);
    bodyGroup.add(buckle);

    // 3. Torso / Shirt
    const torsoGeo = new THREE.BoxGeometry(0.82, 0.94, 0.42);
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.position.set(0, 1.63, 0);
    torso.castShadow = true;
    torso.receiveShadow = true;
    bodyGroup.add(torso);

    // Optional flowing lower robe extension for Jalabiya or Pastor Cassock
    if (cfg.shirtPattern === 'jalabiya_robe' || cfg.shirtPattern === 'pastor_vestment') {
      const robeLowerGeo = new THREE.BoxGeometry(0.78, 0.62, 0.44);
      const robeLower = new THREE.Mesh(robeLowerGeo, shirtMat);
      robeLower.position.set(0, 0.88, 0);
      robeLower.castShadow = true;
      bodyGroup.add(robeLower);
    }

    // Clean Shirt Collar
    const collarGeo = new THREE.BoxGeometry(0.36, 0.06, 0.43);
    const collar = new THREE.Mesh(collarGeo, mat('#f8fafc', 0.4));
    collar.position.set(0, 2.08, 0);
    bodyGroup.add(collar);

    // 4. Arms & Hands
    // Left Arm Hierarchy
    const lArm = new THREE.Group();
    lArm.position.set(-0.48, 1.95, 0);
    leftArmGroup = lArm;

    const sleeveGeo = new THREE.BoxGeometry(0.2, 0.36, 0.22);
    const lSleeve = new THREE.Mesh(sleeveGeo, shirtMat);
    lSleeve.position.set(0, -0.18, 0);
    lSleeve.castShadow = true;
    lArm.add(lSleeve);

    const forearmGeo = new THREE.BoxGeometry(0.16, 0.38, 0.18);
    const lForearm = new THREE.Mesh(forearmGeo, skinMat);
    lForearm.position.set(0, -0.5, 0);
    lForearm.castShadow = true;
    lArm.add(lForearm);

    const handGeo = new THREE.BoxGeometry(0.16, 0.16, 0.16);
    const lHand = new THREE.Mesh(handGeo, skinMat);
    lHand.position.set(0, -0.72, 0);
    lHand.castShadow = true;
    lArm.add(lHand);

    bodyGroup.add(lArm);

    // Right Arm Hierarchy
    const rArm = new THREE.Group();
    rArm.position.set(0.48, 1.95, 0);
    rightArmGroup = rArm;

    const rSleeve = new THREE.Mesh(sleeveGeo, shirtMat);
    rSleeve.position.set(0, -0.18, 0);
    rSleeve.castShadow = true;
    rArm.add(rSleeve);

    const rForearm = new THREE.Mesh(forearmGeo, skinMat);
    rForearm.position.set(0, -0.5, 0);
    rForearm.castShadow = true;
    rArm.add(rForearm);

    const rHand = new THREE.Mesh(handGeo, skinMat);
    rHand.position.set(0, -0.72, 0);
    rHand.castShadow = true;
    rArm.add(rHand);

    bodyGroup.add(rArm);

    // 5. Neck
    const neckGeo = new THREE.BoxGeometry(0.22, 0.16, 0.22);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.set(0, 2.15, 0);
    bodyGroup.add(neck);

    // 6. Head & Stylized Facial Features
    const headGeo = new THREE.BoxGeometry(0.74, 0.74, 0.68);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.set(0, 2.58, 0);
    head.castShadow = true;
    bodyGroup.add(head);

    // Stylized Cute Eyes
    const eyeMat = mat('#0f172a', 0.2);
    const eyeHighlightMat = mat('#ffffff', 0.1);
    const eyeGeo = new THREE.BoxGeometry(0.09, 0.12, 0.04);
    const eyeHighGeo = new THREE.BoxGeometry(0.04, 0.04, 0.04);

    // Left Eye
    const lEye = new THREE.Mesh(eyeGeo, eyeMat);
    lEye.position.set(-0.18, 2.62, 0.35);
    bodyGroup.add(lEye);

    const lHigh = new THREE.Mesh(eyeHighGeo, eyeHighlightMat);
    lHigh.position.set(-0.16, 2.65, 0.36);
    bodyGroup.add(lHigh);

    // Right Eye
    const rEye = new THREE.Mesh(eyeGeo, eyeMat);
    rEye.position.set(0.18, 2.62, 0.35);
    bodyGroup.add(rEye);

    const rHigh = new THREE.Mesh(eyeHighGeo, eyeHighlightMat);
    rHigh.position.set(0.16, 2.65, 0.36);
    bodyGroup.add(rHigh);

    // Subtle Friendly Smile
    const mouthGeo = new THREE.BoxGeometry(0.18, 0.04, 0.03);
    const mouthMat = mat('#451a03', 0.5);
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, 2.4, 0.35);
    bodyGroup.add(mouth);

    // Stylized Ears
    const earGeo = new THREE.BoxGeometry(0.08, 0.16, 0.12);
    const lEar = new THREE.Mesh(earGeo, skinMat);
    lEar.position.set(-0.39, 2.58, 0);
    bodyGroup.add(lEar);

    const rEar = new THREE.Mesh(earGeo, skinMat);
    rEar.position.set(0.39, 2.58, 0);
    bodyGroup.add(rEar);

    // 7. Hair Styles
    switch (cfg.hairStyle) {
      case 'short': {
        const hairTopGeo = new THREE.BoxGeometry(0.76, 0.22, 0.7);
        const hairTop = new THREE.Mesh(hairTopGeo, hairMat);
        hairTop.position.set(0, 2.96, -0.02);
        bodyGroup.add(hairTop);
        break;
      }

      case 'afro': {
        // Voluminous rounded cuboid afro puff
        const afroGeo = new THREE.BoxGeometry(0.9, 0.45, 0.84);
        const afro = new THREE.Mesh(afroGeo, hairMat);
        afro.position.set(0, 3.02, -0.04);
        afro.castShadow = true;
        bodyGroup.add(afro);

        const afroSideL = new THREE.BoxGeometry(0.15, 0.4, 0.7);
        const sL = new THREE.Mesh(afroSideL, hairMat);
        sL.position.set(-0.44, 2.75, -0.04);
        bodyGroup.add(sL);

        const sR = new THREE.Mesh(afroSideL, hairMat);
        sR.position.set(0.44, 2.75, -0.04);
        bodyGroup.add(sR);
        break;
      }

      case 'fade': {
        // High-top textured fade
        const fadeGeo = new THREE.BoxGeometry(0.76, 0.36, 0.7);
        const fade = new THREE.Mesh(fadeGeo, hairMat);
        fade.position.set(0, 3.0, -0.02);
        fade.castShadow = true;
        bodyGroup.add(fade);
        break;
      }

      case 'dreads': {
        // High cluster dreadlocks with dangling locs
        const topGeo = new THREE.BoxGeometry(0.78, 0.28, 0.72);
        const topDreads = new THREE.Mesh(topGeo, hairMat);
        topDreads.position.set(0, 2.98, -0.04);
        bodyGroup.add(topDreads);

        // Hanging dread locs with golden rings
        const locGeo = new THREE.BoxGeometry(0.12, 0.55, 0.12);
        const ringGeo = new THREE.BoxGeometry(0.14, 0.05, 0.14);
        const goldMat = mat('#facc15', 0.2, 0.8);

        [-0.32, 0.32, -0.15, 0.15].forEach((lx, idx) => {
          const loc = new THREE.Mesh(locGeo, hairMat);
          loc.position.set(lx, 2.65, -0.32);
          bodyGroup.add(loc);

          if (idx % 2 === 0) {
            const ring = new THREE.Mesh(ringGeo, goldMat);
            ring.position.set(lx, 2.5, -0.32);
            bodyGroup.add(ring);
          }
        });
        break;
      }

      case 'braids': {
        // Braided cornrow rows
        for (let r = -2; r <= 2; r++) {
          const rowGeo = new THREE.BoxGeometry(0.1, 0.14, 0.72);
          const row = new THREE.Mesh(rowGeo, hairMat);
          row.position.set(r * 0.14, 2.96, -0.02);
          bodyGroup.add(row);
        }
        break;
      }

      case 'none':
      default:
        break;
    }

    // 8. Accessories (Crown, Cap, Glasses)
    if (cfg.accessory === 'crown') {
      // Golden Floating 5-Point Royal Crown with Jewels (image_22.png reference)
      const crown = new THREE.Group();
      crown.position.set(0, 3.3, 0);

      const crownGoldMat = new THREE.MeshStandardMaterial({
        color: '#facc15',
        roughness: 0.25,
        metalness: 0.85,
        emissive: new THREE.Color('#eab308'),
        emissiveIntensity: 0.25,
      });

      // Crown Ring Base
      const cBaseGeo = new THREE.CylinderGeometry(0.32, 0.34, 0.12, 16);
      const cBase = new THREE.Mesh(cBaseGeo, crownGoldMat);
      crown.add(cBase);

      // 5 Crown Triangular Points
      const pointMat = crownGoldMat;
      const pointGeo = new THREE.ConeGeometry(0.08, 0.22, 4);
      const jewelGeo = new THREE.SphereGeometry(0.04, 8, 8);
      const rubyMat = mat('#dc2626', 0.1, 0.5);
      const emeraldMat = mat('#16a34a', 0.1, 0.5);

      for (let p = 0; p < 5; p++) {
        const angle = (p * (2 * Math.PI)) / 5;
        const px = Math.sin(angle) * 0.31;
        const pz = Math.cos(angle) * 0.31;

        const tip = new THREE.Mesh(pointGeo, pointMat);
        tip.position.set(px, 0.14, pz);
        crown.add(tip);

        // Gem on tip
        const gem = new THREE.Mesh(jewelGeo, p % 2 === 0 ? rubyMat : emeraldMat);
        gem.position.set(px, 0.25, pz);
        crown.add(gem);
      }

      crownMesh = crown;
      bodyGroup.add(crown);
    } else if (cfg.accessory === 'cap') {
      // Varsity baseball cap / student cap
      const capMat = mat('#1d4ed8', 0.5);
      const capDomeGeo = new THREE.BoxGeometry(0.78, 0.24, 0.74);
      const capDome = new THREE.Mesh(capDomeGeo, capMat);
      capDome.position.set(0, 2.96, 0.02);
      bodyGroup.add(capDome);

      // Visor / Brim sticking forward
      const visorGeo = new THREE.BoxGeometry(0.68, 0.05, 0.35);
      const visor = new THREE.Mesh(visorGeo, capMat);
      visor.position.set(0, 2.88, 0.42);
      visor.rotation.x = 0.12;
      bodyGroup.add(visor);
    } else if (cfg.accessory === 'glasses') {
      // Wire-frame stylish glasses
      const frameMat = mat('#0f172a', 0.2, 0.8);
      const glassMat = new THREE.MeshStandardMaterial({
        color: '#38bdf8',
        roughness: 0.1,
        metalness: 0.3,
        transparent: true,
        opacity: 0.6,
      });

      const lensGeo = new THREE.BoxGeometry(0.22, 0.16, 0.02);

      // Left Lens
      const lLens = new THREE.Mesh(lensGeo, glassMat);
      lLens.position.set(-0.18, 2.62, 0.38);
      bodyGroup.add(lLens);

      // Right Lens
      const rLens = new THREE.Mesh(lensGeo, glassMat);
      rLens.position.set(0.18, 2.62, 0.38);
      bodyGroup.add(rLens);

      // Bridge
      const bridgeGeo = new THREE.BoxGeometry(0.12, 0.03, 0.03);
      const bridge = new THREE.Mesh(bridgeGeo, frameMat);
      bridge.position.set(0, 2.64, 0.38);
      bodyGroup.add(bridge);
    } else if (cfg.accessory === 'pastor_collar') {
      // Clerical collar band around neck
      const collarBandGeo = new THREE.BoxGeometry(0.24, 0.07, 0.24);
      const collarBand = new THREE.Mesh(collarBandGeo, mat('#09090b', 0.3));
      collarBand.position.set(0, 2.14, 0);
      bodyGroup.add(collarBand);

      // White clerical insert tab in front
      const tabGeo = new THREE.BoxGeometry(0.08, 0.06, 0.02);
      const tabMesh = new THREE.Mesh(tabGeo, mat('#ffffff', 0.2));
      tabMesh.position.set(0, 2.14, 0.12);
      bodyGroup.add(tabMesh);

      // Hanging gold cross
      const crossMesh = new THREE.Group();
      crossMesh.position.set(0, 1.76, 0.22);
      const crossGoldMat = mat('#facc15', 0.2, 0.85);
      const crossVert = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.02), crossGoldMat);
      const crossHoriz = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.02), crossGoldMat);
      crossHoriz.position.set(0, 0.03, 0);
      crossMesh.add(crossVert);
      crossMesh.add(crossHoriz);
      bodyGroup.add(crossMesh);
    } else if (cfg.accessory === 'alfa_cap') {
      // Authentic Islamic Kufi cap
      const capGeo = new THREE.CylinderGeometry(0.38, 0.40, 0.24, 16);
      const capMat = mat('#f8fafc', 0.6);
      const alfaCap = new THREE.Mesh(capGeo, capMat);
      alfaCap.position.set(0, 3.0, -0.02);
      alfaCap.castShadow = true;
      bodyGroup.add(alfaCap);

      // Golden embroidery rim at base of kufi
      const rimGeo = new THREE.CylinderGeometry(0.405, 0.405, 0.05, 16);
      const rimMat = mat('#facc15', 0.3, 0.7);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.position.set(0, 2.9, -0.02);
      bodyGroup.add(rim);
    } else if (cfg.accessory === 'prayer_beads') {
      // Tasbih / Rosary beads necklace looped around neck
      const beadsGroup = new THREE.Group();
      beadsGroup.position.set(0, 1.82, 0.22);
      const beadGeo = new THREE.SphereGeometry(0.022, 6, 6);
      const beadMat = mat('#78350f', 0.3, 0.2); // Polished mahogany/amber beads

      for (let b = 0; b < 16; b++) {
        const angle = (b / 16) * Math.PI * 2;
        const bx = Math.sin(angle) * 0.16;
        const by = Math.cos(angle) * 0.22;
        const bead = new THREE.Mesh(beadGeo, beadMat);
        bead.position.set(bx, by, 0);
        beadsGroup.add(bead);
      }

      // Tassel at the bottom
      const tasselGeo = new THREE.CylinderGeometry(0.015, 0.035, 0.1, 6);
      const tasselMat = mat('#16a34a', 0.4); // Emerald green tassel
      const tassel = new THREE.Mesh(tasselGeo, tasselMat);
      tassel.position.set(0, -0.27, 0);
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
