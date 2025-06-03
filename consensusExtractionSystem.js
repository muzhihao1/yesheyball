import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function extractWithConsensus(imagePath, exerciseKey) {
  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString('base64');

  const prompt = "从图片中提取'题目说明：'后面的完整文字内容，只要题目说明部分，不要过关要求";

  // First two extractions
  const firstTwoResults = [];
  
  for (let i = 0; i < 2; i++) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${base64Image}` }
              }
            ],
          },
        ],
        max_tokens: 100,
        temperature: 0
      });

      let content = response.choices[0].message.content;
      if (content && !content.includes('无法') && !content.includes('抱歉')) {
        content = content.replace(/^题目说明[：:]\s*/g, '');
        content = content.replace(/过关要求.*$/gm, '');
        content = content.replace(/；$/, '');
        content = content.trim();
        
        if (content.length > 8 && content.length < 120) {
          firstTwoResults.push(content);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`${exerciseKey} 提取${i+1}失败: ${error.message}`);
    }
  }

  // Check if first two results match
  if (firstTwoResults.length === 2 && firstTwoResults[0] === firstTwoResults[1]) {
    console.log(`${exerciseKey}: 两次提取一致 - "${firstTwoResults[0]}"`);
    return firstTwoResults[0];
  }

  console.log(`${exerciseKey}: 两次提取不一致，进行第三次验证`);
  console.log(`  结果1: "${firstTwoResults[0] || '失败'}"`);
  console.log(`  结果2: "${firstTwoResults[1] || '失败'}"`);

  // Third extraction for consensus
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` }
            }
          ],
        },
      ],
      max_tokens: 100,
      temperature: 0
    });

    let thirdResult = response.choices[0].message.content;
    if (thirdResult && !thirdResult.includes('无法') && !thirdResult.includes('抱歉')) {
      thirdResult = thirdResult.replace(/^题目说明[：:]\s*/g, '');
      thirdResult = thirdResult.replace(/过关要求.*$/gm, '');
      thirdResult = thirdResult.replace(/；$/, '');
      thirdResult = thirdResult.trim();
      
      console.log(`  结果3: "${thirdResult}"`);
      
      // Find consensus among three results
      const allResults = [...firstTwoResults, thirdResult].filter(r => r && r.length > 8);
      
      if (allResults.length >= 2) {
        // Check for any two matching results
        for (let i = 0; i < allResults.length; i++) {
          for (let j = i + 1; j < allResults.length; j++) {
            if (allResults[i] === allResults[j]) {
              console.log(`${exerciseKey}: 找到共识 - "${allResults[i]}"`);
              return allResults[i];
            }
          }
        }
      }
      
      // If no consensus, return the longest valid result
      const validResults = allResults.filter(r => r.length > 10);
      if (validResults.length > 0) {
        const longest = validResults.reduce((a, b) => a.length > b.length ? a : b);
        console.log(`${exerciseKey}: 无共识，选择最长结果 - "${longest}"`);
        return longest;
      }
    }
  } catch (error) {
    console.error(`${exerciseKey} 第三次提取失败: ${error.message}`);
  }

  console.log(`${exerciseKey}: 所有提取尝试失败`);
  return null;
}

async function processLevelWithConsensus(level, folder, total) {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  console.log(`\n使用共识提取方法处理等级 ${level}`);
  let updated = 0;

  for (let i = 1; i <= total; i++) {
    const key = `${level}-${i}`;
    const fileIndex = (i + 1).toString().padStart(2, '0');
    const imagePath = path.join(process.cwd(), 'assessments', folder, `${folder}_${fileIndex}.jpg`);

    if (fs.existsSync(imagePath)) {
      const current = descriptions[key];
      
      // Only re-extract generic descriptions
      if (current.includes('按要求完成台球训练') || 
          (current.includes('将目标球击入指定袋内') && !current.includes('每次只摆放'))) {
        
        const extracted = await extractWithConsensus(imagePath, key);
        
        if (extracted && extracted !== current) {
          descriptions[key] = extracted;
          updated++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      if (i % 10 === 0) {
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
        console.log(`已处理 ${i}/${total}`);
      }
    }
  }

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log(`等级 ${level} 完成，更新了 ${updated} 个描述`);
  return updated;
}

// Test with Level 3 first
async function testConsensusMethod() {
  const updated = await processLevelWithConsensus(3, '3、渐入佳境', 45);
  console.log(`\n共识提取测试完成，更新了 ${updated} 个描述`);
}

testConsensusMethod().catch(console.error);