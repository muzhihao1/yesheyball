/**
 * WeaknessRecommendation Component
 *
 * Identifies user's weakest ability dimension and provides targeted training recommendations.
 *
 * Features:
 * - Automatically identifies the lowest ability score
 * - Displays weakness name and score
 * - Provides actionable training suggestions
 * - Links to specialized training (Skills Library) and daily training (90-Day Challenge)
 *
 * @example
 * ```tsx
 * <WeaknessRecommendation abilityScores={scores} />
 * ```
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingDown, Target } from "lucide-react";
import { useLocation } from "wouter";
import type { AbilityScores } from "@/hooks/useAbilityScores";

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Component props
 */
interface WeaknessRecommendationProps {
  /**
   * User's ability scores (5-dimensional scoring system)
   */
  abilityScores: AbilityScores | undefined;
}

/**
 * Ability dimension identifier
 */
type AbilityKey = 'accuracy' | 'spin' | 'positioning' | 'power' | 'strategy';

/**
 * Weakness analysis result
 */
interface Weakness {
  /**
   * Dimension key (e.g., 'accuracy', 'spin')
   */
  key: AbilityKey;

  /**
   * Chinese display name (e.g., '准度', '杆法')
   */
  label: string;

  /**
   * Score value (0-100)
   */
  score: number;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Ability dimension labels (English key → Chinese label)
 */
const abilityLabels: Record<AbilityKey, string> = {
  accuracy: '准度',
  spin: '杆法',
  positioning: '走位',
  power: '发力',
  strategy: '策略',
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Identifies the weakest ability dimension
 *
 * Finds the dimension with the lowest score among the 5 core abilities.
 * Excludes 'clearance' as it's a composite score.
 *
 * @param scores - User's ability scores
 * @returns Weakness analysis result or null if no valid scores
 *
 * @example
 * ```ts
 * const weakness = findWeakestAbility({ accuracy: 70, spin: 50, ... });
 * console.log(weakness); // { key: 'spin', label: '杆法', score: 50 }
 * ```
 */
function findWeakestAbility(scores: AbilityScores | undefined): Weakness | null {
  if (!scores) return null;

  // Extract only the 5 core abilities (exclude clearance)
  const abilities: AbilityKey[] = ['accuracy', 'spin', 'positioning', 'power', 'strategy'];

  let minScore = Infinity;
  let weakestKey: AbilityKey | null = null;

  // Find the ability with minimum score
  for (const key of abilities) {
    const score = scores[key];
    if (score < minScore) {
      minScore = score;
      weakestKey = key;
    }
  }

  if (!weakestKey) return null;

  return {
    key: weakestKey,
    label: abilityLabels[weakestKey],
    score: minScore,
  };
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * WeaknessRecommendation component
 *
 * Displays user's weakest ability and provides training recommendations.
 */
export function WeaknessRecommendation({ abilityScores }: WeaknessRecommendationProps) {
  const [, setLocation] = useLocation();

  // Identify weakest ability
  const weakness = findWeakestAbility(abilityScores);

  // If no valid weakness found, don't render the component
  if (!weakness) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingDown className="h-5 w-5 text-orange-600" />
          您的薄弱环节
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Weakness Display */}
        <div className="p-4 bg-white rounded-lg border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-orange-600">
              {weakness.label}
            </span>
            <span className="text-3xl font-bold text-orange-500">
              {weakness.score}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            针对性训练可快速提升
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => setLocation('/tasks')}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Target className="h-4 w-4 mr-2" />
            去专项训练
          </Button>

          <Button
            onClick={() => setLocation('/ninety-day-challenge')}
            variant="outline"
            className="flex-1 border-orange-600 text-orange-600 hover:bg-orange-50"
          >
            继续今日训练
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
