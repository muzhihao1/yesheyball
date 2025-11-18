import { memo } from 'react';
import { motion } from 'framer-motion';

/**
 * Node status types for the adventure map
 */
export type NodeStatus = 'current' | 'completed' | 'unlocked' | 'locked' | 'milestone';

/**
 * Adventure map node interface
 */
export interface MapNode {
  day: number;
  x: number;
  y: number;
  status: NodeStatus;
  isMilestone: boolean;
}

/**
 * Adventure Map Props
 */
export interface AdventureMapProps {
  /** Total number of days to display (30 for prototype, 90 for full) */
  totalDays: number;
  /** Current day number (1-based) */
  currentDay: number;
  /** Number of completed days */
  completedDays: number;
  /** Callback when a day node is clicked */
  onDayClick?: (day: number) => void;
}

/**
 * Generate a winding SVG path for the adventure map
 * Creates a smooth, curved path that winds left and right
 *
 * @param totalDays - Number of days/nodes to generate
 * @param width - SVG canvas width
 * @param height - SVG canvas height
 * @returns SVG path string (d attribute)
 */
function generateAdventurePath(totalDays: number, width: number, height: number): string {
  const segments: string[] = [];
  const verticalSpacing = height / (totalDays + 1);

  // Starting point at top center
  segments.push(`M ${width / 2} ${verticalSpacing}`);

  // Generate winding path
  for (let i = 1; i < totalDays; i++) {
    const y = verticalSpacing * (i + 1);
    // Alternate between left and right with smooth curves
    const amplitude = width * 0.3; // 30% of width for curve amplitude
    const xOffset = Math.sin(i * Math.PI / 3) * amplitude; // Creates wave pattern
    const x = width / 2 + xOffset;

    // Use quadratic curves for smooth path
    const prevY = verticalSpacing * i;
    const controlY = (prevY + y) / 2;
    segments.push(`Q ${width / 2} ${controlY}, ${x} ${y}`);
  }

  return segments.join(' ');
}

/**
 * Calculate node positions along the SVG path
 * Uses path.getPointAtLength() to get exact coordinates
 *
 * @param pathElement - SVG path element
 * @param totalDays - Number of nodes to position
 * @returns Array of {x, y} coordinates
 */
function calculateNodePositions(
  pathElement: SVGPathElement | null,
  totalDays: number
): Array<{ x: number; y: number }> {
  if (!pathElement) {
    // Fallback: vertical line
    return Array.from({ length: totalDays }, (_, i) => ({
      x: 200,
      y: 50 + i * 30,
    }));
  }

  const pathLength = pathElement.getTotalLength();
  const positions: Array<{ x: number; y: number }> = [];

  for (let i = 0; i < totalDays; i++) {
    const distance = (pathLength / (totalDays - 1)) * i;
    const point = pathElement.getPointAtLength(distance);
    positions.push({ x: point.x, y: point.y });
  }

  return positions;
}

/**
 * Determine node status based on current day and completion
 *
 * @param day - Day number (1-based)
 * @param currentDay - Current active day
 * @param completedDays - Number of completed days
 * @returns Node status
 */
function getNodeStatus(day: number, currentDay: number, completedDays: number): NodeStatus {
  if (day === currentDay) return 'current';
  if (day <= completedDays) return 'completed';
  if (day === currentDay + 1) return 'unlocked';
  if (day % 10 === 0) return 'milestone';
  return 'locked';
}

/**
 * Node component with status-based styling
 */
