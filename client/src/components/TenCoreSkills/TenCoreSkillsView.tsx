/**
 * TenCoreSkillsView Component
 *
 * Main container component for the Ten Core Skills system.
 * Orchestrates all child components and manages navigation state.
 */

import { useState, useMemo } from 'react';
import ProgressHeader from './ProgressHeader';
import SkillsOverview from './SkillsOverview';
import SubSkillsView from './SubSkillsView';
import TrainingUnitModal from './TrainingUnitModal';
import {
  useSkillsV3,
  useUserSkillProgressV3,
  useUserUnitCompletions,
  type SkillV3,
  type TrainingUnitV3,
} from '@/hooks/useSkillsV3';

function TenCoreSkillsView() {
  // Navigation state
  const [selectedSkill, setSelectedSkill] = useState<SkillV3 | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<TrainingUnitV3 | null>(null);
  const [showUnitModal, setShowUnitModal] = useState(false);

  // Fetch all data
  const { data: skills = [], isLoading: skillsLoading } = useSkillsV3();
  const { data: userProgress = [], isLoading: progressLoading } = useUserSkillProgressV3();
  const { data: allCompletions = [] } = useUserUnitCompletions();

  // Calculate overall statistics
  const stats = useMemo(() => {
    const totalSkills = skills.length;
    const completedSkills = userProgress.filter((p) => p.completedSubSkills >= 3).length;
    const totalXP = userProgress.reduce((sum, p) => sum + p.totalXpEarned, 0);

    // Calculate sub-skills stats
    const totalSubSkills = totalSkills * 3; // 3 sub-skills per skill
    const completedSubSkills = userProgress.reduce((sum, p) => sum + p.completedSubSkills, 0);

    return {
      totalSkills,
      completedSkills,
      totalXP,
      totalSubSkills,
      completedSubSkills,
    };
  }, [skills, userProgress]);

  // Handle skill selection
  const handleSkillClick = (skill: SkillV3) => {
    setSelectedSkill(skill);
  };

  // Handle back to skills overview
  const handleBackToOverview = () => {
    setSelectedSkill(null);
  };

  // Handle unit click
  const handleUnitClick = (unit: TrainingUnitV3) => {
    setSelectedUnit(unit);
    setShowUnitModal(true);
  };

  // Handle unit modal close
  const handleUnitModalClose = () => {
    setShowUnitModal(false);
    setSelectedUnit(null);
  };

  // Loading state
  if (skillsLoading || progressLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Header Skeleton */}
        <div className="h-48 bg-gray-200 rounded-lg animate-pulse mb-8" />

        {/* Skills Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-80 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (skills.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="text-8xl mb-6">🎱</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            十大招系统即将上线
          </h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            耶氏台球十大招技能系统正在准备中，敬请期待！
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Header - Always visible */}
        <ProgressHeader
          totalSkills={stats.totalSkills}
          completedSkills={stats.completedSkills}
          totalXP={stats.totalXP}
          totalSubSkills={stats.totalSubSkills}
          completedSubSkills={stats.completedSubSkills}
        />

        {/* Main Content - Conditional rendering based on navigation state */}
        {selectedSkill ? (
          // Sub-Skills Detail View
          <SubSkillsView
            skill={selectedSkill}
            onBack={handleBackToOverview}
            onUnitClick={handleUnitClick}
          />
        ) : (
          // Skills Overview Grid
          <SkillsOverview
            skills={skills}
            userProgress={userProgress}
            onSkillClick={handleSkillClick}
          />
        )}

        {/* Training Unit Modal - Overlay */}
        <TrainingUnitModal
          unit={selectedUnit}
          isOpen={showUnitModal}
          onClose={handleUnitModalClose}
        />
      </div>
    </div>
  );
}

export default TenCoreSkillsView;
