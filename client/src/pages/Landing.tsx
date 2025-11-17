import { useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Target, Trophy, TrendingUp, Users, Loader2 } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!email) {
      toast({
        title: "请输入邮箱",
        description: "请填写用于登录的邮箱地址",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, accessCode }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ message: "登录失败" }));
        throw new Error(payload.message || "登录失败");
      }

      toast({
        title: "登录成功",
        description: "正在进入训练平台…",
      });

      setLocation("/levels");
    } catch (error: any) {
      toast({
        title: "无法登录",
        description: error?.message || "请稍后再试",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            三个月一杆清台
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            专业的中式八球训练平台，通过科学的训练体系和AI智能分析，帮助您快速提升球技水平
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-6"
            onClick={() => document.getElementById("auth-form")?.scrollIntoView({ behavior: "smooth" })}
          >
            开始训练之旅
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>系统训练</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                30天系统课程，从基础到进阶，循序渐进提升技术
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>智能分析</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                AI教练实时反馈，个性化训练建议，精准定位技术问题
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Trophy className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <CardTitle>成就系统</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                丰富的成就奖励，记录每一次进步，激励持续练习
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>专业指导</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                专业教练团队设计课程，科学训练方法，快速突破瓶颈
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            准备好开始您的台球训练了吗？
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            加入数千名球友，一起在科学的训练体系中快速提升球技
          </p>
          <form id="auth-form" className="space-y-4 max-w-md mx-auto text-left" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="email">登录邮箱</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accessCode">访问口令（可选）</Label>
              <Input
                id="accessCode"
                type="password"
                placeholder="如果管理员提供了访问口令，请在此输入"
                value={accessCode}
                onChange={(event) => setAccessCode(event.target.value)}
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              管理员可在后台配置允许的邮箱和访问口令，确保平台安全使用。
            </p>
            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  正在登录…
                </span>
              ) : (
                "立即开始训练"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
