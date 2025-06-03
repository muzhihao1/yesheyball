import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function extractExactDescription(imagePath) {
  try {
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "请提取图片中'题目说明'的完整准确文字内容："
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
      return content.replace(/^题目说明[:：]\s*/, '').trim();
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function processLevel1Systematically() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  console.log('系统化处理等级1的前20个习题...');

  const specificExercises = [4, 5, 6, 7, 8, 16, 19, 20];
  
  for (const exerciseNum of specificExercises) {
    const key = `1-${exerciseNum}`;
    const fileIndex = (exerciseNum + 1).toString().padStart(2, '0');
    const imagePath = path.join(
      process.cwd(), 
      'assessments', 
      '1、初窥门径', 
      `1、初窥门径_${fileIndex}.jpg`
    );

    if (fs.existsSync(imagePath)) {
      console.log(`处理 ${key}`);
      
      const description = await extractExactDescription(imagePath);
      
      if (description) {
        descriptions[key] = description;
        console.log(`  ✓ ${description}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // 保存更新
  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log('等级1关键习题描述更新完成');
}

processLevel1Systematically().catch(console.error);