
export default function StatCard({
  title,
  value,
  icon: Icon,
  currency = false,
}) {
  const displayValue = currency
    ? `₹${Number(value || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : value ?? 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold mt-2 break-words">
            {displayValue}
          </h3>
        </div>

        {Icon && (
          <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
            <Icon size={23} />
          </div>
        )}
      </div>
    </div>
  );
}
