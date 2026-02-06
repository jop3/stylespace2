import { useMemo } from 'react'

/**
 * Scoring weights for mesh detection algorithm
 * Higher values = more confidence in the match
 */
export const DETECTION_SCORES = {
  /** Points for exact word boundary match on high priority keyword */
  HIGH_PRIORITY_EXACT: 10,
  /** Points for substring match on high priority keyword */
  HIGH_PRIORITY_SUBSTRING: 7,
  /** Points for exact word boundary match on medium priority keyword */
  MEDIUM_PRIORITY_EXACT: 5,
  /** Points for substring match on medium priority keyword */
  MEDIUM_PRIORITY_SUBSTRING: 3,
  /** Points for exact word boundary match on low priority keyword */
  LOW_PRIORITY_EXACT: 2,
  /** Bonus points when asset category matches body part */
  CATEGORY_BONUS: 3,
} as const

/**
 * Confidence thresholds for detection results
 */
export const CONFIDENCE_THRESHOLDS = {
  /** Minimum score for high confidence */
  HIGH_MIN_SCORE: 10,
  /** Minimum gap to second-best for high confidence */
  HIGH_MIN_GAP: 5,
  /** Minimum score for medium confidence */
  MEDIUM_MIN_SCORE: 5,
  /** Minimum gap to second-best for medium confidence */
  MEDIUM_MIN_GAP: 2,
} as const

/**
 * Confidence level for mesh detection
 */
export type DetectionConfidence = 'low' | 'medium' | 'high'

/**
 * Result of mesh target analysis
 */
export interface MeshDetectionResult {
  /** The suggested mesh group name, or null if no match */
  meshName: string | null
  /** Confidence level of the detection */
  confidence: DetectionConfidence | null
  /** Alternative mesh suggestions (up to 2) */
  alternatives: string[]
}

/**
 * Priority-weighted keywords for each mesh group
 * High = most specific/reliable, Low = least specific
 */
export const MESH_HINTS: Record<string, { high: string[]; medium: string[]; low: string[] }> = {
  Face: {
    high: ['face', 'facial', 'makeup', 'skintone', 'complexion'],
    medium: ['head', 'skin', 'portrait'],
    low: ['eye', 'mouth', 'nose', 'cheek', 'forehead'],
  },
  Body: {
    high: ['torso', 'bodytexture', 'bodyskin'],
    medium: ['body', 'chest', 'shirt', 'top', 'dress', 'jacket', 'coat', 'blouse', 'sweater'],
    low: ['clothing', 'fabric', 'wear'],
  },
  Hair: {
    high: ['hair', 'hairstyle', 'haircolor'],
    medium: ['wig', 'bangs', 'ponytail'],
    low: ['strand', 'curl'],
  },
  Leg: {
    high: ['pants', 'trousers', 'jeans', 'leggings'],
    medium: ['leg', 'skirt', 'shorts', 'legwear'],
    low: ['thigh', 'knee', 'shin'],
  },
  Arm: {
    high: ['sleeve', 'armwear', 'gloves'],
    medium: ['arm', 'forearm', 'bicep'],
    low: ['hand', 'wrist', 'elbow'],
  },
  Foot: {
    high: ['shoe', 'boot', 'footwear', 'sneaker', 'sandal'],
    medium: ['foot', 'feet', 'sock', 'stocking'],
    low: ['toe', 'heel', 'ankle'],
  },
}

/**
 * Pre-compiled regex patterns for mesh detection keywords
 * Memoized to avoid recreation on each analysis call
 */
export interface CompiledPatterns {
  wordBoundary: RegExp
  contains: RegExp
}

/**
 * Creates pre-compiled regex patterns for all keywords
 */
function compilePatterns(): Map<string, CompiledPatterns> {
  const patterns = new Map<string, CompiledPatterns>()

  for (const priorities of Object.values(MESH_HINTS)) {
    for (const keywords of [priorities.high, priorities.medium, priorities.low]) {
      for (const keyword of keywords) {
        if (!patterns.has(keyword)) {
          patterns.set(keyword, {
            wordBoundary: new RegExp(`\\b${keyword}\\b`, 'i'),
            contains: new RegExp(keyword, 'i'),
          })
        }
      }
    }
  }

  return patterns
}

// Pre-compile patterns once at module load
const COMPILED_PATTERNS = compilePatterns()

