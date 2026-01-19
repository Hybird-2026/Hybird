-- 초기 데이터 삽입 스크립트

-- 1. 사용자 데이터
INSERT INTO users (name, major, level, exp, max_exp, character_title) 
VALUES ('배혜진', '컴퓨터공학', 7, 420, 1000, '코드 숲의 탐험가');

-- 2. 커뮤니티 멤버 데이터
INSERT INTO community (name, major, level, job, tags, type) VALUES
('김민수', '컴퓨터공학', 82, '네이버 웹개발자', ARRAY['AI', 'Frontend'], 'senior'),
('정재희', '디자인', 45, '카카오 디자이너', ARRAY['Design', 'UX'], 'friend'),
('한유진', '경영학과', 12, '취준생', ARRAY['PM', 'Marketing'], 'friend'),
('지문호', '컴퓨터공학', 99, '구글 엔지니어', ARRAY['Backend', 'AI'], 'senior'),
('박준혁', '전자공학', 68, '삼성전자', ARRAY['Embedded', 'Hardware'], 'senior'),
('이서연', '컴퓨터공학', 25, '스타트업 인턴', ARRAY['Frontend', 'App'], 'friend');

-- 3. 활동 기록 데이터
INSERT INTO records (user_id, title, type, date, description, content, year, status) VALUES
(1, '웹개발 캡스톤 프로젝트', 'PROJECT', '2024-11-20', 'React와 Node.js를 이용한 협업 플랫폼', 'React와 Node.js를 이용한 협업 플랫폼 개발. 팀장 역할 수행하며 프론트엔드 아키텍처 설계.', '2024', '완료'),
(1, '데이터베이스 시스템 기말', 'CLASS', '2024-11-10', 'SQL 최적화 및 인덱싱 실습', 'PostgreSQL을 활용한 쿼리 최적화 및 인덱스 설계 학습.', '2024', '완료'),
(1, 'SW 마에스트로 15기 준비', 'EXTRACURRICULAR', '2024-11-15', '코딩 테스트 대비 및 기획서 작성', '알고리즘 문제 풀이 및 창의적인 서비스 기획서 작성.', '2024', '진행중'),
(1, '교내 해커톤: 스마트 캠퍼스', 'PROJECT', '2024-09-12', '캠퍼스 내 길찾기 AR 서비스', 'AR 기술을 활용한 캠퍼스 길찾기 앱 개발. 2등 수상.', '2024', '완료'),
(1, '운영체제 설계 원리', 'CLASS', '2024-10-05', 'Process Scheduling 시뮬레이션', 'C언어로 프로세스 스케줄링 알고리즘 구현.', '2024', '완료'),
(1, '팀워크 갈등 해결 기록', 'TEAMWORK', '2024-10-15', '의사소통 부재 해결 프로세스', '팀 프로젝트 중 발생한 의견 충돌을 중재하여 해결한 경험.', '2024', '완료'),
(1, '자료구조 정복 스터디', 'CLASS', '2023-12-12', '자료구조 심화 학습', '스택, 큐, 트리, 그래프 등 자료구조 완벽 이해.', '2023', '완료'),
(1, '교내 앱 공모전 동상', 'PROJECT', '2023-09-12', '학생 커뮤니티 앱 개발', 'Flutter를 활용한 크로스플랫폼 앱 개발.', '2023', '완료'),
(1, 'C언어 기초 프로그래밍', 'CLASS', '2022-06-10', 'C언어 문법 및 포인터 학습', '프로그래밍 기초 다지기.', '2022', '완료');

-- 4. 이력서 베이스 데이터
INSERT INTO resume_base (user_id, category, title, content, keywords) VALUES
(1, 'PROJECT', '웹개발 캡스톤 프로젝트', 'React와 Node.js를 활용한 협업 플랫폼 개발. 팀장으로서 5명의 팀원을 이끌며 프로젝트 완수.', ARRAY['React', 'Node.js', '팀장', '협업']),
(1, 'SKILL', '프론트엔드 개발', 'React, TypeScript, TailwindCSS를 활용한 현대적인 웹 애플리케이션 개발 경험.', ARRAY['React', 'TypeScript', 'TailwindCSS']),
(1, 'SKILL', '백엔드 개발', 'Node.js, Express, PostgreSQL을 활용한 RESTful API 설계 및 구현.', ARRAY['Node.js', 'Express', 'PostgreSQL']);
