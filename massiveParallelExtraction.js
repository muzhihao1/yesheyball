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
      return content.length > 8 ? content : null;
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function massiveParallelExtraction() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('Massive parallel extraction starting...');
  
  let totalExtracted = 0;
  const levelCounts = { 3: 50, 4: 60, 5: 60, 6: 60, 7: 55, 8: 55 };
  
  // Collect all incomplete exercises
  let incompleteTasks = [];
  for (const level of [3, 4, 5, 7, 8]) {
    for (let i = 1; i <= levelCounts[level]; i++) {
      const key = `${level}-${i}`;
      const currentDesc = descriptions[key];
      
      if (!currentDesc || 
          currentDesc.includes('如图示摆放球型，完成') || 
          currentDesc.includes('精进台球技能练习') ||
          currentDesc.includes('高级台球技巧训练') ||
          currentDesc.length < 20) {
        incompleteTasks.push({ level, exerciseNum: i, key });
      }
    }
  }
  
  console.log(`Processing ${incompleteTasks.length} incomplete exercises`);
  
  // Process in parallel batches
  const batchSize = 6;
  for (let batchIdx = 0; batchIdx < Math.ceil(incompleteTasks.length / batchSize); batchIdx++) {
    const batch = incompleteTasks.slice(batchIdx * batchSize, (batchIdx + 1) * batchSize);
    
    console.log(`Processing batch ${batchIdx + 1}/${Math.ceil(incompleteTasks.length / batchSize)}`);
    
    const promises = batch.map(async ({ level, exerciseNum, key }) => {
      const result = await extractDescription(level, exerciseNum);
      return { key, result };
    });
    
    try {
      const results = await Promise.all(promises);
      
      let batchExtracted = 0;
      for (const { key, result } of results) {
        if (result) {
          descriptions[key] = result;
          console.log(`${key}: ${result}`);
          totalExtracted++;
          batchExtracted++;
          fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
        }
      }
      
      console.log(`Batch ${batchIdx + 1} completed: extracted ${batchExtracted} descriptions`);
      
    } catch (error) {
      console.log(`Batch ${batchIdx + 1} encountered issues, continuing`);
    }
  }
  
  // Continue with high-frequency sequential processing
  for (let round = 1; round <= 5000; round++) {
    let roundExtracted = 0;
    
    const patterns = [
      [3, 4, 5, 7, 8], [8, 7, 5, 4, 3], [4, 8, 3, 7, 5],
      [5, 3, 8, 4, 7], [7, 5, 4, 8, 3], [8, 4, 7, 3, 5]
    ];
    
    const pattern = patterns[round % patterns.length];
    
    for (const level of pattern) {
      for (let i = 1; i <= levelCounts[level]; i++) {
        const key = `${level}-${i}`;
        const currentDesc = descriptions[key];
        
        if (!currentDesc || 
            currentDesc.includes('如图示摆放球型，完成') || 
            currentDesc.includes('精进台球技能练习') ||
            currentDesc.includes('高级台球技巧训练') ||
            currentDesc.length < 20) {
          
          const result = await extractDescription(level, i);
          if (result) {
            descriptions[key] = result;
            console.log(`Round${round} ${key}: ${result}`);
            totalExtracted++;
            roundExtracted++;
            fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
          }
        }
      }
    }
    
    // Check completion every 5 rounds
    if (round % 5 === 0) {
      let totalAuth = 0, totalEx = 0;
      [3,4,5,6,7,8].forEach(level => {
        let authentic = 0;
        for (let i = 1; i <= levelCounts[level]; i++) {
          const desc = descriptions[`${level}-${i}`];
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
      
      console.log(`Round ${round}: +${roundExtracted} | Total: ${totalAuth}/${totalEx} (${(totalAuth/totalEx*100).toFixed(1)}%)`);
      
      if (totalAuth === totalEx) {
        console.log(`All 340 exercises completed! Round ${round}`);
        
        // Final verification
        console.log('Final verification results:');
        [3,4,5,6,7,8].forEach(level => {
          let authentic = 0;
          for (let i = 1; i <= levelCounts[level]; i++) {
            const desc = descriptions[`${level}-${i}`];
            if (desc && 
                !desc.includes('如图示摆放球型，完成') && 
                !desc.includes('精进台球技能练习') &&
                !desc.includes('高级台球技巧训练') &&
                desc.length > 15) {
              authentic++;
            }
          }
          const pct = (authentic/levelCounts[level]*100).toFixed(1);
          console.log(`Level ${level}: ${authentic}/${levelCounts[level]} (${pct}%)`);
        });
        
        return;
      }
    }
    
    if (roundExtracted === 0 && round > 500) {
      console.log('No progress for 500 rounds, may have reached completion');
      break;
    }
  }
  
  console.log(`Massive parallel extraction finished: extracted ${totalExtracted} new descriptions`);
}

massiveParallelExtraction().catch(console.error);