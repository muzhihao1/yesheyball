// 基于assessments文件夹的等级关卡系统
export interface LevelStage {
  level: number;
  name: string;
  totalExercises: number;
  category: "启明星" | "超新星" | "智子星";
  description: string;
  requirements: string;
}

export interface Exercise {
  id: string;
  level: number;
  exerciseNumber: number;
  title: string;
  description: string;
  imageUrl: string;
  completed: boolean;
  stars: number; // 0-3 stars based on performance
}

// 等级系统配置（基于assessments文件夹的实际内容）
export const LEVEL_STAGES: LevelStage[] = [
  {
    level: 1,
    name: "初窥门径",
    totalExercises: 37, // 1、初窥门径文件夹中的图片数量
    category: "启明星",
    description: "在启明星教准轨道，让台球成为你的第一颗卫星！台球技术基础框架搭建",
    requirements: "完成所有基础练习，掌握握杆、站位、瞄准等基本技术"
  },
  {
    level: 2,
    name: "小有所成",
    totalExercises: 42, // 2、小有所成文件夹中的图片数量
    category: "启明星",
    description: "台球技术基础框架搭建",
    requirements: "掌握基本走位与控球技巧，完成考核后可晋级"
  },
  {
    level: 3,
    name: "渐入佳境",
    totalExercises: 52, // 3、渐入佳境文件夹中的图片数量
    category: "启明星",
    description: "掌握基本走位与控球技巧",
    requirements: "熟练运用各种基础技术，通过启明星阶段考核"
  },
  {
    level: 4,
    name: "炉火纯青",
    totalExercises: 62, // 4、炉火纯青文件夹中的图片数量
    category: "超新星",
    description: "引爆超新星的潜能，用球杆雕刻台面法则！力度与杆法的完美艺术",
    requirements: "掌握高级杆法技术，完成超新星阶段训练"
  },
  {
    level: 5,
    name: "登堂入室",
    totalExercises: 62, // 5、登堂入室文件夹中的图片数量
    category: "超新星",
    description: "高阶控球与实战训练",
    requirements: "熟练运用高级技术进行实战"
  },
  {
    level: 6,
    name: "超群绝伦",
    totalExercises: 62, // 6、超群绝伦文件夹中的图片数量
    category: "超新星",
    description: "精确走位与复杂球局",
    requirements: "掌握复杂球局的处理，通过超新星阶段考核"
  },
  {
    level: 7,
    name: "登峰造极",
    totalExercises: 72, // 7、登峰造极文件夹中的图片数量
    category: "智子星",
    description: "在智子星的宏观维度，用一杆终结所有因果链！台球桌上的战略思维",
    requirements: "掌握战略思维，运用高级技术"
  },
  {
    level: 8,
    name: "出神入化",
    totalExercises: 72, // 8、出神入化文件夹中的图片数量
    category: "智子星",
    description: "超越技巧的艺术境界",
    requirements: "达到技术与艺术的完美结合"
  },
  {
    level: 9,
    name: "人杆合一",
    totalExercises: 72, // 9、人杆合一文件夹中的图片数量
    category: "智子星",
    description: "台球的最高境界",
    requirements: "实现人、杆、球的完美统一，通过智子星最终考核"
  }
];

// 考核规则
export const EXAM_RULES = {
  启明星: {
    questionsCount: 6,
    timeLimit: 2, // 小时
    price: "19.9元",
    levels: [2, 3] // 需要考核的等级
  },
  超新星: {
    questionsCount: 8,
    timeLimit: 2,
    price: "29.9元",
    levels: [4, 5, 6]
  },
  智子星: {
    questionsCount: 10,
    timeLimit: 3,
    price: "29.9元",
    levels: [7, 8, 9]
  }
};

// 生成习题列表
export function generateExercisesForLevel(level: number): Exercise[] {
  const stage = LEVEL_STAGES.find(s => s.level === level);
  if (!stage) return [];

  const exercises: Exercise[] = [];
  const levelName = stage.name;
  
  for (let i = 0; i < stage.totalExercises; i++) {
    const exerciseNumber = i.toString().padStart(2, '0');
    exercises.push({
      id: `${level}-${exerciseNumber}`,
      level,
      exerciseNumber: i,
      title: `第${i + 1}题`,
      description: `${levelName}阶段练习第${i + 1}题，按照图示要求完成练习。`,
      imageUrl: `/assessments/${level}、${levelName}/${level}、${levelName}_${exerciseNumber}.jpg`,
      completed: false,
      stars: 0
    });
  }
  
  return exercises;
}

// 检查是否可以进行等级考核
export function canTakeExam(level: number, completedExercises: number): boolean {
  const stage = LEVEL_STAGES.find(s => s.level === level);
  if (!stage) return false;
  
  // 1级无需考核
  if (level === 1) return false;
  
  // 必须完成该等级所有习题
  return completedExercises >= stage.totalExercises;
}

// 获取用户当前可访问的最高等级
export function getMaxAccessibleLevel(userLevel: number): number {
  return Math.min(userLevel + 1, 9); // 最多只能看到下一级的内容
}