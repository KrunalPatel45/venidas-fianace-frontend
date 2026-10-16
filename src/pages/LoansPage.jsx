import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import {
  Plus,
  Wallet,
  Landmark,
  Percent,
  Search,
  RefreshCw,
  X,
  Eye,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Phone,
  MapPin,
  UserRound,
} from 'lucide-react';

import { loansApi } from '../api/loans';
import { useLanguage } from '../context/LanguageContext';

const translations = {
  gu: {
    title: 'લોન મેનેજમેન્ટ',
    subtitle: 'સભ્યો અને બહારની વ્યક્તિઓની લોન',
    create: 'નવી લોન આપો',
    number: 'લોન નંબર',
    borrower: 'લોન લેનાર',
    type: 'લોન પ્રકાર',
    member: 'સભ્ય',
    external: 'બહારની વ્યક્તિ',
    principal: 'મૂળ રકમ',
    outstanding: 'બાકી મૂળ રકમ',
    rate: 'માસિક વ્યાજ દર',
    status: 'સ્થિતિ',
    active: 'ચાલુ',
    closed: 'બંધ',
    all: 'બધા',
    details: 'વિગતો',
    total: 'કુલ આપેલી લોન',
    balance: 'બાકી લોન',
    interest: 'બાકી વ્યાજ',
    date: 'લોન આપ્યાની તારીખ',
    purpose: 'હેતુ',
    notes: 'નોંધ',
    choose: 'લોન લેનાર પસંદ કરો',
    save: 'રોકડ લોન આપો',
    cancel: 'રદ કરો',
    confirmTitle: 'લોનની પુષ્ટિ',
    confirm: 'શું આ વ્યક્તિને ખરેખર રોકડ રકમ આપી છે?',
    confirmButton: 'હા, લોન આપો',
    cash: 'માત્ર રોકડ',
    loading: 'લોડ થઈ રહ્યું છે...',
    empty: 'કોઈ લોન મળી નથી.',
    previous: 'પાછળ',
    next: 'આગળ',
    success: 'લોન સફળતાપૂર્વક નોંધાઈ.',
    error: 'વિનંતી પૂર્ણ થઈ શકી નથી.',
    refresh: 'રિફ્રેશ',
    warning:
      'રોકડ ખરેખર આપ્યા પછી જ Confirm કરો. Society Cash Balance માંથી રકમ ઘટશે.',
    search: 'લોન નંબર અથવા નામ શોધો',
    searchBorrower: 'નામ, કોડ, મોબાઇલ અથવા Email શોધો',
    noBorrowers: 'કોઈ લોન લેનાર મળ્યો નથી.',
    noExternal: 'કોઈ Active External Borrower મળ્યો નથી.',
    selected: 'પસંદ કરેલ વ્યક્તિ',
    change: 'બદલો',
    page: 'પેજ',
    records: 'કુલ રેકોર્ડ',
    selectError: 'પહેલાં લોન લેનાર પસંદ કરો.',
    amountError: 'યોગ્ય લોન રકમ દાખલ કરો.',
    dateError: 'યોગ્ય તારીખ પસંદ કરો.',
    responseError:
      'Loan ID મળ્યો નથી. ફરી Submit કરતાં પહેલાં Loan List ચકાસો.',
    retry: 'ફરી પ્રયાસ કરો',
    phone: 'મોબાઇલ નંબર',
    address: 'સરનામું',
    borrowerCode: 'લોન લેનારનો કોડ',
    borrowerDetails: 'લોન લેનારની વિગતો',
  },

  en: {
    title: 'Loan Management',
    subtitle: 'Manage member and external loans',
    create: 'Create Loan',
    number: 'Loan Number',
    borrower: 'Borrower',
    type: 'Loan Type',
    member: 'Member',
    external: 'External Borrower',
    principal: 'Principal Amount',
    outstanding: 'Outstanding Principal',
    rate: 'Monthly Interest Rate',
    status: 'Status',
    active: 'Active',
    closed: 'Closed',
    all: 'All',
    details: 'Details',
    total: 'Total Disbursed',
    balance: 'Outstanding Loans',
    interest: 'Pending Interest',
    date: 'Disbursement Date',
    purpose: 'Purpose',
    notes: 'Notes',
    choose: 'Select Borrower',
    save: 'Disburse Cash Loan',
    cancel: 'Cancel',
    confirmTitle: 'Confirm Loan',
    confirm:
      'Has the cash actually been given to this borrower?',
    confirmButton: 'Yes, Disburse Loan',
    cash: 'Cash Only',
    loading: 'Loading...',
    empty: 'No loans found.',
    previous: 'Previous',
    next: 'Next',
    success: 'Loan recorded successfully.',
    error: 'Request failed.',
    refresh: 'Refresh',
    warning:
      'Confirm only after cash has been handed over. Society Cash Balance will decrease.',
    search: 'Search loan number or borrower',
    searchBorrower: 'Search name, code, phone or email',
    noBorrowers: 'No eligible borrowers found.',
    noExternal: 'No active external borrowers found.',
    selected: 'Selected Borrower',
    change: 'Change',
    page: 'Page',
    records: 'Total Records',
    selectError: 'Please select a borrower.',
    amountError: 'Enter a valid loan amount.',
    dateError: 'Select a valid date.',
    responseError:
      'Loan ID was not returned. Check the loan list before submitting again.',
    retry: 'Retry',
    phone: 'Mobile Number',
    address: 'Address',
    borrowerCode: 'Borrower Code',
    borrowerDetails: 'Borrower Details',
  },
};

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white ' +
  'px-3 py-2.5 text-slate-900 outline-none ' +
  'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100';

