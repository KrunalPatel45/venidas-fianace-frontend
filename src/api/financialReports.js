
import { api } from './client';

function getFilename(disposition) {
  if (!disposition) {
    return 'venidas-financial-report.csv';
  }

  const encoded = disposition.match(
    /filename\*=UTF-8''([^;]+)/i
  );

  if (encoded) {
    try {
      return decodeURIComponent(
        encoded[1].replace(/["']/g, '')
      );
    } catch {
      // Use the default filename.
    }
  }

  const normal = disposition.match(
    /filename="?([^";]+)"?/i
  );

  return normal?.[1] || 'venidas-financial-report.csv';
}

export const financialReportsApi = {
  list: (params = {}) =>
    api.get('/admin/reports/financial', {
      params,
    }),

  exportCsv: async (params = {}) => {
    const response = await api.get(
      '/admin/reports/financial/export',
      {
        params,
        responseType: 'blob',
        timeout: 120000,
      }
    );

    const contentType =
      response.headers['content-type'] || '';

    // An API can return a JSON error even for a blob request.
    if (contentType.includes('application/json')) {
      const text = await response.data.text();
      const result = JSON.parse(text);

      throw new Error(
        result.message || 'CSV export failed.'
      );
    }

    const blob = new Blob([response.data], {
      type: 'text/csv;charset=utf-8',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = getFilename(
      response.headers['content-disposition']
    );

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);

    return true;
  },
};
