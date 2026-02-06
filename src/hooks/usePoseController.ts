import { useCallback, useRef, useState } from 'react';
import type { VRM } from '@pixiv/three-vrm';
import type { Pose, BoneRotation } from '../data/poses';
import { POSES } from '../data/poses';
import * as THREE from 'three';

interface UsePoseControllerOptions {
  transitionDuration?: number; // Duration of transition animation in ms
}

/**
 * Hook for controlling VRM avatar poses
 */
export function usePoseController(options: UsePoseControllerOptions = {}) {
  const { transitionDuration = 300 } = options;
  const [currentPoseId, setCurrentPoseId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const animationRef = useRef<number | null>(null);
  const originalRotations = useRef<Map<string, THREE.Euler>>(new Map());

  /**
   * Map pose bone names to VRM bone names
   */
  const getBoneFromVRM = (vrm: VRM, boneName: string): THREE.Object3D | null => {
    const humanoid = vrm.humanoid;
    if (!humanoid) return null;

    // Map our bone names to VRM humanoid bone names
    const boneMapping: Record<string, string> = {
      hips: 'hips',
      spine: 'spine',
      chest: 'chest',
      upperChest: 'upperChest',
      neck: 'neck',
      head: 'head',
      leftUpperArm: 'leftUpperArm',
      leftLowerArm: 'leftLowerArm',
      leftHand: 'leftHand',
      rightUpperArm: 'rightUpperArm',
      rightLowerArm: 'rightLowerArm',
      rightHand: 'rightHand',
      leftUpperLeg: 'leftUpperLeg',
      leftLowerLeg: 'leftLowerLeg',
      leftFoot: 'leftFoot',
      rightUpperLeg: 'rightUpperLeg',
      rightLowerLeg: 'rightLowerLeg',
      rightFoot: 'rightFoot'
    };

    const vrmBoneName = boneMapping[boneName];
    if (!vrmBoneName) return null;

    try {
      const boneNode = humanoid.getNormalizedBoneNode(vrmBoneName as any);
      return boneNode || null;
    } catch {
      return null;
    }
  };

  /**
   * Store original rotations for reset
   */
  const storeOriginalRotations = useCallback((vrm: VRM) => {
    if (!vrm.humanoid) return;

    originalRotations.current.clear();

    const boneNames = [
      'hips', 'spine', 'chest', 'upperChest', 'neck', 'head',
      'leftUpperArm', 'leftLowerArm', 'leftHand',
      'rightUpperArm', 'rightLowerArm', 'rightHand',
      'leftUpperLeg', 'leftLowerLeg', 'leftFoot',
      'rightUpperLeg', 'rightLowerLeg', 'rightFoot'
    ];

    for (const boneName of boneNames) {
      const bone = getBoneFromVRM(vrm, boneName);
      if (bone) {
        originalRotations.current.set(boneName, bone.rotation.clone());
      }
    }
  }, []);

  /**
   * Apply a pose to the VRM with smooth transition
   */
  const applyPose = useCallback(
    (vrm: VRM, pose: Pose) => {
      if (!vrm.humanoid) return;

      // Store original rotations on first pose
      if (originalRotations.current.size === 0) {
        storeOriginalRotations(vrm);
      }

      // Cancel any ongoing animation
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }

      setIsTransitioning(true);

      // Get current bone rotations
      const startRotations = new Map<string, THREE.Euler>();
      const targetRotations = new Map<string, THREE.Euler>();

      for (const boneRotation of pose.bones) {
        const bone = getBoneFromVRM(vrm, boneRotation.bone);
        if (bone) {
          startRotations.set(boneRotation.bone, bone.rotation.clone());
          targetRotations.set(
            boneRotation.bone,
            new THREE.Euler(
              boneRotation.rotation[0],
              boneRotation.rotation[1],
              boneRotation.rotation[2]
            )
          );
        }
      }

      // Animate the transition
      const startTime = performance.now();

      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / transitionDuration, 1);

        // Smooth easing
        const eased = 1 - Math.pow(1 - progress, 3);

        // Apply interpolated rotations
        for (const boneRotation of pose.bones) {
          const bone = getBoneFromVRM(vrm, boneRotation.bone);
          const start = startRotations.get(boneRotation.bone);
          const target = targetRotations.get(boneRotation.bone);

          if (bone && start && target) {
            bone.rotation.x = start.x + (target.x - start.x) * eased;
            bone.rotation.y = start.y + (target.y - start.y) * eased;
            bone.rotation.z = start.z + (target.z - start.z) * eased;
          }
        }

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setIsTransitioning(false);
          setCurrentPoseId(pose.id);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    },
    [transitionDuration, storeOriginalRotations]
  );

  /**
   * Apply pose by ID
   */
  const applyPoseById = useCallback(
    (vrm: VRM, poseId: string) => {
      const pose = POSES.find((p) => p.id === poseId);
      if (pose) {
        applyPose(vrm, pose);
      }
    },
    [applyPose]
  );

  /**
   * Reset to original pose
   */
  const resetPose = useCallback(
    (vrm: VRM) => {
      if (!vrm.humanoid || originalRotations.current.size === 0) return;

      // Cancel any ongoing animation
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }

      setIsTransitioning(true);

      // Get current bone rotations
      const startRotations = new Map<string, THREE.Euler>();

      for (const [boneName, originalRotation] of originalRotations.current) {
        const bone = getBoneFromVRM(vrm, boneName);
        if (bone) {
          startRotations.set(boneName, bone.rotation.clone());
        }
      }

      // Animate the transition
      const startTime = performance.now();

      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / transitionDuration, 1);

        // Smooth easing
        const eased = 1 - Math.pow(1 - progress, 3);

        // Apply interpolated rotations back to original
        for (const [boneName, originalRotation] of originalRotations.current) {
          const bone = getBoneFromVRM(vrm, boneName);
          const start = startRotations.get(boneName);

          if (bone && start) {
            bone.rotation.x = start.x + (originalRotation.x - start.x) * eased;
            bone.rotation.y = start.y + (originalRotation.y - start.y) * eased;
            bone.rotation.z = start.z + (originalRotation.z - start.z) * eased;
          }
        }

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setIsTransitioning(false);
          setCurrentPoseId(null);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    },
    [transitionDuration]
  );

  /**
   * Cleanup on unmount
   */
  const cleanup = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  return {
    currentPoseId,
    isTransitioning,
    applyPose,
    applyPoseById,
    resetPose,
    cleanup,
    poses: POSES
  };
}

export default usePoseController;
