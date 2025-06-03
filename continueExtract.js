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

async function continueExtract() {
  const requirementsPath = 'client/src/data/exerciseRequirements.json';
  let requirements = {};
  
  if (fs.existsSync(requirementsPath)) {
    requirements = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
  }

  console.log("继续提取剩余习题的过关要求...\n");

  // 先完成等级2的剩余部分
  const level2Missing = [23, 28, 29, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40];
  console.log("完成等级2剩余习题...");
  
  for (const exercise of level2Missing) {
    const key = `2-${exercise}`;
    if (!requirements[key]) {
      const fileIndex = (exercise + 1).toString().padStart(2, '0');
      const imagePath = path.join(
        process.cwd(), 
        'assessments', 
        '2、小有所成', 
        `2、小有所成_${fileIndex}.jpg`
      );

      if (fs.existsSync(imagePath)) {
        const requirement = await extractRequirement(imagePath);
        
        if (requirement) {
          requirements[key] = requirement;
          console.log(`2-${exercise}: ${requirement}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  // 继续等级3的剩余部分
  console.log("\n完成等级3剩余习题...");
  for (let exercise = 16; exercise <= 50; exercise++) {
    const key = `3-${exercise}`;
    if (!requirements[key]) {
      const fileIndex = (exercise + 1).toString().padStart(2, '0');
      const imagePath = path.join(
        process.cwd(), 
        'assessments', 
        '3、渐入佳境', 
        `3、渐入佳境_${fileIndex}.jpg`
      );

      if (fs.existsSync(imagePath)) {
        const requirement = await extractRequirement(imagePath);
        
        if (requirement) {
          requirements[key] = requirement;
          console.log(`3-${exercise}: ${requirement}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  // 开始等级4
  console.log("\n开始等级4验证...");
  for (let exercise = 1; exercise <= 60; exercise++) {
    const key = `4-${exercise}`;
    if (!requirements[key]) {
      const fileIndex = (exercise + 1).toString().padStart(2, '0');
      const imagePath = path.join(
        process.cwd(), 
        'assessments', 
        '4、炉火纯青', 
        `4、炉火纯青_${fileIndex}.jpg`
      );

      if (fs.existsSync(imagePath)) {
        const requirement = await extractRequirement(imagePath);
        
        if (requirement) {
          requirements[key] = requirement;
          console.log(`4-${exercise}: ${requirement}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  // 保存进度
  fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
  
  const currentTotal = Object.keys(requirements).length;
  console.log(`\n当前验证总数: ${currentTotal}/415 (${Math.round(currentTotal/415*100)}%)`);
  
  // 统计各等级
  const levels = [
    {l:1, t:35, n:'初窥门径'}, {l:2, t:40, n:'小有所成'}, 
    {l:3, t:50, n:'渐入佳境'}, {l:4, t:60, n:'炉火纯青'}
  ];

  console.log("\n当前各等级状态:");
  levels.forEach(level => {
    const count = Object.keys(requirements).filter(k => k.startsWith(level.l + '-')).length;
    const status = count === level.t ? ' ✓' : '';
    console.log(`${level.n}: ${count}/${level.t}${status}`);
  });
}

continueExtract().catch(console.error);