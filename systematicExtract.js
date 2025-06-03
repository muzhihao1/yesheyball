import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// 系统性提取所有习题的过关要求
const LEVEL_CONFIGS = [
  { level: 1, folderName: "1、初窥门径", totalFiles: 37 },
  { level: 2, folderName: "2、小有所成", totalFiles: 42 },
  { level: 3, folderName: "3、渐入佳境", totalFiles: 52 }
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
          role: "system",
          content: "你是一个专门识别台球习题图片中过关要求的AI。请准确提取图片中过关要求部分的文字，只返回具体要求内容，不要添加任何解释。"
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "请提取这张台球习题图片中过关要求的准确文字内容。"
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
      max_tokens: 30,
      temperature: 0
    });

    const content = response.choices[0].message.content;
    return content ? content.replace(/[；;。，,\s]+$/, '').trim() : null;
  } catch (error) {
    console.error(`分析失败: ${error.message}`);
    return null;
  }
}

async function systematicExtractAll() {
  console.log("开始系统性提取所有习题过关要求...\n");
  
  const allRequirements = {};
  let totalProcessed = 0;
  let totalFailed = 0;
  
  for (const config of LEVEL_CONFIGS) {
    console.log(`处理等级 ${config.level}: ${config.folderName}`);
    
    // 从第2个文件开始，对应第1题
    const processCount = Math.min(20, config.totalFiles - 2); // 限制处理数量
    
    for (let i = 0; i < processCount; i++) {
      const fileIndex = (i + 2).toString().padStart(2, '0');
      const exerciseNumber = i + 1;
      const imagePath = path.join(process.cwd(), 'assessments', config.folderName, `${config.folderName}_${fileIndex}.jpg`);
      
      console.log(`  第${exerciseNumber}题 (${fileIndex}.jpg)...`);
      
      try {
        const requirement = await analyzeExerciseImage(imagePath);
        if (requirement) {
          const key = `${config.level}-${exerciseNumber}`;
          allRequirements[key] = requirement;
          console.log(`    ✓ ${requirement}`);
          totalProcessed++;
        } else {
          console.log(`    ✗ 提取失败`);
          totalFailed++;
        }
        
        // 控制API调用频率
        await new Promise(resolve => setTimeout(resolve, 600));
        
      } catch (error) {
        console.log(`    ✗ 错误: ${error.message}`);
        totalFailed++;
      }
    }
    
    console.log(`等级${config.level}完成\n`);
  }
  
  // 保存结果
  const outputPath = path.join(process.cwd(), 'client/src/data/exerciseRequirements.json');
  fs.writeFileSync(outputPath, JSON.stringify(allRequirements, null, 2), 'utf8');
  
  console.log(`======= 提取完成 =======`);
  console.log(`成功提取: ${totalProcessed} 题`);
  console.log(`提取失败: ${totalFailed} 题`);
  console.log(`数据已保存到: exerciseRequirements.json`);
  
  return allRequirements;
}

systematicExtractAll().catch(console.error);