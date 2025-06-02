import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

interface TrainingFeedback {
  feedback: string;
  encouragement: string;
  tips: string;
  rating: number;
}

export async function generateTrainingFeedback(
  taskTitle: string,
  taskDescription: string,
  userRating: number,
  userLevel: number,
  previousTasksCompleted: number
): Promise<TrainingFeedback> {
  try {
    const prompt = `你是一位专业的中式八球教练。请为以下训练任务提供个性化的反馈：

任务: ${taskTitle}
任务描述: ${taskDescription}
用户评分: ${userRating}/5星
用户等级: ${userLevel}
已完成任务数: ${previousTasksCompleted}

请用中文提供JSON格式的反馈，包含以下字段：
- feedback: 对此次训练表现的具体评价（50-80字）
- encouragement: 鼓励的话语（20-30字）
- tips: 下次训练的建议（30-50字）
- rating: 综合表现评分（1-5）

要求：
1. 语言要亲切友好，符合中国用户习惯
2. 根据用户评分给出相应的反馈
3. 针对不同等级给出适当的建议
4. 保持积极正面的态度`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "你是一位专业的中式八球教练，擅长给学员提供个性化的训练指导和鼓励。请用温和、专业的语气回复。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 500
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      feedback: result.feedback || "今天的训练表现不错，继续保持练习的热情！",
      encouragement: result.encouragement || "加油，你在稳步进步！",
      tips: result.tips || "建议多练习基础动作，打好扎实的基本功。",
      rating: Math.max(1, Math.min(5, result.rating || userRating))
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    
    // Fallback feedback based on user rating
    const fallbackFeedbacks = {
      5: {
        feedback: "出色的表现！你的击球技巧展现出了很高的水平，瞄准精确，力度控制得当。",
        encouragement: "太棒了，继续保持！",
        tips: "可以尝试挑战更高难度的训练项目，提升综合技能。",
        rating: 5
      },
      4: {
        feedback: "很好的表现！基本技巧掌握扎实，偶有小失误但整体水平不错。",
        encouragement: "进步明显，再接再厉！",
        tips: "注意细节的把控，多练习稳定性训练。",
        rating: 4
      },
      3: {
        feedback: "中等水平的表现，基础动作基本正确，但还有提升空间。",
        encouragement: "不要气馁，持续练习！",
        tips: "重点加强基础动作的练习，稳扎稳打。",
        rating: 3
      },
      2: {
        feedback: "还需要更多练习，基础动作需要进一步巩固和改进。",
        encouragement: "每天进步一点点！",
        tips: "建议从最基础的握杆和瞄准开始反复练习。",
        rating: 2
      },
      1: {
        feedback: "需要重新审视基础动作，多观察、多思考、多练习。",
        encouragement: "别放弃，坚持就是胜利！",
        tips: "建议先观看教学视频，理解正确的动作要领。",
        rating: 1
      }
    };
    
    return fallbackFeedbacks[userRating as keyof typeof fallbackFeedbacks] || fallbackFeedbacks[3];
  }
}

export async function generateDiaryInsights(
  diaryContent: string,
  userLevel: number,
  recentTasksCompleted: number
): Promise<string> {
  try {
    const prompt = `作为台球教练，请根据学员的训练日记内容提供专业见解：

训练日记: ${diaryContent}
学员等级: ${userLevel}
近期完成任务数: ${recentTasksCompleted}

请用中文提供30-50字的专业建议，帮助学员改进训练方法。`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "你是一位经验丰富的台球教练，善于从学员的训练感悟中发现问题并提供针对性建议。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.6,
      max_tokens: 200
    });

    return response.choices[0].message.content || "继续保持训练的积极性，多总结经验，你会越来越进步的！";
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "训练心得很棒！继续保持这样的总结习惯，对技术提升很有帮助。";
  }
}