const primaryButton =
  'inline-flex items-center justify-center gap-2 ' +
  'rounded-xl bg-indigo-600 px-4 py-2.5 font-medium ' +
  'text-white hover:bg-indigo-700 disabled:opacity-50 ' +
  'disabled:cursor-not-allowed';

const secondaryButton =
  'inline-flex items-center justify-center gap-2 ' +
  'rounded-xl border border-slate-300 bg-white ' +
  'px-4 py-2.5 font-medium text-slate-700 ' +
  'hover:bg-slate-50 disabled:opacity-50';

function today() {
  const date = new Date();

  return new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 10);
}

function money(value) {
  const amount = Number(value || 0);

  return `₹${amount.toLocaleString('en-IN', {
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

function newLoanForm() {
  return {
    borrower_id: '',
    loan_type: 'member',
    principal_amount: '',
    disbursed_at: today(),
    disbursement_method: 'cash',
    purpose: '',
    notes: '',
    idempotency_key: crypto.randomUUID(),
  };
}

function getErrorMessage(error, fallback) {
  const data = error?.response?.data;

  if (data?.errors) {
    const first = Object.values(data.errors)[0];

    if (Array.isArray(first) && first.length) {
      return first[0];
    }

    if (typeof first === 'string') {
      return first;
    }
  }

  return data?.message || error?.message || fallback;
}

function getFieldErrors(error) {
  return error?.response?.data?.errors || {};
}

function getPaginator(response) {
  const payload = response?.data?.data;

  if (Array.isArray(payload)) {
    return {
      data: payload,
      current_page: 1,
      last_page: 1,
      total: payload.length,
    };
  }

  if (payload && Array.isArray(payload.data)) {
    return payload;
  }

  throw new Error('Invalid API pagination response.');
}

function borrowerName(borrower, lang) {
  if (!borrower) return '—';

  return lang === 'gu'
    ? borrower.name_gu ||
        borrower.name ||
        borrower.email ||
        '—'
    : borrower.name ||
        borrower.name_gu ||
        borrower.email ||
        '—';
}

function SummaryCard({ title, amount, Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {title}
        </p>

        <Icon
          size={20}
          className="text-indigo-600"
        />
      </div>

      <p className="mt-3 text-2xl font-bold text-slate-900">
        {money(amount)}
      </p>
    </div>
  );
}

function BorrowerSelector({
  loanType,
  value,
  onChange,
  onSelectBorrower,
  lang,
  t,
  disabled,
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);

  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const response = await loansApi.borrowers({
          loan_type: loanType,
          search: search.trim(),
          page,
        });

        if (cancelled) return;

        const paginator = getPaginator(response);

        setRows(paginator.data || []);

        setLastPage(
          Math.max(1, Number(paginator.last_page || 1))
        );

        setTotal(Number(paginator.total || 0));
      } catch (err) {
        if (cancelled) return;

        setRows([]);
        setLastPage(1);
        setTotal(0);
        setError(getErrorMessage(err, t.error));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const timer = setTimeout(load, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [loanType, search, page, reload, t.error]);

  function choose(borrower) {
    if (disabled || !borrower?.id) return;

    setSelected(borrower);
    onChange(String(borrower.id));
    onSelectBorrower(borrower);
  }

  function clear() {
    if (disabled) return;

    setSelected(null);
    onChange('');
    onSelectBorrower(null);
  }

  return (
    <div className="space-y-3">
      {selected && value && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <p className="text-xs text-green-700">
                {t.selected}
              </p>

              <p className="font-semibold text-green-900">
                {borrowerName(selected, lang)}
              </p>

              <p className="text-xs text-green-700">
                {selected.member_code ||
                  selected.email ||
                  ''}
                {' · '}
                ID {selected.id}
              </p>

              {selected.phone && (
                <p className="flex items-center gap-2 text-sm text-green-800">
                  <Phone size={15} />
                  {selected.phone}
                </p>
              )}

              {selected.address && (
                <p className="flex items-start gap-2 text-sm text-green-800">
                  <MapPin
                    size={15}
                    className="mt-0.5 shrink-0"
                  />
                  <span>{selected.address}</span>
                </p>
              )}
            </div>

            <button
              type="button"
              disabled={disabled}
              onClick={clear}
              className="text-sm font-medium text-red-600 disabled:opacity-50"
            >
              {t.change}
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-3 text-slate-400"
        />

        <input
          type="text"
          disabled={disabled}
          value={search}
          onChange={event => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder={t.searchBorrower}
          className={`${inputClass} pl-10`}
        />
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <p>{error}</p>

          <button
            type="button"
            onClick={() => setReload(v => v + 1)}
            className="mt-2 font-medium underline"
          >
            {t.retry}
          </button>
        </div>
      )}

      <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200">
        {loading ? (
          <p className="p-4 text-center text-sm text-slate-500">
            {t.loading}
          </p>
        ) : rows.length === 0 ? (
          <p className="p-4 text-center text-sm text-slate-500">
            {loanType === 'external'
              ? t.noExternal
              : t.noBorrowers}
          </p>
        ) : (
          rows.map(borrower => {
            const active =
              String(value) === String(borrower.id);

            return (
              <button
                key={borrower.id}
                type="button"
                disabled={disabled}
                onClick={() => choose(borrower)}
                className={`flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left hover:bg-indigo-50 disabled:opacity-50 ${
                  active ? 'bg-indigo-100' : ''
                }`}
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-800">
                    {borrowerName(borrower, lang)}
                  </p>

                  <p className="text-xs text-slate-500">
                    {borrower.member_code ||
                      borrower.email ||
                      '—'}
                    {' · '}
                    ID {borrower.id}
                  </p>

                  {borrower.phone && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-600">
                      <Phone size={13} />
                      {borrower.phone}
                    </p>
                  )}

                  {borrower.address && (
                    <p className="mt-1 flex items-start gap-1 text-xs text-slate-600">
                      <MapPin
                        size={13}
                        className="mt-0.5 shrink-0"
                      />
                      <span>{borrower.address}</span>
                    </p>
                  )}
                </div>

                {active && (
                  <CheckCircle2
                    size={19}
                    className="shrink-0 text-green-600"
                  />
                )}
              </button>
            );
          })
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          disabled={disabled || loading || page <= 1}
          onClick={() => setPage(p => p - 1)}
          className={secondaryButton}
        >
          <ChevronLeft size={16} />
          {t.previous}
        </button>

        <div className="text-center text-xs text-slate-500">
          <p>
            {t.page}: {page}/{lastPage}
          </p>

          <p>
            {t.records}: {total}
          </p>
        </div>

        <button
          type="button"
          disabled={
            disabled || loading || page >= lastPage
          }
          onClick={() => setPage(p => p + 1)}
          className={secondaryButton}
        >
          {t.next}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default function LoansPage() {
  const navigate = useNavigate();

  const { language } = useLanguage();
  const lang = language === 'gu' ? 'gu' : 'en';
  const t = translations[lang];

  const [loans, setLoans] = useState([]);
  const [summary, setSummary] = useState(null);

  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [form, setForm] = useState(newLoanForm);

  const [selectedBorrower, setSelectedBorrower] =
    useState(null);

  const [busy, setBusy] = useState(false);
  const submittingRef = useRef(false);

  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const params = {
          page,
          per_page: 20,
        };

        if (type) params.loan_type = type;
        if (status) params.status = status;

        const [listResponse, summaryResponse] =
          await Promise.all([
            loansApi.list(params),
            loansApi.summary(),
          ]);

        if (cancelled) return;

        const paginator = getPaginator(listResponse);

        setLoans(paginator.data || []);

        setLastPage(
          Math.max(1, Number(paginator.last_page || 1))
        );

        setTotalRows(Number(paginator.total || 0));

        setSummary(
          summaryResponse?.data?.data || null
        );
      } catch (err) {
        if (cancelled) return;

        setError(getErrorMessage(err, t.error));
        setLoans([]);
        setSummary(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [page, type, status, refreshKey, t.error]);

  const totals = useMemo(() => {
    return (summary?.loans || []).reduce(
      (result, row) => ({
        disbursed:
          result.disbursed +
          Number(row.total_disbursed || 0),

        outstanding:
          result.outstanding +
          Number(row.outstanding || 0),
      }),
      {
        disbursed: 0,
        outstanding: 0,
      }
    );
  }, [summary]);

  const pendingInterest = useMemo(() => {
    return (summary?.interest || [])
      .filter(row => row.status === 'pending')
      .reduce(
        (sum, row) =>
          sum + Number(row.amount || 0),
        0
      );
  }, [summary]);

  const filteredLoans = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return loans;

    return loans.filter(loan => {
      const text = [
        loan.loan_number,
        loan.borrower?.name,
        loan.borrower?.name_gu,
        loan.borrower?.member_code,
        loan.borrower?.phone,
        loan.borrower?.address,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return text.includes(query);
    });
  }, [loans, search]);

  function refresh() {
    setRefreshKey(v => v + 1);
  }

  function openCreateModal() {
    setForm(newLoanForm());
    setSelectedBorrower(null);
    setFormError('');
    setFieldErrors({});
    setError('');
    setSuccess('');
    setConfirmOpen(false);
    setModalOpen(true);
  }

  function closeCreateModal() {
    if (busy) return;

    setConfirmOpen(false);
    setModalOpen(false);
    setFormError('');
    setFieldErrors({});
  }

  function updateForm(field, value) {
    setForm(previous => ({
      ...previous,
      [field]: value,
    }));

    setFormError('');

    setFieldErrors(previous => {
      const next = { ...previous };
      delete next[field];
      return next;
    });
  }

  function changeLoanType(value) {
    setForm(previous => ({
      ...previous,
      loan_type: value,
      borrower_id: '',
    }));

    setSelectedBorrower(null);
    setFormError('');
    setFieldErrors({});
  }

  function createLoan(event) {
    event.preventDefault();

    if (busy || submittingRef.current) return;

    setFormError('');
    setFieldErrors({});

    if (!form.borrower_id || !selectedBorrower) {
      setFormError(t.selectError);
      return;
    }

    const amount = Number(form.principal_amount);

    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount > 999999999999.99 ||
      !/^\d+(\.\d{1,2})?$/.test(
        String(form.principal_amount).trim()
      )
    ) {
      setFormError(t.amountError);
      return;
    }

    if (
      !form.disbursed_at ||
      !/^\d{4}-\d{2}-\d{2}$/.test(
        form.disbursed_at
      ) ||
      form.disbursed_at > today()
    ) {
      setFormError(t.dateError);
      return;
    }

    setConfirmOpen(true);
  }

  async function confirmCreateLoan() {
    if (submittingRef.current) return;

    submittingRef.current = true;
    setBusy(true);
    setFormError('');
    setFieldErrors({});

    try {
      const payload = {
        borrower_id: Number(form.borrower_id),
        loan_type: form.loan_type,
        principal_amount: form.principal_amount,
        disbursed_at: form.disbursed_at,
        disbursement_method: 'cash',
        idempotency_key: form.idempotency_key,
        purpose: form.purpose.trim() || null,
        notes: form.notes.trim() || null,
      };

      const response = await loansApi.create(payload);

      const createdLoan = response?.data?.data;

      setConfirmOpen(false);

      if (!createdLoan?.id) {
        setFormError(t.responseError);
        refresh();
        return;
      }

      setModalOpen(false);
      setSuccess(t.success);

      navigate(`/admin/loans/${createdLoan.id}`);
    } catch (err) {
      setConfirmOpen(false);
      setFieldErrors(getFieldErrors(err));
      setFormError(getErrorMessage(err, t.error));
    } finally {
      submittingRef.current = false;
      setBusy(false);
    }
  }

  function fieldError(field) {
    const errors = fieldErrors[field];

    if (!errors) return null;

    return (
      <p className="mt-1 text-sm text-red-600">
        {Array.isArray(errors) ? errors[0] : errors}
      </p>
    );
  }

  return (
    <div className="space-y-6">
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

        <div className="flex gap-2">
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className={secondaryButton}
          >
            <RefreshCw size={17} />
            {t.refresh}
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className={primaryButton}
          >
            <Plus size={18} />
            {t.create}
          </button>
        </div>
      </div>

      {/* ALERTS */}

      {error && (
        <div
          role="alert"
          className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
        >
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700"
        >
          <CheckCircle2 size={20} />
          <p>{success}</p>
        </div>
      )}

      {/* SUMMARY */}

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          title={t.total}
          amount={totals.disbursed}
          Icon={Wallet}
        />

        <SummaryCard
          title={t.balance}
          amount={totals.outstanding}
          Icon={Landmark}
        />

        <SummaryCard
          title={t.interest}
          amount={pendingInterest}
          Icon={Percent}
        />
      </div>

      {/* FILTERS */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium">
              {t.type}
            </label>

            <select
              value={type}
              onChange={event => {
                setType(event.target.value);
                setPage(1);
              }}
              className={inputClass}
            >
              <option value="">{t.all}</option>
              <option value="member">{t.member}</option>
              <option value="external">{t.external}</option>
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
              className={inputClass}
            >
              <option value="">{t.all}</option>
              <option value="active">{t.active}</option>
              <option value="closed">{t.closed}</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              {t.search}
            </label>

            <div className="relative">
              <Search
                size={18}
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
        </div>
      </div>

      {/* LOAN TABLE */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {[
                  t.number,
                  t.borrower,
                  t.type,
                  t.principal,
                  t.outstanding,
                  t.rate,
                  t.status,
                  t.date,
                  t.details,
                ].map((heading, index) => (
                  <th
                    key={index}
                    className="whitespace-nowrap px-4 py-3 text-left font-semibold"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    {t.loading}
                  </td>
                </tr>
              ) : filteredLoans.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    {t.empty}
                  </td>
                </tr>
              ) : (
                filteredLoans.map(loan => (
                  <tr
                    key={loan.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-indigo-700">
                      {loan.loan_number || `#${loan.id}`}
                    </td>

                    <td className="px-4 py-3">
                      <p className="flex items-center gap-2 font-medium text-slate-900">
                        <UserRound
                          size={16}
                          className="text-indigo-600"
                        />

                        {borrowerName(
                          loan.borrower,
                          lang
                        )}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {loan.borrower?.member_code || ''}
                      </p>

                      {loan.borrower?.phone && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-600">
                          <Phone size={13} />
                          {loan.borrower.phone}
                        </p>
                      )}

                      {loan.borrower?.address && (
                        <p className="mt-1 flex max-w-xs items-start gap-1 text-xs text-slate-500">
                          <MapPin
                            size={13}
                            className="mt-0.5 shrink-0"
                          />

                          <span className="break-words">
                            {loan.borrower.address}
                          </span>
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          loan.loan_type === 'external'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {loan.loan_type === 'member'
                          ? t.member
                          : t.external}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      {money(loan.principal_amount)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      {money(
                        loan.outstanding_principal
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {loan.monthly_interest_rate != null
                        ? `${Number(
                            loan.monthly_interest_rate
                          )}%`
                        : loan.loan_type === 'member'
                          ? '1%'
                          : '2%'}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          loan.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {loan.status === 'active'
                          ? t.active
                          : t.closed}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      {formatDate(loan.disbursed_at)}
                    </td>

                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/loans/${loan.id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-2 text-indigo-700 hover:bg-indigo-100"
                      >
                        <Eye size={16} />
                        {t.details}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={loading || page <= 1}
          onClick={() => setPage(p => p - 1)}
          className={secondaryButton}
        >
          <ChevronLeft size={17} />
          {t.previous}
        </button>

        <div className="text-center text-sm text-slate-600">
          <p>
            {t.page}: {page}/{lastPage}
          </p>

          <p>
            {t.records}: {totalRows}
          </p>
        </div>

        <button
          type="button"
          disabled={loading || page >= lastPage}
          onClick={() => setPage(p => p + 1)}
          className={secondaryButton}
        >
          {t.next}
          <ChevronRight size={17} />
        </button>
      </div>

      {/* CREATE LOAN MODAL */}

      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-4">
          <div className="flex min-h-full items-start justify-center">
            <form
              onSubmit={createLoan}
              className="my-6 w-full max-w-2xl space-y-5 rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h2 className="text-xl font-bold">
                    {t.create}
                  </h2>

                  <p className="text-sm text-slate-500">
                    {t.cash}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={busy}
                  onClick={closeCreateModal}
                  aria-label="Close"
                  className="rounded-lg p-2 hover:bg-slate-100"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <AlertCircle
                  size={20}
                  className="shrink-0"
                />

                <p>{t.warning}</p>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  {formError}
                </div>
              )}

              {/* LOAN TYPE */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t.type} *
                </label>

                <select
                  required
                  disabled={busy}
                  value={form.loan_type}
                  onChange={event =>
                    changeLoanType(event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="member">
                    {t.member} — 1%
                  </option>

                  <option value="external">
                    {t.external} — 2%
                  </option>
                </select>

                {fieldError('loan_type')}
              </div>

              {/* BORROWER */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t.borrower} *
                </label>

                <BorrowerSelector
                  key={form.loan_type}
                  loanType={form.loan_type}
                  value={form.borrower_id}
                  onChange={id =>
                    updateForm('borrower_id', id)
                  }
                  onSelectBorrower={setSelectedBorrower}
                  lang={lang}
                  t={t}
                  disabled={busy}
                />

                {fieldError('borrower_id')}
              </div>

              {/* AMOUNT AND DATE */}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    {t.principal} *
                  </label>

                  <input
                    required
                    disabled={busy}
                    type="number"
                    min="0.01"
                    max="999999999999.99"
                    step="0.01"
                    value={form.principal_amount}
                    onChange={event =>
                      updateForm(
                        'principal_amount',
                        event.target.value
                      )
                    }
                    className={inputClass}
                  />

                  {fieldError('principal_amount')}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    {t.date} *
                  </label>

                  <input
                    required
                    disabled={busy}
                    type="date"
                    max={today()}
                    value={form.disbursed_at}
                    onChange={event =>
                      updateForm(
                        'disbursed_at',
                        event.target.value
                      )
                    }
                    className={inputClass}
                  />

                  {fieldError('disbursed_at')}
                </div>
              </div>

              {/* INTEREST */}

              <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                <p className="text-sm text-indigo-700">
                  {t.rate}
                </p>

                <p className="mt-1 text-xl font-bold text-indigo-900">
                  {form.loan_type === 'member'
                    ? '1% / Month'
                    : '2% / Month'}
                </p>
              </div>

              {/* PURPOSE */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t.purpose}
                </label>

                <input
                  type="text"
                  disabled={busy}
                  maxLength={500}
                  value={form.purpose}
                  onChange={event =>
                    updateForm(
                      'purpose',
                      event.target.value
                    )
                  }
                  className={inputClass}
                />

                {fieldError('purpose')}
              </div>

              {/* NOTES */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t.notes}
                </label>

                <textarea
                  rows={3}
                  disabled={busy}
                  maxLength={5000}
                  value={form.notes}
                  onChange={event =>
                    updateForm(
                      'notes',
                      event.target.value
                    )
                  }
                  className={inputClass}
                />

                {fieldError('notes')}
              </div>

              {/* ACTIONS */}

              <div className="flex justify-end gap-3 border-t pt-5">
                <button
                  type="button"
                  disabled={busy}
                  onClick={closeCreateModal}
                  className={secondaryButton}
                >
                  {t.cancel}
                </button>

                <button
                  type="submit"
                  disabled={
                    busy ||
                    !form.borrower_id ||
                    !form.principal_amount
                  }
                  className={primaryButton}
                >
                  {busy ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="animate-spin"
                      />
                      {t.loading}
                    </>
                  ) : (
                    <>
                      <Wallet size={18} />
                      {t.save}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}

      {confirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="loan-confirm-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-indigo-100 p-3">
                <Wallet
                  size={24}
                  className="text-indigo-700"
                />
              </div>

              <div>
                <h3
                  id="loan-confirm-title"
                  className="text-xl font-bold text-slate-900"
                >
                  {t.confirmTitle}
                </h3>

                <p className="text-sm text-slate-500">
                  {t.cash}
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-700">
              {t.confirm}
            </p>

            <div className="mt-5 space-y-4 rounded-xl bg-slate-50 p-4">
              <div>
                <p className="text-xs text-slate-500">
                  {t.borrower}
                </p>

                <p className="font-semibold text-slate-900">
                  {borrowerName(
                    selectedBorrower,
                    lang
                  )}
                </p>
              </div>

              {selectedBorrower?.phone && (
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm text-slate-500">
                    {t.phone}
                  </span>

                  <strong className="text-sm">
                    {selectedBorrower.phone}
                  </strong>
                </div>
              )}

              {selectedBorrower?.address && (
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm text-slate-500">
                    {t.address}
                  </span>

                  <strong className="max-w-[65%] text-right text-sm">
                    {selectedBorrower.address}
                  </strong>
                </div>
              )}

              <div className="flex justify-between gap-3">
                <span className="text-sm text-slate-500">
                  {t.type}
                </span>

                <strong className="text-sm">
                  {form.loan_type === 'member'
                    ? t.member
                    : t.external}
                </strong>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-sm text-slate-500">
                  {t.principal}
                </span>

                <strong className="text-lg text-indigo-700">
                  {money(form.principal_amount)}
                </strong>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-sm text-slate-500">
                  {t.rate}
                </span>

                <strong className="text-sm">
                  {form.loan_type === 'member'
                    ? '1% / Month'
                    : '2% / Month'}
                </strong>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-sm text-slate-500">
                  {t.date}
                </span>

                <strong className="text-sm">
                  {formatDate(form.disbursed_at)}
                </strong>
              </div>
            </div>

            <div className="mt-4 flex gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
              <AlertCircle
                size={18}
                className="shrink-0"
              />

              <p>{t.warning}</p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  setConfirmOpen(false)
                }
                className={secondaryButton}
              >
                {t.cancel}
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={confirmCreateLoan}
                className={primaryButton}
              >
                {busy ? (
                  <>
                    <RefreshCw
                      size={17}
                      className="animate-spin"
                    />
                    {t.loading}
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    {t.confirmButton}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}