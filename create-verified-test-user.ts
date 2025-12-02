/**
 * 使用 Supabase Admin API 创建一个已验证的测试用户
 * 这样可以绕过邮件验证的限制
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ 错误：需要设置 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY");
  console.error("   设置环境变量后重试");
  process.exit(1);
}

async function createVerifiedTestUser() {
  console.log("🔧 创建已验证的测试用户...\n");

  // 创建 Supabase Admin 客户端
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  // 生成唯一的测试邮箱
  const timestamp = Date.now();
  const testEmail = `p0-test-${timestamp}@automation.test`;
  const testPassword = "Test_P0_12345!@#";

  try {
    console.log(`📧 邮箱: ${testEmail}`);
    console.log(`🔐 密码: ${testPassword}\n`);

    // 使用 Admin API 创建用户（跳过邮件验证）
    console.log("创建用户中...");
    const { data, error } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true, // 直接标记为已验证
      user_metadata: {
        firstName: "Test",
        lastName: "P0User",
      },
    });

    if (error) {
      console.error(`❌ 创建用户失败: ${error.message}`);
      return null;
    }

    if (!data.user) {
      console.error("❌ 用户创建返回结果为空");
      return null;
    }

    console.log(`✅ 用户创建成功！\n`);
    console.log(`用户 ID: ${data.user.id}`);
    console.log(`邮箱: ${data.user.email}`);
    console.log(`邮箱验证: ${data.user.email_confirmed_at ? "✓ 已验证" : "✗ 未验证"}\n`);

    // 返回登录信息供 Playwright 使用
    return {
      email: testEmail,
      password: testPassword,
      userId: data.user.id,
      emailConfirmed: !!data.user.email_confirmed_at,
    };
  } catch (error) {
    console.error(`❌ 发生错误: ${error}`);
    return null;
  }
}

// 运行
createVerifiedTestUser()
  .then((result) => {
    if (result) {
      // 输出 JSON 格式的结果，供其他脚本使用
      console.log("\n📝 测试凭证 (JSON 格式):");
      console.log(JSON.stringify(result, null, 2));

      // 保存到文件供 Playwright 读取
      const fs = require("fs");
      fs.writeFileSync(
        "test-credentials.json",
        JSON.stringify(result, null, 2)
      );
      console.log("\n✅ 凭证已保存到 test-credentials.json");
    } else {
      console.log("\n❌ 无法创建测试用户");
      process.exit(1);
    }
  });
