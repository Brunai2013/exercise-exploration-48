import React, { useState, useEffect } from 'react';
import { getTodayWorkouts } from '@/lib/workouts';
import { Workout } from '@/lib/types';
import WorkoutCard from '@/components/workout/WorkoutCard';
import SectionHeader from '@/components/layout/SectionHeader';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles, Calendar, Gem } from 'lucide-react';
import { Link } from 'react-router-dom';

const TodayWorkouts: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  
  const today = format(new Date(), 'EEEE, MMMM d');
  
  console.log('Today component date display:', today);

  const refreshWorkouts = async () => {
    try {
      setLoading(true);
      const data = await getTodayWorkouts();
      console.log('Fetched today workouts:', data.length);
      setWorkouts(data);
    } catch (error) {
      console.error('Error fetching today workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshWorkouts();
  }, []);

  if (loading) {
    return (
      <div className="mb-10">
        <SectionHeader 
          title={`Today's Workouts`}
          description={today}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="border rounded-lg p-5">
              <Skeleton className="h-4 w-20 mb-3" />
              <Skeleton className="h-6 w-40 mb-1" />
              <Skeleton className="h-4 w-full mb-3" />
              <Skeleton className="h-4 w-32 mb-3" />
              <Skeleton className="h-2 w-full mb-6" />
              <div className="border-t pt-3">
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-6 rounded-xl shadow-md border border-indigo-100 hover:shadow-xl transition-all duration-500">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="mr-4 bg-gradient-to-r from-blue-600 to-violet-600 p-2 rounded-full text-white shadow-glow">
            <Calendar className="h-5 w-5" />
          </div>
          <SectionHeader 
            title={`Today's Workouts`}
            description={today}
          />
        </div>
        <Link to="/workout/new">
          <Button className="flex items-center bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 transition-all duration-300 shadow-md hover:shadow-lg rounded-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Workout
          </Button>
        </Link>
      </div>

      {workouts.length === 0 ? (
        <div className="glass-card p-8 text-center rounded-2xl shadow-inner">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full text-indigo-600 mb-4">
            <Gem className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-gradient">No workouts scheduled for today</h3>
          <p className="text-muted-foreground mb-6">Start your fitness journey by adding a workout for today.</p>
          <Link to="/workout/new">
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-full relative overflow-hidden group">
              <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="absolute inset-0 bg-white/30 opacity-0 twinkle-animation"></span>
              <Sparkles className="h-4 w-4 mr-2" />
              Create Your First Workout
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workouts.map((workout: Workout) => (
            <WorkoutCard key={workout.id} workout={workout} onArchive={refreshWorkouts} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TodayWorkouts;
