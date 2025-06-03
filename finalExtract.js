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
    return null;
  }
}

async function finalExtract() {
  const requirementsPath = 'client/src/data/exerciseRequirements.json';
  let requirements = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
  
  const startCount = Object.keys(requirements).length;
  console.log(`最终验证阶段 - 当前: ${startCount}/415\n`);

  const allLevels = [
    { level: 2, folder: "2、小有所成", exercises: 40 },
    { level: 3, folder: "3、渐入佳境", exercises: 50 },
    { level: 4, folder: "4、炉火纯青", exercises: 60 },
    { level: 5, folder: "5、登堂入室", exercises: 60 },
    { level: 6, folder: "6、超群绝伦", exercises: 60 },
    { level: 7, folder: "7、登峰造极", exercises: 55 },
    { level: 8, folder: "8、出神入化", exercises: 55 }
  ];

  let totalNew = 0;

  for (const levelInfo of allLevels) {
    const existingCount = Object.keys(requirements).filter(k => k.startsWith(`${levelInfo.level}-`)).length;
    
    if (existingCount < levelInfo.exercises) {
      console.log(`处理 ${levelInfo.folder} (${existingCount}/${levelInfo.exercises})...`);
      
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
            const requirement = await extractRequirement(imagePath);
            
            if (requirement) {
              requirements[key] = requirement;
              totalNew++;
              console.log(`${key}: ${requirement}`);
              
              if (totalNew % 5 === 0) {
                fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
                const current = Object.keys(requirements).length;
                console.log(`--- 保存进度: ${current}/415 (${Math.round(current/415*100)}%) ---\n`);
              }
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }
    }
  }

  fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
  
  const finalCount = Object.keys(requirements).length;
  const finalProgress = Math.round(finalCount/415*100);
  
  console.log("\n" + "=".repeat(60));
  console.log("验证工作汇总");
  console.log("=".repeat(60));
  console.log(`开始: ${startCount}/415`);
  console.log(`结束: ${finalCount}/415 (${finalProgress}%)`);
  console.log(`新增: ${totalNew} 个习题`);
  
  console.log("\n各等级完成情况:");
  allLevels.forEach(levelInfo => {
    const count = Object.keys(requirements).filter(k => k.startsWith(`${levelInfo.level}-`)).length;
    const percentage = Math.round(count/levelInfo.exercises*100);
    const status = count === levelInfo.exercises ? ' ✓' : '';
    console.log(`等级${levelInfo.level}: ${count}/${levelInfo.exercises} (${percentage}%)${status}`);
  });
  
  if (finalCount === 415) {
    console.log("\n🎯 所有415个习题的过关要求验证完成！");
  } else {
    console.log(`\n还需验证: ${415 - finalCount} 个习题`);
  }
}

finalExtract().catch(console.error);