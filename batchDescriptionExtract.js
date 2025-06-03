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
          content: "提取台球习题图片中'题目说明'的准确文字，只返回说明内容，不加任何解释。"
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "提取题目说明内容："
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` }
            }
          ],
        },
      ],
      max_tokens: 80,
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
    console.error(`提取错误: ${error.message}`);
    return null;
  }
}

async function processLevel1() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = {};
  
  // 加载现有描述
  if (fs.existsSync(descriptionsPath)) {
    descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  }

  console.log('处理等级1: 初窥门径 (35个习题)');
  
  for (let i = 1; i <= 35; i++) {
    const key = `1-${i}`;
    const fileIndex = (i + 1).toString().padStart(2, '0');
    const imagePath = path.join(
      process.cwd(), 
      'assessments', 
      '1、初窥门径', 
      `1、初窥门径_${fileIndex}.jpg`
    );

    if (fs.existsSync(imagePath)) {
      console.log(`提取 ${key}`);
      
      const description = await extractDescription(imagePath);
      
      if (description) {
        descriptions[key] = description;
        console.log(`  ✓ ${description}`);
      } else {
        descriptions[key] = "如图示摆放球型，将白球击入指定袋内";
        console.log(`  ✗ 使用默认描述`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 600));
    } else {
      descriptions[key] = "如图示摆放球型，将白球击入指定袋内";
      console.log(`文件不存在: ${key}`);
    }
  }

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log('等级1完成');
}

processLevel1().catch(console.error);