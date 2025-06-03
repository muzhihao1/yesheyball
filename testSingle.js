import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function testSingleExtraction() {
  // 测试提取一个具体的缺失习题
  const imagePath = path.join(process.cwd(), 'assessments', '2、小有所成', '2、小有所成_24.jpg');
  
  console.log('测试单个习题提取:');
  console.log('图片路径:', imagePath);
  console.log('文件存在:', fs.existsSync(imagePath));
  
  try {
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');
    
    console.log('图片大小:', imageData.length, 'bytes');
    console.log('开始API调用...');

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
    console.log('API响应:', content);
    
    if (content && !content.includes('无法') && !content.includes('抱歉')) {
      const requirement = content
        .replace(/^过关要求[:：]\s*/, '')
        .replace(/[；;。，,\s]+$/, '')
        .trim();
      
      console.log('提取的要求:', requirement);
      
      // 尝试保存到文件
      const requirementsPath = 'client/src/data/exerciseRequirements.json';
      let requirements = {};
      
      if (fs.existsSync(requirementsPath)) {
        requirements = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
      }
      
      requirements['2-23'] = requirement;
      
      fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
      console.log('保存成功到文件');
      
      // 验证保存
      const savedData = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
      console.log('验证保存结果:', savedData['2-23']);
      
    } else {
      console.log('提取失败，API返回无效内容');
    }
    
  } catch (error) {
    console.error('错误:', error.message);
  }
}

testSingleExtraction();