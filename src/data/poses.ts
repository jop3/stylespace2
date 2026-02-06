/**
 * Pre-defined poses for VRM avatars
 * Each pose contains bone rotation data
 */

export interface BoneRotation {
  bone: string;
  rotation: [number, number, number]; // Euler angles in radians
}

export interface Pose {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: 'basic' | 'fun' | 'action' | 'elegant';
  bones: BoneRotation[];
  // Some poses might need morph targets for expressions
  expressions?: { [key: string]: number };
}

// Helper to convert degrees to radians
const deg2rad = (deg: number) => (deg * Math.PI) / 180;

export const POSES: Pose[] = [
  // Basic poses
  {
    id: 'standing',
    name: 'Standing',
    emoji: '🧍',
    description: 'Natural standing pose',
    category: 'basic',
    bones: [
      { bone: 'leftUpperArm', rotation: [0, 0, deg2rad(-10)] },
      { bone: 'rightUpperArm', rotation: [0, 0, deg2rad(10)] },
      { bone: 'leftLowerArm', rotation: [0, 0, deg2rad(-5)] },
      { bone: 'rightLowerArm', rotation: [0, 0, deg2rad(5)] }
    ]
  },
  {
    id: 'relaxed',
    name: 'Relaxed',
    emoji: '😌',
    description: 'Casual relaxed pose',
    category: 'basic',
    bones: [
      { bone: 'spine', rotation: [deg2rad(-5), 0, 0] },
      { bone: 'leftUpperArm', rotation: [0, 0, deg2rad(-20)] },
      { bone: 'rightUpperArm', rotation: [0, 0, deg2rad(20)] },
      { bone: 'leftLowerArm', rotation: [0, 0, deg2rad(-30)] },
      { bone: 'rightLowerArm', rotation: [0, 0, deg2rad(30)] }
    ]
  },

  // Fun poses
  {
    id: 'waving',
    name: 'Waving',
    emoji: '👋',
    description: 'Friendly wave',
    category: 'fun',
    bones: [
      { bone: 'rightUpperArm', rotation: [deg2rad(-90), 0, deg2rad(60)] },
      { bone: 'rightLowerArm', rotation: [0, 0, deg2rad(30)] },
      { bone: 'rightHand', rotation: [0, 0, deg2rad(20)] },
      { bone: 'leftUpperArm', rotation: [0, 0, deg2rad(-15)] },
      { bone: 'leftLowerArm', rotation: [0, 0, deg2rad(-10)] }
    ]
  },
  {
    id: 'peace',
    name: 'Peace Sign',
    emoji: '✌️',
    description: 'Peace sign pose',
    category: 'fun',
    bones: [
      { bone: 'rightUpperArm', rotation: [deg2rad(-45), deg2rad(-30), deg2rad(45)] },
      { bone: 'rightLowerArm', rotation: [deg2rad(-45), 0, 0] },
      { bone: 'leftUpperArm', rotation: [0, 0, deg2rad(-20)] },
      { bone: 'leftLowerArm', rotation: [0, 0, deg2rad(-15)] },
      { bone: 'head', rotation: [0, deg2rad(10), deg2rad(-5)] }
    ]
  },
  {
    id: 'thinking',
    name: 'Thinking',
    emoji: '🤔',
    description: 'Thoughtful pose',
    category: 'fun',
    bones: [
      { bone: 'rightUpperArm', rotation: [deg2rad(-60), deg2rad(-30), deg2rad(30)] },
      { bone: 'rightLowerArm', rotation: [deg2rad(-90), 0, 0] },
      { bone: 'head', rotation: [deg2rad(-10), deg2rad(15), deg2rad(5)] },
      { bone: 'leftUpperArm', rotation: [deg2rad(-30), 0, deg2rad(-45)] },
      { bone: 'leftLowerArm', rotation: [deg2rad(-45), 0, deg2rad(-30)] }
    ]
  },

  // Action poses
  {
    id: 'superhero',
    name: 'Superhero',
    emoji: '🦸',
    description: 'Heroic power pose',
    category: 'action',
    bones: [
      { bone: 'spine', rotation: [deg2rad(10), 0, 0] },
      { bone: 'chest', rotation: [deg2rad(10), 0, 0] },
      { bone: 'leftUpperArm', rotation: [deg2rad(-30), 0, deg2rad(-60)] },
      { bone: 'rightUpperArm', rotation: [deg2rad(-30), 0, deg2rad(60)] },
      { bone: 'leftLowerArm', rotation: [deg2rad(-45), 0, 0] },
      { bone: 'rightLowerArm', rotation: [deg2rad(-45), 0, 0] },
      { bone: 'leftUpperLeg', rotation: [0, 0, deg2rad(-15)] },
      { bone: 'rightUpperLeg', rotation: [0, 0, deg2rad(15)] }
    ]
  },
  {
    id: 'victory',
    name: 'Victory',
    emoji: '🙌',
    description: 'Arms raised in victory',
    category: 'action',
    bones: [
      { bone: 'spine', rotation: [deg2rad(5), 0, 0] },
      { bone: 'leftUpperArm', rotation: [deg2rad(-170), 0, deg2rad(-20)] },
      { bone: 'rightUpperArm', rotation: [deg2rad(-170), 0, deg2rad(20)] },
      { bone: 'leftLowerArm', rotation: [deg2rad(-20), 0, 0] },
      { bone: 'rightLowerArm', rotation: [deg2rad(-20), 0, 0] },
      { bone: 'head', rotation: [deg2rad(-15), 0, 0] }
    ]
  },
  {
    id: 'running',
    name: 'Running',
    emoji: '🏃',
    description: 'Dynamic running pose',
    category: 'action',
    bones: [
      { bone: 'spine', rotation: [deg2rad(15), 0, 0] },
      { bone: 'leftUpperArm', rotation: [deg2rad(30), 0, deg2rad(-30)] },
      { bone: 'rightUpperArm', rotation: [deg2rad(-60), 0, deg2rad(30)] },
      { bone: 'leftLowerArm', rotation: [deg2rad(-90), 0, 0] },
      { bone: 'rightLowerArm', rotation: [deg2rad(-45), 0, 0] },
      { bone: 'leftUpperLeg', rotation: [deg2rad(-60), 0, 0] },
      { bone: 'rightUpperLeg', rotation: [deg2rad(30), 0, 0] },
      { bone: 'leftLowerLeg', rotation: [deg2rad(30), 0, 0] },
      { bone: 'rightLowerLeg', rotation: [deg2rad(-60), 0, 0] }
    ]
  },

  // Elegant poses
  {
    id: 'curtsy',
    name: 'Curtsy',
    emoji: '👗',
    description: 'Elegant curtsy',
    category: 'elegant',
    bones: [
      { bone: 'spine', rotation: [deg2rad(15), 0, 0] },
      { bone: 'hips', rotation: [deg2rad(10), 0, 0] },
      { bone: 'leftUpperLeg', rotation: [deg2rad(-30), 0, deg2rad(-20)] },
      { bone: 'rightUpperLeg', rotation: [deg2rad(-60), 0, deg2rad(10)] },
      { bone: 'leftLowerLeg', rotation: [deg2rad(45), 0, 0] },
      { bone: 'rightLowerLeg', rotation: [deg2rad(90), 0, 0] },
      { bone: 'leftUpperArm', rotation: [deg2rad(-30), 0, deg2rad(-45)] },
      { bone: 'rightUpperArm', rotation: [deg2rad(-30), 0, deg2rad(45)] }
    ]
  },
  {
    id: 'model',
    name: 'Model Pose',
    emoji: '💃',
    description: 'Fashionable model stance',
    category: 'elegant',
    bones: [
      { bone: 'hips', rotation: [0, deg2rad(-15), 0] },
      { bone: 'spine', rotation: [0, deg2rad(10), 0] },
      { bone: 'leftUpperLeg', rotation: [deg2rad(-10), deg2rad(10), deg2rad(-5)] },
      { bone: 'rightUpperLeg', rotation: [deg2rad(5), deg2rad(-5), deg2rad(5)] },
      { bone: 'leftUpperArm', rotation: [0, 0, deg2rad(-25)] },
      { bone: 'rightUpperArm', rotation: [deg2rad(-30), deg2rad(-20), deg2rad(30)] },
      { bone: 'rightLowerArm', rotation: [deg2rad(-45), 0, 0] },
      { bone: 'head', rotation: [deg2rad(-5), deg2rad(10), deg2rad(5)] }
    ]
  },
  {
    id: 'sitting',
    name: 'Sitting',
    emoji: '🪑',
    description: 'Seated pose',
    category: 'elegant',
    bones: [
      { bone: 'hips', rotation: [deg2rad(-90), 0, 0] },
      { bone: 'spine', rotation: [deg2rad(10), 0, 0] },
      { bone: 'leftUpperLeg', rotation: [deg2rad(90), 0, deg2rad(-10)] },
      { bone: 'rightUpperLeg', rotation: [deg2rad(90), 0, deg2rad(10)] },
      { bone: 'leftLowerLeg', rotation: [deg2rad(-90), 0, 0] },
      { bone: 'rightLowerLeg', rotation: [deg2rad(-90), 0, 0] },
      { bone: 'leftUpperArm', rotation: [deg2rad(-30), 0, deg2rad(-30)] },
      { bone: 'rightUpperArm', rotation: [deg2rad(-30), 0, deg2rad(30)] },
      { bone: 'leftLowerArm', rotation: [deg2rad(-60), 0, deg2rad(-20)] },
      { bone: 'rightLowerArm', rotation: [deg2rad(-60), 0, deg2rad(20)] }
    ]
  }
];

// Get poses by category
export function getPosesByCategory(category: Pose['category']): Pose[] {
  return POSES.filter((p) => p.category === category);
}

// Get all pose categories
export function getPoseCategories(): Pose['category'][] {
  return ['basic', 'fun', 'action', 'elegant'];
}

// Get category label
export function getCategoryLabel(category: Pose['category']): string {
  const labels: Record<Pose['category'], string> = {
    basic: 'Basic',
    fun: 'Fun',
    action: 'Action',
    elegant: 'Elegant'
  };
  return labels[category];
}

// Get category emoji
export function getCategoryEmoji(category: Pose['category']): string {
  const emojis: Record<Pose['category'], string> = {
    basic: '🧍',
    fun: '😄',
    action: '💪',
    elegant: '✨'
  };
  return emojis[category];
}
