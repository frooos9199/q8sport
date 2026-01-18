import axios from 'axios';

export function getApiErrorMessage(error, fallback = 'حدث خطأ') {
  if (!error) return fallback;

  if (axios.isAxiosError(error)) {
    // Network / DNS / timeout
    if (!error.response) {
      if (error.code === 'ECONNABORTED') return 'انتهت مهلة الاتصال بالخادم';
      return 'تعذر الاتصال بالخادم';
    }

    const status = error.response.status;
    const data = error.response.data;

    const serverMsg =
      (data && typeof data === 'object' && (data.error || data.message)) ||
      (typeof data === 'string' ? data : null) ||
      error.message;

    if (serverMsg) return `${serverMsg} (HTTP ${status})`;
    return `${fallback} (HTTP ${status})`;
  }

  if (error instanceof Error && error.message) return error.message;

  return fallback;
}
