import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 等级配置 - 基于实际验证的数据
const LEVEL_CONFIGS = [
  { level: 2, folder: "2、小有所成", totalExercises: 40 },
  { level: 3, folder: "3、渐入佳境", totalExercises: 50 },
  { level: 4, folder: "4、游刃有余", totalExercises: 48 },
  { level: 5, folder: "5、炉火纯青", totalExercises: 52 },
  { level: 6, folder: "6、超群绝伦", totalExercises: 62 },
  { level: 7, folder: "7、登峰造极", totalExercises: 72 },
  { level: 8, folder: "8、出神入化", totalExercises: 72 }
];

// 提取练习描述的函数
async function extractExerciseDescription(imagePath) {
  try {
    if (!fs.existsSync(imagePath)) {
      console.log(`图片不存在: ${imagePath}`);
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
              text: `请仔细分析这个台球练习图片，提取其中的练习描述。

要求：
1. 只提取描述球型摆放和练习内容的文字
2. 不要包含"过关要求"、难度等级等信息
3. 保持原文的准确性，不要添加解释
4. 如果图片中有具体的摆球说明，请完整提取
5. 描述应该告诉练习者如何摆放球和进行练习

请只返回练习描述，不要其他内容。`
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
      max_tokens: 300,
      temperature: 0.1
    });

    const description = response.choices[0]?.message?.content?.trim();
    
    if (description && description.length > 5) {
      // 清理描述
      const cleanDescription = description
        .replace(/^["']|["']$/g, '')
        .replace(/^练习描述[:：]\s*/, '')
        .replace(/^描述[:：]\s*/, '')
        .replace(/[。，；;]+$/, '')
        .trim();
      
      return cleanDescription;
    }
    
    return null;
  } catch (error) {
    console.error(`提取失败: ${error.message}`);
    return null;
  }
}

// 共识提取 - 多次提取确保准确性
async function extractWithConsensus(imagePath, exerciseKey) {
  const attempts = 3;
  const results = [];
  
  console.log(`\n对 ${exerciseKey} 进行共识提取...`);
  
  for (let i = 0; i < attempts; i++) {
    const result = await extractExerciseDescription(imagePath);
    if (result) {
      results.push(result);
      console.log(`  尝试 ${i + 1}: ${result.substring(0, 50)}...`);
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  if (results.length === 0) return null;
  
  // 如果有多个结果，选择最常见的或最完整的
  if (results.length >= 2) {
    // 选择最长的描述（通常更详细）
    return results.reduce((longest, current) => 
      current.length > longest.length ? current : longest
    );
  }
  
  return results[0];
}

// 处理单个等级
async function processLevel(levelConfig) {
  console.log(`\n开始处理 Level ${levelConfig.level}: ${levelConfig.folder}`);
  console.log(`总共 ${levelConfig.totalExercises} 个练习`);
  
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = {};
  
  if (fs.existsSync(descriptionsPath)) {
    descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  }
  
  let processed = 0;
  let updated = 0;
  
  for (let exercise = 1; exercise <= levelConfig.totalExercises; exercise++) {
    const key = `${levelConfig.level}-${exercise}`;
    const current = descriptions[key];
    
    // 检查是否需要更新（通用描述或缺失）
    const needsUpdate = !current || 
      current.includes('如图示摆放球型，完成') ||
      current.includes('如图示摆放球型，按要求完成') ||
      current.includes('如图摆放球型，白球任意位置') ||
      current.length < 15;
    
    if (!needsUpdate) {
      console.log(`  ${key}: 已有具体描述，跳过`);
      continue;
    }
    
    const fileIndex = (exercise + 1).toString().padStart(2, '0');
    const imagePath = path.join(
      process.cwd(), 
      'assessments', 
      levelConfig.folder, 
      `${levelConfig.folder}_${fileIndex}.jpg`
    );
    
    if (!fs.existsSync(imagePath)) {
      console.log(`  ${key}: 图片不存在`);
      continue;
    }
    
    console.log(`\n处理 ${key}...`);
    console.log(`当前描述: "${current || '无'}"`);
    
    const extracted = await extractWithConsensus(imagePath, key);
    
    if (extracted && extracted !== current) {
      descriptions[key] = extracted;
      console.log(`✓ 更新为: "${extracted}"`);
      updated++;
    } else if (extracted) {
      console.log(`○ 确认正确: "${extracted}"`);
    } else {
      console.log(`✗ 提取失败`);
    }
    
    processed++;
    
    // 每处理10个练习保存一次
    if (processed % 10 === 0) {
      fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
      console.log(`\n中间保存 - 已处理 ${processed} 个练习`);
    }
    
    // 避免API限制
    await new Promise(resolve => setTimeout(resolve, 1200));
  }
  
  // 保存最终结果
  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  
  console.log(`\nLevel ${levelConfig.level} 处理完成:`);
  console.log(`- 处理了 ${processed} 个练习`);
  console.log(`- 更新了 ${updated} 个描述`);
  
  return { processed, updated };
}

// 主函数 - 处理所有等级
async function verifyAllLevelsDescriptions() {
  console.log("开始验证和更新所有等级的练习描述...\n");
  
  let totalProcessed = 0;
  let totalUpdated = 0;
  
  for (const levelConfig of LEVEL_CONFIGS) {
    try {
      const result = await processLevel(levelConfig);
      totalProcessed += result.processed;
      totalUpdated += result.updated;
      
      // 等级间休息
      console.log(`\n等级 ${levelConfig.level} 完成，休息 5 秒...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      
    } catch (error) {
      console.error(`处理 Level ${levelConfig.level} 时出错:`, error);
      continue;
    }
  }
  
  console.log(`\n=== 全部验证完成 ===`);
  console.log(`总共处理: ${totalProcessed} 个练习`);
  console.log(`总共更新: ${totalUpdated} 个描述`);
  
  // 最终验证结果
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  const descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  console.log(`\n描述文件包含 ${Object.keys(descriptions).length} 个条目`);
}

// 运行验证
verifyAllLevelsDescriptions().catch(console.error);