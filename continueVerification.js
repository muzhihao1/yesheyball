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

async function continueVerification() {
  const requirementsPath = 'client/src/data/exerciseRequirements.json';
  let requirements = {};
  
  if (fs.existsSync(requirementsPath)) {
    requirements = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
  }

  // 继续验证第2级剩余习题 (24-40)
  console.log("继续验证第2级剩余习题...");
  
  for (let exercise = 24; exercise <= 40; exercise++) {
    if (!requirements[`2-${exercise}`]) {
      const fileIndex = (exercise + 1).toString().padStart(2, '0');
      const imagePath = path.join(
        process.cwd(), 
        'assessments', 
        '2、小有所成', 
        `2、小有所成_${fileIndex}.jpg`
      );

      if (fs.existsSync(imagePath)) {
        console.log(`验证第2级第${exercise}题...`);
        
        const requirement = await extractRequirement(imagePath);
        
        if (requirement) {
          requirements[`2-${exercise}`] = requirement;
          console.log(`  ✓ ${requirement}`);
        } else {
          console.log(`  ✗ 提取失败`);
        }
        
        // 每3题保存一次
        if (exercise % 3 === 0) {
          fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }

  // 验证第3级剩余习题 (16-50)
  console.log("\n验证第3级剩余习题...");
  
  for (let exercise = 16; exercise <= 50; exercise++) {
    if (!requirements[`3-${exercise}`]) {
      const fileIndex = (exercise + 1).toString().padStart(2, '0');
      const imagePath = path.join(
        process.cwd(), 
        'assessments', 
        '3、渐入佳境', 
        `3、渐入佳境_${fileIndex}.jpg`
      );

      if (fs.existsSync(imagePath)) {
        console.log(`验证第3级第${exercise}题...`);
        
        const requirement = await extractRequirement(imagePath);
        
        if (requirement) {
          requirements[`3-${exercise}`] = requirement;
          console.log(`  ✓ ${requirement}`);
        } else {
          console.log(`  ✗ 提取失败`);
        }
        
        // 每5题保存一次
        if (exercise % 5 === 0) {
          fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
          console.log(`  >>> 第3级前${exercise}题已保存 <<<`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }

  // 最终保存和统计
  fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
  
  const totalVerified = Object.keys(requirements).length;
  const level1Count = Object.keys(requirements).filter(k => k.startsWith('1-')).length;
  const level2Count = Object.keys(requirements).filter(k => k.startsWith('2-')).length;
  const level3Count = Object.keys(requirements).filter(k => k.startsWith('3-')).length;
  
  console.log("\n" + "=".repeat(60));
  console.log("验证进度更新完成！");
  console.log("=".repeat(60));
  console.log(`总验证数量: ${totalVerified}/125`);
  console.log(`第1级: ${level1Count}/35 (${Math.round(level1Count/35*100)}%)`);
  console.log(`第2级: ${level2Count}/40 (${Math.round(level2Count/40*100)}%)`);
  console.log(`第3级: ${level3Count}/50 (${Math.round(level3Count/50*100)}%)`);
  console.log(`总完成度: ${Math.round(totalVerified/125*100)}%`);
}

continueVerification().catch(console.error);