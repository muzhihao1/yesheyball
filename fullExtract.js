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
          role: "user",
          content: [
            {
              type: "text",
              text: "从台球习题图片中提取'过关要求'后的中文文字，只返回要求内容。"
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` }
            }
          ],
        },
      ],
      max_tokens: 25,
      temperature: 0
    });

    const content = response.choices[0].message.content;
    return content ? content.replace(/过关要求[:：]\s*/, '').replace(/[；;。，,\s]+$/, '').trim() : null;
  } catch (error) {
    return null;
  }
}

async function extractBatchRequirements() {
  console.log("快速批量提取习题过关要求...\n");
  
  const requirementsPath = 'client/src/data/exerciseRequirements.json';
  let requirements = {};
  
  if (fs.existsSync(requirementsPath)) {
    requirements = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
    console.log(`已有 ${Object.keys(requirements).length} 个习题\n`);
  }

  const batches = [
    // 第1级剩余习题
    { level: 1, folder: "1、初窥门径", start: 11, end: 25 },
    // 第2级习题
    { level: 2, folder: "2、小有所成", start: 1, end: 15 },
    // 第3级习题
    { level: 3, folder: "3、渐入佳境", start: 1, end: 10 }
  ];

  for (const batch of batches) {
    console.log(`处理 ${batch.level}级 第${batch.start}-${batch.end}题`);
    
    for (let i = batch.start; i <= batch.end; i++) {
      const fileIndex = (i + 1).toString().padStart(2, '0');
      const imagePath = path.join(process.cwd(), 'assessments', batch.folder, `${batch.folder}_${fileIndex}.jpg`);
      
      if (fs.existsSync(imagePath)) {
        process.stdout.write(`  ${i}题... `);
        
        const requirement = await analyzeExerciseImage(imagePath);
        
        if (requirement && !requirement.includes('无法') && !requirement.includes('抱歉')) {
          requirements[`${batch.level}-${i}`] = requirement;
          console.log(`✓ ${requirement}`);
        } else {
          console.log(`✗`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // 每批次保存一次
    fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
    console.log(`${batch.level}级已保存\n`);
  }

  console.log(`提取完成！总计 ${Object.keys(requirements).length} 个习题要求`);
  return requirements;
}

extractBatchRequirements().catch(console.error);