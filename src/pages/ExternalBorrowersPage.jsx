
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Search, RefreshCw, Pencil, Eye, X,
  CheckCircle2, AlertTriangle, Phone, MapPin,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { loansApi } from '../api/loans';
import { useLanguage } from '../context/LanguageContext';

const words = {
  gu: {
    title: 'બહારના લોન લેનાર',
    add: 'નવો લોન લેનાર ઉમેરો',
    edit: 'વિગતો સુધારો',
    name: 'નામ',
    nameGu: 'ગુજરાતી નામ',
    phone: 'મોબાઇલ નંબર',
    email: 'ઈમેલ',
    address: 'સરનામું',
    code: 'કોડ',
    language: 'પસંદગીની ભાષા',
    status: 'સ્થિતિ',
    active: 'સક્રિય',
    inactive: 'નિષ્ક્રિય',
    all: 'બધા',
    search: 'નામ, કોડ અથવા મોબાઇલ શોધો',
    save: 'સેવ કરો',
    cancel: 'રદ કરો',
    activate: 'સક્રિય કરો',
    deactivate: 'નિષ્ક્રિય કરો',
    details: 'વિગતો અને લોન',
    history: 'લોનનો ઇતિહાસ',
    noLoans: 'આ વ્યક્તિની કોઈ લોન નથી.',
    noData: 'કોઈ વ્યક્તિ મળી નથી.',
    loading: 'લોડ થઈ રહ્યું છે...',
    previous: 'પાછળ',
    next: 'આગળ',
    refresh: 'ફરી લોડ કરો',
    confirm: 'પુષ્ટિ કરો',
    confirmStatus: 'શું તમે આ વ્યક્તિની સ્થિતિ બદલવા માંગો છો?',
    created: 'વ્યક્તિ ઉમેરાઈ. લોન આપવા પહેલાં સક્રિય કરો.',
    updated: 'વિગતો સુધારાઈ.',
    changed: 'સ્થિતિ બદલાઈ.',
    error: 'વિનંતી પૂર્ણ થઈ શકી નથી.',
    loanNumber: 'લોન નંબર',
    principal: 'મૂળ રકમ',
    outstanding: 'બાકી રકમ',
    interest: 'માસિક વ્યાજ',
    loanStatus: 'લોન સ્થિતિ',
    page: 'પેજ',
    close: 'બંધ કરો',
  },
  en: {
    title: 'External Borrowers',
    add: 'Add External Borrower',
    edit: 'Edit Borrower',
    name: 'Name',
    nameGu: 'Gujarati Name',
    phone: 'Mobile Number',
    email: 'Email',
    address: 'Address',
    code: 'Code',
    language: 'Preferred Language',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    all: 'All',
    search: 'Search name, code or mobile',
    save: 'Save',
    cancel: 'Cancel',
    activate: 'Activate',
    deactivate: 'Deactivate',
    details: 'Details and Loans',
    history: 'Loan History',
    noLoans: 'No loans for this borrower.',
    noData: 'No borrowers found.',
    loading: 'Loading...',
    previous: 'Previous',
    next: 'Next',
    refresh: 'Refresh',
    confirm: 'Confirm',
    confirmStatus: 'Do you want to change this borrower status?',
    created: 'Borrower created. Activate before issuing a loan.',
    updated: 'Borrower updated.',
    changed: 'Status updated.',
    error: 'Request failed.',
    loanNumber: 'Loan Number',
    principal: 'Principal',
    outstanding: 'Outstanding',
    interest: 'Monthly Interest',
    loanStatus: 'Loan Status',
    page: 'Page',
    close: 'Close',
  },
};

const emptyForm = () => ({
  name: '',
  name_gu: '',
  phone: '',
  email: '',
  address: '',
  preferred_language: 'gu',
});

const inputStyle =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 ' +
  'text-slate-900 outline-none focus:border-indigo-500 ' +
  'focus:ring-2 focus:ring-indigo-100';

const buttonStyle =
  'inline-flex items-center justify-center gap-2 rounded-xl ' +
  'bg-indigo-600 px-4 py-2.5 font-medium text-white ' +
  'hover:bg-indigo-700 disabled:opacity-50';

