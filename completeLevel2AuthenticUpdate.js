import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function extractAuthenticDescription(exerciseNum) {
  const fileIndex = (exerciseNum + 1).toString().padStart(2, '0');
  const imagePath = path.join(
    process.cwd(), 
    'assessments', 
    '2、小有所成', 
    `2、小有所成_${fileIndex}.jpg`
  );

  if (!fs.existsSync(imagePath)) {
    return null;
  }

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
              text: "请精确提取图片中蓝色区域'题目说明：'后面的完整文字内容，逐字逐句准确提取，不要遗漏任何字符。只要题目说明部分，不要过关要求。"
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
      content = content.replace(/[；。]+$/, '');
      content = content.trim();
      
      return content.length > 8 ? content : null;
    }
    return null;
  } catch (error) {
    console.error(`Exercise ${exerciseNum} 提取失败: ${error.message}`);
    return null;
  }
}

async function updateAllLevel2Descriptions() {
  console.log("开始提取所有Level 2练习的真实描述...\n");
  
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  let updated = 0;
  let processed = 0;
  
  for (let exercise = 1; exercise <= 40; exercise++) {
    const key = `2-${exercise}`;
    const current = descriptions[key];
    
    // 检查是否需要更新
    const needsUpdate = !current || 
      current.includes('如图摆放球型，白球任意位置') ||
      current.length < 20;
    
    if (!needsUpdate) {
      console.log(`${key}: 已有具体描述，跳过`);
      continue;
    }
    
    console.log(`处理 ${key}...`);
    
    const extracted = await extractAuthenticDescription(exercise);
    
    if (extracted) {
      descriptions[key] = extracted;
      console.log(`  ✓ 更新为: "${extracted}"`);
      updated++;
    } else {
      console.log(`  ✗ 提取失败`);
    }
    
    processed++;
    
    // 每处理5个练习保存一次
    if (processed % 5 === 0) {
      fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
      console.log(`  中间保存 - 已处理 ${processed} 个练习`);
    }
    
    // 避免API限制
    await new Promise(resolve => setTimeout(resolve, 1200));
  }
  
  // 最终保存
  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  
  console.log(`\n=== Level 2 完成 ===`);
  console.log(`处理了 ${processed} 个练习`);
  console.log(`更新了 ${updated} 个描述`);
  
  // 统计结果
  let authenticCount = 0;
  let genericCount = 0;
  
  console.log(`\nLevel 2 最终状态:`);
  for (let i = 1; i <= 40; i++) {
    const key = `2-${i}`;
    const desc = descriptions[key] || '无';
    
    if (desc.includes('如图摆放球型，白球任意位置') || desc === '无' || desc.length < 15) {
      genericCount++;
      console.log(`${key}: [通用] ${desc}`);
    } else {
      authenticCount++;
      console.log(`${key}: [具体] ${desc}`);
    }
  }
  
  console.log(`\n统计: ${authenticCount} 个具体描述, ${genericCount} 个通用描述`);
  console.log(`完成率: ${(authenticCount / 40 * 100).toFixed(1)}%`);
}

updateAllLevel2Descriptions().catch(console.error);