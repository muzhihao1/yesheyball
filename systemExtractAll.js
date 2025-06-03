import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// 系统性提取所有习题过关要求的完整方案
const COMPLETE_LEVELS = [
  { level: 1, folder: "1、初窥门径", maxExercises: 35 },
  { level: 2, folder: "2、小有所成", maxExercises: 40 },
  { level: 3, folder: "3、渐入佳境", maxExercises: 50 }
];

async function extractSingleRequirement(imagePath) {
  try {
    if (!fs.existsSync(imagePath)) {
      console.log(`文件不存在: ${imagePath}`);
      return null;
    }

    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at reading Chinese text from billiards exercise images. Extract ONLY the exact text that appears after '过关要求:' (pass requirement). Return only the requirement text with no additional formatting, explanation, or punctuation."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "从这张台球习题图片中提取'过关要求'后面的准确文字。"
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
    if (content) {
      // 清理提取的文字
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

async function processAllExercisesSystematically() {
  console.log("=".repeat(60));
  console.log("启动系统性习题过关要求提取");
  console.log("=".repeat(60));

  const extractedRequirements = {};
  let totalSuccess = 0;
  let totalFailed = 0;
  let processedFiles = 0;

  for (const levelConfig of COMPLETE_LEVELS) {
    console.log(`\n处理等级 ${levelConfig.level}: ${levelConfig.folder}`);
    console.log("-".repeat(40));

    for (let exerciseIndex = 1; exerciseIndex <= levelConfig.maxExercises; exerciseIndex++) {
      // 文件名从02开始（跳过00、01），对应第1题
      const fileNumber = (exerciseIndex + 1).toString().padStart(2, '0');
      const imagePath = path.join(
        process.cwd(), 
        'assessments', 
        levelConfig.folder, 
        `${levelConfig.folder}_${fileNumber}.jpg`
      );

      console.log(`  第${exerciseIndex}题 (${fileNumber}.jpg)`, { replace: true });
      processedFiles++;

      try {
        const requirement = await extractSingleRequirement(imagePath);
        
        if (requirement && requirement.length > 2) {
          const exerciseKey = `${levelConfig.level}-${exerciseIndex}`;
          extractedRequirements[exerciseKey] = requirement;
          console.log(`    ✓ ${requirement}`);
          totalSuccess++;
        } else {
          console.log(`    ✗ 提取失败或结果无效`);
          totalFailed++;
        }
        
        // 控制API调用频率防止被限制
        await new Promise(resolve => setTimeout(resolve, 700));
        
      } catch (error) {
        console.log(`    ✗ 处理错误: ${error.message}`);
        totalFailed++;
      }

      // 每10个文件显示进度
      if (processedFiles % 10 === 0) {
        console.log(`\n--- 进度更新: 已处理 ${processedFiles} 个文件 ---`);
        console.log(`成功: ${totalSuccess}, 失败: ${totalFailed}`);
      }
    }
    
    console.log(`\n等级 ${levelConfig.level} 完成`);
  }

  // 保存最终结果
  const outputPath = path.join(process.cwd(), 'client/src/data/exerciseRequirements.json');
  
  // 创建备份
  if (fs.existsSync(outputPath)) {
    const backupPath = outputPath.replace('.json', `_backup_${Date.now()}.json`);
    fs.copyFileSync(outputPath, backupPath);
    console.log(`\n已创建备份: ${backupPath}`);
  }

  // 保存新数据
  fs.writeFileSync(outputPath, JSON.stringify(extractedRequirements, null, 2), 'utf8');

  // 输出完整统计
  console.log("\n" + "=".repeat(60));
  console.log("提取完成统计报告");
  console.log("=".repeat(60));
  console.log(`总处理文件: ${processedFiles}`);
  console.log(`成功提取: ${totalSuccess} (${((totalSuccess/processedFiles)*100).toFixed(1)}%)`);
  console.log(`提取失败: ${totalFailed} (${((totalFailed/processedFiles)*100).toFixed(1)}%)`);
  console.log(`输出文件: ${outputPath}`);
  console.log(`总习题数: ${Object.keys(extractedRequirements).length}`);
  
  // 按等级显示结果概览
  console.log("\n各等级提取结果:");
  for (const config of COMPLETE_LEVELS) {
    const levelExercises = Object.keys(extractedRequirements)
      .filter(key => key.startsWith(`${config.level}-`));
    console.log(`等级${config.level}: ${levelExercises.length}/${config.maxExercises} 题`);
  }

  return extractedRequirements;
}

// 执行系统性提取
processAllExercisesSystematically()
  .then(() => {
    console.log("\n✅ 系统性提取任务完成！");
    process.exit(0);
  })
  .catch(error => {
    console.error("\n❌ 提取过程中发生错误:", error);
    process.exit(1);
  });