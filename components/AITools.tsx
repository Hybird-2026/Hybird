
import React, { useState } from 'react';
import { generateResumeDraft, generateInterviewQuestions } from '../services/geminiService';

const AITools: React.FC = () => {
  const [mode, setMode] = useState<'resume' | 'interview'>('resume');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Form states
  const [company, setCompany] = useState('');
  const [job, setJob] = useState('');
  const [question, setQuestion] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      if (mode === 'resume') {
        const text = await generateResumeDraft("프론트엔드 프로젝트 참여, 팀장 역할 수행", company, job, question);
        setResult(text);
      } else {
        const qas = await generateInterviewQuestions("프론트엔드 프로젝트 참여, 팀장 역할 수행", company);
        setResult(qas);
      }
    } catch (err) {
      alert("AI 생성 중 오류가 발생했습니다.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex bg-slate-100 p-1 rounded-xl">
        <button 
          className={`flex-1 py-2 rounded-lg font-bold transition-all ${mode === 'resume' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
          onClick={() => { setMode('resume'); setResult(null); }}
        >
          자기소개서 초안 생성
        </button>
        <button 
          className={`flex-1 py-2 rounded-lg font-bold transition-all ${mode === 'interview' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
          onClick={() => { setMode('interview'); setResult(null); }}
        >
          면접 예상 질문 시뮬레이션
        </button>
      </div>

      <div className="bg-white rounded-2xl border p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">지원 회사</label>
            <input 
              type="text" 
              placeholder="예: 구글 코리아" 
              className="w-full border rounded-lg px-4 py-2"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">지원 직무</label>
            <input 
              type="text" 
              placeholder="예: 프론트엔드 개발자" 
              className="w-full border rounded-lg px-4 py-2"
              value={job}
              onChange={(e) => setJob(e.target.value)}
            />
          </div>
        </div>

        {mode === 'resume' && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-1">자소서 문항</label>
            <textarea 
              placeholder="자소서 문항을 입력해주세요 (예: 지원 동기와 본인이 적임자인 이유를 기술하시오)" 
              className="w-full border rounded-lg px-4 py-2 min-h-[100px]"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>
        )}

        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-all"
        >
          {loading ? (
            <i className="fa-solid fa-spinner fa-spin"></i>
          ) : (
            <i className="fa-solid fa-wand-sparkles"></i>
          )}
          {mode === 'resume' ? '자소서 초안 생성하기' : '면접 질문 생성하기'}
        </button>

        {result && (
          <div className="mt-8 pt-8 border-t">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-square-check text-green-500"></i>
              생성 결과
            </h4>
            <div className="bg-slate-50 rounded-xl p-6 text-slate-800 leading-relaxed whitespace-pre-wrap">
              {mode === 'resume' ? (
                result
              ) : (
                <div className="space-y-6">
                  {result.map((item: any, idx: number) => (
                    <div key={idx} className="bg-white border p-4 rounded-lg shadow-sm">
                      <p className="font-bold text-indigo-700 mb-2">Q: {item.question}</p>
                      <p className="text-sm text-slate-600 mb-1"><strong>의도:</strong> {item.intent}</p>
                      <p className="text-sm text-slate-600"><strong>Tip:</strong> {item.tip}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AITools;
