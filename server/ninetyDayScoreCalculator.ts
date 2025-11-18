/**
 * 90-Day Challenge Score Calculator
 *
 * Calculates ability score changes for 90-day training submissions.
 * Handles three training types:
 * - 系统训练 (System): Course-driven, uses processTrainingRecord
 * - 自由训练 (Free): User-selected focus areas
 * - 特殊训练 (Special): 1.5x bonus, balanced growth
 */

import type { ScoreChanges, AbilityDimension } from "./abilityScoreEngine.js";

/**
 * Calculate score changes for free training (自由训练)
 * User selects focus areas, points distributed to those areas
 *
 * @param successRate - Success rate percentage (0-100)
 * @param achievedTarget - Whether user achieved training target
 * @param focusAreas - Selected focus areas (准度, 走位, 杆法, 发力, 策略)
 * @returns Score changes for each ability dimension
 */
export function calculateFreeTrainingScores(
  successRate: number | null,
  achievedTarget: boolean,
  focusAreas: string[] = []
): ScoreChanges {
  // Base points calculation
  let basePoints = 0;

  if (achievedTarget) {
    // Bonus for achieving target
    basePoints += 5;
  }

  if (successRate !== null) {
    // Additional points based on success rate
    if (successRate >= 90) {
      basePoints += 5; // Excellent performance
    } else if (successRate >= 70) {
      basePoints += 3; // Good performance
    } else if (successRate >= 50) {
      basePoints += 2; // Average performance
    } else if (successRate >= 30) {
      basePoints += 1; // Below average
    }
  }

  // If no focus areas specified, distribute evenly to all dimensions
  const targetAreas: AbilityDimension[] = focusAreas.length > 0
    ? mapFocusAreasToAbilityDimensions(focusAreas)
    : ['accuracy', 'spin', 'positioning', 'power', 'strategy'];

  // Distribute points evenly across focus areas
  const pointsPerArea = Math.round(basePoints / targetAreas.length);

  const scoreChanges: ScoreChanges = {};
  targetAreas.forEach(dimension => {
    scoreChanges[dimension] = pointsPerArea;
  });

  return scoreChanges;
}

/**
 * Calculate score changes for special training (特殊训练)
 * 1.5x bonus multiplier, balanced growth across all dimensions
 *
 * @param successRate - Success rate percentage (0-100)
 * @param achievedTarget - Whether user achieved training target
 * @returns Score changes for each ability dimension
 */
export function calculateSpecialTrainingScores(
  successRate: number | null,
  achievedTarget: boolean
): ScoreChanges {
  // Calculate base scores (same as free training with all areas)
  const baseScores = calculateFreeTrainingScores(
    successRate,
    achievedTarget,
    [] // Empty = all dimensions
  );

  // Apply 1.5x multiplier for special training
  const scoreChanges: ScoreChanges = {};
  const dimensions: AbilityDimension[] = ['accuracy', 'spin', 'positioning', 'power', 'strategy'];

  dimensions.forEach(dimension => {
    const baseScore = baseScores[dimension] || 0;
    scoreChanges[dimension] = Math.round(baseScore * 1.5);
  });

  return scoreChanges;
}

/**
 * Calculate clearance score change (total of all dimension changes)
 * Clearance Score = Sum of all 5 dimensions (0-500 range)
 *
 * @param scoreChanges - Individual dimension score changes
 * @returns Total clearance score change
 */
export function calculateClearanceChange(scoreChanges: ScoreChanges): number {
  const dimensions: AbilityDimension[] = ['accuracy', 'spin', 'positioning', 'power', 'strategy'];
  return dimensions.reduce((total, dim) => total + (scoreChanges[dim] || 0), 0);
}

/**
 * Map Chinese focus area names to ability dimensions
 *
 * @param focusAreas - Chinese focus area names
 * @returns Ability dimension names
 */
function mapFocusAreasToAbilityDimensions(focusAreas: string[]): AbilityDimension[] {
  const mapping: Record<string, AbilityDimension> = {
    '准度': 'accuracy',
    '走位': 'positioning',
    '杆法': 'spin',
    '发力': 'power',
    '策略': 'strategy',
  };

  return focusAreas
    .map(area => mapping[area])
    .filter(dim => dim !== undefined) as AbilityDimension[];
}

/**
 * Main entry point: Calculate score changes for a 90-day training submission
 * Routes to appropriate calculation based on training type
 *
 * @param trainingType - Training type (系统, 自由, 特殊)
 * @param successRate - Success rate percentage (0-100)
 * @param achievedTarget - Whether user achieved training target
 * @param focusAreas - Selected focus areas (for free training)
 * @returns Score changes with clearance score
 */
export function calculateNinetyDayScoreChanges(
  trainingType: string,
  successRate: number | null,
  achievedTarget: boolean,
  focusAreas: string[] = []
): ScoreChanges {
  let scoreChanges: ScoreChanges = {};

  switch (trainingType) {
    case '自由':
      scoreChanges = calculateFreeTrainingScores(successRate, achievedTarget, focusAreas);
      break;

    case '特殊':
      scoreChanges = calculateSpecialTrainingScores(successRate, achievedTarget);
      break;

    case '系统':
      // System training uses course-driven logic from abilityScoreEngine.ts
      // This will be handled separately in the POST endpoint
      // For now, return balanced growth similar to special but without bonus
      scoreChanges = calculateFreeTrainingScores(successRate, achievedTarget, []);
      break;

    default:
      console.warn(`Unknown training type: ${trainingType}, defaulting to balanced growth`);
      scoreChanges = calculateFreeTrainingScores(successRate, achievedTarget, []);
  }

  // Add clearance score change (sum of all dimensions)
  scoreChanges.clearance = calculateClearanceChange(scoreChanges);

  return scoreChanges;
}
