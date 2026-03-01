import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Dumbbell, History, Settings } from 'lucide-react';

export const Layout: React.FC = () => {
    return (
        <div className="flex flex-col h-screen bg-gray-50 text-gray-900">
            <main className="flex-1 overflow-y-auto pb-20">
                <Outlet />
            </main>

            <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 safe-area-pb">
                <div className="flex justify-around items-center h-16">
                    <NavItem to="/" icon={<Home size={24} />} label="Home" />
                    <NavItem to="/workout" icon={<Dumbbell size={24} />} label="Workout" />
                    <NavItem to="/history" icon={<History size={24} />} label="History" />
                    <NavItem to="/settings" icon={<Settings size={24} />} label="Settings" />
                </div>
            </nav>
        </div>
    );
};

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
                }`
            }
        >
            {icon}
            <span className="text-xs font-medium">{label}</span>
        </NavLink>
    );
};
