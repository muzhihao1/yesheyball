const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// 先处理前几个等级的关键习题进行验证
const TEST_SAMPLES = [
  { level: 1, name: "初窥门径", exercises: [2, 3, 4, 5, 6] }, // 对应 02.jpg, 03.jpg 等
  { level: 2, name: "小有所成", exercises: [2, 3, 4, 5, 6] },
  { level: 3, name: "渐入佳境", exercises: [2, 3, 4, 5, 6] }
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
              text: "请分析这张台球习题图片，提取过关要求文字。只返回具体要求，如连续完成5次不失误或全部一次成功不失误。"
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
      return content.replace(/；$/, '').replace(/;$/, '').trim();
    }
    return null;
  } catch (error) {
    console.error(`分析图片失败:`, error.message);
    return null;
  }
}

async function extractSampleRequirements() {
  console.log("开始提取样本习题的过关要求...");
  
  const allRequirements = {};
  let totalProcessed = 0;
  
  for (const sample of TEST_SAMPLES) {
    console.log(`\n正在处理等级 ${sample.level}: ${sample.name}...`);
    
    for (const exerciseNum of sample.exercises) {
      const paddedNum = exerciseNum.toString().padStart(2, '0');
      const levelName = sample.level + "、" + sample.name;
      const imagePath = path.join(process.cwd(), 'assessments', levelName, `${levelName}_${paddedNum}.jpg`);
      
      console.log(`  处理习题 ${exerciseNum - 1} (图片: ${paddedNum}.jpg)...`);
      
      try {
        const requirement = await analyzeExerciseImage(imagePath);
        if (requirement) {
          const key = `${sample.level}-${exerciseNum - 1}`;
          allRequirements[key] = requirement;
          console.log(`    ✓ 提取成功: ${requirement}`);
          totalProcessed++;
        } else {
          console.log(`    ✗ 提取失败`);
        }
        
        // 添加延迟避免API限制
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`    ✗ 处理习题时出错:`, error.message);
      }
    }
  }
  
  // 保存到JSON文件
  const outputPath = path.join(process.cwd(), 'client/src/data/exerciseRequirements.json');
  
  // 读取现有数据并合并
  let existingData = {};
  if (fs.existsSync(outputPath)) {
    existingData = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
  }
  
  const mergedData = { ...existingData, ...allRequirements };
  fs.writeFileSync(outputPath, JSON.stringify(mergedData, null, 2), 'utf8');
  
  console.log(`\n✅ 样本提取完成！`);
  console.log(`📊 总共处理了 ${totalProcessed} 个习题`);
  console.log(`💾 数据已保存到: ${outputPath}`);
}

extractSampleRequirements().catch(console.error);