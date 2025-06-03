import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function extractExactText(imagePath) {
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
              text: "提取图片中题目说明的完整文字内容："
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` }
            }
          ],
        },
      ],
      max_tokens: 150,
      temperature: 0
    });

    let content = response.choices[0].message.content;
    if (content && content.length > 10) {
      content = content.replace(/^题目说明[：:]\s*/g, '');
      content = content.replace(/过关要求.*$/gm, '');
      content = content.replace(/；$/, '');
      content = content.trim();
      
      if (content.includes('如图') && content.length > 15) {
        return content;
      }
    }
    return null;
  } catch (error) {
    console.error(`提取失败: ${error.message}`);
    return null;
  }
}

async function forceUpdateLevel2() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  console.log('强制更新等级2所有练习描述...');
  let updated = 0;

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
      console.log(`处理 ${key}...`);
      const extracted = await extractExactText(imagePath);
      
      if (extracted) {
        descriptions[key] = extracted;
        console.log(`${key}: ${extracted}`);
        updated++;
      } else {
        console.log(`${key}: 提取失败，保持原有描述`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 400));
      
      if (i % 5 === 0) {
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
        console.log(`已保存到第${i}题`);
      }
    }
  }

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log(`等级2更新完成，成功更新${updated}/40个描述`);
}

forceUpdateLevel2().catch(console.error);