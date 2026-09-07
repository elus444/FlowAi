import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { LogOut, User, LayoutGrid, Database } from 'lucide-react'
import { confirmDialog } from '@/store/confirmStore'

export default function Layout() {
    const { user, logout } = useAuthStore()
    const location = useLocation()

    const handleLogout = async () => {
        if (await confirmDialog('Are you sure you want to logout?')) {
            logout()
        }
    }

    const isActive = (path: string) => location.pathname === path

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Header. Labels collapse to icon-only below sm and the email
                pill hides entirely below md -- at full width (nav labels +
                a full email address + "Logout") this was one of a few
                fixed-width, non-wrapping rows on the site wide enough to
                force the *entire page* into horizontal scroll on a phone,
                independent of whatever page's content sat below it. */}
            <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between gap-2 shadow-sm z-10">
                <div className="flex items-center gap-3 sm:gap-8 min-w-0">
                    <div className="flex items-center gap-4 shrink-0">
                        <Link to="/workflows" className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <span className="bg-blue-600 text-white p-1 rounded">FA</span>
                            <span className="hidden sm:inline">FlowAI</span>
                        </Link>
                    </div>

                    <nav className="flex items-center gap-1 shrink-0">
                        <Link
                            to="/workflows"
                            title="Workflows"
                            className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${isActive('/workflows')
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <LayoutGrid size={18} />
                            <span className="hidden sm:inline">Workflows</span>
                        </Link>
                        <Link
                            to="/datasets"
                            title="Datasets"
                            className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${isActive('/datasets')
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <Database size={18} />
                            <span className="hidden sm:inline">Datasets</span>
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    <div
                        title={user?.email}
                        className="hidden md:flex items-center gap-2 text-sm px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200 max-w-[14rem]"
                    >
                        <User size={16} className="text-gray-500 shrink-0" />
                        <span className="text-gray-700 font-medium truncate">{user?.email}</span>
                    </div>

                    <button
                        onClick={handleLogout}
                        title="Logout"
                        className="flex items-center gap-2 px-2 sm:px-3 py-1.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
                    >
                        <LogOut size={16} />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                <Outlet />
            </div>
        </div>
    )
}
