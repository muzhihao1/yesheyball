import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Trophy, Target, Zap, Crown, Lock, Play, Pause, RotateCcw, CheckCircle, Star } from "lucide-react";

// Lazy load JSON data to improve initial page load
const loadExerciseData = async () => {
  const [requirements, descriptions] = await Promise.all([
    import("@/data/exerciseRequirements.json"),
    import("@/data/exerciseDescriptions.json")
  ]);
  return {
    exerciseRequirementsData: requirements.default,
    exerciseDescriptionsData: descriptions.default
  };
};

interface TableBounds {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

interface LevelStage {
  level: number;
  name: string;
  totalExercises: number;
  category: "启明星" | "超新星" | "智子星";
  description: string;
  unlocked: boolean;
  completed: boolean;
  progress: number;
  completedExercises: number;
  examPassed?: boolean; // 考核是否通过
}

interface ExamConfig {
  category: "启明星" | "超新星" | "智子星";
  questionCount: number;
  timeLimit: number; // 分钟
}

interface ExamQuestion {
  id: string;
  level: number;
  exerciseNumber: number;
  title: string;
  description: string;
  requirement: string;
  imageUrl: string;
}

interface Exercise {
  id: string;
  level: number;
  exerciseNumber: number;
  title: string;
  description: string;
  requirement: string;
  imageUrl: string;
  completed: boolean;
}

export default function Levels() {
  const [selectedLevel, setSelectedLevel] = useState<LevelStage | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showExerciseDialog, setShowExerciseDialog] = useState(false);
  const [isPracticing, setIsPracticing] = useState(false);
  const [practiceTime, setPracticeTime] = useState(0);
  const [showCompletionConfirm, setShowCompletionConfirm] = useState(false);
  const [exerciseOverride, setExerciseOverride] = useState<{[key: string]: boolean}>({});
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [skipToLevel, setSkipToLevel] = useState<number | null>(null);
  const [showSkipChallenge, setShowSkipChallenge] = useState(false);
  const [skipChallengeQuestions, setSkipChallengeQuestions] = useState<any[]>([]);
  const [currentSkipQuestion, setCurrentSkipQuestion] = useState(0);
  const [skipChallengeAnswers, setSkipChallengeAnswers] = useState<string[]>([]);
  
  // 考核相关状态
  const [showExamDialog, setShowExamDialog] = useState(false);
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([]);
  const [currentExamQuestion, setCurrentExamQuestion] = useState(0);
  const [examStartTime, setExamStartTime] = useState<Date | null>(null);
  const [examTimeRemaining, setExamTimeRemaining] = useState(0);
  const [examInProgress, setExamInProgress] = useState(false);
  
  // Exercise data state
  const [exerciseData, setExerciseData] = useState<{
    exerciseRequirementsData: any;
    exerciseDescriptionsData: any;
  } | null>(null);

  const { toast } = useToast();

  // 考核配置
  const examConfigs: Record<string, ExamConfig> = {
    "启明星": { category: "启明星", questionCount: 6, timeLimit: 120 }, // 2小时
    "超新星": { category: "超新星", questionCount: 8, timeLimit: 120 }, // 2小时
    "智子星": { category: "智子星", questionCount: 10, timeLimit: 180 }, // 3小时
  };

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  // Floating button for returning to current level
  useEffect(() => {
    console.log('🔴 Creating floating button in levels-new');
    
    const createButton = () => {
      // Remove any existing buttons
      const existing = document.querySelectorAll('.level-floating-btn');
      existing.forEach(btn => btn.remove());
      
      const button = document.createElement('div');
      button.className = 'level-floating-btn';
      // Determine arrow direction based on current level position
      const getCurrentLevelPosition = () => {
        if (!user) return { shouldShowDown: true };
        
        // Look for current level elements more specifically
        const allElements = document.querySelectorAll('div, h1, h2, h3, span');
        let currentLevelElement = null;
        
        // First try to find level header
        for (const el of allElements) {
          const text = el.textContent || '';
          if (text.includes(`等级 ${user.level}`) && text.includes('•')) {
            const rect = el.getBoundingClientRect();
            if (rect.height > 20 && rect.width > 100) {
              currentLevelElement = el;
              break;
            }
          }
        }
        
        // Fallback: look for any element with current level number
        if (!currentLevelElement) {
          for (const el of allElements) {
            const text = el.textContent || '';
            if (text.includes(`等级 ${user.level}`) || text.includes(`Level ${user.level}`)) {
              const rect = el.getBoundingClientRect();
              if (rect.height > 20) {
                currentLevelElement = el;
                break;
              }
            }
          }
        }
        
        if (currentLevelElement) {
          const rect = currentLevelElement.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          // If element is below the middle of screen, show down arrow
          return { shouldShowDown: rect.top > viewportHeight * 0.4 };
        }
        
        // Default behavior: if we can't find current level, assume it's below
        return { shouldShowDown: true };
      };
      
      const { shouldShowDown } = getCurrentLevelPosition();
      const arrowDirection = shouldShowDown ? '↓' : '↑';
      
      button.innerHTML = arrowDirection;
      
      // Apply styles directly - 匹配参考设计
      const styles = [
        'position: fixed',
        'bottom: 100px',
        'right: 16px', 
        'width: 48px',
        'height: 48px',
        'background: white',
        'border: 2px solid #22c55e',
        'border-radius: 12px',
        'box-shadow: 0 4px 16px rgba(34, 197, 94, 0.3)',
        'display: flex',
        'align-items: center',
        'justify-content: center',
        'font-size: 24px',
        'color: #22c55e',
        'font-weight: 800',
        'cursor: pointer',
        'z-index: 999999',
        'transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        'backdrop-filter: blur(8px)'
      ].map(s => s + ' !important').join('; ');
      
      button.setAttribute('style', styles);
      
      // Add click handler to find current level
      button.addEventListener('click', () => {
        console.log('🔴 Button clicked, finding current level');
        
        if (!user) {
          console.log('🔴 No user data, scrolling to top');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        
        // 查找当前用户等级对应的第一个可解锁/可点击的练习
        let targetElement = null;
        
        // 方法1: 查找带有绿色高亮边框的元素（当前关卡标识）
        const highlightedElements = document.querySelectorAll('.ring-4, .ring-green-400, .border-green-400, .border-4');
        if (highlightedElements.length > 0) {
          targetElement = highlightedElements[0];
          console.log('🔴 Found highlighted current level element');
        }
        
        // 方法2: 查找第一个未锁定的练习节点
        if (!targetElement) {
          const allNodes = document.querySelectorAll('div');
          for (const node of allNodes) {
            const rect = node.getBoundingClientRect();
            if (rect.height > 50 && rect.width > 50) { // 合理大小的元素
              const hasClickHandler = node.getAttribute('onclick') || node.style.cursor === 'pointer';
              const isNotLocked = !node.textContent?.includes('🔒');
              const isVisible = rect.top >= 0;
              
              if (hasClickHandler && isNotLocked && isVisible) {
                targetElement = node;
                console.log('🔴 Found unlocked exercise node');
                break;
              }
            }
          }
        }
        
        // 方法3: 备用方案 - 寻找等级标题
        if (!targetElement) {
          const allElements = document.querySelectorAll('*');
          for (const el of allElements) {
            if (el.textContent?.includes(`等级 ${user.level}`) || el.textContent?.includes(`Level ${user.level}`)) {
              const rect = el.getBoundingClientRect();
              if (rect.height > 0) {
                targetElement = el;
                console.log('🔴 Found level title element');
                break;
              }
            }
          }
        }
        
        if (targetElement) {
          console.log('🔴 Scrolling to target element');
          targetElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          // 添加绿色高亮提示效果
          if (targetElement instanceof HTMLElement) {
            const originalBoxShadow = targetElement.style.boxShadow;
            targetElement.style.boxShadow = '0 0 20px rgba(34, 197, 94, 0.8)';
            targetElement.style.transition = 'box-shadow 0.3s ease';
            
            setTimeout(() => {
              targetElement.style.boxShadow = originalBoxShadow;
            }, 1500);
          }
        } else {
          console.log('🔴 No current level found, scrolling to active area');
          // 滚动到页面的活跃练习区域
          const scrollPosition = Math.min(document.documentElement.scrollHeight * 0.3, 800);
          window.scrollTo({ 
            top: scrollPosition, 
            behavior: 'smooth' 
          });
        }
      });
      
      // Add hover effects
      button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.1) translateY(-2px) !important';
        button.style.boxShadow = '0 8px 24px rgba(34, 197, 94, 0.4) !important';
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1) translateY(0) !important';
        button.style.boxShadow = '0 4px 16px rgba(34, 197, 94, 0.3) !important';
      });
      
