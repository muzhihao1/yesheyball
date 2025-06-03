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

async function continueVerifyAll() {
  const requirementsPath = 'client/src/data/exerciseRequirements.json';
  let requirements = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
  
  const startCount = Object.keys(requirements).length;
  console.log(`继续验证所有剩余习题 - 当前: ${startCount}/415\n`);

  const todoList = [];
  
  // 等级3剩余10个
  for (let i = 1; i <= 50; i++) {
    if (!requirements[`3-${i}`]) {
      todoList.push({level: 3, exercise: i, folder: "3、渐入佳境"});
    }
  }
  
  // 等级4全部60个
  for (let i = 1; i <= 60; i++) {
    todoList.push({level: 4, exercise: i, folder: "4、炉火纯青"});
  }
  
  // 等级5全部60个
  for (let i = 1; i <= 60; i++) {
    todoList.push({level: 5, exercise: i, folder: "5、登堂入室"});
  }
  
  // 等级6全部60个
  for (let i = 1; i <= 60; i++) {
    todoList.push({level: 6, exercise: i, folder: "6、超群绝伦"});
  }
  
  // 等级7全部55个
  for (let i = 1; i <= 55; i++) {
    todoList.push({level: 7, exercise: i, folder: "7、登峰造极"});
  }
  
  // 等级8全部55个
  for (let i = 1; i <= 55; i++) {
    todoList.push({level: 8, exercise: i, folder: "8、出神入化"});
  }

  console.log(`处理 ${todoList.length} 个习题\n`);

  let successful = 0;
  
  for (let i = 0; i < todoList.length; i++) {
    const item = todoList[i];
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
        console.log(`  ${current}/415\n`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 120));
    }
  }

  const finalCount = Object.keys(requirements).length;
  console.log(`验证结果: ${startCount} → ${finalCount}/415`);
  console.log(`新增: ${finalCount - startCount} 个习题`);
  
  if (finalCount === 415) {
    console.log('\n所有415个习题验证完成！');
  }
}

continueVerifyAll().catch(console.error);