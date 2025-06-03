import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function extractAndSave(level, exerciseNum) {
  try {
    const folderNames = {
      3: '3、渐入佳境', 4: '4、炉火纯青', 5: '5、登堂入室',
      6: '6、超群绝伦', 7: '7、登峰造极', 8: '8、出神入化'
    };
    
    const fileIndex = (exerciseNum + 1).toString().padStart(2, '0');
    const folderName = folderNames[level];
    const imagePath = path.join(process.cwd(), 'assessments', folderName, `${folderName}_${fileIndex}.jpg`);
    
    if (!fs.existsSync(imagePath)) return false;
    
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
      
      if (content.length > 8) {
        // Immediately save to file
        const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
        const descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
        descriptions[`${level}-${exerciseNum}`] = content;
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
        return content;
      }
    }
    return false;
  } catch (error) {
    return false;
  }
}

async function forcedCompletion() {
  console.log('Forced completion starting...');
  
  const levelCounts = { 3: 50, 4: 60, 5: 60, 6: 60, 7: 55, 8: 55 };
  
  // Get current incomplete exercises
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  let incompleteTasks = [];
  for (const level of [3, 4, 5, 7, 8]) {
    for (let i = 1; i <= levelCounts[level]; i++) {
      const key = `${level}-${i}`;
      const desc = descriptions[key];
      
      if (!desc || 
          desc.includes('如图示摆放球型，完成') || 
          desc.includes('精进台球技能练习') ||
          desc.includes('高级台球技巧训练') ||
          desc.length < 20) {
        incompleteTasks.push({ level, exerciseNum: i });
      }
    }
  }
  
  console.log(`Processing ${incompleteTasks.length} incomplete exercises`);
  
  let completed = 0;
  for (const { level, exerciseNum } of incompleteTasks) {
    const result = await extractAndSave(level, exerciseNum);
    if (result) {
      console.log(`Completed ${level}-${exerciseNum}: ${result}`);
      completed++;
    } else {
      console.log(`Failed ${level}-${exerciseNum}`);
    }
    
    // Progress check every 10 exercises
    if (completed % 10 === 0) {
      const currentDescriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
      let totalAuth = 0, totalEx = 0;
      
      [3,4,5,6,7,8].forEach(level => {
        let authentic = 0;
        for (let i = 1; i <= levelCounts[level]; i++) {
          const desc = currentDescriptions[`${level}-${i}`];
          if (desc && 
              !desc.includes('如图示摆放球型，完成') && 
              !desc.includes('精进台球技能练习') &&
              !desc.includes('高级台球技巧训练') &&
              desc.length > 15) {
            authentic++;
          }
        }
        totalAuth += authentic;
        totalEx += levelCounts[level];
      });
      
      console.log(`Progress: ${totalAuth}/${totalEx} (${(totalAuth/totalEx*100).toFixed(1)}%)`);
      
      if (totalAuth === totalEx) {
        console.log('All 340 exercises completed!');
        break;
      }
    }
  }
  
  // Final check
  const finalDescriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  let finalAuth = 0, finalEx = 0;
  
  [3,4,5,6,7,8].forEach(level => {
    let authentic = 0;
    for (let i = 1; i <= levelCounts[level]; i++) {
      const desc = finalDescriptions[`${level}-${i}`];
      if (desc && 
          !desc.includes('如图示摆放球型，完成') && 
          !desc.includes('精进台球技能练习') &&
          !desc.includes('高级台球技巧训练') &&
          desc.length > 15) {
        authentic++;
      }
    }
    finalAuth += authentic;
    finalEx += levelCounts[level];
    
    const pct = (authentic/levelCounts[level]*100).toFixed(1);
    console.log(`Level ${level}: ${authentic}/${levelCounts[level]} (${pct}%)`);
  });
  
  console.log(`Final result: ${finalAuth}/${finalEx} (${(finalAuth/finalEx*100).toFixed(1)}%)`);
  console.log(`Completed ${completed} exercises in this run`);
}

forcedCompletion().catch(console.error);