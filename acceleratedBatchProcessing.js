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

async function acceleratedBatchProcessing() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('加速批处理系统启动...');
  
  let totalExtracted = 0;
  const levelCounts = { 3: 50, 4: 60, 5: 60, 6: 60, 7: 55, 8: 55 };
  
  // 收集所有未完成的练习
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
  
  console.log(`未完成任务: ${incompleteTasks.length}个`);
  
  // 高频循环处理直至完成
  for (let batch = 1; batch <= 50000; batch++) {
    let batchExtracted = 0;
    
    // 随机打乱任务顺序
    incompleteTasks.sort(() => Math.random() - 0.5);
    
    // 处理前10个未完成任务
    const currentBatch = incompleteTasks.slice(0, Math.min(10, incompleteTasks.length));
    
    for (const { level, exerciseNum, key } of currentBatch) {
      const currentDesc = descriptions[key];
      
      if (!currentDesc || 
          currentDesc.includes('如图示摆放球型，完成') || 
          currentDesc.includes('精进台球技能练习') ||
          currentDesc.includes('高级台球技巧训练') ||
          currentDesc.length < 20) {
        
        const result = await extractDescription(level, exerciseNum);
        if (result) {
          descriptions[key] = result;
          console.log(`批处理${batch} ${key}: ${result}`);
          totalExtracted++;
          batchExtracted++;
          fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
        }
      }
    }
    
    // 更新未完成任务列表
    incompleteTasks = incompleteTasks.filter(({ key }) => {
      const desc = descriptions[key];
      return !desc || 
             desc.includes('如图示摆放球型，完成') || 
             desc.includes('精进台球技能练习') ||
             desc.includes('高级台球技巧训练') ||
             desc.length < 20;
    });
    
    // 每轮检查完成状态
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
    
    console.log(`批处理${batch}: +${batchExtracted} | 总体: ${totalAuth}/${totalEx} (${(totalAuth/totalEx*100).toFixed(1)}%) | 剩余: ${incompleteTasks.length}`);
    
    if (totalAuth === totalEx) {
      console.log(`全部340个练习完成！批处理第${batch}轮完成`);
      
      console.log('最终验证结果:');
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
    
    if (incompleteTasks.length === 0) {
      console.log('所有任务已完成');
      break;
    }
    
    if (batchExtracted === 0 && batch > 2000) {
      console.log('连续2000轮无进展');
      break;
    }
  }
  
  console.log(`加速批处理系统结束: 总共提取${totalExtracted}个新描述`);
}

acceleratedBatchProcessing().catch(console.error);