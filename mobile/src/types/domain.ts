export type SavingMode = 'AGBA' | 'YAKUBU';
export type KycStatus = 'PENDING' | 'VERIFIED' | 'FAILED';
export type CardStatus = 'ACTIVE' | 'FROZEN';
export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED';
export type TransactionType =
  | 'PAYMENT'
  | 'FUND_WALLET'
  | 'CUSHION_WITHDRAWAL'
  | 'CUSHION_BILL_PAYMENT';

export interface BufferUser {
  id: string;
  name: string;
  email: string;
  avatarLabel: string;
  bvn?: string;
  nin?: string;
  kycStatus: KycStatus;
}

export interface Wallet {
  balance: number;
  cushionBalance: number;
  bufferedLast30Days: number;
  accountNumber: string;
}

export interface UserSettings {
  savingMode: SavingMode;
  percentage: number;
  roundUpThreshold: number;
}

export interface BufferCard {
  id: string;
  maskedPan: string;
  fullPan: string;
  accountName: string;
  expiryDate: string;
  cvv: string;
  status: CardStatus;
}

export interface BufferTransaction {
  id: string;
  merchantName: string;
  merchantSubtitle: string;
  icon:
    | 'shopping'
    | 'spotify'
    | 'buffer_in'
    | 'buffer_out'
    | 'buffer_spend'
    | 'buffer_add_money'
    | 'buffer_utility';
  amount: number;
  savedAmount: number;
  status: TransactionStatus;
  type: TransactionType;
  reference: string;
  recipient: string;
  paymentMethod: string;
  createdAt: string;
  dateLabel: string;
  note?: string;
}
