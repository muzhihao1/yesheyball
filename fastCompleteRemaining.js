import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function extractRequirement(imagePath) {
  try {
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "你是台球习题专家。请仔细查看图片中的中文文字，找到'过关要求'这几个字后面的具体要求内容。只返回过关要求的准确文字，不要添加任何解释或格式。"
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "提取这张台球习题图片中'过关要求'后面的准确中文要求。"
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` }
            }
          ],
        },
      ],
      max_tokens: 50,
      temperature: 0
    });

    const content = response.choices[0].message.content;
    if (content && !content.includes('无法') && !content.includes('抱歉')) {
      return content
        .replace(/^过关要求[:：]\s*/, '')
        .replace(/[；;。，,\s]+$/, '')
        .trim();
    }
    return null;
  } catch (error) {
    console.error(`提取失败: ${error.message}`);
    return null;
  }
}

async function fastCompleteRemaining() {
  const requirementsPath = 'client/src/data/exerciseRequirements.json';
  let requirements = {};
  
  if (fs.existsSync(requirementsPath)) {
    requirements = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
  }

  console.log("快速完成剩余验证工作...\n");

  // 快速处理第2级剩余习题
  const missing2 = [];
  for (let i = 1; i <= 40; i++) {
    if (!requirements[`2-${i}`]) missing2.push(i);
  }
  
  // 快速处理第3级剩余习题
  const missing3 = [];
  for (let i = 1; i <= 50; i++) {
    if (!requirements[`3-${i}`]) missing3.push(i);
  }

  console.log(`第2级缺失: ${missing2.length} 个`);
  console.log(`第3级缺失: ${missing3.length} 个\n`);

  let processed = 0;

  // 处理第2级
  for (const exercise of missing2) {
    const fileIndex = (exercise + 1).toString().padStart(2, '0');
    const imagePath = path.join(process.cwd(), 'assessments', '2、小有所成', `2、小有所成_${fileIndex}.jpg`);

    if (fs.existsSync(imagePath)) {
      processed++;
      console.log(`[${processed}] 验证第2级第${exercise}题...`);
      
      const requirement = await extractRequirement(imagePath);
      if (requirement) {
        requirements[`2-${exercise}`] = requirement;
        console.log(`  ✓ ${requirement}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  // 处理第3级
  for (const exercise of missing3) {
    const fileIndex = (exercise + 1).toString().padStart(2, '0');
    const imagePath = path.join(process.cwd(), 'assessments', '3、渐入佳境', `3、渐入佳境_${fileIndex}.jpg`);

    if (fs.existsSync(imagePath)) {
      processed++;
      console.log(`[${processed}] 验证第3级第${exercise}题...`);
      
      const requirement = await extractRequirement(imagePath);
      if (requirement) {
        requirements[`3-${exercise}`] = requirement;
        console.log(`  ✓ ${requirement}`);
        
        if (processed % 5 === 0) {
          fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  // 保存最终结果
  fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
  
  const level2Final = Object.keys(requirements).filter(k => k.startsWith('2-')).length;
  const level3Final = Object.keys(requirements).filter(k => k.startsWith('3-')).length;
  
  console.log("\n完成第2级和第3级剩余验证:");
  console.log(`第2级: ${level2Final}/40 (${Math.round(level2Final/40*100)}%)`);
  console.log(`第3级: ${level3Final}/50 (${Math.round(level3Final/50*100)}%)`);
  console.log(`总计: ${Object.keys(requirements).length} 个习题已验证`);
}

fastCompleteRemaining().catch(console.error);