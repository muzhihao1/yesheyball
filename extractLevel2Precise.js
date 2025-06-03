import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function extractLevel2Description(imagePath) {
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
              text: "从图片中提取题目说明的完整准确文字，只要题目说明部分："
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` }
            }
          ],
        },
      ],
      max_tokens: 120,
      temperature: 0
    });

    let content = response.choices[0].message.content;
    if (content && content.length > 8) {
      content = content.replace(/^题目说明[：:]\s*/g, '');
      content = content.replace(/题目说明[：:]/g, '');
      content = content.replace(/过关要求[：:].*$/gm, '');
      content = content.replace(/\n.*过关要求.*$/gm, '');
      content = content.replace(/；$/, '');
      content = content.trim();
      return content;
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function updateLevel2Descriptions() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  console.log('提取等级2所有练习的准确描述...');

  for (let i = 1; i <= 40; i++) {
    const key = `2-${i}`;
    const fileIndex = (i + 1).toString().padStart(2, '0');
    const imagePath = path.join(
      process.cwd(), 
      'assessments', 
      '2、略有小成', 
      `2、略有小成_${fileIndex}.jpg`
    );

    if (fs.existsSync(imagePath)) {
      const extracted = await extractLevel2Description(imagePath);
      const current = descriptions[key];
      
      if (extracted && extracted !== current) {
        descriptions[key] = extracted;
        console.log(`${key}: ${extracted}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (i % 10 === 0) {
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
        console.log(`已处理 ${i}/40 个练习`);
      }
    }
  }

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log('等级2所有描述提取完成');
}

updateLevel2Descriptions().catch(console.error);