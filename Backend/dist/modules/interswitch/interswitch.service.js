"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterswitchClient = void 0;
const axios_1 = __importDefault(require("axios"));
class InterswitchClient {
    client;
    token = null;
    tokenExpiresAt = 0;
    constructor() {
        this.client = axios_1.default.create({
            baseURL: 'https://sandbox.interswitchng.com',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    async fetchToken() {
        const clientId = process.env.INTERSWITCH_CLIENT_ID || 'mock_client_id';
        const clientSecret = process.env.INTERSWITCH_CLIENT_SECRET || 'mock_client_secret';
        // Create base64 basic auth string
        const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        try {
            const response = await axios_1.default.post('https://sandbox.interswitchng.com/passport/oauth/token', 'grant_type=client_credentials', {
                headers: {
                    'Authorization': `Basic ${authString}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            this.token = response.data.access_token;
            // Expires data comes in seconds, we keep a small buffer (e.g. 5 minutes)
            this.tokenExpiresAt = Date.now() + (response.data.expires_in - 300) * 1000;
            return this.token;
        }
        catch (error) {
            console.error('Interswitch token fetch failed. Using mock token for hackathon.', error);
            // Fallback for hackathon demo to ensure nothing breaks if credentials are bad
            this.token = 'mock_interswitch_token_123';
            this.tokenExpiresAt = Date.now() + 3600 * 1000;
            return this.token;
        }
    }
    async getClient() {
        if (!this.token || Date.now() > this.tokenExpiresAt) {
            await this.fetchToken();
        }
        this.client.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        return this.client;
    }
    // --- Utility wrappers for expected Interswitch endpoints ---
    async authorizePayment(cardDetails, amount) {
        const api = await this.getClient();
        // Interswitch POS / Webpay simulation
        // Since this is a hackathon, we mock the success if actual API isn't provisioned.
        console.log(`[Interswitch] Authorizing payment of ${amount} for PAN ${cardDetails.maskedPan}`);
        return { status: 'SUCCESS', reference: `ISW-${Date.now()}` };
    }
    async payBill(customerId, amount, billerId) {
        const api = await this.getClient();
        console.log(`[Interswitch] Paying Bill ${billerId} for ${customerId}: ${amount}`);
        return { status: 'SUCCESS', responseCode: '00', reference: `ISW-BILL-${Date.now()}` };
    }
    async transferFund(accountInfo, amount) {
        const api = await this.getClient();
        console.log(`[Interswitch] Transferring Fund ${amount} to account ${accountInfo.accountNumber}`);
        return { status: 'SUCCESS', reference: `ISW-TRANS-${Date.now()}` };
    }
}
exports.InterswitchClient = InterswitchClient;
