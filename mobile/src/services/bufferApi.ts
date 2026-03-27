import { DemoState, createEmptyDemoState } from './mockApi';
import { loadAccountPin, loadAccountState, persistAccountState } from './storage';
import { BufferCard, BufferTransaction, BufferUser, CardStatus, KycStatus, SavingMode, TransactionStatus, TransactionType, UserSettings, Wallet } from '../types/domain';
import { buildAccountNumber, buildVisaCardDetails, formatDisplayName, getInitials, toAccountName } from '../utils/format';

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

export interface AuthSessionResult {
  token: string;
  state: DemoState;
  transactionPin?: string | null;
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

  return `**** **** **** ${suffix}`;
}

function createMockCard(accountName: string, seed: string): BufferCard {
  const details = buildVisaCardDetails(seed);

  return {
    id: `card-${Date.now()}`,
    maskedPan: details.maskedPan,
    fullPan: details.fullPan,
    accountName,
    expiryDate: details.expiryDate,
    cvv: details.cvv,
    status: 'ACTIVE',
  };
}

function formatAccountNumberLabel(accountNumber?: string) {
  if (!accountNumber) {
    return 'Send money';
  }

  const digits = accountNumber.replace(/\D/g, '');

  if (digits.length <= 4) {
    return accountNumber;
  }

  return `Acct •••• ${digits.slice(-4)}`;
}

async function hydrateAccountState(email: string, fallbackState: DemoState) {
  const cachedState = await loadAccountState(email);
  const normalizedEmail = email.trim().toLowerCase();

  if (cachedState?.profile.email?.trim().toLowerCase() === normalizedEmail) {
    return cachedState;
  }

  return fallbackState;
}

