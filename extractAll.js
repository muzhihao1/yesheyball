const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// 等级配置
const LEVEL_CONFIGS = [
  { level: 1, name: "初窥门径", totalExercises: 37 },
  { level: 2, name: "小有所成", totalExercises: 42 },
  { level: 3, name: "渐入佳境", totalExercises: 52 },
  { level: 4, name: "游刃有余", totalExercises: 48 },
  { level: 5, name: "炉火纯青", totalExercises: 52 },
  { level: 6, name: "超群绝伦", totalExercises: 62 },
  { level: 7, name: "登峰造极", totalExercises: 72 },
  { level: 8, name: "出神入化", totalExercises: 72 },
  { level: 9, name: "人杆合一", totalExercises: 72 }
];

async function analyzeExerciseImage(imagePath) {
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
              text: "请仔细分析这张台球习题图片，提取其中的过关要求文字内容。只返回过关要求的具体文字，如连续完成5次不失误或全部一次成功不失误等。不要包含其他解释或描述。"
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
      max_tokens: 100,
    });

    const content = response.choices[0].message.content;
    if (content) {
      // 清理文字，移除多余标点
      return content.replace(/；$/, '').replace(/;$/, '').trim();
    }
    return null;
  } catch (error) {
    console.error(`分析图片 ${imagePath} 失败:`, error.message);
    return null;
  }
}

async function extractAllRequirements() {
  console.log("开始批量提取所有习题的过关要求...");
  
  const allRequirements = {};
  let totalProcessed = 0;
  
  for (const config of LEVEL_CONFIGS) {
    console.log(`\n正在处理等级 ${config.level}: ${config.name}...`);
    
    // 从第2题开始处理 (跳过00和01)
    const actualExerciseCount = config.totalExercises - 2;
    
    for (let i = 0; i < actualExerciseCount; i++) {
      const exerciseIndex = (i + 2).toString().padStart(2, '0');
      const exerciseNumber = i + 1;
      const imagePath = path.join(process.cwd(), 'assessments', `${config.level}`, `${exerciseIndex}.png`);
      
      console.log(`  处理习题 ${exerciseNumber} (图片: ${exerciseIndex}.png)...`);
      
      try {
        const requirement = await analyzeExerciseImage(imagePath);
        if (requirement) {
          const key = `${config.level}-${exerciseNumber}`;
          allRequirements[key] = requirement;
          console.log(`    ✓ 提取成功: ${requirement}`);
          totalProcessed++;
        } else {
          console.log(`    ✗ 提取失败`);
        }
        
        // 添加延迟避免API限制
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`    ✗ 处理习题 ${exerciseNumber} 时出错:`, error.message);
      }
    }
  }
  
  // 保存到JSON文件
  const outputPath = path.join(process.cwd(), 'client/src/data/exerciseRequirements.json');
  
  // 确保目录存在
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(allRequirements, null, 2), 'utf8');
  
  console.log(`\n✅ 批量提取完成！`);
  console.log(`📊 总共处理了 ${totalProcessed} 个习题`);
  console.log(`💾 数据已保存到: ${outputPath}`);
}

// 运行脚本
extractAllRequirements().catch(console.error);