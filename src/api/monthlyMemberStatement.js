import { api } from './client';

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

export const monthlyMemberStatementApi = {
  get: (month, lang = 'gu') => {
    return api.get(
      '/admin/reports/monthly-member-statement',
      {
        params: { month, lang },
      }
    );
  },

  exportExcel: async (month, lang = 'gu') => {
    const response = await api.get(
      '/admin/reports/monthly-member-statement/excel',
      {
        params: { month, lang },
        responseType: 'blob',
        timeout: 120000,
      }
    );

    const contentType =
      response.headers?.['content-type'] || '';

    if (
      contentType.includes('application/json') ||
      contentType.includes('text/html')
    ) {
      const text = await response.data.text();

      let message = 'Excel export failed.';

      try {
        const result = JSON.parse(text);

        message =
          result.message ||
          Object.values(result.errors || {})
            .flat()
            .join(' ') ||
          message;
      } catch {
        if (contentType.includes('text/html')) {
          message = 'Server returned an error page.';
        }
      }

      throw new Error(message);
    }

    const blob = new Blob([response.data], {
      type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    downloadBlob(
      blob,
      `venidas-monthly-statement-${month}-${lang}.xlsx`
    );
  },
};