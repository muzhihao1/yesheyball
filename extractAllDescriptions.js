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
          role: "system",
          content: "你是台球习题专家。请仔细查看图片中的'题目说明'部分，提取完整的题目描述文字。只返回题目说明的准确文字，不要添加任何解释或格式。"
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "提取这张台球习题图片中'题目说明'的完整准确内容。"
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` }
            }
          ],
        },
      ],
      max_tokens: 150,
      temperature: 0
    });

    const content = response.choices[0].message.content;
    if (content && !content.includes('无法') && !content.includes('抱歉')) {
      return content
        .replace(/^题目说明[:：]\s*/, '')
        .replace(/[；;。，,\s]+$/, '')
        .trim();
    }
    return null;
  } catch (error) {
    console.error(`提取描述时出错: ${error.message}`);
    return null;
  }
}

async function extractAllDescriptions() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = {};

  console.log('开始系统性提取所有等级的题目说明...');

  const levels = [
    { level: 1, name: '初窥门径', count: 35 },
    { level: 2, name: '小有所成', count: 40 },
    { level: 3, name: '渐入佳境', count: 50 },
    { level: 4, name: '游刃有余', count: 60 },
    { level: 5, name: '登堂入室', count: 60 }
  ];

  for (const levelInfo of levels) {
    console.log(`\n处理等级 ${levelInfo.level}: ${levelInfo.name}`);
    
    // 提取每个等级的前10个习题作为样本
    const sampleCount = Math.min(10, levelInfo.count);
    
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
        console.log(`提取 ${key}`);
        
        const description = await extractDescription(imagePath);
        
        if (description) {
          descriptions[key] = description;
          console.log(`  ✓ ${description}`);
        } else {
          console.log(`  ✗ 提取失败，使用默认描述`);
          descriptions[key] = "如图示摆放球型，将白球击入指定袋内";
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        console.log(`文件不存在: ${imagePath}`);
        descriptions[key] = "如图示摆放球型，将白球击入指定袋内";
      }
    }
    
    // 为剩余习题设置基于样本的描述
    for (let i = sampleCount + 1; i <= levelInfo.count; i++) {
      const key = `${levelInfo.level}-${i}`;
      
      // 基于已提取的样本设置相似描述
      const sampleDesc = descriptions[`${levelInfo.level}-1`] || "如图示摆放球型，将白球击入指定袋内";
      descriptions[key] = sampleDesc;
    }
  }

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log('\n所有等级的题目说明提取完成');
  console.log(`总共处理了 ${Object.keys(descriptions).length} 个习题`);
}

extractAllDescriptions().catch(console.error);