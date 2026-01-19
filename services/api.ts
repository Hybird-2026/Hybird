import axios from 'axios';
import { ActivityRecord, CommunityMember, UserProfile, ActivityType } from '../types';

const apiBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const apiClient = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true
});

export const fetchUserProfile = async (userId: number): Promise<UserProfile> => {
  const { data } = await apiClient.get(`/users/${userId}`);
  return data.data as UserProfile;
};

export const updateUserProfile = async (
  userId: number,
  payload: Partial<Pick<UserProfile, 'name' | 'major' | 'characterTitle'>>
): Promise<UserProfile> => {
  const { data } = await apiClient.put(`/users/${userId}`, payload);
  return data.data as UserProfile;
};

export interface FetchRecordsParams {
  userId: number;
  year?: string;
  type?: ActivityType;
  status?: string;
  limit?: number;
  offset?: number;
}

export const fetchRecords = async (params: FetchRecordsParams): Promise<ActivityRecord[]> => {
  const { data } = await apiClient.get('/records', { params });
  return data.data as ActivityRecord[];
};

export interface CreateRecordPayload {
  userId: number;
  title: string;
  type: ActivityType;
  date?: string;
  description?: string;
  content?: string;
  tags?: string[];
  status?: string;
}

export const createRecord = async (payload: CreateRecordPayload) => {
  const { data } = await apiClient.post('/records', payload);
  return data;
};

export const fetchCommunityMembers = async (filters?: { type?: string; tag?: string; limit?: number }): Promise<CommunityMember[]> => {
  const { data } = await apiClient.get('/community', { params: filters });
  return data.data as CommunityMember[];
};

export const addExperience = async (userId: number, expAmount: number, reason?: string) => {
  const { data } = await apiClient.post(`/users/${userId}/exp`, { expAmount, reason });
  return data.data as { level: number; exp: number; maxExp: number; leveledUp: boolean };
};

export interface ResumePayload {
  userId: number;
  companyInfo: string;
  jobType: string;
  question: string;
  recordIds?: number[];
}

export const requestResumeDraft = async (payload: ResumePayload) => {
  const { data } = await apiClient.post('/ai/resume', payload);
  return data.data as { draft: string; wordCount: number; usedRecords: { id: number; title: string }[]; generatedAt: string };
};

export interface InterviewPayload {
  userId: number;
  companyInfo: string;
  jobType?: string;
  recordIds?: number[];
}

export const requestInterviewQuestions = async (payload: InterviewPayload) => {
  const { data } = await apiClient.post('/ai/interview', payload);
  return data.data as { questions: { question: string; intent: string; tip: string }[]; totalQuestions: number; generatedAt: string };
};
