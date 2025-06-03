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

async function processExercisesBatch(startLevel, startExercise, batchSize = 50) {
  const requirementsPath = 'client/src/data/exerciseRequirements.json';
  let requirements = {};
  
  if (fs.existsSync(requirementsPath)) {
    requirements = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
  }

  const levelMap = {
    2: { folder: "2、小有所成", total: 40 },
    3: { folder: "3、渐入佳境", total: 50 },
    4: { folder: "4、炉火纯青", total: 60 },
    5: { folder: "5、登堂入室", total: 60 },
    6: { folder: "6、超群绝伦", total: 60 },
    7: { folder: "7、登峰造极", total: 55 },
    8: { folder: "8、出神入化", total: 55 }
  };

  const tasks = [];
  let level = startLevel;
  let exercise = startExercise;

  // 生成任务列表
  while (tasks.length < batchSize && level <= 8) {
    const levelInfo = levelMap[level];
    if (levelInfo && exercise <= levelInfo.total) {
      const key = `${level}-${exercise}`;
      if (!requirements[key]) {
        tasks.push({ level, exercise, folder: levelInfo.folder });
      }
      exercise++;
    } else {
      level++;
      exercise = 1;
    }
  }

  console.log(`处理批次: ${tasks.length} 个习题 (从第${startLevel}级第${startExercise}题开始)`);

  let processed = 0;
  let successful = 0;

  for (const task of tasks) {
    const fileIndex = (task.exercise + 1).toString().padStart(2, '0');
    const imagePath = path.join(
      process.cwd(), 
      'assessments', 
      task.folder, 
      `${task.folder}_${fileIndex}.jpg`
    );

    if (fs.existsSync(imagePath)) {
      processed++;
      console.log(`[${processed}/${tasks.length}] 验证第${task.level}级第${task.exercise}题...`);
      
      const requirement = await extractRequirement(imagePath);
      
      if (requirement) {
        const key = `${task.level}-${task.exercise}`;
        requirements[key] = requirement;
        console.log(`  ✓ ${requirement}`);
        successful++;
      } else {
        console.log(`  ✗ 提取失败`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  // 保存结果
  fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
  
  const totalNow = Object.keys(requirements).length;
  console.log(`\n批次完成: 成功验证 ${successful}/${processed} 个习题`);
  console.log(`总进度: ${totalNow}/415 (${Math.round(totalNow/415*100)}%)`);
  
  return { totalNow, nextLevel: level, nextExercise: exercise };
}

// 运行批量处理
async function runBatches() {
  let level = 2;
  let exercise = 23; // 从当前进度开始
  
  while (level <= 8) {
    const result = await processExercisesBatch(level, exercise, 30);
    level = result.nextLevel;
    exercise = result.nextExercise;
    
    if (result.totalNow >= 400) {
      console.log("\n大部分验证工作已完成！");
      break;
    }
    
    // 短暂休息
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log("\n批量验证任务完成");
}

runBatches().catch(console.error);