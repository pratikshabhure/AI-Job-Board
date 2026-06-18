import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Navbar from '../../components/common/Navbar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { jobsAPI } from '../../services/api';

const JobForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    if (isEdit) {
      fetchJob();
    }
  }, [id]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getById(id);
      const job = response.data;
      
      // Set form values
      Object.keys(job).forEach(key => {
        setValue(key, job[key]);
      });
    } catch (err) {
      setError('Failed to load job data');
      console.error('Job fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitLoading(true);
      setError(null);
      
      if (isEdit) {
        await jobsAPI.update(id, data);
      } else {
        await jobsAPI.create(data);
      }
      
      navigate('/admin/jobs');
    } catch (err) {
      setError(isEdit ? 'Failed to update job' : 'Failed to create job');
      console.error('Job submit error:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size="large" message="Loading job..." />;

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Job' : 'Post New Job'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEdit ? 'Update job listing details' : 'Create a new job listing'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="card p-8 max-w-4xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                {...register('title', { required: 'Job title is required' })}
                className="input-field"
                placeholder="e.g. Senior Python Backend Developer"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                {...register('company_name', { required: 'Company name is required' })}
                className="input-field"
                placeholder="e.g. HealthTech Solutions"
              />
              {errors.company_name && (
                <p className="mt-1 text-sm text-red-600">{errors.company_name.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                rows={4}
                {...register('description', { required: 'Job description is required' })}
                className="input-field"
                placeholder="Describe the role, responsibilities, and requirements..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Required Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Skills *
              </label>
              <input
                type="text"
                {...register('required_skills', { required: 'Required skills are required' })}
                className="input-field"
                placeholder="e.g. Python, FastAPI, PostgreSQL, Docker, AWS"
              />
              <p className="mt-1 text-sm text-gray-500">
                Separate skills with commas
              </p>
              {errors.required_skills && (
                <p className="mt-1 text-sm text-red-600">{errors.required_skills.message}</p>
              )}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Experience Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level *
                </label>
                <select
                  {...register('experience_level', { required: 'Experience level is required' })}
                  className="input-field"
                >
                  <option value="">Select experience level</option>
                  <option value="Entry">Entry Level</option>
                  <option value="Mid">Mid Level</option>
                  <option value="Senior">Senior Level</option>
                </select>
                {errors.experience_level && (
                  <p className="mt-1 text-sm text-red-600">{errors.experience_level.message}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  {...register('location', { required: 'Location is required' })}
                  className="input-field"
                  placeholder="e.g. Pune, Remote"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>

              {/* Domain */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domain *
                </label>
                <input
                  type="text"
                  {...register('domain', { required: 'Domain is required' })}
                  className="input-field"
                  placeholder="e.g. Healthcare, Fintech, E-commerce"
                />
                {errors.domain && (
                  <p className="mt-1 text-sm text-red-600">{errors.domain.message}</p>
                )}
              </div>

              {/* Role Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Type *
                </label>
                <select
                  {...register('role_type', { required: 'Role type is required' })}
                  className="input-field"
                >
                  <option value="">Select role type</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="ML Engineer">ML Engineer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="Other">Other</option>
                </select>
                {errors.role_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.role_type.message}</p>
                )}
              </div>
            </div>

            {/* Status (only for edit) */}
            {isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Status
                </label>
                <select
                  {...register('status')}
                  className="input-field"
                >
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex space-x-4 pt-6">
              <button
                type="submit"
                disabled={submitLoading}
                className="btn-primary flex items-center"
              >
                {submitLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                {isEdit ? 'Update Job' : 'Post Job'}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/admin/jobs')}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobForm;