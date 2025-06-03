import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

const ALL_LEVELS = [
  { level: 2, folder: "2、小有所成", exercises: 40 },
  { level: 3, folder: "3、渐入佳境", exercises: 50 },
  { level: 4, folder: "4、炉火纯青", exercises: 60 },
  { level: 5, folder: "5、登堂入室", exercises: 60 },
  { level: 6, folder: "6、超群绝伦", exercises: 60 },
  { level: 7, folder: "7、登峰造极", exercises: 55 },
  { level: 8, folder: "8、出神入化", exercises: 55 }
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

async function systematicComplete() {
  const requirementsPath = 'client/src/data/exerciseRequirements.json';
  let requirements = {};
  
  if (fs.existsSync(requirementsPath)) {
    requirements = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
  }

  console.log("系统性完成所有剩余验证工作...\n");

  let totalProcessed = 0;
  let totalSuccessful = 0;

  for (const levelInfo of ALL_LEVELS) {
    console.log(`\n开始处理${levelInfo.folder}...`);
    
    let levelProcessed = 0;
    let levelSuccessful = 0;
    
    for (let exercise = 1; exercise <= levelInfo.exercises; exercise++) {
      const key = `${levelInfo.level}-${exercise}`;
      
      if (!requirements[key]) {
        const fileIndex = (exercise + 1).toString().padStart(2, '0');
        const imagePath = path.join(
          process.cwd(), 
          'assessments', 
          levelInfo.folder, 
          `${levelInfo.folder}_${fileIndex}.jpg`
        );

        if (fs.existsSync(imagePath)) {
          totalProcessed++;
          levelProcessed++;
          console.log(`验证第${levelInfo.level}级第${exercise}题...`);
          
          const requirement = await extractRequirement(imagePath);
          
          if (requirement) {
            requirements[key] = requirement;
            console.log(`  ✓ ${requirement}`);
            totalSuccessful++;
            levelSuccessful++;
            
            // 每5个习题保存一次进度
            if (totalProcessed % 5 === 0) {
              fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
              const currentTotal = Object.keys(requirements).length;
              console.log(`  >>> 已保存: ${currentTotal}/415 (${Math.round(currentTotal/415*100)}%) <<<`);
            }
          } else {
            console.log(`  ✗ 提取失败`);
          }
          
          await new Promise(resolve => setTimeout(resolve, 350));
        }
      }
    }
    
    // 每等级完成后保存并统计
    fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
    const levelTotal = Object.keys(requirements).filter(k => k.startsWith(`${levelInfo.level}-`)).length;
    console.log(`${levelInfo.folder} 完成: ${levelTotal}/${levelInfo.exercises} (${Math.round(levelTotal/levelInfo.exercises*100)}%)`);
  }

  // 最终统计
  const finalTotal = Object.keys(requirements).length;
  
  console.log("\n" + "=".repeat(80));
  console.log("所有等级验证任务完成！");
  console.log("=".repeat(80));
  console.log(`总验证数量: ${finalTotal}/415 (${Math.round(finalTotal/415*100)}%)`);
  
  ALL_LEVELS.forEach(levelInfo => {
    const count = Object.keys(requirements).filter(k => k.startsWith(`${levelInfo.level}-`)).length;
    console.log(`等级${levelInfo.level}: ${count}/${levelInfo.exercises} (${Math.round(count/levelInfo.exercises*100)}%)`);
  });
  
  console.log(`\n成功验证: ${totalSuccessful} 个新习题`);
  console.log(`处理总数: ${totalProcessed} 个习题`);
  
  if (finalTotal >= 400) {
    console.log("\n🎉 绝大部分习题的过关要求已从真实图片中提取完成！");
  }
}

systematicComplete().catch(console.error);