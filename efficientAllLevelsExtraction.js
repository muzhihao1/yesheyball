import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function extractCleanDescription(imagePath) {
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
              text: "提取题目说明的文字："
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

    let content = response.choices[0].message.content;
    if (content && !content.includes('无法读取') && !content.includes('抱歉')) {
      content = content.replace(/^题目说明[:：]\s*/, '');
      content = content.replace(/过关要求.*$/g, '');
      content = content.replace(/；$/, '');
      content = content.trim();
      
      return content.length > 5 ? content : null;
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function processAllExercisesEfficiently() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  const levelData = [
    [1, '1、初窥门径', 35],
    [2, '2、略有小成', 40], 
    [3, '3、渐入佳境', 45],
    [4, '4、登堂入室', 45],
    [5, '5、炉火纯青', 45],
    [6, '6、出神入化', 35],
    [7, '7、巧夺天工', 35],
    [8, '8、登峰造极', 35]
  ];

  let totalUpdates = 0;

  for (const [level, folder, total] of levelData) {
    console.log(`等级 ${level}`);
    
    for (let i = 1; i <= total; i++) {
      const key = `${level}-${i}`;
      const fileIndex = (i + 1).toString().padStart(2, '0');
      const imagePath = path.join(process.cwd(), 'assessments', folder, `${folder}_${fileIndex}.jpg`);

      if (fs.existsSync(imagePath)) {
        const extracted = await extractCleanDescription(imagePath);
        
        if (extracted && descriptions[key] !== extracted) {
          descriptions[key] = extracted;
          console.log(`${key}: ${extracted}`);
          totalUpdates++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (i % 25 === 0) {
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
      }
    }
  }

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log(`完成所有等级验证，总共更新 ${totalUpdates} 个描述`);
}

processAllExercisesEfficiently().catch(console.error);