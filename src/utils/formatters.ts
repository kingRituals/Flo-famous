// Currency, Date, and Financial Calculations for FLO Famous School

export const formatNaira = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₦0';
  return '₦' + Math.round(amount).toLocaleString('en-NG');
};

export const formatNumber = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return '0';
  return Math.round(amount).toLocaleString('en-NG');
};

export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const formatLongDate = (dateStr?: string): string => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const getCurrentNigeriaDateTime = (): { date: string; time: string; full: string } => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
  const hour12 = now.getHours() % 12 || 12;
  const formattedTime = `${String(hour12).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;

  return {
    date: `${year}-${month}-${day}`,
    time: formattedTime,
    full: `${day}/${month}/${year} ${formattedTime}`,
  };
};

export const generateReceiptNumber = (counter: number = 1): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const padded = String(counter).padStart(4, '0');
  return `FLO-RCP-${year}${month}${day}-${padded}`;
};

export const generateStudentId = (year: number = 2026, sequence: number = 1): string => {
  const padded = String(sequence).padStart(4, '0');
  return `FLO-${year}-${padded}`;
};

// Amount in words for authentic school receipts
export const amountInWords = (amount: number): string => {
  if (amount === 0) return 'Zero Naira Only';
  if (amount < 0) return 'Credit Balance Only';

  const a = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const numToWords = (num: number): string => {
    if (num < 20) return a[num];
    if (num < 100) return b[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + a[num % 10] : '');
    if (num < 1000)
      return (
        a[Math.floor(num / 100)] +
        ' Hundred' +
        (num % 100 !== 0 ? ' and ' + numToWords(num % 100) : '')
      );
    if (num < 1000000)
      return (
        numToWords(Math.floor(num / 1000)) +
        ' Thousand' +
        (num % 1000 !== 0 ? ' ' + numToWords(num % 1000) : '')
      );
    if (num < 1000000000)
      return (
        numToWords(Math.floor(num / 1000000)) +
        ' Million' +
        (num % 1000000 !== 0 ? ' ' + numToWords(num % 1000000) : '')
      );
    return num.toString();
  };

  const integerPart = Math.floor(amount);
  return `${numToWords(integerPart)} Naira Only`;
};
