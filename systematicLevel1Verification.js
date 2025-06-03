import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function extractPreciseDescription(imagePath) {
  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString('base64');

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: [{
          type: "text",
          text: "请准确提取图片中'题目说明：'后面的完整文字内容，只要题目说明部分，不要过关要求"
        }, {
          type: "image_url",
          image_url: { url: `data:image/jpeg;base64,${base64Image}` }
        }]
      }],
      max_tokens: 150,
      temperature: 0
    });

    let content = response.choices[0].message.content;
    if (content && !content.includes('无法') && !content.includes('抱歉')) {
      content = content.replace(/^题目说明[：:]\s*/g, '');
      content = content.replace(/过关要求.*$/gm, '');
      content = content.replace(/[；。]$/, '');
      content = content.trim();
      
      return content.length > 8 ? content : null;
    }
  } catch (error) {
    console.error(`提取失败: ${error.message}`);
  }

  return null;
}

async function verifyAllLevel1Systematically() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  console.log('系统化验证等级1所有35个练习...\n');
  
  const verificationResults = [];
  let needsUpdate = 0;

  for (let i = 1; i <= 35; i++) {
    const key = `1-${i}`;
    const current = descriptions[key];
    
    const fileIndex = (i + 1).toString().padStart(2, '0');
    const imagePath = path.join(
      process.cwd(), 
      'assessments', 
      '1、初窥门径', 
      `1、初窥门径_${fileIndex}.jpg`
    );

    console.log(`验证 ${key}: "${current}"`);

    if (fs.existsSync(imagePath)) {
      const extracted = await extractPreciseDescription(imagePath);
      
      if (extracted) {
        const isMatch = extracted === current;
        
        verificationResults.push({
          exercise: key,
          current: current,
          extracted: extracted,
          match: isMatch
        });

        if (!isMatch) {
          console.log(`  ❌ 不匹配:`);
          console.log(`     当前: "${current}"`);
          console.log(`     提取: "${extracted}"`);
          needsUpdate++;
          
          // 更新为提取的准确描述
          descriptions[key] = extracted;
        } else {
          console.log(`  ✅ 匹配正确`);
        }
      } else {
        console.log(`  ⚠️  提取失败，保持当前描述`);
        verificationResults.push({
          exercise: key,
          current: current,
          extracted: null,
          match: null
        });
      }
    } else {
      console.log(`  ❌ 图片文件不存在`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 600));
    console.log('');
  }

  // 保存更新的描述
  if (needsUpdate > 0) {
    fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  }

  // 输出验证总结
  console.log('\n=== 验证总结 ===');
  console.log(`总计练习: 35`);
  console.log(`需要更新: ${needsUpdate}`);
  console.log(`验证准确: ${verificationResults.filter(r => r.match === true).length}`);
  console.log(`提取失败: ${verificationResults.filter(r => r.match === null).length}`);

  if (needsUpdate > 0) {
    console.log('\n=== 已更新的练习 ===');
    verificationResults
      .filter(r => r.match === false)
      .forEach(r => {
        console.log(`${r.exercise}: "${r.current}" -> "${r.extracted}"`);
      });
  }

  return verificationResults;
}

verifyAllLevel1Systematically().catch(console.error);