function getFinancialSeed(input: { userId?: string; email?: string; fallback: string }) {
  return pickString(input.userId, input.email, input.fallback) ?? input.fallback;
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

function getTransactionDisplayCopy(type: TransactionType) {
  switch (type) {
    case 'FUND_WALLET':
      return {
        merchantName: 'Add Money',
        merchantSubtitle: 'Main balance top up',
        recipient: 'Main Balance',
        paymentMethod: 'Bank Transfer',
        icon: 'buffer_add_money' as const,
      };
    case 'CUSHION_WITHDRAWAL':
      return {
        merchantName: 'Cushion Withdrawal',
        merchantSubtitle: 'Sent to bank',
        recipient: 'Bank Account',
        paymentMethod: 'Bank Transfer',
        icon: 'buffer_out' as const,
      };
    case 'CUSHION_BILL_PAYMENT':
      return {
        merchantName: 'Bill Payment',
        merchantSubtitle: 'Utility payment',
        recipient: 'Utility Provider',
        paymentMethod: 'Cushion Wallet',
        icon: 'buffer_utility' as const,
      };
    case 'PAYMENT':
    default:
      return {
        merchantName: 'Money Sent',
        merchantSubtitle: 'Send money',
        recipient: 'Recipient',
        paymentMethod: 'Main Balance',
        icon: 'buffer_spend' as const,
      };
  }
}

function upsertTransaction(
  transactions: BufferTransaction[],
  transaction: BufferTransaction,
) {
  const existingIndex = transactions.findIndex(
    (item) => item.id === transaction.id || item.reference === transaction.reference,
  );

  if (existingIndex === -1) {
    return [transaction, ...transactions];
  }

  const existingTransaction = transactions[existingIndex];
  const mergedTransaction = {
    ...existingTransaction,
    ...transaction,
  };

  return [
    mergedTransaction,
    ...transactions.filter((_, index) => index !== existingIndex),
  ].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

function buildLiveActionTransaction(input: {
  id?: string;
  reference?: string;
  amount: number;
  type: TransactionType;
  createdAt?: string;
  status?: TransactionStatus;
  savedAmount?: number;
  merchantName?: string;
  merchantSubtitle?: string;
  recipient?: string;
  paymentMethod?: string;
  note?: string;
  icon?: BufferTransaction['icon'];
}) {
  const defaults = getTransactionDisplayCopy(input.type);
  const createdAt = input.createdAt ?? new Date().toISOString();

  return {
    id: input.id ?? `txn-${Date.now()}`,
    merchantName: input.merchantName ?? defaults.merchantName,
    merchantSubtitle: input.merchantSubtitle ?? defaults.merchantSubtitle,
    icon: input.icon ?? defaults.icon,
    amount: input.amount,
    savedAmount: input.savedAmount ?? 0,
    status: input.status ?? 'SUCCESS',
    type: input.type,
    reference: input.reference ?? createReference(),
    recipient: input.recipient ?? defaults.recipient,
    paymentMethod: input.paymentMethod ?? defaults.paymentMethod,
    createdAt,
    dateLabel: formatTransactionDateLabel(createdAt),
    note: input.note,
  } satisfies BufferTransaction;
}

function runLocalPaymentSimulation(
  currentState: DemoState,
  payload: { amount: number; merchantName: string; accountNumber?: string; description?: string },
) {
  const { savedAmount, totalDebit, isBufferSkippedDueToInsufficientFunds } = getSpendPreview(
    payload.amount,
    currentState.settings,
    currentState.wallet.balance,
  );

  if (payload.amount > currentState.wallet.balance) {
    const failedTransaction = buildMockTransaction({
      amount: payload.amount,
      merchantName: payload.merchantName,
      merchantSubtitle: formatAccountNumberLabel(payload.accountNumber),
      paymentMethod: 'Bank Transfer',
      recipient: payload.merchantName,
      savedAmount: 0,
      type: 'PAYMENT',
      icon: 'buffer_spend',
      status: 'FAILED',
      note: payload.description?.trim() || 'Transfer failed due to insufficient funds.',
    });

    throw new TransactionActionError('Insufficient main balance for this transfer.', {
      ...currentState,
      transactions: [failedTransaction, ...currentState.transactions],
    });
  }

  const transaction = buildMockTransaction({
    amount: payload.amount,
    merchantName: payload.merchantName,
    merchantSubtitle: formatAccountNumberLabel(payload.accountNumber),
    paymentMethod: 'Bank Transfer',
    recipient: payload.merchantName,
    savedAmount,
    type: 'PAYMENT',
    icon: 'buffer_spend',
    note:
      payload.description?.trim() ||
      (isBufferSkippedDueToInsufficientFunds
        ? 'Buffer skipped due to insufficient funds. Fund your account to keep saving automatically.'
        : undefined),
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

async function requestPublic<T>(path: string, options: { method?: string; body?: unknown }) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
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

function isOnboardingComplete(state: DemoState) {
  return state.profile.kycStatus === 'VERIFIED' && state.cards.length > 0;
}

export function inferOnboardingCompletion(state: DemoState) {
  return isOnboardingComplete(state);
}

export async function registerUser(payload: { name: string; email: string; password: string }) {
  const response = await requestPublic<{ token?: string }>('/auth/register', {
    method: 'POST',
    body: payload,
  });

  const token = pickString(response.token);

  if (!token) {
    throw new Error('Registration succeeded but no auth token was returned.');
  }

  const state = await syncBufferState(token, createEmptyDemoState(payload.name, payload.email));
  await persistAccountState(payload.email, state);

  return {
    token,
    state,
  } satisfies AuthSessionResult;
}

export async function loginUser(payload: { email: string; password: string }) {
  const response = await requestPublic<{ token?: string }>('/auth/login', {
    method: 'POST',
    body: payload,
  });

  const token = pickString(response.token);

  if (!token) {
    throw new Error('Login succeeded but no auth token was returned.');
  }

  const fallbackName = payload.email.includes('@')
    ? payload.email.split('@')[0].replace(/[._-]/g, ' ')
    : 'Buffer User';
  const liveState = await syncBufferState(
    token,
    createEmptyDemoState(formatDisplayName(fallbackName || 'Buffer User'), payload.email),
  );
  const state = await hydrateAccountState(payload.email, liveState);
  const transactionPin = await loadAccountPin(payload.email);

  return {
    token,
    state,
    transactionPin,
  } satisfies AuthSessionResult;
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

function normalizeWallet(
  payload: unknown,
  fallback: Wallet,
  transactions: BufferTransaction[],
  financialSeed: string,
): Wallet {
  const raw = unwrapData(payload);

  if (!isRecord(raw)) {
    return {
      ...fallback,
      bufferedLast30Days:
        fallback.bufferedLast30Days ||
        transactions.reduce((total, transaction) => total + transaction.savedAmount, 0),
      accountNumber: fallback.accountNumber || buildAccountNumber(financialSeed),
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
    accountNumber:
      pickString(raw.accountNumber, raw.virtualAccountNumber, raw.nuban, raw.walletAccountNumber) ??
      fallback.accountNumber ??
      buildAccountNumber(financialSeed),
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

function normalizeCard(payload: unknown, accountName: string, financialSeed: string): BufferCard | null {
  const raw = unwrapData(payload);

  if (!isRecord(raw)) {
    return null;
  }

  const rawMaskedPan = pickString(raw.maskedPan, raw.maskedCardNumber, raw.panMasked);
  const last4 = pickString(raw.last4) ?? rawMaskedPan?.replace(/\D/g, '').slice(-4);
  const cardSeed = `${financialSeed}-${pickString(raw.id, raw.cardId, accountName) ?? accountName}`;
  const generatedCardDetails = buildVisaCardDetails(cardSeed, last4);
  const fullPan =
    pickString(raw.fullPan, raw.pan, raw.cardNumber, raw.virtualCardNumber) ??
    generatedCardDetails.fullPan;

  return {
    id: pickString(raw.id, raw.cardId) ?? `card-${Math.random().toString(36).slice(2, 10)}`,
    maskedPan: rawMaskedPan ? maskPan(rawMaskedPan) : maskPan(fullPan),
    fullPan,
    accountName: pickString(raw.accountName, raw.cardHolderName, raw.nameOnCard, accountName) ?? accountName,
    expiryDate:
      pickString(raw.expiryDate, raw.expiry, raw.expirationDate) ?? generatedCardDetails.expiryDate,
    cvv: pickString(raw.cvv, raw.cvv2) ?? generatedCardDetails.cvv,
    status: toCardStatus(raw.status, 'ACTIVE'),
  };
}

function normalizeCards(
  payload: unknown,
  fallback: BufferCard[],
  accountName: string,
  financialSeed: string,
): BufferCard[] {
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
    .map((item) => normalizeCard(item, accountName, financialSeed))
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

      const type = toTransactionType(transaction.type, 'PAYMENT');
      const displayCopy = getTransactionDisplayCopy(type);
      const merchantName =
        pickString(transaction.merchantName, transaction.description, transaction.merchant) ??
        displayCopy.merchantName;
      const createdAt = pickString(transaction.createdAt, transaction.timestamp) ?? new Date().toISOString();
      const savedAmount =
        pickNumber(
          transaction.savedAmount,
          transaction.roundUpAmount,
          transaction.roundupAmount,
          transaction.savingsAmount,
        ) ?? 0;

      const normalizedTransaction: BufferTransaction = {
        id: pickString(transaction.id, transaction.transactionId, transaction.reference) ?? `txn-${index}`,
        merchantName,
        merchantSubtitle:
          pickString(transaction.merchantSubtitle, transaction.description, transaction.category) ??
          displayCopy.merchantSubtitle,
        icon: merchantName.toLowerCase().includes('spotify') ? 'spotify' : displayCopy.icon,
        amount: pickNumber(transaction.amount, transaction.totalAmount, transaction.value) ?? 0,
        savedAmount,
        status: toTransactionStatus(transaction.status, 'SUCCESS'),
        type,
        reference: pickString(transaction.reference, transaction.transactionReference) ?? createReference(),
        recipient:
          pickString(transaction.recipient, transaction.beneficiary, transaction.merchantName, merchantName) ??
          displayCopy.recipient,
        paymentMethod:
          pickString(transaction.paymentMethod, transaction.channel, transaction.method) ??
          displayCopy.paymentMethod,
        createdAt,
        dateLabel: formatTransactionDateLabel(createdAt),
        note: pickString(transaction.note, transaction.failureReason),
      };

      return normalizedTransaction;
    })
    .filter((item): item is BufferTransaction => item !== null)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

  return normalizedTransactions.length > 0 ? normalizedTransactions : fallback;
}

async function fetchLiveState(token: string, fallbackState: DemoState): Promise<DemoState> {
  const [profileResult, walletResult, settingsResult, cardsResult, transactionsResult] =
    await Promise.allSettled([
      request('/user/profile', { token }),
      request('/wallet', { token }),
      request('/user/settings', { token }),
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
  const financialSeed = getFinancialSeed({
    userId: profile.id,
    email: profile.email,
    fallback: fallbackState.profile.email,
  });
  const transactions =
    transactionsResult.status === 'fulfilled'
      ? normalizeTransactions(transactionsResult.value, fallbackState.transactions)
      : fallbackState.transactions;
  const wallet =
    walletResult.status === 'fulfilled'
      ? normalizeWallet(walletResult.value, fallbackState.wallet, transactions, financialSeed)
      : normalizeWallet(undefined, fallbackState.wallet, transactions, financialSeed);
  const settings =
    settingsResult.status === 'fulfilled'
      ? normalizeSettings(settingsResult.value, fallbackState.settings)
      : fallbackState.settings;
  const cards =
    cardsResult.status === 'fulfilled'
      ? normalizeCards(
          cardsResult.value,
          fallbackState.cards,
          toAccountName(profile.name),
          financialSeed,
        )
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
  return currentState ?? createEmptyDemoState();
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
        : [createMockCard(toAccountName(currentState.profile.name), currentState.profile.id)];

    return {
      ...currentState,
      settings: nextSettings,
      draftSettings: nextSettings,
      cards,
    };
  }

  await request('/user/settings', {
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

  await request('/user/settings', {
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

  const response = await request<{ wallet?: unknown }>('/wallet/fund', {
    method: 'POST',
    token,
    body: { amount },
  });

  const nextState = await fetchLiveState(token, currentState);

  return {
    ...nextState,
    transactions: upsertTransaction(
      nextState.transactions,
      buildLiveActionTransaction({
        amount,
        type: 'FUND_WALLET',
      }),
    ),
  };
}

export async function simulatePayment(
  token: string,
  currentState: DemoState,
  payload: { amount: number; merchantName: string; accountNumber?: string; description?: string },
) {
  if (isMockSessionToken(token)) {
    return runLocalPaymentSimulation(currentState, payload);
  }

  let response: {
    transaction?: {
      id?: string;
      reference?: string;
      createdAt?: string;
      status?: string;
    };
    savedAmount?: number | string;
  };

  try {
    response = await request<{
      transaction?: {
        id?: string;
        reference?: string;
        createdAt?: string;
        status?: string;
      };
      savedAmount?: number | string;
    }>('/transactions/pay', {
      method: 'POST',
      token,
      body: {
        amount: payload.amount,
        merchantName: payload.merchantName,
      },
    });
  } catch (error) {
    if (error instanceof BufferApiError && error.message.includes('status code 401')) {
      return runLocalPaymentSimulation(currentState, payload);
    }

    throw error;
  }

  const nextState = await fetchLiveState(token, currentState);

  return {
    ...nextState,
    transactions: upsertTransaction(
      nextState.transactions,
      buildLiveActionTransaction({
        id: pickString(response.transaction?.id),
        reference: pickString(response.transaction?.reference),
        createdAt: pickString(response.transaction?.createdAt),
        status: toTransactionStatus(response.transaction?.status, 'SUCCESS'),
        amount: payload.amount,
        type: 'PAYMENT',
        savedAmount: pickNumber(response.savedAmount) ?? 0,
        merchantName: payload.merchantName,
        merchantSubtitle: formatAccountNumberLabel(payload.accountNumber),
        recipient: payload.merchantName,
        paymentMethod: 'Bank Transfer',
        icon: 'buffer_spend',
        note: payload.description?.trim() || undefined,
      }),
    ),
  };
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

  const response = await request<{
    transaction?: {
      id?: string;
      reference?: string;
      createdAt?: string;
      status?: string;
    };
  }>('/cushion/withdraw', {
    method: 'POST',
    token,
    body: payload,
  });

  const nextState = await fetchLiveState(token, currentState);

  return {
    ...nextState,
    transactions: upsertTransaction(
      nextState.transactions,
      buildLiveActionTransaction({
        id: pickString(response.transaction?.id),
        reference: pickString(response.transaction?.reference),
        createdAt: pickString(response.transaction?.createdAt),
        status: toTransactionStatus(response.transaction?.status, 'SUCCESS'),
        amount: payload.amount,
        type: 'CUSHION_WITHDRAWAL',
        merchantSubtitle: `Bank ${payload.bankCode}`,
        recipient: payload.accountNumber,
      }),
    ),
  };
}

export async function moveCushionToMain(token: string, currentState: DemoState) {
  if (currentState.wallet.cushionBalance < 1000) {
    throw new Error('You need at least ₦1,000 in your cushion before moving funds back.');
  }

  const movedAmount = currentState.wallet.cushionBalance;
  const buildLocalState = () => {
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
  };

  if (isMockSessionToken(token)) {
    return buildLocalState();
  }

  try {
    const response = await request<{
      transaction?: {
        id?: string;
        reference?: string;
        createdAt?: string;
        status?: string;
      };
    }>('/cushion/move-to-main', {
      method: 'POST',
      token,
      body: { amount: movedAmount },
    });

    const nextState = await fetchLiveState(token, currentState);

    return {
      ...nextState,
      transactions: upsertTransaction(
        nextState.transactions,
        buildLiveActionTransaction({
          id: pickString(response.transaction?.id),
          reference: pickString(response.transaction?.reference),
          createdAt: pickString(response.transaction?.createdAt),
          status: toTransactionStatus(response.transaction?.status, 'SUCCESS'),
          amount: movedAmount,
          type: 'CUSHION_WITHDRAWAL',
          merchantName: 'Moved to Main Balance',
          merchantSubtitle: 'Cushion transfer',
          recipient: 'Main Balance',
          paymentMethod: 'Internal transfer',
          icon: 'buffer_in',
        }),
      ),
    };
  } catch (error) {
    if (
      error instanceof BufferApiError &&
      (error.status === 404 ||
        (error.status === 400 && error.message.toLowerCase().includes('insufficient cushion balance')))
    ) {
      return buildLocalState();
    }

    throw error;
  }
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

  const response = await request<{
    transaction?: {
      id?: string;
      reference?: string;
      createdAt?: string;
      status?: string;
    };
  }>('/cushion/pay-bill', {
    method: 'POST',
    token,
    body: payload,
  });

  const nextState = await fetchLiveState(token, currentState);

  return {
    ...nextState,
    transactions: upsertTransaction(
      nextState.transactions,
      buildLiveActionTransaction({
        id: pickString(response.transaction?.id),
        reference: pickString(response.transaction?.reference),
        createdAt: pickString(response.transaction?.createdAt),
        status: toTransactionStatus(response.transaction?.status, 'SUCCESS'),
        amount: payload.amount,
        type: 'CUSHION_BILL_PAYMENT',
        merchantSubtitle: payload.billerId,
        recipient: payload.customerId,
      }),
    ),
  };
}
