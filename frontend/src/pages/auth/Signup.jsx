import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authAPI } from '../../services/api';

const Signup = () => {
  const [step, setStep] = useState('signup'); // 'signup' or 'verify'
  const [email, setEmail] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const password = watch('password');

  const onSignup = async (data) => {
    try {
      setLoading(true);
      setError('');
      
      const { confirmPassword, ...signupData } = data;
      const response = await authAPI.signup(signupData);
      setEmail(data.email);
      if (response.data.otp) {
        setDevOtp(response.data.otp);
      }
      setStep('verify');
      setSuccess(response.data.message || 'Account created successfully! Please check your email for the OTP.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            AI Job Board
          </Link>
          <h2 className="text-2xl font-semibold text-gray-900 mt-4">
            {step === 'signup' ? 'Create your account' : 'Verify your email'}
          </h2>
          <p className="text-gray-600 mt-2">
            {step === 'signup' 
              ? 'Join thousands of professionals finding their perfect job match' 
              : `We sent a verification code to ${email}`
            }
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
          {step === 'signup' ? (
            <SignupForm 
              onSubmit={onSignup}
              register={register}
              handleSubmit={handleSubmit}
              errors={errors}
              loading={loading}
              error={error}
              password={password}
            />
          ) : (
            <VerifyForm 
              email={email}
              devOtp={devOtp}
              setDevOtp={setDevOtp}
              error={error}
              success={success}
              setError={setError}
              setSuccess={setSuccess}
            />
          )}
        </div>

        {/* Back to Landing */}
        <div className="text-center mt-6">
          <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

const SignupForm = ({ onSubmit, register, handleSubmit, errors, loading, error, password }) => (
  <>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Name
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
          Email Address
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
          placeholder="Enter your email"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          type="password"
          {...register('password', { 
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters'
            }
          })}
          className="input-field"
          placeholder="Create a strong password"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Confirm Password
        </label>
        <input
          type="password"
          {...register('confirmPassword', { 
            required: 'Please confirm your password',
            validate: value => value === password || 'Passwords do not match'
          })}
          className="input-field"
          placeholder="Confirm your password"
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </button>
    </form>

    <div className="mt-6 text-center">
      <p className="text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
          Sign in here
        </Link>
      </p>
    </div>
  </>
);

const VerifyForm = ({ email, devOtp, setDevOtp, error, success, setError, setSuccess }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await authAPI.verifyOTP({ email, otp });
      
      setSuccess('Email verified successfully! Redirecting...');
      
      // Store token and redirect
      const { access_token, user } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user_data', JSON.stringify(user));
      
      setTimeout(() => {
        window.location.href = user.role === 'admin' ? '/admin/dashboard' : '/candidate/dashboard';
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await authAPI.resendOTP({ email });
      if (response.data.otp) {
        setDevOtp(response.data.otp);
        setOtp(response.data.otp);
      }
      setSuccess(response.data.message || 'New OTP sent to your email!');
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-600 text-sm">{success}</p>
        </div>
      )}

      {devOtp && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center">
          <p className="text-sm text-blue-800 mb-1">Your verification code</p>
          <p className="text-3xl font-bold tracking-widest text-blue-600">{devOtp}</p>
          <p className="text-xs text-blue-600 mt-2">Enter this code below to verify your account</p>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verification Code
          </label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="input-field text-center text-2xl tracking-wider"
            placeholder="000000"
            maxLength={6}
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Verifying...
            </>
          ) : (
            'Verify Email'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Didn't receive the code?{' '}
          <button
            onClick={handleResend}
            disabled={loading}
            className="text-blue-600 hover:text-blue-700 font-medium disabled:text-blue-400"
          >
            Resend OTP
          </button>
        </p>
      </div>
    </>
  );
};

export default Signup;