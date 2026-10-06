import React from 'react';
import { IsometricCanvas } from './IsometricCanvas';

/**
 * HostelRoom component represents the interior student living space at Liids University (LU).
 * Wraps the IsometricCanvas providing the room's procedural furniture, lighting, and characters.
 */
export const HostelRoom: React.FC = () => {
  return <IsometricCanvas />;
};

export default HostelRoom;
