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

async function continueExtraction() {
  const requirementsPath = 'client/src/data/exerciseRequirements.json';
  let requirements = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
  
  const startCount = Object.keys(requirements).length;
  console.log(`继续验证 - 当前: ${startCount}/415\n`);

  // 继续处理剩余习题，优先完成低等级
  const todoList = [];
  
  // 等级2剩余
  for (let i = 1; i <= 40; i++) {
    if (!requirements[`2-${i}`]) {
      todoList.push({level: 2, exercise: i, folder: "2、小有所成"});
    }
  }
  
  // 等级3剩余
  for (let i = 1; i <= 50; i++) {
    if (!requirements[`3-${i}`]) {
      todoList.push({level: 3, exercise: i, folder: "3、渐入佳境"});
    }
  }
  
  // 等级4前40个
  for (let i = 1; i <= 40; i++) {
    if (!requirements[`4-${i}`]) {
      todoList.push({level: 4, exercise: i, folder: "4、炉火纯青"});
    }
  }

  console.log(`处理 ${todoList.length} 个剩余习题\n`);

  let successful = 0;
  let processed = 0;
  
  for (const item of todoList) {
    const key = `${item.level}-${item.exercise}`;
    const fileIndex = (item.exercise + 1).toString().padStart(2, '0');
    const imagePath = path.join(
      process.cwd(), 
      'assessments', 
      item.folder, 
      `${item.folder}_${fileIndex}.jpg`
    );

    if (fs.existsSync(imagePath)) {
      processed++;
      console.log(`${processed}/${todoList.length} ${key}`);
      
      const requirement = await extractRequirement(imagePath);
      
      if (requirement) {
        requirements[key] = requirement;
        console.log(`  ✓ ${requirement}`);
        successful++;
        
        // 每2个成功保存一次
        if (successful % 2 === 0) {
          fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
          const current = Object.keys(requirements).length;
          console.log(`  >>> ${current}/415 (${Math.round(current/415*100)}%)\n`);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 150));
    }
  }

  // 最终保存
  fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
  
  const finalCount = Object.keys(requirements).length;
  console.log(`\n验证完成:`);
  console.log(`开始: ${startCount}/415`);
  console.log(`结束: ${finalCount}/415`);
  console.log(`新增: ${finalCount - startCount} 个`);
  console.log(`成功率: ${Math.round(successful/processed*100)}%`);
}

continueExtraction().catch(console.error);