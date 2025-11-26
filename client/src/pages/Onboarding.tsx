import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useDayCurriculum, useNinetyDayChallengeProgress } from "@/hooks/useNinetyDayTraining";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, ArrowLeft, ArrowRight, Sparkles, Target, Clock, Stars } from "lucide-react";

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

  const handleComplete = () => {
    localStorage.setItem("onboarding_completed", "true");
    localStorage.setItem("onboarding_recommended_start", String(recommendedStart));
    navigate("/ninety-day-challenge");
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
          <Card className="border-emerald-200 shadow-sm">
            <CardContent className="p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-3 text-emerald-700">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">欢迎来到耶氏台球训练系统</span>
              </div>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>• 90 天主线训练 + 游戏化激励，帮助坚持</li>
                <li>• 先做一个 1 分钟水平测试，定制你的起步日</li>
                <li>• 马上给出“接下来 3 天计划”，可直接开始</li>
              </ul>
              <div className="flex justify-end">
                <Button onClick={() => setStep(1)} className="bg-emerald-600 hover:bg-emerald-700">
                  开始水平测试
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
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
