
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, ActivityType, ActivityRecord, ActivityTypeLabel } from '../types';

interface DashboardProps {
  user: UserProfile;
  records: ActivityRecord[];
  loading?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ user, records, loading = false }) => {
  const normalizedRecords = useMemo(() => {
    return records.map((r) => {
      const year = r.year || (r.date ? new Date(r.date).getFullYear().toString() : undefined);
      return { ...r, year };
    });
  }, [records]);

  const availableYears = useMemo(() => {
    const years = Array.from(new Set(normalizedRecords.map((r) => r.year).filter(Boolean))) as string[];
    if (years.length === 0) return [new Date().getFullYear().toString()];
    return years.sort();
  }, [normalizedRecords]);

  const [selectedYear, setSelectedYear] = useState<string>(availableYears[availableYears.length - 1]);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [animatedRank, setAnimatedRank] = useState(100);
  const [isGraduationCapVisible, setIsGraduationCapVisible] = useState(false);
  
  const levelProgress = Math.min(Math.round((user.exp / user.maxExp) * 100), 100);
  const targetRank = 5;

  useEffect(() => {
    // 경험치 바 애니메이션 (1초 동안)
    const progressDuration = 1000;
    const progressStartTime = Date.now();
    
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - progressStartTime;
      const progress = Math.min((elapsed / progressDuration) * levelProgress, levelProgress);
      setAnimatedProgress(progress);
      
      if (progress >= levelProgress) {
        clearInterval(progressInterval);
      }
    }, 16); // ~60fps

    // Top-k 퍼센트 애니메이션 (1초 동안)
    const rankDuration = 1000;
    const rankStartTime = Date.now();
    
    const rankInterval = setInterval(() => {
      const elapsed = Date.now() - rankStartTime;
      const progress = Math.min(elapsed / rankDuration, 1);
      const currentRank = Math.round(100 - (100 - targetRank) * progress);
      setAnimatedRank(currentRank);
      
      if (progress >= 1) {
        clearInterval(rankInterval);
      }
    }, 16);

    // 학사모 애니메이션 (0.6초 후 시작)
    setTimeout(() => {
      setIsGraduationCapVisible(true);
    }, 600);

    return () => {
      clearInterval(progressInterval);
      clearInterval(rankInterval);
    };
  }, [levelProgress, targetRank]);

  useEffect(() => {
    setSelectedYear(availableYears[availableYears.length - 1]);
  }, [availableYears]);

  const filteredRecords = normalizedRecords.filter((r) => r.year === selectedYear);

  const formatDate = (date?: string) => {
    if (!date) return '-';
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toISOString().slice(0, 10).replace(/-/g, '.');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Gamification Card */}
      <section className="gradient-bg rounded-[40px] p-8 md:p-12 text-white shadow-2xl flex flex-col md:flex-row justify-between items-center gap-10 relative overflow-hidden">
        <div className="relative z-10 flex-1 w-full">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-md">
              {user.characterTitle}
            </span>
            <span className="bg-yellow-400 text-[#114982] px-3 py-1 rounded-lg font-black text-sm shadow-lg">Lv.{user.level}</span>
          </div>
          <h3 className="text-4xl md:text-5xl font-black mb-16 tracking-tight">{user.name}님의 성장 궤적</h3>
          
          <div className="relative pt-4">
            {/* Experience Speech Bubble (말풍선) */}
            <div 
              className="absolute mb-1 transition-all duration-1000 ease-out"
              style={{ left: `${animatedProgress}%`, transform: 'translateX(-50%)', bottom: '100%' }}
            >
              <div className="bg-white text-[#114982] px-4 py-2 rounded-2xl shadow-xl flex flex-col items-center relative group">
                <span className="text-xl font-black leading-none">{Math.round(animatedProgress)}%</span>
                <span className="text-[10px] font-bold opacity-70 whitespace-nowrap">{Math.round((animatedProgress / 100) * user.maxExp)} / {user.maxExp} EXP</span>
                {/* Speech Bubble Arrow */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white"></div>
              </div>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full bg-black/20 rounded-full h-6 p-1.5 border border-white/10 shadow-inner overflow-hidden">
              <div 
                className="bg-white rounded-full h-full relative shadow-[0_0_20px_rgba(255,255,255,0.6)] transition-all duration-1000 ease-out" 
                style={{ width: `${animatedProgress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full"></div>
              </div>
            </div>
            
            <div className="flex justify-between mt-4 px-1">
              <p className="text-indigo-100 text-sm font-bold">
                다음 레벨까지 <span className="text-white text-lg underline decoration-yellow-400 decoration-4 underline-offset-4">{user.maxExp - user.exp} EXP</span> 남았어요!
              </p>
            </div>
          </div>
        </div>

        {/* Top 5% Ranker Badge */}
        <div className="relative z-10 w-44 h-44 bg-white/10 rounded-[40px] flex flex-col items-center justify-center border border-white/20 backdrop-blur-xl shadow-2xl">
          <i className="fa-solid fa-crown text-6xl mb-3 text-yellow-300 drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)]"></i>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Current Rank</span>
          <span className="text-2xl font-black">Top {animatedRank}%</span>
        </div>
        
        <i 
          className={`fa-solid fa-graduation-cap absolute -bottom-16 -left-16 text-[280px] text-white/5 -rotate-12 pointer-events-none transition-all duration-700 ease-out ${
            isGraduationCapVisible 
              ? 'translate-x-0 translate-y-0 opacity-100' 
              : 'translate-x-[-100px] translate-y-[100px] opacity-0'
          }`}
        ></i>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Stats and Summary */}
        <div className="lg:col-span-1 space-y-6">
          <h4 className="text-xl font-black text-slate-800 tracking-tight px-1 flex items-center gap-3 pt-2">
            <span className="w-8 h-8 bg-[#114982] text-white rounded-lg flex items-center justify-center text-xs shadow-md"><i className="fa-solid fa-chart-simple"></i></span>
            누적 스탯 요약
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {[
              { label: '기록된 프로젝트', value: '12개', icon: 'fa-folder-open', color: 'bg-blue-500' },
              { label: '전공 역량 지수', value: '92.4%', icon: 'fa-brain', color: 'bg-[#FF7F7F]' },
              { label: '협업 시너지', value: 'Lv.4', icon: 'fa-handshake', color: 'bg-green-500' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-[#114982] hover:shadow-md transition-all flex items-center gap-4 group cursor-default relative overflow-hidden">
                {/* Background Icon */}
                <div className="absolute top-1/2 -translate-y-1/2 -right-4 opacity-5 pointer-events-none">
                  <i className={`fa-solid ${stat.icon} text-8xl`}></i>
                </div>
                <div className={`w-12 h-12 rounded-2xl ${stat.color} text-white flex items-center justify-center text-xl shadow-lg transition-transform group-hover:scale-110 relative z-10`}>
                    <i className={`fa-solid ${stat.icon}`}></i>
                </div>
                <div className="relative z-10">
                    <div className="text-xl font-black text-slate-800 tracking-tight">{stat.value}</div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <i className="fa-solid fa-wand-magic-sparkles text-6xl"></i>
            </div>
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></div>
              <h4 className="font-black text-slate-800 text-sm tracking-tight uppercase">AI 성장 코멘트</h4>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed relative z-10">
              {selectedYear}년도에는 <strong>실무 프로젝트</strong> 비중이 매우 높았습니다. 특히 React 숙련도가 작년 대비 <span className="text-indigo-600 font-black">24% 상승</span>하며 프론트엔드 역량이 집중적으로 성장했네요!
            </p>
          </div>
        </div>

        {/* Right Column: Yearly History */}
        <div className="lg:col-span-3 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 px-1">
            <h4 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <span className="w-8 h-8 bg-[#114982] text-white rounded-lg flex items-center justify-center text-xs shadow-sm"><i className="fa-solid fa-timeline"></i></span>
              활동 타임라인
            </h4>
            <div className="relative flex bg-slate-200/50 p-1.5 rounded-2xl border border-slate-100">
                {/* Toggle Slider */}
                <div 
                    className="absolute bg-[#114982] rounded-xl shadow-lg transition-all duration-300 ease-out"
                    style={{
                  width: `calc((100% - 6px) / ${availableYears.length})`,
                  height: 'calc(100% - 12px)',
                  left: `calc(3px + ${availableYears.indexOf(selectedYear)} * (100% - 6px) / ${availableYears.length})`,
                        top: '6px'
                    }}
                />
              {availableYears.map(y => (
                    <button 
                        key={y}
                        onClick={() => setSelectedYear(y)}
                        className={`relative z-10 flex-1 px-5 py-2 rounded-xl text-xs font-black transition-all text-center ${
                            selectedYear === y ? 'text-white' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {y}
                    </button>
                ))}
            </div>
          </div>

          <div className="bg-white rounded-none border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Activity Name</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Category</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredRecords.length > 0 ? (
                        filteredRecords.map((rec, i) => (
                        <tr key={i} className="hover:bg-slate-50/80 transition-all group cursor-pointer">
                            <td className="px-8 py-6">
                                <p className="font-bold text-slate-800 group-hover:text-[#114982] transition-colors">{rec.title}</p>
                            </td>
                            <td className="px-6 py-6">
                            <span className={`text-[10px] px-3 py-1.5 rounded-xl font-black tracking-wider uppercase border ${
                                rec.type === ActivityType.PROJECT ? 'bg-blue-50 border-blue-100 text-blue-600' :
                                rec.type === ActivityType.EXTRACURRICULAR ? 'bg-[#8B7355]/10 border-[#8B7355]/30 text-[#8B7355]' :
                                rec.type === ActivityType.CLASS ? 'bg-[#FF7F7F]/10 border-[#FF7F7F]/30 text-[#FF7F7F]' : 'bg-green-50 border-green-100 text-green-600'
                            }`}>
                              {ActivityTypeLabel[rec.type]}
                            </span>
                            </td>
                            <td className="px-6 py-6 text-sm text-slate-400 font-bold">{formatDate(rec.date)}</td>
                            <td className="px-8 py-6 text-right">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-black ${(rec.status || '진행중') === '완료' ? 'text-green-500' : 'text-amber-500'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${(rec.status || '진행중') === '완료' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                              {rec.status || '진행중'}
                            </span>
                            </td>
                        </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} className="px-8 py-24 text-center">
                                <i className="fa-solid fa-box-open text-4xl text-slate-100 mb-4 block"></i>
                                <span className="text-slate-400 font-bold">해당 연도에는 아직 기록된 활동이 없습니다.</span>
                            </td>
                        </tr>
                    )}
                </tbody>
                </table>
            </div>
          </div>

          {/* Bottom Summary Grid */}
          {filteredRecords.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-white border border-slate-200 p-6 rounded-[24px] shadow-sm flex flex-col justify-between">
                      <p className="text-[10px] font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">{selectedYear} Core Tech Stack</p>
                      <div className="flex flex-wrap gap-2">
                          {['React', 'TypeScript', 'Tailwind', 'Gemini AI'].map(tag => (
                              <span key={tag} className="text-[11px] bg-slate-50 border border-slate-100 text-[#114982] px-3 py-1.5 rounded-xl font-black">#{tag}</span>
                          ))}
                      </div>
                  </div>
                  <div className="bg-[#114982] p-6 rounded-[24px] shadow-xl flex items-center justify-between text-white group overflow-hidden relative">
                      <i className="fa-solid fa-bolt absolute -right-4 -bottom-4 text-8xl text-white/5 -rotate-12 transition-transform group-hover:scale-125"></i>
                      <div className="relative z-10">
                          <p className="text-[10px] font-black text-white/50 mb-1 uppercase tracking-[0.2em]">Total Earned Exp</p>
                          <p className="text-3xl font-black">+{filteredRecords.length * 50} <span className="text-sm opacity-60 ml-1">EXP</span></p>
                      </div>
                  </div>
              </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
