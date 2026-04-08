import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import ProfileView from './components/ProfileView';
import ProfileForm from './components/ProfileForm';
import StaffList from './components/StaffList';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import LoginForm from './components/LoginForm';
import { StaffProfile } from './types';
import { cn } from './lib/utils';
import { useAppContext } from './contexts/AppContext';
import { useAuth } from './hooks/useAuth';
import { useStaffData } from './hooks/useStaffData';

export default function App() {
  const { 
    language, setLanguage, 
    isDarkMode, setIsDarkMode,
    isSidebarOpen, setIsSidebarOpen,
    isSidebarCollapsed, setIsSidebarCollapsed,
    activeTab, setActiveTab,
    activeView, setActiveView,
    selectedStaff, setSelectedStaff,
    toggleSidebar
  } = useAppContext();

  const { currentUser, isAuthReady, setCurrentUser, logout } = useAuth();
  const { staffList, connectionError, handleSave } = useStaffData(currentUser?.id, language);

  const handleAddNew = () => {
    setSelectedStaff(null);
    setActiveView('form');
    setActiveTab('add-staff');
  };

  const handleViewStaff = (staff: StaffProfile) => {
    setSelectedStaff(staff);
    setActiveView('view');
    setActiveTab('staff-list');
  };

  const handleEditStaff = (staff: StaffProfile) => {
    setSelectedStaff(staff);
    setActiveView('form');
    setActiveTab('staff-list');
  };

  const handleCancel = () => {
    if (activeTab === 'add-staff') {
      setActiveTab('staff-list');
      setActiveView('list');
    } else {
      setActiveView('view');
    }
  };

  const handleSidebarTabChange = (tab: string) => {
    setActiveTab(tab);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
    
    if (tab === 'add-staff') {
      handleAddNew();
    } else if (tab === 'staff-list') {
      setActiveView('list');
      setSelectedStaff(null);
    } else if (tab === 'dashboard') {
      setActiveView('dashboard');
      setSelectedStaff(null);
    } else if (tab === 'logout') {
      logout();
    }
  };

  if (!isAuthReady) {
    return (
      <>
        <div className="fixed inset-0 z-[-1] bg-white dark:bg-slate-950 transition-colors duration-300" />
        <div className="min-h-screen flex items-center justify-center bg-transparent">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (!currentUser) {
    return (
      <>
        <div className="fixed inset-0 z-[-1] bg-white dark:bg-slate-950 transition-colors duration-300" />
        <LoginForm onLogin={setCurrentUser} language={language} />
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-[-1] bg-white dark:bg-slate-950 transition-colors duration-300" />
      <div className={cn(
        "min-h-screen bg-transparent flex overflow-x-hidden",
        language === 'kh' ? "font-khmer" : "font-sans"
      )}>
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={handleSidebarTabChange} 
          isOpen={isSidebarOpen}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onClose={() => setIsSidebarOpen(false)}
          language={language}
          user={currentUser}
          isDarkMode={isDarkMode}
        />
        
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className={cn(
          "flex-1 min-h-screen flex flex-col transition-all duration-300 min-w-0",
          isSidebarOpen ? (isSidebarCollapsed ? "md:ml-24" : "md:ml-72") : "md:ml-0"
        )}>
          {connectionError && (
            <div className="bg-rose-500 text-white px-4 py-2 text-center text-xs font-bold animate-pulse z-50 sticky top-0">
              {connectionError}
            </div>
          )}
          <TopNavbar 
            activeView={activeView === 'dashboard' ? 'list' : activeView} 
            setActiveView={(view) => {
              if (view === 'view' && activeView === 'form') {
                setActiveView('view');
              } else if (view === 'form' && activeView === 'view') {
                setActiveView('form');
              } else if (view === 'list') {
                setActiveView('list');
                setSelectedStaff(null);
              }
            }} 
            onToggleSidebar={toggleSidebar}
            language={language}
            setLanguage={setLanguage}
            user={currentUser}
          />
          
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'settings' ? (
              <Settings 
                language={language} 
                setLanguage={setLanguage} 
                isDarkMode={isDarkMode} 
                setIsDarkMode={setIsDarkMode} 
              />
            ) : activeView === 'dashboard' ? (
              <Dashboard staffList={staffList} language={language} isDarkMode={isDarkMode} />
            ) : activeView === 'list' ? (
              <StaffList 
                data={staffList} 
                onView={handleViewStaff} 
                onEdit={handleEditStaff} 
                language={language} 
                isDarkMode={isDarkMode}
              />
            ) : activeView === 'view' && selectedStaff ? (
              <ProfileView 
                profile={selectedStaff} 
                language={language} 
                onBack={handleCancel}
                onEdit={handleEditStaff}
                isDarkMode={isDarkMode}
              />
            ) : (
              <ProfileForm 
                initialData={selectedStaff || undefined} 
                onSave={(newData) => handleSave(newData, selectedStaff?.id).then(success => {
                  if (success) setActiveView('view');
                  return success;
                })} 
                onCancel={handleCancel} 
                language={language}
                isDarkMode={isDarkMode}
              />
            )}
          </div>
        </main>
      </div>
    </>
  );
}
