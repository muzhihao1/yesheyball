import OpenAI from "openai";
import fs from "fs";
import path from "path";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ExerciseRequirement {
  level: number;
  exerciseNumber: number;
  requirement: string;
  description: string;
  technicalPoints: string[];
}

export async function analyzeExerciseImage(imagePath: string): Promise<ExerciseRequirement | null> {
  try {
    // 检查图片文件是否存在
    if (!fs.existsSync(imagePath)) {
      console.log(`Image not found: ${imagePath}`);
      return null;
    }

    // 读取图片文件
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `请分析这张台球练习题图片，提取以下信息并以JSON格式返回：

              1. 从图片上方的文字信息中提取：
                 - 题目编号（从"第X题"提取）
                 - 过关要求（从"过关要求："后面的文字提取完整内容）
                 - 题目说明（从"题目说明："后面的文字提取）
                 - 技术要点（如果有"技术要点："部分，提取列表）

              2. 同时分析台球桌布局：
                 - 识别白球位置
                 - 识别目标球和目标袋位置
                 - 描述球型布局

              返回格式：
              {
                "exerciseNumber": 数字,
                "requirement": "过关要求的完整文字（如：连续完成45次不失误）",
                "description": "题目说明的完整文字",
                "technicalPoints": ["技术要点1", "技术要点2", ...],
                "ballLayout": "台球桌上的球型布局描述"
              }

              请确保提取的文字与图片中显示的完全一致，特别注意过关要求部分的准确性。`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      level: 0, // 需要从路径中解析
      exerciseNumber: result.exerciseNumber || 0,
      requirement: result.requirement || "连续完成5次不失误",
      description: result.description || "如图示摆放球型，将白球击入指定袋内",
      technicalPoints: result.technicalPoints || []
    };

  } catch (error) {
    console.error("Error analyzing exercise image:", error);
    return null;
  }
}

export async function batchAnalyzeExercises(level: number, levelName: string, totalExercises: number): Promise<{ [key: number]: ExerciseRequirement }> {
  const results: { [key: number]: ExerciseRequirement } = {};
  
  // 跳过前两张图片（00和01），从02开始
  for (let i = 2; i < totalExercises; i++) {
    const exerciseNumber = i.toString().padStart(2, '0');
    const imagePath = path.join(process.cwd(), 'assessments', `${level}、${levelName}`, `${level}、${levelName}_${exerciseNumber}.jpg`);
    
    console.log(`Analyzing exercise ${level}-${exerciseNumber}...`);
    
    const analysis = await analyzeExerciseImage(imagePath);
    if (analysis) {
      analysis.level = level;
      results[i - 1] = analysis; // i-1 因为我们跳过了前两张图片
    }
    
    // 添加延迟避免API限制
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
}