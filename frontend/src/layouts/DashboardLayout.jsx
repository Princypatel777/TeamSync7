import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { useAuthStore } from '../store/authStore';
import FacultyOnboardingModal from '../components/faculty/FacultyOnboardingModal';

export const DashboardLayout = () => {
  const { user } = useAuthStore();
  const role = user?.role || 'STUDENT';

  // Check if current user is faculty and has not completed profile setup
  const isProfileIncomplete =
    user?.role === 'FACULTY' &&
    !user?.isProfileComplete &&
    !user?.profile?.isProfileComplete;

  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (isProfileIncomplete) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, [isProfileIncomplete]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* First-Time Faculty Setup Modal */}
      {user?.role === 'FACULTY' && (
        <FacultyOnboardingModal
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          isMandatory={true}
        />
      )}

      {/* Sidebar */}
      <Sidebar role={role} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
