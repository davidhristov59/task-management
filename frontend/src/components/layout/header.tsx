import { Menu, User, Settings } from 'lucide-react';
import { useUIStore } from '@/stores';
import { Breadcrumb } from './Breadcrumb';
import { GlobalSearch } from '../ui/global-search';

export function Header() {
  const { toggleSidebar } = useUIStore();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5 text-gray-700" />
        </button>
        
        <div className="flex items-center space-x-3">
          <div className="text-xl font-bold text-black">
            Task Management
          </div>
        </div>
        
        <div className="hidden md:block">
          <Breadcrumb />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <GlobalSearch className="hidden md:block" />
        <div className="flex items-center space-x-2">
          <button
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5 text-gray-600" />
          </button>
          
          <button
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="User menu"
          >
            <User className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
}