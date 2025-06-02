import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User, Task } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { getLevelName, DIFFICULTY_COLORS } from "@/lib/tasks";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TestLevel {
  level: number;
  name: string;
  description: string;
  questionCount: number;
  timeLimit: number; // in hours
  price: string;
  unlocked: boolean;
  category: "启明星" | "超新星" | "智子星";
}

export default function Test() {
  const [selectedTest, setSelectedTest] = useState<TestLevel | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const { toast } = useToast();

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  if (userLoading || tasksLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-48 h-8 skeleton mx-auto mb-4"></div>
          <div className="w-64 h-6 skeleton mx-auto"></div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-96 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!user || !tasks) {
    return <div className="text-center py-8">数据加载失败</div>;
  }

  const testLevels: TestLevel[] = [
    // 启明星 (Levels 1-3)
    {
      level: 2,
      name: "小有所成",
      description: "台球技术基础框架搭建",
      questionCount: 6,
      timeLimit: 2,
      price: "19.9元",
      unlocked: user.level >= 1,
      category: "启明星"
    },
    {
      level: 3,
      name: "渐入佳境",
      description: "掌握基本走位与控球技巧",
      questionCount: 6,
      timeLimit: 2,
      price: "19.9元",
      unlocked: user.level >= 2,
      category: "启明星"
    },
    
    // 超新星 (Levels 4-6)
    {
      level: 4,
      name: "炉火纯青",
      description: "力度与杆法的完美艺术",
      questionCount: 8,
      timeLimit: 2,
      price: "29.9元",
      unlocked: user.level >= 3,
      category: "超新星"
    },
    {
      level: 5,
      name: "登堂入室",
      description: "高阶控球与实战训练",
      questionCount: 8,
      timeLimit: 2,
      price: "29.9元",
      unlocked: user.level >= 4,
      category: "超新星"
    },
    {
      level: 6,
      name: "超群绝伦",
      description: "精确走位与复杂球局",
      questionCount: 8,
      timeLimit: 2,
      price: "29.9元",
      unlocked: user.level >= 5,
      category: "超新星"
    },
    
    // 智子星 (Levels 7-9)
    {
      level: 7,
      name: "登峰造极",
      description: "台球桌上的战略思维",
      questionCount: 10,
      timeLimit: 3,
      price: "29.9元",
      unlocked: user.level >= 6,
      category: "智子星"
    },
    {
      level: 8,
      name: "出神入化",
      description: "超越技巧的艺术境界",
      questionCount: 10,
      timeLimit: 3,
      price: "29.9元",
      unlocked: user.level >= 7,
      category: "智子星"
    },
    {
      level: 9,
      name: "人杆合一",
      description: "台球的最高境界",
      questionCount: 10,
      timeLimit: 3,
      price: "29.9元",
      unlocked: user.level >= 8,
      category: "智子星"
    }
  ];

  const getCategoryColor = (category: string) => {
    switch(category) {
      case "启明星": return "bg-blue-500";
      case "超新星": return "bg-purple-500";
      case "智子星": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case "启明星": return "⭐";
      case "超新星": return "💫";
      case "智子星": return "🌟";
      default: return "🏆";
    }
  };

  const startTest = (testLevel: TestLevel) => {
    setSelectedTest(testLevel);
    setTestStarted(true);
    setCurrentQuestion(0);
    setTimeRemaining(testLevel.timeLimit * 60 * 60); // Convert hours to seconds
    setAnswers([]);
    
    toast({
      title: "考核开始！",
      description: `${testLevel.name}考核已开始，限时${testLevel.timeLimit}小时完成${testLevel.questionCount}题。`,
    });
  };

  const renderTestInterface = () => {
    if (!selectedTest || !testStarted) return null;

    const relevantTasks = tasks.filter(t => t.level === selectedTest.level);
    const currentTask = relevantTasks[currentQuestion % relevantTasks.length];

    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-green-700">
                {selectedTest.name} 考核 - 第 {currentQuestion + 1}/{selectedTest.questionCount} 题
              </CardTitle>
              <Badge variant="outline">
                剩余时间: {Math.floor(timeRemaining / 3600)}:{Math.floor((timeRemaining % 3600) / 60).toString().padStart(2, '0')}
              </Badge>
            </div>
            <Progress value={(currentQuestion / selectedTest.questionCount) * 100} className="h-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-blue-700 mb-2">{currentTask?.title}</h3>
                <p className="text-gray-700">{currentTask?.description}</p>
                <div className="mt-4 flex items-center space-x-4">
                  <Badge className={DIFFICULTY_COLORS[currentTask?.difficulty as keyof typeof DIFFICULTY_COLORS]}>
                    {currentTask?.difficulty}
                  </Badge>
                  <span className="text-sm text-gray-500">类别: {currentTask?.category}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-gray-700">请为此次练习表现评分：</h4>
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => {
                        const newAnswers = [...answers];
                        newAnswers[currentQuestion] = rating;
                        setAnswers(newAnswers);
                      }}
                      className={`w-12 h-12 rounded-full text-xl font-bold transition-colors ${
                        answers[currentQuestion] === rating
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      {rating}⭐
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                >
                  上一题
                </Button>
                
                {currentQuestion < selectedTest.questionCount - 1 ? (
                  <Button
                    onClick={() => setCurrentQuestion(currentQuestion + 1)}
                    disabled={!answers[currentQuestion]}
                    className="bg-billiards-green hover:bg-green-700"
                  >
                    下一题
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      // Submit test logic here
                      const avgScore = answers.reduce((a, b) => a + b, 0) / answers.length;
                      toast({
                        title: "考核完成！",
                        description: `平均得分: ${avgScore.toFixed(1)}星`,
                      });
                      setTestStarted(false);
                      setSelectedTest(null);
                    }}
                    disabled={!answers[currentQuestion]}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    提交考核
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (testStarted && selectedTest) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        {renderTestInterface()}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-green-700 mb-2">等级考核</h2>
        <p className="text-gray-600">通过考核晋升等级，解锁更高难度的训练内容</p>
        <div className="inline-flex items-center bg-green-100 rounded-full px-4 py-2 mt-4">
          <span className="mr-2">🏆</span>
          <span className="text-green-700 font-medium">当前等级: {getLevelName(user.level)} (等级 {user.level})</span>
        </div>
      </div>

      {/* Test Instructions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-green-700">考核说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="font-bold mb-2">启明星阶段</h3>
              <p className="text-sm text-gray-600">随机抽取6题，限时2小时完成<br/>等级1-3，售价19.9元/级</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">💫</span>
              </div>
              <h3 className="font-bold mb-2">超新星阶段</h3>
              <p className="text-sm text-gray-600">随机抽取8题，限时2小时完成<br/>等级4-6，售价29.9元/级</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🌟</span>
              </div>
              <h3 className="font-bold mb-2">智子星阶段</h3>
              <p className="text-sm text-gray-600">随机抽取10题，限时3小时完成<br/>等级7-9，售价29.9元/级</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Levels */}
      <div className="grid md:grid-cols-3 gap-6">
        {testLevels.map((testLevel) => (
          <Card 
            key={testLevel.level} 
            className={`overflow-hidden ${
              !testLevel.unlocked ? 'opacity-60' : ''
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 ${getCategoryColor(testLevel.category)} rounded-full flex items-center justify-center`}>
                    <span className="text-white text-sm">{getCategoryIcon(testLevel.category)}</span>
                  </div>
                  <CardTitle className="text-lg text-green-700">
                    等级 {testLevel.level}
                  </CardTitle>
                </div>
                <Badge variant="outline">{testLevel.category}</Badge>
              </div>
              <h3 className="font-bold text-gray-800">{testLevel.name}</h3>
              <p className="text-sm text-gray-600">{testLevel.description}</p>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">题目数量</span>
                  <span className="font-medium">{testLevel.questionCount}题</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">考核时间</span>
                  <span className="font-medium">{testLevel.timeLimit}小时</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">考核费用</span>
                  <span className="font-medium text-orange-600">{testLevel.price}</span>
                </div>
                
                <div className="pt-4">
                  {!testLevel.unlocked ? (
                    <Button disabled className="w-full" variant="outline">
                      🔒 未解锁
                    </Button>
                  ) : user.level >= testLevel.level ? (
                    <Button disabled className="w-full bg-green-600">
                      ✅ 已通过
                    </Button>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="w-full bg-billiards-green hover:bg-green-700">
                          开始考核
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认开始考核</AlertDialogTitle>
                          <AlertDialogDescription>
                            您即将开始"{testLevel.name}"等级考核。<br/>
                            • 考核题目: {testLevel.questionCount}题<br/>
                            • 限制时间: {testLevel.timeLimit}小时<br/>
                            • 考核费用: {testLevel.price}<br/><br/>
                            考核开始后无法暂停，请确保您有充足的时间完成。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => startTest(testLevel)}
                            className="bg-billiards-green hover:bg-green-700"
                          >
                            确认开始
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Help Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-green-700">考核帮助</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold mb-2">考核流程：</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 选择对应等级的考核项目</li>
                <li>• 系统随机抽取指定数量的题目</li>
                <li>• 在限定时间内完成所有练习</li>
                <li>• 为每个练习项目进行自评打分</li>
                <li>• 提交考核结果等待审核</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2">注意事项：</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 考核需要连续完成，中途不可暂停</li>
                <li>• 请确保练习环境和设备准备充分</li>
                <li>• 诚实评价自己的练习表现</li>
                <li>• 未通过考核不可购买下一级题目</li>
                <li>• 可在群内与其他学员交流学习</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}