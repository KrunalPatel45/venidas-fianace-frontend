import { useCallback, useEffect, useState } from 'react';

import {
  Plus,
  Search,
  RefreshCw,
  Wallet,
  CheckCircle2,
} from 'lucide-react';

import { accountsApi } from '../api/accounts';
import { membersApi } from '../api/members';
import { useLanguage } from '../context/LanguageContext';
import AppModal from '../components/ui/AppModal';

/*
|--------------------------------------------------------------------------
| Translations
|--------------------------------------------------------------------------
*/

const translations = {
  gu: {
    title: 'સોસાયટી ખાતાઓ',
    subtitle: 'સભ્યોના ખાતા અને ખાતું ખોલવાની ફી',

    add: 'નવું ખાતું ખોલો',
    search: 'શોધો',
    searchHint: 'ખાતા નંબર, સભ્યનું નામ અથવા સભ્ય કોડ શોધો',
    refresh: 'ફરી લોડ કરો',

    account: 'ખાતા નંબર',
    member: 'સભ્યનું નામ',
    memberCode: 'સભ્ય કોડ',
    selectMember: 'સભ્ય પસંદ કરો',
    memberSearch: 'સભ્ય શોધો',
    memberSearchHint: 'સભ્યનું નામ અથવા કોડ લખો',

    date: 'ખાતું ખોલવાની તારીખ',
    monthly: 'માસિક રોકાણ',
    fee: 'ખાતું ખોલવાની ફી',
    feeStatus: 'ફીની સ્થિતિ',
    actions: 'ક્રિયાઓ',

    pending: 'બાકી',
    paid: 'ચૂકવેલ',
    unknown: 'અજ્ઞાત',

    cashReceive: 'રોકડ ફી મેળવો',
    cashConfirm: 'રોકડ ફી મળ્યાની પુષ્ટિ',

    cashInfo:
      'આ રકમ ખરેખર રોકડમાં મળી હોય તો જ પુષ્ટિ કરો. પુષ્ટિ કર્યા પછી ચુકવણી સિસ્ટમમાં નોંધાશે.',

    paymentDate: 'રોકડ મળ્યાની તારીખ',
    cashOnly: 'માત્ર રોકડ',

    fixedAmounts:
      'માસિક રોકાણ ₹1,000 અને એક વખતની ખાતું ખોલવાની ફી ₹100',

    create: 'ખાતું બનાવો',
    cancel: 'રદ કરો',
    confirm: 'રોકડ મળી છે — નોંધ કરો',
    close: 'બંધ કરો',

    loading: 'માહિતી લોડ થઈ રહી છે...',
    empty: 'કોઈ ખાતું મળ્યું નથી.',

    previous: 'પાછળ',
    next: 'આગળ',
    page: 'પાનું',
    of: 'માંથી',

    successCreate: 'નવું ખાતું સફળતાપૂર્વક બનાવવામાં આવ્યું.',
    successPay: 'રોકડ ફી સફળતાપૂર્વક નોંધવામાં આવી.',

    failed: 'વિનંતી પૂર્ણ થઈ શકી નથી. ફરી પ્રયાસ કરો.',
    validation: 'કૃપા કરીને દર્શાવેલી ભૂલો સુધારો.',
    required: 'આ માહિતી જરૂરી છે.',

    total: 'કુલ ખાતાઓ',
    busy: 'પ્રક્રિયા ચાલુ છે...',

    memberLoading: 'સભ્યો લોડ થઈ રહ્યા છે...',
    memberError: 'સભ્યોની યાદી લોડ થઈ શકી નથી.',
    noMembers: 'કોઈ સક્રિય સભ્ય મળ્યો નથી.',

    accountNumberRequired: 'ખાતા નંબર દાખલ કરો.',
    memberRequired: 'સભ્ય પસંદ કરો.',
    dateRequired: 'તારીખ પસંદ કરો.',
    invalidDate: 'ભવિષ્યની તારીખ પસંદ કરી શકાતી નથી.',

    accountStatus: 'ખાતાની સ્થિતિ',
    active: 'સક્રિય',
    inactive: 'નિષ્ક્રિય',
    closed: 'બંધ',
  },

  en: {
    title: 'Society Accounts',
    subtitle: 'Member accounts and account opening fees',

    add: 'Open New Account',
    search: 'Search',
    searchHint: 'Search account number, member name or member code',
    refresh: 'Refresh',

    account: 'Account Number',
    member: 'Member Name',
    memberCode: 'Member Code',
    selectMember: 'Select Member',
    memberSearch: 'Search Member',
    memberSearchHint: 'Enter member name or member code',

    date: 'Account Opening Date',
    monthly: 'Monthly Investment',
    fee: 'Account Opening Fee',
    feeStatus: 'Fee Status',
    actions: 'Actions',

    pending: 'Pending',
    paid: 'Paid',
    unknown: 'Unknown',

    cashReceive: 'Receive Cash Fee',
    cashConfirm: 'Confirm Cash Receipt',

    cashInfo:
      'Confirm only if the cash has actually been received. The payment will be recorded after confirmation.',

    paymentDate: 'Cash Received Date',
    cashOnly: 'Cash Only',

    fixedAmounts:
      'Monthly investment ₹1,000 and one-time opening fee ₹100',

    create: 'Create Account',
    cancel: 'Cancel',
    confirm: 'Confirm Cash Received',
    close: 'Close',

    loading: 'Loading...',
    empty: 'No accounts found.',

    previous: 'Previous',
    next: 'Next',
    page: 'Page',
    of: 'of',

    successCreate: 'Account created successfully.',
    successPay: 'Cash receipt recorded successfully.',

    failed: 'Unable to complete the request. Please try again.',
    validation: 'Please correct the highlighted errors.',
    required: 'This information is required.',

    total: 'Total Accounts',
    busy: 'Processing...',

    memberLoading: 'Loading members...',
    memberError: 'Unable to load members.',
    noMembers: 'No active members found.',

    accountNumberRequired: 'Enter account number.',
    memberRequired: 'Select a member.',
    dateRequired: 'Select a date.',
    invalidDate: 'Future dates are not allowed.',

    accountStatus: 'Account Status',
    active: 'Active',
    inactive: 'Inactive',
    closed: 'Closed',
  },
};

