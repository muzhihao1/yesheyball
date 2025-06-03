import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function extractWithMultipleAttempts(imagePath, exerciseNum) {
  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString('base64');
  const prompt = "提取图片中'题目说明：'后面的完整文字内容";

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: [{
          type: "text",
          text: prompt
        }, {
          type: "image_url",
          image_url: { url: `data:image/jpeg;base64,${base64Image}` }
        }]
      }],
      max_tokens: 100,
      temperature: 0
    });

    let content = response.choices[0].message.content;
    if (content && !content.includes('无法') && !content.includes('抱歉')) {
      content = content.replace(/^题目说明[：:]\s*/g, '');
      content = content.replace(/过关要求.*$/gm, '');
      content = content.replace(/[；。]$/, '');
      content = content.trim();
      
      if (content.length > 8) {
        return content;
      }
    }
  } catch (error) {
    console.error(`${exerciseNum} 提取失败: ${error.message}`);
  }

  return null;
}

async function fixAllLevel1Descriptions() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  console.log('批量修正等级1练习描述...');
  
  // 先修正明显有问题的练习
  const problematicExercises = [
    { num: 12, expected: "将白球打进对角底袋" },
    { num: 13, expected: "将白球打进对角底袋" },
    { num: 14, expected: "将白球打进对角底袋" },
    { num: 15, expected: "将白球分别打进两侧底袋" },
    { num: 21, expected: "将白球往后击打，使其吃库后停留在目标区域内" },
    { num: 28, expected: "将1号球打进且白球停留在目标区域内" }
  ];

  let updated = 0;

  for (const exercise of problematicExercises) {
    const key = `1-${exercise.num}`;
    const current = descriptions[key];
    
    console.log(`检查 ${key}: "${current}"`);
    
    const fileIndex = (exercise.num + 1).toString().padStart(2, '0');
    const imagePath = path.join(
      process.cwd(), 
      'assessments', 
      '1、初窥门径', 
      `1、初窥门径_${fileIndex}.jpg`
    );

    if (fs.existsSync(imagePath)) {
      const extracted = await extractWithMultipleAttempts(imagePath, exercise.num);
      
      if (extracted && extracted !== current) {
        descriptions[key] = extracted;
        console.log(`更新为: "${extracted}"`);
        updated++;
      } else if (extracted) {
        console.log(`确认正确`);
      } else {
        // 使用预期的描述作为备选
        if (current.includes('如图示摆放球型，将白球打进指定袋内') && exercise.expected) {
          descriptions[key] = exercise.expected;
          console.log(`使用标准描述: "${exercise.expected}"`);
          updated++;
        }
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  // 修正通用描述
  const genericPatterns = [
    "如图示摆放球型，将目标球击入指定袋内",
    "如图示摆放球型，将白球打进指定袋内"
  ];

  for (let i = 1; i <= 35; i++) {
    const key = `1-${i}`;
    const current = descriptions[key];
    
    if (genericPatterns.some(pattern => current === pattern)) {
      console.log(`处理通用描述 ${key}`);
      
      const fileIndex = (i + 1).toString().padStart(2, '0');
      const imagePath = path.join(
        process.cwd(), 
        'assessments', 
        '1、初窥门径', 
        `1、初窥门径_${fileIndex}.jpg`
      );

      if (fs.existsSync(imagePath)) {
        const extracted = await extractWithMultipleAttempts(imagePath, i);
        
        if (extracted && extracted !== current) {
          descriptions[key] = extracted;
          console.log(`${key} 更新为: "${extracted}"`);
          updated++;
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  }

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  
  console.log(`\n等级1修正完成，更新了 ${updated} 个描述`);
  
  // 显示最终结果
  console.log('\n等级1最终描述:');
  for (let i = 1; i <= 35; i++) {
    const key = `1-${i}`;
    console.log(`${key}: ${descriptions[key]}`);
  }
}

fixAllLevel1Descriptions().catch(console.error);