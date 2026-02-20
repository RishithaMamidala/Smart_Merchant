import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar.jsx';
import ToastContainer from '../ui/Toast.jsx';
import { useWebSocket } from '../../hooks/useWebSocket.js';

/**
 * Dashboard layout with sidebar navigation
 */
export default function DashboardLayout() {
  // Initialize WebSocket connection for real-time notifications
  useWebSocket();

  return (
    <div className="flex h-screen bg-surface-100">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}
