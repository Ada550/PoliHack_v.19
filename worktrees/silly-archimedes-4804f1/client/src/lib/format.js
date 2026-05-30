const fmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

export const formatPrice = (n) => fmt.format(n);

export const categoryLabel = (c) =>
  ({
    upper_body: 'Top',
    lower_body: 'Bottom',
    outerwear: 'Outerwear',
    dress: 'Dress',
  })[c] || c;
