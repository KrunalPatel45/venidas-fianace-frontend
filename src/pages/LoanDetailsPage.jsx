import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Link, useParams } from 'react-router-dom';

import {
  ArrowLeft,
  Wallet,
  Percent,
  CheckCircle2,
  RefreshCw,
  X,
  AlertTriangle,
  CalendarDays,
  Phone,
  Mail,
  MapPin,
  UserRound,
} from 'lucide-react';

import { loansApi } from '../api/loans';
import { useLanguage } from '../context/LanguageContext';

const translations = {
  gu: {
    back: 'લોન લિસ્ટ પર પાછા જાઓ',
    title: 'લોનની વિગતો',
    borrower: 'લોન લેનાર',
    borrowerDetails: 'લોન લેનારની વિગતો',
    borrowerType: 'લોન પ્રકાર',
    member: 'સભ્ય',
    external: 'બહારની વ્યક્તિ',
    borrowerCode: 'લોન લેનારનો કોડ',
    phone: 'મોબાઇલ નંબર',
    email: 'ઈમેલ',
    address: 'સરનામું',
    number: 'લોન નંબર',
    principal: 'મૂળ રકમ',
    outstanding: 'બાકી મૂળ રકમ',
    rate: 'માસિક વ્યાજ દર',
    disbursed: 'લોન આપ્યાની તારીખ',
    status: 'સ્થિતિ',
    active: 'ચાલુ',
    closed: 'બંધ',
    interest: 'માસિક વ્યાજ',
    month: 'મહિનો',
    generate: 'વ્યાજ બનાવો',
    receiveInterest: 'વ્યાજની રોકડ મેળવો',
    repay: 'મૂળ રકમ પરત મેળવો',
    amount: 'રકમ',
    date: 'રોકડ મળ્યાની તારીખ',
    pending: 'બાકી',
    paid: 'ચૂકવેલ',
    receipt: 'રસીદ નંબર',
    confirm: 'પુષ્ટિ કરો',
    cancel: 'રદ કરો',
    loading: 'લોડ થઈ રહ્યું છે...',
    empty: 'કોઈ રેકોર્ડ નથી.',
    history: 'મૂળ રકમ પરત ચુકવણીનો ઇતિહાસ',
    interestHistory: 'વ્યાજનો ઇતિહાસ',
    generateSuccess: 'વ્યાજ બનાવવાની પ્રક્રિયા પૂર્ણ થઈ.',
    interestSuccess: 'વ્યાજની રોકડ નોંધાઈ.',
    repaymentSuccess: 'મૂળ રકમની રોકડ નોંધાઈ.',
    error: 'વિનંતી પૂર્ણ થઈ શકી નથી.',
    previous: 'પાછળ',
    next: 'આગળ',
    refresh: 'ફરી લોડ કરો',
    purpose: 'હેતુ',
    notes: 'નોંધ',
    invalidDate: 'માન્ય તારીખ પસંદ કરો.',
    invalidAmount: 'માન્ય રકમ દાખલ કરો.',
    generateTitle: 'વ્યાજ બનાવવાની પુષ્ટિ',
    generateConfirm: 'શું પસંદ કરેલા મહિના માટે વ્યાજ બનાવવું છે?',
    interestTitle: 'વ્યાજની રોકડની પુષ્ટિ',
    interestConfirm: 'શું આ વ્યાજની રોકડ ખરેખર મળી ગઈ છે?',
    repaymentTitle: 'મૂળ રકમ પરત મળ્યાની પુષ્ટિ',
    repaymentConfirm: 'શું આ મૂળ રકમની રોકડ ખરેખર મળી ગઈ છે?',
    generateWarning:
      'આ પ્રક્રિયા વ્યાજની એન્ટ્રી બનાવે છે. રોકડ મળ્યાની એન્ટ્રી કરતી નથી.',
    interestWarning:
      'માત્ર ખરેખર મળેલી રોકડ નોંધો. Society Cash વધશે.',
    repaymentWarning:
      'માત્ર ખરેખર મળેલી રોકડ નોંધો. બાકી મૂળ રકમ ઘટશે અને Society Cash વધશે.',
    processing: 'પ્રક્રિયા ચાલુ છે...',
    created: 'નવી',
    existing: 'પહેલેથી હાજર',
    skipped: 'છોડી દીધેલ',
  },

  en: {
    back: 'Back to Loan List',
    title: 'Loan Details',
    borrower: 'Borrower',
    borrowerDetails: 'Borrower Details',
    borrowerType: 'Loan Type',
    member: 'Member',
    external: 'External Borrower',
    borrowerCode: 'Borrower Code',
    phone: 'Mobile Number',
    email: 'Email',
    address: 'Address',
    number: 'Loan Number',
    principal: 'Principal Amount',
    outstanding: 'Outstanding Principal',
    rate: 'Monthly Interest Rate',
    disbursed: 'Disbursement Date',
    status: 'Status',
    active: 'Active',
    closed: 'Closed',
    interest: 'Monthly Interest',
    month: 'Month',
    generate: 'Generate Interest',
    receiveInterest: 'Receive Interest Cash',
    repay: 'Receive Principal Repayment',
    amount: 'Amount',
    date: 'Cash Received Date',
    pending: 'Pending',
    paid: 'Paid',
    receipt: 'Receipt Number',
    confirm: 'Confirm',
    cancel: 'Cancel',
    loading: 'Loading...',
    empty: 'No records found.',
    history: 'Principal Repayment History',
    interestHistory: 'Interest History',
    generateSuccess: 'Interest generation completed.',
    interestSuccess: 'Interest cash recorded.',
    repaymentSuccess: 'Principal repayment recorded.',
    error: 'Request failed.',
    previous: 'Previous',
    next: 'Next',
    refresh: 'Refresh',
    purpose: 'Purpose',
    notes: 'Notes',
    invalidDate: 'Select a valid date.',
    invalidAmount: 'Enter a valid amount.',
    generateTitle: 'Confirm Interest Generation',
    generateConfirm: 'Generate interest for the selected month?',
    interestTitle: 'Confirm Interest Payment',
    interestConfirm: 'Has this interest cash actually been received?',
    repaymentTitle: 'Confirm Principal Repayment',
    repaymentConfirm:
      'Has this principal cash actually been received?',
    generateWarning:
      'This generates interest entries. It does not record a cash receipt.',
    interestWarning:
      'Record only cash actually received. Society Cash will increase.',
    repaymentWarning:
      'Record only cash actually received. Outstanding principal decreases and Society Cash increases.',
    processing: 'Processing...',
    created: 'Created',
    existing: 'Existing',
    skipped: 'Skipped',
  },
};

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100';

