/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from './types';
import { storage } from './services/storage';
import { auth, DEFAULT_PASSWORDS } from './services/auth';

// Common Components
import { PortalHeader } from './components/common/PortalHeader';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';

// Learner Views
import { LearnerDashboard } from './components/learner/LearnerDashboard';
import { MyLearning } from './components/learner/MyLearning';
import { CoursePlayer } from './components/learner/CoursePlayer';
import { MySubmissions } from './components/learner/MySubmissions';
import { LearnerCertificates } from './components/learner/LearnerCertificates';
import { LearnerNotifications } from './components/learner/LearnerNotifications';
import { AccountSettings } from './components/learner/AccountSettings';

// Admin Views
import { AdminOverview } from './components/admin/AdminOverview';
import { InternManagement } from './components/admin/InternManagement';
import { TracksCourses } from './components/admin/TracksCourses';
import { CurriculumBuilder } from './components/admin/CurriculumBuilder';
import { TaskManagement } from './components/admin/TaskManagement';
import { SubmissionReviews } from './components/admin/SubmissionReviews';
import { CertificateManagement } from './components/admin/CertificateManagement';
import { AnnouncementManager } from './components/admin/AnnouncementManager';
import { ActivityLogs } from './components/admin/ActivityLogs';
import { AdminSettings } from './components/admin/AdminSettings';

// Public Views
import { CertificateVerify } from './components/public/CertificateVerify';
import { AuthPage } from './components/public/AuthPage';

