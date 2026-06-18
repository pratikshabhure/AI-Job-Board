import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { useUser } from '../../hooks/useUser';
import { jobsAPI, applicationsAPI } from '../../services/api';

const BrowseJobs = () => {
  const { user } = useUser();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState({});
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    skills: '',
    location: '',
    experience_level: '',
    domain: ''
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getAll({ status: 'Open' });
      setJobs(response.data);
    } catch (err) {
      setError('Failed to load jobs');
      console.error('Jobs error:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = jobs;

    if (filters.skills) {
      filtered = filtered.filter(job => 
        job.required_skills.toLowerCase().includes(filters.skills.toLowerCase())
      );
    }

    if (filters.location) {
      filtered = filtered.filter(job => 
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.experience_level) {
      filtered = filtered.filter(job => 
        job.experience_level === filters.experience_level
      );
    }

    if (filters.domain) {
      filtered = filtered.filter(job => 
        job.domain.toLowerCase().includes(filters.domain.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const clearFilters = () => {
    setFilters({
      skills: '',
      location: '',
      experience_level: '',
      domain: ''
    });
  };

  const handleApply = async (jobId) => {
    try {
      setApplying(prev => ({ ...prev, [jobId]: true }));
      
      await applicationsAPI.create({
        candidate_id: user.id,
        job_id: jobId
      });
      
      // Show success message
      alert('Application submitted successfully!');
      
    } catch (err) {
      console.error('Application error:', err);
      if (err.response?.status === 400) {
        alert(err.response.data.detail || 'You have already applied to this job');
      } else {
        alert('Failed to submit application. Please try again.');
      }
    } finally {
      setApplying(prev => ({ ...prev, [jobId]: false }));
    }
  };

  if (loading) return <LoadingSpinner size="large" message="Loading jobs..." />;

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Jobs</h1>
          <p className="text-gray-600 mt-2">
            Discover and apply to open positions ({filteredJobs.length} jobs found)
          </p>
        </div>

        {/* Filters */}
        <div className="card p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Filter Jobs</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
              <input
                type="text"
                value={filters.skills}
                onChange={(e) => handleFilterChange('skills', e.target.value)}
                className="input-field"
                placeholder="e.g. Python, React"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="input-field"
                placeholder="e.g. Pune, Remote"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
              <select
                value={filters.experience_level}
                onChange={(e) => handleFilterChange('experience_level', e.target.value)}
                className="input-field"
              >
                <option value="">All Levels</option>
                <option value="Entry">Entry Level</option>
                <option value="Mid">Mid Level</option>
                <option value="Senior">Senior Level</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
              <input
                type="text"
                value={filters.domain}
                onChange={(e) => handleFilterChange('domain', e.target.value)}
                className="input-field"
                placeholder="e.g. Healthcare, Fintech"
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <button onClick={clearFilters} className="btn-secondary">
              Clear Filters
            </button>
            <span className="text-sm text-gray-500">
              {filteredJobs.length} of {jobs.length} jobs shown
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
            <button onClick={fetchJobs} className="btn-primary mt-2">
              Retry
            </button>
          </div>
        )}

        {/* Jobs List */}
        <div className="space-y-6">
          {filteredJobs.map(job => (
            <div key={job.id} className="card p-6 hover:shadow-lg transition-shadow">
              {/* Job Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{job.title}</h3>
                  <p className="text-gray-600">{job.company_name}</p>
                </div>
                <StatusBadge status={job.status} type="job" />
              </div>

              {/* Job Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {job.location}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {job.experience_level} Level
                  </div>
                </div>

                <div>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {job.domain}
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                    {job.role_type}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>

              {/* Required Skills */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Required Skills</h4>
                <div className="flex flex-wrap">
                  {job.required_skills.split(',').map(skill => (
                    <span key={skill} className="inline-block bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm mr-2 mb-2">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-gray-500">
                  Posted on {new Date(job.created_at).toLocaleDateString()}
                </div>
                
                <button
                  onClick={() => handleApply(job.id)}
                  disabled={applying[job.id]}
                  className="btn-primary flex items-center"
                >
                  {applying[job.id] && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  )}
                  {applying[job.id] ? 'Applying...' : 'Apply Now'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredJobs.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {jobs.length === 0 
                ? 'No open positions available at the moment.'
                : 'Try adjusting your filters to see more results.'
              }
            </p>
            {Object.values(filters).some(f => f) && (
              <div className="mt-6">
                <button onClick={clearFilters} className="btn-primary">
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseJobs;