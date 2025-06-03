import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// 精确提取特定习题的过关要求
async function analyzeSpecificExercise(level, exerciseNumber) {
  const levelFolders = {
    1: "1、初窥门径",
    2: "2、小有所成", 
    3: "3、渐入佳境"
  };
  
  const fileIndex = (exerciseNumber + 1).toString().padStart(2, '0');
  const imagePath = path.join(
    process.cwd(), 
    'assessments', 
    levelFolders[level], 
    `${levelFolders[level]}_${fileIndex}.jpg`
  );

  if (!fs.existsSync(imagePath)) {
    console.log(`图片文件不存在: ${imagePath}`);
    return null;
  }

  try {
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "你是台球习题分析专家。请仔细查看图片中的中文文字，找到'过关要求'这几个字后面的具体要求内容。只返回过关要求的准确文字，不要添加任何解释或格式。"
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `这是台球训练第${level}级第${exerciseNumber}题的图片。请提取'过关要求'后面的准确中文要求。`
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` }
            }
          ],
        },
      ],
      max_tokens: 30,
      temperature: 0
    });

    const content = response.choices[0].message.content;
    if (content && !content.includes('无法') && !content.includes('抱歉')) {
      const cleaned = content
        .replace(/^过关要求[:：]\s*/, '')
        .replace(/[；;。，,\s]+$/, '')
        .trim();
      return cleaned;
    }
    return null;
  } catch (error) {
    console.error(`API调用失败: ${error.message}`);
    return null;
  }
}

// 验证并更新特定习题
async function verifyAndUpdateExercise(level, exerciseNumber) {
  console.log(`\n验证第${level}级第${exerciseNumber}题...`);
  
  const requirement = await analyzeSpecificExercise(level, exerciseNumber);
  
  if (requirement) {
    console.log(`✓ 提取成功: ${requirement}`);
    
    // 更新到JSON文件
    const requirementsPath = 'client/src/data/exerciseRequirements.json';
    let requirements = {};
    
    if (fs.existsSync(requirementsPath)) {
      requirements = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
    }
    
    requirements[`${level}-${exerciseNumber}`] = requirement;
    fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
    
    return requirement;
  } else {
    console.log(`✗ 提取失败`);
    return null;
  }
}

// 验证第1级的前10个习题
async function verifyLevel1Exercises() {
  console.log("=".repeat(50));
  console.log("开始验证第1级习题过关要求");
  console.log("=".repeat(50));
  
  const results = {};
  
  for (let i = 1; i <= 10; i++) {
    const requirement = await verifyAndUpdateExercise(1, i);
    if (requirement) {
      results[`1-${i}`] = requirement;
    }
    
    // 控制API调用频率
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log("\n验证完成统计:");
  console.log(`成功验证: ${Object.keys(results).length}/10 题`);
  
  Object.entries(results).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });
  
  return results;
}

// 如果直接运行此脚本
if (process.argv.includes('--verify-level1')) {
  verifyLevel1Exercises().catch(console.error);
} else if (process.argv.includes('--single')) {
  const level = parseInt(process.argv[process.argv.indexOf('--single') + 1]);
  const exercise = parseInt(process.argv[process.argv.indexOf('--single') + 2]);
  if (level && exercise) {
    verifyAndUpdateExercise(level, exercise).catch(console.error);
  } else {
    console.log("用法: node preciseTxtract.js --single <级别> <习题号>");
  }
}

export { analyzeSpecificExercise, verifyAndUpdateExercise, verifyLevel1Exercises };