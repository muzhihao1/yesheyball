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

async function processLevel(level, folderName, count) {
  const requirementsPath = 'client/src/data/exerciseRequirements.json';
  let requirements = {};
  
  if (fs.existsSync(requirementsPath)) {
    requirements = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
  }

  console.log(`\n开始处理 ${folderName}...`);
  let successful = 0;

  for (let exercise = 1; exercise <= count; exercise++) {
    const key = `${level}-${exercise}`;
    
    if (!requirements[key]) {
      const fileIndex = (exercise + 1).toString().padStart(2, '0');
      const imagePath = path.join(
        process.cwd(), 
        'assessments', 
        folderName, 
        `${folderName}_${fileIndex}.jpg`
      );

      if (fs.existsSync(imagePath)) {
        const requirement = await extractRequirement(imagePath);
        
        if (requirement) {
          requirements[key] = requirement;
          console.log(`${level}-${exercise}: ${requirement}`);
          successful++;
          
          // 每5个保存一次
          if (successful % 5 === 0) {
            fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
          }
        }
      }
    }
  }

  fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
  const levelCount = Object.keys(requirements).filter(k => k.startsWith(`${level}-`)).length;
  console.log(`${folderName} 完成: ${levelCount}/${count} (新增${successful}个)`);
  
  return successful;
}

async function main() {
  console.log("快速完成所有剩余习题验证...\n");
  
  const levels = [
    { level: 2, folder: "2、小有所成", exercises: 40 },
    { level: 3, folder: "3、渐入佳境", exercises: 50 },
    { level: 4, folder: "4、炉火纯青", exercises: 60 },
    { level: 5, folder: "5、登堂入室", exercises: 60 },
    { level: 6, folder: "6、超群绝伦", exercises: 60 },
    { level: 7, folder: "7、登峰造极", exercises: 55 },
    { level: 8, folder: "8、出神入化", exercises: 55 }
  ];

  let totalNew = 0;
  
  for (const levelInfo of levels) {
    const newCount = await processLevel(levelInfo.level, levelInfo.folder, levelInfo.exercises);
    totalNew += newCount;
  }

  // 最终统计
  const requirementsPath = 'client/src/data/exerciseRequirements.json';
  const requirements = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
  const finalTotal = Object.keys(requirements).length;

  console.log("\n" + "=".repeat(50));
  console.log("验证完成汇总");
  console.log("=".repeat(50));
  console.log(`最终总数: ${finalTotal}/415 (${Math.round(finalTotal/415*100)}%)`);
  console.log(`本次新增: ${totalNew} 个习题`);
  
  console.log("\n各等级最终状态:");
  levels.forEach(levelInfo => {
    const count = Object.keys(requirements).filter(k => k.startsWith(`${levelInfo.level}-`)).length;
    console.log(`等级${levelInfo.level}: ${count}/${levelInfo.exercises}`);
  });
}

main().catch(console.error);