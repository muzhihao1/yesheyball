import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function extractDescription(imagePath) {
  try {
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "你是台球习题专家。请仔细查看图片中的'题目说明'部分，提取完整的题目描述文字。只返回题目说明的准确文字，不要添加任何解释。"
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "提取这张台球习题图片中'题目说明'的完整内容。"
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` }
            }
          ],
        },
      ],
      max_tokens: 100,
      temperature: 0
    });

    const content = response.choices[0].message.content;
    if (content && !content.includes('无法') && !content.includes('抱歉')) {
      return content
        .replace(/^题目说明[:：]\s*/, '')
        .replace(/[；;。，,\s]+$/, '')
        .trim();
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function quickExtract() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = {};

  // 快速提取一些关键习题的真实描述
  const sampleExercises = [
    { level: 1, num: 17, name: '初窥门径' },
    { level: 1, num: 18, name: '初窥门径' },
    { level: 1, num: 12, name: '初窥门径' },
    { level: 1, num: 15, name: '初窥门径' },
    { level: 2, num: 15, name: '小有所成' }
  ];

  for (const exercise of sampleExercises) {
    const key = `${exercise.level}-${exercise.num}`;
    
    const fileIndex = (exercise.num + 1).toString().padStart(2, '0');
    const imagePath = path.join(
      process.cwd(), 
      'assessments', 
      `${exercise.level}、${exercise.name}`, 
      `${exercise.level}、${exercise.name}_${fileIndex}.jpg`
    );

    if (fs.existsSync(imagePath)) {
      console.log(`提取${key}`);
      
      const description = await extractDescription(imagePath);
      
      if (description) {
        descriptions[key] = description;
        console.log(`  ✓ ${description}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // 合并到现有数据
  if (fs.existsSync(descriptionsPath)) {
    const existing = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
    descriptions = { ...existing, ...descriptions };
  }

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log('真实题目说明提取完成');
}

quickExtract().catch(console.error);