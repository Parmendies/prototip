const { execSync } = require('child_process');
const path = require('path');

console.log('================================================================');
console.log('🎯 DENTAPANEL FAZ 1 — TÜM E2E, UI/UX VE FONKSİYONEL TESTLER');
console.log('================================================================\n');

const tests = [
  'tests/e2e/test-01-patient-flow.js',
  'tests/e2e/test-02-secretary-desk.js',
  'tests/e2e/test-03-doctor-workspace.js',
  'tests/e2e/test-04-responsive-mobile.js',
];

let allPassed = true;

for (const t of tests) {
  try {
    console.log(`\n▶️ ÇALIŞTIRILIYOR: ${t}`);
    const out = execSync(`node ${t}`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`❌ TEST BAŞARISIZ OLDU: ${t}`);
    allPassed = false;
    process.exit(1);
  }
}

console.log('\n================================================================');
console.log('🏆 TÜM TESTLER %100 BAŞARIYLA GEÇTİ!');
console.log('================================================================\n');

