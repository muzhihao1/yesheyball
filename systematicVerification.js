import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function extractExactDescription(imagePath) {
  try {
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "请精确提取台球练习图片中'题目说明'部分的完整文字内容，不要添加任何修改或解释。"
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "提取题目说明的准确文字："
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

async function verifyAllLevel1() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('开始系统性验证等级1所有35个习题...');
  
  const verificationResults = [];
  
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
      
      const extractedDesc = await extractExactDescription(imagePath);
      const currentDesc = descriptions[key];
      
      if (extractedDesc) {
        if (extractedDesc !== currentDesc) {
          console.log(`  需要更新: "${currentDesc}" -> "${extractedDesc}"`);
          descriptions[key] = extractedDesc;
          verificationResults.push({
            exercise: key,
            status: 'updated',
            old: currentDesc,
            new: extractedDesc
          });
        } else {
          console.log(`  ✓ 已正确: "${currentDesc}"`);
          verificationResults.push({
            exercise: key,
            status: 'correct'
          });
        }
      } else {
        console.log(`  保持现有: "${currentDesc}"`);
        verificationResults.push({
          exercise: key,
          status: 'keep_existing'
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 600));
    }
    
    // 每10个保存一次
    if (i % 10 === 0) {
      fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
      console.log(`已保存前${i}个习题的验证结果`);
    }
  }
  
  // 最终保存
  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  
  // 输出验证统计
  console.log('\n验证结果统计:');
  const updated = verificationResults.filter(r => r.status === 'updated').length;
  const correct = verificationResults.filter(r => r.status === 'correct').length;
  const kept = verificationResults.filter(r => r.status === 'keep_existing').length;
  
  console.log(`- 需要更新: ${updated}个`);
  console.log(`- 已经正确: ${correct}个`);
  console.log(`- 保持现有: ${kept}个`);
  
  console.log('\n等级1所有35个习题验证完成！');
}

verifyAllLevel1().catch(console.error);