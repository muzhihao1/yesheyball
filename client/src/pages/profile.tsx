import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  User as UserIcon, 
  Settings, 
  Bell, 
  Shield, 
  Calendar, 
  Clock, 
  Target,
  Edit,
  Save,
  Camera,
  Mail,
  Phone,
  MapPin,
  Cake,
  Trophy,
  Star,
  Flame,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface UserProfile {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  location?: string;
  birthday?: string;
  bio?: string;
  avatar?: string;
  level: number;
  exp: number;
  streak: number;
  totalDays: number;
  completedTasks: number;
  totalTime: number;
}

interface UserSettings {
  notifications: {
    training: boolean;
    achievements: boolean;
    streak: boolean;
    email: boolean;
  };
  privacy: {
    showProfile: boolean;
    showStats: boolean;
    showAchievements: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: 'zh-CN' | 'en-US';
    timezone: string;
  };
}

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    phone: '',
    location: '',
    birthday: '',
    bio: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user data
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  // Fetch streak data
  const { data: streakData } = useQuery<{
    currentStreak: number;
    longestStreak: number;
    totalDays: number;
    recentDays: { date: string; hasActivity: boolean; sessions: number }[];
  }>({
    queryKey: ["/api/user/streak"],
  });

  // Mock settings data (in real app this would come from API)
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      training: true,
      achievements: true,
      streak: true,
      email: false
    },
    privacy: {
      showProfile: true,
      showStats: true,
      showAchievements: true
    },
    preferences: {
      theme: 'light',
      language: 'zh-CN',
      timezone: 'Asia/Shanghai'
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      return apiRequest(`/api/user/${user?.id}`, 'PATCH', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "个人资料已更新" });
      setIsEditing(false);
    },
    onError: () => {
      toast({ title: "更新失败", variant: "destructive" });
    }
  });

  // Initialize edit form when user data loads
  useEffect(() => {
    if (user && !editForm.username) {
      setEditForm({
        username: user.username || '',
        email: user.email || '',
        phone: '',
        location: '',
        birthday: '',
        bio: ''
      });
    }
  }, [user, editForm.username]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="md:col-span-2 h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="text-center py-8">数据加载失败</div>;
  }

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(editForm);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-green-700 mb-2">个人档案</h1>
        <p className="text-gray-600">管理你的账户信息和偏好设置</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="relative mx-auto w-24 h-24 mb-4">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-12 w-12 text-green-600" />
                </div>
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full p-2 h-8 w-8"
                  variant="outline"
                >
                  <Camera className="h-3 w-3" />
                </Button>
              </div>
              <CardTitle className="text-xl">{user.username}</CardTitle>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <Badge variant="secondary">等级 {user.level}</Badge>
                <Badge variant="outline">{user.exp} XP</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Enhanced Streak Display */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Flame className="h-6 w-6 text-orange-500" />
                  <div className="text-3xl font-bold text-orange-600">
                    {streakData?.currentStreak ?? user?.streak ?? 0}
                  </div>
                </div>
                <div className="text-sm text-gray-500 mb-3">连续训练天数</div>
                
                {/* Daily Activity Pattern */}
                {streakData?.recentDays && (
                  <div className="flex justify-center space-x-1 mb-3">
                    {streakData.recentDays.map((day: any, index: number) => (
                      <div
                        key={index}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          day.hasActivity 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 text-gray-400'
                        }`}
                        title={`${new Date(day.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}: ${day.sessions}次训练`}
                      >
                        {day.hasActivity ? <CheckCircle className="h-3 w-3" /> : index === 6 ? '今' : ''}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="font-semibold">{streakData?.totalDays ?? user?.completedTasks ?? 0}</div>
                  <div className="text-xs text-gray-500">训练天数</div>
                </div>
                <div>
                  <div className="font-semibold">{streakData?.longestStreak ?? 0}</div>
                  <div className="text-xs text-gray-500">最长连击</div>
                </div>
              </div>
              
              {/* Streak Stats */}
              {streakData && (
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-3">
                  <div className="text-center">
                    <div className="text-sm font-medium text-orange-800">
                      {(streakData.currentStreak ?? 0) === 0 
                        ? "开始你的训练之旅！" 
                        : (streakData.currentStreak ?? 0) === 1 
                        ? "很好的开始！"
                        : (streakData.currentStreak ?? 0) < 7
                        ? "保持节奏！"
                        : "训练达人！"}
                    </div>
                    <div className="text-xs text-orange-600 mt-1">
                      {(streakData.currentStreak ?? 0) === 0 
                        ? "完成一次训练开始打卡"
                        : `已坚持${streakData.currentStreak}天，继续加油！`}
                    </div>
                  </div>
                </div>
              )}

              <Button 
                className="w-full" 
                onClick={() => setIsEditing(true)}
                disabled={isEditing}
              >
                <Edit className="h-4 w-4 mr-2" />
                编辑资料
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">个人信息</TabsTrigger>
              <TabsTrigger value="settings">设置</TabsTrigger>
              <TabsTrigger value="privacy">隐私</TabsTrigger>
              <TabsTrigger value="account">账户</TabsTrigger>
            </TabsList>

            {/* Personal Information */}
            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserIcon className="h-5 w-5 mr-2" />
                    个人信息
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">用户名</Label>
                      <Input
                        id="username"
                        value={isEditing ? editForm.username : user.username}
                        onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">邮箱</Label>
                      <Input
                        id="email"
                        type="email"
                        value={isEditing ? editForm.email : '未设置'}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        disabled={!isEditing}
                        placeholder="请输入邮箱地址"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">手机号码</Label>
                      <Input
                        id="phone"
                        value={isEditing ? editForm.phone : '未设置'}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        disabled={!isEditing}
                        placeholder="请输入手机号码"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">所在地区</Label>
                      <Input
                        id="location"
                        value={isEditing ? editForm.location : '未设置'}
                        onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                        disabled={!isEditing}
                        placeholder="请输入所在地区"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthday">生日</Label>
                      <Input
                        id="birthday"
                        type="date"
                        value={isEditing ? editForm.birthday : ''}
                        onChange={(e) => setEditForm({...editForm, birthday: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">个人简介</Label>
                    <Textarea
                      id="bio"
                      value={isEditing ? editForm.bio : '这个人很懒，什么都没留下...'}
                      onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                      disabled={!isEditing}
                      placeholder="介绍一下自己吧..."
                      rows={3}
                    />
                  </div>

                  {isEditing && (
                    <div className="flex space-x-2 pt-4">
                      <Button 
                        onClick={handleSaveProfile}
                        disabled={updateProfileMutation.isPending}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {updateProfileMutation.isPending ? '保存中...' : '保存'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                      >
                        取消
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    应用设置
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Notifications */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Bell className="h-5 w-5 mr-2" />
                      通知设置
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>训练提醒</Label>
                          <p className="text-sm text-gray-500">每日训练计划提醒</p>
                        </div>
                        <Switch 
                          checked={settings.notifications.training}
                          onCheckedChange={(checked) => 
                            setSettings(prev => ({
                              ...prev,
                              notifications: {...prev.notifications, training: checked}
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>成就通知</Label>
                          <p className="text-sm text-gray-500">获得新成就时通知</p>
                        </div>
                        <Switch 
                          checked={settings.notifications.achievements}
                          onCheckedChange={(checked) => 
                            setSettings(prev => ({
                              ...prev,
                              notifications: {...prev.notifications, achievements: checked}
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>连击提醒</Label>
                          <p className="text-sm text-gray-500">连续训练天数提醒</p>
                        </div>
                        <Switch 
                          checked={settings.notifications.streak}
                          onCheckedChange={(checked) => 
                            setSettings(prev => ({
                              ...prev,
                              notifications: {...prev.notifications, streak: checked}
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preferences */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">偏好设置</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>主题</Label>
                        <select 
                          className="w-full p-2 border rounded-md"
                          value={settings.preferences.theme}
                          onChange={(e) => 
                            setSettings(prev => ({
                              ...prev,
                              preferences: {...prev.preferences, theme: e.target.value as any}
                            }))
                          }
                        >
                          <option value="light">浅色</option>
                          <option value="dark">深色</option>
                          <option value="auto">跟随系统</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>语言</Label>
                        <select 
                          className="w-full p-2 border rounded-md"
                          value={settings.preferences.language}
                          onChange={(e) => 
                            setSettings(prev => ({
                              ...prev,
                              preferences: {...prev.preferences, language: e.target.value as any}
                            }))
                          }
                        >
                          <option value="zh-CN">简体中文</option>
                          <option value="en-US">English</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy */}
            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    隐私设置
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>公开个人资料</Label>
                        <p className="text-sm text-gray-500">允许其他用户查看你的个人资料</p>
                      </div>
                      <Switch 
                        checked={settings.privacy.showProfile}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({
                            ...prev,
                            privacy: {...prev.privacy, showProfile: checked}
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>显示训练统计</Label>
                        <p className="text-sm text-gray-500">在个人资料中显示训练数据</p>
                      </div>
                      <Switch 
                        checked={settings.privacy.showStats}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({
                            ...prev,
                            privacy: {...prev.privacy, showStats: checked}
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>显示成就</Label>
                        <p className="text-sm text-gray-500">在个人资料中显示已获得的成就</p>
                      </div>
                      <Switch 
                        checked={settings.privacy.showAchievements}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({
                            ...prev,
                            privacy: {...prev.privacy, showAchievements: checked}
                          }))
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Account */}
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserIcon className="h-5 w-5 mr-2" />
                    账户管理
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">账户信息</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">用户ID:</span>
                          <span className="font-mono">{user.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">注册时间:</span>
                          <span>{new Date(user.createdAt).toLocaleDateString('zh-CN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">最后活跃:</span>
                          <span>{new Date(user.lastActiveAt).toLocaleDateString('zh-CN')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Mail className="h-4 w-4 mr-2" />
                        修改密码
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Shield className="h-4 w-4 mr-2" />
                        双重认证
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Target className="h-4 w-4 mr-2" />
                        导出数据
                      </Button>
                    </div>

                    <div className="pt-4 border-t">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="destructive" className="w-full">
                            注销账户
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>确认注销账户</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-gray-600">
                              注销账户将永久删除您的所有数据，包括训练记录、成就等信息。此操作不可撤销。
                            </p>
                            <div className="flex space-x-2">
                              <Button variant="destructive" className="flex-1">
                                确认注销
                              </Button>
                              <Button variant="outline" className="flex-1">
                                取消
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}