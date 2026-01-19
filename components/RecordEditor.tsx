
import React, { useState } from 'react';
import { ActivityType } from '../types';

interface RecordEditorProps {
  onSave: (record: any) => void;
}

const RecordEditor: React.FC<RecordEditorProps> = ({ onSave }) => {
  const [type, setType] = useState<ActivityType>(ActivityType.PROJECT);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const getTypeColor = () => {
    switch(type) {
      case ActivityType.PROJECT: return '#4285F4';
      case ActivityType.CLASS: return '#E28779';
      case ActivityType.EXTRACURRICULAR: return '#837655';
      case ActivityType.TEAMWORK: return '#92B23E';
      default: return '#114982';
    }
  };

  const renderGuide = () => {
    switch(type) {
      case ActivityType.PROJECT:
        return (
          <div className="bg-[#4285F4]/10 border border-[#4285F4]/30 p-5 rounded-xl mb-6 text-sm text-[#4285F4] shadow-sm animate-fadeIn">
            <p className="font-bold mb-2 flex items-center gap-2">
              <i className="fa-solid fa-rocket"></i>
              프로젝트 작성 가이드
            </p>
            <ul className="space-y-2">
              <li className="flex gap-2"><span>1.</span> <strong>핵심 기술:</strong> 사용한 언어와 프레임워크를 명시하세요.</li>
              <li className="flex gap-2"><span>2.</span> <strong>나의 역할:</strong> 팀 내에서 담당한 구체적인 파트를 적어주세요.</li>
              <li className="flex gap-2"><span>3.</span> <strong>성과:</strong> 결과물 링크나 수치적 성과가 있다면 좋습니다.</li>
            </ul>
          </div>
        );
      case ActivityType.CLASS:
        return (
          <div className="bg-[#E28779]/10 border border-[#E28779]/30 p-5 rounded-xl mb-6 text-sm text-[#E28779] shadow-sm animate-fadeIn">
            <p className="font-bold mb-2 flex items-center gap-2">
              <i className="fa-solid fa-graduation-cap"></i>
              수업/학습 기록 가이드
            </p>
            <ul className="space-y-2">
              <li className="flex gap-2"><span>1.</span> <strong>핵심 개념:</strong> 수업에서 배운 핵심 이론을 요약하세요.</li>
              <li className="flex gap-2"><span>2.</span> <strong>과제/실습:</strong> 실습 중 겪었던 문제와 해결 과정을 적으세요.</li>
            </ul>
          </div>
        );
      case ActivityType.EXTRACURRICULAR:
        return (
          <div className="bg-[#837655]/10 border border-[#837655]/30 p-5 rounded-xl mb-6 text-sm text-[#837655] shadow-sm animate-fadeIn">
            <p className="font-bold mb-2 flex items-center gap-2">
              <i className="fa-solid fa-star"></i>
              대외활동 기록 가이드
            </p>
            <ul className="space-y-2">
              <li className="flex gap-2"><span>1.</span> <strong>활동 개요:</strong> 어떤 목적의 활동이었나요?</li>
              <li className="flex gap-2"><span>2.</span> <strong>네트워킹:</strong> 누구와 어떤 상호작용을 했나요?</li>
            </ul>
          </div>
        );
      case ActivityType.TEAMWORK:
        return (
          <div className="bg-[#92B23E]/10 border border-[#92B23E]/30 p-5 rounded-xl mb-6 text-sm text-[#92B23E] shadow-sm animate-fadeIn">
            <p className="font-bold mb-2 flex items-center gap-2">
              <i className="fa-solid fa-people-arrows"></i>
              협업/갈등 경험 가이드
            </p>
            <ul className="space-y-2">
              <li className="flex gap-2"><span>1.</span> <strong>갈등 상황:</strong> 팀 내에서 발생한 의견 차이는 무엇이었나요?</li>
              <li className="flex gap-2"><span>2.</span> <strong>해결 노력:</strong> 본인이 중재를 위해 어떤 노력을 했나요?</li>
              <li className="flex gap-2"><span>3.</span> <strong>결과:</strong> 협업을 통해 무엇을 깨달았나요?</li>
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-[#114982] rounded-xl flex items-center justify-center text-white">
          <i className="fa-solid fa-plus text-lg"></i>
        </div>
        <h3 className="text-2xl font-bold text-slate-800">새로운 경험 기록하기</h3>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {Object.values(ActivityType).map((t) => {
          const getColor = () => {
            switch(t) {
              case ActivityType.PROJECT: return '#4285F4';
              case ActivityType.CLASS: return '#E28779';
              case ActivityType.EXTRACURRICULAR: return '#837655';
              case ActivityType.TEAMWORK: return '#92B23E';
              default: return '#114982';
            }
          };
          const color = getColor();
          
          return (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border-2 flex flex-col items-center gap-2 ${
              type === t 
                ? 'text-white shadow-lg' 
                : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
            }`}
            style={type === t ? { backgroundColor: color, borderColor: color } : {}}
          >
            <i className={`fa-solid ${
              t === ActivityType.PROJECT ? 'fa-folder-open' :
              t === ActivityType.CLASS ? 'fa-graduation-cap' :
              t === ActivityType.EXTRACURRICULAR ? 'fa-star' : 'fa-people-group'
            } text-lg`}></i>
            {t}
          </button>
          );
        })}
      </div>

      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
        {renderGuide()}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">활동 제목</label>
            <input 
              type="text" 
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 outline-none transition-all"
              style={{ 
                '--tw-ring-color': getTypeColor()
              } as React.CSSProperties & { '--tw-ring-color': string }}
              onFocus={(e) => {
                e.target.style.boxShadow = `0 0 0 2px ${getTypeColor()}`;
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = '';
              }}
              placeholder="예: 캡스톤 디자인 AI 챗봇 개발"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">성장 로그 (기록)</label>
            <textarea 
              rows={6}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 outline-none resize-none transition-all"
              style={{ 
                '--tw-ring-color': getTypeColor()
              } as React.CSSProperties & { '--tw-ring-color': string }}
              onFocus={(e) => {
                e.target.style.boxShadow = `0 0 0 2px ${getTypeColor()}`;
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = '';
              }}
              placeholder="가이드라인을 참고하여 구체적으로 작성해 보세요."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <button 
            onClick={() => onSave({ type, title, content })}
            className="w-full bg-[#114982] text-white py-4 rounded-xl font-bold hover:bg-[#0a2e55] transition-all shadow-lg flex items-center justify-center gap-2"
          >
            기록 저장하고 스탯 올리기 (+15 EXP)
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecordEditor;
