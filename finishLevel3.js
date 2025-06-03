import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function extractDescription(exerciseNum) {
  const folderName = '3、渐入佳境';
  const fileIndex = (exerciseNum + 1).toString().padStart(2, '0');
  const imagePath = path.join(process.cwd(), 'assessments', folderName, `${folderName}_${fileIndex}.jpg`);

  if (!fs.existsSync(imagePath)) return null;

  try {
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: [{
          type: "text",
          text: "提取题目说明"
        }, {
          type: "image_url",
          image_url: { url: `data:image/jpeg;base64,${base64Image}` }
        }]
      }],
      max_tokens: 50,
      temperature: 0
    });

    let content = response.choices[0].message.content;
    if (content && !content.includes('无法')) {
      content = content.replace(/^题目说明[：:]\s*/g, '').replace(/过关要求.*$/gm, '').replace(/[；。\n]+$/, '').trim();
      return content.length > 8 ? content : null;
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function finishLevel3() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('完成Level 3最后批次...');
  
  let updated = 0;
  
  for (let i = 18; i <= 35; i++) {
    const key = `3-${i}`;
    const currentDesc = descriptions[key];
    
    if (!currentDesc || currentDesc.includes('如图示摆放球型，完成') || currentDesc.length < 20) {
      const extracted = await extractDescription(i);
      
      if (extracted) {
        descriptions[key] = extracted;
        console.log(`3-${i}: ${extracted}`);
        updated++;
        
        if (updated % 2 === 0) {
          fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 350));
    }
    
    if (updated >= 10) break;
  }
  
  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log(`Level 3 批次完成: ${updated} 题更新`);
  
  let authentic = 0;
  for (let i = 1; i <= 50; i++) {
    const desc = descriptions[`3-${i}`];
    if (desc && !desc.includes('如图示摆放球型，完成') && desc.length > 15) {
      authentic++;
    }
  }
  console.log(`Level 3 进度: ${authentic}/50 (${(authentic/50*100).toFixed(1)}%)`);
}

finishLevel3().catch(console.error);