
import { useState } from 'react';
import {
  Navigate,
  useNavigate,
} from 'react-router-dom';

import {
  Wallet,
  LockKeyhole,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiError } from '../api/client';

export default function LoginPage() {
  const { user, login } = useAuth();
  const { t, language, changeLanguage } = useLanguage();

  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const redirectPath = (role) =>
    role === 'admin'
      ? '/admin/dashboard'
      : '/my/dashboard';

  if (user) {
    return (
      <Navigate
        to={redirectPath(user.role)}
        replace
      />
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');

    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setSubmitting(true);

    try {
      const loggedInUser = await login(
        email.trim(),
        password
      );

      navigate(
        redirectPath(loggedInUser.role),
        { replace: true }
      );
    } catch (err) {
      setError(apiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">

        <div className="flex justify-end mb-6">
          <select
            value={language}
            onChange={(e) =>
              changeLanguage(e.target.value)
            }
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="gu">ગુજરાતી</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="flex justify-center mb-4">
          <div className="bg-indigo-600 text-white p-4 rounded-2xl">
            <Wallet size={32} />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center">
          {t('app')}
        </h1>

        <p className="text-slate-500 text-center mt-2 mb-8">
          {t('signIn')}
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-2"
            >
              {language === 'gu'
                ? 'ઈમેલ'
                : 'Email'}
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="admin@venidas.com"
              className="w-full border border-slate-300 rounded-xl p-3 outline-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2"
            >
              {t('password')}
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full border border-slate-300 rounded-xl p-3 outline-indigo-500"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="bg-red-50 text-red-700 p-3 rounded-xl text-sm"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2"
          >
            <LockKeyhole size={18} />

            {submitting
              ? t('loading')
              : t('login')}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-8">
          {t('cashOnly')}
        </p>
      </div>
    </div>
  );
}
