import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function consensusExtract(imagePath, exerciseKey) {
  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString('base64');

  const prompt = "提取图片中'题目说明：'的具体文字内容";

  const results = [];
  
  // Two initial extractions
  for (let attempt = 1; attempt <= 2; attempt++) {
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
        max_tokens: 80,
        temperature: 0
      });

      let content = response.choices[0].message.content;
      if (content && !content.includes('无法') && !content.includes('抱歉')) {
        content = content.replace(/^题目说明[：:]\s*/g, '');
        content = content.replace(/过关要求.*$/gm, '');
        content = content.replace(/；$/, '');
        content = content.trim();
        
        if (content.length > 8) {
          results.push(content);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 600));
    } catch (error) {
      console.error(`${exerciseKey} 提取${attempt}失败`);
    }
  }

  // Check consensus
  if (results.length === 2 && results[0] === results[1]) {
    console.log(`${exerciseKey}: 一致 - "${results[0]}"`);
    return results[0];
  }

  if (results.length >= 1) {
    console.log(`${exerciseKey}: 不一致，第三次提取`);
    
    // Third extraction
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
        max_tokens: 80,
        temperature: 0
      });

      let thirdResult = response.choices[0].message.content;
      if (thirdResult) {
        thirdResult = thirdResult.replace(/^题目说明[：:]\s*/g, '');
        thirdResult = thirdResult.replace(/过关要求.*$/gm, '');
        thirdResult = thirdResult.replace(/；$/, '');
        thirdResult = thirdResult.trim();
        
        results.push(thirdResult);
        
        // Find two matching results
        for (let i = 0; i < results.length; i++) {
          for (let j = i + 1; j < results.length; j++) {
            if (results[i] === results[j] && results[i].length > 8) {
              console.log(`${exerciseKey}: 共识 - "${results[i]}"`);
              return results[i];
            }
          }
        }
        
        // Return longest if no consensus
        const longest = results.reduce((a, b) => a.length > b.length ? a : b);
        console.log(`${exerciseKey}: 选择最长 - "${longest}"`);
        return longest;
      }
    } catch (error) {
      console.error(`${exerciseKey} 第三次提取失败`);
    }
  }

  return null;
}

async function updateGenericDescriptions() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  // Find exercises with generic descriptions
  const genericExercises = [];
  Object.entries(descriptions).forEach(([key, desc]) => {
    if (desc.includes('按要求完成台球训练') || 
        desc === '如图示摆放球型，将目标球击入指定袋内') {
      genericExercises.push(key);
    }
  });

  console.log(`发现 ${genericExercises.length} 个通用描述需要更新:`);
  genericExercises.forEach(key => console.log(`  ${key}: ${descriptions[key]}`));

  let updated = 0;

  for (const key of genericExercises) {
    const [level, exercise] = key.split('-');
    const levelFolders = {
      '1': '1、初窥门径',
      '2': '2、略有小成',
      '3': '3、渐入佳境',
      '4': '4、登堂入室',
      '5': '5、炉火纯青',
      '6': '6、出神入化',
      '7': '7、巧夺天工',
      '8': '8、登峰造极'
    };

    const folder = levelFolders[level];
    if (!folder) continue;

    const fileIndex = (parseInt(exercise) + 1).toString().padStart(2, '0');
    const imagePath = path.join(process.cwd(), 'assessments', folder, `${folder}_${fileIndex}.jpg`);

    if (fs.existsSync(imagePath)) {
      const extracted = await consensusExtract(imagePath, key);
      
      if (extracted && extracted !== descriptions[key]) {
        descriptions[key] = extracted;
        updated++;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (updated % 5 === 0) {
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
      }
    }
  }

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log(`\n共识提取完成，更新了 ${updated} 个描述`);
}

updateGenericDescriptions().catch(console.error);