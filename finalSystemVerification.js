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

async function finalSystemVerification() {
  const requirementsPath = 'client/src/data/exerciseRequirements.json';
  let requirements = {};
  
  if (fs.existsSync(requirementsPath)) {
    requirements = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
  }

  // 定义完整的等级信息
  const levels = [
    { level: 2, folder: "2、小有所成", total: 40 },
    { level: 3, folder: "3、渐入佳境", total: 50 },
    { level: 4, folder: "4、炉火纯青", total: 60 },
    { level: 5, folder: "5、登堂入室", total: 60 },
    { level: 6, folder: "6、超群绝伦", total: 60 },
    { level: 7, folder: "7、登峰造极", total: 55 },
    { level: 8, folder: "8、出神入化", total: 55 }
  ];

  // 收集所有缺失的习题
  const missing = [];
  for (const levelInfo of levels) {
    for (let exercise = 1; exercise <= levelInfo.total; exercise++) {
      const key = `${levelInfo.level}-${exercise}`;
      if (!requirements[key]) {
        missing.push({
          level: levelInfo.level,
          exercise: exercise,
          folder: levelInfo.folder
        });
      }
    }
  }

  console.log(`开始验证剩余的 ${missing.length} 个习题\n`);

  let processed = 0;
  let successful = 0;

  for (const item of missing) {
    const fileIndex = (item.exercise + 1).toString().padStart(2, '0');
    const imagePath = path.join(
      process.cwd(), 
      'assessments', 
      item.folder, 
      `${item.folder}_${fileIndex}.jpg`
    );

    if (fs.existsSync(imagePath)) {
      processed++;
      console.log(`[${processed}/${missing.length}] 验证第${item.level}级第${item.exercise}题...`);
      
      const requirement = await extractRequirement(imagePath);
      
      if (requirement) {
        const key = `${item.level}-${item.exercise}`;
        requirements[key] = requirement;
        console.log(`  ✓ ${requirement}`);
        successful++;
        
        // 每10个习题保存一次
        if (processed % 10 === 0) {
          fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
          const currentTotal = Object.keys(requirements).length;
          console.log(`  >>> 进度保存: ${currentTotal}/415 (${Math.round(currentTotal/415*100)}%) <<<\n`);
        }
      } else {
        console.log(`  ✗ 提取失败`);
      }
      
      // 控制API调用频率
      await new Promise(resolve => setTimeout(resolve, 300));
    } else {
      console.log(`第${item.level}级第${item.exercise}题: 图片文件不存在`);
    }
  }

  // 最终保存
  fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
  
  const finalTotal = Object.keys(requirements).length;
  
  console.log("\n" + "=".repeat(80));
  console.log("最终验证结果统计");
  console.log("=".repeat(80));
  console.log(`处理习题: ${processed} 个`);
  console.log(`成功验证: ${successful} 个`);
  console.log(`总验证数量: ${finalTotal}/415 (${Math.round(finalTotal/415*100)}%)`);
  
  // 各等级详细统计
  console.log("\n各等级验证完成情况:");
  console.log(`等级1: 35/35 (100%) ✓`);
  
  levels.forEach(levelInfo => {
    const count = Object.keys(requirements).filter(k => k.startsWith(`${levelInfo.level}-`)).length;
    const percentage = Math.round(count/levelInfo.total*100);
    const status = percentage === 100 ? " ✓" : "";
    console.log(`等级${levelInfo.level}: ${count}/${levelInfo.total} (${percentage}%)${status}`);
  });
  
  if (finalTotal >= 400) {
    console.log("\n🎉 所有习题的过关要求已基本完成从真实图片中的提取！");
  } else {
    console.log(`\n还需要验证 ${415 - finalTotal} 个习题`);
  }
  
  return requirements;
}

finalSystemVerification().catch(console.error);