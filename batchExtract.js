import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function analyzeExerciseImage(imagePath) {
  try {
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "你是台球习题专家。提取图片中'过关要求'后的准确中文内容，只返回要求文字，不要解释。"
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "提取'过关要求'的准确内容"
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` }
            }
          ],
        },
      ],
      max_tokens: 30,
      temperature: 0
    });

    const content = response.choices[0].message.content;
    if (content && !content.includes('无法') && !content.includes('抱歉')) {
      return content.replace(/^过关要求[:：]\s*/, '').replace(/[；;。，,\s]+$/, '').trim();
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function extractSampleRequirements() {
  console.log("批量提取习题过关要求...\n");
  
  const requirementsPath = 'client/src/data/exerciseRequirements.json';
  let requirements = {};
  
  if (fs.existsSync(requirementsPath)) {
    requirements = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
  }

  // 第1级剩余习题 (11-20)
  console.log("处理第1级习题 11-20...");
  for (let i = 11; i <= 20; i++) {
    const fileIndex = (i + 1).toString().padStart(2, '0');
    const imagePath = path.join(process.cwd(), 'assessments', '1、初窥门径', `1、初窥门径_${fileIndex}.jpg`);
    
    if (fs.existsSync(imagePath)) {
      console.log(`  第${i}题...`);
      const requirement = await analyzeExerciseImage(imagePath);
      
      if (requirement) {
        requirements[`1-${i}`] = requirement;
        console.log(`    ✓ ${requirement}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 700));
    }
  }

  // 第2级前10题
  console.log("\n处理第2级习题 1-10...");
  for (let i = 1; i <= 10; i++) {
    const fileIndex = (i + 1).toString().padStart(2, '0');
    const imagePath = path.join(process.cwd(), 'assessments', '2、小有所成', `2、小有所成_${fileIndex}.jpg`);
    
    if (fs.existsSync(imagePath)) {
      console.log(`  第${i}题...`);
      const requirement = await analyzeExerciseImage(imagePath);
      
      if (requirement) {
        requirements[`2-${i}`] = requirement;
        console.log(`    ✓ ${requirement}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 700));
    }
  }

  // 第3级前5题
  console.log("\n处理第3级习题 1-5...");
  for (let i = 1; i <= 5; i++) {
    const fileIndex = (i + 1).toString().padStart(2, '0');
    const imagePath = path.join(process.cwd(), 'assessments', '3、渐入佳境', `3、渐入佳境_${fileIndex}.jpg`);
    
    if (fs.existsSync(imagePath)) {
      console.log(`  第${i}题...`);
      const requirement = await analyzeExerciseImage(imagePath);
      
      if (requirement) {
        requirements[`3-${i}`] = requirement;
        console.log(`    ✓ ${requirement}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 700));
    }
  }

  // 保存结果
  fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
  
  console.log(`\n批量提取完成！`);
  console.log(`总习题数: ${Object.keys(requirements).length}`);
  
  return requirements;
}

extractSampleRequirements().catch(console.error);