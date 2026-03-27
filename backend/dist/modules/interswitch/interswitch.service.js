"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterswitchClient = void 0;
const axios_1 = __importDefault(require("axios"));
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
class InterswitchClient {
    client;
    token = null;
    tokenExpiresAt = 0;
    baseURL;
    constructor() {
        this.baseURL = process.env.INTERSWITCH_BASE_URL || 'https://sandbox.interswitchng.com';
        this.client = axios_1.default.create({
            baseURL: this.baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    get clientId() {
        return process.env.INTERSWITCH_CLIENT_ID;
    }
    get clientSecret() {
        return process.env.INTERSWITCH_CLIENT_SECRET;
    }
    ensureCredentials() {
        if (!this.clientId || !this.clientSecret) {
            throw new Error('Missing Interswitch credentials. Set INTERSWITCH_CLIENT_ID and INTERSWITCH_CLIENT_SECRET to use sandbox APIs.');
        }
    }
    mapProviderStatus(status) {
        const normalized = (status || '').toUpperCase();
        if (['SUCCESS', 'SUCCEEDED', 'COMPLETED', '00'].includes(normalized)) {
            return client_1.TransactionStatus.SUCCESS;
        }
        if (['PENDING', 'PROCESSING', 'IN_PROGRESS'].includes(normalized)) {
            return client_1.TransactionStatus.PENDING;
        }
        return client_1.TransactionStatus.FAILED;
    }
    toKobo(amount) {
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new Error('Amount must be a positive number');
        }
        return Math.round(amount * 100);
    }
    async fetchToken() {
        this.ensureCredentials();
        const authString = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
        const response = await axios_1.default.post(`${this.baseURL}/passport/oauth/token`, 'grant_type=client_credentials', {
            headers: {
                Authorization: `Basic ${authString}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        this.token = response.data.access_token;
        this.tokenExpiresAt = Date.now() + Math.max((response.data.expires_in - 300) * 1000, 60_000);
        return this.token;
    }
    async getClient() {
        if (!this.token || Date.now() > this.tokenExpiresAt) {
            await this.fetchToken();
        }
        this.client.defaults.headers.common.Authorization = `Bearer ${this.token}`;
        return this.client;
    }
    async getBanks() {
        const api = await this.getClient();
        const response = await api.get('/api/v1/receiving-institutions');
        const institutions = response.data?.data ?? response.data?.institutions ?? response.data ?? [];
        return Array.isArray(institutions) ? institutions : [];
    }
    async resolveAccount(accountNumber, bankCode) {
        const api = await this.getClient();
        const response = await api.post('/api/v1/payouts/customer-lookup', {
            accountNumber,
            bankCode,
            type: 'BANK_TRANSFER',
        });
        const payload = response.data?.data ?? response.data;
        const accountName = payload?.accountName ??
            payload?.customerName ??
            payload?.beneficiaryName;
        if (!accountName) {
            throw new Error('Unable to resolve beneficiary account details from Interswitch');
        }
        return {
            accountNumber,
            bankCode,
            accountName,
            raw: payload,
        };
    }
    async authorizePayment(cardDetails, amount) {
        const api = await this.getClient();
        const response = await api.post('/api/v1/payments', {
            amount: this.toKobo(amount),
            card: {
                pan: cardDetails.maskedPan,
            },
        });
        const payload = response.data?.data ?? response.data;
        return {
            status: this.mapProviderStatus(payload?.status ?? payload?.responseCode),
            reference: payload?.merchantTransactionReference ?? payload?.reference ?? (0, crypto_1.randomUUID)(),
            providerReference: payload?.paymentId ?? payload?.reference,
            providerStatus: payload?.status ?? payload?.responseCode,
            failureReason: payload?.message,
        };
    }
    async payBill(customerId, amount, billerId) {
        const api = await this.getClient();
        const response = await api.post('/api/v1/bills/payments', {
            customerId,
            amount: this.toKobo(amount),
            billerId,
        });
        const payload = response.data?.data ?? response.data;
        return {
            status: this.mapProviderStatus(payload?.status ?? payload?.responseCode),
            reference: payload?.requestReference ?? payload?.reference ?? (0, crypto_1.randomUUID)(),
            providerReference: payload?.paymentId ?? payload?.reference,
            providerStatus: payload?.status ?? payload?.responseCode,
            failureReason: payload?.message,
        };
    }
    async transferFund(accountInfo, amount) {
        const api = await this.getClient();
        const requestReference = `BUF-${Date.now()}-${(0, crypto_1.randomUUID)().slice(0, 8)}`;
        const response = await api.post('/api/v1/payouts', {
            amount: this.toKobo(amount),
            currency: process.env.INTERSWITCH_CURRENCY || 'NGN',
            transactionRef: requestReference,
            type: 'BANK_TRANSFER',
            beneficiary: {
                accountNumber: accountInfo.accountNumber,
                bankCode: accountInfo.bankCode,
                accountName: accountInfo.accountName,
            },
            narration: accountInfo.narration ?? 'Buffer transfer',
        });
        const payload = response.data?.data ?? response.data;
        return {
            status: this.mapProviderStatus(payload?.status ?? payload?.responseCode),
            reference: requestReference,
            providerReference: payload?.payoutId ?? payload?.reference ?? requestReference,
            providerStatus: payload?.status ?? payload?.responseCode,
            failureReason: payload?.message,
            recipientName: payload?.beneficiary?.accountName ??
                payload?.accountName ??
                accountInfo.accountName,
        };
    }
    async getTransferStatus(reference) {
        const api = await this.getClient();
        const response = await api.get(`/api/v1/payouts/${reference}`);
        const payload = response.data?.data ?? response.data;
        return {
            status: this.mapProviderStatus(payload?.status ?? payload?.responseCode),
            providerStatus: payload?.status ?? payload?.responseCode,
            failureReason: payload?.message,
            raw: payload,
        };
    }
}
exports.InterswitchClient = InterswitchClient;
