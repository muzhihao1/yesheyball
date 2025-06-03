import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function extractDescriptionFromImage(imagePath) {
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
              text: "从图中提取题目说明的完整文字："
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

    let content = response.choices[0].message.content;
    if (content && content.length > 5) {
      content = content.replace(/^题目说明[：:]\s*/, '');
      content = content.replace(/过关要求[：:].*$/gm, '');
      content = content.replace(/；$/, '');
      content = content.trim();
      return content;
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function processRemainingLevels() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  const levels = [
    { level: 2, folder: '2、略有小成', total: 40, start: 16 },
    { level: 3, folder: '3、渐入佳境', total: 45, start: 6 },
    { level: 4, folder: '4、登堂入室', total: 45, start: 1 },
    { level: 5, folder: '5、炉火纯青', total: 45, start: 1 },
    { level: 6, folder: '6、出神入化', total: 35, start: 1 },
    { level: 7, folder: '7、巧夺天工', total: 35, start: 1 },
    { level: 8, folder: '8、登峰造极', total: 35, start: 1 }
  ];

  let totalUpdated = 0;

  for (const levelInfo of levels) {
    console.log(`处理等级 ${levelInfo.level} (从第${levelInfo.start}题开始)`);
    
    for (let i = levelInfo.start; i <= levelInfo.total; i++) {
      const key = `${levelInfo.level}-${i}`;
      const fileIndex = (i + 1).toString().padStart(2, '0');
      const imagePath = path.join(
        process.cwd(), 
        'assessments', 
        levelInfo.folder, 
        `${levelInfo.folder}_${fileIndex}.jpg`
      );

      if (fs.existsSync(imagePath)) {
        const extracted = await extractDescriptionFromImage(imagePath);
        
        if (extracted) {
          descriptions[key] = extracted;
          console.log(`${key}: ${extracted}`);
          totalUpdated++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 150));
        
        if (i % 15 === 0) {
          fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
        }
      }
    }
    
    console.log(`等级 ${levelInfo.level} 完成`);
  }

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log(`所有剩余等级处理完成，总共更新 ${totalUpdated} 个描述`);
}

processRemainingLevels().catch(console.error);