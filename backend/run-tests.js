#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Running Patient Management System Test Suite\n');

const testFiles = [
  'tests/middlewares/authMiddleware.test.js',
  'tests/routes/authRoutes.test.js', 
  'tests/routes/userRoutes.test.js',
  'tests/routes/appointmentRoutes.test.js',
  'tests/patientRoutes.test.js'
];

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

for (const testFile of testFiles) {
  try {
    console.log(`\n📋 Running ${testFile}...`);
    const result = execSync(`npx jest ${testFile} --verbose --no-coverage`, { 
      encoding: 'utf8',
      timeout: 30000 
    });
    
    // Parse results
    const lines = result.split('\n');
    const testLine = lines.find(line => line.includes('Tests:'));
    if (testLine) {
      const matches = testLine.match(/(\d+) passed/);
      if (matches) {
        const passed = parseInt(matches[1]);
        passedTests += passed;
        totalTests += passed;
        console.log(`✅ ${passed} tests passed`);
      }
    }
  } catch (error) {
    console.log(`❌ Tests failed in ${testFile}`);
    console.log(error.stdout || error.message);
    failedTests++;
  }
}

console.log('\n📊 Test Summary:');
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);

if (failedTests === 0) {
  console.log('\n🎉 All tests passed!');
} else {
  console.log('\n⚠️  Some tests failed. Check the output above.');
}