      // Add active/pressed effect
      button.addEventListener('mousedown', () => {
        button.style.transform = 'scale(0.95) translateY(1px) !important';
      });
      
      button.addEventListener('mouseup', () => {
        button.style.transform = 'scale(1.1) translateY(-2px) !important';
      });
      
      return button;
    };
    
    // Create button immediately
    const btn = createButton();
    document.body.appendChild(btn);
    console.log('🔴 Button added to DOM');
    
    // Retry creation multiple times to ensure it appears
    const timeouts = [100, 300, 600, 1000].map(delay => 
      setTimeout(() => {
        if (!document.querySelector('.level-floating-btn')) {
          const retryBtn = createButton();
          document.body.appendChild(retryBtn);
          console.log(`🔴 Retry button created at ${delay}ms`);
        }
      }, delay)
    );
    
    return () => {
      timeouts.forEach(clearTimeout);
      const buttons = document.querySelectorAll('.level-floating-btn');
      buttons.forEach(btn => btn.remove());
      console.log('🔴 Button cleanup completed');
    };
  }, [user]);

  // Load exercise data on component mount
  useEffect(() => {
    loadExerciseData().then(setExerciseData);
  }, []);

  // Timer effect for practice session
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPracticing) {
      interval = setInterval(() => {
        setPracticeTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPracticing]);

  // 考核计时器
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (examInProgress && examTimeRemaining > 0) {
      interval = setInterval(() => {
        setExamTimeRemaining(prev => {
          if (prev <= 1) {
            setExamInProgress(false);
            toast({
              title: "考核时间到",
              description: "考核时间已结束",
              variant: "destructive",
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [examInProgress, examTimeRemaining, toast]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if exercise is completed (considering overrides for re-practice)
  const isExerciseCompleted = (exercise: Exercise) => {
    const overrideKey = `${exercise.level}-${exercise.exerciseNumber}`;
    if (exerciseOverride[overrideKey] !== undefined) {
      return exerciseOverride[overrideKey];
    }
    
    // Use sequential progression data from user
    if (user && user.completedExercises) {
      const exercises = user.completedExercises as Record<string, number>;
      const levelCompleted = exercises[exercise.level.toString()] || 0;
      const isCompleted = exercise.exerciseNumber <= levelCompleted;
      return isCompleted;
    }
    
    // Check based on level stage progress
    const stage = levelStages.find(s => s.level === exercise.level);
    if (stage) {
      return exercise.exerciseNumber <= stage.completedExercises;
    }
    
    return exercise.completed;
  };



  // Function to get responsive cropping style
  const getCroppingStyle = (exercise: Exercise): React.CSSProperties => {
    // Use CSS clamp for responsive sizing
    return {
      clipPath: 'inset(19% 6% 3% 52%)', // 裁剪显示桌子
      width: 'min(85vw, 1000px)', // Responsive width that fits mobile
      height: 'auto',
      objectFit: 'contain' as const,
      display: 'block',
      transform: 'translate(-23%, -5%)', // 向左和向下移动一点来垂直居中
      transformOrigin: 'center'
    };
  };

  if (userLoading || !exerciseData) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-32 sm:w-48 h-6 sm:h-8 skeleton mx-auto mb-4"></div>
          <div className="w-48 sm:w-64 h-4 sm:h-6 skeleton mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="skeleton h-64 sm:h-96 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="text-center py-8">用户数据加载失败</div>;
  }

  // 基于实际验证数据的等级关卡配置 (总计411个习题)
  const levelStages: LevelStage[] = [
    {
      level: 1,
      name: "初窥门径",
      totalExercises: 35,
      category: "启明星",
      description: "在启明星教准轨道，让台球成为你的第一颗卫星！台球技术基础框架搭建",
      unlocked: true,
      completed: user.level > 1,
      progress: user.level > 1 ? 100 : Math.min((user.exp / 1000) * 100, 95),
      completedExercises: (() => {
        if (!user.completedExercises) return 0;
        const exercises = user.completedExercises as Record<string, number>;
        const currentProgress = exercises['1'] || 0;
        // If user has any progress in this level or higher levels, unlock more exercises
        if (user.level > 1 || currentProgress > 0) {
          return Math.max(currentProgress, 1); // At minimum unlock first exercise if any progress
        }
        return currentProgress;
      })()
    },
    {
      level: 2,
      name: "小有所成",
      totalExercises: 40,
      category: "启明星",
      description: "台球技术基础框架搭建",
      unlocked: user.level >= 2,
      completed: user.level > 2,
      progress: user.level > 2 ? 100 : user.level === 2 ? Math.min(((user.exp - 1000) / 1000) * 100, 95) : 0,
      completedExercises: 0
    },
    {
      level: 3,
      name: "渐入佳境",
      totalExercises: 50,
      category: "启明星",
      description: "掌握基本走位与控球技巧",
      unlocked: user.level >= 3,
      completed: user.level > 3,
      progress: user.level > 3 ? 100 : user.level === 3 ? Math.min(((user.exp - 2000) / 1000) * 100, 95) : 0,
      completedExercises: 0
    },
    {
      level: 4,
      name: "炉火纯青",
      totalExercises: 60,
      category: "超新星",
      description: "在超新星的引力场中，精准控制每一次撞击！",
      unlocked: user.level >= 4,
      completed: user.level > 4,
      progress: user.level > 4 ? 100 : user.level === 4 ? Math.min((user.exp / 400) * 100, 95) : 0,
      completedExercises: user.level > 4 ? 60 : user.level === 4 ? Math.floor((user.exp / 400) * 60) : 0
    },
    {
      level: 5,
      name: "登堂入室",
      totalExercises: 60,
      category: "超新星",
      description: "技术日臻成熟，走位精准",
      unlocked: user.level >= 5,
      completed: user.level > 5,
      progress: user.level > 5 ? 100 : user.level === 5 ? Math.min((user.exp / 500) * 100, 95) : 0,
      completedExercises: user.level > 5 ? 60 : user.level === 5 ? Math.floor((user.exp / 500) * 60) : 0
    },
    {
      level: 6,
      name: "超群绝伦",
      totalExercises: 60,
      category: "超新星",
      description: "精确走位与复杂球局",
      unlocked: user.level >= 6,
      completed: user.level > 6,
      progress: user.level > 6 ? 100 : user.level === 6 ? Math.min((user.exp / 600) * 100, 95) : 0,
      completedExercises: user.level > 6 ? 60 : user.level === 6 ? Math.floor((user.exp / 600) * 60) : 0
    },
    {
      level: 7,
      name: "登峰造极",
      totalExercises: 55,
      category: "智子星",
      description: "在智子星的宏观维度，用一杆终结所有因果链！台球桌上的战略思维",
      unlocked: user.level >= 7,
      completed: user.level > 7,
      progress: user.level > 7 ? 100 : user.level === 7 ? Math.min((user.exp / 700) * 100, 95) : 0,
      completedExercises: user.level > 7 ? 55 : user.level === 7 ? Math.floor((user.exp / 700) * 55) : 0
    },
    {
      level: 8,
      name: "出神入化",
      totalExercises: 55,
      category: "智子星",
      description: "超越技巧的艺术境界",
      unlocked: user.level >= 8,
      completed: user.level > 8,
      progress: user.level > 8 ? 100 : user.level === 8 ? Math.min((user.exp / 800) * 100, 95) : 0,
      completedExercises: user.level > 8 ? 55 : user.level === 8 ? Math.floor((user.exp / 800) * 55) : 0
    }
  ];

  const getLevelColors = (level: number) => {
    const colorSchemes = {
      1: { bg: "from-emerald-400 to-green-500", node: "bg-emerald-500", border: "border-emerald-400", hex: "#10b981" },
      2: { bg: "from-blue-400 to-blue-500", node: "bg-blue-500", border: "border-blue-400", hex: "#3b82f6" },
      3: { bg: "from-purple-400 to-purple-500", node: "bg-purple-500", border: "border-purple-400", hex: "#8b5cf6" },
      4: { bg: "from-orange-400 to-orange-500", node: "bg-orange-500", border: "border-orange-400", hex: "#f97316" },
      5: { bg: "from-pink-400 to-pink-500", node: "bg-pink-500", border: "border-pink-400", hex: "#ec4899" },
      6: { bg: "from-indigo-400 to-indigo-500", node: "bg-indigo-500", border: "border-indigo-400", hex: "#6366f1" },
      7: { bg: "from-red-400 to-red-500", node: "bg-red-500", border: "border-red-400", hex: "#ef4444" },
      8: { bg: "from-amber-400 to-yellow-500", node: "bg-amber-500", border: "border-amber-400", hex: "#f59e0b" },
    };
    return colorSchemes[level as keyof typeof colorSchemes] || colorSchemes[1];
  };

  const getCategoryIcon = (level: number) => {
    if (level <= 3) return <Star className="w-5 h-5" />;
    if (level <= 6) return <Zap className="w-5 h-5" />;
    return <Crown className="w-5 h-5" />;
  };

  const getExerciseRequirement = (level: number, exerciseNumber: number): string => {
    if (!exerciseData) return "连续完成5次不失误";
    const key = `${level}-${exerciseNumber}`;
    return exerciseData.exerciseRequirementsData[key] || "连续完成5次不失误";
  };

  const getExerciseDescription = (level: number, exerciseNumber: number): string => {
    if (!exerciseData) return `第${exerciseNumber}题练习`;
    const key = `${level}-${exerciseNumber}`;
    const specificDescription = exerciseData.exerciseDescriptionsData[key];
    
    if (specificDescription) {
      return specificDescription;
    }
    
    // 为其他等级提供基础描述
    if (level === 2) {
      return "如图示摆放球型，练习中等难度的球型处理和技巧提升";
    } else if (level === 3) {
      return "如图示摆放球型，掌握进阶走位控球技巧和复杂球局处理";
    } else if (level === 4) {
      return "如图示摆放球型，练习高难度球型和精准控制技术";
    } else if (level === 5) {
      return "如图示摆放球型，掌握登堂入室级别的技术要求";
    } else if (level === 6) {
      return "如图示摆放球型，挑战超群绝伦的复杂球局";
    } else if (level === 7) {
      return "如图示摆放球型，达到登峰造极的技术境界";
    } else if (level === 8) {
      return "如图示摆放球型，追求出神入化的完美技艺";
    }
    
    return "如图示摆放球型，将白球击入指定袋内";
  };



  const generateExercisesForLevel = (level: number): Exercise[] => {
    const stage = levelStages.find(s => s.level === level);
    if (!stage) return [];

    const exercises: Exercise[] = [];
    const levelName = stage.name;
    
    // 获取该等级实际完成的练习数量（包括override状态）
    const getCompletedCount = (): number => {
      let count = 0;
      for (let i = 1; i <= stage.totalExercises; i++) {
        const overrideKey = `${level}-${i}`;
        if (exerciseOverride[overrideKey] === true) {
          count++;
        } else if (exerciseOverride[overrideKey] === undefined && i <= stage.completedExercises) {
          count++;
        }
      }
      return count;
    };
    
    const actualCompletedCount = getCompletedCount();
    
    for (let i = 0; i < stage.totalExercises; i++) {
      const exerciseNum = i + 1;
      const imageFileNumber = (exerciseNum + 1).toString().padStart(2, '0'); // 图片文件从02开始
      const overrideKey = `${level}-${exerciseNum}`;
      
      // 练习完成状态：必须按顺序完成
      let isCompleted = false;
      if (exerciseOverride[overrideKey] === true) {
        isCompleted = true;
      } else if (exerciseOverride[overrideKey] === undefined) {
        isCompleted = exerciseNum <= stage.completedExercises;
      }
      
      exercises.push({
        id: `${level}-${exerciseNum}`,
        level,
        exerciseNumber: exerciseNum,
        title: `第${exerciseNum}题`,
        description: getExerciseDescription(level, exerciseNum),
        requirement: getExerciseRequirement(level, exerciseNum),
        imageUrl: `/assessments/${level}、${levelName}/${level}、${levelName}_${imageFileNumber}.jpg`,
        completed: isCompleted
      });
    }
    
    return exercises;
  };

  const handleLevelClick = (stage: LevelStage) => {
    if (!stage.unlocked) {
      toast({
        title: "等级未解锁",
        description: "请先完成前面的等级才能解锁此关卡。",
        variant: "destructive",
      });
      return;
    }
    setSelectedLevel(stage);
  };

  const handleExerciseClick = async (exercise: Exercise) => {
    setSelectedExercise(exercise);
    // Find and set the corresponding level
    const level = levelStages.find(stage => stage.level === exercise.level);
    setSelectedLevel(level || null);
    setShowExerciseDialog(true);
  };

  const handleStartPractice = () => {
    setIsPracticing(true);
    setPracticeTime(0);
  };

  const handleAbortPractice = () => {
    setIsPracticing(false);
    setPracticeTime(0);
    // 放弃练习后恢复到已完成状态
    if (selectedExercise) {
      const overrideKey = `${selectedExercise.level}-${selectedExercise.exerciseNumber}`;
      setExerciseOverride(prev => ({
        ...prev,
        [overrideKey]: true
      }));
    }
  };

  const handleResetPractice = () => {
    setPracticeTime(0);
    // 重置练习状态以允许重新练习
    if (selectedExercise) {
      const overrideKey = `${selectedExercise.level}-${selectedExercise.exerciseNumber}`;
      setExerciseOverride(prev => ({
        ...prev,
        [overrideKey]: false
      }));
      // 直接开始计时
      setIsPracticing(true);
    }
  };

  const handleFinishPractice = () => {
    if (isPracticing) {
      setIsPracticing(false);
    }
    setShowCompletionConfirm(true);
  };

  const handleConfirmCompletion = async () => {
    if (!selectedExercise) return;
    
    try {
      const minutes = Math.floor(practiceTime / 60);
      const seconds = practiceTime % 60;
      
      const diaryContent = `完成了${selectedExercise.title}练习，用时${minutes}分${seconds}秒。通过反复练习，技术水平得到了提升。`;
      
      await apiRequest("/api/diary", "POST", {
        content: diaryContent,
        rating: 3,
        duration: Math.ceil(practiceTime / 60),
        exerciseCompleted: true
      });
      
      const overrideKey = `${selectedExercise.level}-${selectedExercise.exerciseNumber}`;
      setExerciseOverride(prev => ({
        ...prev,
        [overrideKey]: true
      }));
      
      toast({
        title: "练习完成！",
        description: `恭喜完成 ${selectedExercise.title}！练习记录已保存到日记。`,
      });
      
      setShowCompletionConfirm(false);
      setShowExerciseDialog(false);
      setPracticeTime(0);
      
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/diary"] });
      
    } catch (error) {
      console.error("完成练习时出错:", error);
      toast({
        title: "完成练习失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    }
  };

  const handleNextExercise = () => {
    if (!selectedExercise || !selectedLevel) {
      return;
    }
    
    // 获取当前等级的所有练习
    const exercises = generateExercisesForLevel(selectedLevel.level);
    const currentIndex = exercises.findIndex((ex: Exercise) => ex.exerciseNumber === selectedExercise.exerciseNumber);
    
    if (currentIndex < exercises.length - 1) {
      // 有下一题，打开下一题
      const nextExercise = exercises[currentIndex + 1];
      setSelectedExercise(nextExercise);
      // 重置练习状态
      setIsPracticing(false);
      setPracticeTime(0);
    } else {
      // 当前等级最后一题，关闭对话框
      setShowExerciseDialog(false);
      toast({
        title: "等级完成！",
        description: `恭喜完成${selectedLevel.name}等级的所有练习！`,
      });
    }
  };

  const canTakeExam = (stage: LevelStage) => {
    return stage.level > 1 && stage.completedExercises >= stage.totalExercises;
  };

  // 生成考核题目
  const generateExamQuestions = (level: number): ExamQuestion[] => {
    const exercises = generateExercisesForLevel(level);
    const config = examConfigs[levelStages.find(s => s.level === level)?.category || "启明星"];
    
    // 随机选择题目
    const shuffled = [...exercises].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, config.questionCount).map(exercise => ({
      id: exercise.id,
      level: exercise.level,
      exerciseNumber: exercise.exerciseNumber,
      title: exercise.title,
      description: exercise.description,
      requirement: getExerciseRequirement(exercise.level, exercise.exerciseNumber),
      imageUrl: exercise.imageUrl,
    }));
  };

  // 开始等级考核
  const handleStartExam = (stage: LevelStage) => {
    const questions = generateExamQuestions(stage.level);
    const config = examConfigs[stage.category];
    
    setExamQuestions(questions);
    setCurrentExamQuestion(0);
    setExamStartTime(new Date());
    setExamTimeRemaining(config.timeLimit * 60); // 转换为秒
    setExamInProgress(true);
    setSelectedLevel(stage);
    setShowExamDialog(true);
    
    toast({
      title: "等级考核开始",
      description: `需要完成${config.questionCount}题，限时${config.timeLimit}分钟`,
    });
  };



  // 格式化考核剩余时间
  const formatExamTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 考核下一题
  const handleExamNext = () => {
    if (currentExamQuestion < examQuestions.length - 1) {
      setCurrentExamQuestion(prev => prev + 1);
    } else {
      // 考核完成
      setExamInProgress(false);
      setShowExamDialog(false);
      toast({
        title: "考核完成",
        description: "恭喜完成等级考核！",
      });
    }
  };

  // 结束考核
  const handleExamFinish = () => {
    setExamInProgress(false);
    setShowExamDialog(false);
    toast({
      title: "考核结束",
      description: "考核已结束",
    });
  };

  // Handle skip to level functionality
  const handleSkipToLevel = (targetLevel: number) => {
    setSkipToLevel(targetLevel);
    setShowSkipDialog(true);
  };

  const confirmSkipToLevel = async () => {
    if (!skipToLevel || !user) return;
    
    try {
      // Generate challenge questions for the skip level test
      const challengeQuestions = [
        {
          id: 1,
          question: "在台球中，什么是'拉杆'技术？",
          options: ["向前推杆", "向后拉杆使球产生回旋", "左右摆杆", "用力击球"],
          correctAnswer: 1,
          explanation: "拉杆是向后拉动球杆，使母球产生后旋，撞击目标球后会向后退。"
        },
        {
          id: 2,
          question: "进行走位时，最重要的考虑因素是什么？",
          options: ["击球力度", "下一球的位置", "球杆角度", "击球速度"],
          correctAnswer: 1,
          explanation: "走位的核心是控制母球到达有利于下一球进攻的位置。"
        },
        {
          id: 3,
          question: "什么情况下应该选择防守？",
          options: ["任何时候", "没有好的进攻机会时", "对手犯规时", "比分领先时"],
          correctAnswer: 1,
          explanation: "当没有把握的进攻机会时，选择防守可以避免给对手留下机会。"
        }
      ];
      
      setSkipChallengeQuestions(challengeQuestions);
      setCurrentSkipQuestion(0);
      setSkipChallengeAnswers([]);
      setShowSkipDialog(false);
      setShowSkipChallenge(true);
      
    } catch (error) {
      console.error("开始挑战失败:", error);
      toast({
        title: "挑战开始失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    }
  };

  const handleSkipChallengeAnswer = (answerIndex: number) => {
    const newAnswers = [...skipChallengeAnswers];
    newAnswers[currentSkipQuestion] = answerIndex.toString();
    setSkipChallengeAnswers(newAnswers);
  };

  const handleSkipChallengeNext = () => {
    if (currentSkipQuestion < skipChallengeQuestions.length - 1) {
      setCurrentSkipQuestion(prev => prev + 1);
    } else {
      finishSkipChallenge();
    }
  };

  const finishSkipChallenge = async () => {
    if (!skipToLevel || !user) return;
    
    // Calculate score
    let correctAnswers = 0;
    skipChallengeQuestions.forEach((question, index) => {
      if (skipChallengeAnswers[index] === question.correctAnswer.toString()) {
        correctAnswers++;
      }
    });
    
    const score = (correctAnswers / skipChallengeQuestions.length) * 100;
    const passed = score >= 80; // Need 80% to pass
    
    try {
      if (passed) {
        await apiRequest("/api/user/skip-level", "POST", {
          targetLevel: skipToLevel,
          challengeScore: score
        });
        
        toast({
          title: "挑战成功！",
          description: `恭喜！已成功跳级到等级 ${skipToLevel}，所有中间关卡已解锁！`,
        });
        
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      } else {
        toast({
          title: "挑战失败",
          description: `得分：${score.toFixed(0)}%，需要80%以上才能通过。请继续练习后重试！`,
          variant: "destructive",
        });
      }
      
      setShowSkipChallenge(false);
      setSkipToLevel(null);
      setCurrentSkipQuestion(0);
      setSkipChallengeAnswers([]);
      
    } catch (error) {
      console.error("处理挑战结果失败:", error);
      toast({
        title: "处理结果失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-indigo-50">


      {/* Duolingo-style Level Map */}
      <div className="max-w-lg mx-auto px-4 pb-12 pt-6">
        <div className="relative">
          {levelStages.map((stage, stageIndex) => {
            const levelColors = getLevelColors(stage.level);
            const exercises = generateExercisesForLevel(stage.level);
            
            return (
              <div key={stage.level} className="relative mb-20">
                {/* Level Header */}
                <div className={`bg-gradient-to-r ${levelColors.bg} rounded-3xl p-6 mb-12 text-white shadow-2xl mx-6`}
                     style={{
                       filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.15))'
                     }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xl">{stage.name}</div>
                      <div className="text-sm opacity-90 mt-1">等级 {stage.level} • {stage.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm opacity-90">进度</div>
                      <div className="font-bold text-lg">{stage.completedExercises}/{stage.totalExercises}</div>
                    </div>
                  </div>
                  <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-white rounded-full h-3 transition-all duration-700 ease-out"
                      style={{ width: `${stage.progress}%` }}
                    />
                  </div>
                </div>

                {/* Skip Level Button - Show for locked levels that are next to unlock */}
                {!stage.unlocked && user && stage.level === user.level + 1 && (
                  <div className="flex justify-center mb-8">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-3">跳级到这儿？</div>
                      <button
                        onClick={() => handleSkipToLevel(stage.level)}
                        className="w-16 h-16 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center text-white shadow-lg transform hover:scale-105 transition-all duration-200"
                        style={{
                          filter: 'drop-shadow(0 4px 12px rgba(249, 115, 22, 0.4))'
                        }}
                      >
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Exercise Nodes - Grouped by 5 */}
                <div className="relative">
                  {exercises.map((exercise, exerciseIndex) => {
                    const positionInGroup = exerciseIndex % 5; // 0-4 within each group
                    // 练习解锁逻辑：完成任何练习后，所有之前的练习都解锁
                    const isUnlocked = stage.unlocked && (
                      exerciseIndex <= stage.completedExercises || // 所有已完成的练习及之前的练习都解锁
                      (user && user.level > stage.level) || // 如果用户等级超过当前关卡，所有练习都解锁
                      (stage.completedExercises > 0 && exerciseIndex === 0) // 如果有任何完成进度，至少解锁第一个练习
                    );
                    const isMilestone = (exerciseIndex + 1) % 5 === 0; // Every 5th exercise
                    const groupNumber = Math.ceil((exerciseIndex + 1) / 5);
                    const showSeparator = (exerciseIndex + 1) % 5 === 0 && exerciseIndex < exercises.length - 1;
                    const isCurrentExercise = exerciseIndex === stage.completedExercises; // Next exercise to complete
                    const isThisExerciseCompleted = exerciseIndex < stage.completedExercises || isExerciseCompleted(exercise);
                    
                    // Position exercises - first 4 further to the left
                    let paddingLeft = 60; // Move milestone center position to the left
                    
                    if (!isMilestone) {
                      // Move first 4 exercises to the left
                      const zigzagPosition = exerciseIndex % 4;
                      switch (zigzagPosition) {
                        case 0: paddingLeft = 140; break;  // Left side
                        case 1: paddingLeft = 180; break;  // Right side
                        case 2: paddingLeft = 140; break;  // Left side
                        case 3: paddingLeft = 180; break;  // Right side
                        default: paddingLeft = 160; break;
                      }
                    }
                    
                    return (
                      <div key={exercise.id}>
                        {/* Exercise Row */}
                        <div 
                          className={`flex items-center relative mb-8 ${isMilestone ? 'justify-center mb-12' : 'justify-start'}`}
                          style={!isMilestone ? { paddingLeft: `${paddingLeft}px` } : {}}
                        >
                          {/* Exercise Circle */}
                          <div className="relative z-10">
                            {isMilestone ? (
                              // Medal milestone design for every 5th exercise
                              <div className="relative">
                                {/* Current exercise indicator for milestone */}
                                {isCurrentExercise && isUnlocked && (
                                  <div className="absolute -top-2 -right-2 z-20">
                                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                                      <div className="w-3 h-3 bg-white rounded-full"></div>
                                    </div>
                                  </div>
                                )}
                                <div 
                                  className={`cursor-pointer transition-all duration-300 ${
                                    !isUnlocked 
                                      ? 'cursor-not-allowed' 
                                      : 'hover:scale-105'
                                  }`}
                                  onClick={() => isUnlocked && handleExerciseClick(exercise)}
                                  style={{
                                    filter: 'drop-shadow(0 8px 25px rgba(0,0,0,0.15))'
                                  }}
                                >
                                  {/* Modern Achievement Badge */}
                                  <div className="relative w-24 h-28 flex flex-col items-center">
                                    <svg viewBox="0 0 120 120" className="w-24 h-24">
                                      {/* Badge Base/Pedestal */}
                                      <ellipse cx="60" cy="95" rx="18" ry="8" 
                                        fill={
                                          !isUnlocked 
                                            ? '#9CA3AF' 
                                            : isThisExerciseCompleted
                                              ? levelColors.node.includes('emerald') ? '#059669'
                                                : levelColors.node.includes('blue') ? '#2563EB' 
                                                : levelColors.node.includes('purple') ? '#7C3AED'
                                                : levelColors.node.includes('pink') ? '#DB2777'
                                                : levelColors.node.includes('yellow') ? '#D97706'
                                                : levelColors.node.includes('red') ? '#DC2626'
                                                : levelColors.node.includes('indigo') ? '#4F46E5'
                                                : levelColors.node.includes('green') ? '#16A34A'
                                                : '#f69acc'
                                              : '#E5E7EB'
                                        }
                                        opacity="0.6"
                                      />
                                      
                                      {/* Main Shield Body */}
                                      <path 
                                        d="M40 25 Q40 15 50 15 L70 15 Q80 15 80 25 L80 50 Q80 65 60 75 Q40 65 40 50 Z" 
                                        fill={
                                          !isUnlocked 
                                            ? '#9CA3AF' 
                                            : isThisExerciseCompleted
                                              ? levelColors.node.includes('emerald') ? '#10B981'
                                                : levelColors.node.includes('blue') ? '#3B82F6' 
                                                : levelColors.node.includes('purple') ? '#8B5CF6'
                                                : levelColors.node.includes('pink') ? '#EC4899'
                                                : levelColors.node.includes('yellow') ? '#F59E0B'
                                                : levelColors.node.includes('red') ? '#EF4444'
                                                : levelColors.node.includes('indigo') ? '#6366F1'
                                                : levelColors.node.includes('green') ? '#22C55E'
                                                : '#f69acc'
                                              : '#E5E7EB'
                                        }
                                      />
                                      
                                      {/* Shield Highlight/Gloss */}
                                      <path 
                                        d="M45 20 Q45 18 47 18 L65 18 Q70 18 70 22 L70 40 Q70 45 60 50 Q50 45 45 35 Z" 
                                        fill="rgba(255,255,255,0.3)"
                                      />
                                      
                                      {/* Left Wing/Laurel */}
                                      <path 
                                        d="M25 35 Q20 30 15 35 Q10 40 15 45 Q20 50 25 45 Q30 42 30 40 Q30 38 25 35" 
                                        fill={
                                          !isUnlocked 
                                            ? '#9CA3AF' 
                                            : isThisExerciseCompleted 
                                              ? levelColors.node.includes('emerald') ? '#34D399'
                                                : levelColors.node.includes('blue') ? '#60A5FA' 
                                                : levelColors.node.includes('purple') ? '#A78BFA'
                                                : levelColors.node.includes('pink') ? '#F472B6'
                                                : levelColors.node.includes('yellow') ? '#FBBF24'
                                                : levelColors.node.includes('red') ? '#F87171'
                                                : levelColors.node.includes('indigo') ? '#818CF8'
                                                : levelColors.node.includes('green') ? '#4ADE80'
                                                : '#f8a2c4'
                                              : '#E5E7EB'
                                        }
                                        opacity="0.8"
                                      />
                                      
                                      {/* Right Wing/Laurel */}
                                      <path 
                                        d="M95 35 Q100 30 105 35 Q110 40 105 45 Q100 50 95 45 Q90 42 90 40 Q90 38 95 35" 
                                        fill={
                                          !isUnlocked 
                                            ? '#9CA3AF' 
                                            : isThisExerciseCompleted 
                                              ? levelColors.node.includes('emerald') ? '#34D399'
                                                : levelColors.node.includes('blue') ? '#60A5FA' 
                                                : levelColors.node.includes('purple') ? '#A78BFA'
                                                : levelColors.node.includes('pink') ? '#F472B6'
                                                : levelColors.node.includes('yellow') ? '#FBBF24'
                                                : levelColors.node.includes('red') ? '#F87171'
                                                : levelColors.node.includes('indigo') ? '#818CF8'
                                                : levelColors.node.includes('green') ? '#4ADE80'
                                                : '#f8a2c4'
                                              : '#E5E7EB'
                                        }
                                        opacity="0.8"
                                      />
                                      
                                      {/* Small connecting stem */}
                                      <rect x="57" y="75" width="6" height="12" 
                                        fill={
                                          !isUnlocked 
                                            ? '#6B7280' 
                                            : isThisExerciseCompleted
                                              ? levelColors.node.includes('emerald') ? '#059669'
                                                : levelColors.node.includes('blue') ? '#2563EB' 
                                                : levelColors.node.includes('purple') ? '#7C3AED'
                                                : levelColors.node.includes('pink') ? '#DB2777'
                                                : levelColors.node.includes('yellow') ? '#D97706'
                                                : levelColors.node.includes('red') ? '#DC2626'
                                                : levelColors.node.includes('indigo') ? '#4F46E5'
                                                : levelColors.node.includes('green') ? '#16A34A'
                                                : '#DB2777'
                                              : '#9CA3AF'
                                        }
                                      />
                                      
                                      {/* Badge Content */}
                                      {!isUnlocked ? (
                                        <foreignObject x="50" y="35" width="20" height="20">
                                          <Lock className="w-5 h-5 text-white" />
                                        </foreignObject>
                                      ) : (
                                        <text x="60" y="52" textAnchor="middle" fontSize="22" fill="white" fontFamily="Arial, sans-serif" fontWeight="bold">
                                          {groupNumber}
                                        </text>
                                      )}
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              // Regular exercise circle
                              <div 
                                className={`w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
                                  !isUnlocked 
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-lg' 
                                    : isExerciseCompleted(exercise)
                                      ? `${levelColors.node} text-white shadow-2xl` 
                                      : `bg-white border-4 ${levelColors.border} text-gray-700 hover:scale-105 shadow-xl hover:shadow-2xl`
                                }`}
                                onClick={() => isUnlocked && handleExerciseClick(exercise)}
                                style={{
                                  filter: 'drop-shadow(0 8px 25px rgba(0,0,0,0.15))'
                                }}
                              >
                                {!isUnlocked ? (
                                  <Lock className="w-7 h-7" />
                                ) : (
                                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                  </svg>
                                )}
                              </div>
                            )}

                          </div>
                          

                        </div>
                        
                        {/* Group Separator */}
                        {showSeparator && (
                          <div className="flex items-center justify-center my-8">
                            <div className="flex-1 h-0.5 bg-gray-300 mx-8"></div>
                            <div className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-500 font-medium">
                              第{groupNumber + 1}组
                            </div>
                            <div className="flex-1 h-0.5 bg-gray-300 mx-8"></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Level Complete Badge or Exam Button */}
                {stage.completed && (
                  <div className="flex justify-center mt-8">
                    {canTakeExam(stage) ? (
                      <Button
                        onClick={() => handleStartExam(stage)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-2xl px-6 py-3 shadow-lg flex items-center space-x-2"
                      >
                        <Trophy className="w-5 h-5" />
                        <span className="font-bold">等级考核</span>
                      </Button>
                    ) : stage.level === 1 ? (
                      <div className={`${levelColors.node} rounded-2xl px-6 py-3 text-white shadow-lg flex items-center space-x-2`}>
                        <Trophy className="w-5 h-5" />
                        <span className="font-bold">等级完成</span>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Connection to Next Level */}
                {stageIndex < levelStages.length - 1 && (
                  <div className="flex justify-center mt-12">
                    <div className={`w-1 h-8 ${levelStages[stageIndex + 1].unlocked ? getLevelColors(levelStages[stageIndex + 1].level).node : 'bg-gray-300'}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Exercise Dialog */}
      <Dialog open={showExerciseDialog} onOpenChange={setShowExerciseDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-4xl lg:max-w-6xl max-h-[90vh] overflow-y-auto mobile-scroll p-3 sm:p-6">
          <DialogDescription className="sr-only">练习详情和训练界面</DialogDescription>
          {selectedExercise && (
            <>
              <DialogHeader className="space-y-3 pb-4">
                <DialogTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      isExerciseCompleted(selectedExercise) ? 'bg-green-500' : 'bg-blue-500'
                    }`}>
                      {selectedExercise.exerciseNumber}
                    </div>
                    <span className="text-lg sm:text-xl truncate">{selectedExercise.title}</span>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">
                    等级 {selectedExercise.level} - {selectedLevel?.name}
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              {/* 练习内容 - 上下布局 */}
              <div className="space-y-6">
                {/* 题目说明和要求 - 水平并排 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 题目说明 */}
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                    <h3 className="font-bold text-blue-700 mb-2">题目说明</h3>
                    <p className="text-gray-700">{selectedExercise?.description}</p>
                  </div>
                  
                  {/* 过关要求 */}
                  <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
                    <h3 className="font-bold text-orange-700 mb-2">过关要求</h3>
                    <p className="text-gray-700">
                      {selectedExercise && getExerciseRequirement(selectedExercise.level, selectedExercise.exerciseNumber)}
                    </p>
                  </div>
                </div>
                
                {/* 练习图片 - 响应式设计 */}
                <div className="py-4 sm:py-6 w-full">
                  <div className="rounded-lg shadow-lg bg-white p-2 sm:p-4 w-full">
                    <div className="w-full flex justify-center items-center overflow-x-auto">
                      <img 
                        src={selectedExercise?.imageUrl} 
                        alt={selectedExercise?.title}
                        className="block max-w-none"
                        style={getCroppingStyle(selectedExercise!)}
                        onError={(e) => {
                          if (e.currentTarget.parentElement) {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement.innerHTML = `
                              <div class="w-[300px] sm:w-[400px] md:w-[500px] h-[350px] sm:h-[450px] md:h-[550px] bg-green-600 border-4 sm:border-6 md:border-8 border-amber-800 rounded-lg flex items-center justify-center relative mx-auto">
                                <div class="absolute top-2 left-2 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-black rounded-full"></div>
                                <div class="absolute top-2 right-2 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-black rounded-full"></div>
                                <div class="absolute bottom-2 left-2 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-black rounded-full"></div>
                                <div class="absolute bottom-2 right-2 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-black rounded-full"></div>
                                <div class="absolute top-1/2 left-2 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-black rounded-full transform -translate-y-1/2"></div>
                                <div class="absolute top-1/2 right-2 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-black rounded-full transform -translate-y-1/2"></div>
                                <div class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-white rounded-full"></div>
                                <div class="absolute top-4 right-4 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-black rounded-full border-2 border-red-500"></div>
                              </div>
                            `;
                          }
                        }}
                      />
                    </div>
                  </div>
                  

                </div>
                
                {/* 练习状态和操作 */}
                <div className="border-t pt-6">
                  {selectedExercise && isExerciseCompleted(selectedExercise) ? (
                    <div className="text-center space-y-4">
                      <div className="space-x-3">
                        <Button 
                          onClick={handleNextExercise}
                          className="bg-green-500 hover:bg-green-600 px-8"
                        >
                          继续下一题
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={handleResetPractice}
                        >
                          重新练习
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-6">
                      {/* 练习计时器 */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <div className="text-center space-y-4">
                          <div className="text-3xl font-mono font-bold text-gray-800">
                            {formatTime(practiceTime)}
                          </div>
                          
                          {/* 练习控制按钮 */}
                          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:space-x-3">
                            {!isPracticing && practiceTime === 0 ? (
                              <Button 
                                onClick={handleStartPractice}
                                className="bg-blue-500 hover:bg-blue-600 px-8 h-12 sm:h-auto touch-target"
                              >
                                <Play className="w-4 h-4 mr-2" />
                                开始练习
                              </Button>
                            ) : (
                              <>
                                <Button 
                                  onClick={isPracticing ? handleAbortPractice : handleStartPractice}
                                  variant="outline"
                                  className="h-12 sm:h-auto touch-target"
                                >
                                  {isPracticing ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                                  {isPracticing ? '放弃练习' : '继续'}
                                </Button>
                                <Button 
                                  onClick={handleFinishPractice}
                                  className="bg-green-500 hover:bg-green-600 h-12 sm:h-auto touch-target"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  完成练习
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                

              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Completion Confirmation Dialog */}
      <Dialog open={showCompletionConfirm} onOpenChange={setShowCompletionConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>确认完成练习</DialogTitle>
            <DialogDescription>
              请确认您已完成过关要求，点击确认将记录此次练习。
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* 过关要求确认 */}
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
              <h4 className="font-bold text-orange-700 mb-2">过关要求</h4>
              <p className="text-gray-700 text-sm">
                {selectedExercise && getExerciseRequirement(selectedExercise.level, selectedExercise.exerciseNumber)}
              </p>
            </div>
            
            {/* 练习用时 */}
            <div className="text-center py-2">
              <span className="text-sm text-gray-600">本次练习用时：</span>
              <span className="text-lg font-mono font-bold text-gray-800 ml-2">
                {formatTime(practiceTime)}
              </span>
            </div>
            
            {/* 确认按钮 */}
            <div className="flex space-x-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowCompletionConfirm(false)}
                className="flex-1"
              >
                继续练习
              </Button>
              <Button 
                onClick={handleConfirmCompletion}
                className="bg-green-500 hover:bg-green-600 flex-1"
              >
                确认完成
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Exam Dialog */}
      <Dialog open={showExamDialog} onOpenChange={setShowExamDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-y-auto">
          {examQuestions.length > 0 && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    <span>等级考核 - {selectedLevel?.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      题目 {currentExamQuestion + 1} / {examQuestions.length}
                    </div>
                    <div className="text-lg font-mono font-bold text-red-600">
                      {formatExamTime(examTimeRemaining)}
                    </div>
                  </div>
                </DialogTitle>
                <DialogDescription>
                  请按照要求完成每道题目，考核期间请保持专注
                </DialogDescription>
              </DialogHeader>

              {/* 当前考核题目 */}
              <div className="space-y-6">
                {/* 考核规则提示 */}
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                  <h4 className="font-bold text-yellow-700 mb-2">考核规则</h4>
                  <p className="text-gray-700 text-sm">
                    {selectedLevel && `${selectedLevel.category}阶段需要完成${examConfigs[selectedLevel.category]?.questionCount}题，
                    限时${examConfigs[selectedLevel.category]?.timeLimit}分钟。所有题目必须严格按照要求完成。`}
                  </p>
                </div>

                {/* 当前题目内容 */}
                {examQuestions[currentExamQuestion] && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 题目说明 */}
                    <div className="space-y-4">
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                        <h3 className="font-bold text-blue-700 mb-2">
                          第{examQuestions[currentExamQuestion].exerciseNumber}题
                        </h3>
                        <p className="text-gray-700">{examQuestions[currentExamQuestion].description}</p>
                      </div>
                      
                      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
                        <h3 className="font-bold text-orange-700 mb-2">完成要求</h3>
                        <p className="text-gray-700">{examQuestions[currentExamQuestion].requirement}</p>
                      </div>
                    </div>

                    {/* 题目图片 */}
                    <div className="flex justify-center">
                      <div className="rounded-lg shadow-lg bg-white p-4 max-w-full">
                        <img 
                          src={examQuestions[currentExamQuestion].imageUrl}
                          alt={`考核题目${examQuestions[currentExamQuestion].exerciseNumber}`}
                          className="max-w-full max-h-80 object-contain"
                          onError={(e) => {
                            e.currentTarget.src = "/api/placeholder/400/300";
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 考核控制按钮 */}
                <div className="flex justify-between items-center pt-6 border-t">
                  <Button 
                    variant="outline"
                    onClick={handleExamFinish}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    结束考核
                  </Button>
                  
                  <div className="space-x-3">
                    {currentExamQuestion < examQuestions.length - 1 ? (
                      <Button 
                        onClick={handleExamNext}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        下一题
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleExamNext}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        完成考核
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Skip Level Challenge Dialog */}
      <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-orange-600">
              跳级挑战
            </DialogTitle>
            <DialogDescription className="text-center mt-4">
              想要跳级到等级 {skipToLevel}？
              <br />
              完成挑战后，所有被跳过的关卡都将解锁！
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <div className="bg-orange-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center mb-3">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/>
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-800 mb-2">挑战规则</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 需要完成 3 道技能验证题</li>
                  <li>• 每题都需要达到标准要求</li>
                  <li>• 挑战成功后解锁到目标等级</li>
                  <li>• 失败可以重新挑战</li>
                </ul>
              </div>
            </div>
            
            <div className="text-center text-sm text-gray-500 mb-4">
              当前等级: {user?.level} → 目标等级: {skipToLevel}
            </div>
          </div>

          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setShowSkipDialog(false)}
              className="flex-1"
            >
              取消
            </Button>
            <Button 
              onClick={confirmSkipToLevel}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
            >
              开始挑战
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Skip Level Challenge Test Dialog */}
      <Dialog open={showSkipChallenge} onOpenChange={setShowSkipChallenge}>
        <DialogContent className="max-w-2xl mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-orange-600">
              跳级挑战测试
            </DialogTitle>
            <DialogDescription className="text-center mt-2">
              题目 {currentSkipQuestion + 1} / {skipChallengeQuestions.length}
            </DialogDescription>
          </DialogHeader>
          
          {skipChallengeQuestions.length > 0 && (
            <div className="py-6">
              <div className="bg-orange-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-lg text-gray-800 mb-4">
                  {skipChallengeQuestions[currentSkipQuestion]?.question}
                </h3>
                
                <div className="space-y-3">
                  {skipChallengeQuestions[currentSkipQuestion]?.options.map((option: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleSkipChallengeAnswer(index)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        skipChallengeAnswers[currentSkipQuestion] === index.toString()
                          ? 'border-orange-500 bg-orange-100 text-orange-800'
                          : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      <span className="font-medium">{String.fromCharCode(65 + index)}. </span>
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-4">
                  请选择正确答案后点击继续
                </div>
                
                <Button 
                  onClick={handleSkipChallengeNext}
                  disabled={!skipChallengeAnswers[currentSkipQuestion]}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8"
                >
                  {currentSkipQuestion < skipChallengeQuestions.length - 1 ? '下一题' : '完成挑战'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}