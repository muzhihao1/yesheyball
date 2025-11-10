/**
 * Skill Tree Page
 * Displays the 8-level billiards skill progression tree
 */

import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  ConnectionLineType,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useQuery } from '@tanstack/react-query';
import SkillNode from '../components/SkillNode';
import SkillDetailModal from '../components/SkillDetailModal';

// Define node types
const nodeTypes = {
  skillNode: SkillNode,
};

/**
 * Skill tree page component
 */
export default function SkillTreePage() {
  // Modal state
  const [selectedSkill, setSelectedSkill] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch skill tree data from API
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/skill-tree'],
    queryFn: async () => {
      const response = await fetch('/api/skill-tree', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch skill tree');
      }
      return response.json();
    },
  });

  // Convert API data to React Flow nodes
  const initialNodes: Node[] = data?.data?.skills.map((skill: any) => ({
    id: String(skill.id),
    type: 'skillNode',
    position: skill.position,
    data: {
      label: skill.name,
      description: skill.description,
      icon: skill.metadata?.icon || '⭐',
      color: skill.metadata?.color || '#6B7280',
      level: skill.metadata?.level || 1,
      isUnlocked: skill.isUnlocked,
      conditions: skill.conditions || [],
      canUnlock: !skill.isUnlocked && skill.conditions?.every((c: any) => c.isMet),
    },
  })) || [];

  // Convert API dependencies to React Flow edges
  const initialEdges: Edge[] = data?.data?.dependencies.map((dep: any, index: number) => ({
    id: `e${dep.sourceSkillId}-${dep.targetSkillId}`,
    source: String(dep.sourceSkillId),
    target: String(dep.targetSkillId),
    type: ConnectionLineType.SmoothStep,
    animated: false,
    style: {
      stroke: '#94a3b8',
      strokeWidth: 2,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#94a3b8',
      width: 20,
      height: 20,
    },
  })) || [];

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  // Handle node click - show skill details
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedSkill(node.data);
    setIsModalOpen(true);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载技能树中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">加载失败</h2>
          <p className="text-gray-600 mb-4">无法加载技能树数据</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  const userProgress = data?.data?.userProgress;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">耶氏台球成长路径</h1>
            <p className="text-sm text-gray-600 mt-1">
              从初学者到大师的8级进阶系统
            </p>
          </div>

          {userProgress && (
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-sm text-gray-600">已解锁技能</div>
                <div className="text-2xl font-bold text-primary">
                  {userProgress.unlockedSkills}/{userProgress.totalSkills}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">完成进度</div>
                <div className="text-2xl font-bold text-green-600">
                  {userProgress.progressPercentage}%
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{
            padding: 0.2,
            minZoom: 0.5,
            maxZoom: 1.5,
          }}
          minZoom={0.3}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#cbd5e1" gap={16} />
          <Controls
            showInteractive={false}
            position="bottom-right"
          />
          <MiniMap
            nodeColor={(node) => {
              const isUnlocked = node.data?.isUnlocked;
              const canUnlock = node.data?.canUnlock;
              if (isUnlocked) return '#10b981'; // green
              if (canUnlock) return '#3b82f6'; // blue
              return '#9ca3af'; // gray
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
            position="bottom-left"
          />
        </ReactFlow>
      </div>

      {/* Legend */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-center gap-8 max-w-7xl mx-auto text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-gray-700">已解锁</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-gray-700">可解锁</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-400"></div>
            <span className="text-gray-700">未解锁</span>
          </div>
        </div>
      </div>

      {/* Skill Detail Modal */}
      <SkillDetailModal
        skill={selectedSkill}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
