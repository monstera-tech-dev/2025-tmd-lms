-- 초기 데이터 시드 (선택사항)
-- 필요한 경우에만 실행하세요

-- 초기 강의 데이터 (1회차) 풀스택 과정
INSERT INTO courses (id, title, instructor, thumbnail, progress, status)
VALUES (1, '(1회차) 풀스택 과정', '김강사', '/photo/aaa.jpg', 0, 'published')
ON CONFLICT (id) DO NOTHING;

-- 커리큘럼 모듈 (curriculum.service.ts의 seedData를 사용하는 것이 권장됩니다)
-- 여기서는 예시만 제공합니다


