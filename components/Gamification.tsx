'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  target?: number;
  points: number; // Bonus points awarded when unlocked
  tier: number; // Used for progressive display (1 = beginner, 2 = intermediate, 3 = advanced)
}

interface UserActivity {
  savedListings: number;
  aiAnalysesRun: number;
  listingsViewed: number;
  daysActive: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

interface GamificationProps {
  compact?: boolean; // For dashboard vs full profile view
}

export default function Gamification({ compact = false }: GamificationProps) {
  const { user } = useAuth();
  const [activity, setActivity] = useState<UserActivity>({
    savedListings: 0,
    aiAnalysesRun: 0,
    listingsViewed: 0,
    daysActive: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchActivityData = async () => {
      try {
        const supabase = createClient();

        // Fetch saved listings count
        const { count: savedCount } = await supabase
          .from('saved_listings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Fetch AI analyses count
        const { count: aiCount } = await supabase
          .from('ai_history')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Fetch user activity log for streaks (if table exists)
        // For now, we'll use dummy data or calculate from existing data
        const currentStreak = calculateStreak(user.id);

        setActivity({
          savedListings: savedCount || 0,
          aiAnalysesRun: aiCount || 0,
          listingsViewed: 0, // Would need view tracking
          daysActive: Math.max(1, Math.floor((Date.now() - new Date((user as any).created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24))),
          currentStreak: currentStreak || 1,
          longestStreak: currentStreak || 1,
          lastActiveDate: new Date().toISOString(),
        });

        // Calculate achievements
        const calculatedAchievements = calculateAchievements({
          savedListings: savedCount || 0,
          aiAnalysesRun: aiCount || 0,
          listingsViewed: 0,
          daysActive: Math.max(1, Math.floor((Date.now() - new Date((user as any).created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24))),
          currentStreak: currentStreak || 1,
          longestStreak: currentStreak || 1,
          lastActiveDate: new Date().toISOString(),
        });

        setAchievements(calculatedAchievements);
      } catch (error) {
        console.error('Error fetching activity data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, [user]);

  const calculateStreak = (userId: string): number => {
    // Simplified streak calculation
    // In production, this would check a user_activity_log table
    return 1;
  };

  const calculateAchievements = (activity: UserActivity): Achievement[] => {
    return [
      // Saving Achievements
      {
        id: 'first_save',
        name: 'Getting Started',
        description: 'Save your first listing',
        icon: 'bookmark',
        unlocked: activity.savedListings >= 1,
        progress: Math.min(activity.savedListings, 1),
        target: 1,
        points: 50,
        tier: 1,
      },
      {
        id: 'collector',
        name: 'Collector',
        description: 'Save 10 listings',
        icon: 'collection',
        unlocked: activity.savedListings >= 10,
        progress: Math.min(activity.savedListings, 10),
        target: 10,
        points: 100,
        tier: 2,
      },
      {
        id: 'curator',
        name: 'Curator',
        description: 'Save 50 listings',
        icon: 'library',
        unlocked: activity.savedListings >= 50,
        progress: Math.min(activity.savedListings, 50),
        target: 50,
        points: 250,
        tier: 3,
      },
      {
        id: 'portfolio_master',
        name: 'Portfolio Master',
        description: 'Save 100 listings',
        icon: 'library',
        unlocked: activity.savedListings >= 100,
        progress: Math.min(activity.savedListings, 100),
        target: 100,
        points: 500,
        tier: 3,
      },
      // AI Analysis Achievements
      {
        id: 'ai_explorer',
        name: 'AI Explorer',
        description: 'Run your first AI analysis',
        icon: 'ai',
        unlocked: activity.aiAnalysesRun >= 1,
        progress: Math.min(activity.aiAnalysesRun, 1),
        target: 1,
        points: 50,
        tier: 1,
      },
      {
        id: 'analyst',
        name: 'Analyst',
        description: 'Run 25 AI analyses',
        icon: 'chart',
        unlocked: activity.aiAnalysesRun >= 25,
        progress: Math.min(activity.aiAnalysesRun, 25),
        target: 25,
        points: 200,
        tier: 2,
      },
      {
        id: 'strategist',
        name: 'Strategist',
        description: 'Run 50 AI analyses',
        icon: 'chart',
        unlocked: activity.aiAnalysesRun >= 50,
        progress: Math.min(activity.aiAnalysesRun, 50),
        target: 50,
        points: 350,
        tier: 3,
      },
      {
        id: 'data_scientist',
        name: 'Data Scientist',
        description: 'Run 100 AI analyses',
        icon: 'science',
        unlocked: activity.aiAnalysesRun >= 100,
        progress: Math.min(activity.aiAnalysesRun, 100),
        target: 100,
        points: 500,
        tier: 3,
      },
      // Engagement Achievements
      {
        id: 'active_member',
        name: 'Active Member',
        description: 'Return to the platform for 3 days',
        icon: 'calendar',
        unlocked: activity.daysActive >= 3,
        progress: Math.min(activity.daysActive, 3),
        target: 3,
        points: 50,
        tier: 1,
      },
      {
        id: 'veteran',
        name: 'Veteran',
        description: 'Member for 30 days',
        icon: 'calendar',
        unlocked: activity.daysActive >= 30,
        progress: Math.min(activity.daysActive, 30),
        target: 30,
        points: 150,
        tier: 2,
      },
      {
        id: 'long_term_member',
        name: 'Long-Term Member',
        description: 'Member for 90 days',
        icon: 'calendar',
        unlocked: activity.daysActive >= 90,
        progress: Math.min(activity.daysActive, 90),
        target: 90,
        points: 400,
        tier: 3,
      },
      // Streak Achievements
      {
        id: 'consistency',
        name: 'Consistent',
        description: 'Active for 7 days in a row',
        icon: 'streak',
        unlocked: activity.currentStreak >= 7,
        progress: Math.min(activity.currentStreak, 7),
        target: 7,
        points: 75,
        tier: 1,
      },
      {
        id: 'dedicated',
        name: 'Dedicated',
        description: 'Active for 30 days in a row',
        icon: 'star',
        unlocked: activity.currentStreak >= 30,
        progress: Math.min(activity.currentStreak, 30),
        target: 30,
        points: 300,
        tier: 2,
      },
      {
        id: 'unstoppable',
        name: 'Unstoppable',
        description: 'Active for 90 days in a row',
        icon: 'star',
        unlocked: activity.currentStreak >= 90,
        progress: Math.min(activity.currentStreak, 90),
        target: 90,
        points: 600,
        tier: 3,
      },
    ];
  };

  const getAchievementIcon = (iconType: string, unlocked: boolean) => {
    const colorClass = unlocked ? 'text-gold' : 'text-neutral-600';

    switch (iconType) {
      case 'bookmark':
        return (
          <svg className={`w-6 h-6 ${colorClass}`} fill={unlocked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        );
      case 'collection':
        return (
          <svg className={`w-6 h-6 ${colorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case 'library':
        return (
          <svg className={`w-6 h-6 ${colorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
        );
      case 'ai':
        return (
          <svg className={`w-6 h-6 ${colorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'chart':
        return (
          <svg className={`w-6 h-6 ${colorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'science':
        return (
          <svg className={`w-6 h-6 ${colorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case 'streak':
        return (
          <svg className={`w-6 h-6 ${colorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'star':
        return (
          <svg className={`w-6 h-6 ${colorClass}`} fill={unlocked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      case 'calendar':
        return (
          <svg className={`w-6 h-6 ${colorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getUserLevel = () => {
    const totalPoints =
      activity.savedListings * 10 +
      activity.aiAnalysesRun * 25 +
      activity.currentStreak * 5;

    if (totalPoints >= 1000) return {
      level: 'Elite',
      color: 'from-purple-500 to-pink-500',
      points: totalPoints,
      nextLevel: null,
      nextLevelPoints: null,
      progress: 100
    };
    if (totalPoints >= 500) return {
      level: 'Expert',
      color: 'from-gold to-yellow-400',
      points: totalPoints,
      nextLevel: 'Elite',
      nextLevelPoints: 1000,
      progress: ((totalPoints - 500) / (1000 - 500)) * 100
    };
    if (totalPoints >= 200) return {
      level: 'Intermediate',
      color: 'from-blue-500 to-cyan-500',
      points: totalPoints,
      nextLevel: 'Expert',
      nextLevelPoints: 500,
      progress: ((totalPoints - 200) / (500 - 200)) * 100
    };
    if (totalPoints >= 50) return {
      level: 'Beginner',
      color: 'from-green-500 to-emerald-500',
      points: totalPoints,
      nextLevel: 'Intermediate',
      nextLevelPoints: 200,
      progress: ((totalPoints - 50) / (200 - 50)) * 100
    };
    return {
      level: 'Newbie',
      color: 'from-gray-500 to-gray-600',
      points: totalPoints,
      nextLevel: 'Beginner',
      nextLevelPoints: 50,
      progress: (totalPoints / 50) * 100
    };
  };

  const userLevel = getUserLevel();
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  // Get relevant achievements to display (only show next tier to work on)
  const getRelevantAchievements = (): Achievement[] => {
    if (showAllAchievements) return achievements;

    // Group achievements by category
    const saveAchievements = achievements.filter(a =>
      a.id.includes('save') || a.id.includes('collector') || a.id.includes('curator') || a.id.includes('portfolio')
    );
    const aiAchievements = achievements.filter(a =>
      a.id.includes('ai') || a.id.includes('analyst') || a.id.includes('scientist') || a.id.includes('strategist')
    );
    const engagementAchievements = achievements.filter(a =>
      a.id.includes('active_member') || a.id.includes('veteran') || a.id.includes('long_term')
    );
    const streakAchievements = achievements.filter(a =>
      a.id.includes('consistency') || a.id.includes('dedicated') || a.id.includes('unstoppable')
    );

    const relevant: Achievement[] = [];

    // For each category, show the lowest incomplete achievement (or highest complete if all done)
    [saveAchievements, aiAchievements, engagementAchievements, streakAchievements].forEach(category => {
      const incomplete = category.find(a => !a.unlocked);
      if (incomplete) {
        relevant.push(incomplete);
      } else if (category.length > 0) {
        // All complete, show the highest one
        relevant.push(category[category.length - 1]);
      }
    });

    return relevant.slice(0, 4);
  };

  if (loading) {
    return (
      <div className="glass p-6 border border-gold/20 rounded-luxury">
        <div className="text-center text-neutral-400">Loading activity...</div>
      </div>
    );
  }

  if (compact) {
    // Compact view for dashboard
    return (
      <div className="glass p-6 border border-gold/20 rounded-luxury">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Your Progress</h3>
          <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${userLevel.color} text-white text-sm font-medium`}>
            {userLevel.level}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gold mb-1">{activity.currentStreak}</div>
            <div className="text-xs text-neutral-400">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gold mb-1">{unlockedCount}/{achievements.length}</div>
            <div className="text-xs text-neutral-400">Achievements</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gold mb-1">{userLevel.points}</div>
            <div className="text-xs text-neutral-400">Points</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {achievements.filter(a => a.unlocked).slice(0, 6).map((achievement) => (
            <div key={achievement.id} className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center border border-gold/30">
              {getAchievementIcon(achievement.icon, true)}
            </div>
          ))}
          {unlockedCount > 6 && (
            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-600 text-xs text-neutral-400">
              +{unlockedCount - 6}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full view for profile page
  return (
    <div className="space-y-6">
      {/* User Level Card */}
      <div className="glass p-8 border border-gold/20 rounded-luxury">
        <div className="text-center mb-6">
          <div className={`inline-block px-8 py-3 rounded-full bg-gradient-to-r ${userLevel.color} text-white text-2xl font-bold mb-4`}>
            {userLevel.level}
          </div>
          <div className="text-neutral-400 text-lg font-medium mb-4">{userLevel.points} Points</div>

          {/* Progress to next level */}
          {userLevel.nextLevel && (
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between text-sm text-neutral-400 mb-2">
                <span>Progress to {userLevel.nextLevel}</span>
                <span>{userLevel.points} / {userLevel.nextLevelPoints}</span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-3">
                <div
                  className={`h-3 rounded-full bg-gradient-to-r ${userLevel.color} transition-all duration-500`}
                  style={{ width: `${Math.min(userLevel.progress, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                {userLevel.nextLevelPoints - userLevel.points} points until {userLevel.nextLevel}
              </p>
            </div>
          )}
          {!userLevel.nextLevel && (
            <p className="text-gold font-medium">Maximum level reached!</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="text-center p-4 bg-charcoal/30 rounded-lg">
            <div className="text-3xl font-bold text-gold mb-2">{activity.currentStreak}</div>
            <div className="text-sm text-neutral-400">Day Streak</div>
            <div className="text-xs text-neutral-500 mt-1">+5 pts/day</div>
          </div>
          <div className="text-center p-4 bg-charcoal/30 rounded-lg">
            <div className="text-3xl font-bold text-gold mb-2">{activity.aiAnalysesRun}</div>
            <div className="text-sm text-neutral-400">AI Analyses</div>
            <div className="text-xs text-neutral-500 mt-1">+25 pts each</div>
          </div>
          <div className="text-center p-4 bg-charcoal/30 rounded-lg">
            <div className="text-3xl font-bold text-gold mb-2">{activity.savedListings}</div>
            <div className="text-sm text-neutral-400">Saved Listings</div>
            <div className="text-xs text-neutral-500 mt-1">+10 pts each</div>
          </div>
        </div>
      </div>

      {/* Tier Requirements */}
      <div className="glass p-8 border border-gold/20 rounded-luxury">
        <h3 className="text-2xl font-semibold text-white mb-6 text-center">All Tiers</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 max-w-5xl mx-auto">
          <div className="text-center p-4 bg-charcoal/30 rounded-lg border-2 border-gray-500/30">
            <div className="text-xl font-bold text-gray-400 mb-2">Newbie</div>
            <div className="text-sm text-neutral-400">0 - 49 pts</div>
          </div>
          <div className="text-center p-4 bg-charcoal/30 rounded-lg border-2 border-green-500/30">
            <div className="text-xl font-bold text-green-400 mb-2">Beginner</div>
            <div className="text-sm text-neutral-400">50 - 199 pts</div>
          </div>
          <div className="text-center p-4 bg-charcoal/30 rounded-lg border-2 border-blue-500/30">
            <div className="text-xl font-bold text-blue-400 mb-2">Intermediate</div>
            <div className="text-sm text-neutral-400">200 - 499 pts</div>
          </div>
          <div className="text-center p-4 bg-charcoal/30 rounded-lg border-2 border-gold/30">
            <div className="text-xl font-bold text-gold mb-2">Expert</div>
            <div className="text-sm text-neutral-400">500 - 999 pts</div>
          </div>
          <div className="text-center p-4 bg-charcoal/30 rounded-lg border-2 border-purple-500/30">
            <div className="text-xl font-bold text-purple-400 mb-2">Elite</div>
            <div className="text-sm text-neutral-400">1000+ pts</div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="glass p-8 border border-gold/20 rounded-luxury">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-white">Achievements</h3>
          <span className="text-gold font-medium">{unlockedCount} / {achievements.length} Unlocked</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getRelevantAchievements().map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-luxury border transition-all ${
                achievement.unlocked
                  ? 'bg-gold/10 border-gold/30'
                  : 'bg-neutral-900/30 border-neutral-700'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  achievement.unlocked ? 'bg-gold/20' : 'bg-neutral-800'
                }`}>
                  {getAchievementIcon(achievement.icon, achievement.unlocked)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className={`font-semibold ${achievement.unlocked ? 'text-white' : 'text-neutral-500'}`}>
                      {achievement.name}
                    </h4>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ml-2 flex-shrink-0 ${
                      achievement.unlocked
                        ? 'bg-gold/20 text-gold'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      +{achievement.points} pts
                    </span>
                  </div>
                  <p className="text-sm text-neutral-400 mb-2">{achievement.description}</p>
                  {!achievement.unlocked && achievement.progress !== undefined && achievement.target !== undefined && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-500">Progress</span>
                        <span className="text-neutral-400">{achievement.progress} / {achievement.target}</span>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-2">
                        <div
                          className="bg-gold/50 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        {!showAllAchievements && achievements.length > getRelevantAchievements().length && (
          <div className="text-center mt-6">
            <button
              onClick={() => setShowAllAchievements(true)}
              className="px-4 py-2 text-xs border border-gold/20 text-neutral-400 font-medium rounded hover:border-gold/50 hover:text-gold transition-all"
            >
              View All {achievements.length} Achievements
            </button>
          </div>
        )}

        {showAllAchievements && (
          <div className="text-center mt-6">
            <button
              onClick={() => setShowAllAchievements(false)}
              className="px-4 py-2 text-xs border border-gold/20 text-neutral-400 font-medium rounded hover:border-gold/50 hover:text-gold transition-all"
            >
              Show Less
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
