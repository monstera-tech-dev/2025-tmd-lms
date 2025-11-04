-- LMS Database 초기 스키마
-- PostgreSQL 18 이상 권장

-- 데이터베이스 생성 (psql에서 실행)
-- CREATE DATABASE lms;

-- courses 테이블
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    instructor VARCHAR(100) NOT NULL,
    thumbnail TEXT,
    videoUrl TEXT,
    content TEXT,
    progress INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'published',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- curriculum_modules 테이블
CREATE TABLE IF NOT EXISTS curriculum_modules (
    id SERIAL PRIMARY KEY,
    "courseId" INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("courseId") REFERENCES courses(id) ON DELETE CASCADE
);

-- lessons 테이블
CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    "curriculumModuleId" INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("curriculumModuleId") REFERENCES curriculum_modules(id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_curriculum_modules_course_id ON curriculum_modules("courseId");
CREATE INDEX IF NOT EXISTS idx_lessons_curriculum_module_id ON lessons("curriculumModuleId");


