import fs from 'fs';

// Manual corrections for Level 1 exercises based on authentic Ye's Billiards Academy teaching images
function applyManualLevel1Corrections() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

  console.log('应用手动验证的等级1练习描述修正...');

  // Manual corrections based on authentic image analysis
  const manualCorrections = {
    // Exercises with specific target requirements (based on image analysis)
    "1-26": "将1号球打进且白球停留在目标区域内",
    "1-27": "将1号球打进且白球停留在目标区域内", 
    "1-32": "白球自由球起手，按球号顺序完成清台",
    "1-34": "将白球向对面库边击打，使其返回时碰到杆头，每杆需要使用不同的力度"
  };

  let corrected = 0;
  Object.entries(manualCorrections).forEach(([key, correctDesc]) => {
    const current = descriptions[key];
    if (current !== correctDesc) {
      descriptions[key] = correctDesc;
      console.log(`${key}: "${current}" -> "${correctDesc}"`);
      corrected++;
    } else {
      console.log(`${key}: 已正确 - "${correctDesc}"`);
    }
  });

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  
  console.log(`手动修正完成，更新了 ${corrected} 个描述`);
  
  // 验证所有等级1描述的完整性
  console.log('\n等级1所有描述验证:');
  for (let i = 1; i <= 35; i++) {
    const key = `1-${i}`;
    const desc = descriptions[key];
    if (desc.includes('按要求完成台球训练') || desc.length < 10) {
      console.log(`❌ ${key}: 需要验证 - "${desc}"`);
    } else {
      console.log(`✓ ${key}: 已验证 - "${desc}"`);
    }
  }
}

applyManualLevel1Corrections();