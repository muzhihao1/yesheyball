import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function consensusExtractLevel1(exerciseNum) {
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
  const prompt = "提取图片中'题目说明：'的具体文字内容";

  const results = [];
  
  // Two initial extractions
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
        max_tokens: 100,
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
      
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`1-${exerciseNum} 提取${attempt}失败: ${error.message}`);
    }
  }

  // Check consensus from first two attempts
  if (results.length === 2 && results[0] === results[1]) {
    return results[0];
  }

  // Third extraction if needed
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
        max_tokens: 100,
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
        
        // Find consensus among three results
        for (let i = 0; i < results.length; i++) {
          for (let j = i + 1; j < results.length; j++) {
            if (results[i] === results[j] && results[i].length > 8) {
              return results[i];
            }
          }
        }
        
        // Return longest if no consensus
        const longest = results.reduce((a, b) => a.length > b.length ? a : b);
        return longest;
      }
    } catch (error) {
      console.error(`1-${exerciseNum} 第三次提取失败: ${error.message}`);
    }
  }

  return null;
}

async function verifyAllLevel1WithConsensus() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  console.log('使用共识方法重新验证等级1所有35个练习...\n');
  
  let verified = 0;
  let updated = 0;
  
  for (let i = 1; i <= 35; i++) {
    const key = `1-${i}`;
    const current = descriptions[key];
    
    console.log(`验证 ${key}: ${current}`);
    
    const extracted = await consensusExtractLevel1(i);
    
    if (extracted) {
      if (extracted !== current) {
        descriptions[key] = extracted;
        console.log(`  更新为: ${extracted}`);
        updated++;
      } else {
        console.log(`  确认正确`);
      }
      verified++;
    } else {
      console.log(`  提取失败，保持当前描述`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (i % 10 === 0) {
      fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
      console.log(`\n已处理 ${i}/35 个练习\n`);
    }
  }

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  
  console.log(`\n等级1共识验证完成:`);
  console.log(`- 成功验证: ${verified}/35`);
  console.log(`- 更新描述: ${updated}`);
  console.log(`- 验证准确率: ${(verified/35*100).toFixed(1)}%`);
}

verifyAllLevel1WithConsensus().catch(console.error);