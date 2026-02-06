import { useCallback, useRef, useState, useEffect } from 'react';
import type { VRM } from '@pixiv/three-vrm';
import type { IdleAnimation, AnimationKeyframe } from '../data/animations';
import { IDLE_ANIMATIONS, getAnimationById } from '../data/animations';
import * as THREE from 'three';

interface UseAnimationControllerOptions {
  autoPlay?: boolean;
  defaultAnimationId?: string;
}

/**
 * Hook for controlling VRM avatar animations
 */
export function useAnimationController(options: UseAnimationControllerOptions = {}) {
  const { autoPlay = false, defaultAnimationId } = options;
  const [currentAnimationId, setCurrentAnimationId] = useState<string | null>(
    autoPlay && defaultAnimationId ? defaultAnimationId : null
  );
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const vrmRef = useRef<VRM | null>(null);

  /**
   * Map pose bone names to VRM bone names
   */
  const getBoneFromVRM = (vrm: VRM, boneName: string): THREE.Object3D | null => {
    const humanoid = vrm.humanoid;
    if (!humanoid) return null;

    try {
      const boneNode = humanoid.getNormalizedBoneNode(boneName as any);
      return boneNode || null;
    } catch {
      return null;
    }
  };

  /**
   * Interpolate between keyframes
   */
  const interpolateKeyframes = (
    animation: IdleAnimation,
    normalizedTime: number
  ): Map<string, THREE.Euler> => {
    const result = new Map<string, THREE.Euler>();
    const { keyframes } = animation;

    // Find surrounding keyframes
    let prevKeyframe: AnimationKeyframe = keyframes[0];
    let nextKeyframe: AnimationKeyframe = keyframes[0];

    for (let i = 0; i < keyframes.length - 1; i++) {
      if (normalizedTime >= keyframes[i].time && normalizedTime <= keyframes[i + 1].time) {
        prevKeyframe = keyframes[i];
        nextKeyframe = keyframes[i + 1];
        break;
      }
    }

    // Calculate interpolation factor
    const range = nextKeyframe.time - prevKeyframe.time;
    const factor = range > 0 ? (normalizedTime - prevKeyframe.time) / range : 0;

    // Smooth easing
    const eased = factor * factor * (3 - 2 * factor); // Smoothstep

    // Get all bone names from both keyframes
    const boneNames = new Set<string>();
    prevKeyframe.bones.forEach((b) => boneNames.add(b.bone));
    nextKeyframe.bones.forEach((b) => boneNames.add(b.bone));

    // Interpolate each bone
    for (const boneName of boneNames) {
      const prevBone = prevKeyframe.bones.find((b) => b.bone === boneName);
      const nextBone = nextKeyframe.bones.find((b) => b.bone === boneName);

      if (prevBone && nextBone) {
        result.set(
          boneName,
          new THREE.Euler(
            prevBone.rotation[0] + (nextBone.rotation[0] - prevBone.rotation[0]) * eased,
            prevBone.rotation[1] + (nextBone.rotation[1] - prevBone.rotation[1]) * eased,
            prevBone.rotation[2] + (nextBone.rotation[2] - prevBone.rotation[2]) * eased
          )
        );
      } else if (prevBone) {
        result.set(boneName, new THREE.Euler(...prevBone.rotation));
      } else if (nextBone) {
        result.set(boneName, new THREE.Euler(...nextBone.rotation));
      }
    }

    return result;
  };

  /**
   * Animation loop
   */
  const animate = useCallback(() => {
    const vrm = vrmRef.current;
    const animationId = currentAnimationId;

    if (!vrm || !animationId || !isPlaying) return;

    const animation = getAnimationById(animationId);
    if (!animation) return;

    const elapsed = performance.now() - startTimeRef.current;
    let normalizedTime = (elapsed % animation.duration) / animation.duration;

    // If not looping, clamp to 1
    if (!animation.loop && elapsed >= animation.duration) {
      normalizedTime = 1;
      setIsPlaying(false);
      return;
    }

    // Get interpolated rotations
    const rotations = interpolateKeyframes(animation, normalizedTime);

    // Apply to bones
    for (const [boneName, rotation] of rotations) {
      const bone = getBoneFromVRM(vrm, boneName);
      if (bone) {
        bone.rotation.copy(rotation);
      }
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [currentAnimationId, isPlaying]);

  /**
   * Start animation
   */
  const playAnimation = useCallback(
    (vrm: VRM, animationId: string) => {
      // Cancel any ongoing animation
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }

      vrmRef.current = vrm;
      setCurrentAnimationId(animationId);
      setIsPlaying(true);
      startTimeRef.current = performance.now();
    },
    []
  );

  /**
   * Stop animation
   */
  const stopAnimation = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  /**
   * Pause animation
   */
  const pauseAnimation = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  /**
   * Resume animation
   */
  const resumeAnimation = useCallback(() => {
    if (currentAnimationId && vrmRef.current) {
      setIsPlaying(true);
      startTimeRef.current = performance.now();
    }
  }, [currentAnimationId]);

  // Start animation loop when playing
  useEffect(() => {
    if (isPlaying && currentAnimationId && vrmRef.current) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentAnimationId, animate]);

  /**
   * Cleanup on unmount
   */
  const cleanup = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }
    vrmRef.current = null;
  }, []);

  return {
    currentAnimationId,
    isPlaying,
    playAnimation,
    stopAnimation,
    pauseAnimation,
    resumeAnimation,
    cleanup,
    animations: IDLE_ANIMATIONS
  };
}

export default useAnimationController;
