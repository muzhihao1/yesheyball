/**
 * Skill Node Component
 * Custom node for React Flow displaying a skill in the tree
 */

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

export interface SkillNodeData {
  label: string;
  description: string;
  icon: string;
  color: string;
  level: number;
  isUnlocked: boolean;
  canUnlock: boolean;
  conditions?: Array<{
    id: number;
    type: string;
    description: string;
    currentProgress: number;
    isMet: boolean;
  }>;
}

interface SkillNodeProps {
  data: SkillNodeData;
}

function SkillNode({ data }: SkillNodeProps) {
  const {
    label,
    icon,
    color,
    level,
    isUnlocked,
    canUnlock,
    conditions = [],
  } = data;

  // Determine node state and styling
  const getNodeStyle = () => {
    if (isUnlocked) {
      return {
        border: '3px solid #10b981',
        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
      };
    }
    if (canUnlock) {
      return {
        border: '3px solid #3b82f6',
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
      };
    }
    return {
      border: '2px solid #d1d5db',
      background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
    };
  };

  const nodeStyle = getNodeStyle();

  // Get status badge
  const getStatusBadge = () => {
    if (isUnlocked) {
      return (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-md flex items-center gap-1">
          <span>✓</span>
          <span>已解锁</span>
        </div>
      );
    }
    if (canUnlock) {
      return (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-md flex items-center gap-1 animate-pulse">
          <span>🔓</span>
          <span>可解锁</span>
        </div>
      );
    }
    return (
      <div className="absolute -top-2 -right-2 bg-gray-400 text-white text-xs px-2 py-0.5 rounded-full font-medium shadow-md flex items-center gap-1">
        <span>🔒</span>
        <span>锁定</span>
      </div>
    );
  };

  // Get progress indicator for locked skills
  const getProgressIndicator = () => {
    if (isUnlocked || conditions.length === 0) return null;

    const metConditions = conditions.filter((c: any) => c.isMet).length;
    const totalConditions = conditions.length;
    const percentage = (metConditions / totalConditions) * 100;

    return (
      <div className="mt-2 w-full">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>解锁进度</span>
          <span>{metConditions}/{totalConditions}</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div
      className="relative px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 cursor-pointer min-w-[180px]"
      style={nodeStyle}
    >
      {/* Top handle (connection point from parent) */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-gray-400 border-2 border-white"
      />

      {/* Status badge */}
      {getStatusBadge()}

      {/* Level badge */}
      <div
        className="absolute -top-2 -left-2 w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md"
        style={{ backgroundColor: color }}
      >
        L{level}
      </div>

      {/* Icon and label */}
      <div className="flex flex-col items-center gap-2">
        <div
          className="text-4xl w-16 h-16 flex items-center justify-center rounded-full"
          style={{ backgroundColor: `${color}20` }}
        >
          {icon}
        </div>

        <div className="text-center">
          <div className="font-bold text-gray-900 text-sm leading-tight">
            {label}
          </div>
          {!isUnlocked && canUnlock && (
            <div className="text-xs text-blue-600 font-medium mt-1">
              点击解锁
            </div>
          )}
        </div>

        {/* Progress indicator */}
        {getProgressIndicator()}
      </div>

      {/* Bottom handle (connection point to children) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-gray-400 border-2 border-white"
      />

      {/* Locked overlay for non-unlockable skills */}
      {!isUnlocked && !canUnlock && (
        <div className="absolute inset-0 bg-gray-100/40 rounded-xl backdrop-blur-[0.5px]"></div>
      )}
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(SkillNode);
