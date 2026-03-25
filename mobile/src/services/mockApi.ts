import { BufferCard, BufferTransaction, BufferUser, UserSettings, Wallet } from '../types/domain';
import { getInitials, toAccountName } from '../utils/format';

export interface DemoState {
  profile: BufferUser;
  wallet: Wallet;
  settings: UserSettings;
  draftSettings: UserSettings;
  cards: BufferCard[];
  transactions: BufferTransaction[];
}

const DEFAULT_SETTINGS: UserSettings = {
  savingMode: 'AGBA',
  percentage: 5,
  roundUpThreshold: 100,
};

function delay(duration = 300) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

function buildTransactions(): BufferTransaction[] {
  return [
    {
      id: 'txn-online-shopping',
      merchantName: 'Online Shopping',
      merchantSubtitle: 'Jumia',
      icon: 'shopping',
      amount: 40000.34,
      savedAmount: 2000.02,
      status: 'SUCCESS',
      type: 'PAYMENT',
      reference: '2537727363533338338383',
      recipient: 'Jumia',
      paymentMethod: 'Credit Card',
      createdAt: '2026-04-23T12:20:00.000Z',
      dateLabel: 'April 23rd, 2026 12:20:00',
    },
    {
      id: 'txn-spotify',
      merchantName: 'Spotify Subscription',
      merchantSubtitle: 'Spotify Inc.',
      icon: 'spotify',
      amount: 1800,
      savedAmount: 90,
      status: 'SUCCESS',
      type: 'PAYMENT',
      reference: '2537727363533338338383',
      recipient: 'Spotify',
      paymentMethod: 'Credit Card',
      createdAt: '2026-04-23T15:37:06.000Z',
      dateLabel: 'April 23rd, 2026 15:37:06',
    },
  ];
}

function createProfile(name = 'Oluwafemi A.', email = 'oluwafemi@buffer.app'): BufferUser {
  return {
    id: 'user-buffer-demo',
    name,
    email,
    avatarLabel: getInitials(name),
    kycStatus: 'VERIFIED',
    bvn: '*565*20#',
  };
}

function createCard(accountName: string): BufferCard {
  return {
    id: 'card-buffer-1',
    maskedPan: '4000 •••• •••• •••• 2503',
    fullPan: '4000 0000 0000 2503',
    accountName,
    expiryDate: '03/50',
    cvv: '111',
    status: 'ACTIVE',
  };
}

export function createDemoState(name?: string, email?: string): DemoState {
  const profile = createProfile(name, email);
  const settings = { ...DEFAULT_SETTINGS };

  return {
    profile,
    wallet: {
      balance: 26589.24,
      cushionBalance: 2090,
      bufferedLast30Days: 2090.02,
    },
    settings,
    draftSettings: settings,
    cards: [createCard(toAccountName(profile.name))],
    transactions: buildTransactions(),
  };
}

export const mockApi = {
  async register(payload: { name: string; email: string; password: string }) {
    await delay();

    return {
      token: 'buffer-register-token',
      state: createDemoState(payload.name, payload.email),
    };
  },

  async login(payload: { email: string; password: string }) {
    await delay();

    const fallbackName = payload.email.includes('@')
      ? payload.email.split('@')[0].replace(/[._-]/g, ' ')
      : 'Oluwafemi A.';
    const normalizedName = fallbackName
      .split(' ')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    return {
      token: 'buffer-login-token',
      state: createDemoState(normalizedName || 'Oluwafemi A.', payload.email),
    };
  },

  async verifyIdentity(payload: { type: 'BVN' | 'NIN'; value: string }) {
    await delay();

    return payload;
  },
};
