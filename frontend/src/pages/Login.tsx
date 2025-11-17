import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await authService.signInWithGoogle();
      toast.success('Velkommen!');
      navigate('/');
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Innlogging avbrutt');
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Popup ble blokkert. Tillat popups for denne siden.');
      } else {
        toast.error(error.message || 'En feil oppstod ved innlogging');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-700 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg
              viewBox="0 0 24 24"
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Jaktopplevelsen</h1>
          <p className="text-text-muted mt-2">
            Logg og spor dine jaktturer med Garmin Alpha 200
          </p>
        </div>

        {/* Login Card */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-6 text-center">
            Logg inn
          </h2>

          <Button
            onClick={handleGoogleSignIn}
            variant="primary"
            fullWidth
            size="lg"
            isLoading={isLoading}
            className="flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Logg inn med Google
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-text-muted text-sm mt-6">
          Ved å logge inn godtar du våre{' '}
          <a href="#" className="text-primary-400 hover:underline">
            vilkår
          </a>{' '}
          og{' '}
          <a href="#" className="text-primary-400 hover:underline">
            personvernerklæring
          </a>
        </p>
      </div>
    </div>
  );
}
