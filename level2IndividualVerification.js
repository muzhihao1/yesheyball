import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Level 2配置
const LEVEL_CONFIG = {
  level: 2,
  folder: "2、小有所成",
  totalExercises: 40
};

// 使用共识提取方法
async function extractWithConsensus(imagePath, exerciseKey) {
  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString('base64');

  const prompt = "从图片中提取'题目说明：'后面的完整文字内容，只要题目说明部分，不要过关要求";

  const results = [];
  
  // 进行两次提取
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
          results.push(content);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.error(`${exerciseKey} 提取${i+1}失败: ${error.message}`);
    }
  }

  // 检查两次结果是否一致
  if (results.length === 2 && results[0] === results[1]) {
    return results[0];
  }

  // 如果不一致，进行第三次提取
  if (results.length > 0) {
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
        
        if (thirdResult.length > 8) {
          results.push(thirdResult);
        }
        
        // 寻找共识
        for (let i = 0; i < results.length; i++) {
          for (let j = i + 1; j < results.length; j++) {
            if (results[i] === results[j]) {
              return results[i];
            }
          }
        }
        
        // 返回最长的描述
        return results.reduce((a, b) => a.length > b.length ? a : b);
      }
    } catch (error) {
      console.error(`${exerciseKey} 第三次提取失败: ${error.message}`);
    }
  }

  return null;
}

// 逐个验证Level 2练习
async function verifyLevel2Individual() {
  console.log(`开始逐个验证 Level ${LEVEL_CONFIG.level} 练习描述...\n`);
  
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = {};
  
  if (fs.existsSync(descriptionsPath)) {
    descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  }
  
  let processed = 0;
  let updated = 0;
  const needsReview = [];
  
  for (let exercise = 1; exercise <= LEVEL_CONFIG.totalExercises; exercise++) {
    const key = `${LEVEL_CONFIG.level}-${exercise}`;
    const current = descriptions[key];
    
    console.log(`\n=== 处理 ${key} ===`);
    console.log(`当前描述: "${current || '无'}"`);
    
    // 检查是否需要更新
    const needsUpdate = !current || 
      current.includes('如图摆放球型，白球任意位置') ||
      current.length < 15;
    
    if (!needsUpdate) {
      console.log(`✓ 已有具体描述，跳过`);
      continue;
    }
    
    const fileIndex = (exercise + 1).toString().padStart(2, '0');
    const imagePath = path.join(
      process.cwd(), 
      'assessments', 
      LEVEL_CONFIG.folder, 
      `${LEVEL_CONFIG.folder}_${fileIndex}.jpg`
    );
    
    if (!fs.existsSync(imagePath)) {
      console.log(`✗ 图片不存在: ${imagePath}`);
      continue;
    }
    
    console.log(`正在提取描述...`);
    
    const extracted = await extractWithConsensus(imagePath, key);
    
    if (extracted) {
      if (extracted !== current) {
        descriptions[key] = extracted;
        console.log(`✓ 更新为: "${extracted}"`);
        updated++;
      } else {
        console.log(`○ 确认正确: "${extracted}"`);
      }
    } else {
      console.log(`✗ 提取失败`);
      needsReview.push(key);
    }
    
    processed++;
    
    // 每处理5个练习保存一次
    if (processed % 5 === 0) {
      fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
      console.log(`\n中间保存 - 已处理 ${processed} 个练习`);
    }
    
    // 避免API限制
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  // 保存最终结果
  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  
  console.log(`\n=== Level ${LEVEL_CONFIG.level} 验证完成 ===`);
  console.log(`处理了 ${processed} 个练习`);
  console.log(`更新了 ${updated} 个描述`);
  
  if (needsReview.length > 0) {
    console.log(`\n需要手动检查的练习: ${needsReview.join(', ')}`);
  }
  
  // 显示更新后的所有Level 2描述
  console.log(`\n=== Level ${LEVEL_CONFIG.level} 所有描述 ===`);
  for (let i = 1; i <= LEVEL_CONFIG.totalExercises; i++) {
    const key = `${LEVEL_CONFIG.level}-${i}`;
    const desc = descriptions[key] || '无';
    const status = desc.includes('如图摆放球型，白球任意位置') ? '[通用]' : '[具体]';
    console.log(`${key}: ${status} "${desc}"`);
  }
  
  // 统计
  const authenticCount = Object.keys(descriptions)
    .filter(k => k.startsWith(`${LEVEL_CONFIG.level}-`))
    .filter(k => {
      const desc = descriptions[k];
      return desc && !desc.includes('如图摆放球型，白球任意位置') && desc.length > 15;
    }).length;
  
  console.log(`\n统计结果: ${authenticCount}/${LEVEL_CONFIG.totalExercises} 个练习有具体描述`);
}

// 运行验证
verifyLevel2Individual().catch(console.error);