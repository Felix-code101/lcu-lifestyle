import * as THREE from 'three';

export interface RoadNode {
  id: string;
  position: [number, number, number];
  neighbors: string[];
}

export const CAMPUS_ROAD_NODES: Record<string, RoadNode> = {
  // Central Roundabout (around Senate Building)
  roundabout_s: { id: 'roundabout_s', position: [0, 0.09, 8.5], neighbors: ['roundabout_e', 'roundabout_w', 'junc_s_16', 'senate_dropoff'] },
  roundabout_e: { id: 'roundabout_e', position: [8.5, 0.09, 0], neighbors: ['roundabout_s', 'roundabout_n', 'junc_e_pg'] },
  roundabout_n: { id: 'roundabout_n', position: [0, 0.09, -8.5], neighbors: ['roundabout_e', 'roundabout_w', 'junc_n_20'] },
  roundabout_w: { id: 'roundabout_w', position: [-8.5, 0.09, 0], neighbors: ['roundabout_s', 'roundabout_n', 'junc_w_lib'] },

  // Senate Building Dropoff
  senate_dropoff: { id: 'senate_dropoff', position: [0, 0.09, 6.0], neighbors: ['roundabout_s'] },

  // North-South Boulevard - North Intersections
  junc_n_20: { id: 'junc_n_20', position: [0, 0.09, -20], neighbors: ['roundabout_n', 'junc_n_32', 'law_dropoff', 'ict_dropoff'] },
  junc_n_32: { id: 'junc_n_32', position: [0, 0.09, -32], neighbors: ['junc_n_20', 'chapel_dropoff', 'mosque_dropoff', 'guesthouse_dropoff'] },

  // North Branches
  law_dropoff: { id: 'law_dropoff', position: [-20, 0.09, -20], neighbors: ['junc_n_20'] },
  ict_dropoff: { id: 'ict_dropoff', position: [20, 0.09, -20], neighbors: ['junc_n_20'] },
  chapel_dropoff: { id: 'chapel_dropoff', position: [-10, 0.09, -30], neighbors: ['junc_n_32'] },
  mosque_dropoff: { id: 'mosque_dropoff', position: [10, 0.09, -30], neighbors: ['junc_n_32'] },
  guesthouse_dropoff: { id: 'guesthouse_dropoff', position: [24, 0.09, -30], neighbors: ['junc_n_32'] },

  // East-West Boulevard Branches
  junc_w_lib: { id: 'junc_w_lib', position: [-20, 0.09, 0], neighbors: ['roundabout_w', 'library_dropoff'] },
  library_dropoff: { id: 'library_dropoff', position: [-22, 0.09, 0], neighbors: ['junc_w_lib'] },

  junc_e_pg: { id: 'junc_e_pg', position: [20, 0.09, 0], neighbors: ['roundabout_e', 'pg_dropoff', 'med_centre_dropoff'] },
  pg_dropoff: { id: 'pg_dropoff', position: [22, 0.09, 0], neighbors: ['junc_e_pg'] },

  // South Intersections
  junc_s_16: { id: 'junc_s_16', position: [0, 0.09, 16], neighbors: ['roundabout_s', 'junc_s_22', 'cafeteria_dropoff'] },
  cafeteria_dropoff: { id: 'cafeteria_dropoff', position: [0, 0.09, 15.5], neighbors: ['junc_s_16'] },

  junc_s_22: { id: 'junc_s_22', position: [0, 0.09, 22], neighbors: ['junc_s_16', 'junc_s_42', 'junc_sw_22', 'junc_se_22'] },
  junc_s_42: { id: 'junc_s_42', position: [0, 0.09, 42], neighbors: ['junc_s_22', 'main_gate_dropoff'] },
  main_gate_dropoff: { id: 'main_gate_dropoff', position: [0, 0.09, 40], neighbors: ['junc_s_42'] },

  // South-West Branch (Hostels, SUB, Lions Hall)
  junc_sw_22: { id: 'junc_sw_22', position: [-20, 0.09, 22], neighbors: ['junc_s_22', 'sub_dropoff', 'hostels_male_dropoff', 'hostels_female_dropoff', 'lions_hall_dropoff'] },
  sub_dropoff: { id: 'sub_dropoff', position: [-18, 0.09, 20], neighbors: ['junc_sw_22'] },
  hostels_male_dropoff: { id: 'hostels_male_dropoff', position: [-26, 0.09, 30], neighbors: ['junc_sw_22'] },
  hostels_female_dropoff: { id: 'hostels_female_dropoff', position: [-28, 0.09, 17], neighbors: ['junc_sw_22'] },
  lions_hall_dropoff: { id: 'lions_hall_dropoff', position: [-12, 0.09, 26], neighbors: ['junc_sw_22', 'junc_s_22'] },

  // South-East Branch (Stadium, Medical Centre, Adeline Hall)
  junc_se_22: { id: 'junc_se_22', position: [20, 0.09, 22], neighbors: ['junc_s_22', 'stadium_dropoff', 'med_centre_dropoff', 'adeline_hall_dropoff'] },
  stadium_dropoff: { id: 'stadium_dropoff', position: [22, 0.09, 22], neighbors: ['junc_se_22'] },
  med_centre_dropoff: { id: 'med_centre_dropoff', position: [24, 0.09, 10], neighbors: ['junc_se_22', 'junc_e_pg'] },
  adeline_hall_dropoff: { id: 'adeline_hall_dropoff', position: [12, 0.09, 26], neighbors: ['junc_se_22', 'junc_s_22'] },
};

