import { useEffect, useState } from 'react';

import {
  CalendarDays,
  FileSpreadsheet,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Wallet,
  Users,
  Landmark,
  TrendingUp,
} from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { apiError } from '../api/client';
import { monthlyMemberStatementApi } from '../api/monthlyMemberStatement';

const translations = {
  gu: {
    title: 'સભ્યોનું માસિક સ્ટેટમેન્ટ',
    subtitle: 'માસિક રોકાણ, લોન, વ્યાજ અને કમાણીની વિગત',
    month: 'મહિનો પસંદ કરો',
    view: 'રિપોર્ટ જુઓ',
    excel: 'Excel Export',
    loading: 'સ્ટેટમેન્ટ લોડ થઈ રહ્યું છે...',
    exporting: 'Excel તૈયાર થઈ રહ્યું છે...',
    noData: 'આ મહિના માટે કોઈ સભ્ય મળ્યો નથી.',
    serial: 'અનુ. નં.',
    name: 'સભ્યનું નામ',
    monthly: 'માસિક હપ્તો',
    investment: 'કુલ રોકાણ / મૂડી',
    loan: 'લોનની રકમ',
    interest: 'ચૂકવેલું વ્યાજ',
    total: 'કુલ રકમ',
    earning: 'વહેંચેલી કમાણી',
    investmentEarning: 'રોકાણ + કમાણી',
    totalRow: 'કુલ',
    members: 'કુલ સભ્યો',
    accounts: 'કુલ ખાતાઓ',
    interestPool: 'વસૂલ થયેલું વ્યાજ',
    earnings: 'વહેંચેલી કમાણી',
    investmentTotal: 'કુલ રોકાણ',
    error: 'સ્ટેટમેન્ટ લોડ થઈ શક્યું નથી.',
    exportError: 'Excel Export થઈ શક્યો નથી.',
    exported: 'Excel Download શરૂ થઈ ગયો છે.',
    note:
      'કમાણીનું વિતરણ સભ્યોના ચૂકવેલા કુલ રોકાણના પ્રમાણમાં થાય છે. બાકી હપ્તા ગણાતા નથી.',
    selectedMonth: 'પસંદ કરેલો મહિનો',
    statement: 'માસિક રોકાણ અને કમાણી વિગત',
  },

  en: {
    title: 'Monthly Member Statement',
    subtitle: 'Monthly investment, loan, interest and earnings',
    month: 'Select Month',
    view: 'View Report',
    excel: 'Export Excel',
    loading: 'Loading monthly statement...',
    exporting: 'Preparing Excel...',
    noData: 'No members found for this month.',
    serial: 'Sr. No.',
    name: 'Member Name',
    monthly: 'Monthly Installment',
    investment: 'Total Investment',
    loan: 'Loan Amount',
    interest: 'Interest Paid',
    total: 'Total Amount',
    earning: 'Distributed Earnings',
    investmentEarning: 'Investment + Earnings',
    totalRow: 'TOTAL',
    members: 'Total Members',
    accounts: 'Total Accounts',
    interestPool: 'Collected Interest',
    earnings: 'Distributed Earnings',
    investmentTotal: 'Total Investment',
    error: 'Unable to load statement.',
    exportError: 'Unable to export Excel.',
    exported: 'Excel download started.',
    note:
      'Earnings are distributed in proportion to paid member investments. Pending installments are excluded.',
    selectedMonth: 'Selected Month',
    statement: 'Monthly Investment and Earnings Statement',
  },
};

