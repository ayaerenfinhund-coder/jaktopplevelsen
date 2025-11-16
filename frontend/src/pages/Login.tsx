import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import Button from '../components/common/Button';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await authService.signIn(email, password);
        toast.success('Velkommen tilbake!');
      } else {
        await authService.register(email, password, name);
        toast.success('Konto opprettet!');
      }
      navigate('/');
    } catch (error: any) {
      console.error('Auth error:', error);
      if (error.code === 'auth/user-not-found') {
        toast.error('Ingen bruker funnet med denne e-posten');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Feil passord');
      } else if (error.code === 'auth/email-already-in-use') {
        toast.error('E-posten er allerede i bruk');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Passordet må være minst 6 tegn');
      } else {
        toast.error(error.message || 'En feil oppstod');
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

        {/* Skjema */}
        <div className="card p-6">
          <div className="flex mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-center font-medium border-b-2 transition-colors ${
                isLogin
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              Logg inn
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-center font-medium border-b-2 transition-colors ${
                !isLogin
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              Registrer
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="input-label">Navn</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ditt navn"
                    className="input pl-10"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="input-label">E-post</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="din@epost.no"
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="input-label">Passord</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-10 pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-text-muted">
                  <input type="checkbox" className="checkbox" />
                  Husk meg
                </label>
                <button
                  type="button"
                  className="text-sm text-primary-400 hover:text-primary-300"
                >
                  Glemt passord?
                </button>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isLoading}
            >
              {isLogin ? 'Logg inn' : 'Opprett konto'}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-text-muted text-sm mt-6">
          Ved å {isLogin ? 'logge inn' : 'registrere deg'} godtar du våre{' '}
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
