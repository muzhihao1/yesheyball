import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function extractSingleExercise(exerciseNum) {
  const fileIndex = (exerciseNum + 1).toString().padStart(2, '0');
  const imagePath = path.join(
    process.cwd(), 
    'assessments', 
    '1、初窥门径', 
    `1、初窥门径_${fileIndex}.jpg`
  );

  if (!fs.existsSync(imagePath)) {
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
              text: "提取题目说明的文字内容："
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` }
            }
          ],
        },
      ],
      max_tokens: 80,
      temperature: 0
    });

    let content = response.choices[0].message.content;
    if (content && !content.includes('无法') && !content.includes('抱歉')) {
      content = content.replace(/^题目说明[：:]\s*/g, '');
      content = content.replace(/过关要求.*$/gm, '');
      content = content.replace(/；$/, '');
      return content.trim();
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function verifySpecificExercises() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  // 需要特别验证的练习
  const exercisesToVerify = [32, 34];

  console.log('验证特定等级1练习...');

  for (const exerciseNum of exercisesToVerify) {
    const key = `1-${exerciseNum}`;
    const current = descriptions[key];
    
    console.log(`验证 ${key}:`);
    console.log(`  当前: ${current}`);
    
    const extracted = await extractSingleExercise(exerciseNum);
    
    if (extracted && extracted !== current) {
      descriptions[key] = extracted;
      console.log(`  更新为: ${extracted}`);
    } else if (extracted) {
      console.log(`  确认正确: ${extracted}`);
    } else {
      console.log(`  提取失败，保持当前描述`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log('特定练习验证完成');
}

verifySpecificExercises().catch(console.error);