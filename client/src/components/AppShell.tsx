import { UserButton } from "@clerk/clerk-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom"; // <-- ADDED REACT ROUTER
import {
  LayoutDashboard, FileSearch, ScrollText, History, Settings as SettingsIcon, Menu, PanelLeftClose, PanelLeft, 
  ChevronRight, MoreHorizontal
} from "lucide-react";
import { useApp } from "../contexts/AppContext";
import AppRoutes from "../AppRoutes";

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

const primaryNav: NavItem[] = [
  { path: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/app/resume/analyzer", label: "Analyzer", icon: FileSearch },
  { path: "/app/history", label: "History", icon: History },
];

const resumeGroup: NavItem[] = [
  { path: "/app/resume/analyzer", label: "Analyzer", icon: FileSearch },
  { path: "/app/resume/builder", label: "Builder", icon: ScrollText },
];

const settingsNav: NavItem[] = [
  { path: "/app/settings", label: "Settings", icon: SettingsIcon },
];

const bottomNav: NavItem[] = [
  { path: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/app/resume/analyzer", label: "Analyzer", icon: FileSearch },
  { path: "/app/history", label: "History", icon: History },
];

const moreNav: NavItem[] = [
  { path: "/app/resume/builder", label: "Builder", icon: ScrollText },
  { path: "/app/settings", label: "Settings", icon: SettingsIcon },
];

function NavLink({ item, collapsed, onClick }: { item: NavItem; collapsed?: boolean; onClick?: () => void; }) {
  // FIXED: Using React Router instead of custom context
  const location = useLocation();
  const navigate = useNavigate();
  const active = location.pathname === item.path || (item.path !== "/app/dashboard" && location.pathname.startsWith(`${item.path}/`));
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={() => {
        navigate(item.path);
        onClick?.();
      }}
      className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors duration-150 ${
        active
          ? "bg-[#17192a] text-[#6d95ff]"
          : "text-[#8a8f98] hover:text-[#f5f5f7] hover:bg-[#111114]"
      }`}
    >
      {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-[#5b8def]" />}
      <Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={2} />
      {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
    </button>
  );
}

function Sidebar({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="h-full flex flex-col py-4 px-3 gap-1 overflow-y-auto custom-scrollbar">
      <div className="px-3 pb-4 pt-1">
        <div className="flex items-center gap-2.5">
          <div className="bg-[#5b8def] p-2 rounded-lg flex-shrink-0">
            <ScrollText className="w-5 h-5 text-white" strokeWidth={2.25} />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <h1 className="text-sm font-semibold text-[#f5f5f7] tracking-tight">ATS Optimizer</h1>
              <span className="text-[10px] text-[#6f7480] font-medium">Resume Intelligence</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-3 py-2"><NavLink item={primaryNav[0]} collapsed={collapsed} /></div>
      
      <div className="px-3 pt-3 pb-1">
        {!collapsed && <div className="text-[10px] font-semibold uppercase tracking-wider text-[#6f7480] px-3 mb-1.5">Resume</div>}
      </div>
      
      <div className="px-3 flex flex-col gap-0.5">
        {resumeGroup.map((item) => <NavLink key={item.path} item={item} collapsed={collapsed} />)}
      </div>

      <div className="px-3 pt-3 flex flex-col gap-0.5">
        <NavLink item={primaryNav[2]} collapsed={collapsed} />
      </div>

      <div className="mt-auto px-3 pt-3">
        {settingsNav.map((item) => <NavLink key={item.path} item={item} collapsed={collapsed} />)}
      </div>
    </div>
  );
}

function BottomNavItem({ item }: { item: NavItem }) {
  // FIXED: Using React Router instead of custom context
  const location = useLocation();
  const navigate = useNavigate();
  const active = location.pathname === item.path;
  const Icon = item.icon;
  
  return (
    <button
      type="button"
      onClick={() => navigate(item.path)}
      className={`flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg transition-colors duration-150 flex-1 min-w-0 ${
        active ? "text-[#6d95ff]" : "text-[#6f7480] hover:text-[#f5f5f7]"
      }`}
    >
      <Icon className="w-[20px] h-[20px]" strokeWidth={2} />
      <span className="text-[10px] font-medium truncate max-w-full">{item.label}</span>
    </button>
  );
}

function Drawer({ onClose }: { onClose: () => void }) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#23232a]">
        <h2 className="text-lg font-semibold text-[#f5f5f7]">More</h2>
        <button type="button" onClick={onClose} className="p-2 rounded-lg text-[#8a8f98] hover:text-[#f5f5f7] hover:bg-[#111114] transition-colors duration-150">
          <ChevronRight className="w-5 h-5 rotate-180" strokeWidth={2} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-1">
        {moreNav.map((item) => <NavLink key={item.path} item={item} onClick={onClose} />)}
      </div>
    </div>
  );
}

export default function AppShell() {
  const { sidebarCollapsed, setSidebarCollapsed, densityClass, mobileDrawerOpen, toggleMobileDrawer, setMobileDrawerOpen } = useApp();

  return (
    <div className={`${densityClass} h-screen w-screen flex flex-row bg-[#09090b] text-[#f5f5f7] overflow-hidden`}>
      <motion.aside initial={false} animate={{ width: sidebarCollapsed ? 64 : 248 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="hidden md:flex flex-shrink-0 h-full border-r border-[#23232a] bg-[#111114] overflow-hidden">
        <Sidebar collapsed={sidebarCollapsed} />
      </motion.aside>

      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <header className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 h-14 md:h-16 border-b border-[#23232a] bg-[#111114]">
          <div className="flex items-center gap-2">
            <button type="button" onClick={toggleMobileDrawer} className="md:hidden p-2 rounded-lg text-[#8a8f98] hover:text-[#f5f5f7] hover:bg-[#111114] transition-colors duration-150">
              <Menu className="w-5 h-5" strokeWidth={2} />
            </button>
            <button type="button" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="hidden md:flex p-2 rounded-lg text-[#8a8f98] hover:text-[#f5f5f7] hover:bg-[#111114] transition-colors duration-150">
              {sidebarCollapsed ? <PanelLeft className="w-5 h-5" strokeWidth={2} /> : <PanelLeftClose className="w-5 h-5" strokeWidth={2} />}
            </button>
          </div>
          <div className="flex items-center">
            <div className="border border-[#23232a] rounded-full p-0.5 transition-colors duration-200 hover:border-[#3a3a42]">
              <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Dashboard, Analyzer, etc. render here! */}
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8">
            <AppRoutes />
          </div>
        </main>

        <nav className="md:hidden flex-shrink-0 border-t border-[#23232a] bg-[#111114] safe-bottom">
          <div className="flex items-center justify-between px-2">
            {bottomNav.map((item) => <BottomNavItem key={item.path} item={item} />)}
            <button type="button" onClick={toggleMobileDrawer} className="flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg transition-colors duration-150 flex-1 min-w-0 text-[#6f7480] hover:text-[#f5f5f7]">
              <MoreHorizontal className="w-[20px] h-[20px]" strokeWidth={2} />
              <span className="text-[10px] font-medium">More</span>
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {mobileDrawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="md:hidden fixed inset-0 bg-slate-900/30 z-40" onClick={() => setMobileDrawerOpen(false)} />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="md:hidden fixed inset-y-0 left-0 w-[280px] max-w-[85vw] bg-[#111114] border-r border-[#23232a] z-50 overflow-hidden">
              <Drawer onClose={() => setMobileDrawerOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}