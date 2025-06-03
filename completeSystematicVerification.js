import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function extractPreciseDescription(imagePath) {
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
              text: "提取题目说明的完整准确文字："
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

async function verifyAllLevel1Systematically() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  const updates = [];
  let processed = 0;

  console.log('开始系统性验证等级1的所有35个习题...');

  for (let i = 1; i <= 35; i++) {
    const key = `1-${i}`;
    const fileIndex = (i + 1).toString().padStart(2, '0');
    const imagePath = path.join(
      process.cwd(), 
      'assessments', 
      '1、初窥门径', 
      `1、初窥门径_${fileIndex}.jpg`
    );

    if (fs.existsSync(imagePath)) {
      console.log(`验证 ${key}`);
      
      const authenticDesc = await extractPreciseDescription(imagePath);
      const currentDesc = descriptions[key];
      
      if (authenticDesc && authenticDesc !== currentDesc) {
        console.log(`  更新: "${currentDesc}" -> "${authenticDesc}"`);
        descriptions[key] = authenticDesc;
        updates.push({ exercise: key, from: currentDesc, to: authenticDesc });
      } else if (authenticDesc) {
        console.log(`  ✓ 正确: "${authenticDesc}"`);
      } else {
        console.log(`  保持: "${currentDesc}"`);
      }
      
      processed++;
      
      // 每处理10个保存一次
      if (processed % 10 === 0) {
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
        console.log(`已处理 ${processed}/35 个习题`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      await new Promise(resolve => setTimeout(resolve, 600));
    }
  }

  // 最终保存
  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  
  console.log(`\n验证完成! 共处理 ${processed} 个习题，更新了 ${updates.length} 个描述`);
  
  if (updates.length > 0) {
    console.log('\n更新的习题:');
    updates.forEach(update => {
      console.log(`${update.exercise}: ${update.to}`);
    });
  }
}

verifyAllLevel1Systematically().catch(console.error);