import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function extractOnlyDescription(imagePath) {
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
              text: "只提取题目说明的具体文字内容，不要任何前缀后缀"
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

    let content = response.choices[0].message.content?.trim();
    if (content && content.length > 8 && content.length < 100) {
      // 移除任何多余的前缀和后缀
      content = content.replace(/^题目说明[：:]\s*/, '');
      content = content.replace(/^[：:]\s*/, '');
      content = content.replace(/；$/, '');
      content = content.replace(/。$/, '');
      return content;
    }
    return null;
  } catch (error) {
    return null;
  }
}

// 处理前5个等级
async function updateLevels1to5() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  const levels = [
    [1, '1、初窥门径', 35],
    [2, '2、略有小成', 40],
    [3, '3、渐入佳境', 45],
    [4, '4、登堂入室', 45],
    [5, '5、炉火纯青', 45]
  ];

  for (const [level, folder, total] of levels) {
    console.log(`更新等级 ${level}`);
    
    for (let i = 1; i <= Math.min(total, 20); i++) { // 先处理前20个
      const key = `${level}-${i}`;
      const fileIndex = (i + 1).toString().padStart(2, '0');
      const imagePath = path.join(process.cwd(), 'assessments', folder, `${folder}_${fileIndex}.jpg`);

      if (fs.existsSync(imagePath)) {
        const extracted = await extractOnlyDescription(imagePath);
        
        if (extracted) {
          descriptions[key] = extracted;
          console.log(`${key}: ${extracted}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    // 保存每个等级后的结果
    fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
    console.log(`等级 ${level} 前20题完成`);
  }
}

updateLevels1to5().catch(console.error);