import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function extractExactFormat(imagePath) {
  try {
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "请一字不差地提取台球练习图片中'题目说明'部分的完整文字内容，包括完整的格式和标点符号。"
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "请精确提取题目说明的完整文字，保持原有格式："
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
    if (content && !content.includes('无法') && !content.includes('抱歉')) {
      return content.replace(/^题目说明[:：]\s*/, '').trim();
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function verifyFormatAccuracy() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  console.log('验证习题描述的精确格式...');

  // 重点验证格式可能不同的习题
  const keyExercises = [1, 4, 5, 11, 15, 16, 17, 18, 19, 20, 29, 30, 31];
  
  for (const exerciseNum of keyExercises) {
    const key = `1-${exerciseNum}`;
    const fileIndex = (exerciseNum + 1).toString().padStart(2, '0');
    const imagePath = path.join(
      process.cwd(), 
      'assessments', 
      '1、初窥门径', 
      `1、初窥门径_${fileIndex}.jpg`
    );

    if (fs.existsSync(imagePath)) {
      console.log(`验证格式 ${key}`);
      
      const extractedFormat = await extractExactFormat(imagePath);
      const currentDesc = descriptions[key];
      
      if (extractedFormat) {
        if (extractedFormat !== currentDesc) {
          console.log(`  需要更新: "${currentDesc}" -> "${extractedFormat}"`);
          descriptions[key] = extractedFormat;
        } else {
          console.log(`  ✓ 格式正确: "${currentDesc}"`);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 600));
    }
  }

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log('格式验证完成');
  
  // 分析格式模式
  const level1Descriptions = Object.entries(descriptions)
    .filter(([key]) => key.startsWith('1-'))
    .map(([key, desc]) => desc);
  
  const withPrefix = level1Descriptions.filter(desc => desc.startsWith('如图示摆放球型')).length;
  const withoutPrefix = level1Descriptions.length - withPrefix;
  
  console.log(`\n格式统计:`);
  console.log(`- 带"如图示摆放球型"前缀: ${withPrefix}个`);
  console.log(`- 不带前缀: ${withoutPrefix}个`);
}

verifyFormatAccuracy().catch(console.error);