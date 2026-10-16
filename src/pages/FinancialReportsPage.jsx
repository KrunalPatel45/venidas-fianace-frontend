
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Search,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Scale,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  FilterX,
} from 'lucide-react';

import {
  financialReportsApi,
} from '../api/financialReports';

import { apiError } from '../api/client';
import { useLanguage } from '../context/LanguageContext';

/* =====================================================
   TRANSLATIONS
===================================================== */

const translations = {
  gu: {
    title: 'નાણાકીય રિપોર્ટ',
    subtitle:
      'સોસાયટીની રોકડ આવક, જાવક અને સંપૂર્ણ હિસાબ',
    from: 'શરૂઆતની તારીખ',
    to: 'અંતિમ તારીખ',
    apply: 'રિપોર્ટ જુઓ',
    clear: 'ફિલ્ટર દૂર કરો',
    refresh: 'ફરી લોડ કરો',
    export: 'CSV Export',
    exporting: 'CSV તૈયાર થઈ રહી છે...',
    opening: 'શરૂઆતની રોકડ',
    credit: 'કુલ આવક',
    debit: 'કુલ જાવક',
    closing: 'અંતિમ રોકડ',
    net: 'ચોખ્ખો ફેરફાર',
    count: 'કુલ વ્યવહારો',
    category: 'કેટેગરી પ્રમાણે હિસાબ',
    transactions: 'રોકડ વ્યવહારનો ઇતિહાસ',
    reference: 'વ્યવહારનો પ્રકાર',
    referenceId: 'રેફરન્સ ID',
    date: 'તારીખ',
    direction: 'આવક / જાવક',
    amount: 'રકમ',
    search: 'આ પેજમાં શોધો',
    id: 'એન્ટ્રી ID',
    previous: 'પાછળ',
    next: 'આગળ',
    page: 'પેજ',
    total: 'કુલ',
    noData: 'આ સમયગાળા માટે કોઈ વ્યવહાર નથી.',
    noCategory: 'કોઈ કેટેગરી મળી નથી.',
    loading: 'રિપોર્ટ લોડ થઈ રહ્યો છે...',
    invalidRange:
      'અંતિમ તારીખ શરૂઆતની તારીખ પહેલાં ન હોવી જોઈએ.',
    loadError: 'રિપોર્ટ લોડ થઈ શક્યો નથી.',
    exportError: 'CSV Export થઈ શક્યો નથી.',
    exportSuccess: 'CSV Export શરૂ થઈ ગયો છે.',
    categoryName: 'કેટેગરી',
    categoryCount: 'વ્યવહારો',
    categoryCredit: 'આવક',
    categoryDebit: 'જાવક',
    categoryNet: 'નેટ',
    note:
      'આ રિપોર્ટ Fund Ledger પર આધારિત છે. લોનની મૂળ રકમ પરત મળવી એ રોકડ આવક છે, નફો નથી.',
    records: 'રેકોર્ડ',
    allDates: 'તમામ તારીખો',
    showing:
      'Search ફક્ત હાલમાં દેખાતા પેજમાં લાગુ પડે છે.',
  },

  en: {
    title: 'Financial Reports',
    subtitle:
      'Society cash inflows, outflows and ledger',
    from: 'From Date',
    to: 'To Date',
    apply: 'Apply Filters',
    clear: 'Clear Filters',
    refresh: 'Refresh',
    export: 'Export CSV',
    exporting: 'Preparing CSV...',
    opening: 'Opening Cash Balance',
    credit: 'Total Cash In',
    debit: 'Total Cash Out',
    closing: 'Closing Cash Balance',
    net: 'Net Cash Change',
    count: 'Total Transactions',
    category: 'Category Breakdown',
    transactions: 'Fund Ledger Transactions',
    reference: 'Reference Type',
    referenceId: 'Reference ID',
    date: 'Date',
    direction: 'Direction',
    amount: 'Amount',
    search: 'Search This Page',
    id: 'Entry ID',
    previous: 'Previous',
    next: 'Next',
    page: 'Page',
    total: 'Total',
    noData: 'No transactions found for this period.',
    noCategory: 'No categories found.',
    loading: 'Loading financial report...',
    invalidRange:
      'To Date must be on or after From Date.',
    loadError: 'Unable to load financial report.',
    exportError: 'Unable to export CSV.',
    exportSuccess: 'CSV download started.',
    categoryName: 'Category',
    categoryCount: 'Transactions',
    categoryCredit: 'Credit',
    categoryDebit: 'Debit',
    categoryNet: 'Net',
    note:
      'This report is based on the Fund Ledger. Principal repayments are cash inflows, not profit.',
    records: 'Records',
    allDates: 'All Dates',
    showing:
      'Search filters only the currently displayed page.',
  },
};

