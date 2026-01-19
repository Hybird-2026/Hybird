
import React, { useState } from 'react';
import { generateResumeDraft, generateInterviewQuestions } from '../services/geminiService';

const AITools: React.FC = () => {
  // Resume states
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeResult, setResumeResult] = useState<any>(null);
  const [resumeCompany, setResumeCompany] = useState('');
  const [resumeJob, setResumeJob] = useState('');
  const [question, setQuestion] = useState('');

  // Interview states
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [interviewResult, setInterviewResult] = useState<any>(null);
  const [interviewCompany, setInterviewCompany] = useState('');

  const handleResumeGenerate = async () => {
    setResumeLoading(true);
    try {
      const text = await generateResumeDraft("프론트엔드 프로젝트 참여, 팀장 역할 수행", resumeCompany, resumeJob, question);
      setResumeResult(text);
    } catch (err) {
      alert("AI 생성 중 오류가 발생했습니다.");
    }
    setResumeLoading(false);
  };

  const handleInterviewGenerate = async () => {
    setInterviewLoading(true);
    try {
      const qas = await generateInterviewQuestions("프론트엔드 프로젝트 참여, 팀장 역할 수행", interviewCompany);
      setInterviewResult(qas);
    } catch (err) {
      alert("AI 생성 중 오류가 발생했습니다.");
    }
    setInterviewLoading(false);
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 자기소개서 초안 생성 */}
        <div className="bg-white rounded-2xl border p-8 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6">자기소개서 초안 생성</h3>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">지원 회사</label>
              <input 
                type="text" 
                placeholder="예: 구글 코리아" 
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#114982] focus:border-[#114982] outline-none transition-all"
                value={resumeCompany}
                onChange={(e) => setResumeCompany(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">지원 직무</label>
              <input 
                type="text" 
                placeholder="예: 프론트엔드 개발자" 
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#114982] focus:border-[#114982] outline-none transition-all"
                value={resumeJob}
                onChange={(e) => setResumeJob(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">자소서 문항</label>
              <textarea 
                placeholder="자소서 문항을 입력해주세요 (예: 지원 동기와 본인이 적임자인 이유를 기술하시오)" 
                className="w-full border rounded-lg px-4 py-2 min-h-[100px] focus:ring-2 focus:ring-[#114982] focus:border-[#114982] outline-none transition-all resize-none"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>
          </div>

          <button 
            onClick={handleResumeGenerate}
            disabled={resumeLoading}
            className="w-full bg-[#114982] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#0a2e55] disabled:opacity-50 transition-all"
          >
            {resumeLoading ? (
              <i className="fa-solid fa-spinner fa-spin"></i>
            ) : (
              <i className="fa-solid fa-wand-sparkles"></i>
            )}
            자소서 초안 생성하기
          </button>

          {resumeResult && (
            <div className="mt-8 pt-8 border-t">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-square-check text-green-500"></i>
                생성 결과
              </h4>
              <div className="bg-slate-50 rounded-xl p-6 text-slate-800 leading-relaxed whitespace-pre-wrap">
                {resumeResult}
              </div>
            </div>
          )}
        </div>

        {/* 면접 예상 질문 시뮬레이션 */}
        <div className="bg-white rounded-2xl border p-8 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6">면접 예상 질문 시뮬레이션</h3>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">지원 회사</label>
              <input 
                type="text" 
                placeholder="예: 구글 코리아" 
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#114982] focus:border-[#114982] outline-none transition-all"
                value={interviewCompany}
                onChange={(e) => setInterviewCompany(e.target.value)}
              />
            </div>
          </div>

          <button 
            onClick={handleInterviewGenerate}
            disabled={interviewLoading}
            className="w-full bg-[#114982] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#0a2e55] disabled:opacity-50 transition-all"
          >
            {interviewLoading ? (
              <i className="fa-solid fa-spinner fa-spin"></i>
            ) : (
              <i className="fa-solid fa-wand-sparkles"></i>
            )}
            면접 질문 생성하기
          </button>

          {interviewResult && (
            <div className="mt-8 pt-8 border-t">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-square-check text-green-500"></i>
                생성 결과
              </h4>
              <div className="bg-slate-50 rounded-xl p-6 text-slate-800 leading-relaxed">
                <div className="space-y-6">
                  {interviewResult.map((item: any, idx: number) => (
                    <div key={idx} className="bg-white border p-4 rounded-lg shadow-sm">
                      <p className="font-bold text-[#114982] mb-2">Q: {item.question}</p>
                      <p className="text-sm text-slate-600 mb-1"><strong>의도:</strong> {item.intent}</p>
                      <p className="text-sm text-slate-600"><strong>Tip:</strong> {item.tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AITools;
