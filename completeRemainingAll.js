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

async function completeAll() {
  const requirementsPath = 'client/src/data/exerciseRequirements.json';
  let requirements = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
  
  const startCount = Object.keys(requirements).length;
  console.log(`完成所有剩余验证 - 当前: ${startCount}/415\n`);

  const allLevels = [
    { level: 3, folder: "3、渐入佳境", exercises: 50 },
    { level: 4, folder: "4、炉火纯青", exercises: 60 },
    { level: 5, folder: "5、登堂入室", exercises: 60 },
    { level: 6, folder: "6、超群绝伦", exercises: 60 },
    { level: 7, folder: "7、登峰造极", exercises: 55 },
    { level: 8, folder: "8、出神入化", exercises: 55 }
  ];

  let totalProcessed = 0;
  let totalSuccessful = 0;

  for (const levelInfo of allLevels) {
    const existingCount = Object.keys(requirements).filter(k => k.startsWith(`${levelInfo.level}-`)).length;
    
    if (existingCount < levelInfo.exercises) {
      console.log(`处理 ${levelInfo.folder} (已有${existingCount}/${levelInfo.exercises})...`);
      
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
            console.log(`${key}...`);
            
            const requirement = await extractRequirement(imagePath);
            
            if (requirement) {
              requirements[key] = requirement;
              totalSuccessful++;
              console.log(`  ✓ ${requirement}`);
              
              // 立即保存每个成功的验证
              fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
              const current = Object.keys(requirements).length;
              console.log(`  >> ${current}/415 (${Math.round(current/415*100)}%)\n`);
            }
            
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
      }
      
      const finalLevelCount = Object.keys(requirements).filter(k => k.startsWith(`${levelInfo.level}-`)).length;
      console.log(`${levelInfo.folder} 完成: ${finalLevelCount}/${levelInfo.exercises}\n`);
    }
  }

  const finalCount = Object.keys(requirements).length;
  
  console.log("=".repeat(60));
  console.log("所有验证工作完成");
  console.log("=".repeat(60));
  console.log(`开始: ${startCount}/415`);
  console.log(`结束: ${finalCount}/415 (${Math.round(finalCount/415*100)}%)`);
  console.log(`新增: ${finalCount - startCount} 个习题`);
  
  console.log("\n各等级最终状态:");
  [
    {l:1, t:35, n:'初窥门径'}, {l:2, t:40, n:'小有所成'}, 
    {l:3, t:50, n:'渐入佳境'}, {l:4, t:60, n:'炉火纯青'}, 
    {l:5, t:60, n:'登堂入室'}, {l:6, t:60, n:'超群绝伦'},
    {l:7, t:55, n:'登峰造极'}, {l:8, t:55, n:'出神入化'}
  ].forEach(level => {
    const count = Object.keys(requirements).filter(k => k.startsWith(level.l + '-')).length;
    const percentage = Math.round(count/level.t*100);
    const status = count === level.t ? ' ✓' : '';
    console.log(`等级${level.l} (${level.n}): ${count}/${level.t} (${percentage}%)${status}`);
  });
  
  if (finalCount === 415) {
    console.log("\n台球大师之路应用的所有415个习题过关要求验证完成！");
  }
}

completeAll().catch(console.error);