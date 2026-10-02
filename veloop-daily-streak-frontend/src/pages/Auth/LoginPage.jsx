import { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, RotateCcw, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import AuthLayout from './AuthLayout';
import AuthField from './AuthField';
import styles from './Auth.module.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const validate = ({ email, password }) => ({
  email: !email.trim() ? 'Enter your email address.' : !EMAIL_RE.test(email.trim()) ? 'That doesn’t look like a valid email.' : '',
  password: !password ? 'Enter your password.' : '',
});

export default function LoginPage() {
  const { login, authLoading, authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const navigate = useNavigate();

  const errors = validate({ email, password });
  const show = (k) => touched[k] && errors[k];
  const touch = (k) => () => setTouched((t) => ({ ...t, [k]: true }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (errors.email) return emailRef.current?.focus();
    if (errors.password) return passwordRef.current?.focus();
    // Existing auth flow, unchanged: AuthContext.login -> navigate on success.
    const ok = await login(email.trim(), password);
    if (ok) navigate('/daily-streak', { replace: true });
  };

  return (
    <AuthLayout>
      <div className={styles.card}>
        <div className={styles.kicker}>Sign in</div>
        <h1 className={styles.title}>Welcome back.</h1>
        <p className={styles.subtitle}>Pick up where the chain left off.</p>

        {authError && (
          <div className={styles.error} role="alert" key={authError}>
            <AlertCircle size={17} />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={onSubmit} noValidate>
          <AuthField
            ref={emailRef}
            label="Email"
            icon={Mail}
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={touch('email')}
            placeholder="you@example.com"
            autoComplete="email"
            inputMode="email"
            disabled={authLoading}
            error={show('email')}
            valid={touched.email && !errors.email}
          />
          <AuthField
            ref={passwordRef}
            label="Password"
            icon={Lock}
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={touch('password')}
            placeholder="Your password"
            autoComplete="current-password"
            disabled={authLoading}
            error={show('password')}
          />
          <Button type="submit" full size="lg" disabled={authLoading} className={styles.submit}>
            {authLoading ? (
              <>
                <RotateCcw size={17} className={styles.spin} /> Logging in…
              </>
            ) : (
              'Log in'
            )}
          </Button>
        </form>

        <div className={styles.switchLine}>
          New here? <Link to="/register">Create an account</Link>
        </div>
      </div>
    </AuthLayout>
  );
}
