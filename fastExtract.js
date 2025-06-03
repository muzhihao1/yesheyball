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
    console.error(`API错误: ${error.message}`);
    return null;
  }
}

async function processInBatches() {
  const requirementsPath = 'client/src/data/exerciseRequirements.json';
  let requirements = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
  
  const startCount = Object.keys(requirements).length;
  console.log(`快速验证开始 - 当前: ${startCount}/415\n`);

  // 按优先级处理：先完成低等级的剩余部分
  const priorities = [
    // 完成等级2剩余
    ...Array.from({length: 40}, (_, i) => ({
      level: 2, exercise: i + 1, folder: "2、小有所成"
    })).filter(item => !requirements[`${item.level}-${item.exercise}`]),
    
    // 完成等级3剩余  
    ...Array.from({length: 50}, (_, i) => ({
      level: 3, exercise: i + 1, folder: "3、渐入佳境"
    })).filter(item => !requirements[`${item.level}-${item.exercise}`]),
    
    // 开始等级4
    ...Array.from({length: 30}, (_, i) => ({ // 先处理30个
      level: 4, exercise: i + 1, folder: "4、炉火纯青"
    }))
  ];

  console.log(`本轮处理 ${priorities.length} 个习题\n`);

  let successful = 0;
  
  for (let i = 0; i < priorities.length; i++) {
    const item = priorities[i];
    const key = `${item.level}-${item.exercise}`;
    const fileIndex = (item.exercise + 1).toString().padStart(2, '0');
    const imagePath = path.join(
      process.cwd(), 
      'assessments', 
      item.folder, 
      `${item.folder}_${fileIndex}.jpg`
    );

    if (fs.existsSync(imagePath)) {
      console.log(`${i + 1}/${priorities.length} ${key}`);
      
      const requirement = await extractRequirement(imagePath);
      
      if (requirement) {
        requirements[key] = requirement;
        console.log(`  ✓ ${requirement}`);
        successful++;
        
        // 每3个成功就保存
        if (successful % 3 === 0) {
          fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
          const current = Object.keys(requirements).length;
          console.log(`  保存: ${current}/415\n`);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // 最终保存
  fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
  
  const finalCount = Object.keys(requirements).length;
  const progress = Math.round(finalCount/415*100);
  
  console.log(`\n快速验证完成:`);
  console.log(`开始: ${startCount}/415`);
  console.log(`结束: ${finalCount}/415 (${progress}%)`);
  console.log(`新增: ${finalCount - startCount} 个`);
  console.log(`剩余: ${415 - finalCount} 个习题`);
}

processInBatches().catch(console.error);