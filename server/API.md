# 🚀 Hybird API 명세서

**Base URL**: `http://localhost:3001/api`  
**Version**: 1.0  
**Last Updated**: 2026-01-19

---

## 📑 목차

1. [Users API](#users-api) - 사용자 관리
2. [Records API](#records-api) - 활동 기록 관리
3. [Community API](#community-api) - 선배/친구 네트워크
4. [AI API](#ai-api) - AI 자소서/면접 생성
5. [Resume Base API](#resume-base-api) - 자기소개서 베이스
6. [Analytics API](#analytics-api) - 통계 및 분석
7. [Companies API](#companies-api) - 회사 정보(JSONB)

---

## 🔐 인증 (Authentication)

현재 버전에서는 인증 없이 개발 진행 (추후 JWT 토큰 추가 예정)

```http
Authorization: Bearer {token}  # 추후 구현
```

---

## 👤 Users API

### 1. 사용자 정보 조회

특정 사용자의 프로필 정보를 조회합니다.

```http
GET /api/users/:id
```

**Path Parameters**
| Name | Type | Description |
|------|------|-------------|
| id | integer | 사용자 고유 ID |

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "배혜진",
    "major": "컴퓨터공학",
    "level": 7,
    "exp": 420,
    "maxExp": 1000,
    "characterTitle": "코드 숲의 탐험가",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-11-20T10:30:00Z"
  }
}
```

**Error Response** `404 Not Found`
```json
{
  "success": false,
  "error": "사용자를 찾을 수 없습니다"
}
```

---

### 2. 사용자 프로필 수정

사용자의 프로필 정보를 업데이트합니다.

```http
PUT /api/users/:id
```

**Request Body**
```json
{
  "name": "배혜진",
  "major": "컴퓨터공학",
  "characterTitle": "코드 마스터"
}
```

**Response** `200 OK`
```json
{
  "success": true,
  "message": "프로필이 업데이트되었습니다",
  "data": {
    "id": 1,
    "name": "배혜진",
    "major": "컴퓨터공학",
    "characterTitle": "코드 마스터"
  }
}
```

---

### 3. 경험치 추가 (레벨업 처리)

활동 완료 시 경험치를 추가하고 레벨업을 자동 처리합니다.

```http
POST /api/users/:id/exp
```

**Request Body**
```json
{
  "expAmount": 15,
  "reason": "프로젝트 기록 완료"
}
```

**Response** `200 OK` (레벨업 없음)
```json
{
  "success": true,
  "message": "+15 EXP 획득!",
  "data": {
    "level": 7,
    "exp": 435,
    "maxExp": 1000,
    "leveledUp": false,
    "remainingExp": 565
  }
}
```

**Response** `200 OK` (레벨업!)
```json
{
  "success": true,
  "message": "🎉 레벨 업! Lv.7 → Lv.8",
  "data": {
    "level": 8,
    "exp": 50,
    "maxExp": 1200,
    "leveledUp": true,
    "previousLevel": 7,
    "remainingExp": 1150
  }
}
```

---

## 📝 Records API

### 1. 활동 기록 목록 조회

사용자의 활동 기록을 조회합니다. 필터링 및 정렬 지원.

```http
GET /api/records
```

**Query Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| userId | integer | Yes | 사용자 ID |
| year | string | No | 연도 필터 (예: "2024") |
| type | string | No | 활동 유형 (PROJECT, CLASS, EXTRACURRICULAR, TEAMWORK) |
| status | string | No | 상태 필터 (완료, 진행중) |
| limit | integer | No | 결과 개수 제한 (기본값: 100) |
| offset | integer | No | 페이지네이션 오프셋 |

**Example Request**
```http
GET /api/records?userId=1&year=2024&type=PROJECT
```

**Response** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "웹개발 캡스톤 프로젝트",
      "type": "PROJECT",
      "date": "2024-11-20",
      "description": "React와 Node.js를 이용한 협업 플랫폼",
      "content": "상세 내용...",
      "tags": ["React", "Node.js", "협업"],
      "year": "2024",
      "status": "완료",
      "createdAt": "2024-11-20T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 12,
    "limit": 100,
    "offset": 0
  }
}
```

---

### 2. 활동 기록 상세 조회

특정 활동 기록의 상세 정보를 조회합니다.

```http
GET /api/records/:id
```

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "title": "웹개발 캡스톤 프로젝트",
    "type": "PROJECT",
    "date": "2024-11-20",
    "description": "React와 Node.js를 이용한 협업 플랫폼",
    "content": "## 프로젝트 개요\n팀원 4명과 함께...",
    "tags": ["React", "Node.js", "협업"],
    "year": "2024",
    "status": "완료",
    "createdAt": "2024-11-20T10:00:00Z",
    "updatedAt": "2024-11-20T15:30:00Z"
  }
}
```

---

### 3. 활동 기록 추가

새로운 활동 기록을 생성합니다.

```http
POST /api/records
```

**Request Body**
```json
{
  "userId": 1,
  "title": "웹개발 캡스톤 프로젝트",
  "type": "PROJECT",
  "date": "2024-11-20",
  "description": "React와 Node.js를 이용한 협업 플랫폼",
  "content": "## 프로젝트 개요\n...",
  "tags": ["React", "Node.js", "협업"],
  "status": "완료"
}
```

**Response** `201 Created`
```json
{
  "success": true,
  "message": "활동 기록이 추가되었습니다 (+15 EXP)",
  "data": {
    "id": 13,
    "title": "웹개발 캡스톤 프로젝트",
    "expGained": 15
  }
}
```

---

### 4. 활동 기록 수정

기존 활동 기록을 수정합니다.

```http
PUT /api/records/:id
```

**Request Body**
```json
{
  "title": "웹개발 캡스톤 프로젝트 (수정)",
  "description": "업데이트된 설명",
  "status": "진행중"
}
```

**Response** `200 OK`
```json
{
  "success": true,
  "message": "활동 기록이 수정되었습니다",
  "data": {
    "id": 1,
    "title": "웹개발 캡스톤 프로젝트 (수정)"
  }
}
```

---

### 5. 활동 기록 삭제

특정 활동 기록을 삭제합니다.

```http
DELETE /api/records/:id
```

**Response** `200 OK`
```json
{
  "success": true,
  "message": "활동 기록이 삭제되었습니다"
}
```

---

## 👥 Community API

### 1. 선배/친구 목록 조회

커뮤니티 멤버 목록을 조회합니다.

```http
GET /api/community
```

**Query Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| type | string | No | 'senior' 또는 'friend' |
| tag | string | No | 관심분야 태그 필터 |
| limit | integer | No | 결과 개수 제한 |

**Example Request**
```http
GET /api/community?type=senior&tag=AI
```

**Response** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "김민수",
      "major": "컴퓨터공학",
      "level": 82,
      "job": "네이버 웹개발자",
      "tags": ["AI", "Frontend"],
      "type": "senior"
    },
    {
      "id": 4,
      "name": "지문호",
      "major": "컴퓨터공학",
      "level": 99,
      "job": "구글 엔지니어",
      "tags": ["Backend", "AI"],
      "type": "senior"
    }
  ]
}
```

---

### 2. 커뮤니티 멤버 추가

새로운 선배 또는 친구를 추가합니다.

```http
POST /api/community
```

**Request Body**
```json
{
  "name": "이지은",
  "major": "컴퓨터공학",
  "level": 50,
  "job": "토스 프론트엔드 개발자",
  "tags": ["Frontend", "UX"],
  "type": "senior"
}
```

**Response** `201 Created`
```json
{
  "success": true,
  "message": "커뮤니티 멤버가 추가되었습니다",
  "data": {
    "id": 7,
    "name": "이지은"
  }
}
```

---

## 🤖 AI API

### 1. 자기소개서 초안 생성 (Gemini)

사용자의 활동 기록을 바탕으로 자기소개서 초안을 AI로 생성합니다.

```http
POST /api/ai/resume
```

**Request Body**
```json
{
  "userId": 1,
  "companyInfo": "구글 코리아",
  "jobType": "프론트엔드 개발자",
  "question": "지원 동기와 본인이 적임자인 이유를 기술하시오 (1000자)",
  "recordIds": [1, 2, 3]
}
```

**Request Fields**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | integer | Yes | 사용자 ID |
| companyInfo | string | Yes | 지원 회사명 |
| jobType | string | Yes | 지원 직무 |
| question | string | Yes | 자소서 문항 |
| recordIds | array | No | 참고할 활동 기록 ID 배열 (없으면 모든 기록 사용) |

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "draft": "저는 지난 3년간 웹 개발 프로젝트를 진행하며...",
    "wordCount": 987,
    "usedRecords": [
      {
        "id": 1,
        "title": "웹개발 캡스톤 프로젝트"
      }
    ],
    "generatedAt": "2024-11-20T15:30:00Z"
  }
}
```

**Error Response** `503 Service Unavailable`
```json
{
  "success": false,
  "error": "Gemini AI 서비스 일시 장애",
  "message": "잠시 후 다시 시도해주세요"
}
```

---

### 2. 면접 예상 질문 생성

사용자의 활동 기록을 바탕으로 예상 면접 질문을 생성합니다.

```http
POST /api/ai/interview
```

**Request Body**
```json
{
  "userId": 1,
  "companyInfo": "구글 코리아",
  "jobType": "프론트엔드 개발자",
  "recordIds": [1, 2, 3]
}
```

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "question": "캡스톤 프로젝트에서 팀원과의 갈등을 어떻게 해결하셨나요?",
        "intent": "협업 능력 및 문제 해결 능력 평가",
        "tip": "STAR 기법을 활용하여 구체적인 상황, 행동, 결과를 제시하세요"
      },
      {
        "question": "React를 선택한 이유와 프로젝트에서 얻은 인사이트는?",
        "intent": "기술 선택의 근거와 학습 능력 평가",
        "tip": "기술적 trade-off와 실제 성과를 수치로 제시하면 좋습니다"
      }
    ],
    "totalQuestions": 5,
    "generatedAt": "2024-11-20T15:30:00Z"
  }
}
```

---

## 📄 Resume Base API

### 1. 자기소개서 베이스 조회

사용자의 자기소개서 기본 정보를 조회합니다.

```http
GET /api/resume-base/:userId
```

**Query Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| category | string | No | 카테고리 필터 (growth, motivation, personality, teamwork) |

**Response** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "category": "growth",
      "title": "성장과정 및 가치관",
      "content": "어려운 문제는 더 큰 배움의 기회입니다...",
      "keywords": ["끈기", "논리적 분석", "문제 해결"],
      "updatedAt": "2024-11-15T10:00:00Z"
    },
    {
      "id": 2,
      "category": "motivation",
      "title": "지원동기 및 직무 포부",
      "content": "단순한 개발자가 아닌...",
      "keywords": ["하이브리드 인재", "기획력", "기술력"],
      "updatedAt": "2024-11-16T14:20:00Z"
    }
  ]
}
```

---

### 2. 자기소개서 베이스 수정

자기소개서 기본 정보를 업데이트합니다.

```http
PUT /api/resume-base/:userId
```

**Request Body**
```json
{
  "category": "growth",
  "title": "성장과정 및 가치관",
  "content": "업데이트된 내용...",
  "keywords": ["끈기", "열정", "도전"]
}
```

**Response** `200 OK`
```json
{
  "success": true,
  "message": "자기소개서 베이스가 업데이트되었습니다",
  "data": {
    "id": 1,
    "category": "growth"
  }
}
```

---

## 📊 Analytics API

### 1. 사용자 통계 조회

사용자의 활동 통계를 조회합니다.

```http
GET /api/analytics/stats/:userId
```

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalRecords": 12,
    "recordsByType": {
      "PROJECT": 4,
      "CLASS": 5,
      "EXTRACURRICULAR": 2,
      "TEAMWORK": 1
    },
    "recordsByYear": {
      "2024": 6,
      "2023": 4,
      "2022": 2
    },
    "recentActivity": {
      "lastRecordDate": "2024-11-20",
      "recordsThisMonth": 3
    },
    "levelInfo": {
      "currentLevel": 7,
      "progressPercentage": 42,
      "rank": "상위 5%"
    }
  }
}
```

