
import React from 'react';
import PageContainer from '@/components/layout/PageContainer';
import TodayWorkouts from '@/components/dashboard/TodayWorkouts';
import UpcomingWorkouts from '@/components/dashboard/UpcomingWorkouts';
import RecentWorkouts from '@/components/dashboard/RecentWorkouts';
import { Dumbbell } from 'lucide-react';

const Index = () => {
  return (
    <PageContainer>
      <div className="mb-6 text-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 rounded-2xl shadow-sm border border-indigo-100 animate-fade-in">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 shadow-glow text-white mb-2">
          <Dumbbell className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600">Welcome to FitTrack</h1>
      </div>

      <div className="space-y-12">
        <TodayWorkouts />
        <UpcomingWorkouts />
        <RecentWorkouts />
      </div>
    </PageContainer>
  );
};

export default Index;
