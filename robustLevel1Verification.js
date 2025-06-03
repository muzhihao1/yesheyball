import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function extractExactDescription(imagePath, exerciseKey) {
  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString('base64');

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: [{
          type: "text",
          text: "请逐字逐句准确提取图片中'题目说明：'后面的完整文字内容，不要添加或删除任何字符"
        }, {
          type: "image_url",
          image_url: { url: `data:image/jpeg;base64,${base64Image}` }
        }]
      }],
      max_tokens: 120,
      temperature: 0
    });

    let content = response.choices[0].message.content;
    if (content && !content.includes('无法') && !content.includes('抱歉')) {
      // 清理提取的内容
      content = content.replace(/^题目说明[：:]\s*/g, '');
      content = content.replace(/过关要求.*$/gm, '');
      content = content.replace(/^["']|["']$/g, ''); // 移除引号
      content = content.replace(/[；。]$/, ''); // 移除末尾标点
      content = content.trim();
      
      if (content.length > 5) {
        return content;
      }
    }
  } catch (error) {
    console.error(`${exerciseKey} 提取失败: ${error.message}`);
  }

  return null;
}

async function verifyAllLevel1WithExactExtraction() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  console.log('精确验证等级1所有练习...\n');
  
  const mismatches = [];
  let processed = 0;

  for (let i = 1; i <= 35; i++) {
    const key = `1-${i}`;
    const current = descriptions[key];
    
    const fileIndex = (i + 1).toString().padStart(2, '0');
    const imagePath = path.join(
      process.cwd(), 
      'assessments', 
      '1、初窥门径', 
      `1、初窥门径_${fileIndex}.jpg`
    );

    console.log(`验证 ${key}: "${current}"`);

    if (fs.existsSync(imagePath)) {
      const extracted = await extractExactDescription(imagePath, key);
      
      if (extracted) {
        // 精确比较，检查是否完全一致
        const isExactMatch = extracted === current;
        
        if (!isExactMatch) {
          mismatches.push({
            key: key,
            current: current,
            extracted: extracted,
            difference: findDifference(current, extracted)
          });
          
          console.log(`  ❌ 不匹配:`);
          console.log(`     当前: "${current}"`);
          console.log(`     提取: "${extracted}"`);
          console.log(`     差异: ${findDifference(current, extracted)}`);
          
          // 更新为精确提取的内容
          descriptions[key] = extracted;
        } else {
          console.log(`  ✅ 完全匹配`);
        }
      } else {
        console.log(`  ⚠️  提取失败`);
      }
      
      processed++;
      await new Promise(resolve => setTimeout(resolve, 500));
    } else {
      console.log(`  ❌ 图片文件不存在: ${imagePath}`);
    }
  }

  if (mismatches.length > 0) {
    fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
    
    console.log(`\n发现 ${mismatches.length} 个不匹配的描述，已全部修正:`);
    mismatches.forEach(item => {
      console.log(`${item.key}:`);
      console.log(`  原描述: "${item.current}"`);
      console.log(`  新描述: "${item.extracted}"`);
      console.log(`  差异类型: ${item.difference}\n`);
    });
  } else {
    console.log('\n所有练习描述都与原图完全匹配');
  }

  return { processed, mismatches: mismatches.length };
}

function findDifference(str1, str2) {
  if (str1.length !== str2.length) {
    return `长度不同 (${str1.length} vs ${str2.length})`;
  }
  
  for (let i = 0; i < str1.length; i++) {
    if (str1[i] !== str2[i]) {
      return `第${i+1}个字符不同 ('${str1[i]}' vs '${str2[i]}')`;
    }
  }
  
  return '内容完全相同';
}

verifyAllLevel1WithExactExtraction().catch(console.error);