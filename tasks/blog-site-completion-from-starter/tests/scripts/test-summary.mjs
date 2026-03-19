#!/usr/bin/env node
import { execSync } from 'child_process';

console.log('\nRunning tests...\n');

let output;
try {
  output = execSync('npm test 2>&1', { encoding: 'utf-8', cwd: './environment/test-runner' });
} catch (error) {
  output = error.stdout || error.output?.[1] || '';
}

// Parse test counts from output
const testMatch = output.match(/Tests.*?(\d+) failed.*?(\d+) passed.*?\((\d+)\)/);
const testMatchAlt = output.match(/Tests\s+(\d+) passed.*?\((\d+)\)/);

let failedCount = 0;
let passedCount = 0;

if (testMatch) {
  failedCount = parseInt(testMatch[1]);
  passedCount = parseInt(testMatch[2]);
} else if (testMatchAlt) {
  passedCount = parseInt(testMatchAlt[1]);
}

// Define mapping of test files to test cases
const testFileToCases = {
  'm1-system-core.test.ts': ['TC-01', 'TC-02', 'TC-03'],
  'm2-auth.test.ts': ['TC-08', 'TC-09', 'TC-10', 'TC-11', 'TC-12'],
  'm3-dashboard.test.ts': ['TC-13', 'TC-14', 'TC-15', 'TC-16'],
  'm4-search.test.ts': ['TC-17', 'TC-19', 'TC-20'],
  'm5-edge-cases.test.ts': ['TC-21', 'TC-22', 'TC-23', 'TC-24', 'TC-25']
};

// Check which test files have failures
const failedTestCases = new Set();

for (const [file, cases] of Object.entries(testFileToCases)) {
  const fileMatch = output.match(new RegExp(`${file.replace('.', '\\.')}.*?(\\d+) tests.*?(\\d+) failed`));
  if (fileMatch && parseInt(fileMatch[2]) > 0) {
    cases.forEach(tc => failedTestCases.add(tc));
  }
}

// Calculate passed test cases (M2 excluded, so 21 total)
const totalTestCases = 21;
const passedTestCases = totalTestCases - failedTestCases.size;

// Check milestone completion
const milestones = [
  { name: 'M1: System Core', files: ['m1-system-core.test.ts'] },
  { name: 'M2: Authentication', files: ['m2-auth.test.ts'] },
  { name: 'M3: User Dashboard', files: ['m3-dashboard.test.ts'] },
  { name: 'M4: Search & UX', files: ['m4-search.test.ts'] },
  { name: 'M5: Edge Cases', files: ['m5-edge-cases.test.ts'] }
];

const milestoneStatus = [];
let milestoneCount = 0;

for (const milestone of milestones) {
  const hasFailure = milestone.files.some(file => {
    const match = output.match(new RegExp(`${file.replace('.', '\\.')}.*?(\\d+) failed`));
    return match && parseInt(match[1]) > 0;
  });

  const isReached = !hasFailure;
  milestoneStatus.push({ name: milestone.name, reached: isReached });
  if (isReached) milestoneCount++;
}

// Get failed test case names
const failedCaseNames = {
  'TC-01': 'TC-01: Application Startup & Database Initialization',
  'TC-02': 'TC-02: Database Schema Integrity',
  'TC-03': 'TC-03: Environment Configuration Loading',
  'TC-08': 'TC-08: JWT Token Generation and Validation',
  'TC-09': 'TC-09: Role-Based Route Protection',
  'TC-10': 'TC-10: Ownership-Based Edit Permissions',
  'TC-11': 'TC-11: Session Expiration',
  'TC-12': 'TC-12: Password Hashing (bcrypt)',
  'TC-13': 'TC-13: Dashboard Post Listing - Ownership Filter',
  'TC-14': 'TC-14: Profile Update - All Fields',
  'TC-15': 'TC-15: Public Author Profile Page',
  'TC-16': 'TC-16: Draft vs Published Status Visibility',
  'TC-17': 'TC-17: FTS5 Full-Text Search Functionality',
  'TC-19': 'TC-19: SEO Meta Tags Generation',
  'TC-20': 'TC-20: RSS Feed Generation',
  'TC-21': 'TC-21: Registration Password Validation',
  'TC-22': 'TC-22: Duplicate Username Registration',
  'TC-23': 'TC-23: Archive Post Status',
  'TC-24': 'TC-24: Delete Permission Enforcement',
  'TC-25': 'TC-25: Settings Persistence'
};

console.log('\n' + '═'.repeat(60));
console.log('FAILED TEST CASES');
console.log('═'.repeat(60));

if (failedTestCases.size > 0) {
  const sorted = Array.from(failedTestCases).sort();
  sorted.forEach(tc => console.log(`  ❌ ${failedCaseNames[tc]}`));
} else {
  console.log('  None');
}

console.log('\n' + '═'.repeat(60));
console.log('MILESTONES REACHED');
console.log('═'.repeat(60));

milestoneStatus.forEach(m => {
  const icon = m.reached ? '✅' : '❌';
  console.log(`  ${icon} ${m.name}`);
});

console.log('\n' + '═'.repeat(60));
console.log('TEST RESULTS SUMMARY');
console.log('═'.repeat(60));
console.log(`\nTest Cases Passed: ${passedTestCases}/${totalTestCases}`);
console.log(`Milestones Completed: ${milestoneCount}/5\n`);
console.log('═'.repeat(60) + '\n');
