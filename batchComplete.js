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

async function processBatch(startLevel, startExercise, batchSize = 50) {
  const requirementsPath = 'client/src/data/exerciseRequirements.json';
  let requirements = {};
  
  if (fs.existsSync(requirementsPath)) {
    requirements = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
  }

  const levels = [
    { level: 2, folder: "2、小有所成", exercises: 40 },
    { level: 3, folder: "3、渐入佳境", exercises: 50 },
    { level: 4, folder: "4、炉火纯青", exercises: 60 },
    { level: 5, folder: "5、登堂入室", exercises: 60 },
    { level: 6, folder: "6、超群绝伦", exercises: 60 },
    { level: 7, folder: "7、登峰造极", exercises: 55 },
    { level: 8, folder: "8、出神入化", exercises: 55 }
  ];

  let processed = 0;
  let successful = 0;
  let found = false;

  console.log(`开始批处理验证 - 从等级${startLevel}第${startExercise}题开始，批量${batchSize}个...\n`);

  for (const levelInfo of levels) {
    if (levelInfo.level < startLevel) continue;
    
    console.log(`处理 ${levelInfo.folder}...`);
    
    const start = levelInfo.level === startLevel ? startExercise : 1;
    
    for (let exercise = start; exercise <= levelInfo.exercises && processed < batchSize; exercise++) {
      const key = `${levelInfo.level}-${exercise}`;
      found = true;
      
      if (!requirements[key]) {
        const fileIndex = (exercise + 1).toString().padStart(2, '0');
        const imagePath = path.join(
          process.cwd(), 
          'assessments', 
          levelInfo.folder, 
          `${levelInfo.folder}_${fileIndex}.jpg`
        );

        if (fs.existsSync(imagePath)) {
          processed++;
          console.log(`第${levelInfo.level}级第${exercise}题...`);
          
          const requirement = await extractRequirement(imagePath);
          
          if (requirement) {
            requirements[key] = requirement;
            console.log(`  ✓ ${requirement}`);
            successful++;
          } else {
            console.log(`  ✗ 提取失败`);
          }
          
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
    }
    
    if (processed >= batchSize) break;
  }

  fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
  
  const currentTotal = Object.keys(requirements).length;
  console.log(`\n批处理完成:`);
  console.log(`本批新增: ${successful} 个`);
  console.log(`当前总数: ${currentTotal}/415 (${Math.round(currentTotal/415*100)}%)`);
  
  // 计算下一批起始位置
  let nextLevel = startLevel;
  let nextExercise = startExercise + processed;
  
  for (const levelInfo of levels) {
    if (levelInfo.level === nextLevel && nextExercise > levelInfo.exercises) {
      nextLevel++;
      nextExercise = 1;
    }
  }
  
  console.log(`下一批建议从: 等级${nextLevel}第${nextExercise}题开始`);
  
  return { currentTotal, nextLevel, nextExercise, hasMore: nextLevel <= 8 };
}

// 从当前进度继续
processBatch(2, 29, 30).catch(console.error);