import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Navbar from '../../components/common/Navbar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useUser } from '../../hooks/useUser';
import { candidatesAPI } from '../../services/api';

const CandidateProfile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await candidatesAPI.getById(user.id);
      const profile = response.data;
      
      // Set form values
      Object.keys(profile).forEach(key => {
        setValue(key, profile[key] || '');
      });
      setIsEdit(true);
    } catch (err) {
      // Profile doesn't exist yet - this is normal for new users
      setIsEdit(false);
      console.log('Profile not found, creating new one');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitLoading(true);
      setError(null);
      setSuccess(false);
      
      if (isEdit) {
        await candidatesAPI.update(user.id, data);
      } else {
        const response = await candidatesAPI.create(data);
        // Update user context with new ID
        setUser(prev => ({ ...prev, id: response.data.id }));
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/candidate/dashboard');
      }, 2000);
      
    } catch (err) {
      setError(isEdit ? 'Failed to update profile' : 'Failed to create profile');
      console.error('Profile submit error:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size="large" message="Loading profile..." />;

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Profile' : 'Create Your Profile'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEdit 
              ? 'Update your information to improve job matching'
              : 'Complete your profile to start using AI-powered job matching'}
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Profile {isEdit ? 'updated' : 'created'} successfully! Redirecting to dashboard...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="card p-8 max-w-4xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Full name is required' })}
                    className="input-field"
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className="input-field"
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Technical Skills *
                  </label>
                  <input
                    type="text"
                    {...register('skills', { required: 'Skills are required' })}
                    className="input-field"
                    placeholder="e.g. Python, React, Node.js, PostgreSQL, AWS"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Separate skills with commas
                  </p>
                  {errors.skills && (
                    <p className="mt-1 text-sm text-red-600">{errors.skills.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Education *
                  </label>
                  <textarea
                    rows={3}
                    {...register('education', { required: 'Education is required' })}
                    className="input-field"
                    placeholder="e.g. B.Tech Computer Science, XYZ University, 2020"
                  />
                  {errors.education && (
                    <p className="mt-1 text-sm text-red-600">{errors.education.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Level
                    </label>
                    <select
                      {...register('experience_level')}
                      className="input-field"
                    >
                      <option value="">Select experience level</option>
                      <option value="Entry">Entry Level (0-2 years)</option>
                      <option value="Mid">Mid Level (3-5 years)</option>
                      <option value="Senior">Senior Level (6+ years)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Role Type
                    </label>
                    <select
                      {...register('preferred_role_type')}
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
                  </div>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Job Preferences</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Location
                  </label>
                  <input
                    type="text"
                    {...register('preferred_location')}
                    className="input-field"
                    placeholder="e.g. Pune, Mumbai, Remote"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Separate multiple locations with commas
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Domain Interest
                  </label>
                  <input
                    type="text"
                    {...register('domain_interest')}
                    className="input-field"
                    placeholder="e.g. Healthcare, Fintech, E-commerce"
                  />
                </div>
              </div>
            </div>

            {/* Projects */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Project Experience</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Summaries
                </label>
                <textarea
                  rows={4}
                  {...register('project_summaries')}
                  className="input-field"
                  placeholder="Describe your key projects, technologies used, and achievements..."
                />
                <p className="mt-1 text-sm text-gray-500">
                  Highlight your most relevant projects and accomplishments
                </p>
              </div>
            </div>

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
                {isEdit ? 'Update Profile' : 'Create Profile'}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/candidate/dashboard')}
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

export default CandidateProfile;