import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const targetExercises = [
  {level: 4, exerciseNum: 56}, {level: 4, exerciseNum: 57}, {level: 4, exerciseNum: 59},
  {level: 7, exerciseNum: 1}, {level: 7, exerciseNum: 2},
  {level: 8, exerciseNum: 44}, {level: 8, exerciseNum: 45}, {level: 8, exerciseNum: 46},
  {level: 8, exerciseNum: 47}, {level: 8, exerciseNum: 48}, {level: 8, exerciseNum: 50}
];

async function processOne(level, exerciseNum) {
  const folderNames = {
    4: '4、炉火纯青', 7: '7、登峰造极', 8: '8、出神入化'
  };
  
  const fileIndex = (exerciseNum + 1).toString().padStart(2, '0');
  const folderName = folderNames[level];
  const imagePath = path.join(process.cwd(), 'assessments', folderName, `${folderName}_${fileIndex}.jpg`);
  
  if (!fs.existsSync(imagePath)) return null;
  
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
    return content.length >= 10 ? content : null;
  }
  return null;
}

let completed = 0;
const descriptionsPath = 'client/src/data/exerciseDescriptions.json';

for (const {level, exerciseNum} of targetExercises) {
  try {
    const result = await processOne(level, exerciseNum);
    if (result) {
      const descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
      descriptions[`${level}-${exerciseNum}`] = result;
      fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
      console.log(`${level}-${exerciseNum}: ${result}`);
      completed++;
    }
  } catch (error) {
    console.log(`Error processing ${level}-${exerciseNum}`);
  }
}

console.log(`Completed ${completed}/11 exercises`);

// Final check
const descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
const levelCounts = { 3: 50, 4: 60, 5: 60, 6: 60, 7: 55, 8: 55 };
let totalAuth = 0;

[3,4,5,6,7,8].forEach(level => {
  let authentic = 0;
  for (let i = 1; i <= levelCounts[level]; i++) {
    const desc = descriptions[`${level}-${i}`];
    if (desc && desc.length >= 10 && 
        !desc.includes('如图示摆放球型，完成') && 
        !desc.includes('精进台球技能练习')) {
      authentic++;
    }
  }
  totalAuth += authentic;
  console.log(`Level ${level}: ${authentic}/${levelCounts[level]}`);
});

console.log(`Total: ${totalAuth}/340 (${(totalAuth/340*100).toFixed(1)}%)`);
if (totalAuth === 340) console.log('ALL COMPLETED!');