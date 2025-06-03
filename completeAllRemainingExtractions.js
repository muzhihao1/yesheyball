import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function extractDescription(level, exerciseNum) {
  const levelFolders = {
    3: '3、小试牛刀', 4: '4、炉火纯青', 5: '5、登堂入室', 
    6: '6、超群绝伦', 7: '7、登峰造极', 8: '8、出神入化'
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
      content = content.replace(/^题目说明[：:]\s*/g, '')
                     .replace(/过关要求.*$/gm, '')
                     .replace(/[；。\n]+$/, '')
                     .trim();
      return content.length > 8 ? content : null;
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function completeAllRemainingExtractions() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('完成所有剩余描述提取...');
  
  let totalExtracted = 0;
  
  // Priority: Complete levels 5-8 first, then finish 3-4
  for (const level of [5, 6, 7, 8, 3, 4]) {
    const maxEx = level === 3 ? 50 : (level <= 6 ? 60 : 55);
    console.log(`完成 Level ${level}`);
    
    for (let i = 1; i <= maxEx; i++) {
      const key = `${level}-${i}`;
      const currentDesc = descriptions[key];
      
      // Check if needs extraction
      if (!currentDesc || 
          currentDesc.includes('如图示摆放球型，完成') || 
          currentDesc.includes('精进台球技能练习') ||
          currentDesc.includes('高级台球技巧训练') ||
          currentDesc.length < 20) {
        
        const extracted = await extractDescription(level, i);
        if (extracted) {
          descriptions[key] = extracted;
          console.log(`${key}: ${extracted}`);
          totalExtracted++;
          // Save immediately
          fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
        }
      }
    }
  }
  
  console.log(`完成所有提取: ${totalExtracted} 个新描述`);
  
  // Final comprehensive report
  const levelCounts = { 3: 50, 4: 60, 5: 60, 6: 60, 7: 55, 8: 55 };
  let finalCompleted = 0, finalTotal = 0;
  
  console.log('\n=== 最终完成报告 ===');
  [3,4,5,6,7,8].forEach(level => {
    let completed = 0;
    for (let i = 1; i <= levelCounts[level]; i++) {
      const desc = descriptions[`${level}-${i}`];
      if (desc && 
          !desc.includes('如图示摆放球型，完成') && 
          !desc.includes('精进台球技能练习') &&
          !desc.includes('高级台球技巧训练') &&
          desc.length > 15) {
        completed++;
      }
    }
    finalCompleted += completed;
    finalTotal += levelCounts[level];
    
    const percentage = (completed/levelCounts[level]*100).toFixed(1);
    const status = completed === levelCounts[level] ? ' ✓ 完成' : '';
    console.log(`Level ${level}: ${completed}/${levelCounts[level]} (${percentage}%)${status}`);
  });
  
  console.log(`\n【项目总完成度】: ${finalCompleted}/${finalTotal} (${(finalCompleted/finalTotal*100).toFixed(1)}%)`);
  console.log(`成功替换 ${finalCompleted} 个通用模板为真实描述`);
  
  if (finalCompleted === finalTotal) {
    console.log('🎉 所有Level描述提取完成！');
  } else {
    console.log(`剩余 ${finalTotal - finalCompleted} 题`);
  }
}

completeAllRemainingExtractions().catch(console.error);