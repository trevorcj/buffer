import { BufferTransaction, SavingMode } from '../types/domain';

export function formatCurrency(amount: number, fractionDigits = 2) {
  const sign = amount < 0 ? '-' : '';
  const absoluteValue = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

  return `${sign}₦${absoluteValue}`;
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
