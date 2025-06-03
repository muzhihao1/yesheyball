import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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

// 处理Level 2的前10个练习
async function testLevel2Verification() {
  console.log("开始测试Level 2练习描述提取...\n");
  
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = {};
  
  if (fs.existsSync(descriptionsPath)) {
    descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  }
  
  const level = 2;
  const folder = "2、小有所成";
  const testCount = 10; // 只测试前10个
  
  let processed = 0;
  let updated = 0;
  
  for (let exercise = 1; exercise <= testCount; exercise++) {
    const key = `${level}-${exercise}`;
    const current = descriptions[key];
    
    console.log(`\n处理 ${key}...`);
    console.log(`当前描述: "${current || '无'}"`);
    
    const fileIndex = (exercise + 1).toString().padStart(2, '0');
    const imagePath = path.join(
      process.cwd(), 
      'assessments', 
      folder, 
      `${folder}_${fileIndex}.jpg`
    );
    
    if (!fs.existsSync(imagePath)) {
      console.log(`  图片不存在: ${imagePath}`);
      continue;
    }
    
    const extracted = await extractExerciseDescription(imagePath);
    
    if (extracted) {
      console.log(`✓ 提取结果: "${extracted}"`);
      
      // 检查是否需要更新
      if (!current || current.includes('如图摆放球型，白球任意位置') || extracted !== current) {
        descriptions[key] = extracted;
        console.log(`  → 已更新`);
        updated++;
      } else {
        console.log(`  → 无需更新`);
      }
    } else {
      console.log(`✗ 提取失败`);
    }
    
    processed++;
    
    // 避免API限制
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  // 保存结果
  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  
  console.log(`\n=== Level 2 测试完成 ===`);
  console.log(`测试了 ${processed} 个练习`);
  console.log(`更新了 ${updated} 个描述`);
  
  // 显示更新后的结果
  console.log(`\n更新后的Level 2描述:`);
  for (let i = 1; i <= testCount; i++) {
    const key = `${level}-${i}`;
    console.log(`${key}: "${descriptions[key] || '无'}"`);
  }
}

// 运行测试
testLevel2Verification().catch(console.error);