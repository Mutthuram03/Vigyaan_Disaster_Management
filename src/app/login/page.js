'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useAuthContext } from '../../contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, signup, loginWithGoogle, loginAsGuest, loading, error } = useAuth();
  const { user } = useAuthContext();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Redirect if user is already logged in
  if (user) {
    router.push('/map');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSignup && password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      if (isSignup) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      router.push('/map');
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      router.push('/map');
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const handleGuestLogin = async () => {
    try {
      await loginAsGuest();
      router.push('/map');
    } catch (error) {
      console.error('Guest login error:', error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
    }}>
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '20px',
        padding: '2.5rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        width: '100%',
        maxWidth: '450px'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          marginBottom: '1.5rem',
          color: '#1e293b',
          textAlign: 'center'
        }}>
          {isSignup ? '👤 Create Account' : '👤 Welcome Back'}
        </h2>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: '#dc2626',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '0.875rem',
            borderRadius: '12px',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s',
            border: '2px solid #d1d5db',
            background: '#ffffff',
            color: '#374151',
            marginBottom: '1rem',
            opacity: loading ? 0.6 : 1
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: '0.5rem' }}>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? 'Loading...' : 'Continue with Google'}
        </button>

        {/* Guest Login Button */}
        <button
          onClick={handleGuestLogin}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '0.875rem',
            borderRadius: '12px',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s',
            border: '2px solid #d1d5db',
            background: '#f3f4f6',
            color: '#374151',
            marginBottom: '1.5rem',
            opacity: loading ? 0.6 : 1
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }
          }}
        >
          👤 {loading ? 'Loading...' : 'Continue as Guest'}
        </button>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '1.5rem 0',
          color: '#6b7280'
        }}>
          <div style={{ flex: 1, height: '1px', background: '#d1d5db' }}></div>
          <span style={{ padding: '0 1rem', fontSize: '0.875rem' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: '#d1d5db' }}></div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: '0.875rem',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              fontSize: '0.875rem',
              width: '100%',
              boxSizing: 'border-box',
              transition: 'border-color 0.3s, box-shadow 0.3s'
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: '0.875rem',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              fontSize: '0.875rem',
              width: '100%',
              boxSizing: 'border-box',
              transition: 'border-color 0.3s, box-shadow 0.3s'
            }}
          />
          {isSignup && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{
                padding: '0.875rem',
                borderRadius: '12px',
                border: '2px solid #e5e7eb',
                fontSize: '0.875rem',
                width: '100%',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s, box-shadow 0.3s'
              }}
            />
          )}
          <button 
            type="submit" 
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '0.875rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              width: '100%',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              opacity: loading ? 0.6 : 1
            }}
            disabled={loading}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }
            }}
          >
            {loading ? 'Loading...' : (isSignup ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: '#64748b'
        }}>
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setIsSignup(!isSignup);
              setEmail('');
              setPassword('');
              setConfirmPassword('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#10b981',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}
          >
            {isSignup ? 'Sign in here' : 'Sign up here'}
          </button>
        </div>
      </div>
    </div>
  );
}
