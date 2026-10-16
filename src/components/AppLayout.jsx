
import { useState } from 'react';

import {
  LayoutDashboard,
  LogOut,
  Menu,
  Wallet,
  X,
  Users,
  Landmark,
  CalendarDays,
  HandCoins,
  FileBarChart2,
  FileSpreadsheet,
  UserRound,
} from 'lucide-react';

import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { t, language, changeLanguage } = useLanguage();

  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'admin';

  const dashboardPath = isAdmin
    ? '/admin/dashboard'
    : '/my/dashboard';

  const menuItems = [
    {
      path: dashboardPath,
      label: t('dashboard'),
      icon: LayoutDashboard,
    },

    ...(isAdmin
      ? [
          {
            path: '/admin/members',
            label:
              language === 'gu'
                ? 'સભ્યો'
                : 'Members',
            icon: Users,
          },
          {
            path: '/admin/accounts',
            label:
              language === 'gu'
                ? 'સોસાયટી ખાતાઓ'
                : 'Society Accounts',
            icon: Landmark,
          },
          {
            path: '/admin/monthly-investments',
            label:
              language === 'gu'
                ? 'માસિક રોકાણ'
                : 'Monthly Investments',
            icon: CalendarDays,
          },
          {
            path: '/admin/loans',
            label:
              language === 'gu'
                ? 'લોન મેનેજમેન્ટ'
                : 'Loan Management',
            icon: HandCoins,
          },
          {
            path: '/admin/external-borrowers',
            label:
              language === 'gu'
                ? 'બહારના લોન લેનાર'
                : 'External Borrowers',
            icon: UserRound,
          },
          {
            path: '/admin/reports/financial',
            label:
              language === 'gu'
                ? 'નાણાકીય રિપોર્ટ'
                : 'Financial Reports',
            icon: FileBarChart2,
          },
          {
            path: '/admin/reports/monthly-member-statement',
            label:
              language === 'gu'
                ? 'સભ્યોનું માસિક સ્ટેટમેન્ટ'
                : 'Monthly Member Statement',
            icon: FileSpreadsheet,
          },
        ]
      : []),
  ];

  const currentMenuItem = menuItems.find(item => {
    return (
      item.path === location.pathname ||
      location.pathname.startsWith(`${item.path}/`)
    );
  });

  const pageTitle =
    currentMenuItem?.label || t('dashboard');

  async function handleLogout() {
    setError('');

    try {
      await logout();
    } catch {
      // Local session cleanup is handled by AuthContext.
    } finally {
      setOpen(false);
      navigate('/login', { replace: true });
    }
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-slate-950 text-white">
      <div className="flex items-center gap-3 border-b border-slate-800 p-6">
        <Wallet
          size={24}
          className="text-indigo-400"
        />

        <span className="text-lg font-bold">
          {t('app')}
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {menuItems.map(item => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === dashboardPath}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                  isActive
                    ? 'bg-indigo-600 font-medium text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={20} className="shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="mb-3 break-words text-sm text-slate-300">
          {language === 'gu'
            ? user?.name_gu || user?.name
            : user?.name}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-lg py-2 text-red-300 transition-colors hover:text-white"
        >
          <LogOut size={19} />
          <span>{t('logout')}</span>
        </button>

        {error && (
          <p className="mt-2 text-xs text-red-300">
            {error}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      <aside className="hidden min-h-screen w-64 shrink-0 lg:block">
        {sidebar}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <aside className="h-full w-64 shrink-0">
            {sidebar}
          </aside>

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="flex flex-1 items-start justify-end bg-black/50 p-4 text-white"
          >
            <X size={24} />
          </button>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between gap-3 border-b bg-white px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="rounded-lg p-1 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={23} />
            </button>

            <h2 className="truncate font-semibold text-slate-900">
              {pageTitle}
            </h2>
          </div>

          <select
            value={language}
            onChange={event =>
              changeLanguage(event.target.value)
            }
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-900"
          >
            <option value="gu">ગુજરાતી</option>
            <option value="en">English</option>
          </select>
        </header>

        <main className="p-4 md:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
