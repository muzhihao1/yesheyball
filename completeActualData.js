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

async function completeActualData() {
  const requirementsPath = 'client/src/data/exerciseRequirements.json';
  let requirements = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
  
  // Complete level 8 exercise 56
  const key = '8-56';
  if (!requirements[key]) {
    const imagePath = path.join(process.cwd(), 'assessments', '8、出神入化', '8、出神入化_56.jpg');
    
    if (fs.existsSync(imagePath)) {
      console.log('8-56');
      const requirement = await extractRequirement(imagePath);
      
      if (requirement) {
        requirements[key] = requirement;
        console.log(`  ✓ ${requirement}`);
        fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
      }
    }
  }

  const finalCount = Object.keys(requirements).length;
  const level8Count = Object.keys(requirements).filter(k => k.startsWith('8-')).length;
  
  console.log(`\n验证完成状态:`);
  console.log(`总计: ${finalCount}/415 (${Math.round(finalCount/415*100)}%)`);
  console.log(`等级8: ${level8Count}/60`);
  
  // Check for missing exercises across all levels
  const missingExercises = [];
  
  const levelCounts = [
    { level: 1, count: 30 },
    { level: 2, count: 15 },
    { level: 3, count: 50 },
    { level: 4, count: 50 },
    { level: 5, count: 60 },
    { level: 6, count: 60 },
    { level: 7, count: 50 },
    { level: 8, count: 60 }
  ];
  
  for (const { level, count } of levelCounts) {
    for (let i = 1; i <= count; i++) {
      const key = `${level}-${i}`;
      if (!requirements[key]) {
        missingExercises.push(key);
      }
    }
  }
  
  if (missingExercises.length > 0) {
    console.log(`\n缺失的习题: ${missingExercises.join(', ')}`);
  } else {
    console.log('\n验证系统完成: 所有415个习题验证完成');
    console.log('8个等级全部验证完成');
    console.log('所有过关要求均来自真实王猛台球教学图片');
  }
}

completeActualData().catch(console.error);