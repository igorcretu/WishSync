import React from 'react';
import { useAuth } from './AuthContext';
import { auth } from './api';

type AuthScreen = 'login' | 'register' | 'forgot';

export const AuthViews: React.FC<{ initialScreen?: AuthScreen }> = ({ initialScreen = 'login' }) => {
  const [screen, setScreen] = React.useState<AuthScreen>(initialScreen);

  if (screen === 'register') return <RegisterView onSwitch={() => setScreen('login')} />;
  if (screen === 'forgot') return <ForgotPasswordView onSwitch={() => setScreen('login')} />;
  return <LoginView onSwitch={() => setScreen('register')} onForgot={() => setScreen('forgot')} />;
};

const LoginView: React.FC<{ onSwitch: () => void; onForgot: () => void }> = ({ onSwitch, onForgot }) => {
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
          <button className="auth-link" onClick={onForgot}>Forgot password?</button>
        </div>
        <div className="auth-switch">
          No account yet?{' '}
          <button className="auth-link" onClick={onSwitch}>Create one</button>
        </div>
      </div>
    </div>
  );
};

const ForgotPasswordView: React.FC<{ onSwitch: () => void }> = ({ onSwitch }) => {
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await auth.forgotPassword(email);
      setSent(true);
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
        <h1 className="auth-title">Reset your password</h1>
        <p className="auth-sub">We'll email you a link to set a new one</p>

        {sent ? (
          <div className="auth-form">
            <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.6 }}>
              If an account exists for <strong>{email}</strong>, we've sent a password reset link. Check your inbox.
            </p>
          </div>
        ) : (
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

            {error && <div className="auth-error">{error}</div>}

            <button className="btn btn-primary btn-lg auth-submit" type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        <div className="auth-switch">
          <button className="auth-link" onClick={onSwitch}>Back to sign in</button>
        </div>
      </div>
    </div>
  );
};

export const ResetPasswordView: React.FC<{ token: string; onDone: () => void }> = ({ token, onDone }) => {
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords don\'t match');
      return;
    }
    setLoading(true);
    try {
      await auth.resetPassword(token, password);
      setDone(true);
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
        <h1 className="auth-title">Choose a new password</h1>
        <p className="auth-sub">Min 8 characters</p>

        {done ? (
          <div className="auth-form">
            <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.6, marginBottom: 16 }}>
              Your password has been reset. You can sign in now.
            </p>
            <button className="btn btn-primary btn-lg auth-submit" onClick={onDone}>Back to sign in</button>
          </div>
        ) : (
          <form onSubmit={submit} className="auth-form">
            <div className="field">
              <label className="label">New password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="field">
              <label className="label">Confirm password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                minLength={8}
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button className="btn btn-primary btn-lg auth-submit" type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Reset password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const RegisterView: React.FC<{ onSwitch: () => void }> = ({ onSwitch }) => {
  const { register } = useAuth();
  const [form, setForm] = React.useState({
    name: '', nickname: '', email: '', password: '',
  });
  const [bdMonth, setBdMonth] = React.useState('');
  const [bdDay, setBdDay] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const birthday = bdMonth && bdDay ? `${bdMonth} ${bdDay.padStart(2, '0')}` : undefined;
    try {
      await register({
        email: form.email,
        password: form.password,
        name: form.name,
        nickname: form.nickname || form.name,
        birthday,
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
            <div style={{ display: 'flex', gap: 8 }}>
              <select className="input" value={bdMonth} onChange={e => setBdMonth(e.target.value)} style={{ flex: 1 }}>
                <option value="">Month</option>
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select className="input" value={bdDay} onChange={e => setBdDay(e.target.value)} style={{ width: 90 }}>
                <option value="">Day</option>
                {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
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
