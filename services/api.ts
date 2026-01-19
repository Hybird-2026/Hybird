import axios from 'axios';

// Vite 프록시를 사용하도록 상대 경로 사용
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000, // 180초로 증가 (AI 생성은 시간이 오래 걸림)
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (로깅 등)
api.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (에러 처리 등)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('[API Error]', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ==================== Users API ====================
export const usersAPI = {
  // 사용자 생성
  createUser: async (userData: { name: string; major?: string }) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // 사용자 조회
  getUser: async (userId: number) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // 사용자 업데이트
  updateUser: async (userId: number, userData: any) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  // 경험치 추가
  addExp: async (userId: number, exp: number) => {
    const response = await api.post(`/users/${userId}/exp`, { exp });
    return response.data;
  },
};

// ==================== Records API ====================
export const recordsAPI = {
  // 모든 기록 조회
  getAllRecords: async (userId: number, filters?: { type?: string; year?: string }) => {
    const response = await api.get(`/records`, { params: { userId, ...filters } });
    return response.data;
  },

  // 기록 생성
  createRecord: async (recordData: {
    userId: number;
    title: string;
    type: string;
    date?: string;
    description?: string;
    content?: string;
    tags?: string[];
    year?: string;
    status?: string;
  }) => {
    const response = await api.post('/records', recordData);
    return response.data;
  },

  // 기록 수정
  updateRecord: async (recordId: number, recordData: any) => {
    const response = await api.put(`/records/${recordId}`, recordData);
    return response.data;
  },

  // 기록 삭제
  deleteRecord: async (recordId: number) => {
    const response = await api.delete(`/records/${recordId}`);
    return response.data;
  },
};

// ==================== Community API ====================
export const communityAPI = {
  // 커뮤니티 멤버 조회
  getAllMembers: async (filters?: { type?: string; tags?: string[] }) => {
    const response = await api.get('/community', { params: filters });
    return response.data;
  },

  // 커뮤니티 멤버 추가
  addMember: async (memberData: {
    name: string;
    major?: string;
    level?: number;
    job?: string;
    tags?: string[];
    type: 'senior' | 'friend';
  }) => {
    const response = await api.post('/community', memberData);
    return response.data;
  },
};

// ==================== AI API ====================
export const aiAPI = {
  // 자기소개서 생성
  generateResume: async (data: {
    userRecords: string;
    company: string;
    position: string;
    question: string;
  }) => {
    const response = await api.post('/ai/resume', {
      userId: 1, // 임시값
      userInfo: data.userRecords,
      companyInfo: data.company,
      jobType: data.position,
      question: data.question
    });
    return response.data;
  },

  // 면접 질문 생성
  generateInterviewQuestions: async (data: {
    userRecords: string;
    company: string;
  }) => {
    const response = await api.post('/ai/interview', {
      userId: 1, // 임시값
      userInfo: data.userRecords,
      companyInfo: data.company
    });
    return response.data;
  },
};

// ==================== Resume Base API ====================
export const resumeBaseAPI = {
  // 이력서 항목 조회
  getResumeItems: async (userId: number, category?: string) => {
    const response = await api.get(`/resume-base`, { params: { userId, category } });
    return response.data;
  },

  // 이력서 항목 추가
  addResumeItem: async (itemData: {
    userId: number;
    category: string;
    title: string;
    content?: string;
    keywords?: string[];
  }) => {
    const response = await api.post('/resume-base', itemData);
    return response.data;
  },
};

// ==================== Analytics API ====================
export const analyticsAPI = {
  // 통계 조회
  getAnalytics: async (userId: number) => {
    const response = await api.get(`/analytics/${userId}`);
    return response.data;
  },
};

export default api;
