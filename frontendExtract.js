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

async function frontendExtract() {
  const requirementsPath = 'client/src/data/exerciseRequirements.json';
  let requirements = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
  
  const startCount = Object.keys(requirements).length;
  console.log(`前台验证开始 - 当前已验证: ${startCount}/415\n`);

  // 构建待验证列表，按优先级排序
  const pending = [];
  
  // 优先完成等级2剩余的5个
  for (let i = 1; i <= 40; i++) {
    if (!requirements[`2-${i}`]) {
      pending.push({level: 2, exercise: i, folder: "2、小有所成", priority: 1});
    }
  }
  
  // 然后是等级3剩余的35个
  for (let i = 1; i <= 50; i++) {
    if (!requirements[`3-${i}`]) {
      pending.push({level: 3, exercise: i, folder: "3、渐入佳境", priority: 2});
    }
  }
  
  // 接着是等级4全部60个
  for (let i = 1; i <= 60; i++) {
    pending.push({level: 4, exercise: i, folder: "4、炉火纯青", priority: 3});
  }
  
  // 等级5的60个
  for (let i = 1; i <= 60; i++) {
    pending.push({level: 5, exercise: i, folder: "5、登堂入室", priority: 4});
  }

  console.log(`待验证习题总数: ${pending.length} 个\n`);

  let successful = 0;
  let processed = 0;
  
  for (const item of pending) {
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
      console.log(`[${processed}/${pending.length}] 验证 ${key}...`);
      
      const requirement = await extractRequirement(imagePath);
      
      if (requirement) {
        requirements[key] = requirement;
        successful++;
        console.log(`  ✓ ${requirement}`);
        
        // 每验证成功1个就保存，确保不丢失进度
        fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
        
        const currentTotal = Object.keys(requirements).length;
        const progress = Math.round(currentTotal/415*100);
        console.log(`  >> 进度: ${currentTotal}/415 (${progress}%)\n`);
        
      } else {
        console.log(`  ✗ 提取失败\n`);
      }
      
      // 每处理10个显示统计
      if (processed % 10 === 0) {
        const current = Object.keys(requirements).length;
        console.log(`--- 处理了${processed}个，当前总数${current}/415，成功率${Math.round(successful/processed*100)}% ---\n`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  const finalCount = Object.keys(requirements).length;
  const newAdded = finalCount - startCount;
  
  console.log("=".repeat(60));
  console.log("前台验证完成");
  console.log("=".repeat(60));
  console.log(`开始验证数: ${startCount}/415`);
  console.log(`结束验证数: ${finalCount}/415 (${Math.round(finalCount/415*100)}%)`);
  console.log(`本次新增: ${newAdded} 个习题`);
  console.log(`处理成功率: ${Math.round(successful/processed*100)}%`);
  
  if (finalCount === 415) {
    console.log("\n🎉 所有415个习题的过关要求验证完成！");
  } else {
    console.log(`\n还需验证: ${415 - finalCount} 个习题`);
  }
}

frontendExtract().catch(console.error);