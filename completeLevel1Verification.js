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
          role: "user",
          content: [
            {
              type: "text",
              text: "提取题目说明："
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` }
            }
          ],
        },
      ],
      max_tokens: 60,
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

async function verifyRemainingExercises() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  console.log('验证剩余关键习题...');

  // 重点验证还未确认的习题
  const toVerify = [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 32, 33, 34, 35];
  
  for (const exerciseNum of toVerify) {
    const key = `1-${exerciseNum}`;
    const fileIndex = (exerciseNum + 1).toString().padStart(2, '0');
    const imagePath = path.join(
      process.cwd(), 
      'assessments', 
      '1、初窥门径', 
      `1、初窥门径_${fileIndex}.jpg`
    );

    if (fs.existsSync(imagePath)) {
      console.log(`验证 ${key}`);
      
      const extracted = await extractDescription(imagePath);
      
      if (extracted) {
        descriptions[key] = extracted;
        console.log(`  ✓ ${extracted}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log('关键习题验证完成');
}

verifyRemainingExercises().catch(console.error);