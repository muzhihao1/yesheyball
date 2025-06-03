import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function extractExercise2_3() {
  const imagePath = path.join(
    process.cwd(), 
    'assessments', 
    '2、小有所成', 
    '2、小有所成_04.jpg'  // Exercise 3 corresponds to image 04
  );

  if (!fs.existsSync(imagePath)) {
    console.log(`图片不存在: ${imagePath}`);
    return;
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
              text: "请精确提取图片右侧蓝色区域中'题目说明：'后面的完整文字内容。请逐字逐句准确提取，不要遗漏任何字符。只要题目说明部分。"
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

    const content = response.choices[0].message.content;
    console.log(`原始提取内容: "${content}"`);
    
    // 清理提取的内容
    let cleanContent = content.replace(/^题目说明[：:]\s*/g, '');
    cleanContent = cleanContent.replace(/过关要求.*$/gm, '');
    cleanContent = cleanContent.replace(/[；。]+$/, '');
    cleanContent = cleanContent.trim();
    
    console.log(`清理后的内容: "${cleanContent}"`);
    
    // 更新描述文件
    const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
    let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
    
    const oldDesc = descriptions['2-3'];
    descriptions['2-3'] = cleanContent;
    
    fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
    
    console.log(`\n更新完成:`);
    console.log(`原描述: "${oldDesc}"`);
    console.log(`新描述: "${cleanContent}"`);
    
  } catch (error) {
    console.error(`提取失败: ${error.message}`);
  }
}

extractExercise2_3().catch(console.error);