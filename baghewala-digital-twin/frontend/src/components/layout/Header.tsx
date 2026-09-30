import React from 'react';
import { Bell, ChevronDown, LogOut, Menu, Search, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

interface HeaderProps { onToggleMobileSidebar?: () => void; }

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const { user, logout } = useAuth();
  return (
    <header className="oil-header-wrapper h-[52px] shrink-0 select-none">
      <div className="oil-header-search-wrap">
        {onToggleMobileSidebar && <button type="button" onClick={onToggleMobileSidebar} className="oil-mobile-menu lg:hidden" aria-label="Toggle navigation"><Menu className="h-5 w-5" /></button>}
        <div className="oil-header-search"><Search className="h-4 w-4" /><input aria-label="Search" placeholder="Search wells, scenarios, or parameters..." /><kbd>Ctrl K</kbd></div>
      </div>
      <div className="oil-header-actions">
        <button type="button" className="oil-header-icon" aria-label="Notifications"><Bell className="h-[18px] w-[18px]" /><i /></button>
        <button type="button" className="oil-header-icon" aria-label="Settings"><Settings className="h-[18px] w-[18px]" /></button>
        <div className="oil-profile-divider" />
        <button type="button" className="oil-profile" aria-label="Open profile menu"><span className="oil-profile-avatar">OI</span><span><strong>Oil India Limited</strong><small>{user?.name || 'Operator'}</small></span><ChevronDown className="h-4 w-4" /></button>
        <button type="button" className="oil-logout-icon" onClick={logout} title="Sign out" aria-label="Sign out"><LogOut className="h-4 w-4" /></button>
      </div>
    </header>
  );
};