import { useEffect, useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { IsometricCanvas } from './components/IsometricCanvas';
import { CampusMap3D } from './components/CampusMap3D';
import { TopBar } from './components/TopBar';
import { LocationActivityBar } from './components/LocationActivityBar';
import { NavigationDock } from './components/NavigationDock';
import { GameNotifications } from './components/GameNotifications';
import { HostelSidebarNav } from './components/HostelSidebarNav';
import { CustomizeCharacterModal } from './components/CustomizeCharacterModal';
import { NPCDialogueModal } from './components/NPCDialogueModal';
import { CampusPhone } from './components/CampusPhone';
import { SermonKhutbahModal } from './components/SermonKhutbahModal';
import { ElectionsSystem } from './components/ElectionsSystem';
import { HustleCrimeModal } from './components/HustleCrimeModal';
import { ExamTribunalModal } from './components/ExamTribunalModal';
import { MatriculationModal } from './components/MatriculationModal';
import { AdminDashboard } from './components/AdminDashboard';
import { GuesthouseScene } from './components/GuesthouseScene';
import { MedicalCentreScene } from './components/MedicalCentreScene';
import { AmbulanceCollapseModal } from './components/AmbulanceCollapseModal';
import { SportsComplexScene } from './components/SportsComplexScene';
import { LionsHallScene } from './components/LionsHallScene';
import { AdelineHallScene } from './components/AdelineHallScene';
import { StudentUnionScene } from './components/StudentUnionScene';
import { PenaltyShootoutModal } from './components/PenaltyShootoutModal';
import { BettingTerminalModal } from './components/BettingTerminalModal';
import { useMultiplayer } from './hooks/useMultiplayer';
import { Radio, X } from 'lucide-react';

function GameRoot() {
  const {
    currentLocation,
    isWardrobeOpen,
    isPhoneOpen,
    activeDialogueNPC,
    setActiveDialogueNPC,
    stats,
    playerCustomization,
    setSocioeconomicStatus,
    addToast,
  } = useGame();

  // Local multiplayer ID (persistent per student matric no)
  const localId = stats.matricNo ? `student_${stats.matricNo.replace(/\//g, '_')}` : 'student_local';

  // Initialize Real-Time Multiplayer Infrastructure for Students
  const {
    remotePlayers,
    allOnlinePlayers,
    activeCampusAnnouncement,
    clearAnnouncement,
  } = useMultiplayer({
    localId,
    username: stats.username,
    matricNo: stats.matricNo,
    department: stats.department,
    academicLevel: stats.academicLevel,
    status: stats.status,
    currentLocation,
    customization: playerCustomization,
    isRegistered: stats.isRegistered,
    onStatusChangeByAdmin: (newStatus, newBalance) => {
      setSocioeconomicStatus(newStatus, newBalance);
    },
    onCampusAnnouncement: (message, sender) => {
      addToast(`📢 ${sender}: "${message}"`, 'info');
    },
  });

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-white font-sans select-none">
      {/* Real-time Campus Announcement Marquee Alert Banner */}
      {activeCampusAnnouncement && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="fixed top-24 sm:top-28 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-3 sm:px-4 animate-in slide-in-from-top-4 duration-300 pointer-events-auto"
        >
          <div className="p-3 rounded-2xl bg-white/95 border-2 border-rose-300 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 text-slate-900">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div className="text-left overflow-hidden">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 block">
                  {activeCampusAnnouncement.sender}
                </span>
                <p className="text-xs font-semibold text-slate-800 truncate max-w-xl">
                  {activeCampusAnnouncement.message}
                </p>
              </div>
            </div>
            <button
              onClick={clearAnnouncement}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3D Isometric View: Campus 3D Map, Dedicated Interior Scenes, or Hostel Interior with Remote Multiplayer Players */}
      {(() => {
        switch (currentLocation as string) {
          case 'campus_map':
            return <CampusMap3D />;
          case 'guesthouse':
            return <GuesthouseScene remotePlayers={remotePlayers} />;
          case 'medical_centre':
            return <MedicalCentreScene remotePlayers={remotePlayers} />;
          case 'sports_arena':
            return <SportsComplexScene remotePlayers={remotePlayers} />;
          case 'lions_hall':
            return <LionsHallScene remotePlayers={remotePlayers} />;
          case 'adeline_hall':
            return <AdelineHallScene remotePlayers={remotePlayers} />;
          case 'Student Union Building':
          case 'sub':
            return <StudentUnionScene remotePlayers={remotePlayers} />;
          default:
            return (
              <>
                <IsometricCanvas remotePlayers={remotePlayers} />
                <LocationActivityBar />
                <HostelSidebarNav />
              </>
            );
        }
      })()}

      {/* Floating UI Overlays */}
      <TopBar />
      <NavigationDock />
      <GameNotifications />

      {/* 3D Character Customization Wardrobe Modal */}
      {isWardrobeOpen && <CustomizeCharacterModal />}

      {/* Interactive Smartphone Modal */}
      {isPhoneOpen && <CampusPhone allOnlinePlayers={allOnlinePlayers} />}

      {/* Interactive Sunday Sermon & Friday Khutbah Minigame Modal */}
      <SermonKhutbahModal />

      {/* Campus Politics SUG Elections Campaign & Voting */}
      <ElectionsSystem />

      {/* Student Hustles & Campus Crime Underworld */}
      <HustleCrimeModal />

      {/* Examination Session & Disciplinary Tribunal */}
      <ExamTribunalModal />

      {/* 1v1 Penalty Shootout Minigame Modal */}
      <PenaltyShootoutModal />

      {/* Campus Football Betting Terminal Modal */}
      <BettingTerminalModal />

      {/* Emergency Exhaustion Ambulance Collapse Modal */}
      {stats.isCollapsed && <AmbulanceCollapseModal />}

      {/* NPC Interactive Dialogue Modal */}
      {activeDialogueNPC && (
        <NPCDialogueModal
          npc={activeDialogueNPC}
          onClose={() => setActiveDialogueNPC(null)}
        />
      )}

      {/* Fresher Matriculation Onboarding & 15% Nepo / 85% Lapo Roll Modal */}
      {!stats.isRegistered && <MatriculationModal />}
    </div>
  );
}

// Client Route Detection for Dedicated /admin-portal Route
const getIsAdminRoute = () => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.replace(/\/+$/, '');
  const hash = window.location.hash;
  return path === '/admin-portal' || hash === '#/admin-portal' || hash === '#admin-portal';
};

export function App() {
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(getIsAdminRoute);

  useEffect(() => {
    const handleRouteChange = () => {
      setIsAdminRoute(getIsAdminRoute());
    };
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  return (
    <GameProvider>
      {isAdminRoute ? (
        <>
          <AdminDashboard
            onLogout={() => {
              window.history.pushState(null, '', '/');
              setIsAdminRoute(false);
            }}
          />
          <GameNotifications />
        </>
      ) : (
        <GameRoot />
      )}
    </GameProvider>
  );
}

export default App;
