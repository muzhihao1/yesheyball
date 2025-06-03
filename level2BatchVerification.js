import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 快速提取方法
async function extractDescription(imagePath) {
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
              text: "从图片中提取'题目说明：'的完整文字，只要说明部分，不要过关要求"
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

    let content = response.choices[0].message.content;
    if (content && !content.includes('无法') && !content.includes('抱歉')) {
      content = content.replace(/^题目说明[：:]\s*/g, '');
      content = content.replace(/过关要求.*$/gm, '');
      content = content.replace(/；$/, '');
      return content.trim();
    }
    return null;
  } catch (error) {
    console.error(`提取失败: ${error.message}`);
    return null;
  }
}

// 批量处理Level 2
async function processLevel2Batch(startEx = 1, endEx = 10) {
  console.log(`处理Level 2练习 ${startEx}-${endEx}...`);
  
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = {};
  
  if (fs.existsSync(descriptionsPath)) {
    descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  }
  
  let updated = 0;
  
  for (let exercise = startEx; exercise <= endEx; exercise++) {
    const key = `2-${exercise}`;
    const current = descriptions[key];
    
    // 只处理通用描述
    if (current && !current.includes('如图摆放球型，白球任意位置')) {
      console.log(`  ${key}: 已有具体描述，跳过`);
      continue;
    }
    
    const fileIndex = (exercise + 1).toString().padStart(2, '0');
    const imagePath = path.join(
      process.cwd(), 
      'assessments', 
      '2、小有所成', 
      `2、小有所成_${fileIndex}.jpg`
    );
    
    if (!fs.existsSync(imagePath)) {
      console.log(`  ${key}: 图片不存在`);
      continue;
    }
    
    process.stdout.write(`  ${key}... `);
    
    const extracted = await extractDescription(imagePath);
    
    if (extracted && extracted.length > 10) {
      descriptions[key] = extracted;
      console.log(`✓ ${extracted}`);
      updated++;
    } else {
      console.log(`✗ 提取失败`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 保存结果
  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  
  console.log(`批次完成，更新了 ${updated} 个描述\n`);
  return updated;
}

// 处理所有Level 2练习
async function processAllLevel2() {
  console.log("开始批量处理Level 2所有练习...\n");
  
  let totalUpdated = 0;
  const batchSize = 8;
  
  // 分批处理
  for (let start = 1; start <= 40; start += batchSize) {
    const end = Math.min(start + batchSize - 1, 40);
    const updated = await processLevel2Batch(start, end);
    totalUpdated += updated;
    
    // 批次间休息
    if (end < 40) {
      console.log("休息2秒...");
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log(`=== Level 2完成 ===`);
  console.log(`总共更新了 ${totalUpdated} 个描述`);
  
  // 验证结果
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  const descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  let authenticCount = 0;
  let genericCount = 0;
  
  console.log(`\nLevel 2更新后状态:`);
  for (let i = 1; i <= 40; i++) {
    const key = `2-${i}`;
    const desc = descriptions[key] || '无';
    
    if (desc.includes('如图摆放球型，白球任意位置') || desc === '无') {
      genericCount++;
      console.log(`${key}: [通用] ${desc}`);
    } else {
      authenticCount++;
      console.log(`${key}: [具体] ${desc}`);
    }
  }
  
  console.log(`\n统计: ${authenticCount} 个具体描述, ${genericCount} 个通用描述`);
}

// 运行处理
processAllLevel2().catch(console.error);