# 🐘 Hybird 프로젝트 PostgreSQL 데이터베이스 구조

## 📋 데이터베이스 개요

- **데이터베이스명**: `hybird_db`
- **사용자**: `hybird_user`
- **비밀번호**: `hybird123`
- **포트**: `5432` (기본)

---

## 🗂️ 테이블 구조

### 1️⃣ `users` - 사용자 프로필 테이블

사용자의 기본 정보와 게임화 요소를 저장합니다.

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  major VARCHAR(100),
  level INTEGER DEFAULT 1,
  exp INTEGER DEFAULT 0,
  max_exp INTEGER DEFAULT 1000,
  character_title VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| `id` | SERIAL | 사용자 고유 ID (자동 증가) |
| `name` | VARCHAR(100) | 사용자 이름 |
| `major` | VARCHAR(100) | 전공 |
| `level` | INTEGER | 현재 레벨 (기본값: 1) |
| `exp` | INTEGER | 현재 경험치 (기본값: 0) |
| `max_exp` | INTEGER | 레벨업에 필요한 경험치 (기본값: 1000) |
| `character_title` | VARCHAR(200) | 캐릭터 칭호 |
| `created_at` | TIMESTAMP | 생성일시 |
| `updated_at` | TIMESTAMP | 수정일시 |

**사용 예시:**
```javascript
// 프론트엔드에서 사용되는 user 객체
const user = {
  name: '배혜진',
  major: '컴퓨터공학',
  level: 7,
  exp: 420,
  maxExp: 1000,
  characterTitle: '코드 숲의 탐험가'
};
```

---

### 2️⃣ `records` - 활동 기록 테이블

사용자의 프로젝트, 수업, 대외활동, 협업 경험 등을 저장합니다.

```sql
CREATE TABLE records (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('PROJECT', 'CLASS', 'EXTRACURRICULAR', 'TEAMWORK')),
  date DATE,
  description TEXT,
  content TEXT,
  tags TEXT[],
  year VARCHAR(4),
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_records_user_id ON records(user_id);
CREATE INDEX idx_records_type ON records(type);
CREATE INDEX idx_records_year ON records(year);
```

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| `id` | SERIAL | 기록 고유 ID |
| `user_id` | INTEGER | 사용자 ID (외래키) |
| `title` | VARCHAR(255) | 활동 제목 |
| `type` | VARCHAR(50) | 활동 유형 (PROJECT, CLASS, EXTRACURRICULAR, TEAMWORK) |
| `date` | DATE | 활동 날짜 |
| `description` | TEXT | 짧은 설명 |
| `content` | TEXT | 상세 내용 |
| `tags` | TEXT[] | 태그 배열 |
| `year` | VARCHAR(4) | 활동 연도 (필터링용) |
| `status` | VARCHAR(20) | 상태 (완료, 진행중 등) |
| `created_at` | TIMESTAMP | 생성일시 |
| `updated_at` | TIMESTAMP | 수정일시 |

**ActivityType 열거형:**
```typescript
enum ActivityType {
  PROJECT = 'PROJECT',
  CLASS = 'CLASS',
  EXTRACURRICULAR = 'EXTRACURRICULAR',
  TEAMWORK = 'TEAMWORK'
}
```

**사용 예시:**
```javascript
const myRecords = [
  {
    title: '웹개발 캡스톤 프로젝트',
    type: 'PROJECT',
    date: '2024-11-20',
    description: 'React와 Node.js를 이용한 협업 플랫폼',
    year: '2024',
    status: '완료'
  }
];
```

---

### 3️⃣ `community` - 선배/친구 네트워크 테이블

커뮤니티 내 선배 및 친구 정보를 저장합니다.

```sql
CREATE TABLE community (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  major VARCHAR(100),
  level INTEGER,
  job VARCHAR(200),
  tags TEXT[],
  type VARCHAR(20) CHECK (type IN ('senior', 'friend')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_community_type ON community(type);
```

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| `id` | SERIAL | 고유 ID |
| `name` | VARCHAR(100) | 이름 |
| `major` | VARCHAR(100) | 전공 |
| `level` | INTEGER | 레벨 |
| `job` | VARCHAR(200) | 직업/직무 |
| `tags` | TEXT[] | 관심분야 태그 배열 |
| `type` | VARCHAR(20) | 구분 (senior: 선배, friend: 친구) |
| `created_at` | TIMESTAMP | 생성일시 |

**사용 예시:**
```javascript
const mockSeniors = [
  {
    name: '김민수',
    major: '컴퓨터공학',
    level: 82,
    job: '네이버 웹개발자',
    tags: ['AI', 'Frontend'],
    type: 'senior'
  }
];
```

---

### 4️⃣ `resume_base` - 자기소개서 베이스 테이블

자기소개서 작성을 위한 기본 정보를 저장합니다.

