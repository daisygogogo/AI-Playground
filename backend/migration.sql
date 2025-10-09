-- Migration SQL for AI-Playground Database Agent Features
-- This includes new User fields, Task table, SystemMetrics table, and sample data

-- 1. Add new fields to existing User table
ALTER TABLE "User" 
ADD COLUMN "department" TEXT,
ADD COLUMN "jobTitle" TEXT,
ADD COLUMN "lastLoginAt" TIMESTAMPTZ(3),
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- 2. Create TaskStatus enum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'COMPLETED');

-- 3. Create TaskPriority enum  
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- 4. Create Task table
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMPTZ(3),
    "assigneeId" TEXT,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- 5. Create SystemMetrics table
CREATE TABLE "SystemMetrics" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metricName" TEXT NOT NULL,
    "metricValue" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "category" TEXT NOT NULL,

    CONSTRAINT "SystemMetrics_pkey" PRIMARY KEY ("id")
);

-- 6. Add foreign key constraint for Task.assigneeId
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 7. Insert sample task data
INSERT INTO "Task" ("id", "createdAt", "updatedAt", "title", "description", "status", "priority", "dueDate", "assigneeId") VALUES
('task-1-uuid', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Fix login bug', 'Fix the authentication issue in login page', 'COMPLETED', 'HIGH', '2024-01-15T00:00:00.000Z', (SELECT id FROM "User" WHERE email = 'test@example.com' LIMIT 1)),
('task-2-uuid', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Add dark mode', 'Implement dark mode theme for the application', 'IN_PROGRESS', 'MEDIUM', '2024-03-01T00:00:00.000Z', (SELECT id FROM "User" WHERE email = 'admin@example.com' LIMIT 1)),
('task-3-uuid', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Update documentation', 'Update API documentation for new endpoints', 'TODO', 'LOW', '2024-02-15T00:00:00.000Z', (SELECT id FROM "User" WHERE email = 'john.doe@example.com' LIMIT 1)),
('task-4-uuid', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Database backup', 'Setup automated database backup system', 'COMPLETED', 'HIGH', '2024-01-10T00:00:00.000Z', (SELECT id FROM "User" WHERE email = 'test@example.com' LIMIT 1));

-- 8. Insert sample system metrics data
INSERT INTO "SystemMetrics" ("id", "createdAt", "metricName", "metricValue", "unit", "category") VALUES
('metric-1-uuid', CURRENT_TIMESTAMP, 'CPU Usage', 65.5, '%', 'Performance'),
('metric-2-uuid', CURRENT_TIMESTAMP, 'Memory Usage', 78.2, '%', 'Performance'),
('metric-3-uuid', CURRENT_TIMESTAMP, 'Active Users', 24, 'users', 'Usage'),
('metric-4-uuid', CURRENT_TIMESTAMP, 'API Requests', 1420, 'requests', 'Usage');

-- 9. Update existing users with new field data
UPDATE "User" SET 
    "department" = 'Engineering',
    "jobTitle" = 'System Administrator',
    "lastLoginAt" = CURRENT_TIMESTAMP
WHERE "role" = 'ADMIN';

UPDATE "User" SET 
    "department" = 'Development', 
    "jobTitle" = 'Software Developer',
    "lastLoginAt" = CURRENT_TIMESTAMP - INTERVAL '1 day'
WHERE "role" = 'USER';



-- 11. Create additional sample users (if they don't exist)
INSERT INTO "User" ("id", "createdAt", "updatedAt", "firstName", "lastName", "email", "password", "terms", "role", "department", "jobTitle", "lastLoginAt", "isActive")
SELECT 
    gen_random_uuid()::text,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'John',
    'Doe', 
    'john.doe@example.com',
    '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDlwjoemNNjN/f91tKEjGWw1UEy2', -- hashed '123456'
    true,
    'USER'::"Role",
    'Engineering',
    'Senior Developer',
    CURRENT_TIMESTAMP,
    true
WHERE NOT EXISTS (SELECT 1 FROM "User" WHERE email = 'john.doe@example.com');

INSERT INTO "User" ("id", "createdAt", "updatedAt", "firstName", "lastName", "email", "password", "terms", "role", "department", "jobTitle", "lastLoginAt", "isActive") 
SELECT
    gen_random_uuid()::text,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Jane',
    'Smith',
    'jane.smith@example.com', 
    '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDlwjoemNNjN/f91tKEjGWw1UEy2', -- hashed '123456'
    true,
    'ADMIN'::"Role",
    'Product',
    'Product Manager',
    CURRENT_TIMESTAMP,
    true
WHERE NOT EXISTS (SELECT 1 FROM "User" WHERE email = 'jane.smith@example.com');

INSERT INTO "User" ("id", "createdAt", "updatedAt", "firstName", "lastName", "email", "password", "terms", "role", "department", "jobTitle", "lastLoginAt", "isActive")
SELECT
    gen_random_uuid()::text,
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP,
    'Bob',
    'Wilson',
    'bob.wilson@example.com',
    '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDlwjoemNNjN/f91tKEjGWw1UEy2', -- hashed '123456'
    true,
    'USER'::"Role", 
    'Design',
    'UI/UX Designer',
    CURRENT_TIMESTAMP,
    true
WHERE NOT EXISTS (SELECT 1 FROM "User" WHERE email = 'bob.wilson@example.com');