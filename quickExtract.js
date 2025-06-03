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
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract the exact text after '过关要求:' from this billiards exercise image. Return only the requirement text, nothing else."
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` }
            }
          ],
        },
      ],
      max_tokens: 20,
      temperature: 0
    });

    const content = response.choices[0].message.content;
    return content ? content.replace(/[；;。，,\s]+$/, '').trim() : null;
  } catch (error) {
    return null;
  }
}

async function processLevel(level, folderName, count) {
  console.log(`处理等级 ${level}...`);
  const results = {};
  
  for (let i = 1; i <= count; i++) {
    const fileIndex = (i + 1).toString().padStart(2, '0');
    const imagePath = path.join(process.cwd(), 'assessments', folderName, `${folderName}_${fileIndex}.jpg`);
    
    if (fs.existsSync(imagePath)) {
      const requirement = await extractRequirement(imagePath);
      if (requirement) {
        results[`${level}-${i}`] = requirement;
        console.log(`  ${i}: ${requirement}`);
      }
      await new Promise(resolve => setTimeout(resolve, 400));
    }
  }
  
  return results;
}

async function main() {
  console.log("开始快速提取...");
  
  const allResults = {};
  
  // 处理前3个等级，每级15题
  const levels = [
    { level: 1, folder: "1、初窥门径", count: 15 },
    { level: 2, folder: "2、小有所成", count: 15 },
    { level: 3, folder: "3、渐入佳境", count: 15 }
  ];
  
  for (const config of levels) {
    const results = await processLevel(config.level, config.folder, config.count);
    Object.assign(allResults, results);
  }
  
  // 保存结果
  const outputPath = 'client/src/data/exerciseRequirements.json';
  fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2));
  
  console.log(`\n完成！提取了 ${Object.keys(allResults).length} 个习题要求`);
}

main().catch(console.error);