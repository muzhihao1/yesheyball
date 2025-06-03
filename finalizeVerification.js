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

async function finalizeMissingVerification() {
  const requirementsPath = 'client/src/data/exerciseRequirements.json';
  let requirements = {};
  
  if (fs.existsSync(requirementsPath)) {
    requirements = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
  }

  // 找出所有缺失的习题
  const allMissing = [];
  
  // 第1级缺失项
  for (let i = 1; i <= 35; i++) {
    if (!requirements[`1-${i}`]) {
      allMissing.push({level: 1, exercise: i, folder: "1、初窥门径"});
    }
  }
  
  // 第2级缺失项
  for (let i = 1; i <= 40; i++) {
    if (!requirements[`2-${i}`]) {
      allMissing.push({level: 2, exercise: i, folder: "2、小有所成"});
    }
  }
  
  // 第3级缺失项
  for (let i = 1; i <= 50; i++) {
    if (!requirements[`3-${i}`]) {
      allMissing.push({level: 3, exercise: i, folder: "3、渐入佳境"});
    }
  }

  console.log(`开始验证剩余的 ${allMissing.length} 个习题`);

  let completed = 0;
  
  for (const item of allMissing) {
    const fileIndex = (item.exercise + 1).toString().padStart(2, '0');
    const imagePath = path.join(
      process.cwd(), 
      'assessments', 
      item.folder, 
      `${item.folder}_${fileIndex}.jpg`
    );

    if (fs.existsSync(imagePath)) {
      console.log(`[${completed + 1}/${allMissing.length}] 验证第${item.level}级第${item.exercise}题...`);
      
      const requirement = await extractRequirement(imagePath);
      
      if (requirement) {
        requirements[`${item.level}-${item.exercise}`] = requirement;
        console.log(`  ✓ ${requirement}`);
        completed++;
        
        // 每处理3个习题保存一次
        if (completed % 3 === 0) {
          fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
          const currentTotal = Object.keys(requirements).length;
          console.log(`  >>> 进度: ${currentTotal}/125 (${Math.round(currentTotal/125*100)}%) <<<`);
        }
      } else {
        console.log(`  ✗ 提取失败`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 400));
    } else {
      console.log(`第${item.level}级第${item.exercise}题: 图片不存在`);
    }
  }

  // 最终保存
  fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
  
  const finalTotal = Object.keys(requirements).length;
  const level1Final = Object.keys(requirements).filter(k => k.startsWith('1-')).length;
  const level2Final = Object.keys(requirements).filter(k => k.startsWith('2-')).length;
  const level3Final = Object.keys(requirements).filter(k => k.startsWith('3-')).length;
  
  console.log("\n" + "=".repeat(70));
  console.log("所有习题验证任务完成！");
  console.log("=".repeat(70));
  console.log(`总验证数量: ${finalTotal}/125 (${Math.round(finalTotal/125*100)}%)`);
  console.log(`第1级: ${level1Final}/35 (${Math.round(level1Final/35*100)}%)`);
  console.log(`第2级: ${level2Final}/40 (${Math.round(level2Final/40*100)}%)`);
  console.log(`第3级: ${level3Final}/50 (${Math.round(level3Final/50*100)}%)`);
  
  if (finalTotal === 125) {
    console.log("\n🎉 所有125个习题的过关要求已全部从真实图片中提取完成！");
  } else {
    console.log(`\n还需要验证 ${125 - finalTotal} 个习题`);
  }
  
  return requirements;
}

finalizeMissingVerification().catch(console.error);