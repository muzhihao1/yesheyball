import { batchAnalyzeExercises } from "./imageAnalyzer.js";
import fs from "fs";
import path from "path";

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

async function extractAllRequirements() {
  console.log("开始批量提取所有习题的过关要求...");
  
  const allRequirements: { [key: string]: string } = {};
  let totalProcessed = 0;
  
  for (const config of LEVEL_CONFIGS) {
    console.log(`\n正在处理等级 ${config.level}: ${config.name}...`);
    
    try {
      const levelRequirements = await batchAnalyzeExercises(
        config.level, 
        config.name, 
        config.totalExercises
      );
      
      // 转换为前端需要的格式
      Object.entries(levelRequirements).forEach(([exerciseIndex, requirement]) => {
        const exerciseNumber = parseInt(exerciseIndex) + 1; // 因为我们跳过了前两张图片
        const key = `${config.level}-${exerciseNumber}`;
        if (requirement.requirement) {
          // 清理要求文字，移除多余标点
          const cleanRequirement = requirement.requirement
            .replace(/；$/, '')
            .replace(/;$/, '')
            .trim();
          allRequirements[key] = cleanRequirement;
          totalProcessed++;
        }
      });
      
      console.log(`等级 ${config.level} 处理完成，提取了 ${Object.keys(levelRequirements).length} 个习题要求`);
      
    } catch (error) {
      console.error(`处理等级 ${config.level} 时出错:`, error);
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
  console.log('\n现在可以更新前端代码使用这个静态配置文件，而不需要每次都调用API。');
}

// 直接执行提取
extractAllRequirements().catch(console.error);

export { extractAllRequirements };
