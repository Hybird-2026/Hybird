
export enum ActivityType {
  PROJECT = 'PROJECT',
  CLASS = 'CLASS',
  EXTRACURRICULAR = 'EXTRACURRICULAR',
  TEAMWORK = 'TEAMWORK'
}

export const ActivityTypeLabel: Record<ActivityType, string> = {
  [ActivityType.PROJECT]: '프로젝트',
  [ActivityType.CLASS]: '수업',
  [ActivityType.EXTRACURRICULAR]: '대외활동',
  [ActivityType.TEAMWORK]: '협업/경험'
};

export interface ActivityRecord {
  id: number;
  userId: number;
  type: ActivityType;
  title: string;
  date?: string;
  description?: string;
  content?: string;
  tags?: string[];
  year?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  id: number;
  name: string;
  major: string;
  level: number;
  exp: number;
  maxExp: number;
  characterTitle: string;
}

export type CommunityType = 'senior' | 'friend';

export interface CommunityMember {
  id: number;
  name: string;
  major: string;
  level: number;
  job: string;
  tags: string[];
  type: CommunityType;
}
