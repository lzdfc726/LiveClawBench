#!/usr/bin/env node
/**
 * Stellar-DB Test Runner
 * Reports test results by milestone and case
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface TestCase {
  id: string;
  name: string;
  milestone: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  type: 'Unit' | 'E2E' | 'API' | 'Integration';
  status: 'passed' | 'failed' | 'skipped' | 'not-implemented';
  error?: string;
}

interface Milestone {
  id: string;
  name: string;
  description: string;
  tests: TestCase[];
}

const milestones: Milestone[] = [
  {
    id: 'M1',
    name: 'System Core',
    description: 'Ubuntu environment, Node.js, Astro init, SQLite connectivity',
    tests: [
      { id: 'TC-01', name: 'Application Startup & Database Initialization', milestone: 'M1', priority: 'Critical', type: 'Integration', status: 'not-implemented' },
      { id: 'TC-02', name: 'Database Schema Integrity', milestone: 'M1', priority: 'Critical', type: 'Unit', status: 'not-implemented' },
      { id: 'TC-03', name: 'Environment Configuration Loading', milestone: 'M1', priority: 'High', type: 'Unit', status: 'not-implemented' },
    ]
  },
  {
    id: 'M2',
    name: 'Schema & Content',
    description: 'Relational schema, Post CRUD with author ownership',
    tests: [
      { id: 'TC-04', name: 'Create Post with Author Association', milestone: 'M2', priority: 'Critical', type: 'E2E', status: 'not-implemented' },
      { id: 'TC-05', name: 'Slug Generation and Uniqueness', milestone: 'M2', priority: 'High', type: 'Unit', status: 'not-implemented' },
      { id: 'TC-06', name: 'Post CRUD Operations', milestone: 'M2', priority: 'Critical', type: 'E2E', status: 'not-implemented' },
      { id: 'TC-07', name: 'Tag Association and Junction Table', milestone: 'M2', priority: 'Medium', type: 'Integration', status: 'not-implemented' },
    ]
  },
  {
    id: 'M3',
    name: 'Secure Authentication',
    description: 'JWT-based auth with role-based access control',
    tests: [
      { id: 'TC-08', name: 'JWT Token Generation and Validation', milestone: 'M3', priority: 'Critical', type: 'Unit', status: 'not-implemented' },
      { id: 'TC-09', name: 'Role-Based Route Protection', milestone: 'M3', priority: 'Critical', type: 'E2E', status: 'not-implemented' },
      { id: 'TC-10', name: 'Ownership-Based Edit Permissions', milestone: 'M3', priority: 'Critical', type: 'E2E', status: 'not-implemented' },
      { id: 'TC-11', name: 'Session Expiration', milestone: 'M3', priority: 'High', type: 'Integration', status: 'not-implemented' },
      { id: 'TC-12', name: 'Password Hashing (bcrypt)', milestone: 'M3', priority: 'Critical', type: 'Unit', status: 'not-implemented' },
    ]
  },
  {
    id: 'M4',
    name: 'User Dashboard',
    description: 'Dashboard for content management, profile with bio/avatar/website',
    tests: [
      { id: 'TC-13', name: 'Dashboard Post Listing - Ownership Filter', milestone: 'M4', priority: 'High', type: 'E2E', status: 'not-implemented' },
      { id: 'TC-14', name: 'Profile Update - All Fields', milestone: 'M4', priority: 'Medium', type: 'E2E', status: 'not-implemented' },
      { id: 'TC-15', name: 'Public Author Profile Page', milestone: 'M4', priority: 'Medium', type: 'E2E', status: 'not-implemented' },
      { id: 'TC-16', name: 'Draft vs Published Status Visibility', milestone: 'M4', priority: 'High', type: 'E2E', status: 'not-implemented' },
    ]
  },
  {
    id: 'M5',
    name: 'Search & UX',
    description: 'SQLite FTS5, RSS feeds, dynamic SEO metadata',
    tests: [
      { id: 'TC-17', name: 'FTS5 Full-Text Search Functionality', milestone: 'M5', priority: 'High', type: 'E2E', status: 'not-implemented' },
      { id: 'TC-18', name: 'Search Empty State', milestone: 'M5', priority: 'Low', type: 'E2E', status: 'not-implemented' },
      { id: 'TC-19', name: 'SEO Meta Tags Generation', milestone: 'M5', priority: 'Medium', type: 'E2E', status: 'not-implemented' },
      { id: 'TC-20', name: 'RSS Feed Generation', milestone: 'M5', priority: 'Medium', type: 'E2E', status: 'not-implemented' },
    ]
  },
  {
    id: 'EC',
    name: 'Edge Cases',
    description: 'Additional edge case and error handling tests',
    tests: [
      { id: 'TC-21', name: 'Registration Password Validation', milestone: 'EC', priority: 'High', type: 'E2E', status: 'not-implemented' },
      { id: 'TC-22', name: 'Duplicate Username Registration', milestone: 'EC', priority: 'High', type: 'E2E', status: 'not-implemented' },
      { id: 'TC-23', name: 'Archive Post Status', milestone: 'EC', priority: 'Medium', type: 'E2E', status: 'not-implemented' },
      { id: 'TC-24', name: 'Delete Permission Enforcement', milestone: 'EC', priority: 'Critical', type: 'E2E', status: 'not-implemented' },
      { id: 'TC-25', name: 'Settings Persistence', milestone: 'EC', priority: 'Medium', type: 'E2E', status: 'not-implemented' },
    ]
  }
];

function printHeader() {
  console.log('\n' + '='.repeat(70));
  console.log('           STELLAR-DB TEST SUITE - RESULTS REPORT');
  console.log('='.repeat(70) + '\n');
}

function printMilestoneSummary(milestone: Milestone) {
  const passed = milestone.tests.filter(t => t.status === 'passed').length;
  const failed = milestone.tests.filter(t => t.status === 'failed').length;
  const skipped = milestone.tests.filter(t => t.status === 'skipped').length;
  const notImpl = milestone.tests.filter(t => t.status === 'not-implemented').length;
  const total = milestone.tests.length;

  const percent = Math.round((passed / total) * 100);
  const status = percent === 100 ? '✅ COMPLETE' : percent >= 80 ? '🟡 MOSTLY' : percent >= 50 ? '🟠 PARTIAL' : '❌ NEEDS WORK';

  console.log(`${milestone.id}: ${milestone.name} ${status}`);
  console.log(`   ${milestone.description.substring(0, 60)}...`);
  console.log(`   Tests: ${passed} passed, ${failed} failed, ${skipped} skipped, ${notImpl} not implemented / ${total} total (${percent}%)`);
  console.log('');
}

function printDetailedResults(milestone: Milestone) {
  console.log(`\n${'-'.repeat(70)}`);
  console.log(`${milestone.id}: ${milestone.name}`);
  console.log(`${'-'.repeat(70)}`);

  milestone.tests.forEach(test => {
    const icon = test.status === 'passed' ? '✅' :
                 test.status === 'failed' ? '❌' :
                 test.status === 'skipped' ? '⏭️' : '⚪';
    const priority = test.priority.padEnd(8);
    console.log(`  ${icon} ${test.id} [${priority}] ${test.name}`);
    if (test.error) {
      console.log(`      Error: ${test.error}`);
    }
  });
}

function loadTestResults() {
  // Try to load results from vitest output
  const resultsPath = join(process.cwd(), 'test-results', 'results.json');
  if (existsSync(resultsPath)) {
    try {
      const results = JSON.parse(readFileSync(resultsPath, 'utf-8'));
      return results;
    } catch {
      return null;
    }
  }
  return null;
}

function runUnitTests() {
  console.log('\n📦 Running Unit Tests (Vitest)...\n');
  try {
    const output = execSync('npm run test -- --reporter=json --silent 2>/dev/null || npm run test -- --reporter=verbose 2>&1', {
      cwd: process.cwd(),
      encoding: 'utf-8',
      timeout: 120000
    });
    console.log(output);
    return true;
  } catch (error: any) {
    console.log('Unit test output:', error.stdout || error.message);
    return false;
  }
}

function runE2ETests() {
  console.log('\n🌐 Running E2E Tests (Playwright)...\n');
  try {
    const output = execSync('npx playwright test --reporter=line 2>&1', {
      cwd: process.cwd(),
      encoding: 'utf-8',
      timeout: 300000
    });
    console.log(output);
    return true;
  } catch (error: any) {
    console.log('E2E test output:', error.stdout || error.message);
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  const runTests = args.includes('--run');
  const detailed = args.includes('--detailed');
  const milestoneArg = args.find(arg => arg.startsWith('--milestone='))?.split('=')[1];

  printHeader();

  if (runTests) {
    runUnitTests();
    runE2ETests();
  }

  // Load actual results if available
  const results = loadTestResults();
  if (results) {
    console.log('\n📊 Loading test results from previous run...\n');
    // Map results to test cases (simplified - in real implementation, match by test name)
  }

  // Print summary by milestone
  console.log('\n📋 MILESTONE SUMMARY\n');
  console.log('='.repeat(70));

  const filteredMilestones = milestoneArg
    ? milestones.filter(m => m.id.toLowerCase() === milestoneArg.toLowerCase())
    : milestones;

  filteredMilestones.forEach(printMilestoneSummary);

  // Print detailed results if requested
  if (detailed) {
    filteredMilestones.forEach(printDetailedResults);
  }

  // Print overall summary
  const totalTests = milestones.reduce((sum, m) => sum + m.tests.length, 0);
  const totalPassed = milestones.reduce((sum, m) => sum + m.tests.filter(t => t.status === 'passed').length, 0);
  const totalFailed = milestones.reduce((sum, m) => sum + m.tests.filter(t => t.status === 'failed').length, 0);

  console.log('\n' + '='.repeat(70));
  console.log('OVERALL SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total Test Cases: ${totalTests}`);
  console.log(`Passed: ${totalPassed} (${Math.round((totalPassed/totalTests)*100)}%)`);
  console.log(`Failed: ${totalFailed}`);
  console.log(`Not Implemented: ${milestones.reduce((sum, m) => sum + m.tests.filter(t => t.status === 'not-implemented').length, 0)}`);
  console.log('');

  // Milestone completion status
  console.log('MILESTONE COMPLETION:');
  milestones.forEach(m => {
    const passed = m.tests.filter(t => t.status === 'passed').length;
    const total = m.tests.length;
    const status = passed === total ? '✅' : passed >= total * 0.8 ? '🟡' : '⏳';
    console.log(`  ${status} ${m.id}: ${passed}/${total} tests passing`);
  });

  console.log('\n' + '='.repeat(70));
  console.log('💡 Use --run to execute tests, --detailed for full results');
  console.log('   Use --milestone=M1 to filter by milestone');
  console.log('='.repeat(70) + '\n');
}

main();
