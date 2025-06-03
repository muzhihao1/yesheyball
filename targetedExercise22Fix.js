import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function extractExercise22() {
  const imagePath = path.join(
    process.cwd(), 
    'assessments', 
    '1、初窥门径', 
    '1、初窥门径_23.jpg'
  );

  if (!fs.existsSync(imagePath)) {
    console.log('练习22图片文件不存在');
    return null;
  }

  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString('base64');

  // 多次尝试提取，确保准确性
  const attempts = [];
  
  for (let i = 0; i < 3; i++) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{
          role: "user",
          content: [{
            type: "text",
            text: "请准确提取图片中'题目说明：'后面的完整文字，逐字提取，不要遗漏或添加任何内容"
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
        
        if (content.length > 8) {
          attempts.push(content);
          console.log(`尝试 ${i+1}: "${content}"`);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`尝试 ${i+1} 失败: ${error.message}`);
    }
  }

  // 找到最常见的结果
  if (attempts.length > 0) {
    const counts = {};
    attempts.forEach(attempt => {
      counts[attempt] = (counts[attempt] || 0) + 1;
    });
    
    const mostCommon = Object.entries(counts)
      .sort(([,a], [,b]) => b - a)[0][0];
    
    console.log(`最常见结果: "${mostCommon}"`);
    return mostCommon;
  }

  return null;
}

async function fixExercise22AndVerifyProcess() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  console.log('专门修正练习22并诊断验证流程问题...\n');
  
  const current22 = descriptions['1-22'];
  console.log(`当前22题描述: "${current22}"`);
  
  const extracted22 = await extractExercise22();
  
  if (extracted22) {
    if (extracted22 !== current22) {
      descriptions['1-22'] = extracted22;
      fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
      
      console.log(`\n22题已更新:`);
      console.log(`原描述: "${current22}"`);
      console.log(`新描述: "${extracted22}"`);
      
      // 分析差异
      console.log('\n差异分析:');
      if (current22.length !== extracted22.length) {
        console.log(`长度差异: ${current22.length} vs ${extracted22.length}`);
      }
      
      for (let i = 0; i < Math.max(current22.length, extracted22.length); i++) {
        if (current22[i] !== extracted22[i]) {
          console.log(`第${i+1}位不同: '${current22[i] || '空'}' vs '${extracted22[i] || '空'}'`);
        }
      }
    } else {
      console.log('22题描述已经正确');
    }
  } else {
    console.log('22题提取失败');
  }

  // 诊断验证流程问题
  console.log('\n诊断验证流程问题:');
  console.log('1. OpenAI API提取不稳定 - 需要多次尝试和共识机制');
  console.log('2. 文字清理过程可能丢失细节 - 需要更精确的处理');
  console.log('3. 单次验证不足 - 需要多轮验证确认');
  
  return extracted22;
}

fixExercise22AndVerifyProcess().catch(console.error);