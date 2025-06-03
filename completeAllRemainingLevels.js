import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function extractAuthenticDescription(imagePath) {
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
              text: "提取题目说明的完整文字："
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` }
            }
          ],
        },
      ],
      max_tokens: 120,
      temperature: 0
    });

    let content = response.choices[0].message.content;
    if (content && content.length > 8) {
      content = content.replace(/^题目说明[：:]\s*/g, '');
      content = content.replace(/过关要求.*$/gm, '');
      content = content.replace(/；$/, '');
      return content.trim();
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function processAllRemainingLevels() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  const levelConfigs = [
    { level: 3, folder: '3、渐入佳境', total: 45, start: 9 },
    { level: 4, folder: '4、登堂入室', total: 45, start: 1 },
    { level: 5, folder: '5、炉火纯青', total: 45, start: 1 },
    { level: 6, folder: '6、出神入化', total: 35, start: 1 },
    { level: 7, folder: '7、巧夺天工', total: 35, start: 1 },
    { level: 8, folder: '8、登峰造极', total: 35, start: 1 }
  ];

  let totalUpdated = 0;

  for (const config of levelConfigs) {
    console.log(`处理等级 ${config.level} (从第${config.start}题开始)`);
    
    for (let i = config.start; i <= config.total; i++) {
      const key = `${config.level}-${i}`;
      const fileIndex = (i + 1).toString().padStart(2, '0');
      const imagePath = path.join(
        process.cwd(), 
        'assessments', 
        config.folder, 
        `${config.folder}_${fileIndex}.jpg`
      );

      if (fs.existsSync(imagePath)) {
        const extracted = await extractAuthenticDescription(imagePath);
        
        if (extracted && extracted.length > 10) {
          descriptions[key] = extracted;
          console.log(`${key}: ${extracted}`);
          totalUpdated++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        if (i % 15 === 0) {
          fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
        }
      }
    }
    
    console.log(`等级 ${config.level} 完成`);
  }

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log(`所有剩余等级处理完成，总共更新 ${totalUpdated} 个描述`);
  
  // 统计总验证数
  const totalVerified = Object.keys(descriptions).filter(key => 
    descriptions[key] && descriptions[key].length > 10
  ).length;
  
  console.log(`系统总验证练习数: ${totalVerified}/415`);
}

processAllRemainingLevels().catch(console.error);