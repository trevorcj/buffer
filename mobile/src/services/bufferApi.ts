import { DemoState, createDemoState } from './mockApi';
import { BufferCard, BufferTransaction, BufferUser, CardStatus, KycStatus, SavingMode, TransactionStatus, TransactionType, UserSettings, Wallet } from '../types/domain';
import { formatDisplayName, getInitials, toAccountName } from '../utils/format';

const API_BASE_URL = 'https://buffer-0sox.onrender.com';

type JsonRecord = Record<string, unknown>;

class BufferApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'BufferApiError';
    this.status = status;
  }
}

export class TransactionActionError extends Error {
  nextState: DemoState;

  constructor(message: string, nextState: DemoState) {
    super(message);
    this.name = 'TransactionActionError';
    this.nextState = nextState;
  }
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function unwrapData<T>(value: T): unknown {
  if (isRecord(value) && 'data' in value && value.data !== undefined) {
    return value.data;
  }

  return value;
}

function pickString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function pickNumber(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return undefined;
}

function toKycStatus(value: unknown, fallback: KycStatus): KycStatus {
  const normalized = pickString(value)?.toUpperCase();

  if (normalized === 'VERIFIED' || normalized === 'FAILED' || normalized === 'PENDING') {
    return normalized;
  }

  return fallback;
}

function toSavingMode(value: unknown, fallback: SavingMode): SavingMode {
  const normalized = pickString(value)?.toUpperCase();

  if (normalized === 'AGBA' || normalized === 'YAKUBU') {
    return normalized;
  }

  return fallback;
}

function toCardStatus(value: unknown, fallback: CardStatus): CardStatus {
  const normalized = pickString(value)?.toUpperCase();

  if (normalized === 'ACTIVE' || normalized === 'FROZEN') {
    return normalized;
  }

  return fallback;
}

function toTransactionStatus(value: unknown, fallback: TransactionStatus): TransactionStatus {
  const normalized = pickString(value)?.toUpperCase();

  if (normalized === 'PENDING' || normalized === 'SUCCESS' || normalized === 'FAILED') {
    return normalized;
  }

  return fallback;
}

function toTransactionType(value: unknown, fallback: TransactionType): TransactionType {
  const normalized = pickString(value)?.toUpperCase();

  if (
    normalized === 'PAYMENT' ||
    normalized === 'FUND_WALLET' ||
    normalized === 'CUSHION_WITHDRAWAL' ||
    normalized === 'CUSHION_BILL_PAYMENT'
  ) {
    return normalized;
  }

  return fallback;
}

function formatTransactionDateLabel(createdAt: string) {
  const parsedDate = new Date(createdAt);

  if (Number.isNaN(parsedDate.getTime())) {
    return createdAt;
  }

  return parsedDate.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function createReference() {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

function maskPan(fullPan: string) {
  const digits = fullPan.replace(/\D/g, '');
  const suffix = digits.slice(-4) || '2503';

  return `4000 •••• •••• ${suffix}`;
}

function createMockCard(accountName: string): BufferCard {
  return {
    id: `card-${Date.now()}`,
    maskedPan: '4000 •••• •••• 2503',
    fullPan: '4000 0000 0000 2503',
    accountName,
    expiryDate: '03/50',
    cvv: '111',
    status: 'ACTIVE',
  };
}

function calculateSavedAmount(amount: number, settings: UserSettings, availableBalance: number) {
  if (settings.savingMode === 'AGBA') {
    const percentageSaved = Number(((amount * settings.percentage) / 100).toFixed(2));

    return availableBalance >= amount + percentageSaved ? percentageSaved : 0;
  }

  const threshold = settings.roundUpThreshold;

  if (threshold <= 0) {
    return 0;
  }

  const roundedAmount = Math.ceil(amount / threshold) * threshold;
  const savedAmount = Number((roundedAmount - amount).toFixed(2));

  return availableBalance >= amount + savedAmount ? savedAmount : 0;
}

export function getSpendPreview(amount: number, settings: UserSettings, availableBalance: number) {
  const desiredSavedAmount =
    settings.savingMode === 'AGBA'
      ? Number(((amount * settings.percentage) / 100).toFixed(2))
      : settings.roundUpThreshold <= 0
        ? 0
        : Number((Math.ceil(amount / settings.roundUpThreshold) * settings.roundUpThreshold - amount).toFixed(2));
  const savedAmount = calculateSavedAmount(amount, settings, availableBalance);
  const isBufferSkippedDueToInsufficientFunds =
    desiredSavedAmount > 0 && savedAmount === 0 && availableBalance >= amount;
  const isExactThresholdMatch =
    settings.savingMode === 'YAKUBU' && desiredSavedAmount === 0;

  return {
    savedAmount,
    totalDebit: amount + savedAmount,
    isBufferSkippedDueToInsufficientFunds,
    isExactThresholdMatch,
  };
}

function buildMockTransaction(input: {
  amount: number;
  merchantName: string;
  merchantSubtitle: string;
  paymentMethod: string;
  recipient: string;
  savedAmount?: number;
  type: TransactionType;
  icon?: BufferTransaction['icon'];
  status?: TransactionStatus;
  note?: string;
}): BufferTransaction {
  const createdAt = new Date().toISOString();

  return {
    id: `txn-${Date.now()}`,
    merchantName: input.merchantName,
    merchantSubtitle: input.merchantSubtitle,
    icon:
      input.icon ??
      (input.type === 'PAYMENT'
        ? input.merchantName.toLowerCase().includes('spotify')
          ? 'spotify'
          : 'buffer_spend'
        : input.type === 'FUND_WALLET'
          ? 'buffer_add_money'
          : input.type === 'CUSHION_BILL_PAYMENT'
            ? 'buffer_utility'
          : 'buffer_out'),
    amount: input.amount,
    savedAmount: input.savedAmount ?? 0,
    status: input.status ?? 'SUCCESS',
    type: input.type,
    reference: createReference(),
    recipient: input.recipient,
    paymentMethod: input.paymentMethod,
    createdAt,
    dateLabel: formatTransactionDateLabel(createdAt),
    note: input.note,
  };
}

async function parseResponse(response: Response) {
  const responseText = await response.text();

  if (!responseText) {
    return undefined;
  }

  try {
    return JSON.parse(responseText) as unknown;
  } catch {
    return responseText;
  }
}

async function request<T>(path: string, options: { method?: string; token: string; body?: unknown }) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${options.token}`,
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    const message =
      pickString(
        isRecord(payload) ? payload.error : undefined,
        isRecord(payload) ? payload.message : undefined,
      ) ?? `Request failed with status ${response.status}`;

    throw new BufferApiError(message, response.status);
  }

  return payload as T;
}

function normalizeProfile(payload: unknown, fallback: BufferUser): BufferUser {
  const raw = unwrapData(payload);

  if (!isRecord(raw)) {
    return fallback;
  }

  const name = formatDisplayName(
    pickString(raw.name, raw.fullName, raw.firstName, fallback.name) ?? fallback.name,
  );

  return {
    id: pickString(raw.id, raw.userId, fallback.id) ?? fallback.id,
    name,
    email: pickString(raw.email, fallback.email) ?? fallback.email,
    avatarLabel: getInitials(name),
    bvn: pickString(raw.bvn, fallback.bvn),
    nin: pickString(raw.nin, fallback.nin),
    kycStatus: toKycStatus(raw.kycStatus, fallback.kycStatus),
  };
}

function normalizeWallet(payload: unknown, fallback: Wallet, transactions: BufferTransaction[]): Wallet {
  const raw = unwrapData(payload);

  if (!isRecord(raw)) {
    return {
      ...fallback,
      bufferedLast30Days:
        fallback.bufferedLast30Days ||
        transactions.reduce((total, transaction) => total + transaction.savedAmount, 0),
    };
  }

  const bufferedFromTransactions = transactions.reduce(
    (total, transaction) => total + transaction.savedAmount,
    0,
  );

  return {
    balance:
      pickNumber(raw.balance, raw.mainBalance, raw.walletBalance, raw.availableBalance) ??
      fallback.balance,
    cushionBalance:
      pickNumber(
        raw.cushionBalance,
        raw.bufferBalance,
        raw.bufferedBalance,
        raw.reserveBalance,
      ) ?? fallback.cushionBalance,
    bufferedLast30Days:
      pickNumber(
        raw.bufferedLast30Days,
        raw.savedLast30Days,
        raw.roundUpLast30Days,
        raw.monthlySavings,
      ) ??
      fallback.bufferedLast30Days ??
      bufferedFromTransactions,
  };
}

function normalizeSettings(payload: unknown, fallback: UserSettings): UserSettings {
  const raw = unwrapData(payload);

  if (!isRecord(raw)) {
    return fallback;
  }

  return {
    savingMode: toSavingMode(raw.savingMode ?? raw.mode, fallback.savingMode),
    percentage: pickNumber(raw.percentage, fallback.percentage) ?? fallback.percentage,
    roundUpThreshold:
      pickNumber(raw.roundUpThreshold, raw.threshold, fallback.roundUpThreshold) ??
      fallback.roundUpThreshold,
  };
}

function normalizeCard(payload: unknown, accountName: string): BufferCard | null {
  const raw = unwrapData(payload);

  if (!isRecord(raw)) {
    return null;
  }

  const fullPan =
    pickString(raw.fullPan, raw.pan, raw.cardNumber, raw.virtualCardNumber) ??
    '4000 0000 0000 2503';

  return {
    id: pickString(raw.id, raw.cardId) ?? `card-${Math.random().toString(36).slice(2, 10)}`,
    maskedPan:
      pickString(raw.maskedPan, raw.maskedCardNumber, raw.panMasked) ??
      (pickString(raw.last4) ? `4000 •••• •••• ${pickString(raw.last4)}` : maskPan(fullPan)),
    fullPan,
    accountName: pickString(raw.accountName, raw.cardHolderName, raw.nameOnCard, accountName) ?? accountName,
    expiryDate: pickString(raw.expiryDate, raw.expiry, raw.expirationDate) ?? '03/50',
    cvv: pickString(raw.cvv, raw.cvv2) ?? '111',
    status: toCardStatus(raw.status, 'ACTIVE'),
  };
}

function normalizeCards(payload: unknown, fallback: BufferCard[], accountName: string): BufferCard[] {
  const raw = unwrapData(payload);
  const list = Array.isArray(raw)
    ? raw
    : isRecord(raw) && Array.isArray(raw.cards)
      ? raw.cards
      : isRecord(raw) && Array.isArray(raw.data)
        ? raw.data
        : null;

  if (!list) {
    return fallback;
  }

  const normalizedCards = list
    .map((item) => normalizeCard(item, accountName))
    .filter((item): item is BufferCard => Boolean(item));

  return normalizedCards.length > 0 ? normalizedCards : fallback;
}

function normalizeTransactions(payload: unknown, fallback: BufferTransaction[]): BufferTransaction[] {
  const raw = unwrapData(payload);
  const list = Array.isArray(raw)
    ? raw
    : isRecord(raw) && Array.isArray(raw.transactions)
      ? raw.transactions
      : isRecord(raw) && Array.isArray(raw.items)
        ? raw.items
        : null;

  if (!list) {
    return fallback;
  }

  const normalizedTransactions = list
    .map((item, index) => {
      const transaction = unwrapData(item);

      if (!isRecord(transaction)) {
        return null;
      }

      const merchantName =
        pickString(transaction.merchantName, transaction.description, transaction.merchant) ??
        `Transaction ${index + 1}`;
      const createdAt = pickString(transaction.createdAt, transaction.timestamp) ?? new Date().toISOString();
      const savedAmount =
        pickNumber(
          transaction.savedAmount,
          transaction.roundUpAmount,
          transaction.roundupAmount,
          transaction.savingsAmount,
        ) ?? 0;
      const type = toTransactionType(transaction.type, 'PAYMENT');

      return {
        id: pickString(transaction.id, transaction.transactionId, transaction.reference) ?? `txn-${index}`,
        merchantName,
        merchantSubtitle:
          pickString(transaction.merchantSubtitle, transaction.description, transaction.category) ??
          (type === 'FUND_WALLET' ? 'Wallet top up' : 'Buffer activity'),
        icon:
          type === 'PAYMENT'
            ? merchantName.toLowerCase().includes('spotify')
              ? 'spotify'
              : 'buffer_spend'
            : type === 'FUND_WALLET'
              ? 'buffer_add_money'
              : type === 'CUSHION_BILL_PAYMENT'
                ? 'buffer_utility'
              : 'buffer_out',
        amount: pickNumber(transaction.amount, transaction.totalAmount, transaction.value) ?? 0,
        savedAmount,
        status: toTransactionStatus(transaction.status, 'SUCCESS'),
        type,
        reference: pickString(transaction.reference, transaction.transactionReference) ?? createReference(),
        recipient:
          pickString(transaction.recipient, transaction.beneficiary, transaction.merchantName, merchantName) ??
          merchantName,
        paymentMethod:
          pickString(transaction.paymentMethod, transaction.channel, transaction.method) ??
          'Buffer Card',
        createdAt,
        dateLabel: formatTransactionDateLabel(createdAt),
      };
    })
    .filter((item): item is BufferTransaction => Boolean(item))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

  return normalizedTransactions.length > 0 ? normalizedTransactions : fallback;
}

async function fetchLiveState(token: string, fallbackState: DemoState): Promise<DemoState> {
  const [profileResult, walletResult, settingsResult, cardsResult, transactionsResult] =
    await Promise.allSettled([
      request('/user/profile', { token }),
      request('/wallet', { token }),
      request('/settings', { token }),
      request('/card', { token }),
      request('/transactions', { token }),
    ]);

  const settledValues = [
    profileResult,
    walletResult,
    settingsResult,
    cardsResult,
    transactionsResult,
  ];
  const firstSuccess = settledValues.find((result) => result.status === 'fulfilled');

  if (!firstSuccess) {
    const firstError = settledValues[0];

    if (firstError.status === 'rejected') {
      throw firstError.reason;
    }

    throw new Error('Unable to load account data.');
  }

  const profile =
    profileResult.status === 'fulfilled'
      ? normalizeProfile(profileResult.value, fallbackState.profile)
      : fallbackState.profile;
  const transactions =
    transactionsResult.status === 'fulfilled'
      ? normalizeTransactions(transactionsResult.value, fallbackState.transactions)
      : fallbackState.transactions;
  const wallet =
    walletResult.status === 'fulfilled'
      ? normalizeWallet(walletResult.value, fallbackState.wallet, transactions)
      : normalizeWallet(undefined, fallbackState.wallet, transactions);
  const settings =
    settingsResult.status === 'fulfilled'
      ? normalizeSettings(settingsResult.value, fallbackState.settings)
      : fallbackState.settings;
  const cards =
    cardsResult.status === 'fulfilled'
      ? normalizeCards(cardsResult.value, fallbackState.cards, toAccountName(profile.name))
      : fallbackState.cards;

  return {
    profile,
    wallet,
    settings,
    draftSettings: settings,
    cards,
    transactions,
  };
}

function getFallbackState(currentState?: DemoState) {
  return currentState ?? createDemoState();
}

export function isMockSessionToken(token: string | null | undefined) {
  return !token || token.startsWith('buffer-');
}

export async function syncBufferState(token: string, currentState?: DemoState) {
  const fallbackState = getFallbackState(currentState);

  if (isMockSessionToken(token)) {
    return fallbackState;
  }

  return fetchLiveState(token, fallbackState);
}

export async function verifyIdentity(
  token: string,
  currentState: DemoState,
  payload: { type: 'BVN' | 'NIN'; value: string },
) {
  const nextProfile: BufferUser = {
    ...currentState.profile,
    [payload.type === 'BVN' ? 'bvn' : 'nin']: payload.value,
    kycStatus: 'VERIFIED',
  };

  if (isMockSessionToken(token)) {
    return {
      ...currentState,
      profile: nextProfile,
    };
  }

  await request('/user/verify-identity', {
    method: 'POST',
    token,
    body: payload.type === 'BVN' ? { bvn: payload.value } : { nin: payload.value },
  });

  return fetchLiveState(token, {
    ...currentState,
    profile: nextProfile,
  });
}

export async function completeSetup(token: string, currentState: DemoState) {
  const nextSettings = currentState.draftSettings;

  if (isMockSessionToken(token)) {
    const cards =
      currentState.cards.length > 0
        ? currentState.cards
        : [createMockCard(toAccountName(currentState.profile.name))];

    return {
      ...currentState,
      settings: nextSettings,
      draftSettings: nextSettings,
      cards,
    };
  }

  await request('/settings', {
    method: 'PUT',
    token,
    body: nextSettings,
  });

  if (currentState.cards.length === 0) {
    try {
      await request('/card/create', {
        method: 'POST',
        token,
      });
    } catch (error) {
      if (!(error instanceof BufferApiError) || error.status !== 400) {
        throw error;
      }
    }
  }

  return fetchLiveState(token, {
    ...currentState,
    settings: nextSettings,
    draftSettings: nextSettings,
  });
}

export async function saveSettings(token: string, currentState: DemoState, settings: UserSettings) {
  if (isMockSessionToken(token)) {
    return {
      ...currentState,
      settings,
      draftSettings: settings,
    };
  }

  await request('/settings', {
    method: 'PUT',
    token,
    body: settings,
  });

  return fetchLiveState(token, {
    ...currentState,
    settings,
    draftSettings: settings,
  });
}

export async function toggleCardStatus(token: string, currentState: DemoState, cardId: string) {
  const currentCard = currentState.cards.find((card) => card.id === cardId);

  if (!currentCard) {
    return currentState;
  }

  if (isMockSessionToken(token)) {
    const nextStatus: CardStatus = currentCard.status === 'ACTIVE' ? 'FROZEN' : 'ACTIVE';

    return {
      ...currentState,
      cards: currentState.cards.map((card) =>
        card.id === cardId
          ? {
              ...card,
              status: nextStatus,
            }
          : card,
      ),
    };
  }

  await request(currentCard.status === 'ACTIVE' ? '/card/freeze' : '/card/unfreeze', {
    method: 'POST',
    token,
    body: { cardId },
  });

  return fetchLiveState(token, currentState);
}

export async function fundWallet(token: string, currentState: DemoState, amount: number) {
  if (isMockSessionToken(token)) {
    const transaction = buildMockTransaction({
      amount,
      merchantName: 'Wallet Funding',
      merchantSubtitle: 'Bank transfer',
      paymentMethod: 'Bank Transfer',
      recipient: 'Buffer Wallet',
      type: 'FUND_WALLET',
      icon: 'buffer_add_money',
    });

    return {
      ...currentState,
      wallet: {
        ...currentState.wallet,
        balance: currentState.wallet.balance + amount,
      },
      transactions: [transaction, ...currentState.transactions],
    };
  }

  await request('/wallet/fund', {
    method: 'POST',
    token,
    body: { amount },
  });

  return fetchLiveState(token, currentState);
}

export async function simulatePayment(
  token: string,
  currentState: DemoState,
  payload: { amount: number; merchantName: string },
) {
  if (isMockSessionToken(token)) {
    const { savedAmount, totalDebit, isBufferSkippedDueToInsufficientFunds } = getSpendPreview(
      payload.amount,
      currentState.settings,
      currentState.wallet.balance,
    );

    if (payload.amount > currentState.wallet.balance) {
      const failedTransaction = buildMockTransaction({
        amount: payload.amount,
        merchantName: payload.merchantName,
        merchantSubtitle: 'Send money',
        paymentMethod: 'Main Balance',
        recipient: payload.merchantName,
        savedAmount: 0,
        type: 'PAYMENT',
        icon: 'buffer_spend',
        status: 'FAILED',
        note: 'Transfer failed due to insufficient funds.',
      });

      throw new TransactionActionError('Insufficient main balance for this transfer.', {
        ...currentState,
        transactions: [failedTransaction, ...currentState.transactions],
      });
    }

    const transaction = buildMockTransaction({
      amount: payload.amount,
      merchantName: payload.merchantName,
      merchantSubtitle: 'Send money',
      paymentMethod: 'Main Balance',
      recipient: payload.merchantName,
      savedAmount,
      type: 'PAYMENT',
      icon: 'buffer_spend',
      note: isBufferSkippedDueToInsufficientFunds
        ? 'Buffer skipped due to insufficient funds. Fund your account to keep saving automatically.'
        : undefined,
    });

    return {
      ...currentState,
      wallet: {
        ...currentState.wallet,
        balance: currentState.wallet.balance - totalDebit,
        cushionBalance: currentState.wallet.cushionBalance + savedAmount,
        bufferedLast30Days: currentState.wallet.bufferedLast30Days + savedAmount,
      },
      transactions: [transaction, ...currentState.transactions],
    };
  }

  await request('/transactions/pay', {
    method: 'POST',
    token,
    body: payload,
  });

  return fetchLiveState(token, currentState);
}

export async function withdrawCushion(
  token: string,
  currentState: DemoState,
  payload: { amount: number; accountNumber: string; bankCode: string },
) {
  if (isMockSessionToken(token)) {
    if (payload.amount > currentState.wallet.cushionBalance) {
      throw new Error('Insufficient cushion balance for this withdrawal.');
    }

    const transaction = buildMockTransaction({
      amount: payload.amount,
      merchantName: 'Cushion Withdrawal',
      merchantSubtitle: `Bank ${payload.bankCode}`,
      paymentMethod: 'Bank Transfer',
      recipient: payload.accountNumber,
      type: 'CUSHION_WITHDRAWAL',
      icon: 'buffer_out',
    });

    return {
      ...currentState,
      wallet: {
        ...currentState.wallet,
        cushionBalance: currentState.wallet.cushionBalance - payload.amount,
      },
      transactions: [transaction, ...currentState.transactions],
    };
  }

  await request('/cushion/withdraw', {
    method: 'POST',
    token,
    body: payload,
  });

  return fetchLiveState(token, currentState);
}

export async function moveCushionToMain(token: string, currentState: DemoState) {
  if (currentState.wallet.cushionBalance <= 0) {
    throw new Error('There is no cushion balance to move yet.');
  }

  if (!isMockSessionToken(token)) {
    throw new Error('Moving cushion back to your main balance is not yet exposed by the backend.');
  }

  const movedAmount = currentState.wallet.cushionBalance;
  const transaction = buildMockTransaction({
    amount: movedAmount,
    merchantName: 'Moved to Main Balance',
    merchantSubtitle: 'Cushion transfer',
    paymentMethod: 'Internal transfer',
    recipient: 'Main Balance',
    type: 'CUSHION_WITHDRAWAL',
    icon: 'buffer_in',
  });

  return {
    ...currentState,
    wallet: {
      ...currentState.wallet,
      balance: currentState.wallet.balance + movedAmount,
      cushionBalance: 0,
    },
    transactions: [transaction, ...currentState.transactions],
  };
}

export async function payBill(
  token: string,
  currentState: DemoState,
  payload: { amount: number; billerId: string; customerId: string },
) {
  if (isMockSessionToken(token)) {
    if (payload.amount > currentState.wallet.cushionBalance) {
      throw new Error('Insufficient cushion balance to pay this bill.');
    }

    const transaction = buildMockTransaction({
      amount: payload.amount,
      merchantName: 'Bill Payment',
      merchantSubtitle: payload.billerId,
      paymentMethod: 'Cushion Wallet',
      recipient: payload.customerId,
      type: 'CUSHION_BILL_PAYMENT',
      icon: 'buffer_utility',
    });

    return {
      ...currentState,
      wallet: {
        ...currentState.wallet,
        cushionBalance: currentState.wallet.cushionBalance - payload.amount,
      },
      transactions: [transaction, ...currentState.transactions],
    };
  }

  await request('/cushion/pay-bill', {
    method: 'POST',
    token,
    body: payload,
  });

  return fetchLiveState(token, currentState);
}
