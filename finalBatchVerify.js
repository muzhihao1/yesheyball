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

async function verifyMissingExercises() {
  const requirementsPath = 'client/src/data/exerciseRequirements.json';
  let requirements = {};
  
  if (fs.existsSync(requirementsPath)) {
    requirements = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
  }

  // 检查缺失的习题
  const missingExercises = [];
  
  // 第1级 (1-35)
  for (let i = 1; i <= 35; i++) {
    if (!requirements[`1-${i}`]) {
      missingExercises.push({level: 1, exercise: i, folder: "1、初窥门径"});
    }
  }
  
  // 第2级 (1-40)
  for (let i = 1; i <= 40; i++) {
    if (!requirements[`2-${i}`]) {
      missingExercises.push({level: 2, exercise: i, folder: "2、小有所成"});
    }
  }
  
  // 第3级 (1-50)
  for (let i = 1; i <= 50; i++) {
    if (!requirements[`3-${i}`]) {
      missingExercises.push({level: 3, exercise: i, folder: "3、渐入佳境"});
    }
  }

  console.log(`发现 ${missingExercises.length} 个缺失的习题需要验证`);
  console.log(`当前已有 ${Object.keys(requirements).length} 个习题要求`);

  let processed = 0;
  let successful = 0;

  for (const item of missingExercises) {
    const fileIndex = (item.exercise + 1).toString().padStart(2, '0');
    const imagePath = path.join(
      process.cwd(), 
      'assessments', 
      item.folder, 
      `${item.folder}_${fileIndex}.jpg`
    );

    if (fs.existsSync(imagePath)) {
      console.log(`验证第${item.level}级第${item.exercise}题...`);
      processed++;
      
      const requirement = await extractRequirement(imagePath);
      
      if (requirement) {
        const key = `${item.level}-${item.exercise}`;
        requirements[key] = requirement;
        console.log(`  ✓ ${requirement}`);
        successful++;
        
        // 每5个习题保存一次进度
        if (processed % 5 === 0) {
          fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
          console.log(`  >>> 进度保存: ${successful}/${processed} <<<`);
        }
      } else {
        console.log(`  ✗ 提取失败`);
      }
      
      // 控制API调用频率
      await new Promise(resolve => setTimeout(resolve, 600));
      
    } else {
      console.log(`第${item.level}级第${item.exercise}题: 图片文件不存在`);
    }
  }

  // 最终保存
  fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
  
  console.log("\n" + "=".repeat(70));
  console.log("缺失习题验证完成！");
  console.log("=".repeat(70));
  console.log(`处理习题: ${processed} 个`);
  console.log(`成功验证: ${successful} 个`);
  console.log(`总计习题: ${Object.keys(requirements).length} 个`);
  
  // 统计各等级完成情况
  [1, 2, 3].forEach(level => {
    const count = Object.keys(requirements).filter(key => key.startsWith(`${level}-`)).length;
    const total = level === 1 ? 35 : level === 2 ? 40 : 50;
    console.log(`等级${level}: ${count}/${total} 个习题已验证`);
  });

  return requirements;
}

verifyMissingExercises().catch(console.error);