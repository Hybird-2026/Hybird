-- 데이터베이스 초기화 스크립트 (모든 데이터 삭제)

-- 외래 키 제약 조건 때문에 순서대로 삭제
TRUNCATE TABLE resume_base RESTART IDENTITY CASCADE;
TRUNCATE TABLE records RESTART IDENTITY CASCADE;
TRUNCATE TABLE community RESTART IDENTITY CASCADE;
TRUNCATE TABLE users RESTART IDENTITY CASCADE;

-- 확인 메시지
SELECT 'All tables truncated successfully!' as status;
