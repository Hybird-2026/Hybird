import axios from "axios";
import {
  ActivityRecord,
  CommunityMember,
  UserProfile,
  ActivityType,
} from "../types";
import * as mockData from "./mockData";

const DEV_MODE = import.meta.env.VITE_DEV_MODE === "true";
const apiBaseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

export const apiClient = axios.create({
  baseURL: apiBaseURL,
  withCredentials: false,
});

// Mock 함수들
const mockFetchUserProfile = async (
  userId: number,
): Promise<UserProfile> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockData.mockUserProfile), 300);
  });
};

const mockUpdateUserProfile = async (
  userId: number,
  payload: Partial<Pick<UserProfile, "name" | "major" | "characterTitle">>,
): Promise<UserProfile> => {
  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          ...mockData.mockUserProfile,
          ...payload,
        }),
      300,
    );
  });
};

const mockFetchRecords = async (
  params: FetchRecordsParams,
): Promise<ActivityRecord[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let records = mockData.mockRecords;
      if (params.year) {
        records = records.filter((r) => r.year === params.year);
      }
      if (params.type) {
        records = records.filter((r) => r.type === params.type);
      }
      if (params.status) {
        records = records.filter((r) => r.status === params.status);
      }
      resolve(records);
    }, 300);
  });
};

const mockCreateRecord = async (
  payload: CreateRecordPayload,
): Promise<{ data: ActivityRecord }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newRecord: ActivityRecord = {
        id: mockData.mockRecords.length + 1,
        ...payload,
      };
      resolve({ data: newRecord });
    }, 300);
  });
};

const mockFetchCommunityMembers = async (filters?: {
  type?: string;
  tag?: string;
  limit?: number;
}): Promise<CommunityMember[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let members = mockData.mockCommunityMembers;
      if (filters?.type) {
        members = members.filter((m) => m.type === filters.type);
      }
      if (filters?.tag) {
        members = members.filter((m) => m.tags.includes(filters.tag));
      }
      if (filters?.limit) {
        members = members.slice(0, filters.limit);
      }
      resolve(members);
    }, 300);
  });
};

// 실제 API 함수들
export const fetchUserProfile = async (
  userId: number,
): Promise<UserProfile> => {
  if (DEV_MODE) return mockFetchUserProfile(userId);
  const { data } = await apiClient.get(`/users/${userId}`);
  return data.data as UserProfile;
};

export const updateUserProfile = async (
  userId: number,
  payload: Partial<Pick<UserProfile, "name" | "major" | "characterTitle">>,
): Promise<UserProfile> => {
  if (DEV_MODE) return mockUpdateUserProfile(userId, payload);
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

export const fetchRecords = async (
  params: FetchRecordsParams,
): Promise<ActivityRecord[]> => {
  if (DEV_MODE) return mockFetchRecords(params);
  const { data } = await apiClient.get("/records", { params });
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
  if (DEV_MODE) return mockCreateRecord(payload);
  const { data } = await apiClient.post("/records", payload);
  return data;
};

export const fetchCommunityMembers = async (filters?: {
  type?: string;
  tag?: string;
  limit?: number;
}): Promise<CommunityMember[]> => {
  if (DEV_MODE) return mockFetchCommunityMembers(filters);
  const { data } = await apiClient.get("/community", { params: filters });
  return data.data as CommunityMember[];
};

export const addExperience = async (
  userId: number,
  expAmount: number,
  reason?: string,
) => {
  const { data } = await apiClient.post(`/users/${userId}/exp`, {
    expAmount,
    reason,
  });
  return data.data as {
    level: number;
    exp: number;
    maxExp: number;
    leveledUp: boolean;
  };
};

export interface ResumePayload {
  userId: number;
  companyInfo: string;
  jobType: string;
  question: string;
  recordIds?: number[];
}

export const requestResumeDraft = async (payload: ResumePayload) => {
  const { data } = await apiClient.post("/ai/resume", payload);
  return data.data as {
    draft: string;
    wordCount: number;
    usedRecords: { id: number; title: string }[];
    generatedAt: string;
  };
};

export interface InterviewPayload {
  userId: number;
  companyInfo: string;
  jobType?: string;
  recordIds?: number[];
}

export const requestInterviewQuestions = async (payload: InterviewPayload) => {
  const { data } = await apiClient.post("/ai/interview", payload);
  return data.data as {
    questions: { question: string; intent: string; tip: string }[];
    totalQuestions: number;
    generatedAt: string;
  };
};