```sql
CREATE TABLE resume_base (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  title VARCHAR(200),
  content TEXT,
  keywords TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_resume_base_user_id ON resume_base(user_id);
CREATE INDEX idx_resume_base_category ON resume_base(category);
```

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| `id` | SERIAL | 고유 ID |
| `user_id` | INTEGER | 사용자 ID (외래키) |
| `category` | VARCHAR(50) | 카테고리 (성장과정, 지원동기, 장단점, 협업경험) |
| `title` | VARCHAR(200) | 제목 |
| `content` | TEXT | 내용 |
| `keywords` | TEXT[] | 핵심 키워드 배열 |
| `created_at` | TIMESTAMP | 생성일시 |
| `updated_at` | TIMESTAMP | 수정일시 |

**카테고리 종류:**
- `growth` - 성장과정 및 가치관
- `motivation` - 지원동기 및 직무 포부
- `personality` - 성격의 장단점
- `teamwork` - 협업 및 갈등해결

---

## 🔑 테이블 관계도

```
users (1) ──────< (N) records
  │
  └──────< (N) resume_base

community (독립적)
```

- 1명의 사용자(`users`)는 여러 활동 기록(`records`)을 가질 수 있음
- 1명의 사용자(`users`)는 여러 자기소개서 항목(`resume_base`)을 가질 수 있음
- `community` 테이블은 독립적으로 운영

---

## 🚀 초기 데이터 삽입 (Seed Data)

### 테스트 사용자 생성
```sql
INSERT INTO users (name, major, level, exp, max_exp, character_title)
VALUES ('배혜진', '컴퓨터공학', 7, 420, 1000, '코드 숲의 탐험가');
```

### 샘플 활동 기록
```sql
INSERT INTO records (user_id, title, type, date, description, year, status)
VALUES 
  (1, '웹개발 캡스톤 프로젝트', 'PROJECT', '2024-11-20', 'React와 Node.js를 이용한 협업 플랫폼', '2024', '완료'),
  (1, 'SW 마에스트로 15기 준비', 'EXTRACURRICULAR', '2024-11-15', '코딩 테스트 대비 및 기획서 작성', '2024', '진행중'),
  (1, '데이터베이스 시스템 기말', 'CLASS', '2024-11-10', 'SQL 최적화 및 인덱싱 실습', '2024', '완료');
```

### 커뮤니티 샘플 데이터
```sql
INSERT INTO community (name, major, level, job, tags, type)
VALUES 
  ('김민수', '컴퓨터공학', 82, '네이버 웹개발자', ARRAY['AI', 'Frontend'], 'senior'),
  ('정재희', '디자인', 45, '카카오 디자이너', ARRAY['Design', 'UX'], 'friend'),
  ('지문호', '컴퓨터공학', 99, '구글 엔지니어', ARRAY['Backend', 'AI'], 'senior');
```

---

## 📡 API 엔드포인트 연결

### Users API
- `GET /api/users/:id` - 사용자 정보 조회
- `PUT /api/users/:id` - 사용자 정보 수정
- `POST /api/users/:id/exp` - 경험치 추가 (레벨업 처리)

### Records API
- `GET /api/records?userId=1&year=2024` - 활동 기록 목록
- `POST /api/records` - 활동 기록 추가
- `PUT /api/records/:id` - 활동 기록 수정
- `DELETE /api/records/:id` - 활동 기록 삭제

### Community API
- `GET /api/community?type=senior&tag=AI` - 선배/친구 목록
- `POST /api/community` - 인맥 추가

### AI API
- `POST /api/ai/resume` - 자기소개서 초안 생성
- `POST /api/ai/interview` - 면접 질문 생성

### Resume Base API
- `GET /api/resume-base/:userId` - 자기소개서 베이스 조회
- `PUT /api/resume-base/:userId` - 자기소개서 베이스 수정

---

## 🔒 보안 설정

### PostgreSQL 설정 파일 위치
```bash
/var/lib/pgsql/data/postgresql.conf
/var/lib/pgsql/data/pg_hba.conf
```

### 외부 접속 허용 (선택사항)
```bash
# postgresql.conf
listen_addresses = 'localhost'  # 로컬만 허용 (보안)

# pg_hba.conf
local   all   all                     peer
host    all   all   127.0.0.1/32      md5
```

---

## 📝 유지보수 명령어

### 데이터베이스 백업
```bash
pg_dump -U hybird_user hybird_db > backup_$(date +%Y%m%d).sql
```

### 데이터베이스 복원
```bash
psql -U hybird_user hybird_db < backup_20260119.sql
```

### 테이블 초기화 (주의!)
```sql
TRUNCATE TABLE records, resume_base, users, community CASCADE;
```

### 통계 확인
```sql
-- 사용자별 활동 기록 수
SELECT u.name, COUNT(r.id) as record_count
FROM users u
LEFT JOIN records r ON u.id = r.user_id
GROUP BY u.name;

-- 카테고리별 활동 통계
SELECT type, COUNT(*) as count
FROM records
GROUP BY type;
```

---

## ✅ 체크리스트

- [x] PostgreSQL 설치 및 실행
- [x] 데이터베이스 및 사용자 생성
- [ ] 테이블 스키마 생성
- [ ] 초기 데이터 삽입
- [ ] 인덱스 최적화 확인
- [ ] 백엔드 서버 연결 테스트

---

**생성일**: 2026-01-19  
**작성자**: GitHub Copilot  
**버전**: 1.0
