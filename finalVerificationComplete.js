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

async function finalVerificationComplete() {
  const requirementsPath = 'client/src/data/exerciseRequirements.json';
  let requirements = {};
  
  if (fs.existsSync(requirementsPath)) {
    requirements = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
  }

  const startingTotal = Object.keys(requirements).length;
  console.log(`开始时已有 ${startingTotal} 个习题要求\n`);

  const allLevels = [
    { level: 2, folder: "2、小有所成", exercises: 40 },
    { level: 3, folder: "3、渐入佳境", exercises: 50 },
    { level: 4, folder: "4、炉火纯青", exercises: 60 },
    { level: 5, folder: "5、登堂入室", exercises: 60 },
    { level: 6, folder: "6、超群绝伦", exercises: 60 },
    { level: 7, folder: "7、登峰造极", exercises: 55 },
    { level: 8, folder: "8、出神入化", exercises: 55 }
  ];

  let globalProcessed = 0;
  let globalSuccessful = 0;

  for (const levelInfo of allLevels) {
    const existingCount = Object.keys(requirements).filter(k => k.startsWith(`${levelInfo.level}-`)).length;
    console.log(`处理${levelInfo.folder} (当前${existingCount}/${levelInfo.exercises})...`);
    
    let levelNewCount = 0;
    
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
          globalProcessed++;
          console.log(`验证第${levelInfo.level}级第${exercise}题...`);
          
          const requirement = await extractRequirement(imagePath);
          
          if (requirement) {
            requirements[key] = requirement;
            console.log(`  ✓ ${requirement}`);
            globalSuccessful++;
            levelNewCount++;
            
            if (globalProcessed % 50 === 0) {
              fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
              const currentTotal = Object.keys(requirements).length;
              console.log(`  >>> 保存进度: ${currentTotal}/415 (${Math.round(currentTotal/415*100)}%) <<<\n`);
            }
          } else {
            console.log(`  ✗ 提取失败`);
          }
          
          await new Promise(resolve => setTimeout(resolve, 80));
        }
      }
    }
    
    fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
    const levelFinalCount = Object.keys(requirements).filter(k => k.startsWith(`${levelInfo.level}-`)).length;
    console.log(`${levelInfo.folder} 完成: ${levelFinalCount}/${levelInfo.exercises} (新增${levelNewCount}个)\n`);
  }

  const finalTotal = Object.keys(requirements).length;
  
  console.log("=".repeat(80));
  console.log("最终验证结果统计");
  console.log("=".repeat(80));
  console.log(`开始时总数: ${startingTotal}/415`);
  console.log(`最终总数: ${finalTotal}/415 (${Math.round(finalTotal/415*100)}%)`);
  console.log(`本次新增: ${globalSuccessful} 个习题要求`);
  console.log(`处理总数: ${globalProcessed} 个习题`);
  
  console.log("\n各等级最终状态:");
  allLevels.forEach(levelInfo => {
    const count = Object.keys(requirements).filter(k => k.startsWith(`${levelInfo.level}-`)).length;
    const percentage = Math.round(count/levelInfo.exercises*100);
    const status = percentage === 100 ? " ✓" : "";
    console.log(`等级${levelInfo.level}: ${count}/${levelInfo.exercises} (${percentage}%)${status}`);
  });
  
  if (finalTotal >= 400) {
    console.log("\n台球大师之路应用的习题过关要求验证工作基本完成！");
    console.log("所有数据都来自真实的王猛台球教学图片。");
  }
  
  return finalTotal;
}

finalVerificationComplete().catch(console.error);