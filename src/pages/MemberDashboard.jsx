
import { useEffect, useState } from 'react';
import { Wallet, HandCoins, Landmark } from 'lucide-react';

import { dashboardApi } from '../api/dashboard';
import { apiError } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import StatCard from '../components/StatCard';

export default function MemberDashboard() {
  const { t, language } = useLanguage();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await dashboardApi.member();

        if (active) {
          setData(response.data.data);
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

  if (loading) {
    return <p>{t('loading')}</p>;
  }

  if (error) {
    return (
      <div role="alert" className="bg-red-50 text-red-700 p-4 rounded-xl">
        {error}
      </div>
    );
  }

  if (!data) {
    return <p>{t('noData')}</p>;
  }

  const name =
    language === 'gu'
      ? data.member?.name_gu || data.member?.name
      : data.member?.name;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {t('memberDashboard')}
        </h1>
        <p className="text-slate-500 mt-1">
          {name} — {data.member?.member_code}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title={t('accounts')}
          value={data.accounts}
          icon={Wallet}
        />

        <StatCard
          title={t('pendingInvestment')}
          value={data.pending_investment}
          icon={Wallet}
          currency
        />

        <StatCard
          title={t('outstandingPrincipal')}
          value={data.outstanding_principal}
          icon={Landmark}
          currency
        />

        <StatCard
          title={t('pendingInterest')}
          value={data.pending_interest}
          icon={HandCoins}
          currency
        />
      </div>
    </div>
  );
}
