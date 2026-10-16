
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Wallet,
} from 'lucide-react';

import { monthlyInvestmentsApi } from '../api/monthlyInvestments';
import { useLanguage } from '../context/LanguageContext';

const labels = {
  gu: {
    title: 'માસિક રોકાણ',
    subtitle: 'સભ્યના એકથી વધુ ખાતાની રોકડ એકસાથે મેળવો',
    month: 'મહિનો',
    member: 'સભ્ય',
    chooseMember: 'સભ્ય પસંદ કરો',
    status: 'સ્થિતિ',
    all: 'બધા',
    pending: 'બાકી',
    paid: 'ચૂકવેલ',
    generate: 'માસિક રોકાણ બનાવો',
    refresh: 'ફરી લોડ કરો',
    total: 'કુલ ખાતા',
    expected: 'અપેક્ષિત રકમ',
    collected: 'વસૂલ થયેલી રકમ',
    outstanding: 'બાકી રકમ',
    account: 'ખાતા નંબર',
    amount: 'રકમ',
    paidAt: 'ચુકવણી તારીખ',
    selectAll: 'બધા બાકી ખાતા પસંદ કરો',
    selected: 'પસંદ કરેલા ખાતા',
    selectedTotal: 'કુલ પસંદ કરેલી રકમ',
    receive: 'રોકડ મેળવો',
    confirm: 'રોકડ મળ્યાની પુષ્ટિ કરો',
    cancel: 'રદ કરો',
    empty: 'કોઈ રોકાણ મળ્યું નથી.',
    noPending: 'આ સભ્ય માટે કોઈ બાકી રોકાણ નથી.',
    loading: 'લોડ થઈ રહ્યું છે...',
    date: 'રોકડ મળ્યાની તારીખ',
    note: 'ખરેખર રોકડ મળી હોય તો જ પુષ્ટિ કરો. બધા પસંદ કરેલા ખાતા એકસાથે Paid થશે.',
    success: 'રોકડ ચુકવણી સફળતાપૂર્વક નોંધાઈ.',
    generated: 'માસિક રોકાણ બનાવવાની પ્રક્રિયા પૂર્ણ થઈ.',
    error: 'વિનંતી પૂર્ણ થઈ શકી નથી.',
    previous: 'પાછળ',
    next: 'આગળ',
    page: 'પાનું',
    generateConfirm: 'પસંદ કરેલા મહિના માટે dues બનાવશો? આ cash payment નથી.',
    dateError: 'આજની કે અગાઉની તારીખ પસંદ કરો.',
    processing: 'પ્રક્રિયા ચાલુ છે...',
  },
  en: {
    title: 'Monthly Investments',
    subtitle: 'Receive cash for multiple accounts of one member',
    month: 'Month',
    member: 'Member',
    chooseMember: 'Select Member',
    status: 'Status',
    all: 'All',
    pending: 'Pending',
    paid: 'Paid',
    generate: 'Generate Monthly Dues',
    refresh: 'Refresh',
    total: 'Total Accounts',
    expected: 'Expected Amount',
    collected: 'Collected Amount',
    outstanding: 'Pending Amount',
    account: 'Account Number',
    amount: 'Amount',
    paidAt: 'Payment Date',
    selectAll: 'Select All Pending Accounts',
    selected: 'Selected Accounts',
    selectedTotal: 'Selected Total',
    receive: 'Receive Cash',
    confirm: 'Confirm Cash Received',
    cancel: 'Cancel',
    empty: 'No investments found.',
    noPending: 'No pending investments for this member.',
    loading: 'Loading...',
    date: 'Cash Received Date',
    note: 'Confirm only after receiving actual cash. All selected accounts will be marked Paid together.',
    success: 'Cash payments recorded successfully.',
    generated: 'Monthly dues generation completed.',
    error: 'Request could not be completed.',
    previous: 'Previous',
    next: 'Next',
    page: 'Page',
    generateConfirm: 'Generate dues for this month? This does not record cash.',
    dateError: 'Select today or an earlier date.',
    processing: 'Processing...',
  },
};

