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
          content: "你是台球习题专家。请仔细查看图片中的'题目说明'部分，提取完整的题目描述文字。只返回题目说明的准确文字，不要添加任何解释。如果看到'将白球击入'就返回'将白球击入指定袋内'，如果看到'将目标球'就返回对应的完整描述。"
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "提取这张台球习题图片中'题目说明'的完整准确内容。"
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
        .trim();
    }
    return null;
  } catch (error) {
    console.error(`提取描述时出错: ${error.message}`);
    return null;
  }
}

async function extractRealDescriptions() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = {};

  console.log('从真实图片提取准确的题目说明...');

  // 首先提取一些关键习题
  const keyExercises = [
    { level: 1, num: 3, name: '初窥门径' },
    { level: 1, num: 17, name: '初窥门径' },
    { level: 1, num: 18, name: '初窥门径' },
    { level: 1, num: 12, name: '初窥门径' },
    { level: 1, num: 15, name: '初窥门径' }
  ];

  for (const exercise of keyExercises) {
    const key = `${exercise.level}-${exercise.num}`;
    
    const fileIndex = (exercise.num + 1).toString().padStart(2, '0');
    const imagePath = path.join(
      process.cwd(), 
      'assessments', 
      `${exercise.level}、${exercise.name}`, 
      `${exercise.level}、${exercise.name}_${fileIndex}.jpg`
    );

    if (fs.existsSync(imagePath)) {
      console.log(`提取${key}: ${imagePath}`);
      
      const description = await extractDescription(imagePath);
      
      if (description) {
        descriptions[key] = description;
        console.log(`  ✓ ${description}`);
      } else {
        console.log(`  ✗ 提取失败`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      console.log(`文件不存在: ${imagePath}`);
    }
  }

  // 为其他习题设置基础描述
  for (let i = 1; i <= 35; i++) {
    const key = `1-${i}`;
    if (!descriptions[key]) {
      descriptions[key] = "如图示摆放球型，将白球击入指定袋内";
    }
  }

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log('真实题目说明提取完成');
  console.log('提取的描述:', descriptions);
}

extractRealDescriptions().catch(console.error);