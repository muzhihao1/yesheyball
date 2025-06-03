import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const final5 = [45, 46, 47, 48, 50];

let success = 0;

for (const exerciseNum of final5) {
  try {
    const fileIndex = (exerciseNum + 1).toString().padStart(2, '0');
    const imagePath = path.join(process.cwd(), 'assessments', '8、出神入化', `8、出神入化_${fileIndex}.jpg`);
    
    if (fs.existsSync(imagePath)) {
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
      if (content && !content.includes('无法') && !content.includes("I'm sorry")) {
        content = content.replace(/^题目说明[：:]\s*/g, '')
                       .replace(/过关要求.*$/gm, '')
                       .replace(/连续完成.*$/gm, '')
                       .replace(/[；。\n]+$/, '')
                       .trim();
        
        if (content.length >= 10) {
          const descriptions = JSON.parse(fs.readFileSync('client/src/data/exerciseDescriptions.json', 'utf8'));
          descriptions[`8-${exerciseNum}`] = content;
          fs.writeFileSync('client/src/data/exerciseDescriptions.json', JSON.stringify(descriptions, null, 2), 'utf8');
          console.log(`8-${exerciseNum}: ${content}`);
          success++;
        }
      }
    }
  } catch (error) {
    console.log(`Error: 8-${exerciseNum}`);
  }
}

// Final check
const descriptions = JSON.parse(fs.readFileSync('client/src/data/exerciseDescriptions.json', 'utf8'));
let level8Complete = 0;

for (let i = 1; i <= 55; i++) {
  const desc = descriptions[`8-${i}`];
  if (desc && desc.length >= 10 && 
      !desc.includes('如图示摆放球型，完成') && 
      !desc.includes('精进台球技能练习')) {
    level8Complete++;
  }
}

console.log(`Completed: ${success}/5 exercises`);
console.log(`Level 8: ${level8Complete}/55 (${(level8Complete/55*100).toFixed(1)}%)`);

if (level8Complete === 55) {
  console.log('Level 8 COMPLETE!');
  console.log('ALL 340 EXERCISES COMPLETED!');
}