import { useCallback, useEffect, useState } from 'react';
import { Plus, Search, Pencil, RefreshCw, UserX, UserCheck } from 'lucide-react';
import { membersApi } from '../api/members';
import { useLanguage } from '../context/LanguageContext';
import AppModal from '../components/ui/AppModal';

const initialForm = {
  name: '', name_gu: '', email: '', phone: '', address: '',
  password: '', password_confirmation: '', preferred_language: 'gu',
};

const labels = {
  gu: {
    title: 'સભ્ય વ્યવસ્થાપન', total: 'કુલ સભ્યો', add: 'નવો સભ્ય ઉમેરો',
    edit: 'સભ્યની માહિતી સુધારો', search: 'શોધો', searchHint: 'નામ, સભ્ય કોડ અથવા ફોન નંબર શોધો',
    refresh: 'ફરી લોડ કરો', code: 'સભ્ય કોડ', name: 'નામ', nameGu: 'ગુજરાતીમાં નામ',
    email: 'ઈમેલ સરનામું', phone: 'ફોન નંબર', address: 'સરનામું',
    password: 'પાસવર્ડ', confirmPassword: 'પાસવર્ડની પુષ્ટિ',
    language: 'પસંદગીની ભાષા', gujarati: 'ગુજરાતી', english: 'અંગ્રેજી',
    accounts: 'ખાતાઓ', status: 'સ્થિતિ', actions: 'ક્રિયાઓ', active: 'સક્રિય', inactive: 'નિષ્ક્રિય',
    activate: 'ફરી સક્રિય કરો', deactivate: 'નિષ્ક્રિય કરો',
    cancel: 'રદ કરો', save: 'સાચવો', saving: 'સાચવાઈ રહ્યું છે...',
    loading: 'માહિતી લોડ થઈ રહી છે...', empty: 'કોઈ સભ્ય મળ્યો નથી.',
    previous: 'પાછળ', next: 'આગળ', page: 'પાનું', of: 'માંથી',
    confirmActivate: 'સભ્યને ફરી સક્રિય કરવા માંગો છો?',
    confirmDeactivate: 'સભ્યને નિષ્ક્રિય કરવા માંગો છો?',
    deactivateInfo: 'સભ્યનું લૉગિન બંધ થશે. ખાતાઓ અને નાણાકીય નોંધો યથાવત્ રહેશે.',
    activateInfo: 'સભ્યને ફરી લૉગિન કરવાની મંજૂરી મળશે.',
    saved: 'સભ્યની માહિતી સફળતાપૂર્વક સાચવાઈ.',
    activated: 'સભ્ય ફરી સક્રિય થયો.', deactivated: 'સભ્ય નિષ્ક્રિય થયો.',
    failed: 'વિનંતી પૂર્ણ થઈ શકી નથી. ફરી પ્રયાસ કરો.',
    invalid: 'કૃપા કરીને દર્શાવેલી ભૂલો સુધારો.',
    required: 'આ માહિતી જરૂરી છે.', passwordLength: 'પાસવર્ડ ઓછામાં ઓછા ૧૨ અક્ષરનો હોવો જોઈએ.',
    passwordMismatch: 'બંને પાસવર્ડ સરખા હોવા જોઈએ.',
    phoneInvalid: 'ફોન નંબર ૧૦ થી ૧૫ અંકોનો હોવો જોઈએ.',
  },
  en: {
    title: 'Member Management', total: 'Total Members', add: 'Add Member',
    edit: 'Edit Member', search: 'Search', searchHint: 'Search name, member code or phone',
    refresh: 'Refresh', code: 'Member Code', name: 'Name', nameGu: 'Gujarati Name',
    email: 'Email Address', phone: 'Phone Number', address: 'Address',
    password: 'Password', confirmPassword: 'Confirm Password',
    language: 'Preferred Language', gujarati: 'Gujarati', english: 'English',
    accounts: 'Accounts', status: 'Status', actions: 'Actions', active: 'Active', inactive: 'Inactive',
    activate: 'Reactivate', deactivate: 'Deactivate',
    cancel: 'Cancel', save: 'Save', saving: 'Saving...',
    loading: 'Loading...', empty: 'No members found.',
    previous: 'Previous', next: 'Next', page: 'Page', of: 'of',
    confirmActivate: 'Reactivate this member?', confirmDeactivate: 'Deactivate this member?',
    deactivateInfo: 'Login will be disabled. Accounts and financial records will remain unchanged.',
    activateInfo: 'The member will be allowed to log in again.',
    saved: 'Member saved successfully.', activated: 'Member reactivated.', deactivated: 'Member deactivated.',
    failed: 'Unable to complete the request. Please try again.',
    invalid: 'Please correct the highlighted errors.',
    required: 'This field is required.', passwordLength: 'Password must be at least 12 characters.',
    passwordMismatch: 'Passwords do not match.', phoneInvalid: 'Phone must contain 10 to 15 digits.',
  },
};

