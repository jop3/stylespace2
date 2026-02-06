/**
 * Idle animations for VRM avatars
 * Each animation contains keyframes for smooth looping
 */

export interface AnimationKeyframe {
  time: number; // 0-1 normalized time
  bones: {
    bone: string;
    rotation: [number, number, number]; // Euler angles in radians
  }[];
}

export interface IdleAnimation {
  id: string;
  name: string;
  emoji: string;
  description: string;
  duration: number; // Duration in milliseconds
  keyframes: AnimationKeyframe[];
  loop: boolean;
}

// Helper to convert degrees to radians
const deg2rad = (deg: number) => (deg * Math.PI) / 180;

export const IDLE_ANIMATIONS: IdleAnimation[] = [
  {
    id: 'breathing',
    name: 'Breathing',
    emoji: '🌬️',
    description: 'Subtle breathing motion',
    duration: 3000,
    loop: true,
    keyframes: [
      {
        time: 0,
        bones: [
          { bone: 'spine', rotation: [deg2rad(-2), 0, 0] },
          { bone: 'chest', rotation: [deg2rad(-2), 0, 0] }
        ]
      },
      {
        time: 0.5,
        bones: [
          { bone: 'spine', rotation: [deg2rad(2), 0, 0] },
          { bone: 'chest', rotation: [deg2rad(3), 0, 0] }
        ]
      },
      {
        time: 1,
        bones: [
          { bone: 'spine', rotation: [deg2rad(-2), 0, 0] },
          { bone: 'chest', rotation: [deg2rad(-2), 0, 0] }
        ]
      }
    ]
  },
  {
    id: 'looking-around',
    name: 'Looking Around',
    emoji: '👀',
    description: 'Head looks left and right',
    duration: 5000,
    loop: true,
    keyframes: [
      {
        time: 0,
        bones: [
          { bone: 'head', rotation: [0, 0, 0] },
          { bone: 'neck', rotation: [0, 0, 0] }
        ]
      },
      {
        time: 0.25,
        bones: [
          { bone: 'head', rotation: [deg2rad(-5), deg2rad(25), deg2rad(3)] },
          { bone: 'neck', rotation: [0, deg2rad(10), 0] }
        ]
      },
      {
        time: 0.5,
        bones: [
          { bone: 'head', rotation: [deg2rad(5), 0, 0] },
          { bone: 'neck', rotation: [deg2rad(3), 0, 0] }
        ]
      },
      {
        time: 0.75,
        bones: [
          { bone: 'head', rotation: [deg2rad(-5), deg2rad(-25), deg2rad(-3)] },
          { bone: 'neck', rotation: [0, deg2rad(-10), 0] }
        ]
      },
      {
        time: 1,
        bones: [
          { bone: 'head', rotation: [0, 0, 0] },
          { bone: 'neck', rotation: [0, 0, 0] }
        ]
      }
    ]
  },
  {
    id: 'arm-sway',
    name: 'Arm Sway',
    emoji: '💪',
    description: 'Gentle arm movement',
    duration: 4000,
    loop: true,
    keyframes: [
      {
        time: 0,
        bones: [
          { bone: 'leftUpperArm', rotation: [0, 0, deg2rad(-10)] },
          { bone: 'rightUpperArm', rotation: [0, 0, deg2rad(10)] }
        ]
      },
      {
        time: 0.5,
        bones: [
          { bone: 'leftUpperArm', rotation: [deg2rad(5), 0, deg2rad(-15)] },
          { bone: 'rightUpperArm', rotation: [deg2rad(-5), 0, deg2rad(15)] }
        ]
      },
      {
        time: 1,
        bones: [
          { bone: 'leftUpperArm', rotation: [0, 0, deg2rad(-10)] },
          { bone: 'rightUpperArm', rotation: [0, 0, deg2rad(10)] }
        ]
      }
    ]
  },
  {
    id: 'simple-dance',
    name: 'Simple Dance',
    emoji: '💃',
    description: 'Fun dancing motion',
    duration: 2000,
    loop: true,
    keyframes: [
      {
        time: 0,
        bones: [
          { bone: 'hips', rotation: [0, deg2rad(-10), 0] },
          { bone: 'spine', rotation: [0, deg2rad(5), 0] },
          { bone: 'leftUpperArm', rotation: [deg2rad(-30), 0, deg2rad(-30)] },
          { bone: 'rightUpperArm', rotation: [deg2rad(-60), 0, deg2rad(30)] }
        ]
      },
      {
        time: 0.25,
        bones: [
          { bone: 'hips', rotation: [0, 0, deg2rad(5)] },
          { bone: 'spine', rotation: [0, 0, deg2rad(-3)] },
          { bone: 'leftUpperArm', rotation: [deg2rad(-60), 0, deg2rad(-30)] },
          { bone: 'rightUpperArm', rotation: [deg2rad(-30), 0, deg2rad(30)] }
        ]
      },
      {
        time: 0.5,
        bones: [
          { bone: 'hips', rotation: [0, deg2rad(10), 0] },
          { bone: 'spine', rotation: [0, deg2rad(-5), 0] },
          { bone: 'leftUpperArm', rotation: [deg2rad(-60), 0, deg2rad(-30)] },
          { bone: 'rightUpperArm', rotation: [deg2rad(-30), 0, deg2rad(30)] }
        ]
      },
      {
        time: 0.75,
        bones: [
          { bone: 'hips', rotation: [0, 0, deg2rad(-5)] },
          { bone: 'spine', rotation: [0, 0, deg2rad(3)] },
          { bone: 'leftUpperArm', rotation: [deg2rad(-30), 0, deg2rad(-30)] },
          { bone: 'rightUpperArm', rotation: [deg2rad(-60), 0, deg2rad(30)] }
        ]
      },
      {
        time: 1,
        bones: [
          { bone: 'hips', rotation: [0, deg2rad(-10), 0] },
          { bone: 'spine', rotation: [0, deg2rad(5), 0] },
          { bone: 'leftUpperArm', rotation: [deg2rad(-30), 0, deg2rad(-30)] },
          { bone: 'rightUpperArm', rotation: [deg2rad(-60), 0, deg2rad(30)] }
        ]
      }
    ]
  },
  {
    id: 'spin',
    name: 'Spin',
    emoji: '🔄',
    description: 'Full body spin',
    duration: 2000,
    loop: true,
    keyframes: [
      {
        time: 0,
        bones: [
          { bone: 'hips', rotation: [0, 0, 0] },
          { bone: 'leftUpperArm', rotation: [deg2rad(-45), 0, deg2rad(-45)] },
          { bone: 'rightUpperArm', rotation: [deg2rad(-45), 0, deg2rad(45)] }
        ]
      },
      {
        time: 0.25,
        bones: [
          { bone: 'hips', rotation: [0, deg2rad(90), 0] },
          { bone: 'leftUpperArm', rotation: [deg2rad(-60), 0, deg2rad(-60)] },
          { bone: 'rightUpperArm', rotation: [deg2rad(-60), 0, deg2rad(60)] }
        ]
      },
      {
        time: 0.5,
        bones: [
          { bone: 'hips', rotation: [0, deg2rad(180), 0] },
          { bone: 'leftUpperArm', rotation: [deg2rad(-45), 0, deg2rad(-45)] },
          { bone: 'rightUpperArm', rotation: [deg2rad(-45), 0, deg2rad(45)] }
        ]
      },
      {
        time: 0.75,
        bones: [
          { bone: 'hips', rotation: [0, deg2rad(270), 0] },
          { bone: 'leftUpperArm', rotation: [deg2rad(-60), 0, deg2rad(-60)] },
          { bone: 'rightUpperArm', rotation: [deg2rad(-60), 0, deg2rad(60)] }
        ]
      },
      {
        time: 1,
        bones: [
          { bone: 'hips', rotation: [0, deg2rad(360), 0] },
          { bone: 'leftUpperArm', rotation: [deg2rad(-45), 0, deg2rad(-45)] },
          { bone: 'rightUpperArm', rotation: [deg2rad(-45), 0, deg2rad(45)] }
        ]
      }
    ]
  },
  {
    id: 'wave-continuous',
    name: 'Waving',
    emoji: '👋',
    description: 'Continuous waving',
    duration: 1500,
    loop: true,
    keyframes: [
      {
        time: 0,
        bones: [
          { bone: 'rightUpperArm', rotation: [deg2rad(-100), 0, deg2rad(60)] },
          { bone: 'rightLowerArm', rotation: [0, 0, deg2rad(20)] },
          { bone: 'rightHand', rotation: [0, 0, deg2rad(-20)] }
        ]
      },
      {
        time: 0.5,
        bones: [
          { bone: 'rightUpperArm', rotation: [deg2rad(-100), 0, deg2rad(60)] },
          { bone: 'rightLowerArm', rotation: [0, 0, deg2rad(40)] },
          { bone: 'rightHand', rotation: [0, 0, deg2rad(20)] }
        ]
      },
      {
        time: 1,
        bones: [
          { bone: 'rightUpperArm', rotation: [deg2rad(-100), 0, deg2rad(60)] },
          { bone: 'rightLowerArm', rotation: [0, 0, deg2rad(20)] },
          { bone: 'rightHand', rotation: [0, 0, deg2rad(-20)] }
        ]
      }
    ]
  }
];

// Get all animation IDs
export function getAnimationIds(): string[] {
  return IDLE_ANIMATIONS.map((a) => a.id);
}

// Get animation by ID
export function getAnimationById(id: string): IdleAnimation | undefined {
  return IDLE_ANIMATIONS.find((a) => a.id === id);
}