const MapNode = memo(({ node, onClick }: { node: MapNode; onClick?: () => void }) => {
  // Status-based styling
  const statusStyles = {
    current: {
      fill: '#10b981', // emerald-500
      stroke: '#059669', // emerald-600
      strokeWidth: 3,
      scale: 1.3,
    },
    completed: {
      fill: '#34d399', // emerald-400
      stroke: '#059669', // emerald-600
      strokeWidth: 2,
      scale: 1.0,
    },
    unlocked: {
      fill: '#ffffff',
      stroke: '#10b981', // emerald-500
      strokeWidth: 2,
      scale: 1.0,
    },
    locked: {
      fill: '#e5e7eb', // gray-200
      stroke: '#9ca3af', // gray-400
      strokeWidth: 1,
      scale: 0.9,
    },
    milestone: {
      fill: '#fbbf24', // amber-400
      stroke: '#d97706', // amber-600
      strokeWidth: 3,
      scale: 1.4,
    },
  };

  const style = statusStyles[node.status];
  const isInteractive = node.status === 'current' || node.status === 'completed' || node.status === 'unlocked';

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: style.scale }}
      transition={{ duration: 0.3, delay: node.day * 0.02 }} // Stagger animation
      onClick={isInteractive ? onClick : undefined}
      style={{ cursor: isInteractive ? 'pointer' : 'default' }}
    >
      {/* Node circle */}
      <motion.circle
        cx={node.x}
        cy={node.y}
        r={node.isMilestone ? 16 : 12}
        fill={style.fill}
        stroke={style.stroke}
        strokeWidth={style.strokeWidth}
        animate={
          node.status === 'current'
            ? {
                scale: [1, 1.1, 1], // Breathing animation
                opacity: [1, 0.8, 1],
              }
            : {}
        }
        transition={
          node.status === 'current'
            ? {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : {}
        }
      />

      {/* Day number label */}
      <text
        x={node.x}
        y={node.y}
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-bold"
        fill={node.status === 'locked' ? '#6b7280' : '#ffffff'}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {node.day}
      </text>

      {/* Milestone star icon */}
      {node.isMilestone && (
        <text
          x={node.x}
          y={node.y - 25}
          textAnchor="middle"
          className="text-lg"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          ⭐
        </text>
      )}

      {/* Checkmark for completed nodes */}
      {node.status === 'completed' && (
        <text
          x={node.x + 15}
          y={node.y - 15}
          textAnchor="middle"
          className="text-sm"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          ✓
        </text>
      )}
    </motion.g>
  );
});

MapNode.displayName = 'MapNode';

/**
 * Adventure Map Component
 *
 * SVG-based adventure map with winding path and interactive nodes.
 * Designed for 90-day training challenge visualization.
 *
 * Features:
 * - Smooth winding path using quadratic bezier curves
 * - 5 node states: current, completed, unlocked, locked, milestone
 * - Breathing animation for current day node
 * - Milestone indicators every 10 days
 * - Optimized with React.memo for performance
 *
 * Performance considerations:
 * - Memoized node components to prevent unnecessary re-renders
 * - Staggered animation entry for visual appeal
 * - Path calculation cached via useMemo (when integrated)
 *
 * @example
 * ```tsx
 * <AdventureMap
 *   totalDays={30}
 *   currentDay={7}
 *   completedDays={6}
 *   onDayClick={(day) => console.log(`Day ${day} clicked`)}
 * />
 * ```
 */
export const AdventureMap = memo(({ totalDays, currentDay, completedDays, onDayClick }: AdventureMapProps) => {
  // SVG canvas dimensions
  const width = 400;
  const height = totalDays * 35; // Responsive height based on node count

  // Generate SVG path
  const pathData = generateAdventurePath(totalDays, width, height);

  // Note: In production, we'd use useRef and useEffect to get actual path element
  // For prototype, using calculated positions
  const nodePositions = Array.from({ length: totalDays }, (_, i) => {
    const verticalSpacing = height / (totalDays + 1);
    const y = verticalSpacing * (i + 1);
    const amplitude = width * 0.3;
    const xOffset = Math.sin(i * Math.PI / 3) * amplitude;
    const x = width / 2 + xOffset;
    return { x, y };
  });

  // Generate map nodes with status
  const mapNodes: MapNode[] = nodePositions.map((pos, index) => {
    const day = index + 1;
    return {
      day,
      x: pos.x,
      y: pos.y,
      status: getNodeStatus(day, currentDay, completedDays),
      isMilestone: day % 10 === 0,
    };
  });

  return (
    <div className="w-full overflow-auto bg-gradient-to-br from-emerald-50/30 to-amber-50/30 rounded-2xl shadow-inner p-4">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="mx-auto"
      >
        {/* Adventure path (decorative background) */}
        <motion.path
          d={pathData}
          fill="none"
          stroke="#d1fae5" // emerald-100
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />

        {/* Progress path (shows completed portion) */}
        <motion.path
          d={pathData}
          fill="none"
          stroke="#10b981" // emerald-500
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: currentDay / totalDays }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />

        {/* Map nodes */}
        {mapNodes.map((node) => (
          <MapNode
            key={node.day}
            node={node}
            onClick={() => onDayClick?.(node.day)}
          />
        ))}
      </svg>
    </div>
  );
});

AdventureMap.displayName = 'AdventureMap';
