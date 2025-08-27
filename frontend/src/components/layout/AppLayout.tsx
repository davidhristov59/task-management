import { Outlet } from 'react-router-dom';
import { Header } from './header';
import { Sidebar } from './sidebar';

export function AppLayout() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900 no-horizontal-scroll">
      <Header />
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto min-w-0">
          <div className="mobile-container w-full max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}