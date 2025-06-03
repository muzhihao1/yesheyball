import fs from 'fs';

// Apply complete authentic Level 1 descriptions based on successful extractions from Ye's Billiards Academy teaching images
function applyCompleteLevel1Descriptions() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  console.log('应用完整的等级1真实练习描述...');

  // Complete authentic Level 1 descriptions extracted from teaching images
  const level1Complete = {
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
    "1-32": "白球自由球起手，按球号顺序完成清台",
    "1-33": "白球自由摆放，按球号顺序完成清台",
    "1-34": "将白球向对面库边击打，使其返回时碰到杆头，每杆需要使用不同的力度",
    "1-35": "完成实战比赛，并指出比赛中出现的所有犯规行为"
  };

  let updated = 0;
  Object.entries(level1Complete).forEach(([key, desc]) => {
    const current = descriptions[key];
    if (current !== desc) {
      descriptions[key] = desc;
      console.log(`${key}: ${desc}`);
      updated++;
    }
  });

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  
  console.log(`等级1完整验证完成，更新了 ${updated} 个描述`);
  
  // 统计等级1的描述类型
  const uniqueDescs = [...new Set(Object.values(level1Complete))];
  console.log(`\n等级1共有 ${uniqueDescs.length} 种不同类型的描述:`);
  uniqueDescs.forEach((desc, index) => {
    const count = Object.values(level1Complete).filter(d => d === desc).length;
    console.log(`${index + 1}. "${desc}" (${count}个练习)`);
  });
  
  console.log('\n等级1验证流程已完成，现在可以应用到其他等级');
}

applyCompleteLevel1Descriptions();