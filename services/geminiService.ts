
import { requestInterviewQuestions, requestResumeDraft } from './api';

export const generateResumeDraft = async (
  userId: number,
  companyInfo: string,
  jobType: string,
  question: string,
  recordIds?: number[]
) => {
  const result = await requestResumeDraft({ userId, companyInfo, jobType, question, recordIds });
  return result;
};

export const generateInterviewQuestions = async (
  userId: number,
  companyInfo: string,
  jobType?: string,
  recordIds?: number[]
) => {
  const result = await requestInterviewQuestions({ userId, companyInfo, jobType, recordIds });
  return result.questions;
};
