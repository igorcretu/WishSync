import React from 'react';
import { useAuth } from './AuthContext';

type AuthScreen = 'login' | 'register';

export const AuthViews: React.FC = () => {
  const [screen, setScreen] = React.useState<AuthScreen>('login');

  return screen === 'login'
    ? <LoginView onSwitch={() => setScreen('register')} />
    : <RegisterView onSwitch={() => setScreen('login')} />;
};

const LoginView: React.FC<{ onSwitch: () => void }> = ({ onSwitch }) => {
  const { login } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">
          <svg width="40" height="40" viewBox="0 0 72 72">
            <rect width="72" height="72" rx="18" fill="#2B2420"/>
            <path d="M36 36 C 26 26, 18 34, 24 42 C 28 46, 36 50, 36 50 C 36 50, 44 46, 48 42 C 54 34, 46 26, 36 36 Z" fill="#F6B89A"/>
          </svg>
          <span className="auth-brand">WishSync</span>
        </div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to your gifting world</p>

        <form onSubmit={submit} className="auth-form">
          <div className="field">
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="btn btn-primary btn-lg auth-submit" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="auth-switch">
          No account yet?{' '}
          <button className="auth-link" onClick={onSwitch}>Create one</button>
        </div>
      </div>
    </div>
  );
};

const RegisterView: React.FC<{ onSwitch: () => void }> = ({ onSwitch }) => {
  const { register } = useAuth();
  const [form, setForm] = React.useState({
    name: '', nickname: '', email: '', password: '', birthday: '',
  });
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        name: form.name,
        nickname: form.nickname || form.name,
        birthday: form.birthday || undefined,
      });
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">
          <svg width="40" height="40" viewBox="0 0 72 72">
            <rect width="72" height="72" rx="18" fill="#2B2420"/>
            <path d="M36 36 C 26 26, 18 34, 24 42 C 28 46, 36 50, 36 50 C 36 50, 44 46, 48 42 C 54 34, 46 26, 36 36 Z" fill="#F6B89A"/>
          </svg>
          <span className="auth-brand">WishSync</span>
        </div>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">Start syncing wishes with the people you love</p>

        <form onSubmit={submit} className="auth-form">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label className="label">Full name</label>
              <input className="input" placeholder="Nora" value={form.name} onChange={set('name')} required />
            </div>
            <div className="field">
              <label className="label">Nickname</label>
              <input className="input" placeholder="Nora" value={form.nickname} onChange={set('nickname')} />
            </div>
          </div>

          <div className="field">
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="you@email.com" value={form.email} onChange={set('email')} required />
          </div>

          <div className="field">
            <label className="label">Password <span style={{ fontWeight: 400, color: 'var(--ink-muted)' }}>(min 8 chars)</span></label>
            <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required minLength={8} />
          </div>

          <div className="field">
            <label className="label">Birthday <span style={{ fontWeight: 400, color: 'var(--ink-muted)' }}>(optional)</span></label>
            <input className="input" placeholder="Jun 14" value={form.birthday} onChange={set('birthday')} />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="btn btn-primary btn-lg auth-submit" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account?{' '}
          <button className="auth-link" onClick={onSwitch}>Sign in</button>
        </div>
      </div>
    </div>
  );
};
