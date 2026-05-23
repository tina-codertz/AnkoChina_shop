export const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export const formatDate = (date: string | Date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatDateTime = (date: string | Date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};
