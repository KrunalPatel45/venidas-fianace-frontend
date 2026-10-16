
import { useCallback, useEffect, useState } from 'react';
import {
  Users,
  Wallet,
  Landmark,
  CreditCard,
  HandCoins,
  RefreshCw,
} from 'lucide-react';

import { dashboardApi } from '../api/dashboard';
import { apiError } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import StatCard from '../components/StatCard';

export default function AdminDashboard() {
  const { t } = useLanguage();

  const [data, setData] = useState(null);
  const [report, setReport] = useState(null);
  const [month, setMonth] = useState(
    () => new Date().toLocaleDateString('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
    }).slice(0, 7)
  );
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await dashboardApi.admin();
      setData(response.data.data);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadReport = useCallback(async () => {
    setReportLoading(true);
    setError('');

    try {
      const response = await dashboardApi.monthlyReport(month);
      setReport(response.data.data);
    } catch (err) {
      setReport(null);
      setError(apiError(err));
    } finally {
      setReportLoading(false);
    }
  }, [month]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  if (loading && !data) {
    return <p>{t('loading')}</p>;
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t('adminDashboard')}</h1>
          <p className="text-slate-500 text-sm mt-1">
            {t('cashOnly')}
          </p>
        </div>

        <button
          onClick={loadDashboard}
          className="flex gap-2 items-center bg-white border rounded-xl px-4 py-2"
        >
          <RefreshCw size={16} />
          {t('refresh')}
        </button>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 text-red-700 rounded-xl p-4">
          {error}
        </div>
      )}

      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title={t('members')} value={data.members} icon={Users} />
          <StatCard title={t('accounts')} value={data.total_accounts} icon={Wallet} />
          <StatCard title={t('activeAccounts')} value={data.active_accounts} icon={CreditCard} />
          <StatCard title={t('externalBorrowers')} value={data.external_borrowers} icon={Users} />
          <StatCard title={t('activeLoans')} value={data.active_loans} icon={Landmark} />
          <StatCard title={t('outstandingPrincipal')} value={data.outstanding_principal} icon={HandCoins} currency />
          <StatCard title={t('pendingInvestments')} value={data.pending_investments} icon={Wallet} currency />
          <StatCard title={t('pendingInterest')} value={data.pending_loan_interest} icon={HandCoins} currency />
          <StatCard title={t('cashBalance')} value={data.cash_balance} icon={Wallet} currency />
        </div>
      )}

      <section className="bg-white rounded-2xl border p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <h2 className="text-lg font-semibold">
            {t('monthlyReport')}
          </h2>

          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border rounded-xl px-3 py-2"
          />
        </div>

        {reportLoading && <p>{t('loading')}</p>}

        {!reportLoading && report && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <StatCard title={t('expectedInvestment')} value={report.investment.expected} currency />
            <StatCard title={t('pendingInvestment')} value={report.investment.pending} currency />
            <StatCard title={t('expectedInterest')} value={report.loan_interest.expected} currency />
            <StatCard title={t('pendingInterest')} value={report.loan_interest.pending} currency />
            <StatCard title={t('cashReceived')} value={report.cash_flow.credits} currency />
            <StatCard title={t('cashPaid')} value={report.cash_flow.debits} currency />
            <StatCard title={t('netCashFlow')} value={report.cash_flow.net} currency />
          </div>
        )}
      </section>
    </div>
  );
}
