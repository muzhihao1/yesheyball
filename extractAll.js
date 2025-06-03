import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function analyzeExerciseImage(imagePath) {
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
      max_tokens: 30,
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

async function extractAllRequirements() {
  console.log("开始验证所有剩余习题的过关要求...\n");
  
  const requirementsPath = 'client/src/data/exerciseRequirements.json';
  let requirements = {};
  
  if (fs.existsSync(requirementsPath)) {
    requirements = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
    console.log(`已加载现有数据，包含 ${Object.keys(requirements).length} 个习题\n`);
  }

  // 需要验证的习题列表
  const exercisesToVerify = [
    // 第1级剩余习题 (21-35)
    ...Array.from({length: 15}, (_, i) => ({level: 1, exercise: i + 21, folder: "1、初窥门径"})),
    // 第2级习题 (3-40)
    ...Array.from({length: 38}, (_, i) => ({level: 2, exercise: i + 3, folder: "2、小有所成"})),
    // 第3级习题 (2-50)
    ...Array.from({length: 49}, (_, i) => ({level: 3, exercise: i + 2, folder: "3、渐入佳境"}))
  ];

  let processed = 0;
  let successful = 0;

  for (const item of exercisesToVerify) {
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
      
      const requirement = await analyzeExerciseImage(imagePath);
      
      if (requirement) {
        const key = `${item.level}-${item.exercise}`;
        requirements[key] = requirement;
        console.log(`  ✓ ${requirement}`);
        successful++;
        
        // 每5个习题保存一次进度
        if (processed % 5 === 0) {
          fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
          console.log(`  (已保存进度: ${successful}/${processed})\n`);
        }
      } else {
        console.log(`  ✗ 提取失败`);
      }
      
      // 控制API调用频率
      await new Promise(resolve => setTimeout(resolve, 800));
      
    } else {
      console.log(`第${item.level}级第${item.exercise}题: 文件不存在`);
    }
  }

  // 最终保存
  fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
  
  console.log("\n" + "=".repeat(60));
  console.log("所有习题过关要求验证完成！");
  console.log("=".repeat(60));
  console.log(`总处理: ${processed} 个习题`);
  console.log(`成功提取: ${successful} 个要求`);
  console.log(`总习题数: ${Object.keys(requirements).length}`);
  
  // 按等级统计
  console.log("\n各等级统计:");
  [1, 2, 3].forEach(level => {
    const levelCount = Object.keys(requirements).filter(key => key.startsWith(`${level}-`)).length;
    console.log(`等级${level}: ${levelCount} 个习题`);
  });

  return requirements;
}

extractAllRequirements().catch(console.error);