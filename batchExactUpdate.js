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
      max_tokens: 50,
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

async function updateBatch() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  console.log('批量更新关键习题描述...');

  // 更新特定习题
  const updates = [
    { exercise: 16, expected: "如图示摆放球型，将目标球击入指定袋内" },
    { exercise: 30, expected: "连续打进5个球不失误" },
    { exercise: 31, expected: "如图示摆放球型，将目标球击入指定袋内" },
    { exercise: 32, expected: "如图示摆放球型，将目标球击入指定袋内" },
    { exercise: 33, expected: "如图示摆放球型，将目标球击入指定袋内" },
    { exercise: 34, expected: "如图示摆放球型，将目标球击入指定袋内" },
    { exercise: 35, expected: "如图示摆放球型，将目标球击入指定袋内" }
  ];

  for (const update of updates) {
    const key = `1-${update.exercise}`;
    const fileIndex = (update.exercise + 1).toString().padStart(2, '0');
    const imagePath = path.join(
      process.cwd(), 
      'assessments', 
      '1、初窥门径', 
      `1、初窥门径_${fileIndex}.jpg`
    );

    if (fs.existsSync(imagePath)) {
      console.log(`处理 ${key}`);
      
      const description = await extractDescription(imagePath);
      
      if (description) {
        descriptions[key] = description;
        console.log(`  ✓ ${description}`);
      } else {
        descriptions[key] = update.expected;
        console.log(`  → 使用预期描述`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log('批量更新完成');
}

updateBatch().catch(console.error);