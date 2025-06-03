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

// 使用与Level 1相同的共识提取方法
async function extractWithConsensus(imagePath, exerciseKey) {
  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString('base64');

  const prompt = "从图片中提取'题目说明：'后面的完整文字内容，只要题目说明部分，不要过关要求";

  // 前两次提取
  const firstTwoResults = [];
  
  for (let i = 0; i < 2; i++) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
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
        
        if (content.length > 8 && content.length < 120) {
          firstTwoResults.push(content);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`${exerciseKey} 提取${i+1}失败: ${error.message}`);
    }
  }

  // 检查前两次结果是否一致
  if (firstTwoResults.length === 2 && firstTwoResults[0] === firstTwoResults[1]) {
    console.log(`${exerciseKey}: 两次提取一致 - "${firstTwoResults[0]}"`);
    return firstTwoResults[0];
  }

  console.log(`${exerciseKey}: 两次提取不一致，进行第三次验证`);
  if (firstTwoResults[0]) console.log(`  结果1: "${firstTwoResults[0]}"`);
  if (firstTwoResults[1]) console.log(`  结果2: "${firstTwoResults[1]}"`);

  // 第三次提取寻求共识
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
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

    let thirdResult = response.choices[0].message.content;
    if (thirdResult && !thirdResult.includes('无法') && !thirdResult.includes('抱歉')) {
      thirdResult = thirdResult.replace(/^题目说明[：:]\s*/g, '');
      thirdResult = thirdResult.replace(/过关要求.*$/gm, '');
      thirdResult = thirdResult.replace(/；$/, '');
      thirdResult = thirdResult.trim();
      
      console.log(`  结果3: "${thirdResult}"`);
      
      // 在三个结果中寻找共识
      const allResults = [...firstTwoResults, thirdResult].filter(r => r && r.length > 8);
      
      if (allResults.length >= 2) {
        // 检查是否有两个匹配的结果
        for (let i = 0; i < allResults.length; i++) {
          for (let j = i + 1; j < allResults.length; j++) {
            if (allResults[i] === allResults[j]) {
              console.log(`${exerciseKey}: 找到共识 - "${allResults[i]}"`);
              return allResults[i];
            }
          }
        }
      }
      
      // 如果没有共识，返回最长的有效结果
      const validResults = allResults.filter(r => r.length > 10);
      if (validResults.length > 0) {
        const longest = validResults.reduce((a, b) => a.length > b.length ? a : b);
        console.log(`${exerciseKey}: 无共识，选择最长结果 - "${longest}"`);
        return longest;
      }
    }
  } catch (error) {
    console.error(`${exerciseKey} 第三次提取失败: ${error.message}`);
  }

  console.log(`${exerciseKey}: 所有提取尝试失败`);
  return null;
}

// 处理单个等级
async function processLevelWithConsensus(levelConfig) {
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
  console.log("开始使用共识方法验证和更新所有等级的练习描述...\n");
  
  let totalProcessed = 0;
  let totalUpdated = 0;
  
  for (const levelConfig of LEVEL_CONFIGS) {
    try {
      const result = await processLevelWithConsensus(levelConfig);
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

// 运行验证
verifyAllLevelsDescriptions().catch(console.error);