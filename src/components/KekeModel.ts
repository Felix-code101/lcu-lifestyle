import * as THREE from 'three';

export interface KekeModelInstance {
  group: THREE.Group;
  update: (delta: number, elapsed: number, isDriving?: boolean) => void;
}

/**
 * Creates a stylized, iconic Nigerian Keke Napep (Tricycle) 3D Model
 * Featuring classic yellow & green livery, 3 animated wheels, roll cage canopy,
 * clear windscreen, headlight, and interior seating.
 */
export function createKekeModel(): KekeModelInstance {
  const root = new THREE.Group();
  root.name = 'keke_napep';

  // Subgroup for chassis vibration & suspension bounce
  const cabinGroup = new THREE.Group();
  root.add(cabinGroup);

  const mat = (color: string | number, roughness = 0.5, metalness = 0.1) =>
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness,
      metalness,
    });

  const kekeYellow = mat('#eab308', 0.35, 0.1); // Classic Nigerian transit yellow
  const kekeGreen = mat('#15803d', 0.4, 0.05); // LU Green accent
  const darkChassis = mat('#1e293b', 0.6, 0.4);
  const tireMat = mat('#0f172a', 0.9, 0.05);
  const rimMat = mat('#cbd5e1', 0.3, 0.7);
  const seatMat = mat('#18181b', 0.8, 0.05);

  const glassMat = new THREE.MeshStandardMaterial({
    color: '#38bdf8',
    emissive: new THREE.Color('#0284c7'),
    emissiveIntensity: 0.25,
    roughness: 0.1,
    metalness: 0.2,
    transparent: true,
    opacity: 0.65,
  });

  // 1. Lower Chassis & Floor Bed
  const floorBed = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.12, 2.2), darkChassis);
  floorBed.position.set(0, 0.35, 0);
  floorBed.castShadow = true;
  cabinGroup.add(floorBed);

  // 2. Rear Passenger Body Tub (Yellow with Green Trim)
  const rearTub = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.6, 1.2), kekeYellow);
  rearTub.position.set(0, 0.65, -0.5);
  rearTub.castShadow = true;
  cabinGroup.add(rearTub);

  // Green side stripe
  const greenStripe = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.12, 1.18), kekeGreen);
  greenStripe.position.set(0, 0.65, -0.5);
  cabinGroup.add(greenStripe);

  // White Nigeria accent line
  const whiteStripe = new THREE.Mesh(new THREE.BoxGeometry(1.33, 0.04, 1.16), mat('#ffffff'));
  whiteStripe.position.set(0, 0.65, -0.5);
  cabinGroup.add(whiteStripe);

  // 3. Tapered Front Nose / Mudguard Apron
  const noseShape = new THREE.BoxGeometry(0.85, 0.6, 0.7);
  const frontNose = new THREE.Mesh(noseShape, kekeYellow);
  frontNose.position.set(0, 0.65, 0.45);
  frontNose.castShadow = true;
  cabinGroup.add(frontNose);

  // Front Mudguard
  const mudguard = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.25, 0.55), kekeGreen);
  mudguard.position.set(0, 0.45, 0.95);
  mudguard.castShadow = true;
  cabinGroup.add(mudguard);

  // 4. Front Headlight & Turn Signals
  const headlight = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.14, 0.08, 16),
    new THREE.MeshStandardMaterial({
      color: '#fef08a',
      emissive: new THREE.Color('#facc15'),
      emissiveIntensity: 0.9,
    })
  );
  headlight.rotation.x = Math.PI / 2;
  headlight.position.set(0, 0.7, 0.81);
  cabinGroup.add(headlight);

  // Turn signal indicators
  [-0.32, 0.32].forEach((sx) => {
    const signal = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.08, 0.04),
      new THREE.MeshStandardMaterial({
        color: '#f97316',
        emissive: new THREE.Color('#ea580c'),
        emissiveIntensity: 0.8,
      })
    );
    signal.position.set(sx, 0.68, 0.81);
    cabinGroup.add(signal);
  });

  // 5. Seats & Interior
  // Driver Seat
  const driverSeat = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.16, 0.35), seatMat);
  driverSeat.position.set(0, 0.48, 0.2);
  cabinGroup.add(driverSeat);

  // Passenger Bench Seat
  const passSeat = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.18, 0.45), seatMat);
  passSeat.position.set(0, 0.5, -0.75);
  cabinGroup.add(passSeat);

  const passBack = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.4, 0.1), seatMat);
  passBack.position.set(0, 0.75, -0.98);
  cabinGroup.add(passBack);

  // Handlebars
  const handleStem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8), darkChassis);
  handleStem.position.set(0, 0.75, 0.55);
  handleStem.rotation.x = -0.3;
  cabinGroup.add(handleStem);

  const handleBar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.5, 8), darkChassis);
  handleBar.position.set(0, 0.9, 0.5);
  handleBar.rotation.z = Math.PI / 2;
  cabinGroup.add(handleBar);

  // 6. Roll Cage Pillars (Black tubular bars)
  const pillarGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.95, 8);
  const pillarMat = darkChassis;

  // Front Windscreen Pillars
  [-0.42, 0.42].forEach((px) => {
    const fPillar = new THREE.Mesh(pillarGeo, pillarMat);
    fPillar.position.set(px, 1.25, 0.65);
    fPillar.rotation.x = -0.18;
    cabinGroup.add(fPillar);
  });

  // Middle Side Pillars
  [-0.6, 0.6].forEach((px) => {
    const mPillar = new THREE.Mesh(pillarGeo, pillarMat);
    mPillar.position.set(px, 1.25, -0.1);
    cabinGroup.add(mPillar);
  });

  // Rear Pillars
  [-0.6, 0.6].forEach((px) => {
    const rPillar = new THREE.Mesh(pillarGeo, pillarMat);
    rPillar.position.set(px, 1.25, -1.05);
    cabinGroup.add(rPillar);
  });

  // 7. Clear Windscreen
  const windscreen = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.65, 0.04), glassMat);
  windscreen.position.set(0, 1.25, 0.68);
  windscreen.rotation.x = -0.18;
  cabinGroup.add(windscreen);

  // Windscreen Rubber Wiper
  const wiper = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.35, 0.02), darkChassis);
  wiper.position.set(0.05, 1.25, 0.71);
  wiper.rotation.x = -0.18;
  wiper.rotation.z = -0.35;
  cabinGroup.add(wiper);

  // 8. Curved Canopy Roof (Yellow with Green Cap)
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.12, 2.0), kekeYellow);
  roof.position.set(0, 1.72, -0.2);
  roof.castShadow = true;
  cabinGroup.add(roof);

  const roofCap = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.06, 1.8), kekeGreen);
  roofCap.position.set(0, 1.8, -0.2);
  cabinGroup.add(roofCap);

  // "LU TRANSIT" Sign on roof visor
  const signPlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.16, 0.05),
    new THREE.MeshStandardMaterial({
      color: '#15803d',
      emissive: new THREE.Color('#166534'),
      emissiveIntensity: 0.3,
    })
  );
  signPlate.position.set(0, 1.72, 0.81);
  cabinGroup.add(signPlate);

  // 9. Wheels Setup
  const wheelGroups: THREE.Group[] = [];

  function makeWheel(): THREE.Group {
    const wg = new THREE.Group();
    // Tire
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.15, 14), tireMat);
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    wg.add(tire);

    // Rim
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.16, 12), rimMat);
    rim.rotation.z = Math.PI / 2;
    wg.add(rim);

    // Hubcap
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.18, 8), darkChassis);
    cap.rotation.z = Math.PI / 2;
    wg.add(cap);

    return wg;
  }

  // Front Steering Wheel (1 front wheel)
  const frontWheel = makeWheel();
  frontWheel.position.set(0, 0.24, 1.0);
  root.add(frontWheel);
  wheelGroups.push(frontWheel);

  // Rear Left Wheel
  const rearLeftWheel = makeWheel();
  rearLeftWheel.position.set(-0.66, 0.24, -0.6);
  root.add(rearLeftWheel);
  wheelGroups.push(rearLeftWheel);

  // Rear Right Wheel
  const rearRightWheel = makeWheel();
  rearRightWheel.position.set(0.66, 0.24, -0.6);
  root.add(rearRightWheel);
  wheelGroups.push(rearRightWheel);

  // Stylized Driver Figure sitting inside
  const driverGroup = new THREE.Group();
  driverGroup.position.set(0, 0.55, 0.2);

  // Driver Shirt & Torso
  const dTorso = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.42, 0.24), mat('#2563eb'));
  dTorso.position.y = 0.35;
  dTorso.castShadow = true;
  driverGroup.add(dTorso);

  // Driver Head & Cap
  const dHead = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.26), mat('#6d4527'));
  dHead.position.y = 0.7;
  dHead.castShadow = true;
  driverGroup.add(dHead);

  const dCap = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.34), mat('#eab308'));
  dCap.position.set(0, 0.85, 0.02);
  driverGroup.add(dCap);

  // Driver Arms steering
  const dArmGeo = new THREE.BoxGeometry(0.09, 0.26, 0.09);
  const leftArm = new THREE.Mesh(dArmGeo, mat('#2563eb'));
  leftArm.position.set(-0.2, 0.35, 0.15);
  leftArm.rotation.x = 0.7;
  driverGroup.add(leftArm);

  const rightArm = new THREE.Mesh(dArmGeo, mat('#2563eb'));
  rightArm.position.set(0.2, 0.35, 0.15);
  rightArm.rotation.x = 0.7;
  driverGroup.add(rightArm);

  cabinGroup.add(driverGroup);

  // Animation Update
  const update = (delta: number, elapsed: number, isDriving = true) => {
    if (isDriving) {
      // Rotate 3 wheels vigorously at snappy driving speed
      wheelGroups.forEach((wg) => {
        wg.rotation.x += delta * 32;
      });

      // Motor suspension rumble and engine vibration bob
      cabinGroup.position.y = Math.sin(elapsed * 55) * 0.022;
      cabinGroup.rotation.x = Math.sin(elapsed * 25) * 0.012;
    } else {
      // Subtle idle engine purr
      cabinGroup.position.y = Math.sin(elapsed * 15) * 0.006;
      cabinGroup.rotation.x = 0;
    }
  };

  return {
    group: root,
    update,
  };
}
