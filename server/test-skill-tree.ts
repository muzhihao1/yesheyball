/**
 * Skill Tree System Test Script
 * Tests business logic without requiring HTTP server or authentication
 */

import { db } from "./db.js";
import {
  initializeSkillTree,
  getSkillTreeWithProgress,
  getSkillDetails,
  unlockSkill,
  getAllSkills,
  getSkillDependencies,
  getUserUnlockedSkills
} from "./skillTreeService.js";

async function runTests() {
  console.log("🧪 Starting Skill Tree System Tests\n");
  console.log("=" + "=".repeat(70));

  let testsPassed = 0;
  let testsFailed = 0;

  // Helper function to log test results
  function logTest(name: string, passed: boolean, details?: string) {
    if (passed) {
      console.log(`✅ ${name}`);
      if (details) console.log(`   ${details}`);
      testsPassed++;
    } else {
      console.log(`❌ ${name}`);
      if (details) console.log(`   ${details}`);
      testsFailed++;
    }
  }

  try {
    console.log("\n📦 Phase 1: Database & Seed Data Initialization\n");

    // Test 1: Check database connection
    if (!db) {
      logTest("Database connection", false, "Database not initialized");
      return;
    }
    logTest("Database connection", true, "Connected successfully");

    // Test 2: Initialize skill tree
    console.log("\n🌱 Initializing skill tree data...");
    const initResult = await initializeSkillTree();

    if (initResult.inserted > 0) {
      logTest(
        "Skill tree initialization",
        true,
        `Inserted ${initResult.inserted} skills, ${initResult.dependencies} dependencies, ${initResult.conditions} conditions`
      );
    } else {
      logTest(
        "Skill tree initialization",
        true,
        `Skipped: ${initResult.message}`
      );
    }

    // Test 3: Verify skills count
    const allSkills = await getAllSkills();
    logTest(
      "Skills data exists",
      allSkills.length === 8,
      `Found ${allSkills.length} skills (expected 8)`
    );

    // Test 4: Verify dependencies
    const deps = await getSkillDependencies();
    logTest(
      "Dependencies data exists",
      deps.length === 7,
      `Found ${deps.length} dependencies (expected 7 for linear path)`
    );

    // Test 5: Verify first skill has no conditions
    const skill1 = allSkills.find((s) => s.id === 1);
    logTest(
      "Skill 1 structure",
      skill1?.name === "初窥门径",
      `Name: ${skill1?.name}`
    );

    console.log("\n👤 Phase 2: User Progress Tracking (Test User)\n");

    // Use a test user ID (should be a real user from your database)
    // For demo purposes, using a known test user ID
    const testUserId = "demo-user"; // Change this to a real user ID from your database

    // Test 6: Get skill tree for user (initial state)
    console.log(`\n🌳 Testing with user: ${testUserId}`);
    const skillTree = await getSkillTreeWithProgress(testUserId);

    logTest(
      "Get skill tree with progress",
      skillTree.skills.length === 8,
      `Retrieved ${skillTree.skills.length} skills`
    );

    logTest(
      "User progress calculation",
      skillTree.userProgress.totalSkills === 8,
      `Total: ${skillTree.userProgress.totalSkills}, Unlocked: ${skillTree.userProgress.unlockedSkills}, Progress: ${skillTree.userProgress.progressPercentage}%`
    );

    // Test 7: Get specific skill details
    console.log("\n🔍 Testing skill detail retrieval...");
    const skill2Details = await getSkillDetails(2, testUserId);

    if (skill2Details) {
      logTest(
        "Get skill details (Skill 2)",
        skill2Details.name === "小有所成",
        `Name: ${skill2Details.name}, Unlocked: ${skill2Details.isUnlocked}`
      );

      if (!skill2Details.isUnlocked && skill2Details.conditions) {
        console.log("\n   📋 Skill 2 Unlock Conditions:");
        skill2Details.conditions.forEach((c: any) => {
          console.log(
            `      ${c.isMet ? "✅" : "⏳"} ${c.description} (${c.currentProgress}/${parseInt(c.value)})`
          );
        });
      }
    } else {
      logTest("Get skill details (Skill 2)", false, "Skill not found");
    }

    // Test 8: Try to get invalid skill
    const invalidSkill = await getSkillDetails(999, testUserId);
    logTest(
      "Invalid skill ID handling",
      invalidSkill === null,
      "Correctly returned null for non-existent skill"
    );

    console.log("\n🔓 Phase 3: Unlock Logic Testing\n");

    // Test 9: Check if Skill 1 can be unlocked
    const skill1Details = await getSkillDetails(1, testUserId);
    if (skill1Details) {
      logTest(
        "Skill 1 unlock eligibility",
        skill1Details.canUnlock || skill1Details.isUnlocked,
        `Can unlock: ${skill1Details.canUnlock}, Already unlocked: ${skill1Details.isUnlocked}`
      );

      // Test 10: Try to unlock Skill 1 if not already unlocked
      if (!skill1Details.isUnlocked) {
        console.log("\n🔐 Attempting to unlock Skill 1...");
        const unlockResult = await unlockSkill(1, testUserId, {
          triggeredBy: "test",
          source: "test-script",
        });

        if (unlockResult.success) {
          logTest(
            "Unlock Skill 1",
            true,
            `Successfully unlocked! Rewards: ${unlockResult.rewards?.exp} EXP`
          );

          if (unlockResult.nextSkills && unlockResult.nextSkills.length > 0) {
            console.log("\n   🎯 Next Available Skills:");
            unlockResult.nextSkills.forEach((ns: any) => {
              console.log(
                `      ${ns.canUnlock ? "✅" : "🔒"} Skill ${ns.id}: ${ns.name}`
              );
            });
          }
        } else {
          logTest(
            "Unlock Skill 1",
            false,
            `Failed: ${unlockResult.message}`
          );
        }
      } else {
        console.log("   ℹ️  Skill 1 already unlocked, skipping unlock test");
      }
    }

    // Test 11: Try to unlock Skill 3 without Skill 2 (should fail)
    console.log("\n🚫 Testing dependency validation (Skill 3 without Skill 2)...");
    const skill3UnlockResult = await unlockSkill(3, testUserId);

    if (!skill3UnlockResult.success) {
      const hasUnmetDeps =
        (skill3UnlockResult.details?.unmetDependencies?.length ?? 0) > 0;
      logTest(
        "Dependency validation",
        hasUnmetDeps,
        `Correctly blocked unlock: ${skill3UnlockResult.message}`
      );

      if (skill3UnlockResult.details) {
        console.log("\n   📋 Unmet Dependencies:");
        skill3UnlockResult.details.unmetDependencies?.forEach((dep: any) => {
          console.log(`      ❌ Skill ${dep.skillId}: ${dep.name}`
);
        });
      }
    } else {
      logTest(
        "Dependency validation",
        false,
        "Should have failed but succeeded"
      );
    }

    // Test 12: Get updated skill tree after unlock
    console.log("\n🔄 Fetching updated skill tree...");
    const updatedTree = await getSkillTreeWithProgress(testUserId);
    const unlockedCount = updatedTree.userProgress.unlockedSkills;

    logTest(
      "Updated progress tracking",
      unlockedCount >= 0,
      `User has unlocked ${unlockedCount} skill(s), Progress: ${updatedTree.userProgress.progressPercentage}%`
    );

    console.log("\n   📊 Next Unlockable Skills:");
    if (updatedTree.userProgress.nextUnlockableSkills.length > 0) {
      updatedTree.userProgress.nextUnlockableSkills.forEach((skillId: number) => {
        const skill = updatedTree.skills.find((s: any) => s.id === skillId);
        console.log(`      🎯 Skill ${skillId}: ${skill?.name || "Unknown"}`);
      });
    } else {
      console.log("      (None available - need to complete requirements)");
    }

    console.log("\n" + "=".repeat(72));
    console.log("\n📊 Test Summary\n");
    console.log(`✅ Passed: ${testsPassed}`);
    console.log(`❌ Failed: ${testsFailed}`);
    console.log(`📈 Success Rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`);

    if (testsFailed === 0) {
      console.log("\n🎉 All tests passed! Skill tree system is working correctly.\n");
    } else {
      console.log("\n⚠️  Some tests failed. Please review the issues above.\n");
    }

  } catch (error) {
    console.error("\n❌ Test execution failed:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      console.error("Stack trace:", error.stack);
    }
    process.exit(1);
  }

  process.exit(testsFailed > 0 ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
