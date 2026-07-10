import type { Reporter, TestCase, TestResult } from "@playwright/test/reporter";

class TestLogger implements Reporter {
	onTestBegin(test: TestCase): void {
		console.log(`\n===== [TEST] ${test.title} =====`);
	}

	onTestEnd(test: TestCase, result: TestResult): void {
		console.log(`===== [TEST ${result.status.toUpperCase()}] ${test.title} (${result.duration}ms) =====\n`);
	}
}

export default TestLogger;
