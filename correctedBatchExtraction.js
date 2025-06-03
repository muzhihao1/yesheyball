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
    
    // 修正索引：练习1对应_02.jpg，练习2对应_03.jpg，以此类推
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

async function correctedBatchExtraction() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('修正批量提取启动...');
  
  let totalExtracted = 0;
  const levelCounts = { 3: 50, 4: 60, 5: 60, 6: 60, 7: 55, 8: 55 };
  
  // 验证文件结构
  console.log('验证修正后的文件结构...');
  const folderNames = {
    3: '3、渐入佳境', 4: '4、炉火纯青', 5: '5、登堂入室',
    6: '6、超群绝伦', 7: '7、登峰造极', 8: '8、出神入化'
  };
  
  for (const level of [3, 4, 5, 7, 8]) {
    const folderPath = path.join(process.cwd(), 'assessments', folderNames[level]);
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.jpg'));
    console.log(`Level ${level}: ${files.length}个文件，练习文件${files.length-2}个`);
  }
  
  // 收集所有未完成的练习
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
  
  // 分批并行处理
  const batchSize = 8;
  for (let i = 0; i < pendingTasks.length; i += batchSize) {
    const batch = pendingTasks.slice(i, i + batchSize);
    const batchIndex = Math.floor(i/batchSize) + 1;
    const totalBatches = Math.ceil(pendingTasks.length/batchSize);
    
    console.log(`批次 ${batchIndex}/${totalBatches} (${batch.length}个任务)`);
    
    const promises = batch.map(async ({ level, exerciseNum, key }) => {
      const result = await extractDescription(level, exerciseNum);
      return { key, result, level, exerciseNum };
    });
    
    try {
      const results = await Promise.all(promises);
      
      let batchExtracted = 0;
      for (const { key, result, level, exerciseNum } of results) {
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
      console.log(`批次${batchIndex}部分完成，继续下一批次`);
    }
  }
  
  // 多轮补漏提取
  for (let补漏轮 = 1; 补漏轮 <= 50; 补漏轮++) {
    let 补漏数 = 0;
    
    // 随机顺序处理不同级别
    const levelOrder = [8, 3, 4, 5, 7].sort(() => Math.random() - 0.5);
    
    for (const level of levelOrder) {
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
            console.log(`补漏[${补漏轮}] ${key}: ${result}`);
            totalExtracted++;
            补漏数++;
            fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
          }
        }
      }
    }
    
    // 检查进度
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
    
    console.log(`补漏${补漏轮}: +${补漏数} | 总体: ${totalAuth}/${totalEx} (${(totalAuth/totalEx*100).toFixed(1)}%)`);
    
    if (totalAuth === totalEx) {
      console.log(`🎉 全部340个练习完成！补漏第${补漏轮}轮完成`);
      break;
    }
    
    if (补漏数 === 0 && 补漏轮 > 15) {
      console.log('连续无进展，结束补漏');
      break;
    }
  }
  
  console.log(`修正批量提取完成: 总共提取${totalExtracted}个描述`);
}

correctedBatchExtraction().catch(console.error);