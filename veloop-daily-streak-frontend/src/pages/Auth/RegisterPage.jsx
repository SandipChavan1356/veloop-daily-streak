import { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, RotateCcw, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import AuthLayout from './AuthLayout';
import AuthField from './AuthField';
import styles from './Auth.module.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const validate = ({ username, email, password }) => ({
  username: username.trim().length < 3 ? 'Use at least 3 characters.' : username.trim().length > 30 ? 'Keep it under 30 characters.' : '',
  email: !email.trim() ? 'Enter your email address.' : !EMAIL_RE.test(email.trim()) ? 'That doesn’t look like a valid email.' : '',
  password: password.length < 6 ? 'Use at least 6 characters.' : '',
});

export default function RegisterPage() {
  const { register, authLoading, authError } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({});
  const refs = { username: useRef(null), email: useRef(null), password: useRef(null) };
  const navigate = useNavigate();

  const errors = validate({ username, email, password });
  const show = (k) => touched[k] && errors[k];
  const touch = (k) => () => setTouched((t) => ({ ...t, [k]: true }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setTouched({ username: true, email: true, password: true });
    const firstBad = ['username', 'email', 'password'].find((k) => errors[k]);
    if (firstBad) return refs[firstBad].current?.focus();
    // Existing auth flow, unchanged: AuthContext.register -> navigate on success.
    const ok = await register(username.trim(), email.trim(), password);
    if (ok) navigate('/daily-streak', { replace: true });
  };

  return (
    <AuthLayout>
      <div className={styles.card}>
        <div className={styles.kicker}>Create account</div>
        <h1 className={styles.title}>Start the chain.</h1>
        <p className={styles.subtitle}>One claim a day. Bigger drops as you go.</p>

        {authError && (
          <div className={styles.error} role="alert" key={authError}>
            <AlertCircle size={17} />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={onSubmit} noValidate>
          <AuthField
            ref={refs.username}
            label="Username"
            icon={User}
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={touch('username')}
            placeholder="alex"
            maxLength={30}
            autoComplete="username"
            disabled={authLoading}
            error={show('username')}
            valid={touched.username && !errors.username}
          />
          <AuthField
            ref={refs.email}
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
            ref={refs.password}
            label="Password"
            icon={Lock}
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={touch('password')}
            placeholder="Min. 6 characters"
            autoComplete="new-password"
            disabled={authLoading}
            error={show('password')}
          />
          <Button type="submit" full size="lg" disabled={authLoading} className={styles.submit}>
            {authLoading ? (
              <>
                <RotateCcw size={17} className={styles.spin} /> Creating account…
              </>
            ) : (
              'Create account'
            )}
          </Button>
        </form>

        <div className={styles.switchLine}>
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </AuthLayout>
  );
}
