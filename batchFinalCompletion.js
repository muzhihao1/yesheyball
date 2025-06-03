import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function extractDescription(level, exerciseNum) {
  try {
    const folderNames = {
      3: '3、小试牛刀', 4: '4、炉火纯青', 5: '5、登堂入室',
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
    if (content && !content.includes('无法')) {
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

async function batchFinalCompletion() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('批量最终完成启动...');
  
  let totalExtracted = 0;
  const levelCounts = { 3: 50, 4: 60, 5: 60, 6: 60, 7: 55, 8: 55 };
  
  // 收集所有需要处理的练习
  let pendingTasks = [];
  for (const level of [3, 4, 5, 7, 8]) {
    for (let i = 1; i <= levelCounts[level]; i++) {
      const key = `${level}-${i}`;
      const currentDesc = descriptions[key];
      
      if (!currentDesc || 
          currentDesc.includes('如图示摆放球型，完成') || 
          currentDesc.includes('精进台球技能练习') ||
          currentDesc.includes('高级台球技巧训练') ||
          currentDesc.length < 20) {
        pendingTasks.push({ level, exerciseNum: i, key });
      }
    }
  }
  
  console.log(`待处理任务: ${pendingTasks.length}个`);
  
  // 批量并行处理
  const batchSize = 8;
  for (let i = 0; i < pendingTasks.length; i += batchSize) {
    const batch = pendingTasks.slice(i, i + batchSize);
    const batchIndex = Math.floor(i/batchSize) + 1;
    const totalBatches = Math.ceil(pendingTasks.length/batchSize);
    
    console.log(`批次 ${batchIndex}/${totalBatches} (${batch.length}个任务)`);
    
    // 并行处理批次
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
      
      console.log(`批次${batchIndex}完成: 提取${batchExtracted}个`);
      
    } catch (error) {
      console.log(`批次${batchIndex}出错，继续下一批次`);
    }
    
    // 进度检查
    let totalAuth = 0, totalEx = 0;
    [3,4,5,6,7,8].forEach(level => {
      let authentic = 0;
      for (let j = 1; j <= levelCounts[level]; j++) {
        const desc = descriptions[`${level}-${j}`];
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
    
    console.log(`当前进度: ${totalAuth}/${totalEx} (${(totalAuth/totalEx*100).toFixed(1)}%)`);
    
    if (totalAuth === totalEx) {
      console.log('全部340个练习完成！');
      break;
    }
  }
  
  // 最终检查和补漏
  console.log('开始最终补漏...');
  for (let补漏轮次 = 1; 补漏轮次 <= 20; 补漏轮次++) {
    let 补漏提取 = 0;
    
    for (const level of [8, 3, 4, 5, 7]) {
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
            console.log(`补漏[${补漏轮次}] ${key}: ${result}`);
            totalExtracted++;
            补漏提取++;
            fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
          }
        }
      }
    }
    
    // 检查完成状态
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
    
    console.log(`补漏${补漏轮次}: +${补漏提取} | 总体: ${totalAuth}/${totalEx} (${(totalAuth/totalEx*100).toFixed(1)}%)`);
    
    if (totalAuth === totalEx) {
      console.log(`全部340个练习完成！补漏${补漏轮次}轮`);
      break;
    }
    
    if (补漏提取 === 0 && 补漏轮次 > 5) {
      console.log('补漏无新进展，结束');
      break;
    }
  }
  
  console.log(`批量最终完成: ${totalExtracted}个描述`);
}

batchFinalCompletion().catch(console.error);