
import React, { useState } from 'react';
import { generateResumeDraft, generateInterviewQuestions } from '../services/geminiService';

interface AIToolsProps {
  userId: number;
  activeSubTab: 'resume' | 'interview';
  setActiveSubTab: (tab: 'resume' | 'interview') => void;
}

const AITools: React.FC<AIToolsProps> = ({ userId, activeSubTab, setActiveSubTab }) => {
  
  // Resume states
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeResult, setResumeResult] = useState<any>(null);
  const [resumeCompany, setResumeCompany] = useState('');
  const [resumeJob, setResumeJob] = useState('');
  const [questions, setQuestions] = useState<string[]>(['']);

  // Interview states
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [interviewResult, setInterviewResult] = useState<any>(null);
  const [interviewCompany, setInterviewCompany] = useState('');

  const handleResumeGenerate = async () => {
    setResumeLoading(true);
    try {
      const questionText = questions.filter(q => q.trim()).join('\n\n');
      const result = await generateResumeDraft(userId, resumeCompany, resumeJob, questionText);
      setResumeResult(result);
    } catch (err) {
      alert("AI 생성 중 오류가 발생했습니다.");
    }
    setResumeLoading(false);
  };

  const addQuestion = () => {
    setQuestions([...questions, '']);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const handleInterviewGenerate = async () => {
    setInterviewLoading(true);
    try {
      const qas = await generateInterviewQuestions(userId, interviewCompany, resumeJob);
      setInterviewResult(qas);
    } catch (err) {
      alert("AI 생성 중 오류가 발생했습니다.");
    }
    setInterviewLoading(false);
  };

  return (
    <div className="w-full max-w-[720px] mx-auto space-y-6">
      {/* Content based on active tab */}
      {activeSubTab === 'resume' && (
        <div className="bg-white rounded-2xl border p-8 shadow-sm">
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-base font-semibold text-slate-700 mb-1">지원 회사</label>
              <input 
                type="text" 
                placeholder="예: 구글 코리아" 
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#114982] focus:border-[#114982] outline-none transition-all"
                value={resumeCompany}
                onChange={(e) => setResumeCompany(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-base font-semibold text-slate-700 mb-1">지원 직무</label>
              <input 
                type="text" 
                placeholder="예: 프론트엔드 개발자" 
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#114982] focus:border-[#114982] outline-none transition-all"
                value={resumeJob}
                onChange={(e) => setResumeJob(e.target.value)}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-base font-semibold text-slate-700">자기소개서 문항</label>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex items-center justify-center w-8 h-8 bg-[#114982] text-white rounded-lg hover:bg-[#0a2e55] transition-all"
                >
                  <i className="fa-solid fa-plus text-sm"></i>
                </button>
              </div>
              <div className="space-y-3">
                {questions.map((question, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <span className="flex items-center justify-center w-8 h-8 text-slate-600 font-bold text-sm pt-2">
                      {index + 1}
                    </span>
                    <textarea 
                      placeholder="예: 지원 동기를 기술하시오" 
                      className="flex-1 border rounded-lg px-4 py-2 min-h-[40px] focus:ring-2 focus:ring-[#114982] focus:border-[#114982] outline-none transition-all resize-none"
                      value={question}
                      onChange={(e) => updateQuestion(index, e.target.value)}
                    />
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="flex items-center justify-center w-8 h-8 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all mt-2"
                      >
                        <i className="fa-solid fa-trash text-xs"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>
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
                {resumeResult.draft}
              </div>
              <p className="text-xs text-slate-400 mt-2">글자 수: {resumeResult.wordCount}</p>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'interview' && (
        <div className="bg-white rounded-2xl border p-8 shadow-sm">
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
      )}
    </div>
  );
};

export default AITools;
