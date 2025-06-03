import fs from 'fs';

function applyAllAuthenticDescriptions() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  console.log('应用基于人工验证的所有准确描述...');

  // 基于人工验证图像内容的准确描述，解决AI提取错误问题
  const authenticDescriptions = {
    // Level 1 - 人工验证准确描述
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
    "1-12": "如图示摆放球型，将白球打进指定袋中",
    "1-13": "如图示摆放球型，将白球打进指定袋中",
    "1-14": "如图示摆放球型，将白球打进指定袋中",
    "1-15": "如图示摆放球型，将白球分别打进两侧底袋",
    "1-16": "如图示摆放球型，将目标球打进指定袋中",
    "1-17": "如图示摆放球型，将目标球打进指定袋中，每次只摆放一颗球",
    "1-18": "如图示摆放球型，将目标球打进指定袋中，每次只摆放一颗球",
    "1-19": "如图示摆放球型，将1号球打进袋",
    "1-20": "如图示摆放球型，白球每次与目标球摆成直线，将所有目标球打进袋",
    "1-21": "将白球往库边击打，使其吃库后停留在目标区域内",
    "1-22": "将白球往库边击打，使其吃库后停留在目标区域内",
    "1-23": "将白球往库边击打，使其吃库后停留在目标区域内", 
    "1-24": "将白球往库边击打，使其吃库后停留在目标区域内",
    "1-25": "将1号球打进且白球停留在目标区域内",
    "1-26": "将1号球打进且白球停留在目标区域内",
    "1-27": "将1号球打进且白球停留在目标区域内",
    "1-28": "将1号球打进且白球停留在目标区域内",
    "1-29": "如图示摆放球型，将1号球打进且白球停留在目标区域内",
    "1-30": "如图示摆放球型，按1-2-1的顺序连续进球",
    "1-31": "白球自由球起手，按球号顺序击打小号球，最后击打黑8完成清台",
    "1-32": "白球自由球起手，按球号顺序完成清台",
    "1-33": "白球自由摆放，按球号顺序完成清台",
    "1-34": "将白球向对面库边击打，使其返回时碰到杆头，每杆需要使用不同的力度",
    "1-35": "完成实战比赛，并指出比赛中出现的所有犯规行为"
  };

  let corrected = 0;
  const corrections = [];

  console.log('\n应用人工验证的准确描述:');

  Object.entries(authenticDescriptions).forEach(([key, correctDesc]) => {
    const current = descriptions[key];
    if (current !== correctDesc) {
      descriptions[key] = correctDesc;
      corrections.push({ 
        key, 
        from: current, 
        to: correctDesc,
        type: identifyErrorType(current, correctDesc)
      });
      corrected++;
    }
  });

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  
  console.log(`完成人工验证修正，更新了 ${corrected} 个练习描述`);
  
  if (corrections.length > 0) {
    console.log('\n修正的练习（AI提取错误类型分析）:');
    corrections.forEach(item => {
      console.log(`${item.key}: ${item.type}`);
      console.log(`  错误: "${item.from}"`);
      console.log(`  正确: "${item.to}"`);
    });
    
    // 分析AI提取错误模式
    const errorTypes = corrections.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\nAI提取错误模式统计:');
    Object.entries(errorTypes).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}次`);
    });
  }

  return { corrected, corrections };
}

function identifyErrorType(wrong, correct) {
  if (wrong.includes('往后击打') && correct.includes('往库边击打')) {
    return '字符识别错误 (后→库边)';
  }
  if (wrong.includes('对角底袋') && correct.includes('指定袋中')) {
    return '内容理解错误 (对角底袋→指定袋中)';
  }
  if (wrong.length !== correct.length) {
    return '文本长度差异';
  }
  if (wrong !== correct) {
    return '其他文本差异';
  }
  return '未知差异';
}

applyAllAuthenticDescriptions();