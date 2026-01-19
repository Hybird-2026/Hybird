
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateResumeDraft = async (
  activityData: string,
  companyInfo: string,
  jobType: string,
  question: string
) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      사용자의 대학 생활 기록: ${activityData}
      지원 기업 정보: ${companyInfo}
      지원 직무: ${jobType}
      자기소개서 문항: ${question}
      
      위 데이터를 바탕으로 한국어로 논리적이고 전문적인 자기소개서 초안을 작성해주세요. 
      STAR 기법(Situation, Task, Action, Result)을 활용하여 구체적인 수치나 갈등 해결 과정을 포함하세요.
    `,
  });
  return response.text;
};

export const generateInterviewQuestions = async (
  activityData: string,
  companyInfo: string
) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      사용자의 대학 생활 기록: ${activityData}
      지원 기업 정보: ${companyInfo}
      
      이 기록을 바탕으로 예상 면접 질문 5개와 각 질문에 대한 의도 및 답변 팁을 JSON 형식으로 생성해주세요.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            intent: { type: Type.STRING },
            tip: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};
