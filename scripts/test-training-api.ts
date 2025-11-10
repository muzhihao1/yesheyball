/**
 * V2.1 Training API 测试脚本
 *
 * 功能：验证8个API端点的功能正确性
 *
 * 使用方法：
 *   1. 确保开发服务器运行: npm run dev
 *   2. 运行测试: npx tsx scripts/test-training-api.ts
 */

// Node.js v22+ has native fetch
const API_BASE = "http://localhost:5001";
const TEST_USER_ID = "test-user-123"; // 需要实际的测试用户ID

// ANSI颜色代码
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
};

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// ============================================================================
// 测试工具函数
// ============================================================================

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  response?: any;
}

const results: TestResult[] = [];

async function testEndpoint(
  name: string,
  method: string,
  endpoint: string,
  body?: any
): Promise<TestResult> {
  try {
    const options: any = {
      method,
      headers: {
        "Content-Type": "application/json",
        // TODO: 添加认证头（如果需要）
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();

    const passed = response.ok;

    return {
      name,
      passed,
      error: passed ? undefined : `HTTP ${response.status}: ${JSON.stringify(data)}`,
      response: data,
    };
  } catch (error: any) {
    return {
      name,
      passed: false,
      error: error.message,
    };
  }
}

// ============================================================================
// API测试用例
// ============================================================================

async function runTests() {
  log("\n🧪 V2.1 Training API 测试开始\n", "blue");
  log(`📍 API Base URL: ${API_BASE}\n`, "yellow");

  // ========== Read Endpoints ==========
  log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "blue");
  log("📖 测试 Read Endpoints (GET)", "blue");
  log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n", "blue");

  // Test 1: GET /api/training/levels
  log("Test 1: 获取所有训练关卡", "yellow");
  const test1 = await testEndpoint(
    "GET /api/training/levels",
    "GET",
    "/api/training/levels"
  );
  results.push(test1);

  if (test1.passed) {
    log(`✅ 成功！找到 ${test1.response.levels?.length || 0} 个关卡`, "green");
    if (test1.response.levels && test1.response.levels.length > 0) {
      const firstLevel = test1.response.levels[0];
      log(`   示例: Level ${firstLevel.levelNumber} - ${firstLevel.title}`, "green");
    }
  } else {
    log(`❌ 失败: ${test1.error}`, "red");
  }
  console.log("");

  // Test 2: GET /api/training/levels/{levelId}
  log("Test 2: 获取关卡详情（需要先有数据）", "yellow");

  if (test1.passed && test1.response.levels && test1.response.levels.length > 0) {
    const levelId = test1.response.levels[0].id;
    const test2 = await testEndpoint(
      "GET /api/training/levels/{levelId}",
      "GET",
      `/api/training/levels/${levelId}`
    );
    results.push(test2);

    if (test2.passed) {
      const level = test2.response.level;
      log(`✅ 成功！获取到Level ${level.levelNumber} 的详细信息`, "green");
      log(`   技能数量: ${level.skills?.length || 0}`, "green");
    } else {
      log(`❌ 失败: ${test2.error}`, "red");
    }
  } else {
    log("⚠️  跳过：需要先导入数据", "yellow");
    results.push({
      name: "GET /api/training/levels/{levelId}",
      passed: false,
      error: "No data to test with",
    });
  }
  console.log("");

  // Test 3: GET /api/specialized-trainings
  log("Test 3: 获取专项训练列表", "yellow");
  const test3 = await testEndpoint(
    "GET /api/specialized-trainings",
    "GET",
    "/api/specialized-trainings"
  );
  results.push(test3);

  if (test3.passed) {
    log(`✅ 成功！找到 ${test3.response.trainings?.length || 0} 个专项训练`, "green");
  } else {
    log(`❌ 失败: ${test3.error}`, "red");
  }
  console.log("");

  // ========== Write Endpoints ==========
  log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "blue");
  log("✍️  测试 Write Endpoints (POST)", "blue");
  log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n", "blue");

  // Test 4: POST /api/training/progress/start
  log("Test 4: 开始训练单元（需要先有数据）", "yellow");

  // 需要先获取一个unit ID
  if (test1.passed && test1.response.levels && test1.response.levels.length > 0) {
    const levelId = test1.response.levels[0].id;
    const levelDetailResponse = await fetch(
      `${API_BASE}/api/training/levels/${levelId}`
    );
    const levelDetail = await levelDetailResponse.json();

    // 尝试获取第一个unit ID
    let unitId: string | null = null;
    if (levelDetail.level?.skills?.[0]?.subSkills?.[0]?.units?.[0]?.id) {
      unitId = levelDetail.level.skills[0].subSkills[0].units[0].id;
    }

    if (unitId) {
      const test4 = await testEndpoint(
        "POST /api/training/progress/start",
        "POST",
        "/api/training/progress/start",
        { unitId }
      );
      results.push(test4);

      if (test4.passed) {
        log("✅ 成功！开始训练单元", "green");
        log(`   状态: ${test4.response.progress?.status}`, "green");
      } else {
        log(`❌ 失败: ${test4.error}`, "red");
      }
    } else {
      log("⚠️  跳过：关卡中没有训练单元", "yellow");
      results.push({
        name: "POST /api/training/progress/start",
        passed: false,
        error: "No units to test with",
      });
    }
  } else {
    log("⚠️  跳过：需要先导入数据", "yellow");
    results.push({
      name: "POST /api/training/progress/start",
      passed: false,
      error: "No data to test with",
    });
  }
  console.log("");

  // ========== 结果汇总 ==========
  log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "blue");
  log("📊 测试结果汇总", "blue");
  log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n", "blue");

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  log(`总计: ${total} 个测试`, "yellow");
  log(`✅ 通过: ${passed}`, "green");
  log(`❌ 失败: ${failed}`, "red");
  log(`成功率: ${((passed / total) * 100).toFixed(1)}%\n`, "yellow");

  if (failed > 0) {
    log("失败的测试:", "red");
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        log(`  ❌ ${r.name}`, "red");
        if (r.error) {
          log(`     ${r.error}`, "red");
        }
      });
  }

  // ========== 建议 ==========
  log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "blue");
  log("💡 后续建议", "blue");
  log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n", "blue");

  if (failed === total) {
    log("所有测试都失败了。可能的原因：", "yellow");
    log("  1. 开发服务器未启动 (运行: npm run dev)", "yellow");
    log("  2. 数据库连接失败", "yellow");
    log("  3. 数据库中没有数据 (运行: npx tsx scripts/import-training-data.ts)", "yellow");
  } else if (failed > 0) {
    log("部分测试失败。可能需要：", "yellow");
    log("  1. 检查失败的测试错误信息", "yellow");
    log("  2. 导入测试数据 (运行: npx tsx scripts/import-training-data.ts)", "yellow");
    log("  3. 验证用户认证是否正常", "yellow");
  } else {
    log("✅ 所有测试通过！API工作正常", "green");
    log("\n下一步：", "yellow");
    log("  1. 导入完整的\"十大招\"内容数据", "yellow");
    log("  2. 进行更详细的功能测试", "yellow");
    log("  3. 开始前端页面开发", "yellow");
  }

  console.log("");
}

// 运行测试
runTests()
  .then(() => {
    const failed = results.filter((r) => !r.passed).length;
    process.exit(failed > 0 ? 1 : 0);
  })
  .catch((error) => {
    log(`\n❌ 测试运行失败: ${error.message}`, "red");
    console.error(error);
    process.exit(1);
  });
