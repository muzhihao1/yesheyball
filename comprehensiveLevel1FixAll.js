import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function extractWithMultipleAttempts(imagePath, exerciseNum) {
  const prompts = [
    "从图片中提取'题目说明：'后面的完整文字内容",
    "请准确读取图片中题目说明部分的文字",
    "提取图片中练习说明的具体内容"
  ];

  for (const prompt of prompts) {
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
                text: prompt
              },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${base64Image}` }
              }
            ],
          },
        ],
        max_tokens: 120,
        temperature: 0
      });

      let content = response.choices[0].message.content;
      if (content && !content.includes('无法') && !content.includes('抱歉') && content.length > 8) {
        content = content.replace(/^题目说明[：:]\s*/g, '');
        content = content.replace(/过关要求.*$/gm, '');
        content = content.replace(/；$/, '');
        content = content.trim();
        
        if (content.length > 8 && content.length < 100) {
          return content;
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`提取失败 1-${exerciseNum}: ${error.message}`);
    }
  }
  return null;
}

async function fixAllLevel1Descriptions() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  console.log('修正所有等级1练习描述...');
  let updated = 0;

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
      const current = descriptions[key];
      console.log(`处理 ${key}: ${current}`);
      
      // 只对通用描述进行重新提取
      if (current.includes('如图示摆放球型，将目标球击入指定袋内') || 
          current.includes('按要求完成台球训练')) {
        
        const extracted = await extractWithMultipleAttempts(imagePath, i);
        
        if (extracted && extracted !== current) {
          descriptions[key] = extracted;
          console.log(`  更新为: ${extracted}`);
          updated++;
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (i % 10 === 0) {
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
        console.log(`已处理 ${i}/35`);
      }
    }
  }

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log(`等级1修正完成，更新了 ${updated} 个描述`);
}

fixAllLevel1Descriptions().catch(console.error);