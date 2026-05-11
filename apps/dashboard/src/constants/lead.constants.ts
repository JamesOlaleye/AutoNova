export const LEAD_STATUSES = [
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'LOST', label: 'Lost' },
  { value: 'CONVERTED', label: 'Converted' },
] as const;

export const LEAD_TYPES = [
  { value: 'INQUIRY', label: 'Enquiry' },
  { value: 'TEST_DRIVE', label: 'Test Drive' },
  { value: 'TRADE_IN', label: 'Trade-In' },
  { value: 'FINANCING', label: 'Financing' },
] as const;