const outlineStyle =
  'inline-flex items-center justify-center gap-2 rounded-xl ' +
  'border border-slate-300 bg-white px-4 py-2.5 ' +
  'text-slate-700 hover:bg-slate-50 disabled:opacity-50';

function messageFrom(error, fallback) {
  const data = error?.response?.data;
  const first = data?.errors
    ? Object.values(data.errors)[0]
    : null;

  return (
    (Array.isArray(first) ? first[0] : first) ||
    data?.message ||
    error?.message ||
    fallback
  );
}

function money(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function displayEmail(value) {
  return !value || value.endsWith('@borrowers.invalid')
    ? '—'
    : value;
}

function Status({ active, t }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        active
          ? 'bg-green-100 text-green-700'
          : 'bg-amber-100 text-amber-700'
      }`}
    >
      {active ? t.active : t.inactive}
    </span>
  );
}

export default function ExternalBorrowersPage() {
  const { language } = useLanguage();
  const lang = language === 'gu' ? 'gu' : 'en';
  const t = words[lang];

  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsPage, setDetailsPage] = useState(1);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  const [statusTarget, setStatusTarget] = useState(null);

  function refresh() {
    setReload(v => v + 1);
  }

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

        if (search.trim()) params.search = search.trim();
        if (filter !== '') params.is_active = filter;

        const response = await loansApi.externalBorrowers(params);
        if (cancelled) return;

        const result = response?.data?.data;

        setRows(result?.data || []);
        setLastPage(Math.max(1, Number(result?.last_page || 1)));
      } catch (err) {
        if (!cancelled) {
          setError(messageFrom(err, t.error));
          setRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const timer = setTimeout(load, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [page, search, filter, reload, t.error]);

  useEffect(() => {
    if (!selected) return;

    let cancelled = false;

    async function loadDetails() {
      setDetailsLoading(true);
      setDetailsError('');

      try {
        const response = await loansApi.externalBorrowerDetails(
          selected.id,
          { page: detailsPage }
        );

        if (!cancelled) {
          setDetails(response?.data?.data || null);
        }
      } catch (err) {
        if (!cancelled) {
          setDetailsError(messageFrom(err, t.error));
        }
      } finally {
        if (!cancelled) setDetailsLoading(false);
      }
    }

    loadDetails();

    return () => {
      cancelled = true;
    };
  }, [selected, detailsPage, reload, t.error]);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm());
    setFormError('');
    setFormOpen(true);
  }

  function openEdit(borrower) {
    setEditing(borrower);
    setForm({
      name: borrower.name || '',
      name_gu: borrower.name_gu || '',
      phone: borrower.phone || '',
      email: displayEmail(borrower.email) === '—'
        ? ''
        : borrower.email,
      address: borrower.address || '',
      preferred_language: borrower.preferred_language || 'gu',
    });
    setFormError('');
    setFormOpen(true);
  }

  function updateField(key, value) {
    setForm(previous => ({
      ...previous,
      [key]: value,
    }));
    setFormError('');
  }

  async function saveBorrower(event) {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setFormError('');
    setSuccess('');

    try {
      const payload = {
        name: form.name.trim(),
        name_gu: form.name_gu.trim() || null,
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        preferred_language: form.preferred_language,
      };

      if (editing) {
        await loansApi.updateExternalBorrower(editing.id, payload);
        setSuccess(t.updated);
      } else {
        await loansApi.createExternalBorrower(payload);
        setSuccess(t.created);
      }

      setFormOpen(false);
      setEditing(null);
      refresh();
    } catch (err) {
      setFormError(messageFrom(err, t.error));
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus() {
    if (!statusTarget || busy) return;

    setBusy(true);
    setError('');
    setSuccess('');

    try {
      if (statusTarget.is_active) {
        await loansApi.deactivateExternalBorrower(statusTarget.id);
      } else {
        await loansApi.activateExternalBorrower(statusTarget.id);
      }

      setStatusTarget(null);
      setSuccess(t.changed);
      refresh();
    } catch (err) {
      setError(messageFrom(err, t.error));
      setStatusTarget(null);
    } finally {
      setBusy(false);
    }
  }

  function openDetails(borrower) {
    setDetails(null);
    setDetailsError('');
    setDetailsPage(1);
    setSelected(borrower);
  }

  const loanPaginator = details?.loans;
  const loans = loanPaginator?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">
          {t.title}
        </h1>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={refresh}
            className={outlineStyle}
          >
            <RefreshCw size={17} />
            {t.refresh}
          </button>

          <button
            type="button"
            onClick={openAdd}
            className={buttonStyle}
          >
            <Plus size={18} />
            {t.add}
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div role="status" className="rounded-xl bg-green-50 p-4 text-green-700">
          {success}
        </div>
      )}

      <div className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-2">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-3 text-slate-400"
          />
          <input
            value={search}
            onChange={event => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder={t.search}
            className={`${inputStyle} pl-10`}
          />
        </div>

        <select
          value={filter}
          onChange={event => {
            setFilter(event.target.value);
            setPage(1);
          }}
          className={inputStyle}
        >
          <option value="">{t.all}</option>
          <option value="1">{t.active}</option>
          <option value="0">{t.inactive}</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              {[t.code, t.name, t.phone, t.address, t.status, ''].map(
                (heading, index) => (
                  <th key={index} className="px-4 py-3 font-semibold">
                    {heading}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center">
                  {t.loading}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  {t.noData}
                </td>
              </tr>
            ) : (
              rows.map(borrower => (
                <tr key={borrower.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">
                    {borrower.member_code}
                  </td>

                  <td className="px-4 py-3">
                    <p className="font-medium">
                      {lang === 'gu'
                        ? borrower.name_gu || borrower.name
                        : borrower.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {displayEmail(borrower.email)}
                    </p>
                  </td>

                  <td className="px-4 py-3">
                    {borrower.phone || '—'}
                  </td>

                  <td className="max-w-xs px-4 py-3">
                    {borrower.address || '—'}
                  </td>

                  <td className="px-4 py-3">
                    <Status active={borrower.is_active} t={t} />
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openDetails(borrower)}
                        className={outlineStyle}
                      >
                        <Eye size={15} />
                        {t.details}
                      </button>

                      <button
                        type="button"
                        onClick={() => openEdit(borrower)}
                        className={outlineStyle}
                      >
                        <Pencil size={15} />
                        {t.edit}
                      </button>

                      <button
                        type="button"
                        onClick={() => setStatusTarget(borrower)}
                        className={outlineStyle}
                      >
                        {borrower.is_active
                          ? t.deactivate
                          : t.activate}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={page <= 1 || loading}
          onClick={() => setPage(p => p - 1)}
          className={outlineStyle}
        >
          <ChevronLeft size={16} />
          {t.previous}
        </button>

        <span className="text-sm text-slate-600">
          {t.page}: {page}/{lastPage}
        </span>

        <button
          type="button"
          disabled={page >= lastPage || loading}
          onClick={() => setPage(p => p + 1)}
          className={outlineStyle}
        >
          {t.next}
          <ChevronRight size={16} />
        </button>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/60 p-4">
          <form
            onSubmit={saveBorrower}
            className="mx-auto my-6 w-full max-w-xl space-y-4 rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editing ? t.edit : t.add}
              </h2>

              <button
                type="button"
                disabled={busy}
                onClick={() => setFormOpen(false)}
                aria-label={t.close}
              >
                <X size={21} />
              </button>
            </div>

            {formError && (
              <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {formError}
              </p>
            )}

            {[
              ['name', t.name, true],
              ['name_gu', t.nameGu, false],
              ['phone', t.phone, true],
              ['email', t.email, false],
            ].map(([key, label, required]) => (
              <div key={key}>
                <label className="mb-1 block text-sm font-medium">
                  {label}{required ? ' *' : ''}
                </label>

                <input
                  required={required}
                  type={key === 'email' ? 'email' : 'text'}
                  value={form[key]}
                  disabled={busy}
                  onChange={event => updateField(key, event.target.value)}
                  className={inputStyle}
                />
              </div>
            ))}

            <div>
              <label className="mb-1 block text-sm font-medium">
                {t.address}
              </label>
              <textarea
                rows={3}
                value={form.address}
                disabled={busy}
                onChange={event => updateField('address', event.target.value)}
                className={inputStyle}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                {t.language}
              </label>
              <select
                value={form.preferred_language}
                disabled={busy}
                onChange={event =>
                  updateField('preferred_language', event.target.value)
                }
                className={inputStyle}
              >
                <option value="gu">ગુજરાતી</option>
                <option value="en">English</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
              <button
                type="button"
                disabled={busy}
                onClick={() => setFormOpen(false)}
                className={outlineStyle}
              >
                {t.cancel}
              </button>

              <button
                type="submit"
                disabled={busy}
                className={buttonStyle}
              >
                {busy ? t.loading : t.save}
              </button>
            </div>
          </form>
        </div>
      )}

      {statusTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-md space-y-5 rounded-2xl bg-white p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-amber-600" />
              <h2 className="text-lg font-bold">
                {statusTarget.is_active
                  ? t.deactivate
                  : t.activate}
              </h2>
            </div>

            <p>{t.confirmStatus}</p>
            <p className="font-semibold">{statusTarget.name}</p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => setStatusTarget(null)}
                className={outlineStyle}
              >
                {t.cancel}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={changeStatus}
                className={buttonStyle}
              >
                {busy ? t.loading : t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/60 p-4">
          <div className="mx-auto my-6 w-full max-w-3xl space-y-5 rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{t.details}</h2>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label={t.close}
              >
                <X size={21} />
              </button>
            </div>

            {detailsError && (
              <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-700">
                {detailsError}
              </p>
            )}

            <div className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">{t.name}</p>
                <p className="font-semibold">
                  {details?.borrower?.name || selected.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t.code}</p>
                <p>{selected.member_code}</p>
              </div>
              <div>
                <p className="flex items-center gap-1 text-xs text-slate-500">
                  <Phone size={13} /> {t.phone}
                </p>
                <p>{selected.phone || '—'}</p>
              </div>
              <div>
                <p className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin size={13} /> {t.address}
                </p>
                <p>{selected.address || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t.status}</p>
                <Status active={selected.is_active} t={t} />
              </div>
            </div>

            <h3 className="text-lg font-semibold">{t.history}</h3>

            {detailsLoading ? (
              <p>{t.loading}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {[t.loanNumber, t.principal, t.outstanding, t.interest, t.loanStatus].map(
                        label => (
                          <th key={label} className="p-3">
                            {label}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {loans.map(loan => (
                      <tr key={loan.id} className="border-t">
                        <td className="p-3">
                          <Link
                            to={`/admin/loans/${loan.id}`}
                            className="font-medium text-indigo-700 hover:underline"
                          >
                            {loan.loan_number || `#${loan.id}`}
                          </Link>
                        </td>
                        <td className="p-3">{money(loan.principal_amount)}</td>
                        <td className="p-3">{money(loan.outstanding_principal)}</td>
                        <td className="p-3">
                          {Number(loan.monthly_interest_rate || 0)}%
                        </td>
                        <td className="p-3">{loan.status}</td>
                      </tr>
                    ))}

                    {!loans.length && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-500">
                          {t.noLoans}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="button"
                disabled={detailsPage <= 1 || detailsLoading}
                onClick={() => setDetailsPage(p => p - 1)}
                className={outlineStyle}
              >
                {t.previous}
              </button>

              <span className="text-sm">
                {detailsPage}/{Math.max(1, Number(loanPaginator?.last_page || 1))}
              </span>

              <button
                type="button"
                disabled={
                  detailsLoading ||
                  detailsPage >= Number(loanPaginator?.last_page || 1)
                }
                onClick={() => setDetailsPage(p => p + 1)}
                className={outlineStyle}
              >
                {t.next}
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className={outlineStyle}
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
