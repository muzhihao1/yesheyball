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
              text: "提取题目说明文字，只要题目说明部分："
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
      // 清理提取的内容
      content = content.replace(/^题目说明[:：]\s*/, '');
      content = content.replace(/题目说明[:：]/g, '');
      content = content.replace(/过关要求[:：].*$/g, '');
      content = content.replace(/\n.*过关要求.*/g, '');
      content = content.trim();
      return content;
    }
    return null;
  } catch (error) {
    console.error(`提取失败: ${error.message}`);
    return null;
  }
}

async function verifyAllLevels() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  const levels = [
    { level: 2, folder: '2、略有小成', total: 40 },
    { level: 3, folder: '3、渐入佳境', total: 45 },
    { level: 4, folder: '4、登堂入室', total: 45 },
    { level: 5, folder: '5、炉火纯青', total: 45 },
    { level: 6, folder: '6、出神入化', total: 35 },
    { level: 7, folder: '7、巧夺天工', total: 35 },
    { level: 8, folder: '8、登峰造极', total: 35 }
  ];

  console.log('开始验证所有等级的习题描述...');

  for (const levelInfo of levels) {
    console.log(`\n处理等级 ${levelInfo.level}: ${levelInfo.folder}`);
    
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
        const extracted = await extractDescription(imagePath);
        
        if (extracted && extracted.length > 10) {
          const current = descriptions[key];
          if (current !== extracted) {
            descriptions[key] = extracted;
            console.log(`${key}: ${extracted}`);
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // 每处理10个保存一次
      if (i % 10 === 0) {
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
      }
    }
    
    console.log(`等级 ${levelInfo.level} 完成`);
  }

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log('\n所有等级的习题描述验证完成');
}

verifyAllLevels().catch(console.error);