function today() {
  const date = new Date();
  const local = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );
  return local.toISOString().slice(0, 10);
}

function money(amount) {
  const value = Number(amount || 0);
  return Number.isFinite(value)
    ? `₹${value.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : '—';
}

function errorMessage(error, fallback) {
  const data = error?.response?.data;
  const first = data?.errors
    ? Object.values(data.errors)[0]
    : null;

  return (Array.isArray(first) ? first[0] : null)
    || data?.message
    || fallback;
}

const inputStyle =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none';

function SummaryCard({ title, value, Icon }) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{title}</span>
        <Icon size={20} className="text-indigo-600" />
      </div>
      <div className="mt-3 text-2xl font-bold text-slate-900">
        {value}
      </div>
    </div>
  );
}

export default function MonthlyInvestmentsPage() {
  const { language } = useLanguage();
  const lang = language === 'gu' ? 'gu' : 'en';
  const t = labels[lang];

  const [month, setMonth] = useState(today().slice(0, 7));
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);

  const [members, setMembers] = useState([]);
  const [memberId, setMemberId] = useState('');
  const [pendingRows, setPendingRows] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  const [paidAt, setPaidAt] = useState(today());
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [memberLoading, setMemberLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refreshCount, setRefreshCount] = useState(0);

  const refresh = () => setRefreshCount(value => value + 1);

  const loadMain = useCallback(async (signal) => {
    if (!month) return;

    setLoading(true);
    setError('');

    try {
      const params = { month, page, per_page: 20 };
      if (status) params.status = status;
      if (memberId) params.user_id = Number(memberId);

      const [listResponse, summaryResponse] = await Promise.all([
        monthlyInvestmentsApi.list(params),
        monthlyInvestmentsApi.summary(month),
      ]);

      if (signal.aborted) return;

      const paginator = listResponse.data.data;

      setRows(paginator.data || []);
      setLastPage(Math.max(1, Number(paginator.last_page || 1)));
      setSummary(summaryResponse.data.data || null);
    } catch (err) {
      if (!signal.aborted) {
        setError(errorMessage(err, t.error));
      }
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [month, page, status, memberId, refreshCount, t.error]);

  useEffect(() => {
    const controller = new AbortController();
    loadMain(controller.signal);
    return () => controller.abort();
  }, [loadMain]);

  // Build the member dropdown from the accounts for the
  // selected month, not just from the visible table page.
  useEffect(() => {
    let cancelled = false;

    async function loadMembers() {
      try {
        const allMembers = new Map();
        let currentPage = 1;
        let totalPages = 1;

        do {
          const response = await monthlyInvestmentsApi.list({
            month,
            page: currentPage,
            per_page: 100,
          });

          if (cancelled) return;

          const paginator = response.data.data;

          for (const item of paginator.data || []) {
            const member = item.member;
            if (member?.id) {
              allMembers.set(member.id, member);
            }
          }

          totalPages = Number(paginator.last_page || 1);
          currentPage++;
        } while (currentPage <= totalPages);

        if (!cancelled) {
          setMembers(Array.from(allMembers.values()).sort(
            (a, b) => (a.name || '').localeCompare(b.name || '')
          ));
        }
      } catch (err) {
        if (!cancelled) {
          setError(errorMessage(err, t.error));
        }
      }
    }

    if (month) loadMembers();

    return () => {
      cancelled = true;
    };
  }, [month, refreshCount, t.error]);

  // This endpoint returns ALL pending dues for the member,
  // including accounts outside the current list page.
  useEffect(() => {
    let cancelled = false;

    setSelectedIds([]);
    setPendingRows([]);

    if (!memberId || !month) {
      setMemberLoading(false);
      return;
    }

    setMemberLoading(true);

    monthlyInvestmentsApi
      .pendingForMember(month, Number(memberId))
      .then(response => {
        if (!cancelled) {
          setPendingRows(response.data.data || []);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(errorMessage(err, t.error));
        }
      })
      .finally(() => {
        if (!cancelled) setMemberLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [month, memberId, refreshCount, t.error]);

  const selectedRows = useMemo(() => {
    const ids = new Set(selectedIds);
    return pendingRows.filter(item => ids.has(item.id));
  }, [pendingRows, selectedIds]);

  const selectedTotal = selectedRows.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const allSelected =
    pendingRows.length > 0
    && selectedIds.length === pendingRows.length;

  const selectedMember = members.find(
    item => String(item.id) === String(memberId)
  );

  function displayMember(member) {
    if (!member) return '—';
    return lang === 'gu'
      ? member.name_gu || member.name || '—'
      : member.name || '—';
  }

  function toggleOne(id) {
    setSelectedIds(previous =>
      previous.includes(id)
        ? previous.filter(value => value !== id)
        : [...previous, id]
    );
  }

  function toggleAll(checked) {
    setSelectedIds(
      checked ? pendingRows.map(item => item.id) : []
    );
  }

  async function generate() {
    if (!month || busy) return;
    if (!window.confirm(t.generateConfirm)) return;

    setBusy(true);
    setError('');
    setSuccess('');

    try {
      await monthlyInvestmentsApi.generate(month);
      setSuccess(t.generated);
      setPage(1);
      refresh();
    } catch (err) {
      setError(errorMessage(err, t.error));
    } finally {
      setBusy(false);
    }
  }

  async function receiveBulk() {
    if (!selectedIds.length || busy) return;

    if (!paidAt || paidAt > today()) {
      setError(t.dateError);
      return;
    }

    setBusy(true);
    setError('');
    setSuccess('');

    try {
      const response = await monthlyInvestmentsApi.receiveBulkCash(
        selectedIds,
        paidAt
      );

      setSuccess(
        `${t.success} (${response.data.data.count} · ${
          money(response.data.data.total_amount)
        })`
      );

      setConfirmOpen(false);
      setSelectedIds([]);
      refresh();
    } catch (err) {
      setError(errorMessage(err, t.error));
    } finally {
      setBusy(false);
    }
  }

  function changeMonth(value) {
    setMonth(value);
    setMemberId('');
    setPage(1);
    setSuccess('');
  }

  return (
    <div className="space-y-6">
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
            onClick={refresh}
            className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5"
          >
            <RefreshCw size={17} />
            {t.refresh}
          </button>

          <button
            type="button"
            onClick={generate}
            disabled={busy || !month}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 font-medium text-white disabled:opacity-50"
          >
            {t.generate}
          </button>
        </div>
      </div>

      {success && (
        <div role="status" className="rounded-xl bg-green-50 p-4 text-green-700">
          {success}
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 rounded-2xl border bg-white p-5 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium">
            {t.month}
          </label>
          <input
            type="month"
            value={month}
            onChange={event => changeMonth(event.target.value)}
            className={inputStyle}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            {t.member}
          </label>
          <select
            value={memberId}
            onChange={event => {
              setMemberId(event.target.value);
              setPage(1);
            }}
            className={inputStyle}
          >
            <option value="">{t.chooseMember}</option>
            {members.map(member => (
              <option key={member.id} value={member.id}>
                {member.member_code
                  ? `${member.member_code} - `
                  : ''}
                {displayMember(member)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            {t.status}
          </label>
          <select
            value={status}
            onChange={event => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className={inputStyle}
          >
            <option value="">{t.all}</option>
            <option value="pending">{t.pending}</option>
            <option value="paid">{t.paid}</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title={t.total}
          value={summary?.total_accounts ?? '—'}
          Icon={Wallet}
        />
        <SummaryCard
          title={t.expected}
          value={summary ? money(summary.expected_amount) : '—'}
          Icon={CalendarDays}
        />
        <SummaryCard
          title={t.collected}
          value={summary ? money(summary.collected_amount) : '—'}
          Icon={CheckCircle2}
        />
        <SummaryCard
          title={t.outstanding}
          value={summary ? money(summary.pending_amount) : '—'}
          Icon={Clock3}
        />
      </div>

      {/* Bulk Selection */}
      {memberId && (
        <div className="space-y-4 rounded-2xl border border-indigo-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            {displayMember(selectedMember)}
          </h2>

          {memberLoading ? (
            <p className="text-slate-500">{t.loading}</p>
          ) : pendingRows.length === 0 ? (
            <p className="text-slate-500">{t.noPending}</p>
          ) : (
            <>
              <label className="flex items-center gap-3 border-b pb-4 font-medium">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={event =>
                    toggleAll(event.target.checked)
                  }
                  className="h-5 w-5 accent-indigo-600"
                />
                {t.selectAll} ({pendingRows.length})
              </label>

              <div className="max-h-80 divide-y overflow-y-auto rounded-xl border">
                {pendingRows.map(item => (
                  <label
                    key={item.id}
                    className="flex cursor-pointer items-center justify-between gap-3 p-4 hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleOne(item.id)}
                        className="h-5 w-5 accent-indigo-600"
                      />
                      <span className="font-medium">
                        {item.account?.account_number || '—'}
                      </span>
                    </span>
                    <span className="font-semibold">
                      {money(item.amount)}
                    </span>
                  </label>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-4">
                <div>
                  <p className="text-sm text-slate-500">
                    {t.selected}: {selectedIds.length}
                  </p>
                  <p className="text-xl font-bold text-slate-900">
                    {t.selectedTotal}: {money(selectedTotal)}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={!selectedIds.length || busy}
                  onClick={() => {
                    setPaidAt(today());
                    setConfirmOpen(true);
                  }}
                  className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white disabled:opacity-50"
                >
                  {t.receive} ({selectedIds.length})
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Main List */}
      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4">{t.account}</th>
              <th className="p-4">{t.member}</th>
              <th className="p-4">{t.amount}</th>
              <th className="p-4">{t.status}</th>
              <th className="p-4">{t.paidAt}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center">
                  {t.loading}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center">
                  {t.empty}
                </td>
              </tr>
            ) : (
              rows.map(item => (
                <tr key={item.id} className="border-t">
                  <td className="p-4">
                    {item.account?.account_number || '—'}
                  </td>
                  <td className="p-4">
                    {displayMember(item.member)}
                  </td>
                  <td className="p-4">
                    {money(item.amount)}
                  </td>
                  <td className="p-4">
                    <span className={
                      item.status === 'paid'
                        ? 'text-green-700'
                        : 'text-amber-700'
                    }>
                      {item.status === 'paid'
                        ? t.paid
                        : t.pending}
                    </span>
                  </td>
                  <td className="p-4">
                    {item.paid_at
                      ? String(item.paid_at).slice(0, 10)
                      : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled={loading || page <= 1}
          onClick={() => setPage(value => value - 1)}
          className="rounded-xl border bg-white px-4 py-2 disabled:opacity-50"
        >
          {t.previous}
        </button>
        <span className="text-sm">
          {t.page} {page} / {lastPage}
        </span>
        <button
          type="button"
          disabled={loading || page >= lastPage}
          onClick={() => setPage(value => value + 1)}
          className="rounded-xl border bg-white px-4 py-2 disabled:opacity-50"
        >
          {t.next}
        </button>
      </div>

      {/* Bulk Payment Confirmation */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t.confirm}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <h3 className="text-xl font-bold text-slate-900">
              {t.confirm}
            </h3>

            <p className="mt-3 text-sm text-slate-600">
              {t.note}
            </p>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="font-medium">
                {displayMember(selectedMember)}
              </p>
              <p className="mt-2">
                {t.selected}: {selectedIds.length}
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-700">
                {money(selectedTotal)}
              </p>
            </div>

            <label className="mt-5 block text-sm font-medium">
              {t.date}
            </label>
            <input
              type="date"
              value={paidAt}
              max={today()}
              onChange={event => setPaidAt(event.target.value)}
              className={`mt-2 ${inputStyle}`}
            />

            {error && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirmOpen(false)}
                className="rounded-xl border px-4 py-2.5 disabled:opacity-50"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                disabled={busy || !selectedIds.length}
                onClick={receiveBulk}
                className="rounded-xl bg-emerald-700 px-5 py-2.5 font-medium text-white disabled:opacity-50"
              >
                {busy ? t.processing : t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
