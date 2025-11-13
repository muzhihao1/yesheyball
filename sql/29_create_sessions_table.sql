-- 创建会话存储表（用于 connect-pg-simple）
-- 必须在 serverless 环境中预先创建以避免竞态条件

-- 如果表已存在则删除（仅开发环境）
DROP TABLE IF EXISTS "sessions";

-- 创建 sessions 表
CREATE TABLE "sessions" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
) WITH (OIDS=FALSE);

-- 添加主键约束
ALTER TABLE "sessions" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- 创建过期时间索引（提升清理性能）
CREATE INDEX "IDX_session_expire" ON "sessions" ("expire");

-- 添加注释
COMMENT ON TABLE "sessions" IS 'Express session storage for connect-pg-simple';
COMMENT ON COLUMN "sessions"."sid" IS 'Session ID (primary key)';
COMMENT ON COLUMN "sessions"."sess" IS 'Session data (JSON)';
COMMENT ON COLUMN "sessions"."expire" IS 'Session expiration timestamp';