const inputStyle = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100';
const isActive = member => member.is_active === true || member.is_active === 1 || member.is_active === '1';

export default function MembersPage() {
  const { language } = useLanguage();
  const lang = language === 'gu' ? 'gu' : 'en';
  const t = labels[lang];
  const displayName = member => lang === 'gu' ? (member.name_gu?.trim() || member.name) : member.name;

  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [form, setForm] = useState({ ...initialForm });
  const [confirmMember, setConfirmMember] = useState(null);

  const refresh = () => setRefreshKey(value => value + 1);

  const loadMembers = useCallback(async signal => {
    setLoading(true);
    setError('');
    try {
      const response = await membersApi.list({ page, search: appliedSearch }, { signal });
      if (signal.aborted) return;
      const paginator = response.data;
      if (!Array.isArray(paginator?.data)) throw new Error('Invalid paginator');
      setMembers(paginator.data);
      setTotal(paginator.total ?? 0);
      setLastPage(Math.max(1, paginator.last_page ?? 1));
      if (page > (paginator.last_page ?? 1)) setPage(Math.max(1, paginator.last_page ?? 1));
    } catch (err) {
      if (!signal.aborted && err.code !== 'ERR_CANCELED' && err.name !== 'CanceledError') setError(t.failed);
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [page, appliedSearch, t]);

  useEffect(() => {
    const controller = new AbortController();
    loadMembers(controller.signal);
    return () => controller.abort();
  }, [loadMembers, refreshKey]);

  function openAdd() {
    setEditingMember(null); setForm({ ...initialForm });
    setValidationErrors({}); setError(''); setEditorOpen(true);
  }
  function openEdit(member) {
    setEditingMember(member);
    setForm({
      name: member.name || '', name_gu: member.name_gu || '', email: member.email || '',
      phone: member.phone || '', address: member.address || '',
      password: '', password_confirmation: '', preferred_language: member.preferred_language || 'gu',
    });
    setValidationErrors({}); setError(''); setEditorOpen(true);
  }
  function change(key, value) {
    setForm(old => ({ ...old, [key]: value }));
    setValidationErrors(old => { const next = { ...old }; delete next[key]; return next; });
  }
  function validate() {
    const errors = {};
    if (!form.name.trim()) errors.name = [t.required];
    if (!editingMember && !form.name_gu.trim()) errors.name_gu = [t.required];
    if (!form.email.trim()) errors.email = [t.required];
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = [lang === 'gu' ? 'માન્ય ઈમેલ સરનામું દાખલ કરો.' : 'Enter a valid email address.'];
    if (form.phone.trim() && !/^\d{10,15}$/.test(form.phone.trim())) errors.phone = [t.phoneInvalid];
    if (!editingMember) {
      if (form.password.length < 12) errors.password = [t.passwordLength];
      if (form.password !== form.password_confirmation) errors.password_confirmation = [t.passwordMismatch];
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }
  async function saveMember(event) {
    event.preventDefault();
    if (busy || !validate()) return;
    setBusy(true); setError(''); setNotice('');
    const payload = {
      name: form.name.trim(), name_gu: form.name_gu.trim() || null, email: form.email.trim(),
      phone: form.phone.trim() || null, address: form.address.trim() || null,
      preferred_language: form.preferred_language,
    };
    try {
      if (editingMember) await membersApi.update(editingMember.id, payload);
      else await membersApi.create({ ...payload, password: form.password, password_confirmation: form.password_confirmation });
      setEditorOpen(false); setEditingMember(null); setNotice(t.saved); refresh();
    } catch (err) {
      const serverErrors = err.response?.data?.errors || {};
      if (lang === 'gu') {
        const translated = {};
        for (const key of Object.keys(serverErrors)) {
          translated[key] = [key === 'email' ? 'ઈમેલ સરનામું પહેલેથી વપરાયેલું છે અથવા માન્ય નથી.' : key === 'phone' ? 'ફોન નંબર પહેલેથી વપરાયેલો છે અથવા માન્ય નથી.' : key === 'name_gu' ? 'માન્ય ગુજરાતી નામ દાખલ કરો.' : t.invalid];
        }
        setValidationErrors(translated);
      } else {
        setValidationErrors(serverErrors);
      }
      setError(err.response?.status === 422 ? t.invalid : t.failed);
    } finally { setBusy(false); }
  }
  async function changeStatus() {
    if (!confirmMember || busy) return;
    const member = confirmMember;
    const active = isActive(member);
    setBusy(true); setError(''); setNotice('');
    try {
      if (active) await membersApi.deactivate(member.id);
      else await membersApi.update(member.id, { is_active: true });
      setConfirmMember(null); setNotice(active ? t.deactivated : t.activated); refresh();
    } catch (err) {
      setConfirmMember(null); setError(t.failed);
    } finally { setBusy(false); }
  }
  function submitSearch(event) {
    event.preventDefault(); setPage(1); setAppliedSearch(search.trim()); refresh();
  }
  function field(key, label, { required = false, type = 'text', maxLength, minLength } = {}) {
    return (
      <label className="block space-y-1" key={key}>
        <span className="block text-sm font-medium text-slate-700">{label}{required && ' *'}</span>
        <input type={type} required={required} maxLength={maxLength} minLength={minLength}
          autoComplete={type === 'password' ? 'new-password' : undefined}
          value={form[key]} onChange={event => change(key, event.target.value)}
          className={inputStyle} />
        {validationErrors[key]?.[0] && <p role="alert" className="text-xs text-red-600">{validationErrors[key][0]}</p>}
      </label>
    );
  }
  const confirmActive = confirmMember ? isActive(confirmMember) : false;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{t.total}: {total}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" disabled={loading} onClick={refresh} className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 disabled:opacity-50"><RefreshCw size={17}/>{t.refresh}</button>
          <button type="button" onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-white"><Plus size={17}/>{t.add}</button>
        </div>
      </div>
      {notice && <div role="status" className="rounded-xl border border-green-200 bg-green-50 p-3 text-green-700">{notice}</div>}
      {error && !editorOpen && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}
      <form onSubmit={submitSearch} className="flex gap-2 rounded-2xl border bg-white p-4">
        <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder={t.searchHint} className={`${inputStyle} min-w-0 flex-1`}/>
        <button type="submit" className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-white"><Search size={17}/>{t.search}</button>
      </form>
      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50"><tr>
            {[t.code, t.name, t.email, t.phone, t.accounts, t.status, t.actions].map(label => <th key={label} className="whitespace-nowrap p-4">{label}</th>)}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} className="p-8 text-center">{t.loading}</td></tr>
            : members.length === 0 ? <tr><td colSpan={7} className="p-8 text-center">{t.empty}</td></tr>
            : members.map(member => (
              <tr key={member.id} className="border-t">
                <td className="p-4 font-medium">{member.member_code || '—'}</td>
                <td className="p-4">{displayName(member)}</td>
                <td className="p-4">{member.email}</td>
                <td className="p-4">{member.phone || '—'}</td>
                <td className="p-4">{member.society_accounts_count ?? 0}</td>
                <td className="p-4"><span className={`rounded-full px-2 py-1 text-xs ${isActive(member) ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{isActive(member) ? t.active : t.inactive}</span></td>
                <td className="p-4"><div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => openEdit(member)} className="inline-flex items-center gap-1 text-indigo-700"><Pencil size={15}/>{t.edit}</button>
                  <button type="button" onClick={() => setConfirmMember(member)} className={`inline-flex items-center gap-1 ${isActive(member) ? 'text-red-700' : 'text-green-700'}`}>
                    {isActive(member) ? <UserX size={15}/> : <UserCheck size={15}/>} {isActive(member) ? t.deactivate : t.activate}
                  </button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between">
        <button type="button" disabled={loading || page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-xl border bg-white px-4 py-2 disabled:opacity-50">{t.previous}</button>
        <span className="text-sm">{t.page} {page} {t.of} {lastPage}</span>
        <button type="button" disabled={loading || page >= lastPage} onClick={() => setPage(p => p + 1)} className="rounded-xl border bg-white px-4 py-2 disabled:opacity-50">{t.next}</button>
      </div>
      <AppModal open={editorOpen} title={editingMember ? t.edit : t.add} closeLabel={lang === 'gu' ? 'બંધ કરો' : 'Close'} busy={busy} onClose={() => setEditorOpen(false)} footer={<>
        <button type="button" disabled={busy} onClick={() => setEditorOpen(false)} className="rounded-xl border bg-white px-5 py-2.5">{t.cancel}</button>
        <button type="submit" form="member-editor-form" disabled={busy} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-white disabled:opacity-50">{busy ? t.saving : t.save}</button>
      </>}>
        {error && <div role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-red-700">{error}</div>}
        <form id="member-editor-form" onSubmit={saveMember} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {editingMember && <div className="sm:col-span-2 rounded-xl bg-slate-50 p-3 text-sm">{t.code}: <strong>{editingMember.member_code}</strong></div>}
          {field('name', t.name, { required: true, maxLength: 150 })}
          {field('name_gu', t.nameGu, { required: !editingMember, maxLength: 150 })}
          {field('email', t.email, { required: true, type: 'email', maxLength: 255 })}
          {field('phone', t.phone, { type: 'tel', maxLength: 15 })}
          <label className="block space-y-1"><span className="text-sm font-medium text-slate-700">{t.address}</span>
            <textarea value={form.address} onChange={e => change('address', e.target.value)} rows={3} maxLength={500} className={inputStyle}/>
            {validationErrors.address?.[0] && <p className="text-xs text-red-600">{validationErrors.address[0]}</p>}
          </label>
          <label className="block space-y-1"><span className="text-sm font-medium text-slate-700">{t.language}</span>
            <select value={form.preferred_language} onChange={e => change('preferred_language', e.target.value)} className={inputStyle}>
              <option value="gu">{t.gujarati}</option><option value="en">{t.english}</option>
            </select>
          </label>
          {!editingMember && <>
            {field('password', t.password, { required: true, type: 'password', minLength: 12 })}
            {field('password_confirmation', t.confirmPassword, { required: true, type: 'password', minLength: 12 })}
          </>}
        </form>
      </AppModal>
      <AppModal open={Boolean(confirmMember)} title={confirmActive ? t.confirmDeactivate : t.confirmActivate} closeLabel={lang === 'gu' ? 'બંધ કરો' : 'Close'} busy={busy} onClose={() => setConfirmMember(null)} footer={<>
        <button type="button" disabled={busy} onClick={() => setConfirmMember(null)} className="rounded-xl border bg-white px-5 py-2.5">{t.cancel}</button>
        <button type="button" disabled={busy} onClick={changeStatus} className={`rounded-xl px-5 py-2.5 text-white disabled:opacity-50 ${confirmActive ? 'bg-red-600' : 'bg-green-700'}`}>
          {busy ? t.saving : confirmActive ? t.deactivate : t.activate}
        </button>
      </>}>
        <p className="font-semibold text-slate-900">{confirmMember && displayName(confirmMember)}</p>
        <p className="mt-2 text-slate-600">{confirmActive ? t.deactivateInfo : t.activateInfo}</p>
      </AppModal>
    </div>
  );
}