const primaryButton =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50';

const secondaryButton =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50';

function today() {
  const date = new Date();

  return new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 10);
}

function money(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function dateOnly(value) {
  return value ? String(value).slice(0, 10) : '';
}

function errorMessage(error, fallback) {
  const data = error?.response?.data;

  const first = data?.errors
    ? Object.values(data.errors)[0]
    : null;

  return (
    (Array.isArray(first) ? first[0] : null) ||
    data?.message ||
    error?.message ||
    fallback
  );
}

function newRepayment() {
  return {
    amount: '',
    paid_at: today(),
    idempotency_key: crypto.randomUUID(),
  };
}

function DetailCard({ label, value, Icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <Icon size={19} className="text-indigo-600" />
      </div>

      <p className="mt-2 text-xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function InformationField({ label, value, Icon }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        {Icon && <Icon size={16} />}
        <span>{label}</span>
      </div>

      <p className="mt-1 break-words font-medium text-slate-900">
        {value || '—'}
      </p>
    </div>
  );
}

function StatusBadge({ status, t }) {
  const paid = status === 'paid';
  const active = status === 'active';

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        paid || active
          ? 'bg-green-100 text-green-700'
          : status === 'pending'
            ? 'bg-amber-100 text-amber-700'
            : 'bg-slate-100 text-slate-600'
      }`}
    >
      {paid
        ? t.paid
        : status === 'pending'
          ? t.pending
          : active
            ? t.active
            : t.closed}
    </span>
  );
}

function ConfirmModal({
  open,
  title,
  description,
  warning,
  details,
  busy,
  error,
  onClose,
  onConfirm,
  t,
}) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event) {
      if (event.key === 'Escape' && !busy) {
        onClose();
      }
    }

    document.addEventListener('keydown', onKeyDown);

    return () =>
      document.removeEventListener('keydown', onKeyDown);
  }, [open, busy, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/70 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-loan-action"
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="border-b border-slate-100 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-indigo-100 p-3">
              <CheckCircle2
                size={24}
                className="text-indigo-700"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h3
                id="confirm-loan-action"
                className="text-lg font-bold text-slate-900"
              >
                {title}
              </h3>

              <p className="mt-1 text-sm text-slate-600">
                {description}
              </p>
            </div>

            <button
              type="button"
              disabled={busy}
              onClick={onClose}
              aria-label="Close"
              className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="space-y-3 rounded-xl bg-slate-50 p-4">
            {details.map((item, index) => (
              <div
                key={index}
                className="flex items-start justify-between gap-3 text-sm"
              >
                <span className="text-slate-500">
                  {item.label}
                </span>

                <strong className="text-right text-slate-900">
                  {item.value}
                </strong>
              </div>
            ))}
          </div>

          <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <AlertTriangle
              size={19}
              className="shrink-0 text-amber-700"
            />

            <p className="text-sm text-amber-800">
              {warning}
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 p-5">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className={secondaryButton}
          >
            {t.cancel}
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={primaryButton}
          >
            {busy ? (
              <>
                <RefreshCw
                  size={17}
                  className="animate-spin"
                />
                {t.processing}
              </>
            ) : (
              <>
                <CheckCircle2 size={17} />
                {t.confirm}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoanDetailsPage() {
  const { loanId } = useParams();
  const { language } = useLanguage();

  const lang = language === 'gu' ? 'gu' : 'en';
  const t = translations[lang];

  const [loan, setLoan] = useState(null);
  const [month, setMonth] = useState(today().slice(0, 7));

  const [interestRows, setInterestRows] = useState([]);
  const [interestPage, setInterestPage] = useState(1);
  const [interestLastPage, setInterestLastPage] =
    useState(1);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalError, setModalError] = useState('');

  const [repaymentOpen, setRepaymentOpen] = useState(false);
  const [repayment, setRepayment] = useState(newRepayment);

  const [selectedInterest, setSelectedInterest] =
    useState(null);

  const [interestPaidAt, setInterestPaidAt] =
    useState(today());

  const [confirmAction, setConfirmAction] = useState(null);

  const actionLock = useRef(false);

  const refresh = useCallback(() => {
    setRefreshKey(previous => previous + 1);
  }, []);

  const closeConfirm = useCallback(() => {
    if (actionLock.current) return;

    setConfirmAction(null);
    setModalError('');
  }, []);

  const loadData = useCallback(
    async signal => {
      setLoading(true);
      setError('');

      try {
        const [detailsResponse, interestResponse] =
          await Promise.all([
            loansApi.details(loanId),
            loansApi.interestList({
              month,
              loan_id: loanId,
              page: interestPage,
              per_page: 20,
            }),
          ]);

        if (signal.aborted) return;

        setLoan(detailsResponse?.data?.data || null);

        const paginator = interestResponse?.data?.data;

        if (Array.isArray(paginator)) {
          setInterestRows(paginator);
          setInterestLastPage(1);
        } else {
          setInterestRows(paginator?.data || []);
          setInterestLastPage(
            Math.max(1, Number(paginator?.last_page || 1))
          );
        }
      } catch (err) {
        if (!signal.aborted) {
          setError(errorMessage(err, t.error));
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    },
    [loanId, month, interestPage, refreshKey, t.error]
  );

  useEffect(() => {
    const controller = new AbortController();

    loadData(controller.signal);

    return () => controller.abort();
  }, [loadData]);

  function borrowerName() {
    if (!loan?.borrower) return '—';

    return lang === 'gu'
      ? loan.borrower.name_gu ||
          loan.borrower.name ||
          '—'
      : loan.borrower.name ||
          loan.borrower.name_gu ||
          '—';
  }

  function borrowerType() {
    return loan?.loan_type === 'external'
      ? t.external
      : t.member;
  }

  function requestGenerateInterest() {
    if (busy || !month) return;

    if (month > today().slice(0, 7)) {
      setError(t.invalidDate);
      return;
    }

    setError('');
    setSuccess('');
    setModalError('');
    setConfirmAction('generate');
  }

  function openInterestModal(interest) {
    if (interest.status !== 'pending' || busy) return;

    setSelectedInterest(interest);
    setInterestPaidAt(today());
    setModalError('');
    setError('');
  }

  function requestReceiveInterest() {
    if (!selectedInterest || busy) return;

    const minDate = dateOnly(
      selectedInterest.interest_month
    );

    if (
      !interestPaidAt ||
      interestPaidAt < minDate ||
      interestPaidAt > today()
    ) {
      setModalError(t.invalidDate);
      return;
    }

    setModalError('');
    setConfirmAction('interest');
  }

  function openRepaymentModal() {
    if (!loan || loan.status !== 'active' || busy) {
      return;
    }

    setRepayment(newRepayment());
    setModalError('');
    setError('');
    setRepaymentOpen(true);
  }

  function requestRepayment(event) {
    event.preventDefault();

    if (!loan || busy) return;

    const amount = Number(repayment.amount);
    const outstanding = Number(
      loan.outstanding_principal
    );

    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount > outstanding ||
      !/^\d+(\.\d{1,2})?$/.test(
        String(repayment.amount).trim()
      )
    ) {
      setModalError(t.invalidAmount);
      return;
    }

    if (
      !repayment.paid_at ||
      repayment.paid_at < dateOnly(loan.disbursed_at) ||
      repayment.paid_at > today()
    ) {
      setModalError(t.invalidDate);
      return;
    }

    setModalError('');
    setConfirmAction('repayment');
  }

  async function confirmOperation() {
    if (!confirmAction || actionLock.current) return;

    const action = confirmAction;

    actionLock.current = true;
    setBusy(true);
    setModalError('');
    setError('');
    setSuccess('');

    try {
      if (action === 'generate') {
        const response =
          await loansApi.generateInterest(month);

        const result = response?.data?.data || {};

        setSuccess(
          `${t.generateSuccess} ` +
            `${t.created}: ${result.created ?? 0}, ` +
            `${t.existing}: ${result.existing ?? 0}, ` +
            `${t.skipped}: ${result.skipped ?? 0}`
        );
      } else if (action === 'interest') {
        if (!selectedInterest) {
          throw new Error(t.error);
        }

        await loansApi.receiveInterest(
          selectedInterest.id,
          interestPaidAt
        );

        setSelectedInterest(null);
        setSuccess(t.interestSuccess);
      } else if (action === 'repayment') {
        await loansApi.repayPrincipal(
          loanId,
          repayment
        );

        setRepaymentOpen(false);
        setSuccess(t.repaymentSuccess);
      }

      setConfirmAction(null);
      refresh();
    } catch (err) {
      setModalError(errorMessage(err, t.error));
    } finally {
      actionLock.current = false;
      setBusy(false);
    }
  }

  function getConfirmDetails() {
    if (confirmAction === 'generate') {
      return [
        {
          label: t.number,
          value: loan?.loan_number || '—',
        },
        {
          label: t.borrower,
          value: borrowerName(),
        },
        {
          label: t.month,
          value: month,
        },
      ];
    }

    if (confirmAction === 'interest') {
      return [
        {
          label: t.month,
          value: dateOnly(
            selectedInterest?.interest_month
          ).slice(0, 7),
        },
        {
          label: t.amount,
          value: money(selectedInterest?.amount),
        },
        {
          label: t.date,
          value: interestPaidAt,
        },
      ];
    }

    if (confirmAction === 'repayment') {
      return [
        {
          label: t.borrower,
          value: borrowerName(),
        },
        {
          label: t.amount,
          value: money(repayment.amount),
        },
        {
          label: t.outstanding,
          value: money(loan?.outstanding_principal),
        },
        {
          label: t.date,
          value: repayment.paid_at,
        },
      ];
    }

    return [];
  }

  function getConfirmTitle() {
    if (confirmAction === 'generate') {
      return t.generateTitle;
    }

    if (confirmAction === 'interest') {
      return t.interestTitle;
    }

    return t.repaymentTitle;
  }

  function getConfirmDescription() {
    if (confirmAction === 'generate') {
      return t.generateConfirm;
    }

    if (confirmAction === 'interest') {
      return t.interestConfirm;
    }

    return t.repaymentConfirm;
  }

  function getConfirmWarning() {
    if (confirmAction === 'generate') {
      return t.generateWarning;
    }

    if (confirmAction === 'interest') {
      return t.interestWarning;
    }

    return t.repaymentWarning;
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            to="/admin/loans"
            className="inline-flex items-center gap-2 text-sm text-indigo-700 hover:underline"
          >
            <ArrowLeft size={17} />
            {t.back}
          </Link>

          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            {t.title}
          </h1>
        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={loading || busy}
          className={secondaryButton}
        >
          <RefreshCw
            size={17}
            className={loading ? 'animate-spin' : ''}
          />
          {t.refresh}
        </button>
      </div>

      {/* ALERTS */}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          <CheckCircle2 size={19} />
          {success}
        </div>
      )}

      {loading && !loan && (
        <p className="text-slate-500">{t.loading}</p>
      )}

      {loan && (
        <>
          {/* LOAN INFORMATION */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">
                  {t.number}
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {loan.loan_number || `#${loan.id}`}
                </h2>

                <p className="mt-2 text-slate-600">
                  {borrowerName()}
                </p>
              </div>

              <StatusBadge status={loan.status} t={t} />
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <DetailCard
                label={t.principal}
                value={money(loan.principal_amount)}
                Icon={Wallet}
              />

              <DetailCard
                label={t.outstanding}
                value={money(loan.outstanding_principal)}
                Icon={Wallet}
              />

              <DetailCard
                label={t.rate}
                value={`${Number(
                  loan.monthly_interest_rate || 0
                )}%`}
                Icon={Percent}
              />
            </div>

            <div className="mt-5 grid gap-4 text-sm md:grid-cols-3">
              <InformationField
                label={t.disbursed}
                value={dateOnly(loan.disbursed_at)}
                Icon={CalendarDays}
              />

              <InformationField
                label={t.purpose}
                value={loan.purpose}
              />

              <InformationField
                label={t.notes}
                value={loan.notes}
              />
            </div>

            <div className="mt-5 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={openRepaymentModal}
                disabled={loan.status !== 'active' || busy}
                className={primaryButton}
              >
                <CheckCircle2 size={18} />
                {t.repay}
              </button>
            </div>
          </div>

          {/* BORROWER DETAILS - NEW SECTION */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-indigo-100 p-3">
                  <UserRound
                    size={22}
                    className="text-indigo-700"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {t.borrowerDetails}
                  </h2>

                  <p className="text-sm text-slate-500">
                    {borrowerName()}
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
                {borrowerType()}
              </span>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <InformationField
                label={t.borrower}
                value={borrowerName()}
                Icon={UserRound}
              />

              <InformationField
                label={t.borrowerCode}
                value={loan.borrower?.member_code}
              />

              <InformationField
                label={t.phone}
                value={loan.borrower?.phone}
                Icon={Phone}
              />

              <InformationField
                label={t.email}
                value={
                  loan.borrower?.email?.endsWith(
                    '@borrowers.invalid'
                  )
                    ? '—'
                    : loan.borrower?.email
                }
                Icon={Mail}
              />

              <InformationField
                label={t.address}
                value={loan.borrower?.address}
                Icon={MapPin}
              />

              <InformationField
                label={t.borrowerType}
                value={borrowerType()}
              />
            </div>
          </div>

          {/* INTEREST HISTORY */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {t.interestHistory}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {t.interest}
                </p>
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    {t.month}
                  </label>

                  <input
                    type="month"
                    value={month}
                    max={today().slice(0, 7)}
                    disabled={busy}
                    onChange={event => {
                      setMonth(event.target.value);
                      setInterestPage(1);
                    }}
                    className={inputClass}
                  />
                </div>

                <button
                  type="button"
                  onClick={requestGenerateInterest}
                  disabled={busy || !month}
                  className={primaryButton}
                >
                  <CalendarDays size={18} />
                  {t.generate}
                </button>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-3">{t.month}</th>
                    <th className="p-3">{t.amount}</th>
                    <th className="p-3">{t.status}</th>
                    <th className="p-3">{t.date}</th>
                    <th className="p-3">{t.receipt}</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>

                <tbody>
                  {interestRows.map(interest => (
                    <tr
                      key={interest.id}
                      className="border-t border-slate-100"
                    >
                      <td className="whitespace-nowrap p-3">
                        {dateOnly(
                          interest.interest_month
                        ).slice(0, 7)}
                      </td>

                      <td className="whitespace-nowrap p-3 font-semibold">
                        {money(interest.amount)}
                      </td>

                      <td className="p-3">
                        <StatusBadge
                          status={interest.status}
                          t={t}
                        />
                      </td>

                      <td className="whitespace-nowrap p-3">
                        {dateOnly(interest.paid_at) || '—'}
                      </td>

                      <td className="p-3">
                        {interest.receipt_number || '—'}
                      </td>

                      <td className="p-3">
                        {interest.status === 'pending' && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              openInterestModal(interest)
                            }
                            className="whitespace-nowrap font-medium text-indigo-700 hover:underline disabled:opacity-50"
                          >
                            {t.receiveInterest}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {!loading && interestRows.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-8 text-center text-slate-500"
                      >
                        {t.empty}
                      </td>
                    </tr>
                  )}

                  {loading && (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-6 text-center text-slate-500"
                      >
                        {t.loading}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                disabled={interestPage <= 1 || loading}
                onClick={() =>
                  setInterestPage(value => value - 1)
                }
                className={secondaryButton}
              >
                {t.previous}
              </button>

              <span className="text-sm text-slate-600">
                {interestPage} / {interestLastPage}
              </span>

              <button
                type="button"
                disabled={
                  interestPage >= interestLastPage ||
                  loading
                }
                onClick={() =>
                  setInterestPage(value => value + 1)
                }
                className={secondaryButton}
              >
                {t.next}
              </button>
            </div>
          </div>

          {/* PRINCIPAL REPAYMENT HISTORY */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              {t.history}
            </h2>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-3">{t.date}</th>
                    <th className="p-3">{t.amount}</th>
                    <th className="p-3">{t.receipt}</th>
                  </tr>
                </thead>

                <tbody>
                  {(loan.principal_repayments || []).map(
                    item => (
                      <tr
                        key={item.id}
                        className="border-t border-slate-100"
                      >
                        <td className="p-3">
                          {dateOnly(item.paid_at) || '—'}
                        </td>

                        <td className="p-3 font-semibold">
                          {money(item.amount)}
                        </td>

                        <td className="p-3">
                          {item.receipt_number || '—'}
                        </td>
                      </tr>
                    )
                  )}

                  {!loan.principal_repayments?.length && (
                    <tr>
                      <td
                        colSpan={3}
                        className="p-8 text-center text-slate-500"
                      >
                        {t.empty}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* INTEREST PAYMENT MODAL */}

      {selectedInterest && !confirmAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {t.receiveInterest}
              </h2>

              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setSelectedInterest(null);
                  setModalError('');
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <InformationField
                label={t.month}
                value={dateOnly(
                  selectedInterest.interest_month
                ).slice(0, 7)}
              />

              <InformationField
                label={t.amount}
                value={money(selectedInterest.amount)}
              />

              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t.date}
                </label>

                <input
                  type="date"
                  value={interestPaidAt}
                  min={dateOnly(
                    selectedInterest.interest_month
                  )}
                  max={today()}
                  disabled={busy}
                  onChange={event =>
                    setInterestPaidAt(event.target.value)
                  }
                  className={inputClass}
                />
              </div>

              {modalError && (
                <p className="text-sm text-red-600">
                  {modalError}
                </p>
              )}

              <button
                type="button"
                disabled={busy}
                onClick={requestReceiveInterest}
                className={`${primaryButton} w-full`}
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINCIPAL REPAYMENT MODAL */}

      {repaymentOpen && !confirmAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {t.repay}
              </h2>

              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setRepaymentOpen(false);
                  setModalError('');
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={requestRepayment}
              className="mt-5 space-y-4"
            >
              <InformationField
                label={t.outstanding}
                value={money(loan?.outstanding_principal)}
              />

              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t.amount}
                </label>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={loan?.outstanding_principal}
                  required
                  disabled={busy}
                  value={repayment.amount}
                  onChange={event =>
                    setRepayment(previous => ({
                      ...previous,
                      amount: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t.date}
                </label>

                <input
                  type="date"
                  required
                  min={dateOnly(loan?.disbursed_at)}
                  max={today()}
                  disabled={busy}
                  value={repayment.paid_at}
                  onChange={event =>
                    setRepayment(previous => ({
                      ...previous,
                      paid_at: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              {modalError && (
                <p className="text-sm text-red-600">
                  {modalError}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className={`${primaryButton} w-full`}
              >
                {t.confirm}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FINAL CONFIRMATION */}

      <ConfirmModal
        open={Boolean(confirmAction)}
        title={getConfirmTitle()}
        description={getConfirmDescription()}
        warning={getConfirmWarning()}
        details={getConfirmDetails()}
        busy={busy}
        error={modalError}
        onClose={closeConfirm}
        onConfirm={confirmOperation}
        t={t}
      />
    </div>
  );
}