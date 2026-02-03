const axios = require('axios');
const crypto = require('crypto');

class PaystackService {
  constructor() {
    this.baseURL = 'https://api.paystack.co';
    this.secretKey = process.env.PAYSTACK_SECRET_KEY;

    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // Initialize a transaction
  async initializeTransaction(data) {
    try {
      const response = await this.api.post('/transaction/initialize', {
        email: data.email,
        amount: Math.round(data.amount * 100), // Convert to pesewas
        currency: 'GHS',
        reference: data.reference,
        callback_url: data.callbackUrl,
        channels: data.channels || ['card', 'mobile_money'],
        metadata: {
          userId: data.userId,
          transactionType: data.transactionType || 'data_purchase',
          bundleId: data.bundleId,
          recipientPhone: data.recipientPhone,
          custom_fields: [
            {
              display_name: 'Transaction Type',
              variable_name: 'transaction_type',
              value: data.transactionType || 'Data Purchase'
            }
          ]
        }
      });

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Paystack initialize error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to initialize payment'
      };
    }
  }

  // Verify a transaction
  async verifyTransaction(reference) {
    try {
      const response = await this.api.get(`/transaction/verify/${reference}`);

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Paystack verify error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to verify payment'
      };
    }
  }

  // Charge mobile money
  async chargeMobileMoney(data) {
    try {
      const response = await this.api.post('/charge', {
        email: data.email,
        amount: Math.round(data.amount * 100),
        currency: 'GHS',
        reference: data.reference,
        mobile_money: {
          phone: data.phone,
          provider: data.provider // 'mtn', 'vod', 'tgo'
        },
        metadata: data.metadata
      });

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Paystack mobile money error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to charge mobile money'
      };
    }
  }

  // Submit OTP for pending charge
  async submitOTP(reference, otp) {
    try {
      const response = await this.api.post('/charge/submit_otp', {
        reference,
        otp
      });

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Paystack OTP error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit OTP'
      };
    }
  }

  // Get transaction list
  async listTransactions(params = {}) {
    try {
      const response = await this.api.get('/transaction', { params });

      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta
      };
    } catch (error) {
      console.error('Paystack list error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to list transactions'
      };
    }
  }

  // Refund transaction
  async refundTransaction(reference, amount = null) {
    try {
      const payload = { transaction: reference };
      if (amount) {
        payload.amount = Math.round(amount * 100);
      }

      const response = await this.api.post('/refund', payload);

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Paystack refund error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to process refund'
      };
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(payload, signature) {
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(JSON.stringify(payload))
      .digest('hex');

    return hash === signature;
  }

  // Get banks for transfers
  async getBanks(country = 'ghana') {
    try {
      const response = await this.api.get('/bank', {
        params: { country }
      });

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Paystack banks error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get banks'
      };
    }
  }
}

module.exports = new PaystackService();
