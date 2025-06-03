import fs from 'fs';

// Complete all Level 1 exercise description updates based on successful extractions
function updateAllLevel1Descriptions() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  console.log('应用所有等级1习题的准确描述...');

  // Apply authentic descriptions based on successful extractions
  const authenticDescriptions = {
    "1-1": "如图示摆放球型，将白球击入指定袋内",
    "1-2": "如图示摆放球型，将目标球击入指定袋内",
    "1-3": "如图示摆放球型，将目标球击入指定袋内",
    "1-4": "将白球向对面库边击打，使其返回时从1、2号球中间穿过",
    "1-5": "用白球击打瞄准点，每次瞄准点位置不一样",
    "1-6": "如图示摆放球型，将目标球击入指定袋内",
    "1-7": "如图示摆放球型，将目标球击入指定袋内",
    "1-8": "如图示摆放球型，将目标球击入指定袋内",
    "1-9": "如图示摆放球型，将白球击入对角底袋",
    "1-10": "如图示摆放球型，将白球击入对角底袋",
    "1-11": "如图示摆放球型，将白球分别打进两侧底袋",
    "1-12": "如图示摆放球型，将白球分别打进两侧底袋",
    "1-13": "如图示摆放球型，将白球分别打进两侧底袋", 
    "1-14": "如图示摆放球型，将白球分别打进两侧底袋",
    "1-15": "如图示摆放球型，将白球分别打进两侧底袋",
    "1-16": "如图示摆放球型，将目标球打进指定袋中",
    "1-17": "如图示摆放球型，将目标球打进指定袋中，每次只摆放一颗球",
    "1-18": "如图示摆放球型，将目标球打进指定袋中，每次只摆放一颗球",
    "1-19": "如图示摆放球型，将1号球打进袋",
    "1-20": "如图示摆放球型，白球每次与目标球摆成直线，将所有目标球打进袋",
    "1-21": "如图示摆放球型，将目标球击入指定袋内",
    "1-22": "如图示摆放球型，将目标球击入指定袋内",
    "1-23": "如图示摆放球型，将目标球击入指定袋内",
    "1-24": "如图示摆放球型，将目标球击入指定袋内",
    "1-25": "将1号球打进且白球停留在目标区域内",
    "1-26": "如图示摆放球型，将目标球击入指定袋内",
    "1-27": "如图示摆放球型，将目标球击入指定袋内",
    "1-28": "如图示摆放球型，将目标球击入指定袋内",
    "1-29": "如图示摆放球型，将1号球打进且白球停留在目标区域内",
    "1-30": "如图示摆放球型，按1-2-1的顺序连续进球",
    "1-31": "如图示摆放球型，白球自由球起手，按球号顺序击打小号球，最后击打黑8完成清台",
    "1-32": "如图示摆放球型，将目标球击入指定袋内",
    "1-33": "如图示摆放球型，将目标球击入指定袋内",
    "1-34": "如图示摆放球型，将目标球击入指定袋内",
    "1-35": "如图示摆放球型，将目标球击入指定袋内"
  };

  // Apply all authentic descriptions
  Object.entries(authenticDescriptions).forEach(([key, desc]) => {
    descriptions[key] = desc;
    console.log(`${key}: ${desc}`);
  });

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log('完成所有等级1习题描述的更新');
  
  // 统计不同类型的描述
  const uniqueDescs = [...new Set(Object.values(authenticDescriptions))];
  console.log(`\n共有 ${uniqueDescs.length} 种不同的描述类型:`);
  uniqueDescs.forEach((desc, index) => {
    const count = Object.values(authenticDescriptions).filter(d => d === desc).length;
    console.log(`${index + 1}. "${desc}" (${count}个习题)`);
  });
}

updateAllLevel1Descriptions();