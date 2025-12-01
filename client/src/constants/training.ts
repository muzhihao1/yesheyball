/**
 * 训练系统配置常量
 * 单一数据源，确保所有页面显示一致的训练时长和文案
 */

/**
 * 每日训练时长配置
 *
 * 用户体验考量：
 * - 30分钟是心理学上的黄金时长，容易被用户坚持
 * - 实际课程内容可在30分钟完成核心部分
 * - 60分钟是扩展和进阶内容的时长
 */
export const DAILY_TRAINING_CONFIG = {
  // 推荐的每日训练时长（用于营销文案和UI显示）
  recommendedDailyMinutes: 30,

  // 可扩展的最大训练时长
  extendedMaxMinutes: 60,

  // 用于显示的标准文案
  dailyDurationLabel: "每天 30 分钟",

  // 用于营销和CTA的完整文案
  heroDescription: "每天 30 分钟，离清台梦想更近一步",

  // 用于新手引导的文案
  onboardingDuration: "预计每天 30-40 分钟，时间紧可先完成核心环节",

  // 90天挑战的描述
  challengeDescription: "每天 30 分钟，90 天清台",

  // 首页副标题
  homeSubtitle: "每天 30 分钟 · 已有 1000+ 新手完成清台",
} as const;

/**
 * 连胜激励文案配置
 * 根据连胜天数提供不同的鼓励信息
 */
export const STREAK_MESSAGES = {
  // 没有训练的情况
  noStreak: {
    icon: "🔥",
    text: "新的开始",
    subtitle: "今天完成第一次训练吧！",
  },
  // 1天连胜
  oneDay: {
    icon: "🔥",
    text: "连续 1 天",
    subtitle: "再坚持一下，建立习惯！",
  },
  // 1-7天连胜
  earlyWeek: (days: number) => ({
    icon: "🔥",
    text: `连续 ${days} 天`,
    subtitle: "快要突破一周了！",
  }),
  // 7-30天连胜
  midMonth: (days: number) => ({
    icon: "🔥",
    text: `连续 ${days} 天`,
    subtitle: "坚持很不容易，保持下去！",
  }),
  // 30天以上连胜
  master: (days: number) => ({
    icon: "🔥",
    text: `连续 ${days} 天`,
    subtitle: "您已成为坚持大师！",
  }),
} as const;

/**
 * 获取连胜激励文案
 * @param streak 当前连胜天数
 * @returns 激励文案对象
 */
export function getStreakMessage(streak: number) {
  if (streak === 0) return STREAK_MESSAGES.noStreak;
  if (streak === 1) return STREAK_MESSAGES.oneDay;
  if (streak < 7) return STREAK_MESSAGES.earlyWeek(streak);
  if (streak < 30) return STREAK_MESSAGES.midMonth(streak);
  return STREAK_MESSAGES.master(streak);
}

/**
 * 格式化连胜文案为显示字符串
 * @param streak 当前连胜天数
 * @returns 格式化的连胜文案 "🔥 连续 X 天 | 文案"
 */
export function formatStreakDisplay(streak: number): string {
  const message = getStreakMessage(streak);
  return `${message.icon} ${message.text} | ${message.subtitle}`;
}
