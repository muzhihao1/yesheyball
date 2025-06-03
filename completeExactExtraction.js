import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function extractExactDescription(imagePath) {
  try {
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "你是专业的台球教练。请精确提取图片中'题目说明'部分的完整文字内容，一字不差地返回原文，不要添加任何解释或修改。"
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "请提取这张台球练习图片中'题目说明'的完整准确文字："
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

    const content = response.choices[0].message.content;
    if (content && !content.includes('无法') && !content.includes('抱歉') && !content.includes('看不清')) {
      return content
        .replace(/^题目说明[:：]\s*/, '')
        .replace(/[；;。，,\s]+$/, '')
        .trim();
    }
    return null;
  } catch (error) {
    console.error(`提取错误: ${error.message}`);
    return null;
  }
}

async function updateAllLevel1Descriptions() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  console.log('开始精确提取等级1所有35个习题的题目说明...');

  for (let i = 1; i <= 35; i++) {
    const key = `1-${i}`;
    const fileIndex = (i + 1).toString().padStart(2, '0');
    const imagePath = path.join(
      process.cwd(), 
      'assessments', 
      '1、初窥门径', 
      `1、初窥门径_${fileIndex}.jpg`
    );

    if (fs.existsSync(imagePath)) {
      console.log(`提取 ${key}: ${imagePath}`);
      
      const description = await extractExactDescription(imagePath);
      
      if (description) {
        descriptions[key] = description;
        console.log(`  ✓ ${description}`);
      } else {
        console.log(`  ✗ 提取失败，保持现有描述`);
      }
      
      // 控制API调用频率
      await new Promise(resolve => setTimeout(resolve, 800));
    } else {
      console.log(`文件不存在: ${imagePath}`);
    }
    
    // 每10个保存一次进度
    if (i % 10 === 0) {
      fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
      console.log(`已保存前${i}个习题的描述更新`);
    }
  }

  // 最终保存
  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log('等级1所有35个习题的题目说明提取完成！');
  
  // 显示提取结果统计
  const level1Descriptions = Object.entries(descriptions)
    .filter(([key]) => key.startsWith('1-'))
    .map(([key, desc]) => ({ key, desc }));
  
  console.log('\n等级1习题描述统计:');
  const uniqueDescs = [...new Set(level1Descriptions.map(item => item.desc))];
  uniqueDescs.forEach((desc, index) => {
    const count = level1Descriptions.filter(item => item.desc === desc).length;
    console.log(`  ${index + 1}. "${desc}" (${count}个习题)`);
  });
}

updateAllLevel1Descriptions().catch(console.error);