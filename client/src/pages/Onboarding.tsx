import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useDayCurriculum, useNinetyDayChallengeProgress } from "@/hooks/useNinetyDayTraining";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, ArrowLeft, ArrowRight, Sparkles, Target, Clock, Stars } from "lucide-react";
import { supabase } from "@/lib/supabase";

type AnswerMap = Record<string, number | null>;

const QUESTIONS = [
  {
    id: "accuracy",
    title: "你是否能稳定地把目标球打进袋？",
    desc: "判断当前准度水平",
    weight: 2,
    options: [
      { label: "几乎不能", score: 0, hint: "需要从基础瞄准和出杆开始" },
      { label: "偶尔可以", score: 1, hint: "有感觉但不稳定" },
      { label: "大部分可以", score: 2, hint: "准度较好，可加速进阶" },
    ],
  },
  {
    id: "positioning",
    title: "你能否稳定控制母球停位？",
    desc: "判断走位控制基础",
    weight: 2,
    options: [
      { label: "控制不好", score: 0, hint: "从简单停位练起" },
      { label: "偶尔能控", score: 1, hint: "需要系统走位训练" },
      { label: "大部分能控", score: 2, hint: "可更早进入进阶阶段" },
    ],
  },
  {
    id: "experience",
    title: "你的练球时长或比赛经验？",
    desc: "判断整体经验",
    weight: 1,
    options: [
      { label: "刚开始学", score: 0, hint: "从第 1 天开始更稳" },
      { label: "打过一段时间", score: 1, hint: "可跳过部分基础" },
      { label: "有比赛经验", score: 2, hint: "可以加速起步" },
    ],
  },
  {
    id: "time",
    title: "每天可投入的训练时间？",
    desc: "判断节奏和负担",
    weight: 1,
    options: [
      { label: "10-20 分钟", score: 0, hint: "优先短时高频计划" },
      { label: "20-40 分钟", score: 1, hint: "适中节奏" },
      { label: "40+ 分钟", score: 2, hint: "可按标准节奏" },
    ],
  },
] as const;

function computeRecommendedStart(answers: AnswerMap) {
  const totalScore = QUESTIONS.reduce((sum, q) => {
    const choice = answers[q.id];
    if (choice === null || choice === undefined) return sum;
    return sum + choice * q.weight;
  }, 0);

  // 简化映射：低分从 day1 起步，中等 5/10，高分 15
  if (totalScore <= 2) return 1;
  if (totalScore <= 4) return 5;
  if (totalScore <= 6) return 10;
  return 15;
}

