import { forwardRef } from 'react';
import { Trophy, Clock, Star, TrendingUp, Target, Zap, GitBranch, Flame, Brain } from 'lucide-react';
import type { ScoreChanges } from '@/hooks/useNinetyDayTraining';

/**
 * ShareCard Component
 *
 * A beautifully designed card for sharing training achievements
 * Optimized for social media sharing (WeChat, Moments, etc.)
 *
 * Features:
 * - User avatar and name
 * - Training duration
 * - Star rating
 * - Ability score improvements
 * - Brand identity
 * - QR code / invite link (optional)
 *
 * This component is rendered off-screen and captured using html2canvas
 */

interface ShareCardProps {
  userName: string;
  userAvatar?: string;
  duration: number; // minutes
  rating: number; // 1-5 stars
  scoreChanges: ScoreChanges;
  clearanceScore: number;
  dayNumber?: number;
}

interface ScoreItem {
  key: string;
  label: string;
  icon: React.ElementType;
  change: number;
  color: string;
  bgColor: string;
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ userName, userAvatar, duration, rating, scoreChanges, clearanceScore, dayNumber }, ref) => {
    // Filter out zero changes and prepare score items
    const scoreItems: ScoreItem[] = [
      {
        key: 'accuracy',
        label: '准度',
        icon: Target,
        change: scoreChanges.accuracy || 0,
        color: '#2563eb',
        bgColor: '#dbeafe',
      },
      {
        key: 'spin',
        label: '杆法',
        icon: Zap,
        change: scoreChanges.spin || 0,
        color: '#9333ea',
        bgColor: '#f3e8ff',
      },
      {
        key: 'positioning',
        label: '走位',
        icon: GitBranch,
        change: scoreChanges.positioning || 0,
        color: '#16a34a',
        bgColor: '#dcfce7',
      },
      {
        key: 'power',
        label: '发力',
        icon: Flame,
        change: scoreChanges.power || 0,
        color: '#ea580c',
        bgColor: '#ffedd5',
      },
      {
        key: 'strategy',
        label: '策略',
        icon: Brain,
        change: scoreChanges.strategy || 0,
        color: '#6366f1',
        bgColor: '#e0e7ff',
      },
    ].filter((item) => item.change !== 0);

    const clearanceChange = scoreChanges.clearance || 0;

    // Calculate total improvement
    const totalImprovement = Object.values(scoreChanges).reduce(
      (sum, val) => sum + (val || 0),
      0
    );

    // Render star rating
    const renderStars = () => {
      return (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-6 h-6 ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      );
    };

    return (
      <div
        ref={ref}
        className="w-[750px] h-auto bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-12 font-sans"
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        {/* Header: Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-2xl shadow-lg">
            <Trophy className="w-8 h-8" />
            <h1 className="text-3xl font-bold">三个月一杆清台</h1>
          </div>
          <p className="text-xl text-gray-600 mt-4 font-medium">训练成果分享</p>
        </div>

        {/* User Info */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center border-4 border-white shadow-lg">
              <span className="text-3xl font-bold text-white">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{userName}</h2>
            {dayNumber && (
              <p className="text-lg text-gray-600">挑战第 {dayNumber} 天</p>
            )}
          </div>
        </div>

        {/* Main Stats Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          {/* Duration and Rating */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Duration */}
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
              <Clock className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <p className="text-gray-600 text-lg mb-2">训练时长</p>
              <p className="text-4xl font-bold text-blue-600">{duration}</p>
              <p className="text-gray-500 text-lg">分钟</p>
            </div>

            {/* Rating */}
            <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl">
              <div className="mb-3">{renderStars()}</div>
              <p className="text-gray-600 text-lg mb-2">训练评分</p>
              <p className="text-4xl font-bold text-yellow-600">{rating}</p>
              <p className="text-gray-500 text-lg">星</p>
            </div>
          </div>

          {/* Clearance Score (if changed) */}
          {clearanceChange !== 0 && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-2xl mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <TrendingUp className="w-10 h-10" />
                  <div>
                    <p className="text-lg opacity-90">清台能力总分</p>
                    <p className="text-4xl font-bold">{clearanceScore}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">+{clearanceChange}</p>
                  <p className="text-lg opacity-90">分</p>
                </div>
              </div>
            </div>
          )}

          {/* Ability Improvements */}
          {scoreItems.length > 0 && (
            <div>
              <h3 className="text-center text-gray-600 text-lg font-semibold mb-4">
                能力提升详情
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {scoreItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.key}
                      className="flex items-center gap-3 p-4 rounded-xl border-2"
                      style={{
                        backgroundColor: item.bgColor,
                        borderColor: item.color,
                      }}
                    >
                      <div
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: 'white' }}
                      >
                        <Icon className="w-6 h-6" style={{ color: item.color }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700 font-semibold text-lg">
                          {item.label}
                        </p>
                        <p
                          className="text-2xl font-bold"
                          style={{ color: item.color }}
                        >
                          +{item.change}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer: Total Improvement & Brand Slogan */}
        <div className="text-center">
          {totalImprovement > 0 && (
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-6">
              <p className="text-gray-700 text-lg mb-2">本次训练总提升</p>
              <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                +{totalImprovement}
              </p>
              <p className="text-gray-600 text-lg">分</p>
            </div>
          )}

          <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-2xl p-6">
            <p className="text-2xl font-bold mb-2">每天 30 分钟，90 天清台</p>
            <p className="text-lg opacity-90">扫码加入我的训练之旅</p>
          </div>
        </div>
      </div>
    );
  }
);

ShareCard.displayName = 'ShareCard';

export default ShareCard;
