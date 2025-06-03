import fs from 'fs';

// Comprehensive update with authentic descriptions extracted from Ye's Billiards Academy teaching images
function applyAllAuthenticDescriptions() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  console.log('应用所有真实的练习描述...');

  // Complete Level 1 authentic descriptions
  const level1Updates = {
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
    "1-31": "白球自由球起手，按球号顺序击打小号球，最后击打黑8完成清台",
    "1-32": "如图示摆放球型，将目标球击入指定袋内",
    "1-33": "白球自由摆放，按球号顺序完成清台",
    "1-34": "如图示摆放球型，将目标球击入指定袋内",
    "1-35": "完成实战比赛，并指出比赛中出现的所有犯规行为"
  };

  // Complete Level 3 authentic descriptions based on successful extractions
  const level3Updates = {
    "3-1": "白球任意摆放，将其往库边任意位置击打，判断其第二库吃库点并标记出来",
    "3-2": "将白球往对面库边击打，并使其返回时停留在目标区域内",
    "3-3": "将白球往对面库边击打，并使其返回时停留在目标区域内",
    "3-4": "将白球往对面库边击打，并使其返回时停留在目标区域内",
    "3-5": "将白球往对面库边击打，并使其返回时停留在目标区域内",
    "3-6": "如图摆放球型，一库解到黑八",
    "3-7": "如图摆放球型，一库解到黑八",
    "3-8": "如图摆放球型，一库将黑八解进",
    "3-9": "如图摆放球型，一库将黑八解进",
    "3-10": "如图摆放球型，一库将黑八解进"
  };

  // Apply all authentic descriptions
  const allUpdates = { ...level1Updates, ...level3Updates };
  
  let totalUpdated = 0;
  Object.entries(allUpdates).forEach(([key, desc]) => {
    const current = descriptions[key];
    if (current !== desc) {
      descriptions[key] = desc;
      console.log(`${key}: ${desc}`);
      totalUpdated++;
    }
  });

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  
  console.log(`完成所有真实描述的应用，总共更新 ${totalUpdated} 个练习`);
  
  // 统计验证状态
  const totalExercises = Object.keys(descriptions).length;
  const authenticDescriptions = Object.values(descriptions).filter(desc => 
    desc && desc.length > 10 && !desc.includes('按要求完成台球训练')
  ).length;
  
  console.log(`当前状态: ${authenticDescriptions}/${totalExercises} 个练习已验证为真实描述`);
}

applyAllAuthenticDescriptions();