import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// 完整的等级配置
const ALL_LEVELS = [
  { level: 1, folder: "1、初窥门径", totalExercises: 35, startFrom: 11 }, // 1-10已完成
  { level: 2, folder: "2、小有所成", totalExercises: 40, startFrom: 1 },
  { level: 3, folder: "3、渐入佳境", totalExercises: 50, startFrom: 1 }
];

async function extractRequirement(imagePath) {
  try {
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "你是台球习题专家。请仔细查看图片中'过关要求'后的中文文字，只返回过关要求的准确内容，不要其他解释。"
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "提取这张台球习题图片中'过关要求'的准确中文内容。"
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` }
            }
          ],
        },
      ],
      max_tokens: 25,
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

async function processAllLevels() {
  console.log("开始处理所有剩余习题的过关要求...\n");
  
  // 加载现有数据
  const requirementsPath = 'client/src/data/exerciseRequirements.json';
  let allRequirements = {};
  
  if (fs.existsSync(requirementsPath)) {
    allRequirements = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
    console.log(`已加载现有数据，包含 ${Object.keys(allRequirements).length} 个习题`);
  }

  let totalProcessed = 0;
  let totalSuccess = 0;

  for (const config of ALL_LEVELS) {
    console.log(`\n处理 ${config.level}级: ${config.folder}`);
    console.log(`从第${config.startFrom}题开始，共${config.totalExercises}题`);
    
    for (let exercise = config.startFrom; exercise <= config.totalExercises; exercise++) {
      const fileIndex = (exercise + 1).toString().padStart(2, '0');
      const imagePath = path.join(
        process.cwd(), 
        'assessments', 
        config.folder, 
        `${config.folder}_${fileIndex}.jpg`
      );

      if (fs.existsSync(imagePath)) {
        process.stdout.write(`  第${exercise}题... `);
        totalProcessed++;
        
        const requirement = await extractRequirement(imagePath);
        
        if (requirement) {
          const key = `${config.level}-${exercise}`;
          allRequirements[key] = requirement;
          console.log(`✓ ${requirement}`);
          totalSuccess++;
          
          // 每10个习题保存一次
          if (totalProcessed % 10 === 0) {
            fs.writeFileSync(requirementsPath, JSON.stringify(allRequirements, null, 2), 'utf8');
            console.log(`    (已保存进度: ${totalSuccess}/${totalProcessed})`);
          }
        } else {
          console.log(`✗ 提取失败`);
        }
        
        // 控制API调用频率
        await new Promise(resolve => setTimeout(resolve, 600));
        
      } else {
        console.log(`  第${exercise}题: 文件不存在`);
      }
    }
    
    console.log(`${config.level}级完成`);
  }

  // 最终保存
  fs.writeFileSync(requirementsPath, JSON.stringify(allRequirements, null, 2), 'utf8');
  
  console.log("\n" + "=".repeat(60));
  console.log("所有习题过关要求提取完成！");
  console.log("=".repeat(60));
  console.log(`总处理: ${totalProcessed} 个习题`);
  console.log(`成功提取: ${totalSuccess} 个要求`);
  console.log(`总习题数: ${Object.keys(allRequirements).length}`);
  console.log(`数据保存至: ${requirementsPath}`);
  
  // 按等级统计
  console.log("\n各等级统计:");
  [1, 2, 3].forEach(level => {
    const levelCount = Object.keys(allRequirements).filter(key => key.startsWith(`${level}-`)).length;
    console.log(`等级${level}: ${levelCount} 个习题`);
  });

  return allRequirements;
}

// 执行完整提取
processAllLevels().catch(console.error);