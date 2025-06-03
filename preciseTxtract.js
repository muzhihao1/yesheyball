import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// 根据真实文件结构精确分析特定习题
async function analyzeSpecificExercise(level, exerciseNumber) {
  const levelNames = {
    1: "1、初窥门径",
    2: "2、小有所成", 
    3: "3、渐入佳境",
    4: "4、炉火纯青",
    5: "5、登堂入室",
    6: "6、超群绝伦",
    7: "7、登峰造极"
  };
  
  const levelName = levelNames[level];
  if (!levelName) return null;
  
  // 跳过前两张图片，从02开始对应第1题
  const fileIndex = (exerciseNumber + 1).toString().padStart(2, '0');
  const imagePath = path.join(process.cwd(), 'assessments', levelName, `${levelName}_${fileIndex}.jpg`);
  
  try {
    if (!fs.existsSync(imagePath)) {
      console.log(`图片不存在: ${imagePath}`);
      return null;
    }

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
              text: "请仔细分析这张台球习题图片，准确提取图片中过关要求部分的文字内容。只返回过关要求的具体文字，不要添加任何其他内容。例如：连续完成3次不失误、全部一次成功不失误等。"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      max_tokens: 50,
    });

    const content = response.choices[0].message.content;
    if (content) {
      // 清理提取的文字，移除末尾标点符号
      return content.replace(/[；;。，,\s]+$/, '').trim();
    }
    return null;
  } catch (error) {
    console.error(`分析习题 ${level}-${exerciseNumber} 失败:`, error.message);
    return null;
  }
}

// 验证和更新特定习题的过关要求
async function verifyAndUpdateExercise(level, exerciseNumber) {
  console.log(`正在验证等级${level}第${exerciseNumber}题的过关要求...`);
  
  const requirement = await analyzeSpecificExercise(level, exerciseNumber);
  if (requirement) {
    console.log(`提取到过关要求: ${requirement}`);
    
    // 更新配置文件
    const configPath = path.join(process.cwd(), 'client/src/data/exerciseRequirements.json');
    let config = {};
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    
    const key = `${level}-${exerciseNumber}`;
    config[key] = requirement;
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    console.log(`已更新配置: ${key} = ${requirement}`);
    
    return requirement;
  } else {
    console.log(`未能提取到过关要求`);
    return null;
  }
}

// 验证第1级前几题
async function verifyLevel1Exercises() {
  console.log("开始验证等级1的前几题...");
  
  for (let i = 1; i <= 5; i++) {
    await verifyAndUpdateExercise(1, i);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log("验证完成");
}

verifyLevel1Exercises().catch(console.error);