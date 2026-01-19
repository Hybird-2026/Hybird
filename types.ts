
export enum ActivityType {
  PROJECT = '프로젝트',
  CLASS = '수업',
  EXTRACURRICULAR = '대외활동',
  TEAMWORK = '협업/경험'
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  date: string;
  description: string;
  tags: string[];
  details: {
    role?: string;
    skills?: string[];
    conflict?: string;
    resolution?: string;
    achievement?: string;
  };
}

export interface UserProfile {
  name: string;
  major: string;
  level: number;
  exp: number;
  maxExp: number;
  characterTitle: string;
}
