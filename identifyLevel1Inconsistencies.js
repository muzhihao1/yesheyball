import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function extractWithConsensus(exerciseNum) {
  const fileIndex = (exerciseNum + 1).toString().padStart(2, '0');
  const imagePath = path.join(
    process.cwd(), 
    'assessments', 
    '1、初窥门径', 
    `1、初窥门径_${fileIndex}.jpg`
  );

  if (!fs.existsSync(imagePath)) {
    return null;
  }

  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString('base64');
  const prompt = "提取图片中'题目说明：'的完整文字内容";

  const results = [];
  
  // Two extractions
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
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
      if (content && !content.includes('无法') && !content.includes('抱歉')) {
        content = content.replace(/^题目说明[：:]\s*/g, '');
        content = content.replace(/过关要求.*$/gm, '');
        content = content.replace(/；$/, '');
        content = content.trim();
        
        if (content.length > 8) {
          results.push(content);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 600));
    } catch (error) {
      console.error(`提取失败: ${error.message}`);
    }
  }

  // Check consensus
  if (results.length === 2 && results[0] === results[1]) {
    return results[0];
  }

  // Third extraction
  if (results.length >= 1) {
    try {
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

      let thirdResult = response.choices[0].message.content;
      if (thirdResult) {
        thirdResult = thirdResult.replace(/^题目说明[：:]\s*/g, '');
        thirdResult = thirdResult.replace(/过关要求.*$/gm, '');
        thirdResult = thirdResult.replace(/；$/, '');
        thirdResult = thirdResult.trim();
        
        if (thirdResult.length > 8) {
          results.push(thirdResult);
        }
        
        // Find consensus
        for (let i = 0; i < results.length; i++) {
          for (let j = i + 1; j < results.length; j++) {
            if (results[i] === results[j]) {
              return results[i];
            }
          }
        }
        
        // Return most common pattern
        return results.reduce((a, b) => a.length > b.length ? a : b);
      }
    } catch (error) {
      console.error(`第三次提取失败: ${error.message}`);
    }
  }

  return null;
}

async function findAndFixLevel1Inconsistencies() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  console.log('查找并修正等级1的不一致描述...');
  
  // Suspicious exercises that need verification
  const suspiciousExercises = [12, 13, 14, 15];
  
  let fixed = 0;

  for (const exerciseNum of suspiciousExercises) {
    const key = `1-${exerciseNum}`;
    const current = descriptions[key];
    
    console.log(`\n验证 ${key}: "${current}"`);
    
    const extracted = await extractWithConsensus(exerciseNum);
    
    if (extracted && extracted !== current) {
      descriptions[key] = extracted;
      console.log(`修正为: "${extracted}"`);
      fixed++;
    } else if (extracted) {
      console.log(`确认正确: "${extracted}"`);
    } else {
      console.log(`提取失败，保持当前描述`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  
  console.log(`\n修正完成，更新了 ${fixed} 个描述`);
  
  // 显示所有等级1描述的最终状态
  console.log('\n等级1最终描述状态:');
  for (let i = 1; i <= 35; i++) {
    const key = `1-${i}`;
    console.log(`${key}: ${descriptions[key]}`);
  }
}

findAndFixLevel1Inconsistencies().catch(console.error);