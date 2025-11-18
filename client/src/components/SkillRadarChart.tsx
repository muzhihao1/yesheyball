/**
 * Skill Radar Chart Component
 *
 * Displays user's skill levels across multiple dimensions using a radar chart
 *
 * Features:
 * - Radar chart showing 5 skill dimensions
 * - Responsive container that adapts to screen size
 * - Custom styling with brand colors (green)
 * - Filled area for better visualization
 * - Polar grid and axes
 *
 * Skill dimensions (统一五维模型):
 * - 准度 (Accuracy)
 * - 杆法 (Spin)
 * - 走位 (Positioning)
 * - 发力 (Power)
 * - 策略 (Strategy)
 *
 * Data format:
 * - Array of { name: string, value: number, fullMark: number }
 * - value: current skill level (0-100)
 * - fullMark: maximum possible value (usually 100)
 *
 * Usage:
 * ```tsx
 * <SkillRadarChart skills={skillsData} />
 * ```
 */

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';

interface SkillData {
  name: string;
  value: number;
  fullMark: number;
}

interface SkillRadarChartProps {
  skills: SkillData[];
}

export function SkillRadarChart({ skills }: SkillRadarChartProps) {
  // If no data, show placeholder
  if (!skills || skills.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-green-600" />
            能力分析
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Target className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>暂无能力数据</p>
              <p className="text-sm">完成更多训练后将显示能力分析</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-green-600" />
          能力分析
        </CardTitle>
        <p className="text-sm text-gray-500 mt-1">各项技能水平评估</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={skills}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              stroke="#9ca3af"
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              stroke="#9ca3af"
            />
            <Radar
              name="能力值"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={2}
              fill="#10b981"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>

        {/* Legend with skill descriptions */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          {skills.map((skill, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-gray-700">{skill.name}: {skill.value}/100</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
