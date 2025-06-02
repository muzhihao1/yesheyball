export const LEVEL_NAMES = [
  "初窥门径", "小有所成", "渐入佳境", "游刃有余", 
  "炉火纯青", "出神入化", "登峰造极", "一代宗师", "无敌天下"
];

export const DIFFICULTY_COLORS = {
  "初级": "text-green-600 bg-green-100",
  "中级": "text-yellow-600 bg-yellow-100", 
  "高级": "text-red-600 bg-red-100"
};

export const ACHIEVEMENT_ICONS = {
  "新手上路": "🎯",
  "连续打卡": "🔥",
  "精准射手": "🎱",
  "勤奋练习": "💪",
  "完美表现": "👑",
  "台球大师": "🏆"
};

export function getLevelName(level: number): string {
  return LEVEL_NAMES[level - 1] || "新手";
}

export function getExpForNextLevel(currentLevel: number): number {
  return currentLevel * 150; // 150 exp per level
}

export function calculateLevelProgress(exp: number, level: number): number {
  const currentLevelExp = (level - 1) * 150;
  const nextLevelExp = level * 150;
  const progressInLevel = exp - currentLevelExp;
  const expNeededForLevel = nextLevelExp - currentLevelExp;
  
  return Math.max(0, Math.min(100, (progressInLevel / expNeededForLevel) * 100));
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`;
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  });
}
