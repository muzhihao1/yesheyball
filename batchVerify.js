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
          role: "user",
          content: [
            {
              type: "text",
              text: "提取台球习题图片中'过关要求'后的准确中文文字。"
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
      return content.replace(/过关要求[:：]\s*/, '').replace(/[；;。，,\s]+$/, '').trim();
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function batchVerifyExercises() {
  console.log("批量验证剩余习题过关要求...\n");
  
  const requirementsPath = 'client/src/data/exerciseRequirements.json';
  let requirements = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));

  // 关键习题列表（采样验证）
  const keyExercises = [
    // 第1级关键习题
    { level: 1, exercise: 22, folder: "1、初窥门径" },
    { level: 1, exercise: 24, folder: "1、初窥门径" },
    { level: 1, exercise: 29, folder: "1、初窥门径" },
    { level: 1, exercise: 31, folder: "1、初窥门径" },
    { level: 1, exercise: 32, folder: "1、初窥门径" },
    { level: 1, exercise: 33, folder: "1、初窥门径" },
    { level: 1, exercise: 34, folder: "1、初窥门径" },
    
    // 第2级关键习题
    { level: 2, exercise: 7, folder: "2、小有所成" },
    { level: 2, exercise: 8, folder: "2、小有所成" },
    { level: 2, exercise: 9, folder: "2、小有所成" },
    { level: 2, exercise: 11, folder: "2、小有所成" },
    { level: 2, exercise: 12, folder: "2、小有所成" },
    { level: 2, exercise: 13, folder: "2、小有所成" },
    { level: 2, exercise: 14, folder: "2、小有所成" },
    { level: 2, exercise: 16, folder: "2、小有所成" },
    { level: 2, exercise: 20, folder: "2、小有所成" },
    
    // 第3级关键习题
    { level: 3, exercise: 4, folder: "3、渐入佳境" },
    { level: 3, exercise: 6, folder: "3、渐入佳境" },
    { level: 3, exercise: 7, folder: "3、渐入佳境" },
    { level: 3, exercise: 8, folder: "3、渐入佳境" },
    { level: 3, exercise: 9, folder: "3、渐入佳境" },
    { level: 3, exercise: 11, folder: "3、渐入佳境" },
    { level: 3, exercise: 12, folder: "3、渐入佳境" },
    { level: 3, exercise: 15, folder: "3、渐入佳境" }
  ];

  let processed = 0;
  let successful = 0;

  for (const item of keyExercises) {
    const fileIndex = (item.exercise + 1).toString().padStart(2, '0');
    const imagePath = path.join(process.cwd(), 'assessments', item.folder, `${item.folder}_${fileIndex}.jpg`);

    if (fs.existsSync(imagePath)) {
      console.log(`验证第${item.level}级第${item.exercise}题...`);
      processed++;
      
      const requirement = await extractRequirement(imagePath);
      
      if (requirement) {
        const key = `${item.level}-${item.exercise}`;
        requirements[key] = requirement;
        console.log(`  ✓ ${requirement}`);
        successful++;
      } else {
        console.log(`  ✗ 提取失败`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 600));
    }
  }

  // 保存更新的数据
  fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
  
  console.log(`\n批量验证完成！`);
  console.log(`处理: ${processed} 个习题`);
  console.log(`成功: ${successful} 个要求`);
  console.log(`总计: ${Object.keys(requirements).length} 个习题要求`);

  return requirements;
}

batchVerifyExercises().catch(console.error);