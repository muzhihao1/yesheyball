import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function extractWithRetry(level, exerciseNum, maxRetries = 3) {
  const folderNames = {
    3: '3、小试牛刀', 4: '4、炉火纯青', 5: '5、登堂入室',
    6: '6、超群绝伦', 7: '7、登峰造极', 8: '8、出神入化'
  };
  
  const fileIndex = (exerciseNum + 1).toString().padStart(2, '0');
  const folderName = folderNames[level];
  const imagePath = path.join(process.cwd(), 'assessments', folderName, `${folderName}_${fileIndex}.jpg`);
  
  if (!fs.existsSync(imagePath)) return null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
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
        if (content.length > 8) return content;
      }
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    } catch (error) {
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      }
    }
  }
  return null;
}

async function finalCompletionSystem() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('最终完成系统启动...');
  
  let totalExtracted = 0;
  const levelCounts = { 3: 50, 4: 60, 5: 60, 6: 60, 7: 55, 8: 55 };
  
  // 持续处理直到全部完成
  let maxCycles = 100;
  for (let cycle = 1; cycle <= maxCycles; cycle++) {
    let cycleExtracted = 0;
    console.log(`=== 第${cycle}轮处理 ===`);
    
    // 按优先级处理各级别
    const priorities = [
      { level: 8, name: 'Level 8 (最低完成率)' },
      { level: 3, name: 'Level 3' },
      { level: 4, name: 'Level 4' },
      { level: 5, name: 'Level 5' },
      { level: 7, name: 'Level 7' }
    ];
    
    for (const { level, name } of priorities) {
      console.log(`处理 ${name}`);
      
      for (let i = 1; i <= levelCounts[level]; i++) {
        const key = `${level}-${i}`;
        const currentDesc = descriptions[key];
        
        if (!currentDesc || 
            currentDesc.includes('如图示摆放球型，完成') || 
            currentDesc.includes('精进台球技能练习') ||
            currentDesc.includes('高级台球技巧训练') ||
            currentDesc.length < 20) {
          
          const result = await extractWithRetry(level, i);
          if (result) {
            descriptions[key] = result;
            console.log(`[${cycle}] ${key}: ${result}`);
            totalExtracted++;
            cycleExtracted++;
            fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
          }
        }
      }
    }
    
    // 计算完成状态
    let totalAuth = 0, totalEx = 0;
    const levelStats = {};
    
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
      levelStats[level] = { authentic, total: levelCounts[level] };
      totalAuth += authentic;
      totalEx += levelCounts[level];
    });
    
    console.log(`第${cycle}轮结果: 提取${cycleExtracted}个 | 总进度: ${totalAuth}/${totalEx} (${(totalAuth/totalEx*100).toFixed(1)}%)`);
    
    // 显示各级别详细状态
    Object.entries(levelStats).forEach(([level, stats]) => {
      const pct = (stats.authentic/stats.total*100).toFixed(1);
      const remaining = stats.total - stats.authentic;
      if (remaining > 0) {
        console.log(`  Level ${level}: ${stats.authentic}/${stats.total} (${pct}%) - 剩余${remaining}`);
      } else {
        console.log(`  Level ${level}: ${stats.authentic}/${stats.total} (${pct}%) - 完成`);
      }
    });
    
    if (totalAuth === totalEx) {
      console.log(`🎉 全部340个练习完成！用时${cycle}轮，总提取${totalExtracted}个`);
      break;
    }
    
    if (cycleExtracted === 0 && cycle > 10) {
      console.log(`连续无进展，当前完成度: ${(totalAuth/totalEx*100).toFixed(1)}%`);
      break;
    }
    
    // 短暂延迟避免API限制
    if (cycle < maxCycles) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log(`最终完成系统: 总计提取${totalExtracted}个描述`);
}

finalCompletionSystem().catch(console.error);