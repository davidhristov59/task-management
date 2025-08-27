import { Menu, User, Settings } from 'lucide-react';
import { useUIStore } from '@/stores';
import { Breadcrumb } from './Breadcrumb';
import { GlobalSearch } from '../ui/global-search';

export function Header() {
  const { toggleSidebar } = useUIStore();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-50">
      <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5 text-gray-700" />
        </button>
        
        <div className="flex items-center space-x-3 min-w-0">
          <div className="text-lg sm:text-xl font-bold text-black truncate">
            Task Management
          </div>
        </div>
        
        <div className="hidden lg:block">
          <Breadcrumb />
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
        <GlobalSearch className="hidden sm:block" />
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
          </button>
          
          <button
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="User menu"
          >
            <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
}