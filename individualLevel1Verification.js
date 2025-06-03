import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function extractAuthenticDescription(imagePath) {
  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString('base64');

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: [{
          type: "text",
          text: "提取图片中'题目说明：'的准确文字，只要题目说明部分"
        }, {
          type: "image_url",
          image_url: { url: `data:image/jpeg;base64,${base64Image}` }
        }]
      }],
      max_tokens: 100,
      temperature: 0
    });

    let content = response.choices[0].message.content;
    if (content && !content.includes('无法')) {
      content = content.replace(/^题目说明[：:]\s*/g, '');
      content = content.replace(/过关要求.*$/gm, '');
      content = content.replace(/[；。]$/, '');
      content = content.trim();
      
      return content.length > 5 ? content : null;
    }
  } catch (error) {
    console.error(`提取失败: ${error.message}`);
  }

  return null;
}

async function verifySpecificExercises() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  // 重点验证可能有问题的练习
  const exercisesToCheck = [1, 2, 3, 6, 7, 8, 9, 10, 12, 14, 15, 16, 17, 18];
  const corrections = [];

  for (const exerciseNum of exercisesToCheck) {
    const key = `1-${exerciseNum}`;
    const current = descriptions[key];
    
    const fileIndex = (exerciseNum + 1).toString().padStart(2, '0');
    const imagePath = path.join(
      process.cwd(), 
      'assessments', 
      '1、初窥门径', 
      `1、初窥门径_${fileIndex}.jpg`
    );

    console.log(`验证练习 ${key}`);
    console.log(`当前描述: "${current}"`);

    if (fs.existsSync(imagePath)) {
      const extracted = await extractAuthenticDescription(imagePath);
      
      if (extracted && extracted !== current) {
        corrections.push({
          key: key,
          old: current,
          new: extracted
        });
        
        descriptions[key] = extracted;
        console.log(`需要更新为: "${extracted}"`);
      } else if (extracted) {
        console.log(`描述正确`);
      } else {
        console.log(`提取失败，保持当前描述`);
      }
    } else {
      console.log(`图片文件不存在`);
    }
    
    console.log('---');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  if (corrections.length > 0) {
    fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
    
    console.log(`\n完成验证，更新了 ${corrections.length} 个练习:`);
    corrections.forEach(item => {
      console.log(`${item.key}: "${item.old}" -> "${item.new}"`);
    });
  } else {
    console.log('\n所有检查的练习描述都是正确的');
  }

  return corrections;
}

verifySpecificExercises().catch(console.error);