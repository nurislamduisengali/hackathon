import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard, Bus, Building2, Leaf,
  Menu, X, Bell, Search, User, MapPin, MessageCircleIcon,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useDistrict } from "@/context/DistrictContext";

const districts = [
  "Весь город", "Алмалинский", "Ауэзовский", "Бостандыкский",
  "Жетысуский", "Медеуский", "Наурызбайский", "Турксибский", "Алатауский",
];

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Главная" },
  { to: "/transport", icon: Bus, label: "Транспорт" },
  { to: "/housing", icon: Building2, label: "ЖКХ" },
  { to: "/ecology", icon: Leaf, label: "Экология" },
  { to: "/feedback", icon: MessageCircleIcon, label: "Отзывы " },
];

const topTabs = ["Население", "Экономика", "Инфраструктура", "Мониторинг", "Аналитика"];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { district, setDistrict } = useDistrict();

  return (
    <div className="flex h-screen overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[220px] flex-shrink-0 bg-white flex flex-col transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-bold">S</span>
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">SMARTQALA</div>
            <div className="text-[10px] tracking-wider">ALMATY CITY</div>
          </div>
          <button className="ml-auto lg:hidden text-sidebar-fg" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-2">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/"} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? "bg-sidebar-active text-primary-foreground" : "hover:bg-slate-100"}`}>
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-sidebar-hover">
          <div className="text-xs">© 2026 Almaty</div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex-shrink-0 bg-card border-b border-border flex items-center px-4 gap-3">
          <button className="lg:hidden text-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>

          <Select value={district} onValueChange={setDistrict}>
            <SelectTrigger className="w-[160px] h-8 text-xs bg-muted border-border">
              <MapPin size={14} className="mr-1.5 text-primary flex-shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {districts.map((d) => (
                <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* <div className="hidden md:flex items-center gap-1">
            {topTabs.map((tab) => (
              <button key={tab} className="px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                {tab}
              </button>
            ))}
          </div> */}

          <div className="ml-auto flex items-center gap-3">
            <button className="text-muted-foreground hover:text-foreground"><Search size={18} /></button>
            <button className="text-muted-foreground hover:text-foreground relative">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-destructive" />
            </button>
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <User size={14} className="text-primary-foreground" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
