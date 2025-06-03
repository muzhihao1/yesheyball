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
          role: "system",
          content: "请精确提取台球练习图片中'题目说明'部分的完整原文，一字不差，保持原有的标点符号和格式。"
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "提取题目说明的原文："
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

    const content = response.choices[0].message.content;
    if (content && !content.includes('无法') && !content.includes('抱歉')) {
      return content.replace(/^题目说明[:：]\s*/, '').trim();
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function updateAllAuthenticDescriptions() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  console.log('从真实图片提取准确的题目说明...');

  // 分批处理等级1的35个习题
  for (let batch = 0; batch < 4; batch++) {
    const startNum = batch * 9 + 1;
    const endNum = Math.min(startNum + 8, 35);
    
    console.log(`处理第${batch + 1}批: 习题${startNum}-${endNum}`);
    
    for (let i = startNum; i <= endNum; i++) {
      const key = `1-${i}`;
      const fileIndex = (i + 1).toString().padStart(2, '0');
      const imagePath = path.join(
        process.cwd(), 
        'assessments', 
        '1、初窥门径', 
        `1、初窥门径_${fileIndex}.jpg`
      );

      if (fs.existsSync(imagePath)) {
        console.log(`提取 ${key}`);
        
        const authenticDesc = await extractAuthenticDescription(imagePath);
        
        if (authenticDesc) {
          descriptions[key] = authenticDesc;
          console.log(`  ✓ ${authenticDesc}`);
        } else {
          console.log(`  保持现有描述`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // 每批保存一次
    fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
    console.log(`第${batch + 1}批处理完成`);
    
    if (batch < 3) {
      console.log('等待2秒后继续下一批...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('所有习题描述更新完成');
}

updateAllAuthenticDescriptions().catch(console.error);