/* =====================================================
   STYLES
===================================================== */

const inputClass =
  'w-full rounded-xl border border-slate-300 ' +
  'bg-white px-3 py-2.5 text-sm text-slate-900 ' +
  'outline-none focus:border-indigo-500 ' +
  'focus:ring-2 focus:ring-indigo-100';

const primaryButton =
  'inline-flex items-center justify-center gap-2 ' +
  'rounded-xl bg-indigo-600 px-4 py-2.5 ' +
  'text-sm font-semibold text-white ' +
  'hover:bg-indigo-700 disabled:cursor-not-allowed ' +
  'disabled:opacity-50';

const secondaryButton =
  'inline-flex items-center justify-center gap-2 ' +
  'rounded-xl border border-slate-300 bg-white ' +
  'px-4 py-2.5 text-sm font-medium text-slate-700 ' +
  'hover:bg-slate-50 disabled:cursor-not-allowed ' +
  'disabled:opacity-50';

/* =====================================================
   HELPERS
===================================================== */

function money(value) {
  const number = Number(value ?? 0);

  if (!Number.isFinite(number)) {
    return '₹0.00';
  }

  return `₹${number.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) return '—';

  const date = String(value).slice(0, 10);
  const parts = date.split('-');

  if (parts.length !== 3) return date;

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function categoryLabel(type, lang) {
  const labels = {
    opening_fee: {
      gu: 'ખાતા ખોલવાની ફી',
      en: 'Opening Fee',
    },

    monthly_investment: {
      gu: 'માસિક રોકાણ',
      en: 'Monthly Investment',
    },

    loan_disbursement: {
      gu: 'લોન આપવામાં આવી',
      en: 'Loan Disbursement',
    },

    loan_interest: {
      gu: 'લોનનું વ્યાજ',
      en: 'Loan Interest',
    },

    loan_principal_repayment: {
      gu: 'લોનની મૂળ રકમ પરત',
      en: 'Principal Repayment',
    },

    other: {
      gu: 'અન્ય વ્યવહાર',
      en: 'Other Transaction',
    },
  };

  return labels[type]?.[lang] ||
    String(type || 'other').replaceAll('_', ' ');
}

function getPagination(response) {
  const root = response?.data;

  if (!root?.data) {
    throw new Error('Invalid report API response.');
  }

  const report = root.data;

  if (
    !report.summary ||
    !Array.isArray(report.categories) ||
    !report.entries ||
    !Array.isArray(report.entries.data)
  ) {
    throw new Error(
      'Financial report response is incomplete.'
    );
  }

  return report;
}

/* =====================================================
   SUMMARY CARD
===================================================== */

function SummaryCard({
  label,
  value,
  Icon,
  iconClass = 'text-indigo-600',
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">
          {label}
        </p>

        <div className="rounded-xl bg-slate-50 p-2.5">
          <Icon size={20} className={iconClass} />
        </div>
      </div>

      <p className="mt-4 break-words text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

/* =====================================================
   MAIN PAGE
===================================================== */

export default function FinancialReportsPage() {
  const { language } = useLanguage();

  const lang = language === 'gu' ? 'gu' : 'en';
  const t = translations[lang];

  // Editable filter values.
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  // Applied filters. Changing input alone does not
  // change the displayed report.
  const [appliedFilters, setAppliedFilters] = useState({
    from: '',
    to: '',
  });

  const [page, setPage] = useState(1);
  const [perPage] = useState(30);

  const [report, setReport] = useState(null);

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  /* ---------------------------------------------------
     LOAD REPORT
  --------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    async function loadReport() {
      setLoading(true);
      setError('');

      try {
        const params = {
          page,
          per_page: perPage,
        };

        if (appliedFilters.from) {
          params.from = appliedFilters.from;
        }

        if (appliedFilters.to) {
          params.to = appliedFilters.to;
        }

        const response =
          await financialReportsApi.list(params);

        if (cancelled) return;

        const result = getPagination(response);

        setReport(result);
      } catch (err) {
        if (cancelled) return;

        setError(apiError(err) || t.loadError);
        setReport(null);
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
  }, [
    appliedFilters,
    page,
    perPage,
    reloadKey,
    t.loadError,
  ]);

  /* ---------------------------------------------------
     FILTERS
  --------------------------------------------------- */

  function applyFilters(event) {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (from && to && from > to) {
      setError(t.invalidRange);
      return;
    }

    setPage(1);
    setSearch('');

    setAppliedFilters({
      from,
      to,
    });

    // Force refresh if filters are unchanged.
    setReloadKey(value => value + 1);
  }

  function clearFilters() {
    setFrom('');
    setTo('');
    setSearch('');
    setPage(1);

    setError('');
    setSuccess('');

    setAppliedFilters({
      from: '',
      to: '',
    });

    setReloadKey(value => value + 1);
  }

  const refresh = useCallback(() => {
    setError('');
    setSuccess('');
    setReloadKey(value => value + 1);
  }, []);

  /* ---------------------------------------------------
     CSV EXPORT
  --------------------------------------------------- */

  async function exportCsv() {
    if (exporting) return;

    setExporting(true);
    setError('');
    setSuccess('');

    try {
      const params = {};

      if (appliedFilters.from) {
        params.from = appliedFilters.from;
      }

      if (appliedFilters.to) {
        params.to = appliedFilters.to;
      }

      await financialReportsApi.exportCsv(params);

      setSuccess(t.exportSuccess);
    } catch (err) {
      setError(apiError(err) || t.exportError);
    } finally {
      setExporting(false);
    }
  }

  /* ---------------------------------------------------
     DERIVED DATA
  --------------------------------------------------- */

  const summary = report?.summary || {};

  const categories = report?.categories || [];

  const entries = report?.entries?.data || [];

  const currentPage = Number(
    report?.entries?.current_page || 1
  );

  const lastPage = Math.max(
    1,
    Number(report?.entries?.last_page || 1)
  );

  const totalRows = Number(
    report?.entries?.total || 0
  );

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return entries;

    return entries.filter(entry => {
      const text = [
        entry.id,
        entry.reference_type,
        categoryLabel(entry.reference_type, lang),
        entry.reference_id,
        entry.direction,
        entry.amount,
        entry.transaction_date,
      ]
        .filter(value => value !== null && value !== undefined)
        .join(' ')
        .toLowerCase();

      return text.includes(query);
    });
  }, [entries, search, lang]);

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <div className="space-y-6 pb-8">
      {/* HEADER */}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t.title}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {t.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={refresh}
            className={secondaryButton}
          >
            <RefreshCw
              size={17}
              className={loading ? 'animate-spin' : ''}
            />
            {t.refresh}
          </button>

          <button
            type="button"
            disabled={loading || exporting || !report}
            onClick={exportCsv}
            className={primaryButton}
          >
            {exporting ? (
              <RefreshCw
                size={17}
                className="animate-spin"
              />
            ) : (
              <Download size={17} />
            )}

            {exporting ? t.exporting : t.export}
          </button>
        </div>
      </div>

      {/* ERRORS */}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle
            size={20}
            className="shrink-0"
          />

          <p>{error}</p>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          <CheckCircle2 size={20} />
          <p>{success}</p>
        </div>
      )}

      {/* DATE FILTER */}

      <form
        onSubmit={applyFilters}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="grid items-end gap-4 md:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t.from}
            </label>

            <input
              type="date"
              value={from}
              onChange={event =>
                setFrom(event.target.value)
              }
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t.to}
            </label>

            <input
              type="date"
              value={to}
              onChange={event =>
                setTo(event.target.value)
              }
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={primaryButton}
          >
            <CalendarDays size={17} />
            {t.apply}
          </button>

          <button
            type="button"
            onClick={clearFilters}
            disabled={loading}
            className={secondaryButton}
          >
            <FilterX size={17} />
            {t.clear}
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          {appliedFilters.from || t.allDates}
          {' — '}
          {appliedFilters.to || t.allDates}
        </p>
      </form>

      {/* SUMMARY */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          label={t.opening}
          value={money(summary.opening_balance)}
          Icon={Wallet}
        />

        <SummaryCard
          label={t.credit}
          value={money(summary.total_credit)}
          Icon={ArrowDownLeft}
          iconClass="text-green-600"
        />

        <SummaryCard
          label={t.debit}
          value={money(summary.total_debit)}
          Icon={ArrowUpRight}
          iconClass="text-red-600"
        />

        <SummaryCard
          label={t.net}
          value={money(summary.net_change)}
          Icon={Scale}
        />

        <SummaryCard
          label={t.closing}
          value={money(summary.closing_balance)}
          Icon={Wallet}
          iconClass="text-indigo-700"
        />

        <SummaryCard
          label={t.count}
          value={Number(
            summary.transaction_count || 0
          ).toLocaleString('en-IN')}
          Icon={FileSpreadsheet}
        />
      </div>

      {/* ACCOUNTING NOTE */}

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        {t.note}
      </div>

      {/* CATEGORY BREAKDOWN */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-slate-900">
            {t.category}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {[
                  t.categoryName,
                  t.categoryCount,
                  t.categoryCredit,
                  t.categoryDebit,
                  t.categoryNet,
                ].map(heading => (
                  <th
                    key={heading}
                    className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-600"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {categories.map(row => (
                <tr key={row.reference_type}>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                    {categoryLabel(
                      row.reference_type,
                      lang
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {Number(
                      row.transaction_count || 0
                    ).toLocaleString('en-IN')}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-green-700">
                    {money(row.total_credit)}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-red-700">
                    {money(row.total_debit)}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 font-semibold">
                    {money(row.net_amount)}
                  </td>
                </tr>
              ))}

              {!loading && categories.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    {t.noCategory}
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    {t.loading}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LEDGER TRANSACTIONS */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {t.transactions}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {t.showing}
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={17}
              className="absolute left-3 top-3 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={event =>
                setSearch(event.target.value)
              }
              placeholder={t.search}
              className={`${inputClass} pl-10`}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {[
                  t.id,
                  t.date,
                  t.reference,
                  t.referenceId,
                  t.direction,
                  t.amount,
                ].map(heading => (
                  <th
                    key={heading}
                    className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-600"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredEntries.map(entry => {
                const credit =
                  entry.direction === 'credit';

                return (
                  <tr
                    key={entry.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-medium">
                      #{entry.id}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      {formatDate(
                        entry.transaction_date
                      )}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      {categoryLabel(
                        entry.reference_type,
                        lang
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {entry.reference_id ?? '—'}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                          credit
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {credit ? (
                          <ArrowDownLeft size={14} />
                        ) : (
                          <ArrowUpRight size={14} />
                        )}

                        {credit ? t.credit : t.debit}
                      </span>
                    </td>

                    <td
                      className={`whitespace-nowrap px-4 py-3 font-semibold ${
                        credit
                          ? 'text-green-700'
                          : 'text-red-700'
                      }`}
                    >
                      {credit ? '+' : '-'}
                      {money(entry.amount)}
                    </td>
                  </tr>
                );
              })}

              {!loading &&
                filteredEntries.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      {t.noData}
                    </td>
                  </tr>
                )}

              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    {t.loading}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-4">
          <button
            type="button"
            disabled={loading || currentPage <= 1}
            onClick={() => {
              setPage(previous => previous - 1);
              setSearch('');
            }}
            className={secondaryButton}
          >
            <ChevronLeft size={17} />
            {t.previous}
          </button>

          <div className="text-center text-sm text-slate-600">
            <p>
              {t.page}: {currentPage}/{lastPage}
            </p>

            <p className="text-xs text-slate-500">
              {t.records}: {totalRows}
            </p>
          </div>

          <button
            type="button"
            disabled={
              loading || currentPage >= lastPage
            }
            onClick={() => {
              setPage(previous => previous + 1);
              setSearch('');
            }}
            className={secondaryButton}
          >
            {t.next}
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
