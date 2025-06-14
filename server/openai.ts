import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface TrainingSession {
  duration: number; // in seconds
  summary: string;
  rating: number | null; // 1-5 stars
  exerciseType?: string;
  level?: number;
}

export async function generateCoachingFeedback(trainingSession: TrainingSession): Promise<string> {
  const durationMinutes = Math.floor(trainingSession.duration / 60);
  const durationSeconds = trainingSession.duration % 60;
  const timeString = `${durationMinutes}分${durationSeconds}秒`;
  
  const prompt = `你是一位专业的中式八球台球教练，拥有20年的教学经验。请根据学员的训练总结给出专业的指导建议。

训练信息：
- 训练时长：${timeString}
- 训练总结：${trainingSession.summary}
- 自评分数：${trainingSession.rating ? `${trainingSession.rating}星` : '未评分'}
- 练习类型：${trainingSession.exerciseType || '基础训练'}
- 当前等级：${trainingSession.level || 1}级

请以一位经验丰富、耐心细致的台球教练身份回复，要求：
1. 肯定学员的努力和进步
2. 针对训练总结中提到的问题给出具体的技术指导
3. 提供2-3个实用的练习建议
4. 鼓励学员继续坚持训练
5. 语言要专业但通俗易懂，富有激励性
6. 回复控制在150-200字内

请用温暖、专业的语调回复：`;

  try {
    const response = await openai.chat.completions.create({
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
  } catch (error) {
    console.error("OpenAI API error:", error);
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
    const response = await openai.chat.completions.create({
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
  } catch (error) {
    console.error("OpenAI API error:", error);
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
    const response = await openai.chat.completions.create({
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
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "坚持就是胜利，每一次练习都在进步！";
  }
}