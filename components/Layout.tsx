
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  // Navigation menu without 'dashboard' (accessed via logo) and 'mypage' (accessed via profile icon)
  const menuItems = [
    { id: 'records', icon: 'fa-pen-to-square', label: '활동 기록' },
    { id: 'community', icon: 'fa-users', label: '선배/동료' },
    { id: 'ai-tools', icon: 'fa-robot', label: 'AI 취업 도구' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation Bar - Full Width with edge-to-edge content */}
      <header className="sticky top-0 z-[100] bg-slate-50 w-full border-b-2 border-[#114982] backdrop-blur-sm">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between relative">
          <div className="flex items-center gap-6 lg:gap-12 h-full flex-shrink-0">
            <div className="flex items-center justify-center cursor-pointer shrink-0 relative z-[60] h-full" onClick={() => setActiveTab('dashboard')}>
              <img 
                src="/Hybird/HyBird_CI_HYblue.png" 
                alt="HyBird" 
                className="h-14 w-auto object-contain max-w-full" 
                style={{ filter: 'none', opacity: 1, imageRendering: 'auto' }}
              />
            </div>
          </div>
            
          <nav className="hidden md:flex items-center justify-center gap-8 lg:gap-12 absolute left-1/2 -translate-x-1/2 h-full">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-4 lg:px-6 py-2.5 rounded-xl text-lg font-bold transition-all flex items-center justify-center whitespace-nowrap text-[#114982] ${
                  activeTab === item.id 
                    ? 'bg-[#114982]/10 shadow-md' 
                    : 'hover:bg-[#114982]/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3 lg:gap-6 shrink-0 h-full">
            <button className="p-2.5 hover:bg-[#114982]/10 rounded-full transition-colors relative text-[#114982] flex items-center justify-center">
              <i className="fa-solid fa-bell text-xl"></i>
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            {/* My Page Access via Profile Icon */}
            <div 
              className={`flex items-center gap-3 pl-3 lg:pl-6 cursor-pointer hover:bg-[#114982]/5 transition-all py-2 px-2 rounded-lg ${activeTab === 'mypage' ? 'bg-[#114982]/10' : ''}`}
              onClick={() => setActiveTab('mypage')}
              title="마이페이지"
            >
              <div className="text-right hidden sm:block flex flex-col justify-center">
                <span className="text-base font-black block text-[#114982]">배혜진 님</span>
                <span className="text-xs text-[#114982]/60 block leading-none">컴퓨터공학 전공</span>
              </div>
              <div className={`w-10 h-10 lg:w-11 lg:h-11 rounded-full border-2 flex items-center justify-center overflow-hidden transition-all ${
                activeTab === 'mypage' ? 'bg-[#114982] border-[#114982] shadow-inner' : 'bg-[#114982]/20 border-[#114982]/30'
              }`}>
                 <i className={`fa-solid fa-user ${activeTab === 'mypage' ? 'text-white' : 'text-[#114982]'}`}></i>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="w-full max-w-[1440px] mx-auto p-4 sm:p-8 md:p-10 mb-20 md:mb-0">
          {children}
        </div>
      </main>

      {/* Mobile Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex md:hidden justify-around p-3 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {[...menuItems, { id: 'mypage', icon: 'fa-user', label: '마이' }].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 min-w-[60px] ${
              activeTab === item.id ? 'text-[#114982]' : 'text-slate-400'
            }`}
          >
            <i className={`fa-solid ${item.icon} text-lg`}></i>
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
