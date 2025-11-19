import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const apiKey = process.env.OPENAI_API_KEY;

// Only create client if API key exists
const openai = apiKey ? new OpenAI({ apiKey }) : null;

// Check if OpenAI is configured
function ensureOpenAI(): OpenAI {
  if (!openai) {
    console.error("OpenAI API key not configured");
    throw new Error("AI教练功能暂时不可用，请稍后再试");
  }
  return openai;
}

interface TrainingSession {
  duration: number; // in seconds
  summary: string;
  rating: number | null; // 1-5 stars
  exerciseType?: string;
  level?: number;
}

export async function generateCoachingFeedback(trainingSession: TrainingSession): Promise<string> {
  // Validate duration
  const duration = trainingSession.duration;
  if (typeof duration !== 'number' || isNaN(duration) || duration < 0) {
    console.error("Invalid duration value:", duration);
    throw new Error("训练时长数据无效");
  }

  const durationMinutes = Math.floor(duration / 60);
  const durationSeconds = duration % 60;
  const timeString = `${durationMinutes}分${durationSeconds}秒`;

  // Determine feedback tone based on rating
  let ratingContext = '';
  if (trainingSession.rating) {
    if (trainingSession.rating >= 4) {
      ratingContext = '学员对这次训练非常满意，状态很好。';
    } else if (trainingSession.rating === 3) {
      ratingContext = '学员觉得训练效果一般，可能遇到了一些瓶颈。';
    } else {
      ratingContext = '学员这次训练不太顺利，需要更多鼓励和具体指导。';
    }
  }

  const prompt = `你是一位专业的中式八球台球教练，拥有20年的教学经验。请根据学员的训练总结给出专业的指导建议。

训练信息：
- 训练时长：${timeString}
- 训练笔记：${trainingSession.summary}
- 自评分数：${trainingSession.rating ? `${trainingSession.rating}星（满分5星）` : '未评分'}
- 训练类型：${trainingSession.exerciseType || '系统训练'}
- 当前等级：${trainingSession.level || 1}级
${ratingContext ? `- 训练状态：${ratingContext}` : ''}

请以一位经验丰富、耐心细致的台球教练身份回复，要求：
1. 首先肯定学员的训练时长和努力（简短）
2. 针对训练笔记中提到的具体内容给出技术指导
3. 根据评分情况给予相应的鼓励或建议：
   - 4-5星：继续保持，提出进阶挑战
   - 3星：找出可能的问题点，给出改进方向
   - 1-2星：重点鼓励，提供简单可行的改进方法
4. 提供1-2个具体的下次训练建议
5. 语言要专业但通俗易懂，温暖且富有激励性
6. 回复控制在120-180字内，分段清晰

请用温暖、专业的语调回复：`;

  try {
    const client = ensureOpenAI();
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "你是一位专业的中式八球台球教练，拥有丰富的教学经验。你的回复要专业、耐心、富有激励性，能够给学员提供具体可行的技术指导。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "教练正在分析你的训练情况，请稍后再试。";
  } catch (error: any) {
    console.error("OpenAI API error:", error?.message || error);
    // Re-throw user-friendly errors
    if (error?.message?.includes("暂时不可用") || error?.message?.includes("数据无效")) {
      throw error;
    }
    throw new Error("获取教练反馈失败，请稍后重试");
  }
}

export async function generateDiaryInsights(content: string, userLevel: number, completedTasks: number): Promise<string> {
  const prompt = `你是一位专业的中式八球台球教练，请分析学员的训练日记并给出专业洞察：

训练日记内容：${content}

学员背景：
- 当前等级：${userLevel}级
- 已完成练习：${completedTasks}次

请提供：
1. 对训练内容的专业分析
2. 技术改进建议
3. 下次训练重点
4. 鼓励性总结

回复要专业、具体、激励性，控制在100-150字内。`;

  try {
    const client = ensureOpenAI();
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "你是一位专业的台球教练，擅长分析训练日记并提供有针对性的指导建议。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "训练记录很详细，继续保持这种认真的态度，技术会稳步提升！";
  } catch (error: any) {
    console.error("OpenAI API error:", error?.message || error);
    return "训练记录很详细，继续保持这种认真的态度，技术会稳步提升！";
  }
}

export async function generateMotivationalMessage(userLevel: number, streak: number, totalSessions: number): Promise<string> {
  const prompt = `你是一位专业的台球教练，请根据学员的训练情况给出一句激励的话：

学员情况：
- 当前等级：${userLevel}级
- 连续训练天数：${streak}天
- 总训练次数：${totalSessions}次

请给出一句简短有力的激励话语（20-30字），要体现：
1. 对学员坚持的肯定
2. 对技术进步的认可
3. 对未来发展的期待
语调要专业、温暖、激励人心。`;

  try {
    const client = ensureOpenAI();
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "你是一位经验丰富的台球教练，善于用简洁有力的话语激励学员。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 100,
      temperature: 0.8,
    });

    return response.choices[0].message.content || "坚持就是胜利，每一次练习都在进步！";
  } catch (error: any) {
    console.error("OpenAI API error:", error?.message || error);
    return "坚持就是胜利，每一次练习都在进步！";
  }
}