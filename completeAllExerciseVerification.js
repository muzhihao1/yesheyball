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
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "从图片中提取'题目说明'的完整文字内容，只要题目说明部分，不要过关要求："
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
    if (content && !content.includes('无法') && !content.includes('抱歉') && !content.includes('Cannot')) {
      // 清理提取的内容
      content = content.replace(/^题目说明[:：]\s*/g, '');
      content = content.replace(/题目说明[:：]/g, '');
      content = content.replace(/过关要求[:：].*$/gm, '');
      content = content.replace(/\n.*过关要求.*/gm, '');
      content = content.replace(/；$/, '');
      content = content.trim();
      
      if (content.length > 5) {
        return content;
      }
    }
    return null;
  } catch (error) {
    console.error(`提取失败 ${imagePath}: ${error.message}`);
    return null;
  }
}

async function verifyAllExercises() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

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
  let totalProcessed = 0;

  console.log('开始完整验证所有习题描述...');

  for (const levelInfo of levels) {
    console.log(`\n验证等级 ${levelInfo.level}: ${levelInfo.folder}`);
    let levelUpdated = 0;
    
    for (let i = 1; i <= levelInfo.total; i++) {
      const key = `${levelInfo.level}-${i}`;
      const fileIndex = (i + 1).toString().padStart(2, '0');
      const imagePath = path.join(
        process.cwd(), 
        'assessments', 
        levelInfo.folder, 
        `${levelInfo.folder}_${fileIndex}.jpg`
      );

      if (fs.existsSync(imagePath)) {
        const extracted = await extractExerciseDescription(imagePath);
        const current = descriptions[key];
        
        if (extracted && extracted !== current) {
          descriptions[key] = extracted;
          console.log(`${key}: ${extracted}`);
          levelUpdated++;
          totalUpdated++;
        }
        
        totalProcessed++;
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // 每20个保存一次
      if (totalProcessed % 20 === 0) {
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
        console.log(`已处理 ${totalProcessed} 个习题`);
      }
    }
    
    console.log(`等级 ${levelInfo.level} 完成，更新了 ${levelUpdated} 个描述`);
  }

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log(`\n验证完成！共处理 ${totalProcessed} 个习题，更新了 ${totalUpdated} 个描述`);
}

verifyAllExercises().catch(console.error);