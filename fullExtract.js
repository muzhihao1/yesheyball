import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// 完整的等级配置，基于实际文件结构
const LEVEL_CONFIGS = [
  { level: 1, folderName: "1、初窥门径", totalFiles: 37 },
  { level: 2, folderName: "2、小有所成", totalFiles: 42 },
  { level: 3, folderName: "3、渐入佳境", totalFiles: 52 },
  { level: 4, folderName: "4、炉火纯青", totalFiles: 62 },
  { level: 5, folderName: "5、登堂入室", totalFiles: 62 },
  { level: 6, folderName: "6、超群绝伦", totalFiles: 62 },
  { level: 7, folderName: "7、登峰造极", totalFiles: 72 }
];

async function analyzeExerciseImage(imagePath) {
  try {
    if (!fs.existsSync(imagePath)) {
      return null;
    }

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
              text: "分析这张台球习题图片，提取过关要求文字。只返回具体要求，如连续完成5次不失误。"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      max_tokens: 50,
    });

    const content = response.choices[0].message.content;
    return content ? content.replace(/[；;。]$/, '').trim() : null;
  } catch (error) {
    console.error(`分析失败: ${error.message}`);
    return null;
  }
}

async function extractBatchRequirements() {
  console.log("开始批量提取习题过关要求...");
  
  const allRequirements = {};
  let totalProcessed = 0;
  
  // 限制处理数量以避免API限制
  const maxPerLevel = 10;
  
  for (const config of LEVEL_CONFIGS.slice(0, 3)) { // 先处理前3个等级
    console.log(`\n处理等级 ${config.level}...`);
    
    const processCount = Math.min(maxPerLevel, config.totalFiles - 2);
    
    for (let i = 0; i < processCount; i++) {
      const fileIndex = (i + 2).toString().padStart(2, '0');
      const exerciseNumber = i + 1;
      const imagePath = path.join(process.cwd(), 'assessments', config.folderName, `${config.folderName}_${fileIndex}.jpg`);
      
      console.log(`  习题 ${exerciseNumber}...`);
      
      try {
        const requirement = await analyzeExerciseImage(imagePath);
        if (requirement) {
          const key = `${config.level}-${exerciseNumber}`;
          allRequirements[key] = requirement;
          console.log(`    ✓ ${requirement}`);
          totalProcessed++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
      } catch (error) {
        console.error(`    ✗ 处理失败`);
      }
    }
  }
  
  // 合并现有数据
  const outputPath = path.join(process.cwd(), 'client/src/data/exerciseRequirements.json');
  let existingData = {};
  if (fs.existsSync(outputPath)) {
    existingData = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
  }
  
  const mergedData = { ...existingData, ...allRequirements };
  fs.writeFileSync(outputPath, JSON.stringify(mergedData, null, 2), 'utf8');
  
  console.log(`\n✅ 提取完成！处理了 ${totalProcessed} 个习题`);
  console.log(`💾 数据已保存`);
}

extractBatchRequirements().catch(console.error);