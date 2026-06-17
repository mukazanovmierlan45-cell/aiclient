export function parseApiError(err, onUnauthorized) {
  if (err.status === 401) {
    onUnauthorized();
    return 'Неверный API токен. Пожалуйста, введите новый токен.';
  }
  if (err.status === 400) return 'Неверный запрос. Проверьте введённые данные.';
  if (err.status === 403) return 'Квота исчерпана. Подождите до следующего месяца или увеличьте квоту.';
  if (err.status === 503) return 'Сервис временно недоступен. Попробуйте позже.';
  return err.message || 'Произошла ошибка.';
}