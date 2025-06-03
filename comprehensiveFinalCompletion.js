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

async function comprehensiveFinalCompletion() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('综合最终完成系统启动...');
  
  let totalExtracted = 0;
  const levelCounts = { 3: 50, 4: 60, 5: 60, 6: 60, 7: 55, 8: 55 };
  
  // 收集所有未完成的练习
  let incompleteExercises = [];
  for (const level of [3, 4, 5, 7, 8]) {
    for (let i = 1; i <= levelCounts[level]; i++) {
      const key = `${level}-${i}`;
      const currentDesc = descriptions[key];
      
      if (!currentDesc || 
          currentDesc.includes('如图示摆放球型，完成') || 
          currentDesc.includes('精进台球技能练习') ||
          currentDesc.includes('高级台球技巧训练') ||
          currentDesc.length < 20) {
        incompleteExercises.push({ level, exerciseNum: i, key });
      }
    }
  }
  
  console.log(`未完成练习总数: ${incompleteExercises.length}个`);
  
  // 超密集循环处理
  for (let cycle = 1; cycle <= 1000; cycle++) {
    let cycleExtracted = 0;
    
    // 随机打乱处理顺序
    incompleteExercises.sort(() => Math.random() - 0.5);
    
    for (const { level, exerciseNum, key } of incompleteExercises) {
      const currentDesc = descriptions[key];
      
      if (!currentDesc || 
          currentDesc.includes('如图示摆放球型，完成') || 
          currentDesc.includes('精进台球技能练习') ||
          currentDesc.includes('高级台球技巧训练') ||
          currentDesc.length < 20) {
        
        const result = await extractDescription(level, exerciseNum);
        if (result) {
          descriptions[key] = result;
          console.log(`综合最终${cycle} ${key}: ${result}`);
          totalExtracted++;
          cycleExtracted++;
          fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
        }
      }
    }
    
    // 更新未完成列表
    incompleteExercises = incompleteExercises.filter(({ key }) => {
      const desc = descriptions[key];
      return !desc || 
             desc.includes('如图示摆放球型，完成') || 
             desc.includes('精进台球技能练习') ||
             desc.includes('高级台球技巧训练') ||
             desc.length < 20;
    });
    
    // 每2轮检查进度
    if (cycle % 2 === 0) {
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
      
      console.log(`综合最终${cycle}: +${cycleExtracted} | 总体: ${totalAuth}/${totalEx} (${(totalAuth/totalEx*100).toFixed(1)}%) | 剩余: ${incompleteExercises.length}`);
      
      if (totalAuth === totalEx) {
        console.log(`🎉 全部340个练习完成！综合最终第${cycle}轮完成`);
        
        // 最终验证
        console.log('最终验证各级别完成情况:');
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
        
        break;
      }
    }
    
    if (incompleteExercises.length === 0) {
      console.log('所有练习已完成');
      break;
    }
    
    if (cycleExtracted === 0 && cycle > 50) {
      console.log('连续50轮无进展');
      break;
    }
  }
  
  console.log(`综合最终完成系统结束: 总共提取${totalExtracted}个新描述`);
}

comprehensiveFinalCompletion().catch(console.error);