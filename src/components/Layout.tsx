import { NavLink, Outlet, Link } from 'react-router-dom';

const NAV = [
  { to: '/', label: 'טבלה', icon: '🏆' },
  { to: '/matches', label: 'משחקים', icon: '⚽' },
  { to: '/live', label: 'חי', icon: '🔴' },
  { to: '/tournament', label: 'טורניר', icon: '🌍' },
];

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <span className="text-xl">⚽</span>
            <span>מונדיאל 2026</span>
          </Link>
          <Link
            to="/me"
            className="size-9 rounded-full bg-slate-800 grid place-items-center text-sm hover:bg-slate-700 transition"
            aria-label="הפרופיל שלי"
          >
            👤
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-4 pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-20 bg-slate-900/95 backdrop-blur border-t border-slate-800">
        <div className="max-w-3xl mx-auto grid grid-cols-4">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-3 text-xs transition ${
                  isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`
              }
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
