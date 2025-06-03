import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function extractDescription(level, exerciseNum) {
  try {
    const folderNames = {
      3: '3、渐入佳境', 4: '4、炉火纯青', 5: '5、登堂入室',
      6: '6、超群绝伦', 7: '7、登峰造极', 8: '8、出神入化'
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
    if (content && !content.includes('无法') && !content.includes("I'm sorry") && !content.includes("I can't")) {
      content = content.replace(/^题目说明[：:]\s*/g, '')
                     .replace(/过关要求.*$/gm, '')
                     .replace(/连续完成.*$/gm, '')
                     .replace(/不超过.*$/gm, '')
                     .replace(/[；。\n]+$/, '')
                     .trim();
      return content.length >= 10 ? content : null;
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function completeFinal11() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('Completing final 11 exercises...');
  
  // The exact 11 missing exercises
  const finalExercises = [
    {level: 4, exerciseNum: 56}, {level: 4, exerciseNum: 57}, {level: 4, exerciseNum: 59},
    {level: 7, exerciseNum: 1}, {level: 7, exerciseNum: 2},
    {level: 8, exerciseNum: 44}, {level: 8, exerciseNum: 45}, {level: 8, exerciseNum: 46},
    {level: 8, exerciseNum: 47}, {level: 8, exerciseNum: 48}, {level: 8, exerciseNum: 50}
  ];
  
  let completed = 0;
  
  for (const {level, exerciseNum} of finalExercises) {
    const key = `${level}-${exerciseNum}`;
    console.log(`Processing ${key}...`);
    
    const result = await extractDescription(level, exerciseNum);
    if (result) {
      descriptions[key] = result;
      console.log(`✓ ${key}: ${result}`);
      completed++;
      fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
    } else {
      console.log(`✗ Failed to extract ${key}`);
    }
  }
  
  // Final verification
  console.log('\nFinal verification:');
  const levelCounts = { 3: 50, 4: 60, 5: 60, 6: 60, 7: 55, 8: 55 };
  let totalAuth = 0, totalEx = 0;
  
  [3,4,5,6,7,8].forEach(level => {
    let authentic = 0;
    for (let i = 1; i <= levelCounts[level]; i++) {
      const desc = descriptions[`${level}-${i}`];
      if (desc && 
          desc.length >= 10 &&
          !desc.includes('如图示摆放球型，完成') && 
          !desc.includes('精进台球技能练习') &&
          !desc.includes('高级台球技巧训练') &&
          !desc.includes('高级台球技巧练习') &&
          !desc.includes('台球技巧练习') &&
          desc !== '如图摆放球型，完成指定要求') {
        authentic++;
      }
    }
    totalAuth += authentic;
    totalEx += levelCounts[level];
    
    const pct = (authentic/levelCounts[level]*100).toFixed(1);
    console.log(`Level ${level}: ${authentic}/${levelCounts[level]} (${pct}%)`);
  });
  
  console.log(`\nCompleted: ${completed}/11 exercises in this run`);
  console.log(`Total: ${totalAuth}/${totalEx} (${(totalAuth/totalEx*100).toFixed(1)}%)`);
  
  if (totalAuth === totalEx) {
    console.log('\n🎉 ALL 340 EXERCISES COMPLETED! 🎉');
  } else {
    console.log(`\nRemaining: ${totalEx - totalAuth} exercises`);
  }
}

completeFinal11().catch(console.error);