function formatMoney(value) {
  const number = Number(
    String(value ?? '0').replace(/,/g, '')
  );

  if (!Number.isFinite(number)) {
    return '₹0.00';
  }

  return `₹${number.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function currentMonth() {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
  ].join('-');
}

function SummaryCard({ title, value, Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
          <Icon size={19} />
        </div>
      </div>

      <p className="mt-3 break-words text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

export default function MonthlyMemberStatementPage() {
  const { language } = useLanguage();

  const lang = language === 'gu' ? 'gu' : 'en';
  const t = translations[lang];

  const [month, setMonth] = useState(currentMonth);
  const [appliedMonth, setAppliedMonth] = useState(currentMonth);

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadReport() {
      setLoading(true);
      setError('');
      setSuccess('');
      setReport(null);

      try {
        const response = await monthlyMemberStatementApi.get(
          appliedMonth,
          lang
        );

        const data = response.data?.data;

        if (
          !data ||
          !Array.isArray(data.rows) ||
          !data.summary
        ) {
          throw new Error('Invalid statement response.');
        }

        if (!cancelled) {
          setReport(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            apiError(err) || err.message || t.error
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadReport();

    return () => {
      cancelled = true;
    };
  }, [appliedMonth, lang, reloadKey]);

  function handleSubmit(event) {
    event.preventDefault();

    if (!month) return;

    setAppliedMonth(month);
    setReloadKey(value => value + 1);
  }

  async function handleExport() {
    if (loading || exporting || !report) return;

    setExporting(true);
    setError('');
    setSuccess('');

    try {
      await monthlyMemberStatementApi.exportExcel(
        appliedMonth,
        lang
      );

      setSuccess(t.exported);
    } catch (err) {
      setError(
        apiError(err) || err.message || t.exportError
      );
    } finally {
      setExporting(false);
    }
  }

  const summary = report?.summary || {};
  const rows = report?.rows || [];

  const columns = [
    t.serial,
    t.name,
    t.monthly,
    t.investment,
    t.loan,
    t.interest,
    t.total,
    t.earning,
    t.investmentEarning,
  ];

  const cards = [
    {
      title: t.members,
      value: summary.member_count ?? 0,
      Icon: Users,
    },
    {
      title: t.accounts,
      value: summary.account_count ?? 0,
      Icon: Landmark,
    },
    {
      title: t.investmentTotal,
      value: formatMoney(summary.total_investment),
      Icon: Wallet,
    },
    {
      title: t.interestPool,
      value: formatMoney(summary.collected_interest),
      Icon: TrendingUp,
    },
    {
      title: t.earnings,
      value: formatMoney(summary.distributed_earning),
      Icon: TrendingUp,
    },
    {
      title: t.investmentEarning,
      value: formatMoney(summary.investment_with_earning),
      Icon: Wallet,
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            <FileSpreadsheet size={14} />
            VENIDAS FINANCE
          </div>

          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            {t.title}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {t.subtitle}
          </p>
        </div>

        <button
          type="button"
          disabled={loading || exporting || !report}
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {exporting ? (
            <RefreshCw size={18} className="animate-spin" />
          ) : (
            <FileSpreadsheet size={18} />
          )}

          {exporting ? t.exporting : t.excel}
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-full sm:w-64">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              {t.month}
            </label>

            <div className="relative">
              <CalendarDays
                size={18}
                className="pointer-events-none absolute left-3 top-3 text-slate-400"
              />

              <input
                type="month"
                value={month}
                max={currentMonth()}
                onChange={event => setMonth(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !month}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {t.view}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => setReloadKey(value => value + 1)}
            aria-label="Refresh statement"
            className="rounded-xl border border-slate-300 bg-white p-2.5 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={19}
              className={loading ? 'animate-spin' : ''}
            />
          </button>

          <div className="text-sm text-slate-500 sm:ml-auto">
            {t.selectedMonth}:
            <span className="ml-2 font-semibold text-slate-800">
              {appliedMonth}
            </span>
          </div>
        </div>
      </form>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={19} className="shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
        >
          <CheckCircle2 size={19} />
          {success}
        </div>
      )}

      {!loading && report && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map(card => (
              <SummaryCard key={card.title} {...card} />
            ))}
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm leading-6 text-blue-800">
            {t.note}
          </div>
        </>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-slate-900 px-5 py-6 text-center text-white">
          <h2 className="text-xl font-bold">
            {lang === 'gu'
              ? 'વેણીડાસ ફાઇનાન્સ'
              : 'VENIDAS FINANCE'}
          </h2>

          <p className="mt-2 text-sm text-slate-200">
            {t.statement}
          </p>

          <div className="mt-3 inline-flex rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold">
            {appliedMonth}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] border-collapse text-sm">
            <thead>
              <tr className="bg-indigo-600 text-white">
                {columns.map((column, index) => (
                  <th
                    key={column}
                    className={`border-r border-indigo-500 px-4 py-4 font-semibold ${
                      index >= 2 ? 'text-right' : 'text-left'
                    }`}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={9}
                    className="py-16 text-center text-slate-500"
                  >
                    <RefreshCw
                      size={23}
                      className="mx-auto mb-3 animate-spin text-indigo-600"
                    />
                    {t.loading}
                  </td>
                </tr>
              )}

              {!loading && rows.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-16 text-center text-slate-500"
                  >
                    {t.noData}
                  </td>
                </tr>
              )}

              {!loading &&
                rows.map((row, index) => (
                  <tr
                    key={row.user_id}
                    className={`border-b border-slate-100 hover:bg-indigo-50 ${
                      index % 2 === 0
                        ? 'bg-white'
                        : 'bg-slate-50/70'
                    }`}
                  >
                    <td className="px-4 py-3.5 text-slate-500">
                      {row.serial_number}
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-slate-800">
                        {lang === 'gu'
                          ? row.name_gu || row.name
                          : row.name}
                      </p>

                      {row.member_code && (
                        <p className="mt-0.5 text-xs text-slate-400">
                          {row.member_code}
                        </p>
                      )}
                    </td>

                    {[
                      row.monthly_amount,
                      row.total_investment,
                      row.loan_amount,
                      row.interest_paid,
                      row.total_amount,
                      row.distributed_earning,
                      row.investment_with_earning,
                    ].map((value, cellIndex) => (
                      <td
                        key={cellIndex}
                        className={`whitespace-nowrap px-4 py-3.5 text-right tabular-nums ${
                          cellIndex === 5
                            ? 'font-semibold text-emerald-700'
                            : 'text-slate-700'
                        }`}
                      >
                        {formatMoney(value)}
                      </td>
                    ))}
                  </tr>
                ))}

              {!loading && report && (
                <tr className="bg-indigo-100 font-bold text-slate-900">
                  <td colSpan={2} className="px-4 py-4">
                    {t.totalRow}
                  </td>

                  {[
                    summary.monthly_amount,
                    summary.total_investment,
                    summary.loan_amount,
                    summary.interest_paid_by_members,
                    summary.total_amount,
                    summary.distributed_earning,
                    summary.investment_with_earning,
                  ].map((value, index) => (
                    <td
                      key={index}
                      className="whitespace-nowrap px-4 py-4 text-right tabular-nums"
                    >
                      {formatMoney(value)}
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && report && (
          <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 text-right text-xs text-slate-500">
            {t.members}: {summary.member_count ?? 0}
            {' | '}
            {t.selectedMonth}: {appliedMonth}
          </div>
        )}
      </div>
    </div>
  );
}