import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function extractCleanDescription(imagePath) {
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
              text: "提取题目说明文字："
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` }
            }
          ],
        },
      ],
      max_tokens: 60,
      temperature: 0
    });

    let content = response.choices[0].message.content;
    if (content && !content.includes('无法') && !content.includes('抱歉')) {
      // 清理提取的内容
      content = content.replace(/^题目说明[:：]\s*/, '');
      content = content.replace(/```markdown/g, '');
      content = content.replace(/```/g, '');
      content = content.replace(/\n/g, '');
      return content.trim();
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function processInSmallBatches() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  console.log('分批处理等级1习题验证...');

  // 分5批处理，每批7个
  const batches = [
    [1, 2, 3, 4, 5, 6, 7],
    [8, 9, 10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19, 20, 21],
    [22, 23, 24, 25, 26, 27, 28],
    [29, 30, 31, 32, 33, 34, 35]
  ];

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    console.log(`处理第${batchIndex + 1}批: 习题${batch[0]}-${batch[batch.length - 1]}`);

    for (const exerciseNum of batch) {
      const key = `1-${exerciseNum}`;
      const fileIndex = (exerciseNum + 1).toString().padStart(2, '0');
      const imagePath = path.join(
        process.cwd(), 
        'assessments', 
        '1、初窥门径', 
        `1、初窥门径_${fileIndex}.jpg`
      );

      if (fs.existsSync(imagePath)) {
        const extracted = await extractCleanDescription(imagePath);
        
        if (extracted) {
          descriptions[key] = extracted;
          console.log(`${key}: ${extracted}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 400));
      }
    }

    // 每批保存一次
    fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
    console.log(`第${batchIndex + 1}批完成`);
  }

  console.log('所有批次处理完成');
}

processInSmallBatches().catch(console.error);