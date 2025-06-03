import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function extractSingleDescription(exerciseNum) {
  const fileIndex = (exerciseNum + 1).toString().padStart(2, '0');
  const imagePath = path.join(
    process.cwd(), 
    'assessments', 
    '2、小有所成', 
    `2、小有所成_${fileIndex}.jpg`
  );

  if (!fs.existsSync(imagePath)) {
    console.log(`图片不存在: ${imagePath}`);
    return null;
  }

  try {
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "从图片中精确提取'题目说明：'后面的完整文字内容，只要题目说明部分，不要过关要求部分"
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` }
            }
          ],
        },
      ],
      max_tokens: 100,
      temperature: 0
    });

    let content = response.choices[0].message.content;
    if (content && !content.includes('无法') && !content.includes('抱歉')) {
      content = content.replace(/^题目说明[：:]\s*/g, '');
      content = content.replace(/过关要求.*$/gm, '');
      content = content.replace(/；$/, '');
      content = content.trim();
      
      return content.length > 8 ? content : null;
    }
    return null;
  } catch (error) {
    console.error(`提取失败: ${error.message}`);
    return null;
  }
}

async function updateLevel2Manually() {
  console.log("手动逐个更新Level 2练习描述...\n");
  
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  // 手动更新前10个练习
  for (let exercise = 1; exercise <= 10; exercise++) {
    const key = `2-${exercise}`;
    
    console.log(`处理 ${key}...`);
    
    const extracted = await extractSingleDescription(exercise);
    
    if (extracted) {
      descriptions[key] = extracted;
      console.log(`  更新为: "${extracted}"`);
    } else {
      console.log(`  提取失败`);
    }
    
    // 立即保存每个更新
    fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log("\n前10个练习处理完成");
  
  // 显示更新结果
  console.log("\n更新后的Level 2描述:");
  for (let i = 1; i <= 10; i++) {
    const key = `2-${i}`;
    console.log(`${key}: "${descriptions[key]}"`);
  }
}

updateLevel2Manually().catch(console.error);