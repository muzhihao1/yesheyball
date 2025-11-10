# 技能树系统 - 用户验证指南

**只需3步，5分钟完成后端验证** ⚡

---

## 步骤1: 在Supabase执行种子数据 (2分钟)

### 操作步骤：
1. 打开 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择项目：**waytoheyball**
3. 点击左侧菜单 **SQL Editor**
4. 点击 **New Query**
5. 复制以下文件的**全部内容**：
   ```
   /migrations/002_seed_skill_tree_data.sql
   ```
6. 粘贴到SQL编辑器
7. 点击右下角 **Run** 按钮
8. 等待执行完成（约3-5秒）

### 验证结果：
执行以下SQL验证数据已正确插入：
```sql
-- 应返回 8
SELECT COUNT(*) FROM skills;

-- 应返回 7
SELECT COUNT(*) FROM skill_dependencies;

-- 应返回 24
SELECT COUNT(*) FROM skill_unlock_conditions;

-- 查看技能树结构
SELECT id, name, metadata->>'level' as level
FROM skills
ORDER BY id;
```

**预期结果**：
- 8个技能节点（初窥门径 → 出神入化）
- 7个依赖关系（1→2→3→4→5→6→7→8）
- 24个解锁条件

✅ 如果数据正确，继续下一步

---

## 步骤2: 测试API端点 (2分钟)

### 前提：登录应用
1. 访问 http://localhost:5000（或生产环境URL）
2. 登录账号（确保有有效session）

### 测试端点：

#### 测试1: 获取技能树
```bash
# 浏览器访问或使用curl
http://localhost:5000/api/skill-tree
```

**预期响应**（部分）：
```json
{
  "data": {
    "skills": [
      {
        "id": 1,
        "name": "初窥门径",
        "isUnlocked": false,
        "metadata": {
          "icon": "🌱",
          "color": "#10b981",
          "level": 1
        }
      }
      // ... 其他7个技能
    ],
    "dependencies": [
      {"sourceSkillId": 1, "targetSkillId": 2},
      // ... 其他6个依赖
    ],
    "userProgress": {
      "totalSkills": 8,
      "unlockedSkills": 0,
      "progressPercentage": 0,
      "nextUnlockableSkills": [1]
    }
  }
}
```

✅ 如果返回8个技能和用户进度，测试通过

#### 测试2: 查看技能详情
```bash
http://localhost:5000/api/skills/1
```

**预期响应**：
```json
{
  "data": {
    "skill": {
      "id": 1,
      "name": "初窥门径",
      "description": "掌握台球基础：正确的握杆、站位和基本击球姿势",
      "isUnlocked": false,
      "canUnlock": true,
      "dependencies": [],
      "blockingReasons": []
    }
  }
}
```

✅ 技能1应该 `canUnlock: true`（没有前置条件）

#### 测试3: 解锁技能1（可选）
使用浏览器开发者工具或Postman：
```javascript
fetch('http://localhost:5000/api/skills/1/unlock', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ context: { triggeredBy: 'manual' } }),
  credentials: 'include'
})
.then(r => r.json())
.then(console.log)
```

**预期响应**：
```json
{
  "data": {
    "success": true,
    "unlocked": true,
    "skill": {
      "id": 1,
      "name": "初窥门径",
      "unlockedAt": "2025-11-09T..."
    },
    "rewards": {
      "exp": 50,
      "message": "恭喜解锁新技能！"
    },
    "nextSkills": [
      {"id": 2, "name": "小有所成", "canUnlock": false}
    ]
  }
}
```

✅ 解锁成功，返回奖励和下一个技能

---

## 步骤3: 验证业务逻辑 (1分钟)

### 测试依赖验证：
尝试直接解锁技能3（应该失败）：
```javascript
fetch('http://localhost:5000/api/skills/3/unlock', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include'
})
.then(r => r.json())
.then(console.log)
```

**预期响应**（400错误）：
```json
{
  "message": "无法解锁技能：前置条件未满足",
  "details": {
    "unmetConditions": [...],
    "unmetDependencies": [
      {"skillId": 2, "name": "小有所成"}
    ]
  }
}
```

✅ 正确阻止了跨级解锁

---

## ✅ 验证完成！

如果以上3步全部通过，说明：
- ✅ 数据库种子数据正确
- ✅ API端点正常工作
- ✅ 业务逻辑（依赖验证、解锁）正确
- ✅ 进度跟踪准确

**系统状态**：后端100%可用，可以开始前端开发 🎉

---

## 🐛 常见问题

### Q: API返回401 Unauthorized
**A**: 需要先登录应用获取有效session。访问 `/` 页面登录后再测试。

### Q: API返回500错误
**A**: 检查服务器日志：
```bash
# 查看错误详情
tail -f logs/error.log
```
可能是数据库连接问题或种子数据未执行。

### Q: 技能树数据为空
**A**: 确认步骤1的种子数据SQL已正确执行。重新运行验证SQL：
```sql
SELECT COUNT(*) FROM skills;  -- 必须返回8
```

### Q: 无法解锁任何技能
**A**: 检查用户的当前等级和完成的训练课程数：
```sql
SELECT current_level, (
  SELECT COUNT(*) FROM training_sessions WHERE user_id = 'YOUR_USER_ID'
) as completed_courses
FROM users WHERE id = 'YOUR_USER_ID';
```

---

## 📚 相关文档

- **API详细文档**: `/docs/SKILL_TREE_API_CONTRACT.md`
- **完整验证报告**: `/docs/SKILL_TREE_VERIFICATION_REPORT.md`
- **部署指南**: `/docs/SKILL_TREE_DEPLOYMENT.md`

---

**完成验证后，请告知开发团队继续前端开发！** 🚀