/**
 * Analyzes a filename/asset name to determine the best mesh target
 *
 * @param assetName - The name of the asset/file to analyze
 * @param availableMeshGroups - Set of mesh group names available in the current VRM
 * @param category - Optional asset category for bonus scoring
 * @returns Detection result with suggested mesh, confidence, and alternatives
 *
 * @example
 * ```ts
 * const result = analyzeMeshTarget('red_pants_texture.png', meshGroups)
 * // result: { meshName: 'Leg', confidence: 'high', alternatives: ['Body'] }
 * ```
 */
export function analyzeMeshTarget(
  assetName: string,
  availableMeshGroups: Set<string> | Map<string, unknown>,
  category?: string
): MeshDetectionResult {
  const lower = assetName.toLowerCase()
  const categoryLower = category?.toLowerCase() || ''

  // Convert Map to Set if needed
  const groupSet =
    availableMeshGroups instanceof Map
      ? new Set(availableMeshGroups.keys())
      : availableMeshGroups

  // Score each mesh group
  const scores: Record<string, number> = {}

  for (const [groupName, priorities] of Object.entries(MESH_HINTS)) {
    let score = 0

    // Check high priority keywords
    for (const keyword of priorities.high) {
      const patterns = COMPILED_PATTERNS.get(keyword)
      if (patterns) {
        if (patterns.wordBoundary.test(lower)) {
          score += DETECTION_SCORES.HIGH_PRIORITY_EXACT
        } else if (patterns.contains.test(lower)) {
          score += DETECTION_SCORES.HIGH_PRIORITY_SUBSTRING
        }
      }
    }

    // Check medium priority keywords
    for (const keyword of priorities.medium) {
      const patterns = COMPILED_PATTERNS.get(keyword)
      if (patterns) {
        if (patterns.wordBoundary.test(lower)) {
          score += DETECTION_SCORES.MEDIUM_PRIORITY_EXACT
        } else if (patterns.contains.test(lower)) {
          score += DETECTION_SCORES.MEDIUM_PRIORITY_SUBSTRING
        }
      }
    }

    // Check low priority keywords
    for (const keyword of priorities.low) {
      const patterns = COMPILED_PATTERNS.get(keyword)
      if (patterns?.wordBoundary.test(lower)) {
        score += DETECTION_SCORES.LOW_PRIORITY_EXACT
      }
    }

    // Category context bonus
    if (categoryLower && categoryLower.includes(groupName.toLowerCase())) {
      score += DETECTION_SCORES.CATEGORY_BONUS
    }

    if (score > 0) {
      scores[groupName] = score
    }
  }

  // Sort by score and filter to only existing mesh groups
  const sortedMatches = Object.entries(scores)
    .filter(([groupName]) => groupSet.has(groupName))
    .sort(([, a], [, b]) => b - a)

  if (sortedMatches.length === 0) {
    return { meshName: null, confidence: null, alternatives: [] }
  }

  const [bestMatch, bestScore] = sortedMatches[0]
  const alternatives = sortedMatches.slice(1, 3).map(([name]) => name)

  // Determine confidence based on score and gap to next best match
  const secondBestScore = sortedMatches[1]?.[1] || 0
  const scoreGap = bestScore - secondBestScore

  let confidence: DetectionConfidence
  if (
    bestScore >= CONFIDENCE_THRESHOLDS.HIGH_MIN_SCORE &&
    scoreGap >= CONFIDENCE_THRESHOLDS.HIGH_MIN_GAP
  ) {
    confidence = 'high'
  } else if (
    bestScore >= CONFIDENCE_THRESHOLDS.MEDIUM_MIN_SCORE &&
    scoreGap >= CONFIDENCE_THRESHOLDS.MEDIUM_MIN_GAP
  ) {
    confidence = 'medium'
  } else {
    confidence = 'low'
  }

  return {
    meshName: bestMatch,
    confidence,
    alternatives,
  }
}

/**
 * React hook that provides memoized mesh detection functionality
 *
 * @param availableMeshGroups - Map of available mesh groups from VRM
 * @returns Function to analyze asset names for mesh targeting
 */
export function useSmartMeshDetection(
  availableMeshGroups: Map<string, unknown>
): (assetName: string, category?: string) => MeshDetectionResult {
  return useMemo(() => {
    return (assetName: string, category?: string) =>
      analyzeMeshTarget(assetName, availableMeshGroups, category)
  }, [availableMeshGroups])
}
