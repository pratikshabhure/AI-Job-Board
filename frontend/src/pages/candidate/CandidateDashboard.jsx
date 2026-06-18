import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { useUser } from '../../hooks/useUser';
import { jobsAPI, candidatesAPI } from '../../services/api';

const CandidateDashboard = () => {
  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch candidate profile if exists
      try {
        const profileResponse = await candidatesAPI.getById(user.id);
        setProfile(profileResponse.data);
      } catch (err) {
        // Profile doesn't exist yet
        setProfile(null);
      }
      
      // Fetch recent jobs
      const jobsResponse = await jobsAPI.getAll({ limit: 6, status: 'Open' });
      setRecentJobs(jobsResponse.data);
      
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size="large" message="Loading dashboard..." />;

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.name}!</h1>
          <p className="text-gray-600 mt-2">
            {profile 
              ? 'Ready to find your next opportunity?' 
              : 'Complete your profile to start matching with jobs.'}
          </p>
        </div>

        {/* Profile Status */}
        {!profile ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Profile Incomplete
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Complete your candidate profile to start using AI-powered job matching and apply to jobs.</p>
                </div>
                <div className="mt-4">
                  <Link to="/candidate/profile" className="btn-primary">
                    Complete Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Profile Complete</h3>
                <p className="text-sm text-green-700 mt-1">
                  Your profile is ready. You can now use AI matching and apply to jobs.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link 
            to="/candidate/profile" 
            className="card p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="font-medium">
                  {profile ? 'Edit Profile' : 'Create Profile'}
                </h4>
                <p className="text-sm text-gray-600">
                  {profile ? 'Update your information' : 'Complete your profile'}
                </p>
              </div>
            </div>
          </Link>

          <Link 
            to="/candidate/ai-match" 
            className={`card p-6 transition-shadow ${
              profile ? 'hover:shadow-lg' : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="font-medium">AI Job Matching</h4>
                <p className="text-sm text-gray-600">Find perfect job matches</p>
              </div>
            </div>
          </Link>

          <Link to="/candidate/jobs" className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="font-medium">Browse Jobs</h4>
                <p className="text-sm text-gray-600">View all open positions</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Jobs */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Recent Job Openings</h2>
            <Link to="/candidate/jobs" className="text-primary-600 hover:text-primary-700 text-sm">
              View All →
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600">{error}</p>
              <button onClick={fetchDashboardData} className="btn-primary mt-2">
                Retry
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentJobs.slice(0, 6).map(job => (
              <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">{job.title}</h3>
                  <StatusBadge status={job.status} type="job" />
                </div>
                <p className="text-sm text-gray-600 mb-2">{job.company_name}</p>
                <p className="text-sm text-gray-500 mb-3">{job.location}</p>
                
                <div className="flex flex-wrap mb-3">
                  {job.required_skills.split(',').slice(0, 3).map(skill => (
                    <span key={skill} className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs mr-1 mb-1">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{job.experience_level} • {job.domain}</span>
                  <Link 
                    to={`/candidate/jobs`} 
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {recentJobs.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs available</h3>
              <p className="mt-1 text-sm text-gray-500">Check back later for new opportunities.</p>
            </div>
          )}
        </div>

        {/* Profile Summary */}
        {profile && (
          <div className="mt-8 card p-6">
            <h2 className="text-xl font-semibold mb-4">Your Profile Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Skills</h4>
                <div className="flex flex-wrap">
                  {profile.skills.split(',').slice(0, 5).map(skill => (
                    <span key={skill} className="inline-block bg-blue-100 rounded-full px-2 py-1 text-xs mr-1 mb-1">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Preferences</h4>
                <p className="text-sm text-gray-600">
                  {profile.preferred_role_type} • {profile.preferred_location}
                </p>
                <p className="text-sm text-gray-600">
                  {profile.domain_interest} • {profile.experience_level}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/candidate/profile" className="btn-secondary">
                Edit Profile
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDashboard;