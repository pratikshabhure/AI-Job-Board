import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { jobsAPI, applicationsAPI } from '../../services/api';

const JobApplications = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJobAndApplications();
  }, [id]);

  const fetchJobAndApplications = async () => {
    try {
      setLoading(true);
      const [jobResponse, applicationsResponse] = await Promise.all([
        jobsAPI.getById(id),
        applicationsAPI.getByJob(id)
      ]);
      
      setJob(jobResponse.data);
      setApplications(applicationsResponse.data);
    } catch (err) {
      setError('Failed to load job applications');
      console.error('Applications error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await applicationsAPI.updateStatus(applicationId, newStatus);
      // Update local state
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
    } catch (err) {
      console.error('Status update error:', err);
      alert('Failed to update application status');
    }
  };

  const getStatusOptions = (currentStatus) => {
    const allStatuses = ['Applied', 'Shortlisted', 'Rejected'];
    return allStatuses.filter(status => status !== currentStatus);
  };

  if (loading) return <LoadingSpinner size="large" message="Loading applications..." />;

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
            <button onClick={fetchJobAndApplications} className="btn-primary mt-2">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <Link to="/admin/jobs" className="hover:text-primary-600">
              Manage Jobs
            </Link>
            <span className="mx-2">/</span>
            <span>Applications</span>
          </div>
          
          {job && (
            <>
              <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-gray-600 mt-2">
                {job.company_name} • {job.location} • <StatusBadge status={job.status} type="job" />
              </p>
              <div className="mt-4">
                <h3 className="font-medium text-gray-900">Applications ({applications.length})</h3>
              </div>
            </>
          )}
        </div>

        {/* Applications Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skills
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map(application => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {application.candidate_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.candidate_email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {application.candidate_skills.split(',').slice(0, 3).map(skill => (
                          <span key={skill} className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs mr-1 mb-1">
                            {skill.trim()}
                          </span>
                        ))}
                        {application.candidate_skills.split(',').length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{application.candidate_skills.split(',').length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(application.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={application.status} type="application" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <select
                        value={application.status}
                        onChange={(e) => handleStatusChange(application.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value={application.status}>{application.status}</option>
                        {getStatusOptions(application.status).map(status => (
                          <option key={status} value={status}>
                            Move to {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {applications.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No applications yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Candidates haven't applied to this job yet.
              </p>
            </div>
          )}
        </div>

        {/* Job Details Card */}
        {job && (
          <div className="mt-8 card p-6">
            <h3 className="text-lg font-semibold mb-4">Job Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700">Required Skills</h4>
                <div className="mt-1">
                  {job.required_skills.split(',').map(skill => (
                    <span key={skill} className="inline-block bg-blue-100 rounded-full px-2 py-1 text-xs mr-1 mb-1">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Experience Level</h4>
                <p className="text-sm text-gray-600 mt-1">{job.experience_level}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Domain</h4>
                <p className="text-sm text-gray-600 mt-1">{job.domain}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Role Type</h4>
                <p className="text-sm text-gray-600 mt-1">{job.role_type}</p>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-medium text-gray-700">Description</h4>
              <p className="text-sm text-gray-600 mt-1">{job.description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobApplications;