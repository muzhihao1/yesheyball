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

async function acceleratedVerify() {
  const requirementsPath = 'client/src/data/exerciseRequirements.json';
  let requirements = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
  
  const startCount = Object.keys(requirements).length;
  console.log(`加速验证 - 当前: ${startCount}/415\n`);

  // 优先完成等级3，然后等级4
  const targets = [];
  
  // 等级3剩余26个
  for (let i = 1; i <= 50; i++) {
    if (!requirements[`3-${i}`]) {
      targets.push({level: 3, exercise: i, folder: "3、渐入佳境"});
    }
  }
  
  // 等级4前40个
  for (let i = 1; i <= 40; i++) {
    targets.push({level: 4, exercise: i, folder: "4、炉火纯青"});
  }

  console.log(`本轮处理 ${targets.length} 个习题\n`);

  let successful = 0;
  
  for (let i = 0; i < targets.length; i++) {
    const item = targets[i];
    const key = `${item.level}-${item.exercise}`;
    const fileIndex = (item.exercise + 1).toString().padStart(2, '0');
    const imagePath = path.join(
      process.cwd(), 
      'assessments', 
      item.folder, 
      `${item.folder}_${fileIndex}.jpg`
    );

    if (fs.existsSync(imagePath)) {
      console.log(`${key}`);
      
      const requirement = await extractRequirement(imagePath);
      
      if (requirement) {
        requirements[key] = requirement;
        successful++;
        console.log(`  ✓ ${requirement}`);
        
        fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
        const current = Object.keys(requirements).length;
        console.log(`  ${current}/415 (${Math.round(current/415*100)}%)\n`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 120));
    }
  }

  const finalCount = Object.keys(requirements).length;
  console.log(`验证结果: ${startCount} → ${finalCount}/415`);
  console.log(`新增: ${finalCount - startCount} 个习题`);
  
  // 统计各等级完成情况
  console.log('\n各等级状态:');
  [
    {l:1, t:35, n:'初窥门径'}, {l:2, t:40, n:'小有所成'}, 
    {l:3, t:50, n:'渐入佳境'}, {l:4, t:60, n:'炉火纯青'}, 
    {l:5, t:60, n:'登堂入室'}
  ].forEach(level => {
    const count = Object.keys(requirements).filter(k => k.startsWith(level.l + '-')).length;
    const status = count === level.t ? ' ✓' : '';
    console.log(`等级${level.l}: ${count}/${level.t}${status}`);
  });
}

acceleratedVerify().catch(console.error);