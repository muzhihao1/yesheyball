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
      max_tokens: 40,
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

async function batchVerifyExercises() {
  const requirementsPath = 'client/src/data/exerciseRequirements.json';
  let requirements = {};
  
  if (fs.existsSync(requirementsPath)) {
    requirements = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
  }

  // 批量验证第2级剩余习题 (22-40)
  const level2Exercises = Array.from({length: 19}, (_, i) => i + 22);
  
  console.log("开始验证第2级第22-40题...");
  
  for (const exercise of level2Exercises) {
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
        const key = `2-${exercise}`;
        requirements[key] = requirement;
        console.log(`  ✓ ${requirement}`);
      } else {
        console.log(`  ✗ 提取失败`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  }

  // 保存进度
  fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
  console.log(`\n第2级验证完成，已保存 ${Object.keys(requirements).filter(k => k.startsWith('2-')).length} 个习题要求`);

  // 验证第3级习题 (1-50)
  console.log("\n开始验证第3级第1-50题...");
  
  for (let exercise = 1; exercise <= 50; exercise++) {
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
        const key = `3-${exercise}`;
        requirements[key] = requirement;
        console.log(`  ✓ ${requirement}`);
        
        // 每10题保存一次
        if (exercise % 10 === 0) {
          fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
          console.log(`  >>> 已保存第3级前${exercise}题进度 <<<`);
        }
      } else {
        console.log(`  ✗ 提取失败`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  }

  // 最终保存
  fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
  
  console.log("\n" + "=".repeat(60));
  console.log("所有验证任务完成！");
  console.log("=".repeat(60));
  console.log(`总计验证: ${Object.keys(requirements).length} 个习题要求`);
  
  [1, 2, 3].forEach(level => {
    const count = Object.keys(requirements).filter(key => key.startsWith(`${level}-`)).length;
    console.log(`等级${level}: ${count} 个习题已验证`);
  });
}

batchVerifyExercises().catch(console.error);