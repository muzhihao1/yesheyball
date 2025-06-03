import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 所有等级配置
const LEVEL_CONFIGS = [
  { level: 2, folder: "2、小有所成", totalExercises: 40 },
  { level: 3, folder: "3、渐入佳境", totalExercises: 50 },
  { level: 4, folder: "4、游刃有余", totalExercises: 48 },
  { level: 5, folder: "5、炉火纯青", totalExercises: 52 },
  { level: 6, folder: "6、超群绝伦", totalExercises: 62 },
  { level: 7, folder: "7、登峰造极", totalExercises: 72 },
  { level: 8, folder: "8、出神入化", totalExercises: 72 }
];

async function extractExerciseDescription(imagePath) {
  try {
    if (!fs.existsSync(imagePath)) {
      return null;
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `请分析这个台球练习图片，提取练习描述部分的文字。

要求：
1. 只提取描述球型摆放和练习方法的文字
2. 不要包含"过关要求"或难度描述
3. 保持原文准确性
4. 描述应该指导如何摆球和练习

只返回练习描述。`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 250,
      temperature: 0.1
    });

    const description = response.choices[0]?.message?.content?.trim();
    
    if (description && description.length > 8) {
      return description
        .replace(/^["']|["']$/g, '')
        .replace(/^练习描述[:：]\s*/, '')
        .replace(/[。，；;]+$/, '')
        .trim();
    }
    
    return null;
  } catch (error) {
    console.error(`提取失败: ${error.message}`);
    return null;
  }
}

async function processLevelInBatch(levelConfig, batchSize = 5) {
  console.log(`\n处理 Level ${levelConfig.level}: ${levelConfig.folder}`);
  console.log(`总共 ${levelConfig.totalExercises} 个练习`);
  
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = {};
  
  if (fs.existsSync(descriptionsPath)) {
    descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  }
  
  let updated = 0;
  let processed = 0;
  
  // 分批处理
  for (let startEx = 1; startEx <= levelConfig.totalExercises; startEx += batchSize) {
    const endEx = Math.min(startEx + batchSize - 1, levelConfig.totalExercises);
    console.log(`\n处理练习 ${startEx}-${endEx}...`);
    
    const batch = [];
    
    for (let exercise = startEx; exercise <= endEx; exercise++) {
      const key = `${levelConfig.level}-${exercise}`;
      const current = descriptions[key];
      
      // 检查是否需要更新
      const needsUpdate = !current || 
        current.includes('如图示摆放球型，完成') ||
        current.includes('如图示摆放球型，按要求完成') ||
        current.includes('如图摆放球型，白球任意位置') ||
        current.length < 15;
      
      if (needsUpdate) {
        const fileIndex = (exercise + 1).toString().padStart(2, '0');
        const imagePath = path.join(
          process.cwd(), 
          'assessments', 
          levelConfig.folder, 
          `${levelConfig.folder}_${fileIndex}.jpg`
        );
        
        batch.push({ key, exercise, imagePath, current });
      }
    }
    
    // 处理这一批
    for (const item of batch) {
      if (fs.existsSync(item.imagePath)) {
        process.stdout.write(`  ${item.key}... `);
        
        const extracted = await extractExerciseDescription(item.imagePath);
        
        if (extracted) {
          descriptions[item.key] = extracted;
          console.log(`✓ ${extracted.substring(0, 40)}...`);
          updated++;
        } else {
          console.log(`✗ 失败`);
        }
        
        processed++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // 每批保存一次
    fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
    console.log(`批次完成，已保存 - 更新了 ${updated} 个描述`);
    
    // 批次间休息
    if (endEx < levelConfig.totalExercises) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log(`Level ${levelConfig.level} 完成: 处理 ${processed} 个，更新 ${updated} 个`);
  return { processed, updated };
}

async function updateAllLevelsDescriptions() {
  console.log("开始系统性更新所有等级的练习描述...\n");
  
  let totalProcessed = 0;
  let totalUpdated = 0;
  
  for (const levelConfig of LEVEL_CONFIGS) {
    try {
      const result = await processLevelInBatch(levelConfig);
      totalProcessed += result.processed;
      totalUpdated += result.updated;
      
      console.log(`\n等级 ${levelConfig.level} 完成，休息 3 秒...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (error) {
      console.error(`处理 Level ${levelConfig.level} 时出错:`, error);
      continue;
    }
  }
  
  console.log(`\n=== 全部更新完成 ===`);
  console.log(`总共处理: ${totalProcessed} 个练习`);
  console.log(`总共更新: ${totalUpdated} 个描述`);
  
  // 验证结果
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  const descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  console.log(`\n描述文件现包含 ${Object.keys(descriptions).length} 个条目`);
  
  // 显示每个等级的更新状态
  console.log(`\n各等级描述状态:`);
  for (const config of LEVEL_CONFIGS) {
    let authentic = 0;
    let generic = 0;
    
    for (let i = 1; i <= config.totalExercises; i++) {
      const key = `${config.level}-${i}`;
      const desc = descriptions[key];
      
      if (desc && !desc.includes('如图示摆放球型') && !desc.includes('如图摆放球型，白球任意位置')) {
        authentic++;
      } else {
        generic++;
      }
    }
    
    console.log(`  Level ${config.level}: ${authentic} 个真实描述, ${generic} 个通用描述`);
  }
}

// 启动更新
updateAllLevelsDescriptions().catch(console.error);