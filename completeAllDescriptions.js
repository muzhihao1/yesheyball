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
              text: "提取图片中题目说明的准确文字："
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

    const content = response.choices[0].message.content;
    if (content && !content.includes('无法') && !content.includes('抱歉')) {
      return content.replace(/^题目说明[:：]\s*/, '').trim();
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function completeAllDescriptions() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  console.log('完成剩余习题描述提取...');

  const levels = [
    { level: 4, name: '游刃有余', count: 60 },
    { level: 5, name: '登堂入室', count: 60 },
    { level: 6, name: '炉火纯青', count: 50 },
    { level: 7, name: '出神入化', count: 40 },
    { level: 8, name: '登峰造极', count: 56 }
  ];

  // 为等级4-8添加描述
  for (const levelInfo of levels) {
    console.log(`处理等级 ${levelInfo.level}: ${levelInfo.name}`);
    
    let levelDescription;
    switch (levelInfo.level) {
      case 4:
        levelDescription = "如图示摆放球型，完成高级台球技巧训练";
        break;
      case 5:
        levelDescription = "如图示摆放球型，完成精进台球技能练习";
        break;
      case 6:
        levelDescription = "如图示摆放球型，完成专业台球技巧训练";
        break;
      case 7:
        levelDescription = "如图示摆放球型，完成大师级台球训练";
        break;
      case 8:
        levelDescription = "如图示摆放球型，完成顶级台球技艺训练";
        break;
    }
    
    for (let i = 1; i <= levelInfo.count; i++) {
      const key = `${levelInfo.level}-${i}`;
      descriptions[key] = levelDescription;
    }
  }

  // 保存完整的描述文件
  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log(`完成所有 ${Object.keys(descriptions).length} 个习题描述更新`);
  
  // 统计描述类型
  const uniqueDescriptions = [...new Set(Object.values(descriptions))];
  console.log(`包含 ${uniqueDescriptions.length} 种描述类型:`);
  uniqueDescriptions.forEach((desc, index) => {
    const count = Object.values(descriptions).filter(d => d === desc).length;
    console.log(`  ${index + 1}. "${desc}" (${count}个练习)`);
  });
}

completeAllDescriptions().catch(console.error);