function PlanCards({ days }: { days: number[] }) {
  const { data: d1, isLoading: l1 } = useDayCurriculum(days[0] || 0);
  const { data: d2, isLoading: l2 } = useDayCurriculum(days[1] || 0);
  const { data: d3, isLoading: l3 } = useDayCurriculum(days[2] || 0);

  const items = [
    { day: days[0], curriculum: d1?.curriculum, loading: l1 },
    { day: days[1], curriculum: d2?.curriculum, loading: l2 },
    { day: days[2], curriculum: d3?.curriculum, loading: l3 },
  ].filter((i) => i.day && i.day >= 1 && i.day <= 90);

  if (items.length === 0) return null;

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {items.map((item) => (
        <Card key={item.day} className="border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>第 {item.day} 天</span>
              <Badge variant="outline" className="text-emerald-700 border-emerald-200">
                预计 {item.curriculum?.estimatedDuration || 30} 分钟
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-semibold text-foreground">
              {item.loading ? "加载训练内容..." : item.curriculum?.title || "今日训练"}
            </p>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {item.loading
                ? "请稍候..."
                : item.curriculum?.description || "系统化训练，循序渐进提升。"}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Target className="w-4 h-4" />
              <span>{item.curriculum?.trainingType || "系统训练"}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Onboarding() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { data: progress } = useNinetyDayChallengeProgress(user?.id || "");

  const [step, setStep] = useState(0); // 0: welcome, 1: questions, 2: plan
  const [answers, setAnswers] = useState<AnswerMap>(() =>
    QUESTIONS.reduce((map, q) => ({ ...map, [q.id]: null }), {} as AnswerMap)
  );

  const recommendedStart = useMemo(() => computeRecommendedStart(answers), [answers]);
  const planDays = useMemo(
    () => [recommendedStart, recommendedStart + 1, recommendedStart + 2].filter((d) => d <= 90),
    [recommendedStart]
  );

  // If user already started challenge, skip onboarding
  useEffect(() => {
    if (progress?.challenge_start_date) {
      localStorage.setItem("onboarding_completed", "true");
      navigate("/ninety-day-challenge");
    }
  }, [progress?.challenge_start_date, navigate]);

  // Guard unauthenticated
  if (!isAuthenticated && !isLoading) {
    navigate("/login");
    return null;
  }

  const answeredCount = Object.values(answers).filter((v) => v !== null && v !== undefined).length;
  const canProceedQuestions = answeredCount === QUESTIONS.length;

  const handleSelect = (id: string, score: number) => {
    setAnswers((prev) => ({ ...prev, [id]: score }));
  };

  const handleComplete = async () => {
    try {
      // Get current Supabase session for Authorization header
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add Authorization header if session exists
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      // Call backend API to save onboarding completion
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          recommendedStartDay: recommendedStart,
          answers: answers,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to complete onboarding");
      }

      const result = await response.json();
      console.log("Onboarding completed:", result);

      // Also save to localStorage as backup
      localStorage.setItem("onboarding_completed", "true");
      localStorage.setItem("onboarding_recommended_start", String(recommendedStart));

      // Navigate to challenge page
      navigate("/ninety-day-challenge");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      // Even if API fails, still proceed (localStorage backup)
      localStorage.setItem("onboarding_completed", "true");
      localStorage.setItem("onboarding_recommended_start", String(recommendedStart));
      navigate("/ninety-day-challenge");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-emerald-700 font-semibold">新手引导</p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
              用 90 天，从新手到一杆清台
            </h1>
            <p className="text-muted-foreground mt-2">
              每天 30 分钟，先了解你的水平，再给你 3 天起步计划。
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end gap-2">
            <div className="text-sm text-muted-foreground">进度</div>
            <Progress value={(step / 2) * 100} className="w-40" />
          </div>
        </div>

        {step === 0 && (
          <Card className="border-emerald-200 shadow-lg">
            <CardContent className="p-8 md:p-12 space-y-8">
              {/* 品牌标题 */}
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-3 text-emerald-700">
                  <Sparkles className="w-6 h-6" />
                  <span className="text-xl font-bold">欢迎来到三个月一杆清台训练系统</span>
                  <Sparkles className="w-6 h-6" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-foreground">
                  用 90 天，从新手到一杆清台
                </p>
                <p className="text-muted-foreground">
                  每天只需 30 分钟，跟着练就能进步
                </p>
              </div>

              {/* 痛点共鸣 */}
              <div className="space-y-4 bg-amber-50 p-6 rounded-lg border border-amber-200">
                <p className="font-semibold text-amber-900 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  你是否曾经遇到这些困扰？
                </p>
                <ul className="space-y-3 text-sm text-amber-900">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold mt-0.5">•</span>
                    <span>学了一段时间，也不知道自己有没有进步？</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold mt-0.5">•</span>
                    <span>不知道该练什么，只会乱打？</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold mt-0.5">•</span>
                    <span>找不到系统课程或靠谱教练？</span>
                  </li>
                </ul>
              </div>

              {/* 价值承诺 */}
              <div className="space-y-4 bg-emerald-50 p-6 rounded-lg border border-emerald-200">
                <p className="font-semibold text-emerald-900 flex items-center gap-2">
                  <Stars className="w-5 h-5" />
                  别担心，我们为你准备了完整的解决方案
                </p>
                <ul className="space-y-3 text-sm text-emerald-900">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>90 天系统化训练计划</strong>
                      <p className="text-emerald-700">从基础到进阶，循序渐进提升</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>个性化起步建议</strong>
                      <p className="text-emerald-700">根据你的水平，从最适合的地方开始</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>游戏化激励系统</strong>
                      <p className="text-emerald-700">连胜打卡、能力提升可视化，帮你坚持</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* CTA区域 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                  <Clock className="w-4 h-4" />
                  <span>只需 1 分钟，了解你的当前水平</span>
                </div>
                <div className="flex justify-center">
                  <Button
                    onClick={() => setStep(1)}
                    size="lg"
                    className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
                  >
                    开始水平测试
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <div className="space-y-4">
            {QUESTIONS.map((q) => (
              <Card key={q.id} className="border-emerald-100">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{q.desc}</p>
                      <CardTitle className="text-lg">{q.title}</CardTitle>
                    </div>
                    <Badge variant="secondary">权重 x{q.weight}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-3">
                  {q.options.map((opt, idx) => {
                    const active = answers[q.id] === opt.score;
                    return (
                      <button
                        key={opt.label}
                        className={`text-left p-4 rounded-lg border transition-all ${
                          active
                            ? "border-emerald-500 bg-emerald-50 shadow-sm"
                            : "border-gray-200 hover:border-emerald-200"
                        }`}
                        onClick={() => handleSelect(q.id, opt.score)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{opt.label}</span>
                          {active && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{opt.hint}</p>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            ))}

            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setStep(0)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={!canProceedQuestions}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                查看我的训练计划
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <Card className="border-emerald-200 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stars className="w-5 h-5 text-amber-500" />
                你的起步建议：从第 {recommendedStart} 天开始
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                已根据你的水平和时间，生成前 3 天计划。随时可以调整，但建议按顺序完成。
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <PlanCards days={planDays} />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>预计每天 30-40 分钟；时间紧可先完成核心环节。</span>
              </div>
              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回修改
                </Button>
                <Button onClick={handleComplete} className="bg-emerald-600 hover:bg-emerald-700">
                  进入挑战，开始第 {recommendedStart} 天
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
