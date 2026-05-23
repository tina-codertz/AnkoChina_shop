export const formatPrice = (cents: number) => {
  const amount = (cents / 100).toLocaleString('sw-TZ');
  return `TSh ${amount}`;
};

export const formatDate = (date: string | Date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('sw-TZ', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatDateTime = (date: string | Date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('sw-TZ', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};
