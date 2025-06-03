import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function extractLevel1Description(exerciseNumber) {
  const fileIndex = (exerciseNumber + 1).toString().padStart(2, '0');
  const imagePath = path.join(
    process.cwd(), 
    'assessments', 
    '1、初窥门径', 
    `1、初窥门径_${fileIndex}.jpg`
  );

  if (!fs.existsSync(imagePath)) {
    console.log(`图片不存在: ${imagePath}`);
    return null;
  }

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
              text: "从图片中提取'题目说明：'后面的完整文字，只要题目说明的内容，不要过关要求："
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
    if (content) {
      content = content.replace(/^题目说明[：:]\s*/g, '');
      content = content.replace(/过关要求[：:].*$/gm, '');
      content = content.replace(/\n.*过关要求.*$/gm, '');
      content = content.replace(/；$/, '');
      content = content.trim();
      
      return content.length > 5 ? content : null;
    }
    return null;
  } catch (error) {
    console.error(`提取失败 1-${exerciseNumber}: ${error.message}`);
    return null;
  }
}

async function testLevel1Process() {
  console.log('测试等级1的提取流程...\n');

  // 测试前10个练习
  for (let i = 1; i <= 10; i++) {
    console.log(`测试练习 1-${i}:`);
    const extracted = await extractLevel1Description(i);
    
    if (extracted) {
      console.log(`  提取结果: "${extracted}"`);
    } else {
      console.log(`  提取失败`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('');
  }

  console.log('前10个练习测试完成');
}

testLevel1Process().catch(console.error);