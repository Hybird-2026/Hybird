
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  // Navigation menu without 'mypage' as it's accessed via profile icon
  const menuItems = [
    { id: 'dashboard', icon: 'fa-house', label: '대시보드' },
    { id: 'records', icon: 'fa-pen-to-square', label: '활동 기록' },
    { id: 'community', icon: 'fa-users', label: '선배/동료' },
    { id: 'ai-tools', icon: 'fa-robot', label: 'AI 취업 도구' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation Bar - Full Width with edge-to-edge content */}
      <header className="sticky top-0 z-50 bg-[#114982] text-white shadow-lg w-full">
        <div className="w-full px-4 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6 lg:gap-12 flex-1">
            <div className="flex items-center cursor-pointer shrink-0" onClick={() => setActiveTab('dashboard')}>
              <img 
                src="https://file.notion.so/f/f/d9cc6677-7685-4309-8472-747f52613d08/17997972-7d08-466d-9721-364e0571d79a/Untitled.png?table=block&id=1a1969a6-6819-807d-92d4-e6949b29e061&spaceId=d9cc6677-7685-4309-8472-747f52613d08&expirationTimestamp=1740052800000&signature=I96N7nFq5Wp-L9M3S7y6uX6q2u3J3f6y9G8_9h9j8k4" 
                alt="HyBird" 
                className="h-10 brightness-0 invert" 
              />
            </div>
            
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 lg:px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                    activeTab === item.id 
                      ? 'bg-white text-[#114982] shadow-md' 
                      : 'hover:bg-white/10 text-white/80 hover:text-white'
                  }`}
                >
                  <i className={`fa-solid ${item.icon}`}></i>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3 lg:gap-6 shrink-0">
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
              <i className="fa-solid fa-bell text-lg"></i>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#114982]"></span>
            </button>
            
            {/* My Page Access via Profile Icon */}
            <div 
              className={`flex items-center gap-3 pl-3 lg:pl-6 border-l border-white/20 cursor-pointer hover:bg-white/5 transition-all py-2 px-2 rounded-lg ${activeTab === 'mypage' ? 'bg-white/10' : ''}`}
              onClick={() => setActiveTab('mypage')}
              title="마이페이지"
            >
              <div className="text-right hidden sm:block">
                <span className="text-sm font-black block">배혜진 님</span>
                <span className="text-[10px] text-white/60 block leading-none">컴퓨터공학 전공</span>
              </div>
              <div className={`w-10 h-10 lg:w-11 lg:h-11 rounded-full border-2 flex items-center justify-center overflow-hidden transition-all ${
                activeTab === 'mypage' ? 'bg-white border-white shadow-inner' : 'bg-white/20 border-white/30'
              }`}>
                 <i className={`fa-solid fa-user ${activeTab === 'mypage' ? 'text-[#114982]' : 'text-white'}`}></i>
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
