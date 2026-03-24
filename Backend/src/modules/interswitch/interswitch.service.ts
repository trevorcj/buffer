import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';

export class InterswitchClient {
  private client: AxiosInstance;
  private token: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://sandbox.interswitchng.com',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private async fetchToken(): Promise<string> {
    const clientId = process.env.INTERSWITCH_CLIENT_ID || 'mock_client_id';
    const clientSecret = process.env.INTERSWITCH_SECRET_KEY || 'mock_client_secret';
    
    // Create base64 basic auth string
    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    try {
      const response = await axios.post(
        'https://sandbox.interswitchng.com/passport/oauth/token',
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${authString}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      
      this.token = response.data.access_token;
      // Expires data comes in seconds, we keep a small buffer (e.g. 5 minutes)
      this.tokenExpiresAt = Date.now() + (response.data.expires_in - 300) * 1000;
      return this.token!;
    } catch (error) {
      console.error('Interswitch token fetch failed. Using mock token for hackathon.', error);
      // Fallback for hackathon demo to ensure nothing breaks if credentials are bad
      this.token = 'mock_interswitch_token_123';
      this.tokenExpiresAt = Date.now() + 3600 * 1000;
      return this.token;
    }
  }

  public async getClient(): Promise<AxiosInstance> {
    if (!this.token || Date.now() > this.tokenExpiresAt) {
      await this.fetchToken();
    }
    
    this.client.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    return this.client;
  }

  // --- Utility wrappers for expected Interswitch endpoints ---

  /**
   * Generates official InterswitchAuth (Legacy) or MAC Signature Headers
   * As specified in: https://docs.interswitchgroup.com/docs/authentication
   */
  public generateInterswitchAuthHeaders(httpMethod: string, urlPath: string) {
    const clientId = process.env.INTERSWITCH_CLIENT_ID || '';
    const secretKey = process.env.INTERSWITCH_SECRET_KEY || '';
    
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(16).toString('hex');
    
    // Authorization: InterswitchAuth base64(CLIENT_ID)
    const encodedClientId = Buffer.from(clientId).toString('base64');
    const authorization = `InterswitchAuth ${encodedClientId}`;

    // Signature: base64(sha1(HTTP_METHOD & ENCODED_URL & TIMESTAMP & NONCE & CLIENT_ID & SECRET_KEY))
    const encodedUrl = encodeURIComponent(urlPath);
    const signatureCipher = `${httpMethod}&${encodedUrl}&${timestamp}&${nonce}&${clientId}&${secretKey}`;
    
    const signature = crypto.createHash('sha1').update(signatureCipher).digest('base64');

    return {
      Authorization: authorization,
      Timestamp: timestamp,
      Nonce: nonce,
      Signature: signature,
      SignatureMethod: 'SHA1',
    };
  }

  async authorizePayment(cardDetails: any, amount: number) {
    if (process.env.USE_MOCK_INTERSWITCH === 'true' || !process.env.INTERSWITCH_CLIENT_ID) {
      console.log(`[Interswitch Mock] Authorizing payment of ${amount} for PAN ${cardDetails.maskedPan}`);
      return { status: 'SUCCESS', reference: `ISW-${Date.now()}` }; 
    }

    const api = await this.getClient();
    const headers = this.generateInterswitchAuthHeaders('POST', '/api/v1/card360/authorize');
    try {
      const response = await api.post('/api/v1/card360/authorize', { pan: cardDetails.pan, amount }, { headers: { ...headers as any } });
      return { status: 'SUCCESS', reference: response.data?.transactionReference || `ISW-${Date.now()}` };
    } catch (error: any) {
      console.error('[Interswitch] Auth failed', error.response?.data || error.message);
      return { status: 'FAILED', reference: `FAIL-${Date.now()}` };
    }
  }

  async payBill(customerId: string, amount: number, billerId: string) {
    if (process.env.USE_MOCK_INTERSWITCH === 'true' || !process.env.INTERSWITCH_CLIENT_ID) {
      console.log(`[Interswitch Mock] Paying Bill ${billerId} for ${customerId}: ${amount}`);
      return { status: 'SUCCESS', responseCode: '00', reference: `ISW-BILL-${Date.now()}` };
    }

    const api = await this.getClient();
    const headers = this.generateInterswitchAuthHeaders('POST', '/api/v1/billpay/pay');
    try {
      const response = await api.post('/api/v1/billpay/pay', { customerId, amount, billerId }, { headers: { ...headers as any } });
      return { status: 'SUCCESS', responseCode: '00', reference: response.data?.reference || `ISW-BILL-${Date.now()}` };
    } catch (error: any) {
      return { status: 'FAILED', responseCode: '99', reference: `FAIL-${Date.now()}` };
    }
  }

  async transferFund(accountInfo: any, amount: number) {
    if (process.env.USE_MOCK_INTERSWITCH === 'true' || !process.env.INTERSWITCH_CLIENT_ID) {
      console.log(`[Interswitch Mock] Transferring Fund ${amount} to account ${accountInfo.accountNumber}`);
      return { status: 'SUCCESS', reference: `ISW-TRANS-${Date.now()}` };
    }

    const api = await this.getClient();
    const headers = this.generateInterswitchAuthHeaders('POST', '/api/v1/transfer');
    try {
      const response = await api.post('/api/v1/transfer', { account: accountInfo, amount }, { headers: { ...headers as any } });
      return { status: 'SUCCESS', reference: response.data?.reference || `ISW-TRANS-${Date.now()}` };
    } catch (error: any) {
      return { status: 'FAILED', reference: `FAIL-${Date.now()}` };
    }
  }
}
