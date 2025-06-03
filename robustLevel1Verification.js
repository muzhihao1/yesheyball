import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function extractWithRetry(imagePath, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
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
                text: "请准确提取图片中'题目说明：'后面的文字内容，只要说明部分，不要过关要求"
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
        // 精确清理
        content = content.replace(/^题目说明[：:]\s*/g, '');
        content = content.replace(/题目说明[：:]/g, '');
        content = content.replace(/过关要求[：:].*$/gm, '');
        content = content.replace(/\n.*过关要求.*$/gm, '');
        content = content.replace(/；$/, '');
        content = content.replace(/。$/, '');
        content = content.trim();
        
        if (content.length > 6 && content.length < 100) {
          return content;
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    } catch (error) {
      console.error(`Attempt ${attempt} failed: ${error.message}`);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      }
    }
  }
  return null;
}

async function verifyAllLevel1Systematically() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  console.log('系统性验证等级1所有练习...');
  
  // 需要重点验证的练习
  const criticalExercises = [26, 27, 32, 34];
  
  for (const exerciseNum of criticalExercises) {
    const key = `1-${exerciseNum}`;
    const fileIndex = (exerciseNum + 1).toString().padStart(2, '0');
    const imagePath = path.join(
      process.cwd(), 
      'assessments', 
      '1、初窥门径', 
      `1、初窥门径_${fileIndex}.jpg`
    );

    if (fs.existsSync(imagePath)) {
      console.log(`重新验证 ${key}...`);
      const current = descriptions[key];
      console.log(`  当前: ${current}`);
      
      const extracted = await extractWithRetry(imagePath);
      
      if (extracted && extracted !== current) {
        descriptions[key] = extracted;
        console.log(`  更新为: ${extracted}`);
      } else if (extracted) {
        console.log(`  确认正确: ${extracted}`);
      } else {
        console.log(`  提取失败，需要手动验证`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log('关键练习验证完成');
}

verifyAllLevel1Systematically().catch(console.error);