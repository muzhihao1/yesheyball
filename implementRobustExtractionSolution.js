import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Solution 1: Multiple extraction attempts with different prompts
async function multipleExtractionAttempts(imagePath) {
  const prompts = [
    "从图片的'题目说明：'部分提取完整文字",
    "准确读取图中题目说明的具体内容",
    "提取练习说明部分的文字，不包括过关要求"
  ];

  const results = [];

  for (const prompt of prompts) {
    try {
      const imageData = fs.readFileSync(imagePath);
      const base64Image = imageData.toString('base64');

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
          results.push(content);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`提取失败: ${error.message}`);
    }
  }

  return results;
}

// Solution 2: Pattern validation for extracted content
function validateExtractedContent(content, exerciseNum) {
  const validPatterns = [
    /^如图示摆放球型/,
    /^将白球/,
    /^用白球/,
    /^白球自由/,
    /^完成实战比赛/
  ];

  const invalidPatterns = [
    /按要求完成台球训练/,
    /过关要求/,
    /连续完成.*次/,
    /无法/,
    /抱歉/
  ];

  // Check if content matches invalid patterns
  for (const pattern of invalidPatterns) {
    if (pattern.test(content)) {
      return false;
    }
  }

  // Check if content matches valid patterns
  for (const pattern of validPatterns) {
    if (pattern.test(content)) {
      return true;
    }
  }

  return content.length > 10 && content.length < 100;
}

// Solution 3: Select best result from multiple extractions
function selectBestResult(results, exerciseNum) {
  if (!results || results.length === 0) return null;

  // Filter valid results
  const validResults = results.filter(result => 
    validateExtractedContent(result, exerciseNum)
  );

  if (validResults.length === 0) return null;

  // Prefer more specific descriptions over generic ones
  const specificResults = validResults.filter(result => 
    !result.includes('如图示摆放球型，将目标球击入指定袋内')
  );

  if (specificResults.length > 0) {
    // Return the most common specific result
    const resultCounts = {};
    specificResults.forEach(result => {
      resultCounts[result] = (resultCounts[result] || 0) + 1;
    });
    
    return Object.keys(resultCounts).reduce((a, b) => 
      resultCounts[a] > resultCounts[b] ? a : b
    );
  }

  return validResults[0];
}

// Solution 4: Comprehensive Level 1 verification with robust extraction
async function robustLevel1Verification() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  console.log('使用鲁棒提取方法验证等级1...');
  let improved = 0;

  for (let i = 1; i <= 35; i++) {
    const key = `1-${i}`;
    const fileIndex = (i + 1).toString().padStart(2, '0');
    const imagePath = path.join(
      process.cwd(), 
      'assessments', 
      '1、初窥门径', 
      `1、初窥门径_${fileIndex}.jpg`
    );

    if (fs.existsSync(imagePath)) {
      const current = descriptions[key];
      
      // Only re-extract for generic descriptions
      if (current.includes('将目标球击入指定袋内') && 
          !current.includes('每次只摆放一颗球')) {
        
        console.log(`改进 ${key}: ${current}`);
        
        const extractionResults = await multipleExtractionAttempts(imagePath);
        const bestResult = selectBestResult(extractionResults, i);
        
        if (bestResult && bestResult !== current) {
          descriptions[key] = bestResult;
          console.log(`  更新为: ${bestResult}`);
          improved++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      if (i % 10 === 0) {
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
        console.log(`已处理 ${i}/35`);
      }
    }
  }

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log(`鲁棒验证完成，改进了 ${improved} 个描述`);
}

robustLevel1Verification().catch(console.error);