---

### 2. 대시보드 데이터 조회

대시보드에 필요한 모든 데이터를 한번에 조회합니다.

```http
GET /api/analytics/dashboard/:userId
```

**Query Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| year | string | No | 연도 필터 (기본값: 현재 연도) |

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "name": "배혜진",
      "level": 7,
      "exp": 420,
      "maxExp": 1000
    },
    "stats": {
      "totalProjects": 12,
      "competencyIndex": 92.4,
      "collaborationLevel": 4
    },
    "recentRecords": [
      {
        "id": 1,
        "title": "웹개발 캡스톤 프로젝트",
        "type": "PROJECT",
        "date": "2024-11-20"
      }
    ]
  }
}
```

---

## 🏢 Companies API

### 1. 회사 정보 목록 조회

회사 정보를 목록으로 조회합니다. 연도/상반기·하반기 필터와 검색어를 지원합니다.

```http
GET /api/companies
```

**Query Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| year | number | No | 연도 필터 (예: 2024) |
| half | string | No | 'H1' 또는 'H2' |
| q | string | No | 회사명/메타데이터 검색어 |

**Response** `200 OK`
```json
[
  {
    "id": 1,
    "company_name": "삼성전자",
    "year": 2024,
    "half": "H1",
    "metadata": {
      "sector": "전자",
      "homepage": "https://samsung.com"
    }
  }
]
```

---

### 2. 단일 회사 조회

```http
GET /api/companies/:id
```

**Response** `200 OK`
```json
{
  "id": 1,
  "company_name": "삼성전자",
  "year": 2024,
  "half": "H1",
  "metadata": {
    "sector": "전자",
    "homepage": "https://samsung.com"
  }
}
```

---

### 3. 회사 정보 생성

```http
POST /api/companies
```

**Request Body**
```json
{
  "company_name": "삼성전자",
  "year": 2024,
  "half": "H1",
  "metadata": {
    "sector": "전자",
    "homepage": "https://samsung.com"
  }
}
```

**Response** `201 Created`
```json
{
  "id": 1,
  "company_name": "삼성전자",
  "year": 2024,
  "half": "H1",
  "metadata": {
    "sector": "전자",
    "homepage": "https://samsung.com"
  }
}
```

---

### 4. 회사 정보 업데이트

```http
PUT /api/companies/:id
```

**Request Body** (모든 필드 선택적)
```json
{
  "company_name": "삼성전자",
  "year": 2024,
  "half": "H1",
  "metadata": {
    "sector": "전자",
    "homepage": "https://samsung.com"
  }
}
```

**Response** `200 OK`
```json
{
  "id": 1,
  "company_name": "삼성전자",
  "year": 2024,
  "half": "H1",
  "metadata": {
    "sector": "전자",
    "homepage": "https://samsung.com"
  }
}
```

---

### 5. 회사 정보 삭제

```http
DELETE /api/companies/:id
```

**Response** `200 OK`
```json
{
  "message": "Company deleted"
}
```

---

## 🚨 Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - 요청 성공 |
| 201 | Created - 리소스 생성 성공 |
| 400 | Bad Request - 잘못된 요청 |
| 404 | Not Found - 리소스를 찾을 수 없음 |
| 500 | Internal Server Error - 서버 오류 |
| 503 | Service Unavailable - 서비스 일시 장애 (AI API 등) |

**Error Response Format**
```json
{
  "success": false,
  "error": "에러 제목",
  "message": "상세 설명",
  "code": "ERROR_CODE"
}
```

---

## 📝 데이터 타입 정의

### ActivityType Enum
```typescript
enum ActivityType {
  PROJECT = 'PROJECT',
  CLASS = 'CLASS',
  EXTRACURRICULAR = 'EXTRACURRICULAR',
  TEAMWORK = 'TEAMWORK'
}
```

### CommunityType Enum
```typescript
enum CommunityType {
  SENIOR = 'senior',
  FRIEND = 'friend'
}
```

### ResumeCategoryType Enum
```typescript
enum ResumeCategoryType {
  GROWTH = 'growth',
  MOTIVATION = 'motivation',
  PERSONALITY = 'personality',
  TEAMWORK = 'teamwork'
}
```

---

## 🧪 테스트 방법

### cURL 예시
```bash
# 사용자 정보 조회
curl http://localhost:3001/api/users/1

# 활동 기록 추가
curl -X POST http://localhost:3001/api/records \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "title": "테스트 프로젝트",
    "type": "PROJECT",
    "date": "2024-11-20"
  }'

# AI 자소서 생성
curl -X POST http://localhost:3001/api/ai/resume \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "companyInfo": "구글",
    "jobType": "개발자",
    "question": "지원 동기"
  }'
```

### Postman Collection

[Postman Collection 다운로드](#) (추후 제공)

---

## 📌 개발 우선순위

**Phase 1** (MVP)
- ✅ Users API - 기본 CRUD
- ✅ AI API - Gemini 자소서/면접 생성
- ⬜ Records API - 기본 CRUD

**Phase 2** (확장)
- ⬜ Resume Base API
- ⬜ Community API
- ⬜ Analytics API

**Phase 3** (최적화)
- ⬜ 인증/권한 (JWT)
- ⬜ 페이지네이션 최적화
- ⬜ 캐싱 (Redis)
- ⬜ Rate Limiting

---

**문서 버전**: 1.0  
**작성일**: 2026-01-19  
**작성자**: GitHub Copilot
