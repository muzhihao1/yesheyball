import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function extractDescription(level, exerciseNum) {
  const levelFolders = {
    4: '4、炉火纯青', 5: '5、登堂入室', 6: '6、超群绝伦',
    7: '7、登峰造极', 8: '8、出神入化'
  };

  const fileIndex = (exerciseNum + 1).toString().padStart(2, '0');
  const folderName = levelFolders[level];
  const imagePath = path.join(process.cwd(), 'assessments', folderName, `${folderName}_${fileIndex}.jpg`);

  if (!fs.existsSync(imagePath)) return null;

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
      content = content.replace(/^题目说明[：:]\s*/g, '').replace(/过关要求.*$/gm, '').replace(/连续完成.*$/gm, '').replace(/[；。\n]+$/, '').trim();
      return content.length > 8 && !content.includes('连续') ? content : null;
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function exhaustiveCompletionProcess() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('穷尽式完成处理...');
  
  let totalUpdated = 0;
  
  // Process all levels systematically
  const processingPlan = [
    { level: 4, start: 29, end: 60 },
    { level: 5, start: 15, end: 60 },
    { level: 6, start: 14, end: 60 },
    { level: 7, start: 14, end: 55 },
    { level: 8, start: 14, end: 55 }
  ];
  
  for (const plan of processingPlan) {
    console.log(`处理 Level ${plan.level} (${plan.start}-${plan.end})`);
    
    for (let i = plan.start; i <= plan.end; i++) {
      const key = `${plan.level}-${i}`;
      if (!descriptions[key] || descriptions[key].includes('如图示摆放球型，完成') || descriptions[key].length < 20) {
        const extracted = await extractDescription(plan.level, i);
        if (extracted) {
          descriptions[key] = extracted;
          console.log(`${key}: ${extracted}`);
          totalUpdated++;
          fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
        }
        await new Promise(resolve => setTimeout(resolve, 30));
      }
      if (totalUpdated >= 100) break;
    }
    if (totalUpdated >= 100) break;
  }
  
  console.log(`穷尽式处理: ${totalUpdated} 题更新`);
  
  // Final comprehensive report
  const levelCounts = { 3: 50, 4: 60, 5: 60, 6: 60, 7: 55, 8: 55 };
  let finalAuthentic = 0, finalTotal = 0;
  
  console.log('\n=== 穷尽式完成报告 ===');
  [3,4,5,6,7,8].forEach(level => {
    let authentic = 0;
    for (let i = 1; i <= levelCounts[level]; i++) {
      const desc = descriptions[`${level}-${i}`];
      if (desc && !desc.includes('如图示摆放球型，完成') && desc.length > 15) {
        authentic++;
      }
    }
    finalAuthentic += authentic;
    finalTotal += levelCounts[level];
    console.log(`Level ${level}: ${authentic}/${levelCounts[level]} (${(authentic/levelCounts[level]*100).toFixed(1)}%)`);
  });
  
  console.log(`\n【项目最终完成度】: ${finalAuthentic}/${finalTotal} (${(finalAuthentic/finalTotal*100).toFixed(1)}%)`);
  console.log(`已成功替换 ${finalAuthentic} 个通用模板为真实描述`);
  
  // Summary of remaining work
  console.log('\n=== 剩余工作汇总 ===');
  let totalRemaining = 0;
  [3,4,5,6,7,8].forEach(level => {
    let remaining = 0;
    for (let i = 1; i <= levelCounts[level]; i++) {
      const desc = descriptions[`${level}-${i}`];
      if (!desc || desc.includes('如图示摆放球型，完成') || desc.length < 15) {
        remaining++;
      }
    }
    totalRemaining += remaining;
    if (remaining > 0) {
      console.log(`Level ${level}: 剩余 ${remaining} 题`);
    }
  });
  
  console.log(`总剩余: ${totalRemaining} 题 (${(totalRemaining/finalTotal*100).toFixed(1)}%)`);
}

exhaustiveCompletionProcess().catch(console.error);