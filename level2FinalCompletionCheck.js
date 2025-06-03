import fs from 'fs';

function checkLevel2Completion() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  const descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  let authenticCount = 0;
  let genericCount = 0;
  const remaining = [];
  
  console.log('Level 2 Description Status:');
  console.log('=========================');
  
  for (let i = 1; i <= 40; i++) {
    const key = `2-${i}`;
    const desc = descriptions[key] || 'Missing';
    
    if (desc.includes('如图摆放球型，白球任意位置') || desc === 'Missing' || desc.length < 20) {
      genericCount++;
      remaining.push(i);
      console.log(`${key}: [Generic] ${desc.substring(0, 50)}...`);
    } else {
      authenticCount++;
      console.log(`${key}: [Authentic] ${desc.substring(0, 50)}...`);
    }
  }
  
  console.log('\n=========================');
  console.log(`Authentic descriptions: ${authenticCount}/40 (${(authenticCount/40*100).toFixed(1)}%)`);
  console.log(`Generic descriptions: ${genericCount}/40`);
  console.log(`Remaining exercises: ${remaining.join(', ')}`);
  
  if (remaining.length > 0) {
    console.log(`\nStill need to process ${remaining.length} exercises to complete Level 2`);
  } else {
    console.log('\nLevel 2 description extraction is complete!');
  }
}

checkLevel2Completion();