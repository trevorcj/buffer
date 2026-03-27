import { BufferTransaction, SavingMode } from '../types/domain';

export function formatCurrency(amount: number, fractionDigits = 2) {
  const sign = amount < 0 ? '-' : '';
  const absoluteValue = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

  return `${sign}₦${absoluteValue}`;
}

export function formatTransactionListDate(value: string) {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const parts = formatter.formatToParts(parsedDate);
  const month = parts.find((part) => part.type === 'month')?.value ?? '';
  const day = parts.find((part) => part.type === 'day')?.value ?? '';
  const year = parts.find((part) => part.type === 'year')?.value ?? '';
  const hour = parts.find((part) => part.type === 'hour')?.value ?? '';
  const minute = parts.find((part) => part.type === 'minute')?.value ?? '';
  const dayPeriod = (parts.find((part) => part.type === 'dayPeriod')?.value ?? '').toLowerCase();

  return `${month} ${day}, ${year} ${hour}:${minute}${dayPeriod}`.trim();
}

export function formatDisplayName(name: string) {
  return name.trim() || 'Buffer User';
}

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return 'BU';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function toAccountName(name: string) {
  return formatDisplayName(name).toUpperCase();
}

function hashSeed(seed: string) {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function createSeedGenerator(seed: string) {
  let state = hashSeed(seed) || 123456789;

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

function buildDigits(seed: string, length: number) {
  const nextRandom = createSeedGenerator(seed);
  let digits = '';

  while (digits.length < length) {
    digits += Math.floor(nextRandom() * 10).toString();
  }

  return digits.slice(0, length);
}

function formatCardNumber(cardNumber: string) {
  return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

function getLuhnCheckDigit(partialNumber: string) {
  let sum = 0;

  for (let index = 0; index < partialNumber.length; index += 1) {
    let digit = Number(partialNumber[index]);

    if ((partialNumber.length - index) % 2 === 1) {
      digit *= 2;

      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
  }

  return ((10 - (sum % 10)) % 10).toString();
}

export function buildAccountNumber(seed: string) {
  return buildDigits(`${seed}-account`, 10);
}

export function buildVisaCardDetails(seed: string, last4Override?: string) {
  const body = buildDigits(`${seed}-card-body`, 11);
  const partial = `4${body}`;
  const checkDigit = getLuhnCheckDigit(partial);
  let fullPan = `${partial}${checkDigit}`;

  if (last4Override && /^\d{4}$/.test(last4Override)) {
    fullPan = `${fullPan.slice(0, 12)}${last4Override}`;
  }

  const nextRandom = createSeedGenerator(`${seed}-expiry`);
  const month = `${Math.floor(nextRandom() * 12) + 1}`.padStart(2, '0');
  const year = (new Date().getFullYear() + 4 + Math.floor(nextRandom() * 5)) % 100;
  const expiryDate = `${month}/${year.toString().padStart(2, '0')}`;
  const cvv = buildDigits(`${seed}-cvv`, 3);

  return {
    fullPan: formatCardNumber(fullPan),
    maskedPan: `**** **** **** ${fullPan.slice(-4)}`,
    expiryDate,
    cvv,
  };
}

export function getModeSummary(mode: SavingMode, value: number) {
  if (mode === 'AGBA') {
    return `You'll save ${value}% on every spend`;
  }

  return `We'll round each spend to the nearest ${formatCurrency(value, 0)}`;
}

export function getModeDescription(mode: SavingMode, value: number) {
  if (mode === 'AGBA') {
    return `You'll save ${value}% on every transaction on your Buffer card if funds are sufficient`;
  }

  return `We'll round each transaction to the nearest ${formatCurrency(value, 0)} and move the difference to your cushion`;
}

export function getBufferedLast30DaysLabel(total: number) {
  return `You buffered ${formatCurrency(total, 0)} in the last 30 days`;
}

export function getBufferBalanceLabel(total: number) {
  return `Buffer balance: ${formatCurrency(total, 0)}`;
}

export function getBufferedLast30DaysTotal(
  walletBufferedLast30Days: number,
  transactions: BufferTransaction[],
) {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  const transactionBasedTotal = transactions.reduce((total, transaction) => {
    const timestamp = new Date(transaction.createdAt).getTime();

    if (Number.isNaN(timestamp) || timestamp < thirtyDaysAgo || timestamp > now) {
      return total;
    }

    return total + transaction.savedAmount;
  }, 0);

  return transactionBasedTotal > 0 ? transactionBasedTotal : walletBufferedLast30Days;
}
