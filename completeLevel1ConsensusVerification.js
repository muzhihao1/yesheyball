import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function consensusExtract(exerciseNum) {
  const fileIndex = (exerciseNum + 1).toString().padStart(2, '0');
  const imagePath = path.join(
    process.cwd(), 
    'assessments', 
    '1、初窥门径', 
    `1、初窥门径_${fileIndex}.jpg`
  );

  if (!fs.existsSync(imagePath)) return null;

  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString('base64');
  const prompt = "提取图片中'题目说明：'的完整文字";

  const results = [];
  
  // Extract twice
  for (let i = 0; i < 2; i++) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{
          role: "user",
          content: [{
            type: "text",
            text: prompt
          }, {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${base64Image}` }
          }]
        }],
        max_tokens: 100,
        temperature: 0
      });

      let content = response.choices[0].message.content;
      if (content && !content.includes('无法') && !content.includes('抱歉')) {
        content = content.replace(/^题目说明[：:]\s*/g, '');
        content = content.replace(/过关要求.*$/gm, '');
        content = content.replace(/[；。]$/, '');
        content = content.trim();
        
        if (content.length > 8) results.push(content);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
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
        messages: [{
          role: "user",
          content: [{
            type: "text",
            text: prompt
          }, {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${base64Image}` }
          }]
        }],
        max_tokens: 100,
        temperature: 0
      });

      let thirdResult = response.choices[0].message.content;
      if (thirdResult) {
        thirdResult = thirdResult.replace(/^题目说明[：:]\s*/g, '');
        thirdResult = thirdResult.replace(/过关要求.*$/gm, '');
        thirdResult = thirdResult.replace(/[；。]$/, '');
        thirdResult = thirdResult.trim();
        
        if (thirdResult.length > 8) results.push(thirdResult);
        
        // Find consensus
        for (let i = 0; i < results.length; i++) {
          for (let j = i + 1; j < results.length; j++) {
            if (results[i] === results[j]) return results[i];
          }
        }
        
        return results.reduce((a, b) => a.length > b.length ? a : b);
      }
    } catch (error) {
      console.error(`第三次提取失败: ${error.message}`);
    }
  }

  return null;
}

async function verifyAllLevel1() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  console.log('完整验证等级1所有35个练习...');
  
  let verified = 0;
  let updated = 0;
  const updates = [];

  for (let i = 1; i <= 35; i++) {
    const key = `1-${i}`;
    const current = descriptions[key];
    
    console.log(`${i}/35 验证 ${key}`);
    
    const extracted = await consensusExtract(i);
    
    if (extracted) {
      if (extracted !== current) {
        descriptions[key] = extracted;
        updates.push({ key, from: current, to: extracted });
        updated++;
      }
      verified++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 400));
    
    if (i % 10 === 0) {
      fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
    }
  }

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  
  console.log(`\n验证完成: ${verified}/${35} 成功，更新 ${updated} 个`);
  
  if (updates.length > 0) {
    console.log('\n更新的练习:');
    updates.forEach(update => {
      console.log(`${update.key}: "${update.from}" -> "${update.to}"`);
    });
  }
  
  return { verified, updated };
}

verifyAllLevel1().catch(console.error);