export default function App() {
  // Domain simulation: 'learner' (lms.problos.com) | 'admin' (admin.lms.problos.com) | 'verify' (verify.problos.com)
  const [currentDomain, setCurrentDomain] = useState<'learner' | 'admin' | 'verify'>('learner');

  // Active authenticated user
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const existing = auth.getCurrentUser();
    if (existing) return existing;
    // Default to Alex Chen (learner) for instant out-of-the-box preview
    const defaultUser = storage.getUserByEmail('alex.chen@problos.dev');
    if (defaultUser) {
      auth.setCurrentUser(defaultUser);
      return defaultUser;
    }
    return null;
  });

  // Active navigation tab
  const [learnerTab, setLearnerTab] = useState<string>('dashboard');
  const [adminTab, setAdminTab] = useState<string>('overview');

  // Course Player state
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);

  // Certificate Verification ID
  const [verifyId, setVerifyId] = useState<string>('PRB-2026-WD-0481');

  // Curriculum Builder course selection helper
  const [curriculumCourseId, setCurriculumCourseId] = useState<string | undefined>(undefined);

  // Data version counter to trigger reactive re-renders
  const [dataVersion, setDataVersion] = useState(0);
  const refreshData = () => setDataVersion(v => v + 1);

  // Load fresh database state
  const users = storage.getUsers();
  const tracks = storage.getTracks();
  const courses = storage.getCourses();
  const tasks = storage.getTasks();
  const submissions = storage.getSubmissions();
  const certificates = storage.getCertificates();
  const announcements = storage.getAnnouncements();
  const activityLogs = storage.getLogs();
  const allProgress = storage.getAllProgress();
  const overrides = storage.getOverrides();

  // Pending reviews count for admin badge
  const pendingReviewsCount = submissions.filter(s => s.currentStatus === 'pending').length;

  // Unread announcements / notifications for learner
  const unreadNotificationsCount = currentUser
    ? announcements.filter(a => {
        if (a.targetType === 'all') return true;
        if (a.targetType === 'track' && a.targetTrackId && currentUser.assignedTrackIds.includes(a.targetTrackId)) return true;
        if (a.targetType === 'learners' && a.targetLearnerIds?.includes(currentUser.id)) return true;
        return false;
      }).length
    : 0;

  // Handle Logout
  const handleLogout = () => {
    auth.logout();
    setCurrentUser(null);
  };

  // Switch Domain / Subdomain simulation
  const handleSwitchDomain = (domain: 'learner' | 'admin' | 'verify') => {
    setCurrentDomain(domain);
    setActiveCourseId(null);
    if (domain === 'admin' && currentUser?.role !== 'admin') {
      // Auto-switch to Siyab Admin for seamless evaluation if requested
      const admin = storage.getUserByEmail('msiyab10492@gmail.com');
      if (admin) {
        auth.setCurrentUser(admin);
        setCurrentUser(admin);
      }
    } else if (domain === 'learner' && currentUser?.role === 'admin') {
      // Switch to intern persona for learner portal
      const learner = storage.getUserByEmail('alex.chen@problos.dev');
      if (learner) {
        auth.setCurrentUser(learner);
        setCurrentUser(learner);
      }
    }
  };

  // Quick switch persona helper
  const handleQuickSwitchUser = (email: string) => {
    const user = storage.getUserByEmail(email);
    if (user) {
      auth.setCurrentUser(user);
      setCurrentUser(user);
      setActiveCourseId(null);

      if (user.role === 'admin') {
        setCurrentDomain('admin');
      } else {
        setCurrentDomain('learner');
      }
      refreshData();
    }
  };

  // Open Course Player
  const handleOpenCourse = (courseId: string) => {
    setActiveCourseId(courseId);
  };

  // Jump to Certificate Verification
  const handleNavigateToVerify = (certId: string) => {
    setVerifyId(certId);
    setCurrentDomain('verify');
  };

  // Handle Curriculum builder navigation from Tracks & Courses
  const handleOpenCurriculumBuilderForCourse = (courseId: string) => {
    setCurriculumCourseId(courseId);
    setAdminTab('curriculum-builder');
  };

  // ==========================================
  // RENDER: Public Verification Portal
  // ==========================================
  if (currentDomain === 'verify') {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col font-sans">
        <PortalHeader
          currentDomain={currentDomain}
          onSwitchDomain={handleSwitchDomain}
          currentUser={currentUser}
          onQuickSwitchUser={handleQuickSwitchUser}
        />
        <CertificateVerify
          initialCertId={verifyId}
          onBackToApp={() => setCurrentDomain(currentUser?.role === 'admin' ? 'admin' : 'learner')}
        />
      </div>
    );
  }

  // ==========================================
  // RENDER: Admin Portal (admin.lms.problos.com)
  // ==========================================
  if (currentDomain === 'admin') {
    // If not logged in or not admin, show Auth Page in Admin context
    if (!currentUser || currentUser.role !== 'admin') {
      return (
        <div className="min-h-screen bg-[#FAF9F6] flex flex-col font-sans">
          <PortalHeader
            currentDomain={currentDomain}
            onSwitchDomain={handleSwitchDomain}
            currentUser={currentUser}
            onQuickSwitchUser={handleQuickSwitchUser}
          />
          <AuthPage
            portalContext="admin"
            onLoginSuccess={user => {
              auth.setCurrentUser(user);
              setCurrentUser(user);
              refreshData();
            }}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col font-sans">
        <PortalHeader
          currentDomain={currentDomain}
          onSwitchDomain={handleSwitchDomain}
          currentUser={currentUser}
          onQuickSwitchUser={handleQuickSwitchUser}
        />

        <Navbar
          currentUser={currentUser}
          onLogout={handleLogout}
          onNavigateToNotifications={() => setAdminTab('announcements')}
          portalTitle="Admin Console • admin.lms.problos.com"
        />

        <div className="flex-1 max-w-7xl w-full mx-auto flex">
          {/* Admin Sidebar */}
          <Sidebar
            role="admin"
            activeTab={adminTab}
            onSelectTab={setAdminTab}
            pendingReviewsCount={pendingReviewsCount}
          />

          {/* Admin Main Body */}
          <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto">
            {adminTab === 'overview' && (
              <AdminOverview
                currentUser={currentUser}
                users={users}
                tracks={tracks}
                courses={courses}
                tasks={tasks}
                submissions={submissions}
                certificates={certificates}
                activityLogs={activityLogs}
                onNavigateTab={setAdminTab}
              />
            )}

            {adminTab === 'interns' && (
              <InternManagement
                currentAdmin={currentUser}
                users={users}
                tracks={tracks}
                courses={courses}
                allProgress={allProgress}
                overrides={overrides}
                onRefreshData={refreshData}
              />
            )}

            {adminTab === 'tracks-courses' && (
              <TracksCourses
                currentAdmin={currentUser}
                tracks={tracks}
                courses={courses}
                onRefreshData={refreshData}
                onOpenCurriculumBuilder={handleOpenCurriculumBuilderForCourse}
              />
            )}

            {adminTab === 'curriculum-builder' && (
              <CurriculumBuilder
                currentAdmin={currentUser}
                courses={courses}
                initialSelectedCourseId={curriculumCourseId}
                onRefreshData={refreshData}
              />
            )}

            {adminTab === 'tasks' && (
              <TaskManagement
                currentAdmin={currentUser}
                tasks={tasks}
                courses={courses}
                tracks={tracks}
                users={users}
                onRefreshData={refreshData}
              />
            )}

            {adminTab === 'reviews' && (
              <SubmissionReviews
                currentAdmin={currentUser}
                submissions={submissions}
                tasks={tasks}
                courses={courses}
                users={users}
                onRefreshData={refreshData}
              />
            )}

            {adminTab === 'certificates' && (
              <CertificateManagement
                currentAdmin={currentUser}
                certificates={certificates}
                users={users}
                courses={courses}
                tracks={tracks}
                onRefreshData={refreshData}
                onVerifyCertificate={handleNavigateToVerify}
              />
            )}

            {adminTab === 'announcements' && (
              <AnnouncementManager
                currentAdmin={currentUser}
                announcements={announcements}
                tracks={tracks}
                users={users}
                onRefreshData={refreshData}
              />
            )}

            {adminTab === 'activity-logs' && (
              <ActivityLogs logs={activityLogs} />
            )}

            {adminTab === 'settings' && (
              <AdminSettings onRefreshData={refreshData} />
            )}
          </main>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: Learner Portal (lms.problos.com)
  // ==========================================
  // If not logged in, show Auth Page in Learner context
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col font-sans">
        <PortalHeader
          currentDomain={currentDomain}
          onSwitchDomain={handleSwitchDomain}
          currentUser={currentUser}
          onQuickSwitchUser={handleQuickSwitchUser}
        />
        <AuthPage
          portalContext="learner"
          onLoginSuccess={user => {
            auth.setCurrentUser(user);
            setCurrentUser(user);
            refreshData();
          }}
        />
      </div>
    );
  }

  // If a Course is actively selected, display Course Player (No Admin Console link in player!)
  if (activeCourseId) {
    const activeCourse = courses.find(c => c.id === activeCourseId) || courses[0];

    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col font-sans">
        <PortalHeader
          currentDomain={currentDomain}
          onSwitchDomain={handleSwitchDomain}
          currentUser={currentUser}
          onQuickSwitchUser={handleQuickSwitchUser}
        />

        <Navbar
          currentUser={currentUser}
          onLogout={handleLogout}
          portalTitle="Learner Portal • lms.problos.com"
        />

        <CoursePlayer
          currentUser={currentUser}
          course={activeCourse}
          tasks={tasks}
          submissions={submissions}
          onBackToCourses={() => setActiveCourseId(null)}
          onRefreshData={refreshData}
        />
      </div>
    );
  }

  // Standard Learner Dashboard & Navigation (Strictly NO Admin Console link in learner navigation!)
  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col font-sans">
      <PortalHeader
        currentDomain={currentDomain}
        onSwitchDomain={handleSwitchDomain}
        currentUser={currentUser}
        onQuickSwitchUser={handleQuickSwitchUser}
      />

      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onNavigateToNotifications={() => setLearnerTab('notifications')}
        onNavigateToAccount={() => setLearnerTab('account')}
        unreadCount={unreadNotificationsCount}
        portalTitle="Learner Portal • lms.problos.com"
      />

      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Learner Sidebar */}
        <Sidebar
          role="learner"
          activeTab={learnerTab}
          onSelectTab={setLearnerTab}
          unreadNotificationsCount={unreadNotificationsCount}
        />

        {/* Learner Main Body */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto">
          {learnerTab === 'dashboard' && (
            <LearnerDashboard
              currentUser={currentUser}
              courses={courses}
              tasks={tasks}
              submissions={submissions}
              certificates={certificates.filter(c => c.recipientId === currentUser.id)}
              announcements={announcements}
              allProgress={allProgress}
              onOpenCourse={handleOpenCourse}
              onNavigateToSubmissions={() => setLearnerTab('submissions')}
              onNavigateToCertificates={() => setLearnerTab('certificates')}
            />
          )}

          {learnerTab === 'my-learning' && (
            <MyLearning
              currentUser={currentUser}
              tracks={tracks}
              courses={courses}
              allProgress={allProgress}
              onOpenCourse={handleOpenCourse}
            />
          )}

          {learnerTab === 'submissions' && (
            <MySubmissions
              currentUser={currentUser}
              courses={courses}
              tasks={tasks}
              submissions={submissions}
              onRefreshData={refreshData}
              onOpenCourse={handleOpenCourse}
            />
          )}

          {learnerTab === 'certificates' && (
            <LearnerCertificates
              certificates={certificates.filter(c => c.recipientId === currentUser.id)}
              onVerifyCertificate={handleNavigateToVerify}
            />
          )}

          {learnerTab === 'notifications' && (
            <LearnerNotifications
              announcements={announcements}
              currentUserId={currentUser.id}
              assignedTrackIds={currentUser.assignedTrackIds}
            />
          )}

          {learnerTab === 'account' && (
            <AccountSettings
              currentUser={currentUser}
              onRefreshUser={() => {
                const refreshed = storage.getUserById(currentUser.id);
                if (refreshed) setCurrentUser(refreshed);
                refreshData();
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
