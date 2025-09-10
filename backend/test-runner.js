#!/usr/bin/env node

// Set environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.NODE_ENV = 'test';

const { spawn } = require('child_process');

console.log('🧪 Running Patient Management System Tests\n');
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET ? '***SET***' : 'NOT SET'
});

const testFiles = [
  'tests/middlewares/authMiddleware.test.js',
  'tests/routes/authRoutes.test.js',
  'tests/routes/userRoutes.test.js', 
  'tests/routes/appointmentRoutes.test.js',
  'tests/patientRoutes.test.js'
];

async function runTest(testFile) {
  return new Promise((resolve) => {
    console.log(`\n📋 Running ${testFile}...`);
    
    const jest = spawn('npx', ['jest', testFile, '--verbose', '--no-coverage', '--forceExit'], {
      env: { ...process.env },
      stdio: 'pipe'
    });

    let output = '';
    let errorOutput = '';

    jest.stdout.on('data', (data) => {
      output += data.toString();
    });

    jest.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    jest.on('close', (code) => {
      if (code === 0) {
        console.log('✅ PASSED');
        // Extract test count from output
        const passedMatch = output.match(/(\d+) passed/);
        if (passedMatch) {
          console.log(`   ${passedMatch[1]} tests passed`);
        }
      } else {
        console.log('❌ FAILED');
        console.log('Output:', output.slice(-500)); // Last 500 chars
        console.log('Error:', errorOutput.slice(-500));
      }
      resolve({ code, output, errorOutput });
    });

    // Timeout after 15 seconds
    setTimeout(() => {
      jest.kill();
      console.log('⏰ TIMEOUT');
      resolve({ code: -1, output: 'Timeout', errorOutput: 'Test timed out' });
    }, 15000);
  });
}

async function runAllTests() {
  let totalPassed = 0;
  let totalFailed = 0;

  for (const testFile of testFiles) {
    const result = await runTest(testFile);
    if (result.code === 0) {
      totalPassed++;
    } else {
      totalFailed++;
    }
  }

  console.log('\n📊 Final Results:');
  console.log(`✅ Passed: ${totalPassed}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`📁 Total Files: ${testFiles.length}`);
}

runAllTests().catch(console.error);