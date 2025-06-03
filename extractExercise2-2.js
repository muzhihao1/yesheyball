import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function extractExercise2_2Description() {
  const imagePath = path.join(
    process.cwd(), 
    'assessments', 
    '2、小有所成', 
    '2、小有所成_03.jpg'  // Exercise 2 corresponds to image 03
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
              text: "请仔细查看这个台球练习图片，精确提取左侧蓝色区域中'题目说明：'后面的完整文字内容。请逐字逐句准确提取，不要遗漏任何字符。"
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
    console.log(`提取的题目说明内容: "${content}"`);
    
    // 清理提取的内容
    let cleanContent = content.replace(/^题目说明[：:]\s*/g, '');
    cleanContent = cleanContent.replace(/过关要求.*$/gm, '');
    cleanContent = cleanContent.replace(/[；。]+$/, '');
    cleanContent = cleanContent.trim();
    
    console.log(`清理后的内容: "${cleanContent}"`);
    
    // 更新描述文件
    const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
    let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
    
    const oldDesc = descriptions['2-2'];
    descriptions['2-2'] = cleanContent;
    
    fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
    
    console.log(`\n更新完成:`);
    console.log(`原描述: "${oldDesc}"`);
    console.log(`新描述: "${cleanContent}"`);
    
  } catch (error) {
    console.error(`提取失败: ${error.message}`);
  }
}

extractExercise2_2Description().catch(console.error);