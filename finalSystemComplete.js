import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function extractRequirement(imagePath) {
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
      let cleaned = content.replace(/^题目说明[:：]\s*/, '');
      cleaned = cleaned.replace(/过关要求[:：].*$/gm, '');
      cleaned = cleaned.replace(/\n.*过关要求.*/gm, '');
      cleaned = cleaned.replace(/；$/, '');
      return cleaned.trim();
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function finalSystemComplete() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  const levelConfigs = [
    { level: 1, folder: '1、初窥门径', total: 35 },
    { level: 2, folder: '2、略有小成', total: 40 },
    { level: 3, folder: '3、渐入佳境', total: 45 },
    { level: 4, folder: '4、登堂入室', total: 45 },
    { level: 5, folder: '5、炉火纯青', total: 45 },
    { level: 6, folder: '6、出神入化', total: 35 },
    { level: 7, folder: '7、巧夺天工', total: 35 },
    { level: 8, folder: '8、登峰造极', total: 35 }
  ];

  let totalUpdates = 0;

  for (const config of levelConfigs) {
    console.log(`处理等级 ${config.level}`);
    
    for (let i = 1; i <= config.total; i++) {
      const key = `${config.level}-${i}`;
      const fileIndex = (i + 1).toString().padStart(2, '0');
      const imagePath = path.join(
        process.cwd(), 
        'assessments', 
        config.folder, 
        `${config.folder}_${fileIndex}.jpg`
      );

      if (fs.existsSync(imagePath)) {
        const extracted = await extractRequirement(imagePath);
        
        if (extracted && extracted.length > 8 && descriptions[key] !== extracted) {
          descriptions[key] = extracted;
          console.log(`${key}: ${extracted}`);
          totalUpdates++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      
      if (i % 20 === 0) {
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
      }
    }
  }

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log(`完成系统性验证，总共更新 ${totalUpdates} 个描述`);
}

finalSystemComplete().catch(console.error);