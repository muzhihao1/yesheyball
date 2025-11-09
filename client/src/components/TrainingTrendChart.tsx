/**
 * Training Trend Chart Component
 *
 * Displays training duration trends over time using a line chart
 *
 * Features:
 * - Line chart showing daily training duration
 * - Responsive container that adapts to screen size
 * - Interactive tooltip on hover
 * - Grid lines for better readability
 * - Custom styling with brand colors (green)
 *
 * Data format:
 * - Array of { date: string, duration: number }
 * - Date format: 'MM/DD' or any displayable format
 * - Duration in minutes
 *
 * Usage:
 * ```tsx
 * <TrainingTrendChart data={trendData} />
 * ```
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface TrainingTrendData {
  date: string;
  duration: number;
}

interface TrainingTrendChartProps {
  data: TrainingTrendData[];
}

export function TrainingTrendChart({ data }: TrainingTrendChartProps) {
  // If no data, show placeholder
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-green-600" />
            训练时长趋势
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>暂无训练数据</p>
              <p className="text-sm">完成训练后将显示趋势图</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-gray-900">{payload[0].payload.date}</p>
          <p className="text-sm text-green-600">
            训练时长: <span className="font-bold">{payload[0].value}</span> 分钟
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-green-600" />
          训练时长趋势
        </CardTitle>
        <p className="text-sm text-gray-500 mt-1">最近30天的训练记录</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              stroke="#9ca3af"
            />
            <YAxis
              label={{
                value: '分钟',
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: 12, fill: '#6b7280' }
              }}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              stroke="#9ca3af"
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="duration"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6, fill: '#059669' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
