import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function extractExerciseDescription(imagePath) {
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
              text: "从图片中提取'题目说明：'后面的完整文字，只要题目说明的内容："
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
      // 精确清理
      content = content.replace(/^题目说明[：:]\s*/, '');
      content = content.replace(/题目说明[：:]/g, '');
      content = content.replace(/过关要求[：:].*$/gm, '');
      content = content.replace(/\n.*过关要求.*$/gm, '');
      content = content.replace(/；$/, '');
      content = content.replace(/。$/, '');
      content = content.trim();
      
      if (content.length >= 6 && content.length <= 80) {
        return content;
      }
    }
    return null;
  } catch (error) {
    console.error(`提取失败: ${error.message}`);
    return null;
  }
}

async function processLevelBatch(levelNum, folderName, totalExercises, startFrom = 1) {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  let updated = 0;
  console.log(`处理等级 ${levelNum} (从第${startFrom}题开始)`);

  for (let i = startFrom; i <= totalExercises; i++) {
    const key = `${levelNum}-${i}`;
    const fileIndex = (i + 1).toString().padStart(2, '0');
    const imagePath = path.join(
      process.cwd(), 
      'assessments', 
      folderName, 
      `${folderName}_${fileIndex}.jpg`
    );

    if (fs.existsSync(imagePath)) {
      const extracted = await extractExerciseDescription(imagePath);
      const current = descriptions[key];
      
      if (extracted && extracted !== current) {
        descriptions[key] = extracted;
        console.log(`${key}: ${extracted}`);
        updated++;
      }
      
      await new Promise(resolve => setTimeout(resolve, 250));
      
      // 每10个保存一次
      if (i % 10 === 0) {
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
      }
    }
  }

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log(`等级 ${levelNum} 完成，更新了 ${updated} 个描述`);
  return updated;
}

async function verifyAllLevelsSystematically() {
  const levels = [
    { level: 1, folder: '1、初窥门径', total: 35 },
    { level: 2, folder: '2、略有小成', total: 40 },
    { level: 3, folder: '3、渐入佳境', total: 45 },
    { level: 4, folder: '4、登堂入室', total: 45 },
    { level: 5, folder: '5、炉火纯青', total: 45 },
    { level: 6, folder: '6、出神入化', total: 35 },
    { level: 7, folder: '7、巧夺天工', total: 35 },
    { level: 8, folder: '8、登峰造极', total: 35 }
  ];

  let totalUpdated = 0;

  for (const levelInfo of levels) {
    const updated = await processLevelBatch(
      levelInfo.level, 
      levelInfo.folder, 
      levelInfo.total
    );
    totalUpdated += updated;
    
    // 等级间暂停
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\n系统性验证完成！总共更新了 ${totalUpdated} 个练习描述`);
}

verifyAllLevelsSystematically().catch(console.error);