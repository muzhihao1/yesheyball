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
              text: "从图中提取题目说明文字："
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

    let content = response.choices[0].message.content;
    if (content && !content.includes('无法') && !content.includes('抱歉')) {
      content = content.replace(/^题目说明[:：]\s*/g, '').replace(/题目说明[:：]/g, '');
      content = content.replace(/过关要求[:：].*$/gm, '').replace(/\n.*过关要求.*/gm, '');
      content = content.replace(/；$/, '').trim();
      return content.length > 5 ? content : null;
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function processLevel(levelNum, folderName, totalExercises) {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log(`处理等级 ${levelNum}`);
  let updated = 0;

  for (let i = 1; i <= totalExercises; i++) {
    const key = `${levelNum}-${i}`;
    const fileIndex = (i + 1).toString().padStart(2, '0');
    const imagePath = path.join(process.cwd(), 'assessments', folderName, `${folderName}_${fileIndex}.jpg`);

    if (fs.existsSync(imagePath)) {
      const extracted = await extractCleanDescription(imagePath);
      
      if (extracted && descriptions[key] !== extracted) {
        descriptions[key] = extracted;
        console.log(`${key}: ${extracted}`);
        updated++;
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    if (i % 15 === 0) {
      fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
    }
  }

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log(`等级 ${levelNum} 完成，更新 ${updated} 个描述`);
  return updated;
}

async function processAllLevels() {
  const levels = [
    [2, '2、略有小成', 40],
    [3, '3、渐入佳境', 45],
    [4, '4、登堂入室', 45],
    [5, '5、炉火纯青', 45],
    [6, '6、出神入化', 35],
    [7, '7、巧夺天工', 35],
    [8, '8、登峰造极', 35]
  ];

  let totalUpdated = 0;

  for (const [level, folder, total] of levels) {
    const updated = await processLevel(level, folder, total);
    totalUpdated += updated;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`所有等级处理完成，总共更新 ${totalUpdated} 个描述`);
}

processAllLevels().catch(console.error);