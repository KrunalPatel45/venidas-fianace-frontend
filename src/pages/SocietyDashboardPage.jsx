
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  Landmark,
  HandCoins,
  Users,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';

import { dashboardApi } from '../api/dashboard';
import { apiError } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import StatCard from '../components/StatCard';

export default function SocietyDashboardPage() {
  const { language } = useLanguage();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  async function loadDashboard(isRefresh = false) {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      const response = await dashboardApi.society();

      setDashboard(response.data.data);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await dashboardApi.society();

        if (active) {
          setDashboard(response.data.data);
        }
      } catch (err) {
        if (active) {
          setError(apiError(err));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const isGu = language === 'gu';

  const overview = dashboard?.overview || {};
  const finance = dashboard?.financial_summary || {};

  const stats = [
    {
      title: isGu ? 'કુલ ખાતાઓ' : 'Total Accounts',
      value: overview.total_accounts,
      icon: Users,
      currency: false,
    },
    {
      title: isGu ? 'કુલ રોકાણ' : 'Total Investment',
      value: finance.total_investment,
      icon: Wallet,
      currency: true,
    },
    {
      title: isGu ? 'પ્રવેશ ફી' : 'Opening Fees',
      value: finance.total_opening_fees,
      icon: Wallet,
      currency: true,
    },
    {
      title: isGu ? 'સભ્યોની લોન' : 'Member Loans',
      value: finance.total_member_loans,
      icon: Landmark,
      currency: true,
    },
    {
      title: isGu ? 'બહારની લોન' : 'External Loans',
      value: finance.total_external_loans,
      icon: Landmark,
      currency: true,
    },
    {
      title: isGu ? 'મળેલ વ્યાજ' : 'Interest Received',
      value: finance.total_interest_received,
      icon: HandCoins,
      currency: true,
    },
    {
      title: isGu ? 'ઉપલબ્ધ ફંડ' : 'Available Fund',
      value: finance.available_fund,
      icon: Wallet,
      currency: true,
    },
  ];

  if (loading) {
    return <p>{isGu ? 'લોડ થઈ રહ્યું છે...' : 'Loading...'}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {isGu ? 'સોસાયટી ડેશબોર્ડ' : 'Society Dashboard'}
          </h1>

          <p className="mt-1 text-slate-500">
            VENIDAS FINANCE
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/my/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium"
          >
            <ArrowLeft size={16} />
            {isGu ? 'મારું ડેશબોર્ડ' : 'My Dashboard'}
          </Link>

          <button
            type="button"
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            <RefreshCw size={16} />
            {refreshing
              ? (isGu ? 'લોડ થઈ રહ્યું છે...' : 'Loading...')
              : (isGu ? 'રિફ્રેશ' : 'Refresh')}
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl bg-red-50 p-4 text-red-700"
        >
          {error}
        </div>
      )}

      {dashboard && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value ?? '—'}
              icon={stat.icon}
              currency={stat.currency && stat.value != null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
