// 基于王孟52集台球教学课程的每日训练体系
export interface DailyCourse {
  day: number;
  title: string;
  description: string;
  week: number;
  category: string;
  difficulty: "初级" | "中级" | "高级";
}

export const DAILY_COURSES: DailyCourse[] = [
  // 第1周：基础姿势与握杆
  {
    day: 1,
    title: "第1集：握杆基础训练",
    description: "学习正确的握杆姿势，建立良好的击球基础。重点掌握握杆的力度和位置。",
    week: 1,
    category: "基础技术",
    difficulty: "初级"
  },
  {
    day: 2,
    title: "第2集：手架技术练习",
    description: "掌握稳定的手架技术，为精准击球做准备。练习不同距离的手架摆放。",
    week: 1,
    category: "基础技术",
    difficulty: "初级"
  },
  {
    day: 3,
    title: "第3集：站位与姿势调整",
    description: "学习正确的站位和身体姿势，建立稳定的击球平台。",
    week: 1,
    category: "基础技术",
    difficulty: "初级"
  },
  {
    day: 4,
    title: "第4集：入位与击球节奏",
    description: "培养良好的入位习惯和击球节奏，提高击球的一致性。",
    week: 1,
    category: "节奏训练",
    difficulty: "初级"
  },
  {
    day: 5,
    title: "第5集：空杆与节奏训练",
    description: "通过空杆练习建立稳定的击球节奏，培养肌肉记忆。",
    week: 1,
    category: "节奏训练",
    difficulty: "初级"
  },
  {
    day: 6,
    title: "第6集：初级瞄准技术",
    description: "学习基础瞄准技术，掌握瞄准线的概念和应用。",
    week: 1,
    category: "瞄准技术",
    difficulty: "初级"
  },
  {
    day: 7,
    title: "第7集：低杆发力平稳度",
    description: "练习低杆技术，重点掌握发力的平稳度和控制。",
    week: 1,
    category: "杆法技术",
    difficulty: "初级"
  },

  // 第2周：力量控制与穿透力
  {
    day: 8,
    title: "第8集：穿透力训练",
    description: "学习通过手肘动作增加穿透力，提高击球效果。",
    week: 2,
    category: "力量控制",
    difficulty: "中级"
  },
  {
    day: 9,
    title: "第9集：初级预力控制",
    description: "掌握基础的力量控制技术，学会判断和调节击球力度。",
    week: 2,
    category: "力量控制",
    difficulty: "初级"
  },
  {
    day: 10,
    title: "第10集：中级预力锁定",
    description: "通过试杆练习锁定合适的击球力量，提高击球精度。",
    week: 2,
    category: "力量控制",
    difficulty: "中级"
  },
  {
    day: 11,
    title: "第11集：低杆力量控制",
    description: "在低杆击球中运用力量控制技术，掌握精确的力度调节。",
    week: 2,
    category: "杆法技术",
    difficulty: "中级"
  },
  {
    day: 12,
    title: "第12集：翻腕技术训练",
    description: "练习手腕翻转技术，提高击球的稳定性和精确性。",
    week: 2,
    category: "技术细节",
    difficulty: "中级"
  },
  {
    day: 13,
    title: "第13集：满弓发力训练",
    description: "学习满弓发力技术，掌握大力击球的要领。",
    week: 2,
    category: "力量控制",
    difficulty: "中级"
  },
  {
    day: 14,
    title: "第14集：长台分段发力1",
    description: "在长台球中练习分段发力，掌握中低杆的运用。",
    week: 2,
    category: "杆法技术",
    difficulty: "中级"
  },

  // 第3周：高级发力与瞄准
  {
    day: 15,
    title: "第15集：长台分段发力2",
    description: "进一步练习长台低杆的分段发力技术。",
    week: 3,
    category: "杆法技术",
    difficulty: "中级"
  },
  {
    day: 16,
    title: "第16集：极限低杆点位",
    description: "挑战极限低杆点位的分段发力，突破技术极限。",
    week: 3,
    category: "杆法技术",
    difficulty: "高级"
  },
  {
    day: 17,
    title: "第17集：重心线训练",
    description: "通过重心线训练提高直球分点能力。",
    week: 3,
    category: "瞄准技术",
    difficulty: "中级"
  },
  {
    day: 18,
    title: "第18集：假想球瞄准法",
    description: "学习假想球瞄准方法，提高瞄准精度。",
    week: 3,
    category: "瞄准技术",
    difficulty: "初级"
  },
  {
    day: 19,
    title: "第19集：向边球瞄准",
    description: "练习向边球的瞄准技术，掌握角度球基础。",
    week: 3,
    category: "瞄准技术",
    difficulty: "中级"
  },
  {
    day: 20,
    title: "第20集：离边球瞄准",
    description: "掌握离边球的瞄准方法，完善角度球技术。",
    week: 3,
    category: "瞄准技术",
    difficulty: "中级"
  },
  {
    day: 21,
    title: "第21集：中袋球训练",
    description: "专门练习中袋球技术，提高中袋进球率。",
    week: 3,
    category: "专项技术",
    difficulty: "中级"
  },

  // 第4周：高级瞄准与分离角
  {
    day: 22,
    title: "第22集：极限高球瞄准",
    description: "挑战极限高球的瞄准，突破技术难点。",
    week: 4,
    category: "瞄准技术",
    difficulty: "高级"
  },
  {
    day: 23,
    title: "第23集：中级瞄准锁定",
    description: "学习锁定进球点的中级瞄准技术。",
    week: 4,
    category: "瞄准技术",
    difficulty: "中级"
  },
  {
    day: 24,
    title: "第24集：90度分离角",
    description: "练习90度分离角技术，掌握标准分离角。",
    week: 4,
    category: "走位技术",
    difficulty: "中级"
  },
  {
    day: 25,
    title: "第25集：力量配合击球点",
    description: "学习不同力量配合击球点位的分离角技术。",
    week: 4,
    category: "走位技术",
    difficulty: "中级"
  },
  {
    day: 26,
    title: "第26集：登杆分离角",
    description: "掌握登杆配合分离角的高级技术。",
    week: 4,
    category: "杆法技术",
    difficulty: "高级"
  },
  {
    day: 27,
    title: "第27集：不吃库走位",
    description: "练习不吃库的走位技术，掌握直接走位。",
    week: 4,
    category: "走位技术",
    difficulty: "中级"
  },
  {
    day: 28,
    title: "第28集：一库走位技术",
    description: "学习一库走位技术并进行拆解练习。",
    week: 4,
    category: "走位技术",
    difficulty: "中级"
  },

  // 第5周：加塞技术
  {
    day: 29,
    title: "第29集：加塞身位夹角",
    description: "练习加塞时身位与球杆的夹角调整。",
    week: 5,
    category: "加塞技术",
    difficulty: "高级"
  },
  {
    day: 30,
    title: "第30集：5分点加塞训练",
    description: "通过5分点训练掌握加塞瞄准技术。",
    week: 5,
    category: "加塞技术",
    difficulty: "高级"
  },
  {
    day: 31,
    title: "第31集：角度球加塞",
    description: "学习角度球的加塞瞄准技术。",
    week: 5,
    category: "加塞技术",
    difficulty: "高级"
  },
  {
    day: 32,
    title: "第32集：顺塞走位",
    description: "练习顺塞的走位技术，掌握顺塞运用。",
    week: 5,
    category: "加塞技术",
    difficulty: "高级"
  },
  {
    day: 33,
    title: "第33集：反塞走位",
    description: "掌握反塞的走位技术，完善加塞体系。",
    week: 5,
    category: "加塞技术",
    difficulty: "高级"
  },
  {
    day: 34,
    title: "第34集：清台思路",
    description: "学习清台的基本思路和策略规划。",
    week: 5,
    category: "战术思维",
    difficulty: "中级"
  },
  {
    day: 35,
    title: "第35集：实战清台1",
    description: "实战清台练习第一阶段，应用基础技术。",
    week: 5,
    category: "实战训练",
    difficulty: "中级"
  },

  // 第6周：实战清台训练
  {
    day: 36,
    title: "第36集：实战清台2",
    description: "实战清台练习第二阶段，提高成功率。",
    week: 6,
    category: "实战训练",
    difficulty: "中级"
  },
  {
    day: 37,
    title: "第37集：实战清台3",
    description: "实战清台练习第三阶段，挑战复杂球局。",
    week: 6,
    category: "实战训练",
    difficulty: "高级"
  },
  {
    day: 38,
    title: "第38集：实战清台4",
    description: "实战清台练习第四阶段，提升技术水平。",
    week: 6,
    category: "实战训练",
    difficulty: "高级"
  },
  {
    day: 39,
    title: "第39集：实战清台5",
    description: "实战清台练习第五阶段，巩固所学技术。",
    week: 6,
    category: "实战训练",
    difficulty: "高级"
  },
  {
    day: 40,
    title: "第40集：实战清台6",
    description: "实战清台练习第六阶段，达到高水平运用。",
    week: 6,
    category: "实战训练",
    difficulty: "高级"
  },
  {
    day: 41,
    title: "第41集：弧线球技术",
    description: "学习弧线球技术，掌握特殊击球方法。",
    week: 6,
    category: "特殊技术",
    difficulty: "高级"
  },
  {
    day: 42,
    title: "第42集：分离角原理",
    description: "深入理解白球分离角的物理原理。",
    week: 6,
    category: "理论知识",
    difficulty: "中级"
  },

  // 第7周：理论与日常训练
  {
    day: 43,
    title: "第43集：清台思路讲解",
    description: "学习初级清台的思路和方法论。",
    week: 7,
    category: "战术思维",
    difficulty: "中级"
  },
  {
    day: 44,
    title: "第44集：肌肉激活训练1",
    description: "第一套激活肌肉状态的练习方法。",
    week: 7,
    category: "日常训练",
    difficulty: "初级"
  },
  {
    day: 45,
    title: "第45集：肌肉激活训练2",
    description: "第二套激活肌肉状态的练习方法。",
    week: 7,
    category: "日常训练",
    difficulty: "初级"
  },
  {
    day: 46,
    title: "第46集：肌肉激活训练3",
    description: "第三套激活肌肉状态的练习方法。",
    week: 7,
    category: "日常训练",
    difficulty: "初级"
  },
  {
    day: 47,
    title: "第47集：肌肉激活训练4",
    description: "第四套激活肌肉状态的练习方法。",
    week: 7,
    category: "日常训练",
    difficulty: "初级"
  },
  {
    day: 48,
    title: "第48集：肌肉激活训练5",
    description: "第五套激活肌肉状态的练习方法。",
    week: 7,
    category: "日常训练",
    difficulty: "初级"
  },
  {
    day: 49,
    title: "第49集：肌肉激活训练6",
    description: "第六套激活肌肉状态的练习方法。",
    week: 7,
    category: "日常训练",
    difficulty: "初级"
  },

  // 第8周：节奏掌握与综合运用
  {
    day: 50,
    title: "第50集：出杆节奏训练1",
    description: "通过节奏训练快速提升技术水平。",
    week: 8,
    category: "节奏训练",
    difficulty: "中级"
  },
  {
    day: 51,
    title: "第51集：出杆节奏训练2",
    description: "进一步掌握出杆节奏的要领和应用。",
    week: 8,
    category: "节奏训练",
    difficulty: "中级"
  },
  {
    day: 52,
    title: "第52集：综合技术运用",
    description: "综合运用所学技术进行实战练习，达成技术整合。",
    week: 8,
    category: "综合运用",
    difficulty: "高级"
  }
];

// 获取今日课程
export function getTodaysCourse(): DailyCourse {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const courseIndex = (dayOfYear - 1) % 52;
  return DAILY_COURSES[courseIndex];
}

// 获取指定日期的课程
export function getCourseByDay(day: number): DailyCourse | undefined {
  return DAILY_COURSES.find(course => course.day === day);
}

// 获取指定周的课程
export function getCoursesByWeek(week: number): DailyCourse[] {
  return DAILY_COURSES.filter(course => course.week === week);
}