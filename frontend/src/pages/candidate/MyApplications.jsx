import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { useUser } from '../../hooks/useUser';
import { applicationsAPI } from '../../services/api';

const MyApplications = () => {
  const { user } = useUser();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await applicationsAPI.getMyApplications();
      setApplications(response.data);
    } catch (err) {
      setError('Failed to load applications');
      console.error('Applications error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'shortlisted':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      case 'rejected':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getNextSteps = (status) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return 'Your application is being reviewed by the hiring team.';
      case 'shortlisted':
        return 'Congratulations! You\'ve been shortlisted. Expect to hear from the hiring team soon.';
      case 'rejected':
        return 'Unfortunately, you were not selected for this position. Keep applying to other opportunities!';
      default:
        return '';
    }
  };

  if (loading) return <LoadingSpinner size="large" message="Loading your applications..." />;

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600 mt-2">
            Track the status of your job applications ({applications.length} total)
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
            <button onClick={fetchMyApplications} className="btn-primary mt-2">
              Retry
            </button>
          </div>
        )}

        {/* Application Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {applications.filter(app => app.status === 'Applied').length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Applied</div>
          </div>
          
          <div className="card p-6 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {applications.filter(app => app.status === 'Shortlisted').length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Shortlisted</div>
          </div>
          
          <div className="card p-6 text-center">
            <div className="text-2xl font-bold text-red-600">
              {applications.filter(app => app.status === 'Rejected').length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Rejected</div>
          </div>
          
          <div className="card p-6 text-center">
            <div className="text-2xl font-bold text-gray-600">
              {applications.length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total</div>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-6">
          {applications.map(application => (
            <div key={application.id} className="card p-6 hover:shadow-lg transition-shadow">
              {/* Application Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="mr-4">
                    {getStatusIcon(application.status)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {application.job.title}
                    </h3>
                    <p className="text-gray-600">{application.job.company_name}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <StatusBadge status={application.status} type="application" />
                  <p className="text-sm text-gray-500 mt-1">
                    Applied on {new Date(application.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Job Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {application.job.location}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Job Status: <StatusBadge status={application.job.status} type="job" className="ml-2" />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Required Skills</h4>
                  <div className="flex flex-wrap">
                    {application.job.required_skills.split(',').slice(0, 4).map(skill => (
                      <span key={skill} className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs mr-1 mb-1">
                        {skill.trim()}
                      </span>
                    ))}
                    {application.job.required_skills.split(',').length > 4 && (
                      <span className="text-xs text-gray-500 py-1">
                        +{application.job.required_skills.split(',').length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Information */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Next Steps</h4>
                    <p className="text-sm text-gray-600">{getNextSteps(application.status)}</p>
                  </div>
                </div>
              </div>

              {/* Timeline/Progress */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      ['Applied', 'Shortlisted', 'Rejected'].includes(application.status) 
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-900">Applied</span>
                    
                    <div className={`w-8 h-0.5 ${
                      ['Shortlisted', 'Rejected'].includes(application.status) 
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                    }`}></div>
                    
                    <div className={`w-3 h-3 rounded-full ${
                      application.status === 'Shortlisted' 
                        ? 'bg-yellow-500' 
                        : application.status === 'Rejected'
                        ? 'bg-red-500'
                        : 'bg-gray-300'
                    }`}></div>
                    <span className="text-sm text-gray-600">
                      {application.status === 'Applied' ? 'Under Review' : application.status}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Application #{application.id}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {applications.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No applications yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start browsing jobs and apply to positions that interest you.
            </p>
            <div className="mt-6 space-x-4">
              <button 
                onClick={() => window.location.href = '/candidate/jobs'}
                className="btn-primary"
              >
                Browse Jobs
              </button>
              <button 
                onClick={() => window.location.href = '/candidate/ai-match'}
                className="btn-secondary"
              >
                Try AI Matching
              </button>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 card p-6">
          <h3 className="text-lg font-semibold mb-4">Application Status Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <h4 className="font-medium text-blue-800">Applied</h4>
                <p className="text-sm text-gray-600">Your application has been submitted and is under review.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <h4 className="font-medium text-yellow-800">Shortlisted</h4>
                <p className="text-sm text-gray-600">You've passed the initial screening. Expect an interview invitation.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <h4 className="font-medium text-red-800">Rejected</h4>
                <p className="text-sm text-gray-600">Unfortunately, you weren't selected. Keep applying to other opportunities!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyApplications;