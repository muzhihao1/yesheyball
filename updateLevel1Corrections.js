import fs from 'fs';

// Apply specific corrections based on authentic image extractions
function correctLevel1Descriptions() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  console.log('应用等级1的精确描述修正...');

  // Key corrections based on successful extractions
  const corrections = {
    "1-4": "将白球向对面库边击打，使其返回时从1、2号球中间穿过",
    "1-5": "用白球击打瞄准点，每次瞄准点位置不一样",
    "1-19": "如图示摆放球型，将1号球打进袋",
    "1-20": "如图示摆放球型，白球每次与目标球摆成直线，将所有目标球打进袋",
    "1-25": "将1号球打进且白球停留在目标区域内",
    "1-29": "如图示摆放球型，将1号球打进且白球停留在目标区域内",
    "1-30": "如图示摆放球型，按1-2-1的顺序连续进球",
    "1-31": "如图示摆放球型，白球自由球起手，按球号顺序击打小号球，最后击打黑8完成清台",
    "1-35": "完成实战比赛，并指出比赛中出现的所有犯规行为"
  };

  // Apply corrections
  Object.entries(corrections).forEach(([key, desc]) => {
    const current = descriptions[key];
    if (current !== desc) {
      descriptions[key] = desc;
      console.log(`修正 ${key}: "${current}" -> "${desc}"`);
    }
  });

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log('等级1描述修正完成');
}

correctLevel1Descriptions();