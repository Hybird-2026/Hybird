
import React, { useEffect, useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import RecordEditor from './components/RecordEditor';
import AITools from './components/AITools';
import { ActivityRecord, ActivityType, ActivityTypeLabel, CommunityMember, UserProfile } from './types';
import { createRecord, fetchCommunityMembers, fetchRecords, fetchUserProfile } from './services/api';

const DEFAULT_USER_ID = 1;

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [aiToolsSubTab, setAiToolsSubTab] = useState<'resume' | 'interview'>('resume');
  const [showAiToolsSubHeader, setShowAiToolsSubHeader] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [records, setRecords] = useState<ActivityRecord[]>([]);
  const [community, setCommunity] = useState<CommunityMember[]>([]);
  const [interestFilter, setInterestFilter] = useState('전체');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [userData, recordData, communityData] = await Promise.all([
        fetchUserProfile(DEFAULT_USER_ID),
        fetchRecords({ userId: DEFAULT_USER_ID }),
        fetchCommunityMembers({ limit: 50 })
      ]);
      setUser(userData);
      setRecords(recordData);
      setCommunity(communityData);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('데이터를 불러오는데 실패했습니다. 서버가 실행 중인지 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const refreshUser = async () => {
    const userData = await fetchUserProfile(DEFAULT_USER_ID);
    setUser(userData);
  };

  const refreshRecords = async () => {
    const recordData = await fetchRecords({ userId: DEFAULT_USER_ID });
    setRecords(recordData);
  };

  const handleCreateRecord = async ({ type, title, content }: { type: ActivityType; title: string; content: string; }) => {
    const today = new Date().toISOString().split('T')[0];
    await createRecord({
      userId: DEFAULT_USER_ID,
      type,
      title,
      content,
      date: today,
      description: content ? content.slice(0, 140) : undefined,
      status: '완료'
    });
    await Promise.all([refreshRecords(), refreshUser()]);
    alert('기록 완료! +15 EXP');
  };

  const filteredSeniors = community.filter(s => 
    interestFilter === '전체' || (s.tags || []).includes(interestFilter)
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20 text-slate-500 font-bold">
          데이터를 불러오는 중입니다...
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-red-600 font-bold gap-2">
          <span>{error}</span>
          <button className="text-sm underline" onClick={loadInitialData}>다시 시도</button>
        </div>
      );
    }

    if (!user) {
      return (
        <div className="flex items-center justify-center py-20 text-slate-500 font-bold">
          사용자 정보를 불러올 수 없습니다.
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={user} records={records} loading={loading} />;
      case 'records':
        return (
          <div className="animate-fadeIn space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
              <div className="lg:col-span-3">
                <RecordEditor onSave={handleCreateRecord} />
              </div>
              <div className="lg:col-span-2 bg-white rounded-3xl border p-8 shadow-sm">
                <h4 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                   <span className="w-8 h-8 bg-[#114982] text-white rounded-lg flex items-center justify-center text-xs shadow-sm">
                     <i className="fa-solid fa-list-check"></i>
                   </span>
                   카테고리별 모아보기
                </h4>
                <div className="space-y-6">
                  {Object.values(ActivityType).map((cat) => {
                    const getCategoryColor = () => {
                      switch(cat) {
                        case ActivityType.PROJECT: return '#4285F4';
                        case ActivityType.CLASS: return '#E28779';
                        case ActivityType.EXTRACURRICULAR: return '#837655';
                        case ActivityType.TEAMWORK: return '#92B23E';
                        default: return '#114982';
                      }
                    };
                    const categoryColor = getCategoryColor();
                    const isExpanded = expandedCategories[cat] || false;
                    const recordCount = records.filter(r => r.type === cat).length;
                    
                    return (
                    <div key={cat} className="space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2">
                          {ActivityTypeLabel[cat]}
                          <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-400">
                            {recordCount}
                          </span>
                        </span>
                        <button
                          onClick={() => {
                            setExpandedCategories(prev => ({
                              ...prev,
                              [cat]: !prev[cat]
                            }));
                          }}
                          className="text-black hover:text-slate-600 transition-colors"
                        >
                          <i className={`fa-solid fa-plus text-sm transition-transform ${isExpanded ? 'rotate-45' : ''}`}></i>
                        </button>
                      </div>
                      {isExpanded && (
                        <div 
                          className="space-y-2 overflow-hidden"
                          style={{
                            animation: 'slideDown 0.3s ease-out'
                          }}
                        >
                          {records.filter(r => r.type === cat).map((r) => (
                            <div 
                              key={r.id}
                              className="p-3 rounded-xl transition-colors cursor-pointer group"
                              style={{
                                backgroundColor: `${categoryColor}10`,
                                border: `1px solid ${categoryColor}30`
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = `${categoryColor}20`;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = `${categoryColor}10`;
                              }}
                            >
                              <p className="text-sm font-bold text-slate-700 group-hover:text-slate-900" style={{ color: categoryColor }}>{r.title}</p>
                              <p className="text-[11px] text-slate-400">{r.date ? r.date.split('T')[0] : '-'}</p>
                            </div>
                          ))}
                          {recordCount === 0 && (
                            <p className="text-xs text-slate-300 italic">기록된 활동이 없습니다.</p>
                          )}
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      case 'ai-tools':
        return <AITools userId={user.id} activeSubTab={aiToolsSubTab} setActiveSubTab={setAiToolsSubTab} />;
      case 'community':
        return (
          <div className="animate-fadeIn space-y-10">
            {/* Interests Filter */}
            <div className="bg-white rounded-none border p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-800 mb-6">관심분야별 동료/선배 탐색</h3>
              <div className="flex flex-wrap gap-2">
                {['전체', 'AI', 'Frontend', 'Backend', 'Design', 'Marketing', 'PM'].map(interest => (
                  <button 
                    key={interest}
                    onClick={() => setInterestFilter(interest)}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                      interestFilter === interest 
                        ? 'bg-[#114982] text-white shadow-md' 
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {/* Friends Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-1">
                <span className="w-8 h-8 bg-[#114982] text-white rounded-lg flex items-center justify-center text-xs shadow-sm">
                  <i className="fa-solid fa-user-group"></i>
                </span>
                <h3 className="text-2xl font-bold text-slate-800">함께 성장하는 동료 (친구)</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredSeniors.filter(s => s.type === 'friend').map((friend, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border p-6 hover:shadow-lg hover:-translate-y-2 transition-all border-[#FF7F66]/20 group">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-[#FF7F66]/10 flex items-center justify-center border border-[#FF7F66]/20">
                        <i className="fa-solid fa-user text-[#FF7F66]"></i>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{friend.name}</p>
                        <p className="text-[11px] text-slate-400">{friend.major}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 mb-4">
                      {(friend.tags || []).slice(0, 2).map(t => <span key={t} className="text-[10px] bg-slate-50 px-2 py-0.5 rounded border border-slate-100">#{t}</span>)}
                    </div>
                    <button className="w-full py-2 bg-[#FF7F66]/10 text-[#FF7F66] rounded-lg text-xs font-bold group-hover:bg-[#FF7F66] group-hover:text-white transition-all">활동 보러가기</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Seniors Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-1">
                <span className="w-8 h-8 bg-[#114982] text-white rounded-lg flex items-center justify-center text-xs shadow-sm">
                  <i className="fa-solid fa-award"></i>
                </span>
                <h3 className="text-2xl font-bold text-slate-800">앞서가는 커리어 선배</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredSeniors.filter(s => s.type === 'senior').map((senior, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border p-6 hover:shadow-lg hover:-translate-y-2 transition-all border-[#2563EB]/20 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 px-3 py-1 bg-[#2563EB] text-white text-[10px] font-bold rounded-bl-xl shadow-md">SENIOR</div>
                    <div className="mb-4">
                      <p className="text-xs font-bold text-[#2563EB] mb-1">{senior.job}</p>
                      <p className="font-bold text-lg text-slate-800">{senior.name} 선배</p>
                      <p className="text-xs text-slate-400">{senior.major}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-6">
                      {(senior.tags || []).map(t => <span key={t} className="text-[10px] bg-[#2563EB]/10 text-[#2563EB] px-2 py-0.5 rounded border border-[#2563EB]/20 font-bold">#{t}</span>)}
                    </div>
                    <button className="w-full py-3 bg-[#2563EB]/20 text-[#2563EB] rounded-xl text-xs font-bold hover:bg-[#2563EB] hover:text-white hover:scale-[1.02] transition-all shadow-lg shadow-[#2563EB]/10 hover:shadow-[#2563EB]/20">포트폴리오 엿보기</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'mypage':
        return (
          <div className="max-w-[1440px] mx-auto animate-fadeIn space-y-4">
            {/* Base Profile Section */}
            <div className="bg-white rounded-none border p-10 shadow-sm flex flex-col md:flex-row items-center gap-10">
              <div className="relative group">
                <div className="w-40 h-40 bg-slate-100 rounded-full flex items-center justify-center border-4 border-white shadow-xl overflow-hidden transition-transform group-hover:scale-105">
                  <i className="fa-solid fa-user text-6xl text-slate-300"></i>
                </div>
                <button className="absolute bottom-2 right-2 bg-[#114982] text-white w-10 h-10 rounded-full border-4 border-white shadow-lg flex items-center justify-center hover:bg-[#0d3a66] transition-colors">
                  <i className="fa-solid fa-camera text-sm"></i>
                </button>
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <h3 className="text-4xl font-bold text-slate-800">{user.name}</h3>
                  <div className="flex justify-center md:justify-start gap-2">
                    <span className="bg-[#114982] text-white px-4 py-1 rounded-full text-xs font-bold">Lv.{user.level}</span>
                    <span className="bg-[#114982]/10 text-[#114982] px-4 py-1 rounded-full text-xs font-bold border border-[#114982]/20">{user.characterTitle}</span>
                  </div>
                </div>
                <p className="text-slate-500 font-bold text-lg mb-4">{user.major} | 20학번 (4학년)</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  {['Frontend', 'AI융합', '기획역량', '성실한'].map(tag => (
                    <span key={tag} className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-xs font-bold">#{tag}</span>
                  ))}
                </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border flex flex-col items-center justify-center min-w-[150px]">
                 <span className="text-xs font-bold text-slate-400 mb-1">누적 활동 점수</span>
                 <span className="text-3xl font-black text-[#114982]">3,420</span>
                 <span className="text-[10px] text-[#114982]/60 mt-2">상위 4.2%</span>
              </div>
            </div>

            {/* Detailed Self-Introduction Sections (자소서 베이스) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-1 mb-8">
              {/* 성장과정 및 가치관 */}
              <div className="bg-white rounded-3xl border p-8 shadow-sm hover:border-[#114982] transition-colors group">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                    <span className="w-10 h-10 bg-[#114982] text-white rounded-xl flex items-center justify-center"><i className="fa-solid fa-seedling"></i></span>
                    성장과정 및 가치관
                  </h4>
                  <button className="text-slate-300 hover:text-[#114982] transition-colors"><i className="fa-solid fa-pen-to-square"></i></button>
                </div>
                <div className="space-y-4">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-black text-[#114982] mb-2 uppercase tracking-widest">핵심 키워드</p>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                      "어려운 문제는 더 큰 배움의 기회입니다. 저는 '끈기'와 '논리적 분석'을 통해 불가능을 가능으로 바꾸는 과정에서 희열을 느낍니다."
                    </p>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    중학교 시절 처음 프로그래밍을 접하며 느꼈던 몰입감을 바탕으로, 대학 생활 내내 단순 코딩을 넘어 사용자의 문제를 해결하는 솔루션을 고민해왔습니다.
                  </p>
                </div>
              </div>

              {/* 지원동기 및 직무 포부 */}
              <div className="bg-white rounded-3xl border p-8 shadow-sm hover:border-[#114982] transition-colors group">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                    <span className="w-10 h-10 bg-[#114982] text-white rounded-xl flex items-center justify-center"><i className="fa-solid fa-paper-plane"></i></span>
                    지원동기 및 직무 포부
                  </h4>
                  <button className="text-slate-300 hover:text-[#114982] transition-colors"><i className="fa-solid fa-pen-to-square"></i></button>
                </div>
                <div className="space-y-4">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-black text-[#114982] mb-2 uppercase tracking-widest">희망 직무</p>
                    <p className="text-sm font-bold text-slate-700">Service Planner & Frontend Engineer</p>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    단순한 개발자가 아닌, 비즈니스 가치를 이해하고 기술로 구현해내는 '하이브리드형 인재'를 지향합니다. 사용자의 작은 불편함도 놓치지 않는 세심한 기획력과 이를 견고하게 구현하는 기술력을 쌓고 있습니다.
                  </p>
                </div>
              </div>

              {/* 장점 및 성격의 특징 */}
              <div className="bg-white rounded-3xl border p-8 shadow-sm hover:border-[#114982] transition-colors group">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                    <span className="w-10 h-10 bg-[#114982] text-white rounded-xl flex items-center justify-center"><i className="fa-solid fa-bolt"></i></span>
                    성격의 장단점
                  </h4>
                  <button className="text-slate-300 hover:text-[#114982] transition-colors"><i className="fa-solid fa-pen-to-square"></i></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-[#114982] bg-[#114982]/10 px-2 py-0.5 rounded-full mb-2 inline-block">STRENGTH</span>
                    <p className="text-sm text-slate-600 leading-relaxed">팀 내 분위기를 주도하는 긍정적인 커뮤니케이션 능력과 빠른 습득력</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#114982] bg-[#114982]/10 px-2 py-0.5 rounded-full mb-2 inline-block">WEAKNESS</span>
                    <p className="text-sm text-slate-600 leading-relaxed">세부 사항에 집착하여 속도가 늦어지는 경향 → 업무 우선순위 체크리스트 활용으로 극복 중</p>
                  </div>
                </div>
              </div>

              {/* 협업 및 갈등해결 역량 */}
              <div className="bg-white rounded-3xl border p-8 shadow-sm hover:border-[#114982] transition-colors group">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                    <span className="w-10 h-10 bg-[#114982] text-white rounded-xl flex items-center justify-center"><i className="fa-solid fa-handshake"></i></span>
                    협업 및 갈등해결
                  </h4>
                  <button className="text-slate-300 hover:text-[#114982] transition-colors"><i className="fa-solid fa-pen-to-square"></i></button>
                </div>
                <div className="space-y-4">
                  <p className="text-sm font-bold text-slate-700">"경청은 갈등 해결의 첫걸음입니다."</p>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    지난 캡스톤 디자인 당시, 데이터베이스 구조를 두고 백엔드 팀과 발생한 이견을 중재하기 위해 각 방안의 비용/효율 분석 보고서를 작성하여 설득한 경험이 있습니다.
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#114982]">
                    <i className="fa-solid fa-link"></i>
                    <span>연결된 활동 기록: 캡스톤 디자인 프로젝트 (2024.11)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Resume Export Section */}
            <div className="max-w-4xl mx-auto bg-[#114982] rounded-3xl py-10 text-white shadow-xl px-4 sm:px-8 relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="relative z-10">
                 <h4 className="text-2xl font-bold mb-2">이 정보를 바탕으로 자기소개서를 만들어볼까요?</h4>
                 <p className="text-white/80">작성된 모든 데이터는 AI 취업 도구에서 초안 생성 시 활용됩니다.</p>
               </div>
               <button 
                 onClick={() => setActiveTab('ai-tools')}
                 className="relative z-10 bg-white text-[#114982] px-8 py-4 rounded-2xl font-black text-lg hover:scale-105 transition-transform shadow-lg shadow-black/20"
               >
                 AI 자소서 생성하러 가기
               </button>
              </div>
               <i className="fa-solid fa-wand-sparkles absolute -right-10 -bottom-10 text-[200px] text-white/5 -rotate-12"></i>
            </div>
          </div>
        );
      default:
        return <Dashboard user={user} records={records} loading={loading} />;
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <Layout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        aiToolsSubTab={aiToolsSubTab} 
        setAiToolsSubTab={(tab) => {
          setAiToolsSubTab(tab);
          setActiveTab('ai-tools');
          setShowAiToolsSubHeader(false);
        }}
        showAiToolsSubHeader={showAiToolsSubHeader}
        setShowAiToolsSubHeader={setShowAiToolsSubHeader}
      >
        {renderContent()}
      </Layout>
    </>
  );
};

export default App;
