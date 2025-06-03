import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function extractPreciseText(imagePath) {
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
              text: "提取题目说明文字："
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
    if (content && content.length > 6) {
      content = content.replace(/^题目说明[：:]\s*/, '');
      content = content.replace(/过关要求.*$/gm, '');
      content = content.replace(/；$/, '');
      content = content.trim();
      return content;
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function finalizeAllDescriptions() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  const allLevels = [
    { level: 3, folder: '3、渐入佳境', total: 45, processed: 5 },
    { level: 4, folder: '4、登堂入室', total: 45, processed: 0 },
    { level: 5, folder: '5、炉火纯青', total: 45, processed: 0 },
    { level: 6, folder: '6、出神入化', total: 35, processed: 0 },
    { level: 7, folder: '7、巧夺天工', total: 35, processed: 0 },
    { level: 8, folder: '8、登峰造极', total: 35, processed: 0 }
  ];

  let totalProcessed = 0;

  for (const levelInfo of allLevels) {
    console.log(`完成等级 ${levelInfo.level}`);
    
    for (let i = levelInfo.processed + 1; i <= levelInfo.total; i++) {
      const key = `${levelInfo.level}-${i}`;
      const fileIndex = (i + 1).toString().padStart(2, '0');
      const imagePath = path.join(
        process.cwd(), 
        'assessments', 
        levelInfo.folder, 
        `${levelInfo.folder}_${fileIndex}.jpg`
      );

      if (fs.existsSync(imagePath)) {
        const extracted = await extractPreciseText(imagePath);
        
        if (extracted) {
          descriptions[key] = extracted;
          console.log(`${key}: ${extracted}`);
          totalProcessed++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (i % 20 === 0) {
          fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
        }
      }
    }
  }

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log(`最终处理完成，新增处理 ${totalProcessed} 个描述`);
  
  // 统计所有已验证的练习
  const totalVerified = Object.keys(descriptions).filter(key => 
    descriptions[key] && descriptions[key].length > 5
  ).length;
  
  console.log(`总验证练习数: ${totalVerified}/415`);
}

finalizeAllDescriptions().catch(console.error);