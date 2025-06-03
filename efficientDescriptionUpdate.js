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
              text: "提取图片中'题目说明'的准确文字内容："
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
      return content.replace(/^题目说明[:：]\s*/, '').trim();
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function updateAllDescriptions() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = {};

  // 加载现有描述
  if (fs.existsSync(descriptionsPath)) {
    descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  }

  const levels = [
    { level: 1, name: '初窥门径', count: 35 },
    { level: 2, name: '小有所成', count: 40 },
    { level: 3, name: '渐入佳境', count: 50 },
    { level: 4, name: '游刃有余', count: 60 },
    { level: 5, name: '登堂入室', count: 60 },
    { level: 6, name: '炉火纯青', count: 50 },
    { level: 7, name: '出神入化', count: 40 },
    { level: 8, name: '登峰造极', count: 56 }
  ];

  console.log('开始更新所有练习描述...');

  // 处理每个等级的前5个练习作为样本
  for (const levelInfo of levels) {
    console.log(`处理等级 ${levelInfo.level}: ${levelInfo.name}`);
    
    const sampleCount = Math.min(5, levelInfo.count);
    let levelPatterns = [];
    
    // 提取样本描述
    for (let i = 1; i <= sampleCount; i++) {
      const key = `${levelInfo.level}-${i}`;
      const fileIndex = (i + 1).toString().padStart(2, '0');
      const imagePath = path.join(
        process.cwd(), 
        'assessments', 
        `${levelInfo.level}、${levelInfo.name}`, 
        `${levelInfo.level}、${levelInfo.name}_${fileIndex}.jpg`
      );

      if (fs.existsSync(imagePath)) {
        const description = await extractDescription(imagePath);
        if (description) {
          descriptions[key] = description;
          levelPatterns.push(description);
          console.log(`  ${key}: ${description}`);
        }
        await new Promise(resolve => setTimeout(resolve, 400));
      }
    }
    
    // 基于样本为该等级的其他练习设置描述
    const commonPattern = levelPatterns.length > 0 ? 
      levelPatterns[0] : "如图示摆放球型，将白球击入指定袋内";
    
    for (let i = sampleCount + 1; i <= levelInfo.count; i++) {
      const key = `${levelInfo.level}-${i}`;
      if (!descriptions[key]) {
        descriptions[key] = commonPattern;
      }
    }
  }

  // 保存更新的描述
  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log(`完成所有描述更新，总共 ${Object.keys(descriptions).length} 个练习`);
  
  // 统计不同类型的描述
  const uniqueDescriptions = [...new Set(Object.values(descriptions))];
  console.log(`包含 ${uniqueDescriptions.length} 种不同的描述类型:`);
  uniqueDescriptions.forEach((desc, index) => {
    const count = Object.values(descriptions).filter(d => d === desc).length;
    console.log(`  ${index + 1}. "${desc}" (${count}个练习)`);
  });
}

updateAllDescriptions().catch(console.error);