/*
|--------------------------------------------------------------------------
| Common Styles
|--------------------------------------------------------------------------
*/

const fieldClass = `
  w-full
  rounded-xl
  border
  border-slate-300
  bg-white
  px-3
  py-2.5
  text-slate-900
  outline-none
  transition
  focus:border-indigo-500
  focus:ring-2
  focus:ring-indigo-100
`;

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function today() {
  const now = new Date();

  const localDate = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  );

  return localDate.toISOString().slice(0, 10);
}

function getPaginator(response) {
  const body = response?.data;

  // Laravel paginator returned directly:
  // { current_page, data: [...], total, last_page }

  if (Array.isArray(body?.data)) {
    return body;
  }

  // Optional wrapped paginator:
  // { data: { current_page, data: [...], ... } }

  if (Array.isArray(body?.data?.data)) {
    return body.data;
  }

  throw new Error('Invalid pagination response');
}

function getMemberName(member, language) {
  if (!member) {
    return '—';
  }

  if (language === 'gu') {
    return member.name_gu?.trim() || member.name || '—';
  }

  return member.name || '—';
}

function isMemberActive(member) {
  return (
    member?.is_active === true ||
    member?.is_active === 1 ||
    member?.is_active === '1'
  );
}

function formatMoney(amount) {
  if (
    amount === null ||
    amount === undefined ||
    amount === ''
  ) {
    return '—';
  }

  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return '—';
  }

  return `₹${value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(date) {
  if (!date) {
    return '—';
  }

  return String(date).slice(0, 10);
}

function getFeeStatus(fee) {
  return fee?.status || 'unknown';
}

function getAccountStatus(status, t) {
  if (status === 'active') {
    return t.active;
  }

  if (status === 'inactive') {
    return t.inactive;
  }

  if (status === 'closed') {
    return t.closed;
  }

  return status || t.unknown;
}

/*
|--------------------------------------------------------------------------
| Main Component
|--------------------------------------------------------------------------
*/

export default function AccountsPage() {
  const { language } = useLanguage();

  const lang = language === 'gu' ? 'gu' : 'en';
  const t = translations[lang];

  /*
  |--------------------------------------------------------------------------
  | Account List State
  |--------------------------------------------------------------------------
  */

  const [accounts, setAccounts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [refreshKey, setRefreshKey] = useState(0);

  /*
  |--------------------------------------------------------------------------
  | Member State
  |--------------------------------------------------------------------------
  */

  const [members, setMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState('');

  const [memberLoading, setMemberLoading] = useState(false);
  const [memberError, setMemberError] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Modal State
  |--------------------------------------------------------------------------
  */

  const [createOpen, setCreateOpen] = useState(false);
  const [feeAccount, setFeeAccount] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Form State
  |--------------------------------------------------------------------------
  */

  const [form, setForm] = useState({
    user_id: '',
    account_number: '',
    opened_at: today(),
  });

  const [paidAt, setPaidAt] = useState(today());

  /*
  |--------------------------------------------------------------------------
  | UI State
  |--------------------------------------------------------------------------
  */

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [validationErrors, setValidationErrors] = useState({});

  /*
  |--------------------------------------------------------------------------
  | Refresh
  |--------------------------------------------------------------------------
  */

  function refreshAccounts() {
    setRefreshKey(previous => previous + 1);
  }

  /*
  |--------------------------------------------------------------------------
  | Load Accounts
  |--------------------------------------------------------------------------
  */

  const loadAccounts = useCallback(
    async (signal) => {
      setLoading(true);
      setError('');

      try {
        const response = await accountsApi.list(
          {
            page,
            search: appliedSearch,
          },
          { signal }
        );

        if (signal.aborted) {
          return;
        }

        const paginator = getPaginator(response);

        setAccounts(paginator.data || []);

        setTotal(paginator.total || 0);

        const finalPage = Math.max(
          1,
          paginator.last_page || 1
        );

        setLastPage(finalPage);

        if (page > finalPage) {
          setPage(finalPage);
        }
      } catch (err) {
        if (
          signal.aborted ||
          err?.code === 'ERR_CANCELED' ||
          err?.name === 'CanceledError'
        ) {
          return;
        }

        console.error('Accounts API Error:', err);

        setError(t.failed);
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    },
    [page, appliedSearch, t]
  );

  useEffect(() => {
    const controller = new AbortController();

    loadAccounts(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadAccounts, refreshKey]);

  /*
  |--------------------------------------------------------------------------
  | Load Members
  |--------------------------------------------------------------------------
  */

  async function loadMembers(searchTerm = '') {
    setMemberLoading(true);
    setMemberError(false);

    try {
      const response = await membersApi.list({
        page: 1,
        search: searchTerm,
      });

      const paginator = getPaginator(response);

      const activeMembers = paginator.data.filter(
        isMemberActive
      );

      setMembers(activeMembers);
    } catch (err) {
      console.error('Members API Error:', err);

      setMembers([]);
      setMemberError(true);
    } finally {
      setMemberLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Open Add Account Popup
  |--------------------------------------------------------------------------
  */

  function openCreateModal() {
    setForm({
      user_id: '',
      account_number: '',
      opened_at: today(),
    });

    setMembers([]);
    setMemberSearch('');

    setError('');
    setSuccess('');
    setValidationErrors({});

    setCreateOpen(true);

    loadMembers();
  }

  /*
  |--------------------------------------------------------------------------
  | Form Change
  |--------------------------------------------------------------------------
  */

  function handleFormChange(field, value) {
    setForm(previous => ({
      ...previous,
      [field]: value,
    }));

    setValidationErrors(previous => {
      const next = { ...previous };

      delete next[field];

      return next;
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Validate Account Form
  |--------------------------------------------------------------------------
  */

  function validateAccount() {
    const errors = {};

    if (!form.user_id) {
      errors.user_id = [t.memberRequired];
    }

    if (!form.account_number.trim()) {
      errors.account_number = [
        t.accountNumberRequired,
      ];
    }

    if (!form.opened_at) {
      errors.opened_at = [t.dateRequired];
    } else if (form.opened_at > today()) {
      errors.opened_at = [t.invalidDate];
    }

    setValidationErrors(errors);

    return Object.keys(errors).length === 0;
  }

  /*
  |--------------------------------------------------------------------------
  | Create Account
  |--------------------------------------------------------------------------
  */

  async function createAccount(event) {
    event.preventDefault();

    if (busy) {
      return;
    }

    if (!validateAccount()) {
      return;
    }

    setBusy(true);

    setError('');
    setSuccess('');
    setValidationErrors({});

    try {
      const payload = {
        user_id: Number(form.user_id),
        account_number: form.account_number.trim(),
        opened_at: form.opened_at,
      };

      await accountsApi.create(payload);

      setCreateOpen(false);

      setSuccess(t.successCreate);

      setPage(1);
      refreshAccounts();
    } catch (err) {
      console.error('Create Account Error:', err);

      const apiErrors = err.response?.data?.errors || {};

      setValidationErrors(apiErrors);

      setError(
        err.response?.status === 422
          ? t.validation
          : t.failed
      );
    } finally {
      setBusy(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Open Cash Fee Popup
  |--------------------------------------------------------------------------
  */

  function openCashModal(account) {
    const fee = account.opening_fee;

    if (!fee || fee.status !== 'pending') {
      return;
    }

    setFeeAccount(account);
    setPaidAt(today());

    setError('');
    setSuccess('');
    setValidationErrors({});
  }

  /*
  |--------------------------------------------------------------------------
  | Confirm Cash Receipt
  |--------------------------------------------------------------------------
  */

  async function confirmCashReceipt() {
    if (
      busy ||
      !feeAccount ||
      !feeAccount.opening_fee?.id
    ) {
      return;
    }

    if (!paidAt) {
      setValidationErrors({
        paid_at: [t.dateRequired],
      });

      return;
    }

    if (paidAt > today()) {
      setValidationErrors({
        paid_at: [t.invalidDate],
      });

      return;
    }

    setBusy(true);

    setError('');
    setValidationErrors({});

    try {
      await accountsApi.receiveOpeningFee(
        feeAccount.opening_fee.id,
        {
          paid_at: paidAt,
        }
      );

      setFeeAccount(null);

      setSuccess(t.successPay);

      refreshAccounts();
    } catch (err) {
      console.error('Opening Fee Error:', err);

      setValidationErrors(
        err.response?.data?.errors || {}
      );

      setError(
        err.response?.status === 422
          ? t.validation
          : t.failed
      );
    } finally {
      setBusy(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Search Accounts
  |--------------------------------------------------------------------------
  */

  function handleSearch(event) {
    event.preventDefault();

    setPage(1);
    setAppliedSearch(search.trim());
    refreshAccounts();
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="space-y-6">

      {/* Page Header */}

      <div className="flex flex-wrap items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t.title}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {t.subtitle}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {t.total}: {total}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">

          <button
            type="button"
            onClick={refreshAccounts}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={17} />

            {t.refresh}
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700"
          >
            <Plus size={17} />

            {t.add}
          </button>

        </div>

      </div>

      {/* Success Message */}

      {success && (
        <div
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          {success}
        </div>
      )}

      {/* Error Message */}

      {error && !createOpen && !feeAccount && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Fixed Amount Information */}

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">

        <div className="flex items-start gap-3">

          <Wallet
            size={20}
            className="mt-0.5 text-indigo-700"
          />

          <div>
            <p className="font-medium text-indigo-900">
              {t.fixedAmounts}
            </p>

            <p className="mt-1 text-sm text-indigo-700">
              {t.cashOnly}
            </p>
          </div>

        </div>

      </div>

      {/* Search Form */}

      <form
        onSubmit={handleSearch}
        className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4"
      >

        <input
          type="search"
          value={search}
          onChange={event => {
            setSearch(event.target.value);
          }}
          placeholder={t.searchHint}
          aria-label={t.searchHint}
          className={`${fieldClass} min-w-0 flex-1`}
        />

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-white hover:bg-slate-800"
        >
          <Search size={17} />

          {t.search}
        </button>

      </form>

      {/* Accounts Table */}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">

        <table className="w-full text-left text-sm">

          <thead className="bg-slate-50 text-slate-600">

            <tr>
              <th className="whitespace-nowrap p-4">
                {t.account}
              </th>

              <th className="whitespace-nowrap p-4">
                {t.member}
              </th>

              <th className="whitespace-nowrap p-4">
                {t.date}
              </th>

              <th className="whitespace-nowrap p-4">
                {t.monthly}
              </th>

              <th className="whitespace-nowrap p-4">
                {t.fee}
              </th>

              <th className="whitespace-nowrap p-4">
                {t.feeStatus}
              </th>

              <th className="whitespace-nowrap p-4">
                {t.accountStatus}
              </th>

              <th className="whitespace-nowrap p-4">
                {t.actions}
              </th>
            </tr>

          </thead>

          <tbody>

            {loading ? (

              <tr>
                <td
                  colSpan={8}
                  className="p-10 text-center text-slate-500"
                >
                  {t.loading}
                </td>
              </tr>

            ) : accounts.length === 0 ? (

              <tr>
                <td
                  colSpan={8}
                  className="p-10 text-center text-slate-500"
                >
                  {t.empty}
                </td>
              </tr>

            ) : (

              accounts.map(account => {

                const member = account.member;

                const fee = account.opening_fee;

                const feeStatus = getFeeStatus(fee);

                return (
                  <tr
                    key={account.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >

                    {/* Account Number */}

                    <td className="p-4 font-semibold text-slate-900">
                      {account.account_number}
                    </td>

                    {/* Member */}

                    <td className="p-4">

                      <p className="font-medium text-slate-900">
                        {getMemberName(member, lang)}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {member?.member_code || '—'}
                      </p>

                    </td>

                    {/* Opening Date */}

                    <td className="p-4 text-slate-700">
                      {formatDate(account.opened_at)}
                    </td>

                    {/* Monthly Amount */}

                    <td className="p-4 font-medium text-slate-900">
                      {formatMoney(account.monthly_amount)}
                    </td>

                    {/* Opening Fee */}

                    <td className="p-4 font-medium text-slate-900">
                      {formatMoney(
                        fee?.amount ??
                        account.opening_fee_amount
                      )}
                    </td>

                    {/* Fee Status */}

                    <td className="p-4">

                      {feeStatus === 'paid' ? (

                        <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                          {t.paid}
                        </span>

                      ) : feeStatus === 'pending' ? (

                        <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                          {t.pending}
                        </span>

                      ) : (

                        <span className="text-slate-500">
                          {t.unknown}
                        </span>

                      )}

                    </td>

                    {/* Account Status */}

                    <td className="p-4">

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                        {getAccountStatus(account.status, t)}
                      </span>

                    </td>

                    {/* Actions */}

                    <td className="p-4">

                      {fee?.id && feeStatus === 'pending' ? (

                        <button
                          type="button"
                          onClick={() => openCashModal(account)}
                          className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-emerald-700 px-3 py-2 text-white hover:bg-emerald-800"
                        >
                          <CheckCircle2 size={16} />

                          {t.cashReceive}
                        </button>

                      ) : (

                        <span className="text-slate-400">
                          —
                        </span>

                      )}

                    </td>

                  </tr>
                );
              })

            )}

          </tbody>

        </table>

      </div>

      {/* Pagination */}

      <div className="flex items-center justify-between gap-3">

        <button
          type="button"
          disabled={loading || page <= 1}
          onClick={() => {
            setPage(previous => previous - 1);
          }}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-700 disabled:opacity-50"
        >
          {t.previous}
        </button>

        <span className="text-sm text-slate-600">
          {t.page} {page} {t.of} {lastPage}
        </span>

        <button
          type="button"
          disabled={loading || page >= lastPage}
          onClick={() => {
            setPage(previous => previous + 1);
          }}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-700 disabled:opacity-50"
        >
          {t.next}
        </button>

      </div>

      {/* Add Account Modal */}

      <AppModal
        open={createOpen}
        title={t.add}
        closeLabel={t.close}
        busy={busy}
        onClose={() => {
          setCreateOpen(false);
        }}
        footer={
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setCreateOpen(false);
              }}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-slate-700"
            >
              {t.cancel}
            </button>

            <button
              type="submit"
              form="create-account-form"
              disabled={busy || memberLoading || memberError}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 font-medium text-white disabled:opacity-50"
            >
              {busy ? t.busy : t.create}
            </button>
          </>
        }
      >

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form
          id="create-account-form"
          onSubmit={createAccount}
          className="space-y-5"
        >

          {/* Member Selection */}

          <div className="space-y-2">

            <label className="block text-sm font-medium text-slate-700">
              {t.member} *
            </label>

            <div className="flex gap-2">

              <input
                type="search"
                value={memberSearch}
                onChange={event => {
                  setMemberSearch(event.target.value);
                }}
                placeholder={t.memberSearchHint}
                aria-label={t.memberSearch}
                className={`${fieldClass} min-w-0 flex-1`}
              />

              <button
                type="button"
                disabled={memberLoading}
                onClick={() => {
                  loadMembers(memberSearch.trim());
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-700 disabled:opacity-50"
              >
                {t.search}
              </button>

            </div>

            <select
              required
              value={form.user_id}
              onChange={event => {
                handleFormChange(
                  'user_id',
                  event.target.value
                );
              }}
              className={fieldClass}
            >

              <option value="">
                {memberLoading
                  ? t.memberLoading
                  : t.selectMember}
              </option>

              {members.map(member => (

                <option
                  key={member.id}
                  value={member.id}
                >
                  {member.member_code || member.id}
                  {' — '}
                  {getMemberName(member, lang)}
                </option>

              ))}

            </select>

            {!memberLoading &&
              !memberError &&
              members.length === 0 && (
                <p className="text-xs text-slate-500">
                  {t.noMembers}
                </p>
              )}

            {memberError && (
              <p className="text-xs text-red-600">
                {t.memberError}
              </p>
            )}

            {validationErrors.user_id?.[0] && (
              <p className="text-xs text-red-600">
                {validationErrors.user_id[0]}
              </p>
            )}

          </div>

          {/* Account Number */}

          <div className="space-y-2">

            <label className="block text-sm font-medium text-slate-700">
              {t.account} *
            </label>

            <input
              type="text"
              required
              maxLength={40}
              value={form.account_number}
              onChange={event => {
                handleFormChange(
                  'account_number',
                  event.target.value
                );
              }}
              className={fieldClass}
            />

            {validationErrors.account_number?.[0] && (
              <p className="text-xs text-red-600">
                {validationErrors.account_number[0]}
              </p>
            )}

          </div>

          {/* Account Opening Date */}

          <div className="space-y-2">

            <label className="block text-sm font-medium text-slate-700">
              {t.date} *
            </label>

            <input
              type="date"
              required
              max={today()}
              value={form.opened_at}
              onChange={event => {
                handleFormChange(
                  'opened_at',
                  event.target.value
                );
              }}
              className={fieldClass}
            />

            {validationErrors.opened_at?.[0] && (
              <p className="text-xs text-red-600">
                {validationErrors.opened_at[0]}
              </p>
            )}

          </div>

          {/* Account Information */}

          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">

            <p className="text-sm font-medium text-indigo-900">
              {t.fixedAmounts}
            </p>

            <p className="mt-2 text-xs text-indigo-700">
              {t.cashOnly}
            </p>

          </div>

        </form>

      </AppModal>

      {/* Cash Opening Fee Modal */}

      <AppModal
        open={Boolean(feeAccount)}
        title={t.cashConfirm}
        closeLabel={t.close}
        busy={busy}
        onClose={() => {
          setFeeAccount(null);
        }}
        footer={
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setFeeAccount(null);
              }}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-slate-700"
            >
              {t.cancel}
            </button>

            <button
              type="button"
              disabled={busy || !paidAt}
              onClick={confirmCashReceipt}
              className="rounded-xl bg-emerald-700 px-5 py-2.5 font-medium text-white disabled:opacity-50"
            >
              {busy ? t.busy : t.confirm}
            </button>
          </>
        }
      >

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Account Details */}

        <div className="rounded-xl bg-slate-50 p-4">

          <p className="text-sm text-slate-500">
            {t.account}
          </p>

          <p className="mt-1 font-semibold text-slate-900">
            {feeAccount?.account_number || '—'}
          </p>

          <p className="mt-3 text-sm text-slate-500">
            {t.member}
          </p>

          <p className="mt-1 font-medium text-slate-900">
            {getMemberName(
              feeAccount?.member,
              lang
            )}
          </p>

        </div>

        {/* Fee Amount */}

        <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4">

          <p className="text-sm text-emerald-700">
            {t.fee}
          </p>

          <p className="mt-1 text-2xl font-bold text-emerald-900">
            {formatMoney(
              feeAccount?.opening_fee?.amount
            )}
          </p>

        </div>

        {/* Confirmation Information */}

        <p className="mt-4 text-sm leading-6 text-slate-600">
          {t.cashInfo}
        </p>

        {/* Payment Date */}

        <div className="mt-4 space-y-2">

          <label className="block text-sm font-medium text-slate-700">
            {t.paymentDate} *
          </label>

          <input
            type="date"
            required
            max={today()}
            value={paidAt}
            onChange={event => {
              setPaidAt(event.target.value);
            }}
            className={fieldClass}
          />

          {validationErrors.paid_at?.[0] && (
            <p className="text-xs text-red-600">
              {validationErrors.paid_at[0]}
            </p>
          )}

        </div>

      </AppModal>

    </div>
  );
}