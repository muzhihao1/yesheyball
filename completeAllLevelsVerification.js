import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// 定义所有等级的信息 (等级1-8，根据实际文件数量确定)
const LEVEL_INFO = [
  { level: 1, folder: "1、初窥门径", exercises: 35 },
  { level: 2, folder: "2、小有所成", exercises: 40 },
  { level: 3, folder: "3、渐入佳境", exercises: 50 },
  { level: 4, folder: "4、炉火纯青", exercises: 60 }, // 62个文件，去掉00和01，有效习题60个
  { level: 5, folder: "5、登堂入室", exercises: 60 }, // 62个文件，去掉00和01，有效习题60个
  { level: 6, folder: "6、超群绝伦", exercises: 60 }, // 62个文件，去掉00和01，有效习题60个
  { level: 7, folder: "7、登峰造极", exercises: 55 }, // 57个文件，去掉00和01，有效习题55个
  { level: 8, folder: "8、出神入化", exercises: 55 }  // 57个文件，去掉00和01，有效习题55个
];

async function extractRequirement(imagePath) {
  try {
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
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
      max_tokens: 60,
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

async function verifyCompleteSystem() {
  const requirementsPath = 'client/src/data/exerciseRequirements.json';
  let requirements = {};
  
  if (fs.existsSync(requirementsPath)) {
    requirements = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
    console.log(`已加载现有数据，包含 ${Object.keys(requirements).length} 个习题要求\n`);
  }

  // 统计总习题数
  const totalExercises = LEVEL_INFO.reduce((sum, level) => sum + level.exercises, 0);
  console.log(`开始验证所有9个等级，总计 ${totalExercises} 个习题\n`);

  // 找出所有缺失的习题
  const allMissing = [];
  
  for (const levelInfo of LEVEL_INFO) {
    for (let exercise = 1; exercise <= levelInfo.exercises; exercise++) {
      const key = `${levelInfo.level}-${exercise}`;
      if (!requirements[key]) {
        allMissing.push({
          level: levelInfo.level,
          exercise: exercise,
          folder: levelInfo.folder
        });
      }
    }
  }

  console.log(`发现 ${allMissing.length} 个缺失的习题需要验证`);
  console.log(`当前已有 ${Object.keys(requirements).length} 个习题要求\n`);

  let processed = 0;
  let successful = 0;
  let failed = 0;

  for (const item of allMissing) {
    const fileIndex = (item.exercise + 1).toString().padStart(2, '0');
    const imagePath = path.join(
      process.cwd(), 
      'assessments', 
      item.folder, 
      `${item.folder}_${fileIndex}.jpg`
    );

    if (fs.existsSync(imagePath)) {
      processed++;
      console.log(`[${processed}/${allMissing.length}] 验证第${item.level}级第${item.exercise}题...`);
      
      const requirement = await extractRequirement(imagePath);
      
      if (requirement) {
        const key = `${item.level}-${item.exercise}`;
        requirements[key] = requirement;
        console.log(`  ✓ ${requirement}`);
        successful++;
        
        // 每5个习题保存一次进度
        if (processed % 5 === 0) {
          fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
          const currentTotal = Object.keys(requirements).length;
          console.log(`  >>> 进度保存: ${currentTotal}/${totalExercises} (${Math.round(currentTotal/totalExercises*100)}%) <<<\n`);
        }
      } else {
        console.log(`  ✗ 提取失败`);
        failed++;
      }
      
      // 控制API调用频率
      await new Promise(resolve => setTimeout(resolve, 400));
      
    } else {
      console.log(`第${item.level}级第${item.exercise}题: 图片文件不存在`);
      failed++;
    }
  }

  // 最终保存
  fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
  
  const finalTotal = Object.keys(requirements).length;
  
  console.log("\n" + "=".repeat(80));
  console.log("全系统验证任务完成！");
  console.log("=".repeat(80));
  console.log(`处理习题: ${processed} 个`);
  console.log(`成功验证: ${successful} 个`);
  console.log(`验证失败: ${failed} 个`);
  console.log(`总验证数量: ${finalTotal}/${totalExercises} (${Math.round(finalTotal/totalExercises*100)}%)`);
  
  // 统计各等级完成情况
  console.log("\n各等级验证统计:");
  for (const levelInfo of LEVEL_INFO) {
    const count = Object.keys(requirements).filter(key => key.startsWith(`${levelInfo.level}-`)).length;
    const percentage = Math.round(count/levelInfo.exercises*100);
    console.log(`等级${levelInfo.level} (${levelInfo.folder}): ${count}/${levelInfo.exercises} (${percentage}%)`);
  }
  
  if (finalTotal === totalExercises) {
    console.log("\n🎉 所有习题的过关要求已全部从真实图片中提取完成！");
  } else {
    console.log(`\n还需要验证 ${totalExercises - finalTotal} 个习题`);
  }
  
  return requirements;
}

verifyCompleteSystem().catch(console.error);