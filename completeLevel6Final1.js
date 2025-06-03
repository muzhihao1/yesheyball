import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function extractRequirement(imagePath) {
  try {
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "你是台球习题专家。请仔细查看图片中的中文文字，找到'过关要求'这几个字后面的具体要求内容。只返回过关要求的准确文字，不要添加任何解释或格式。"
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "提取这张台球习题图片中'过关要求'后面的准确中文要求。"
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` }
            }
          ],
        },
      ],
      max_tokens: 50,
      temperature: 0
    });

    const content = response.choices[0].message.content;
    if (content && !content.includes('无法') && !content.includes('抱歉')) {
      return content
        .replace(/^过关要求[:：]\s*/, '')
        .replace(/[；;。，,\s]+$/, '')
        .trim();
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function completeLevel6Final1() {
  const requirementsPath = 'client/src/data/exerciseRequirements.json';
  let requirements = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
  
  console.log(`完成等级6最后1个习题验证 (60)`);

  const i = 60;
  const key = `6-${i}`;
  
  if (!requirements[key]) {
    const fileIndex = (i + 1).toString().padStart(2, '0');
    const imagePath = path.join(
      process.cwd(), 
      'assessments', 
      '6、超群绝伦', 
      `6、超群绝伦_${fileIndex}.jpg`
    );

    if (fs.existsSync(imagePath)) {
      console.log(`6-${i}`);
      
      const requirement = await extractRequirement(imagePath);
      
      if (requirement) {
        requirements[key] = requirement;
        console.log(`  ✓ ${requirement}`);
        
        fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
        const current = Object.keys(requirements).length;
        const level6Current = Object.keys(requirements).filter(k => k.startsWith('6-')).length;
        console.log(`  ${current}/415 (等级6: ${level6Current}/60)\n`);
      }
    }
  }

  const level6Count = Object.keys(requirements).filter(k => k.startsWith('6-')).length;
  const finalCount = Object.keys(requirements).length;
  
  console.log(`等级6验证状态: ${level6Count}/60`);
  console.log(`总进度: ${finalCount}/415 (${Math.round(finalCount/415*100)}%)`);
  
  if (level6Count === 60) {
    console.log('\n🎉 等级6 (超群绝伦) 验证完成！');
    console.log('六个等级全部完成验证，准备开始等级7验证');
  }
}

completeLevel6Final1().catch(console.error);