import {
  ActivityRecord,
  CommunityMember,
  UserProfile,
  ActivityType,
} from "../types";

export const mockUserProfile: UserProfile = {
  id: 1,
  name: "배혜진",
  major: "컴퓨터공학",
  level: 7,
  exp: 420,
  maxExp: 1000,
  characterTitle: "코드 숲의 탐험가",
};

export const mockRecords: ActivityRecord[] = [
  {
    id: 1,
    userId: 1,
    title: "웹개발 캡스톤 프로젝트",
    type: ActivityType.PROJECT,
    date: "2024-11-20",
    description: "React와 Node.js를 이용한 협업 플랫폼",
    content:
      "React와 Node.js를 이용한 협업 플랫폼 개발. 팀장 역할 수행하며 프론트엔드 아키텍처 설계.",
    year: "2024",
    status: "완료",
  },
  {
    id: 2,
    userId: 1,
    title: "데이터베이스 시스템 기말",
    type: ActivityType.CLASS,
    date: "2024-11-10",
    description: "SQL 최적화 및 인덱싱 실습",
    content:
      "PostgreSQL을 활용한 쿼리 최적화 및 인덱스 설계 학습.",
    year: "2024",
    status: "완료",
  },
  {
    id: 3,
    userId: 1,
    title: "SW 마에스트로 15기 준비",
    type: ActivityType.EXTRACURRICULAR,
    date: "2024-11-15",
    description: "코딩 테스트 대비 및 기획서 작성",
    content:
      "알고리즘 문제 풀이 및 창의적인 서비스 기획서 작성.",
    year: "2024",
    status: "진행중",
  },
  {
    id: 4,
    userId: 1,
    title: "교내 해커톤: 스마트 캠퍼스",
    type: ActivityType.PROJECT,
    date: "2024-09-12",
    description: "캠퍼스 내 길찾기 AR 서비스",
    content:
      "AR 기술을 활용한 캠퍼스 길찾기 앱 개발. 2등 수상.",
    year: "2024",
    status: "완료",
  },
];

export const mockCommunityMembers: CommunityMember[] = [
  {
    id: 1,
    name: "김민수",
    major: "컴퓨터공학",
    level: 82,
    job: "네이버 웹개발자",
    tags: ["AI", "Frontend"],
    type: "senior",
  },
  {
    id: 2,
    name: "정재희",
    major: "디자인",
    level: 45,
    job: "카카오 디자이너",
    tags: ["Design", "UX"],
    type: "friend",
  },
  {
    id: 3,
    name: "한유진",
    major: "경영학과",
    level: 12,
    job: "취준생",
    tags: ["PM", "Marketing"],
    type: "friend",
  },
  {
    id: 4,
    name: "지문호",
    major: "컴퓨터공학",
    level: 99,
    job: "구글 엔지니어",
    tags: ["Backend", "AI"],
    type: "senior",
  },
  {
    id: 5,
    name: "박준혁",
    major: "전자공학",
    level: 68,
    job: "삼성전자",
    tags: ["Embedded", "Hardware"],
    type: "senior",
  },
];