/**
 * Mapping from Landmark ID to its primary road dropoff node
 */
export const LANDMARK_ROAD_NODE_MAP: Record<string, string> = {
  senate_building: 'senate_dropoff',
  main_gate: 'main_gate_dropoff',
  law_faculty: 'law_dropoff',
  ict_center: 'ict_dropoff',
  library: 'library_dropoff',
  chapel: 'chapel_dropoff',
  mosque: 'mosque_dropoff',
  cafeteria: 'cafeteria_dropoff',
  sub: 'sub_dropoff',
  pg_school: 'pg_dropoff',
  stadium: 'stadium_dropoff',
  hostels_male: 'hostels_male_dropoff',
  hostels_female: 'hostels_female_dropoff',
  medical_centre: 'med_centre_dropoff',
  guesthouse: 'guesthouse_dropoff',
  lions_hall: 'lions_hall_dropoff',
  adeline_hall: 'adeline_hall_dropoff',
};

/**
 * Finds shortest road waypoint path between two landmark IDs using BFS
 */
export function findRoadPath(originLandmarkId: string, destLandmarkId: string): THREE.Vector3[] {
  let startNodeId = LANDMARK_ROAD_NODE_MAP[originLandmarkId] || 'hostels_male_dropoff';
  let endNodeId = LANDMARK_ROAD_NODE_MAP[destLandmarkId] || 'senate_dropoff';

  // If already at the destination, return a small approach path
  if (startNodeId === endNodeId) {
    const pt = CAMPUS_ROAD_NODES[startNodeId].position;
    return [
      new THREE.Vector3(pt[0], pt[1], pt[2] + 1),
      new THREE.Vector3(pt[0], pt[1], pt[2]),
    ];
  }

  // BFS Queue: [currentNodeId, pathOfNodeIds]
  const queue: [string, string[]][] = [[startNodeId, [startNodeId]]];
  const visited = new Set<string>([startNodeId]);
  let foundPathIds: string[] | null = null;

  while (queue.length > 0) {
    const [currentId, currentPath] = queue.shift()!;

    if (currentId === endNodeId) {
      foundPathIds = currentPath;
      break;
    }

    const node = CAMPUS_ROAD_NODES[currentId];
    if (!node) continue;

    for (const neighborId of node.neighbors) {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        queue.push([neighborId, [...currentPath, neighborId]]);
      }
    }
  }

  // Fallback if no path found
  if (!foundPathIds || foundPathIds.length < 2) {
    const sPos = CAMPUS_ROAD_NODES[startNodeId].position;
    const ePos = CAMPUS_ROAD_NODES[endNodeId].position;
    return [
      new THREE.Vector3(sPos[0], sPos[1], sPos[2]),
      new THREE.Vector3(ePos[0], ePos[1], ePos[2]),
    ];
  }

  // Convert node IDs to Vector3s
  const waypoints = foundPathIds.map((id) => {
    const pos = CAMPUS_ROAD_NODES[id].position;
    return new THREE.Vector3(pos[0], pos[1], pos[2]);
  });

  return waypoints;
}

/**
 * Creates a CatmullRomCurve3 from waypoints for silky smooth road travel interpolation
 */
export function createTransitCurve(waypoints: THREE.Vector3[]): THREE.CatmullRomCurve3 {
  // If fewer than 2 points, pad it
  if (waypoints.length === 1) {
    const p = waypoints[0];
    waypoints = [p.clone(), new THREE.Vector3(p.x, p.y, p.z + 0.1)];
  }

  // If only 2 points, insert a midpoint to allow CatmullRom smoothing
  if (waypoints.length === 2) {
    const mid = waypoints[0].clone().lerp(waypoints[1], 0.5);
    waypoints = [waypoints[0], mid, waypoints[1]];
  }

  return new THREE.CatmullRomCurve3(waypoints, false, 'catmullrom', 0.2);
}
