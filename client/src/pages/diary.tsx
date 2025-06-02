import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DiaryEntry } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDate, formatTime } from "@/lib/tasks";
import { useToast } from "@/hooks/use-toast";

export default function Diary() {
  const [content, setContent] = useState("");
  const [duration, setDuration] = useState("60");
  const [rating, setRating] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const { data: diaryEntries, isLoading } = useQuery<DiaryEntry[]>({
    queryKey: ["/api/diary"],
  });

  const createEntryMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/diary", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to create diary entry");
      }
      return response.json();
    },
    onSuccess: () => {
      setContent("");
      setDuration("60");
      setRating(0);
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ["/api/diary"] });
      toast({
        title: "日记保存成功！",
        description: "你的训练心得已经记录下来了。",
      });
    },
    onError: () => {
      toast({
        title: "保存失败",
        description: "日记保存时出现错误，请重试。",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "请填写训练内容",
        description: "训练心得不能为空。",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("content", content);
    formData.append("duration", duration);
    if (rating > 0) {
      formData.append("rating", rating.toString());
    }
    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    createEntryMutation.mutate(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "文件过大",
          description: "图片文件不能超过5MB。",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const renderStars = (currentRating: number, interactive: boolean = false) => {
    return [...Array(5)].map((_, index) => (
      <span
        key={index}
        className={`text-xl cursor-pointer transition-colors ${
          index < currentRating ? 'text-trophy-gold' : 'text-gray-300'
        } ${interactive ? 'hover:text-trophy-gold' : ''}`}
        onClick={interactive ? () => setRating(index + 1) : undefined}
      >
        ⭐
      </span>
    ));
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-48 h-8 skeleton mx-auto mb-4"></div>
          <div className="w-64 h-6 skeleton mx-auto"></div>
        </div>
        <div className="skeleton h-96 rounded-xl mb-8"></div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-48 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-green-700 mb-2">练习日记</h2>
        <p className="text-gray-600">记录你的训练心得和技巧感悟</p>
      </div>

      {/* New Entry Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="mr-2">✏️</span>
            今日练习心得
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="content">训练内容</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="今天练习了什么？有什么收获和感悟？"
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="duration">训练时长</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30分钟</SelectItem>
                    <SelectItem value="60">1小时</SelectItem>
                    <SelectItem value="90">1.5小时</SelectItem>
                    <SelectItem value="120">2小时</SelectItem>
                    <SelectItem value="180">3小时</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>训练评价</Label>
                <div className="flex items-center mt-1 star-rating">
                  {renderStars(rating, true)}
                </div>
              </div>

              <div>
                <Label htmlFor="image">上传图片</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1"
                />
              </div>
            </div>

            {selectedFile && (
              <div className="text-sm text-green-600">
                已选择文件: {selectedFile.name}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-billiards-green hover:bg-green-700"
              disabled={createEntryMutation.isPending}
            >
              {createEntryMutation.isPending ? "保存中..." : "保存日记"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Previous Entries */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-green-700">历史记录</h3>
        
        {!diaryEntries || diaryEntries.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-gray-400 mb-4">📝</div>
              <p className="text-gray-600">还没有日记记录，开始写下你的第一篇训练心得吧！</p>
            </CardContent>
          </Card>
        ) : (
          diaryEntries.map((entry) => (
            <Card key={entry.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span>📅</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-green-700">
                        {formatDate(entry.date)}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {entry.duration && `训练时长：${Math.floor(entry.duration / 60)}小时${entry.duration % 60}分钟`}
                        {formatTime(entry.date)}
                      </p>
                    </div>
                  </div>
                  {entry.rating && (
                    <div className="flex">
                      {renderStars(entry.rating)}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                  {entry.content}
                </p>
                
                {entry.imageUrl && (
                  <img
                    src={entry.imageUrl}
                    alt="训练照片"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200 mb-4"
                  />
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <span className="mr-1">👁️</span>
                      查看详情
                    </span>
                    <span className="flex items-center">
                      <span className="mr-1">✏️</span>
                      编辑
                    </span>
                  </div>
                  <span>{formatTime(entry.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
