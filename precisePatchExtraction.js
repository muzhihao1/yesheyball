import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function extractPreciseDescription(imagePath) {
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
              text: "仅提取图片中'题目说明：'后面的文字内容，不要其他任何内容"
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

    let content = response.choices[0].message.content;
    if (content && !content.includes('无法') && !content.includes('抱歉')) {
      // 严格清理提取内容
      content = content.replace(/题目说明[：:]/g, '');
      content = content.replace(/^[：:]\s*/, '');
      content = content.replace(/；$/, '');
      content = content.replace(/。$/, '');
      content = content.trim();
      
      // 只返回合理长度的描述
      if (content.length >= 8 && content.length <= 60) {
        return content;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function patchSpecificExercises() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  // 重点修正的练习
  const targetExercises = [
    { level: 1, exercise: 31, folder: '1、初窥门径' },
    { level: 2, exercise: 13, folder: '2、略有小成' },
    { level: 2, exercise: 1, folder: '2、略有小成' },
    { level: 2, exercise: 2, folder: '2、略有小成' },
    { level: 2, exercise: 3, folder: '2、略有小成' }
  ];

  console.log('精确修正特定练习描述...');

  for (const target of targetExercises) {
    const key = `${target.level}-${target.exercise}`;
    const fileIndex = (target.exercise + 1).toString().padStart(2, '0');
    const imagePath = path.join(
      process.cwd(), 
      'assessments', 
      target.folder, 
      `${target.folder}_${fileIndex}.jpg`
    );

    if (fs.existsSync(imagePath)) {
      const extracted = await extractPreciseDescription(imagePath);
      const current = descriptions[key];
      
      if (extracted && extracted !== current) {
        descriptions[key] = extracted;
        console.log(`${key}: "${current}" -> "${extracted}"`);
      } else if (extracted) {
        console.log(`${key}: 已正确 - "${extracted}"`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log('特定练习修正完成');
}

patchSpecificExercises().catch(console.error);