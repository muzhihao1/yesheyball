import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const lastThree = [47, 48, 50];

console.log('Completing final 3 exercises...');

let completed = 0;
for (const exerciseNum of lastThree) {
  try {
    const fileIndex = (exerciseNum + 1).toString().padStart(2, '0');
    const imagePath = path.join(process.cwd(), 'assessments', '8、出神入化', `8、出神入化_${fileIndex}.jpg`);
    
    console.log(`Processing 8-${exerciseNum} (file: ${fileIndex})`);
    
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
          console.log(`✓ 8-${exerciseNum}: ${content}`);
          completed++;
        } else {
          console.log(`✗ Content too short for 8-${exerciseNum}`);
        }
      } else {
        console.log(`✗ Invalid response for 8-${exerciseNum}`);
      }
    } else {
      console.log(`✗ File not found for 8-${exerciseNum}`);
    }
  } catch (error) {
    console.log(`✗ Error processing 8-${exerciseNum}: ${error.message}`);
  }
}

// Final verification
const finalDescriptions = JSON.parse(fs.readFileSync('client/src/data/exerciseDescriptions.json', 'utf8'));
const levelCounts = { 3: 50, 4: 60, 5: 60, 6: 60, 7: 55, 8: 55 };
let totalAuth = 0;

console.log('\nFinal Results:');
[3,4,5,6,7,8].forEach(level => {
  let authentic = 0;
  for (let i = 1; i <= levelCounts[level]; i++) {
    const desc = finalDescriptions[`${level}-${i}`];
    if (desc && desc.length >= 10 && 
        !desc.includes('如图示摆放球型，完成') && 
        !desc.includes('精进台球技能练习')) {
      authentic++;
    }
  }
  totalAuth += authentic;
  const pct = (authentic/levelCounts[level]*100).toFixed(1);
  console.log(`Level ${level}: ${authentic}/${levelCounts[level]} (${pct}%)`);
});

console.log(`\nCompleted in this run: ${completed}/3`);
console.log(`Total completion: ${totalAuth}/340 (${(totalAuth/340*100).toFixed(1)}%)`);

if (totalAuth === 340) {
  console.log('\n🎉 ALL 340 EXERCISES COMPLETED! 🎉');
  console.log('Billiards training platform extraction complete!');
} else {
  console.log(`\nRemaining: ${340 - totalAuth} exercises`);
}