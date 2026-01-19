
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import RecordEditor from './components/RecordEditor';
import AITools from './components/AITools';
import { UserProfile, ActivityType } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<UserProfile>({
    name: '배혜진',
    major: '컴퓨터공학',
    level: 7,
    exp: 420,
    maxExp: 1000,
    characterTitle: '코드 숲의 탐험가'
  });

  const [interestFilter, setInterestFilter] = useState('전체');

  const mockSeniors = [
    { name: '김민수', major: '컴퓨터공학', level: 82, job: '네이버 웹개발자', tags: ['AI', 'Frontend'], type: 'senior' },
    { name: '정재희', major: '디자인', level: 45, job: '카카오 디자이너', tags: ['Design', 'UX'], type: 'friend' },
    { name: '한유진', major: '경영학과', level: 12, job: '취준생', tags: ['PM', 'Marketing'], type: 'friend' },
    { name: '지문호', major: '컴퓨터공학', level: 99, job: '구글 엔지니어', tags: ['Backend', 'AI'], type: 'senior' },
    { name: '박준혁', major: '전자공학', level: 68, job: '삼성전자', tags: ['Embedded', 'Hardware'], type: 'senior' },
    { name: '이서연', major: '컴퓨터공학', level: 25, job: '스타트업 인턴', tags: ['Frontend', 'App'], type: 'friend' },
  ];

  const myRecords = [
    { title: '웹개발 캡스톤 프로젝트', type: ActivityType.PROJECT, date: '2024.11.20', desc: 'React와 Node.js를 이용한 협업 플랫폼' },
    { title: '데이터베이스 시스템 기말', type: ActivityType.CLASS, date: '2024.11.10', desc: 'SQL 최적화 및 인덱싱 실습' },
    { title: 'SW 마에스트로 15기 준비', type: ActivityType.EXTRACURRICULAR, date: '2024.11.15', desc: '코딩 테스트 대비 및 기획서 작성' },
    { title: '교내 해커톤: 스마트 캠퍼스', type: ActivityType.PROJECT, date: '2024.09.12', desc: '캠퍼스 내 길찾기 AR 서비스' },
    { title: '운영체제 설계 원리', type: ActivityType.CLASS, date: '2024.10.05', desc: 'Process Scheduling 시뮬레이션' },
    { title: '팀워크 갈등 해결 기록', type: ActivityType.TEAMWORK, date: '2024.10.15', desc: '의사소통 부재 해결 프로세스' },
  ];

  const filteredSeniors = mockSeniors.filter(s => 
    interestFilter === '전체' || s.tags.includes(interestFilter)
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'records':
        return (
          <div className="animate-fadeIn space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
              <div className="lg:col-span-3">
                <RecordEditor onSave={(data) => {
                  setUser(prev => ({ ...prev, exp: prev.exp + 15 }));
                  alert('기록 완료! +15 EXP');
                }} />
              </div>
              <div className="lg:col-span-2 bg-white rounded-3xl border p-8 shadow-sm">
                <h4 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                   <i className="fa-solid fa-list-check text-indigo-600"></i>
                   카테고리별 모아보기
                </h4>
                <div className="space-y-6">
                  {Object.values(ActivityType).map((cat) => (
                    <div key={cat} className="space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-sm font-bold text-slate-500 uppercase">{cat}</span>
                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-400">
                          {myRecords.filter(r => r.type === cat).length}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {myRecords.filter(r => r.type === cat).map((r, i) => (
                          <div key={i} className="p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 transition-colors cursor-pointer group">
                            <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-600">{r.title}</p>
                            <p className="text-[11px] text-slate-400">{r.date}</p>
                          </div>
                        ))}
                        {myRecords.filter(r => r.type === cat).length === 0 && (
                          <p className="text-xs text-slate-300 italic">기록된 활동이 없습니다.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'ai-tools':
        return <AITools />;
      case 'community':
        return (
          <div className="animate-fadeIn space-y-10">
            {/* Interests Filter */}
            <div className="bg-white rounded-3xl border p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-800 mb-6">관심분야별 선배 탐색</h3>
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
                <i className="fa-solid fa-user-group text-green-500"></i>
                <h3 className="text-2xl font-bold text-slate-800">함께 성장하는 동료 (친구)</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredSeniors.filter(s => s.type === 'friend').map((friend, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border p-6 hover:shadow-lg transition-all border-green-100 group">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center border border-green-100">
                        <i className="fa-solid fa-user text-green-400"></i>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{friend.name}</p>
                        <p className="text-[11px] text-slate-400">{friend.major}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 mb-4">
                      {friend.tags.slice(0, 2).map(t => <span key={t} className="text-[10px] bg-slate-50 px-2 py-0.5 rounded border border-slate-100">#{t}</span>)}
                    </div>
                    <button className="w-full py-2 bg-green-50 text-green-600 rounded-lg text-xs font-bold group-hover:bg-green-600 group-hover:text-white transition-all">활동 보러가기</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Seniors Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-1">
                <i className="fa-solid fa-award text-indigo-500"></i>
                <h3 className="text-2xl font-bold text-slate-800">앞서가는 커리어 선배</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredSeniors.filter(s => s.type === 'senior').map((senior, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border p-6 hover:shadow-lg transition-all border-indigo-100 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-bl-xl shadow-md">SENIOR</div>
                    <div className="mb-4">
                      <p className="text-xs font-bold text-indigo-500 mb-1">{senior.job}</p>
                      <p className="font-bold text-lg text-slate-800">{senior.name} 선배</p>
                      <p className="text-xs text-slate-400">{senior.major}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-6">
                      {senior.tags.map(t => <span key={t} className="text-[10px] bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded border border-indigo-100 font-bold">#{t}</span>)}
                    </div>
                    <button className="w-full py-3 bg-[#114982] text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 hover:scale-[1.02] transition-transform">포트폴리오 엿보기</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'mypage':
        return (
          <div className="max-w-5xl mx-auto animate-fadeIn space-y-8">
            {/* Base Profile Section */}
            <div className="bg-white rounded-3xl border p-10 shadow-sm flex flex-col md:flex-row items-center gap-10">
              <div className="relative group">
                <div className="w-40 h-40 bg-slate-100 rounded-full flex items-center justify-center border-4 border-white shadow-xl overflow-hidden transition-transform group-hover:scale-105">
                  <i className="fa-solid fa-user text-6xl text-slate-300"></i>
                </div>
                <button className="absolute bottom-2 right-2 bg-[#114982] text-white w-10 h-10 rounded-full border-4 border-white shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-colors">
                  <i className="fa-solid fa-camera text-sm"></i>
                </button>
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <h3 className="text-4xl font-bold text-slate-800">{user.name}</h3>
                  <div className="flex justify-center md:justify-start gap-2">
                    <span className="bg-[#114982] text-white px-4 py-1 rounded-full text-xs font-bold">Lv.{user.level}</span>
                    <span className="bg-indigo-50 text-indigo-600 px-4 py-1 rounded-full text-xs font-bold border border-indigo-100">{user.characterTitle}</span>
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
                 <span className="text-[10px] text-indigo-400 mt-2">상위 4.2%</span>
              </div>
            </div>

            {/* Detailed Self-Introduction Sections (자소서 베이스) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 성장과정 및 가치관 */}
              <div className="bg-white rounded-3xl border p-8 shadow-sm hover:border-[#114982] transition-colors group">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                    <span className="w-10 h-10 bg-blue-50 text-[#114982] rounded-xl flex items-center justify-center"><i className="fa-solid fa-seedling"></i></span>
                    성장과정 및 가치관
                  </h4>
                  <button className="text-slate-300 hover:text-[#114982] transition-colors"><i className="fa-solid fa-pen-to-square"></i></button>
                </div>
                <div className="space-y-4">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-black text-indigo-400 mb-2 uppercase tracking-widest">핵심 키워드</p>
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
                    <span className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center"><i className="fa-solid fa-paper-plane"></i></span>
                    지원동기 및 직무 포부
                  </h4>
                  <button className="text-slate-300 hover:text-[#114982] transition-colors"><i className="fa-solid fa-pen-to-square"></i></button>
                </div>
                <div className="space-y-4">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-black text-orange-400 mb-2 uppercase tracking-widest">희망 직무</p>
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
                    <span className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><i className="fa-solid fa-bolt"></i></span>
                    성격의 장단점
                  </h4>
                  <button className="text-slate-300 hover:text-[#114982] transition-colors"><i className="fa-solid fa-pen-to-square"></i></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full mb-2 inline-block">STRENGTH</span>
                    <p className="text-sm text-slate-600 leading-relaxed">팀 내 분위기를 주도하는 긍정적인 커뮤니케이션 능력과 빠른 습득력</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-red-400 bg-red-50 px-2 py-0.5 rounded-full mb-2 inline-block">WEAKNESS</span>
                    <p className="text-sm text-slate-600 leading-relaxed">세부 사항에 집착하여 속도가 늦어지는 경향 → 업무 우선순위 체크리스트 활용으로 극복 중</p>
                  </div>
                </div>
              </div>

              {/* 협업 및 갈등해결 역량 */}
              <div className="bg-white rounded-3xl border p-8 shadow-sm hover:border-[#114982] transition-colors group">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                    <span className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center"><i className="fa-solid fa-handshake"></i></span>
                    협업 및 갈등해결
                  </h4>
                  <button className="text-slate-300 hover:text-[#114982] transition-colors"><i className="fa-solid fa-pen-to-square"></i></button>
                </div>
                <div className="space-y-4">
                  <p className="text-sm font-bold text-slate-700">"경청은 갈등 해결의 첫걸음입니다."</p>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    지난 캡스톤 디자인 당시, 데이터베이스 구조를 두고 백엔드 팀과 발생한 이견을 중재하기 위해 각 방안의 비용/효율 분석 보고서를 작성하여 설득한 경험이 있습니다.
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-600">
                    <i className="fa-solid fa-link"></i>
                    <span>연결된 활동 기록: 캡스톤 디자인 프로젝트 (2024.11)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Resume Export Section */}
            <div className="bg-[#114982] rounded-3xl p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                 <h4 className="text-2xl font-bold mb-2">이 정보를 바탕으로 자소서를 만드시겠습니까?</h4>
                 <p className="text-indigo-100 opacity-80">작성된 모든 데이터는 AI 취업 도구에서 초안 생성 시 활용됩니다.</p>
               </div>
               <button 
                 onClick={() => setActiveTab('ai-tools')}
                 className="relative z-10 bg-white text-[#114982] px-8 py-4 rounded-2xl font-black text-lg hover:scale-105 transition-transform shadow-lg shadow-black/20"
               >
                 AI 자소서 생성하러 가기
               </button>
               <i className="fa-solid fa-wand-sparkles absolute -right-10 -bottom-10 text-[200px] text-white/5 -rotate-12"></i>
            </div>
          </div>
        );
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
