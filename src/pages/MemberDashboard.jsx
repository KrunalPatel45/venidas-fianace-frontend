import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  Wallet,
  HandCoins,
  Landmark,
  TrendingUp,
  PiggyBank,
  CircleDollarSign,
  ArrowRight,
  Percent,
  Receipt,
} from 'lucide-react';

import { dashboardApi } from '../api/dashboard';
import { apiError } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import StatCard from '../components/StatCard';

export default function MemberDashboard() {
  const { t, language } = useLanguage();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isGu = language === 'gu';

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
      <div
        role="alert"
        className="rounded-xl bg-red-50 p-4 text-red-700"
      >
        {error}
      </div>
    );
  }

  if (!data) {
    return <p>{t('noData')}</p>;
  }

  const name = isGu
    ? data.member?.name_gu || data.member?.name
    : data.member?.name;

  const labels = {
    totalInvestment: isGu
      ? 'કુલ રોકાણ'
      : 'Total Investment',

    interestEarned: isGu
      ? 'અંદાજિત કમાયેલું વ્યાજ'
      : 'Estimated Interest Earned',

    totalEarnings: isGu
      ? 'કુલ અંદાજિત કમાણી'
      : 'Total Estimated Earnings',

    investmentWithEarnings: isGu
      ? 'રોકાણ + અંદાજિત કમાણી'
      : 'Investment + Estimated Earnings',

    totalInterestPaid: isGu
      ? 'કુલ ચૂકવેલું લોન વ્યાજ'
      : 'Total Loan Interest Paid',

    investmentShare: isGu
      ? 'રોકાણનો હિસ્સો'
      : 'Investment Share',

    societyDashboard: isGu
      ? 'સોસાયટી ડેશબોર્ડ'
      : 'Society Dashboard',

    earningsNote: isGu
      ? 'આ કમાણી સોસાયટીને મળેલા કુલ વ્યાજ અને તમારા કુલ રોકાણના પ્રમાણ પરથી અંદાજવામાં આવી છે. આ રકમ તમારા ખાતામાં જમા કરવામાં આવી નથી.'
      : 'Earnings are estimated using your share of total paid investment and society interest received. No earnings have been credited to your account.',
  };

  const sharePercentage = Number(
    data.investment_share_percentage ?? 0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {t('memberDashboard')}
          </h1>

          <p className="mt-1 text-slate-500">
            {name} — {data.member?.member_code}
          </p>
        </div>

        <Link
          to="/society/dashboard"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {labels.societyDashboard}
          <ArrowRight size={18} />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={t('accounts')}
          value={data.accounts}
          icon={Wallet}
        />

        <StatCard
          title={labels.totalInvestment}
          value={data.total_investment}
          icon={PiggyBank}
          currency
        />

        <StatCard
          title={labels.interestEarned}
          value={data.estimated_interest_earned}
          icon={HandCoins}
          currency
        />

        <StatCard
          title={labels.totalEarnings}
          value={data.total_earnings}
          icon={TrendingUp}
          currency
        />

        <StatCard
          title={labels.investmentWithEarnings}
          value={data.investment_with_earnings}
          icon={CircleDollarSign}
          currency
        />

        <StatCard
          title={labels.totalInterestPaid}
          value={data.total_interest_paid}
          icon={Receipt}
          currency
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

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Percent
            size={20}
            className="text-indigo-600"
          />

          <h2 className="font-semibold text-slate-900">
            {labels.investmentShare}
          </h2>
        </div>

        <p className="mt-3 text-2xl font-bold text-indigo-600">
          {sharePercentage.toLocaleString('en-IN', {
            maximumFractionDigits: 4,
          })}%
        </p>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-indigo-600"
            style={{
              width: `${Math.min(
                100,
                Math.max(0, sharePercentage)
              )}%`,
            }}
          />
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-500">
          {labels.earningsNote}
        </p>
      </div>
    </div>
  );
}