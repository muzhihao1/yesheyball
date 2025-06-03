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

async function reliableExtract() {
  const requirementsPath = 'client/src/data/exerciseRequirements.json';
  let requirements = {};
  
  if (fs.existsSync(requirementsPath)) {
    requirements = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
  }

  const startTotal = Object.keys(requirements).length;
  console.log(`开始可靠验证 - 当前已有 ${startTotal}/415 个习题\n`);

  // 定义所有需要处理的习题
  const todos = [];
  
  // 等级2剩余
  for (let i = 1; i <= 40; i++) {
    if (!requirements[`2-${i}`]) {
      todos.push({ level: 2, exercise: i, folder: "2、小有所成" });
    }
  }
  
  // 等级3剩余
  for (let i = 1; i <= 50; i++) {
    if (!requirements[`3-${i}`]) {
      todos.push({ level: 3, exercise: i, folder: "3、渐入佳境" });
    }
  }
  
  // 等级4全部
  for (let i = 1; i <= 60; i++) {
    todos.push({ level: 4, exercise: i, folder: "4、炉火纯青" });
  }
  
  // 等级5全部
  for (let i = 1; i <= 60; i++) {
    todos.push({ level: 5, exercise: i, folder: "5、登堂入室" });
  }

  console.log(`需要验证的习题: ${todos.length} 个\n`);

  let processed = 0;
  let successful = 0;

  for (const todo of todos) {
    const key = `${todo.level}-${todo.exercise}`;
    const fileIndex = (todo.exercise + 1).toString().padStart(2, '0');
    const imagePath = path.join(
      process.cwd(), 
      'assessments', 
      todo.folder, 
      `${todo.folder}_${fileIndex}.jpg`
    );

    if (fs.existsSync(imagePath)) {
      processed++;
      console.log(`处理 ${key}...`);
      
      const requirement = await extractRequirement(imagePath);
      
      if (requirement) {
        requirements[key] = requirement;
        console.log(`  ✓ ${requirement}`);
        successful++;
        
        // 每成功5个就保存一次
        if (successful % 5 === 0) {
          fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
          const current = Object.keys(requirements).length;
          console.log(`  >>> 保存进度: ${current}/415 (${Math.round(current/415*100)}%)\n`);
        }
      } else {
        console.log(`  ✗ 提取失败`);
      }
      
      // 控制频率
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // 处理20个后统计一次
      if (processed % 20 === 0) {
        const current = Object.keys(requirements).length;
        console.log(`--- 已处理 ${processed}/${todos.length}, 当前总数: ${current}/415 ---\n`);
      }
    }
  }

  // 最终保存
  fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
  
  const finalTotal = Object.keys(requirements).length;
  console.log("\n" + "=".repeat(50));
  console.log("本轮验证完成");
  console.log("=".repeat(50));
  console.log(`开始时: ${startTotal}/415`);
  console.log(`结束时: ${finalTotal}/415`);
  console.log(`新增: ${finalTotal - startTotal} 个习题`);
  console.log(`成功率: ${Math.round(successful/processed*100)}%`);
}

reliableExtract().catch(console.error);