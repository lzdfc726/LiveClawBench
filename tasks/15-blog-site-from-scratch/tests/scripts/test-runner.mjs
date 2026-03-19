#!/usr/bin/env node
/**
 * Stellar-DB Comprehensive Test Runner
 * Maps TEST-CASES.md to actual test implementations
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test case to file mapping
const testMapping = {
  'M1': {
    name: 'System Core',
    testCases: {
      'TC-01': {
        name: 'Application Startup & Database Initialization',
        unitFile: 'm1-system-core/m1-system-core.test.ts',
        e2eFile: null,
        status: 'implemented'
      },
      'TC-02': {
        name: 'Database Schema Integrity',
        unitFile: 'm1-system-core/m1-system-core.test.ts',
        e2eFile: null,
        status: 'implemented'
      },
      'TC-03': {
        name: 'Environment Configuration Loading',
        unitFile: 'm1-system-core/m1-system-core.test.ts',
        e2eFile: null,
        status: 'implemented'
      }
    }
  },
  'M2': {
    name: 'Schema & Content',
    testCases: {
      'TC-04': {
        name: 'Create Post with Author Association',
        unitFile: 'm2-schema-content/m2-schema-content.test.ts',
        e2eFile: 'e2e/milestones.spec.ts',
        status: 'implemented'
      },
      'TC-05': {
        name: 'Slug Generation and Uniqueness',
        unitFile: 'm2-schema-content/m2-schema-content.test.ts',
        e2eFile: null,
        status: 'implemented'
      },
      'TC-06': {
        name: 'Post CRUD Operations',
        unitFile: 'm2-schema-content/m2-schema-content.test.ts',
        e2eFile: 'e2e/milestones.spec.ts',
        status: 'implemented'
      },
      'TC-07': {
        name: 'Tag Association and Junction Table',
        unitFile: 'm2-schema-content/m2-integration.test.ts',
        e2eFile: null,
        status: 'implemented'
      }
    }
  },
  'M3': {
    name: 'Secure Authentication',
    testCases: {
      'TC-08': {
        name: 'JWT Token Generation and Validation',
        unitFile: 'm3-auth/m3-auth.test.ts',
        e2eFile: null,
        status: 'implemented'
      },
      'TC-09': {
        name: 'Role-Based Route Protection',
        unitFile: 'm3-auth/m3-auth.test.ts',
        e2eFile: 'e2e/milestones.spec.ts',
        status: 'implemented'
      },
      'TC-10': {
        name: 'Ownership-Based Edit Permissions',
        unitFile: 'm3-auth/m3-auth.test.ts',
        e2eFile: 'e2e/milestones.spec.ts',
        status: 'implemented'
      },
      'TC-11': {
        name: 'Session Expiration',
        unitFile: 'm3-auth/m3-auth.test.ts',
        e2eFile: null,
        status: 'implemented'
      },
      'TC-12': {
        name: 'Password Hashing (bcrypt)',
        unitFile: 'm3-auth/m3-auth.test.ts',
        e2eFile: null,
        status: 'implemented'
      }
    }
  },
  'M4': {
    name: 'User Dashboard',
    testCases: {
      'TC-13': {
        name: 'Dashboard Post Listing - Ownership Filter',
        unitFile: 'm4-dashboard/m4-dashboard.test.ts',
        e2eFile: 'e2e/milestones.spec.ts',
        status: 'implemented'
      },
      'TC-14': {
        name: 'Profile Update - All Fields',
        unitFile: 'm4-dashboard/m4-dashboard.test.ts',
        e2eFile: 'e2e/milestones.spec.ts',
        status: 'implemented'
      },
      'TC-15': {
        name: 'Public Author Profile Page',
        unitFile: 'm4-dashboard/m4-dashboard.test.ts',
        e2eFile: 'e2e/milestones.spec.ts',
        status: 'implemented'
      },
      'TC-16': {
        name: 'Draft vs Published Status Visibility',
        unitFile: 'm4-dashboard/m4-dashboard.test.ts',
        e2eFile: 'e2e/milestones.spec.ts',
        status: 'implemented'
      }
    }
  },
  'M5': {
    name: 'Search & UX',
    testCases: {
      'TC-17': {
        name: 'FTS5 Full-Text Search Functionality',
        unitFile: 'm5-search-ux/m5-search.test.ts',
        e2eFile: 'e2e/milestones.spec.ts',
        status: 'implemented'
      },
      'TC-18': {
        name: 'Search Empty State',
        unitFile: null,
        e2eFile: 'e2e/milestones.spec.ts',
        status: 'implemented'
      },
      'TC-19': {
        name: 'SEO Meta Tags Generation',
        unitFile: 'm5-search-ux/m5-search.test.ts',
        e2eFile: 'e2e/milestones.spec.ts',
        status: 'implemented'
      },
      'TC-20': {
        name: 'RSS Feed Generation',
        unitFile: 'm5-search-ux/m5-search.test.ts',
        e2eFile: 'e2e/milestones.spec.ts',
        status: 'implemented'
      }
    }
  },
  'Edge': {
    name: 'Edge Cases',
    testCases: {
      'TC-21': {
        name: 'Registration Password Validation',
        unitFile: 'edge-cases/edge-cases.test.ts',
        e2eFile: 'e2e/milestones.spec.ts',
        status: 'implemented'
      },
      'TC-22': {
        name: 'Duplicate Username Registration',
        unitFile: 'edge-cases/edge-cases.test.ts',
        e2eFile: 'e2e/milestones.spec.ts',
        status: 'implemented'
      },
      'TC-23': {
        name: 'Archive Post Status',
        unitFile: 'edge-cases/edge-cases.test.ts',
        e2eFile: null,
        status: 'implemented'
      },
      'TC-24': {
        name: 'Delete Permission Enforcement',
        unitFile: 'edge-cases/edge-cases.test.ts',
        e2eFile: 'e2e/milestones.spec.ts',
        status: 'implemented'
      },
      'TC-25': {
        name: 'Settings Persistence',
        unitFile: 'edge-cases/edge-cases.test.ts',
        e2eFile: null,
        status: 'implemented'
      }
    }
  }
};

function printHeader() {
  console.log('\n' + '═'.repeat(80));
  console.log('         STELLAR-DB COMPREHENSIVE TEST SUITE');
  console.log('         Following TEST-CASES.md Specifications');
  console.log('═'.repeat(80) + '\n');
}

function printMilestoneSummary(milestone, data) {
  const testCases = Object.entries(data.testCases);
  const implemented = testCases.filter(([_, tc]) => tc.status === 'implemented').length;
  const total = testCases.length;
  const percent = Math.round((implemented / total) * 100);

  const status = percent === 100 ? '✅' : percent >= 80 ? '🟡' : '🔴';

  console.log(`${status} ${milestone}: ${data.name}`);
  console.log(`   Progress: ${implemented}/${total} test cases implemented (${percent}%)`);
  console.log('');
}

function printDetailedMapping() {
  console.log('\n' + '─'.repeat(80));
  console.log('TEST CASE TO FILE MAPPING');
  console.log('─'.repeat(80) + '\n');

  for (const [milestone, data] of Object.entries(testMapping)) {
    console.log(`\n${milestone}: ${data.name}`);
    console.log('─'.repeat(60));

    for (const [tcId, tc] of Object.entries(data.testCases)) {
      const icon = tc.status === 'implemented' ? '✅' : '⚪';
      console.log(`  ${icon} ${tcId}: ${tc.name}`);
      if (tc.unitFile) {
        console.log(`      Unit: tests/${tc.unitFile}`);
      }
      if (tc.e2eFile) {
        console.log(`      E2E:  tests/${tc.e2eFile}`);
      }
    }
  }
}

function runUnitTests(verbose = false) {
  console.log('\n📦 Running Unit & Integration Tests (Vitest)...\n');
  console.log('─'.repeat(80));

  try {
    const cmd = verbose
      ? 'npx vitest run --reporter=verbose'
      : 'npx vitest run';

    const output = execSync(cmd, {
      cwd: join(__dirname, '..'),
      encoding: 'utf-8',
      timeout: 120000,
      stdio: 'inherit'
    });

    return true;
  } catch (error) {
    console.error('\n❌ Some unit tests failed. Check output above for details.\n');
    return false;
  }
}

function runE2ETests(verbose = false) {
  console.log('\n🌐 Running E2E Tests (Playwright)...\n');
  console.log('─'.repeat(80));

  try {
    const cmd = verbose
      ? 'npx playwright test --reporter=list'
      : 'npx playwright test';

    const output = execSync(cmd, {
      cwd: join(__dirname, '..'),
      encoding: 'utf-8',
      timeout: 300000,
      stdio: 'inherit'
    });

    return true;
  } catch (error) {
    console.error('\n❌ Some E2E tests failed. Check output above for details.\n');
    return false;
  }
}

function generateTestReport() {
  const reportPath = join(__dirname, 'test-coverage-report.md');

  let report = '# Test Coverage Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += '## Summary\n\n';

  let totalTC = 0;
  let totalImplemented = 0;

  for (const [milestone, data] of Object.entries(testMapping)) {
    const testCases = Object.entries(data.testCases);
    const implemented = testCases.filter(([_, tc]) => tc.status === 'implemented').length;
    const total = testCases.length;

    totalTC += total;
    totalImplemented += implemented;

    report += `### ${milestone}: ${data.name}\n`;
    report += `- Implemented: ${implemented}/${total}\n`;
    report += `- Coverage: ${Math.round((implemented / total) * 100)}%\n\n`;

    for (const [tcId, tc] of Object.entries(data.testCases)) {
      const icon = tc.status === 'implemented' ? '✅' : '⚪';
      report += `- ${icon} ${tcId}: ${tc.name}\n`;
      if (tc.unitFile) report += `  - Unit Test: \`${tc.unitFile}\`\n`;
      if (tc.e2eFile) report += `  - E2E Test: \`${tc.e2eFile}\`\n`;
    }
    report += '\n';
  }

  report += `## Overall Coverage\n\n`;
  report += `- Total Test Cases: ${totalTC}\n`;
  report += `- Implemented: ${totalImplemented}\n`;
  report += `- Coverage: ${Math.round((totalImplemented / totalTC) * 100)}%\n`;

  writeFileSync(reportPath, report);
  console.log(`\n📄 Test coverage report saved to: tests/test-coverage-report.md\n`);
}

function main() {
  const args = process.argv.slice(2);
  const runUnit = args.includes('--unit') || args.includes('--all');
  const runE2E = args.includes('--e2e') || args.includes('--all');
  const verbose = args.includes('--verbose') || args.includes('-v');
  const detailed = args.includes('--map') || args.includes('--detailed');
  const report = args.includes('--report');

  printHeader();

  // Print coverage summary
  console.log('📊 TEST COVERAGE SUMMARY\n');
  console.log('═'.repeat(80));
  for (const [milestone, data] of Object.entries(testMapping)) {
    printMilestoneSummary(milestone, data);
  }

  // Print detailed mapping if requested
  if (detailed) {
    printDetailedMapping();
  }

  // Run tests if requested
  if (runUnit || runE2E) {
    if (runUnit) {
      const unitSuccess = runUnitTests(verbose);
    }

    if (runE2E) {
      const e2eSuccess = runE2ETests(verbose);
    }
  }

  // Generate report if requested
  if (report) {
    generateTestReport();
  }

  // Print usage
  if (!runUnit && !runE2E && !detailed && !report) {
    console.log('\n💡 USAGE:\n');
    console.log('  node test-runner.mjs --all          Run all tests');
    console.log('  node test-runner.mjs --unit         Run unit tests only');
    console.log('  node test-runner.mjs --e2e          Run E2E tests only');
    console.log('  node test-runner.mjs --map          Show test case mapping');
    console.log('  node test-runner.mjs --report       Generate coverage report');
    console.log('  node test-runner.mjs --verbose      Verbose output');
    console.log('');
    console.log('  Examples:');
    console.log('    node test-runner.mjs --all --verbose');
    console.log('    node test-runner.mjs --unit --map');
    console.log('    node test-runner.mjs --report\n');
  }

  console.log('═'.repeat(80) + '\n');
}

main();
