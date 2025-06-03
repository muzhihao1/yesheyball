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
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "从这张台球习题图片中提取'过关要求'后面的准确中文文字，只返回要求内容，不要其他解释。"
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
    if (content) {
      return content.replace(/过关要求[:：]\s*/, '').replace(/[；;。，,\s]+$/, '').trim();
    }
    return null;
  } catch (error) {
    console.error(`提取失败: ${error.message}`);
    return null;
  }
}

async function processLevel(level, folderName, count) {
  console.log(`\n处理等级 ${level}: ${folderName}`);
  const results = {};
  
  for (let i = 1; i <= count; i++) {
    const fileIndex = (i + 1).toString().padStart(2, '0');
    const imagePath = path.join(process.cwd(), 'assessments', folderName, `${folderName}_${fileIndex}.jpg`);
    
    if (fs.existsSync(imagePath)) {
      console.log(`  习题 ${i}...`);
      const requirement = await extractRequirement(imagePath);
      
      if (requirement) {
        results[`${level}-${i}`] = requirement;
        console.log(`    ✓ ${requirement}`);
      } else {
        console.log(`    ✗ 提取失败`);
      }
      
      // 控制API调用频率
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return results;
}

async function main() {
  console.log("开始快速提取习题过关要求...\n");
  
  const allResults = {};
  
  // 处理等级1的前20个习题
  const level1Results = await processLevel(1, "1、初窥门径", 20);
  Object.assign(allResults, level1Results);
  
  // 处理等级2的前15个习题  
  const level2Results = await processLevel(2, "2、小有所成", 15);
  Object.assign(allResults, level2Results);
  
  // 处理等级3的前10个习题
  const level3Results = await processLevel(3, "3、渐入佳境", 10);
  Object.assign(allResults, level3Results);
  
  // 保存结果
  const outputPath = 'client/src/data/exerciseRequirements.json';
  
  // 备份现有文件
  if (fs.existsSync(outputPath)) {
    const backupPath = outputPath.replace('.json', '_backup.json');
    fs.copyFileSync(outputPath, backupPath);
    console.log(`\n已备份到: ${backupPath}`);
  }
  
  // 保存新结果
  fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2), 'utf8');
  
  console.log(`\n提取完成！`);
  console.log(`成功提取 ${Object.keys(allResults).length} 个习题要求`);
  console.log(`结果保存到: ${outputPath}`);
  
  return allResults;
}

// 执行提取
main().catch(console.error);