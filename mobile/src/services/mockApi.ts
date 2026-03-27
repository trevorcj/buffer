import { BufferCard, BufferTransaction, BufferUser, UserSettings, Wallet } from '../types/domain';
import { buildAccountNumber, getInitials } from '../utils/format';

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

function createProfile(name = 'Oluwafemi A.', email = 'oluwafemi@buffer.app'): BufferUser {
  const normalizedIdSource = `${email}-${name}`.toLowerCase().replace(/[^a-z0-9]/g, '');

  return {
    id: `user-${normalizedIdSource.slice(0, 24) || 'bufferdemo'}`,
    name,
    email,
    avatarLabel: getInitials(name),
    kycStatus: 'VERIFIED',
    bvn: '*565*20#',
  };
}

export function createDemoState(name?: string, email?: string): DemoState {
  return createEmptyDemoState(name, email);
}

export function createEmptyDemoState(name?: string, email?: string): DemoState {
  const profile = {
    ...createProfile(name, email),
    kycStatus: 'PENDING' as const,
    bvn: undefined,
    nin: undefined,
  };
  const settings = { ...DEFAULT_SETTINGS };

  return {
    profile,
    wallet: {
      balance: 0,
      cushionBalance: 0,
      bufferedLast30Days: 0,
      accountNumber: buildAccountNumber(`${profile.id}-${profile.email}`),
    },
    settings,
    draftSettings: settings,
    cards: [],
    transactions: [],
  };
}

export const mockApi = {
  async register(payload: { name: string; email: string; password: string }) {
    await delay();

    return {
      token: 'buffer-register-token',
      state: createEmptyDemoState(payload.name, payload.email),
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
      state: createEmptyDemoState(normalizedName || 'Oluwafemi A.', payload.email),
    };
  },

  async verifyIdentity(payload: { type: 'BVN' | 'NIN'; value: string }) {
    await delay();

    return payload;
  },
};
