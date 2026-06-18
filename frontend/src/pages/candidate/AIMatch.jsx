import React, { useState } from 'react';
import Navbar from '../../components/common/Navbar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { useUser } from '../../hooks/useUser';
import { aiAPI, applicationsAPI } from '../../services/api';

const AIMatch = () => {
  const { user } = useUser();
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState({});
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter your job preferences');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);
      
      const response = await aiAPI.matchJobs({
        query: query.trim(),
        candidate_id: user?.id ?? null
      });
      
      setMatches(response.data);
    } catch (err) {
      const message = err.response?.data?.detail
        || (err.message === 'Network Error' ? 'Cannot reach the server. Make sure the backend is running on port 8000.' : null)
        || 'Failed to find job matches. Please try again.';
      setError(message);
      console.error('AI matching error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    try {
      setApplying(prev => ({ ...prev, [jobId]: true }));
      
      await applicationsAPI.create({
        candidate_id: user.id,
        job_id: jobId
      });
      
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

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Job Matching</h1>
          <p className="text-gray-600 mt-2">
            Describe your ideal job in natural language and get personalized matches
          </p>
        </div>

        {/* Search Form */}
        <div className="card p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe your ideal job
              </label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={4}
                className="input-field"
                placeholder="E.g., I want a Python backend role in a startup that does healthcare and allows Pune or remote work..."
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-500">
                  Be specific about skills, location, domain, experience level, and role type
                </p>
                <span className="text-sm text-gray-400">
                  {query.length}/500
                </span>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="btn-primary flex items-center"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {loading ? 'Finding Matches...' : 'Find Job Matches'}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <LoadingSpinner size="large" message="Analyzing your preferences and matching jobs..." />
            <p className="text-sm text-gray-500 mt-4">
              This may take a few seconds while our AI processes your request
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && hasSearched && (
          <div>
            {matches.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    High-Quality Matches ({matches.length})
                  </h2>
                  <p className="text-sm text-gray-500">
                    Showing best matches (30%+ compatibility)
                  </p>
                </div>

                <div className="space-y-6">
                  {matches.map((match, index) => (
                    <div key={match.job.id} className="card p-6 hover:shadow-lg transition-shadow">
                      {/* Match Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <div className="mr-4">
                            <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">
                              {match.job.title}
                            </h3>
                            <p className="text-gray-600">{match.job.company_name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(match.score)}`}>
                            {match.score}% Match
                          </div>
                          <StatusBadge status={match.job.status} type="job" />
                        </div>
                      </div>

                      {/* AI Explanation */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-blue-800">
                              <strong>AI Analysis:</strong> {match.explanation}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Job Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {match.job.location}
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {match.job.experience_level} Level • {match.job.role_type}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            {match.job.domain}
                          </div>
                        </div>
                      </div>

                      {/* Matched Skills */}
                      {match.matched_skills.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Your Matching Skills</h4>
                          <div className="flex flex-wrap">
                            {match.matched_skills.map(skill => (
                              <span key={skill} className="inline-block bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm mr-2 mb-2">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* All Required Skills */}
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">All Required Skills</h4>
                        <div className="flex flex-wrap">
                          {match.job.required_skills.split(',').map(skill => {
                            const isMatched = match.matched_skills.includes(skill.trim().toLowerCase());
                            return (
                              <span 
                                key={skill} 
                                className={`inline-block rounded-full px-3 py-1 text-sm mr-2 mb-2 ${
                                  isMatched 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {skill.trim()}
                                {isMatched && ' ✓'}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Job Description */}
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Job Description</h4>
                        <p className="text-gray-700 text-sm">{match.job.description}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-between items-center pt-4 border-t">
                        <div className="text-sm text-gray-500">
                          Match Score: {match.score}/100
                        </div>
                        
                        <button
                          onClick={() => handleApply(match.job.id)}
                          disabled={applying[match.job.id]}
                          className="btn-primary flex items-center"
                        >
                          {applying[match.job.id] && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          )}
                          {applying[match.job.id] ? 'Applying...' : 'Apply Now'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.239 0-4.3-.613-6.1-1.687m7.546-11.313A8.003 8.003 0 00 12 21c4.418 0 8-3.582 8-8s-3.582-8-8-8" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No high-quality matches found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  We couldn't find matching jobs for your query. Try being more specific about your skills or broaden your location/domain preferences.
                </p>
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <p><strong>Tips for better matches:</strong></p>
                  <ul className="text-left max-w-md mx-auto">
                    <li>• Include specific technical skills you have</li>
                    <li>• Mention your preferred location or "remote"</li>
                    <li>• Specify your experience level (entry/mid/senior)</li>
                    <li>• Include domain preferences (healthcare, fintech, etc.)</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* How it works */}
        {!hasSearched && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">How AI Job Matching Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h4 className="font-medium mb-2">Describe Your Ideal Job</h4>
                <p className="text-sm text-gray-600">
                  Use natural language to describe your preferences: skills, location, domain, role type, and experience level.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h4 className="font-medium mb-2">AI Analysis & Scoring</h4>
                <p className="text-sm text-gray-600">
                  Our AI extracts your preferences and calculates compatibility scores using skill overlap, location match, and domain alignment.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h4 className="font-medium mb-2">High-Quality Results</h4>
                <p className="text-sm text-gray-600">
                  Get only the best matches (50%+ compatibility) with detailed AI explanations and apply directly.
                </p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tips for Better Matches</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Include specific skills: "Python, React, AWS"</p>
                <p>• Mention location preferences: "Pune, Mumbai, or remote"</p>
                <p>• Specify experience level: "mid-level" or "senior"</p>
                <p>• Include domain interests: "healthcare, fintech, startups"</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIMatch;