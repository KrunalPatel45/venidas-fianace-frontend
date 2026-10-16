import { useEffect, useState } from 'react';
import { loansApi } from '../api/loans';

export default function LoanBorrowerSelect({
  loanType,
  value,
  onChange,
  language = 'gu',
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setSearch('');
    setPage(1);
    setRows([]);
    setSelected(null);
    onChange('');
  }, [loanType]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const response = await loansApi.borrowers({
          loan_type: loanType,
          search,
          page,
        });

        if (cancelled) return;

        const paginator = response.data?.data;

        setRows(paginator?.data || []);
        setLastPage(paginator?.last_page || 1);
      } catch (err) {
        if (!cancelled) {
          setRows([]);
          setError(
            err.response?.data?.message ||
            'Borrowers could not be loaded.'
          );
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
  }, [loanType, search, page]);

  function choose(row) {
    setSelected(row);
    onChange(row.id);
  }

  const nameOf = row =>
    language === 'gu'
      ? row.name_gu || row.name
      : row.name;

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={search}
        onChange={event => {
          setSearch(event.target.value);
          setPage(1);
        }}
        placeholder={
          language === 'gu'
            ? 'નામ, કોડ અથવા Email શોધો'
            : 'Search name, code or email'
        }
        className="w-full rounded-xl border px-3 py-2.5"
      />

      {selected && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-3">
          <p className="text-sm text-green-700">
            Selected Borrower
          </p>
          <p className="font-semibold">
            {nameOf(selected)} — ID {selected.id}
          </p>
          <button
            type="button"
            className="mt-1 text-sm text-red-600"
            onClick={() => {
              setSelected(null);
              onChange('');
            }}
          >
            Change
          </button>
        </div>
      )}

      <div className="max-h-60 overflow-y-auto rounded-xl border">
        {loading ? (
          <p className="p-4 text-sm">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">
            {error || 'No borrowers found.'}
          </p>
        ) : (
          rows.map(row => (
            <button
              key={row.id}
              type="button"
              onClick={() => choose(row)}
              className={`block w-full border-b px-4 py-3 text-left hover:bg-indigo-50 ${
                Number(value) === row.id
                  ? 'bg-indigo-100'
                  : ''
              }`}
            >
              <span className="block font-medium">
                {nameOf(row)}
              </span>
              <span className="text-xs text-slate-500">
                {row.member_code || row.email} · ID {row.id}
              </span>
            </button>
          ))
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          disabled={page <= 1 || loading}
          onClick={() => setPage(p => p - 1)}
          className="rounded border px-3 py-2 disabled:opacity-40"
        >
          Previous
        </button>

        <span>{page} / {lastPage}</span>

        <button
          type="button"
          disabled={page >= lastPage || loading}
          onClick={() => setPage(p => p + 1)}
          className="rounded border px-3 py-2 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}