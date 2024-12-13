export type IPlan = {
  name: string | any;
  description: string;
  unitAmount: number;
  interval: 'day' | 'week' | 'month' | 'year' | 'half-year';
  productId: string;
  priceId: string;
};
