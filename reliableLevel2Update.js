import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function extractDescription(exerciseNum) {
  const fileIndex = (exerciseNum + 1).toString().padStart(2, '0');
  const imagePath = path.join(process.cwd(), 'assessments', '2、小有所成', `2、小有所成_${fileIndex}.jpg`);

  if (!fs.existsSync(imagePath)) return null;

  try {
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: [{
          type: "text",
          text: "提取蓝色区域'题目说明：'后的文字"
        }, {
          type: "image_url",
          image_url: { url: `data:image/jpeg;base64,${base64Image}` }
        }]
      }],
      max_tokens: 80,
      temperature: 0
    });

    let content = response.choices[0].message.content;
    if (content && !content.includes('无法')) {
      content = content.replace(/^题目说明[：:]\s*/g, '');
      content = content.replace(/过关要求.*$/gm, '');
      content = content.replace(/[；。]+$/, '');
      return content.trim();
    }
    return null;
  } catch (error) {
    console.error(`Exercise ${exerciseNum} failed: ${error.message}`);
    return null;
  }
}

async function updateBatch(startEx, endEx) {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  let updated = 0;
  
  for (let i = startEx; i <= endEx; i++) {
    const key = `2-${i}`;
    const current = descriptions[key];
    
    // Skip if already has specific description
    if (current && !current.includes('如图摆放球型，白球任意位置') && current.length > 20) {
      console.log(`${key}: 跳过 (已有具体描述)`);
      continue;
    }
    
    const extracted = await extractDescription(i);
    
    if (extracted && extracted.length > 10) {
      descriptions[key] = extracted;
      console.log(`${key}: ${extracted}`);
      updated++;
    } else {
      console.log(`${key}: 提取失败`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log(`批次 ${startEx}-${endEx} 完成，更新了 ${updated} 个描述\n`);
  return updated;
}

async function processLevel2InSmallBatches() {
  console.log("开始小批次处理Level 2...\n");
  
  let totalUpdated = 0;
  
  // Process in batches of 3 to avoid timeouts
  for (let start = 1; start <= 15; start += 3) {
    const end = Math.min(start + 2, 15);
    console.log(`处理批次 ${start}-${end}...`);
    
    const updated = await updateBatch(start, end);
    totalUpdated += updated;
    
    console.log("批次间休息...");
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`前15个练习完成，总共更新了 ${totalUpdated} 个描述`);
  
  // Show current status
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  const descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log("\n当前Level 2状态:");
  for (let i = 1; i <= 15; i++) {
    const key = `2-${i}`;
    const desc = descriptions[key];
    const status = desc && !desc.includes('如图摆放球型，白球任意位置') && desc.length > 20 ? '[具体]' : '[通用]';
    console.log(`${key}: ${status} ${desc}`);
  }
}

processLevel2InSmallBatches().catch(console.error);