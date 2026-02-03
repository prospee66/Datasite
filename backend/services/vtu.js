const axios = require('axios');

/**
 * VTU Service for Ghana Data Bundle Delivery
 *
 * Supported Providers:
 * 1. HUBNET - hubnet.com.gh (Recommended for Ghana)
 * 2. VTPASS - vtpass.com
 * 3. CLUBKONNECT - clubkonnect.com
 *
 * Set VTU_PROVIDER in .env to switch providers
 */

class VTUService {
  constructor() {
    this.provider = process.env.VTU_PROVIDER || 'hubnet';
    this.apiKey = process.env.VTU_API_KEY;
    this.apiToken = process.env.VTU_API_TOKEN; // Some providers use token
    this.userId = process.env.VTU_USER_ID;

    // Provider-specific configurations
    this.providers = {
      hubnet: {
        baseURL: 'https://hubnet.com.gh/api',
        // Hubnet uses direct endpoints
      },
      vtpass: {
        baseURL: 'https://vtpass.com/api',
        // VTPass configuration
      },
      clubkonnect: {
        baseURL: 'https://www.clubkonnect.com/api',
      }
    };

    this.config = this.providers[this.provider] || this.providers.hubnet;

    this.api = axios.create({
      baseURL: process.env.VTU_API_URL || this.config.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });
  }

  // Network codes for each provider
  getNetworkCode(network) {
    const networkMaps = {
      hubnet: {
        'MTN': 'mtn',
        'TELECEL': 'vodafone',
        'AIRTELTIGO': 'airteltigo'
      },
      vtpass: {
        'MTN': 'mtn-data',
        'TELECEL': 'vodafone-gh',
        'AIRTELTIGO': 'airteltigo-gh'
      },
      clubkonnect: {
        'MTN': '01',
        'TELECEL': '02',
        'AIRTELTIGO': '03'
      }
    };

    const map = networkMaps[this.provider] || networkMaps.hubnet;
    return map[network.toUpperCase()] || network.toLowerCase();
  }

  /**
   * Purchase Data Bundle
   * Main method to deliver data to customer
   */
  async purchaseData(data) {
    console.log(`[VTU] Processing data purchase via ${this.provider}:`, {
      network: data.network,
      phone: data.phone,
      vtuCode: data.vtuCode,
      ref: data.transactionRef
    });

    try {
      let result;

      switch (this.provider) {
        case 'hubnet':
          result = await this.hubnetPurchase(data);
          break;
        case 'vtpass':
          result = await this.vtpassPurchase(data);
          break;
        case 'clubkonnect':
          result = await this.clubkonnectPurchase(data);
          break;
        default:
          result = await this.hubnetPurchase(data);
      }

      console.log(`[VTU] Purchase result:`, result);
      return result;

    } catch (error) {
      console.error('[VTU] Purchase error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'VTU service error',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * HUBNET Ghana - Purchase Implementation
   * Docs: https://hubnet.com.gh/api-documentation
   */
  async hubnetPurchase(data) {
    const payload = {
      api_key: this.apiKey,
      network: this.getNetworkCode(data.network),
      phone: this.formatPhone(data.phone),
      plan_id: data.vtuCode,
      reference: data.transactionRef
    };

    const response = await this.api.post('/data/purchase', payload);

    if (response.data.status === 'success' || response.data.status === 'pending') {
      return {
        success: true,
        data: {
          status: response.data.status,
          transactionId: response.data.transaction_id || response.data.reference,
          message: response.data.message || 'Data bundle sent successfully'
        }
      };
    }

    return {
      success: false,
      message: response.data.message || 'Failed to deliver data',
      data: response.data
    };
  }

  /**
   * VTPass - Purchase Implementation
   * Docs: https://www.vtpass.com/documentation/
   */
  async vtpassPurchase(data) {
    // VTPass uses Basic Auth
    const auth = Buffer.from(`${this.userId}:${this.apiKey}`).toString('base64');

    const response = await axios.post(
      'https://vtpass.com/api/pay',
      {
        serviceID: this.getNetworkCode(data.network),
        billersCode: this.formatPhone(data.phone),
        variation_code: data.vtuCode,
        phone: this.formatPhone(data.phone),
        request_id: data.transactionRef
      },
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const txn = response.data.content?.transactions;

    if (response.data.code === '000' || txn?.status === 'delivered') {
      return {
        success: true,
        data: {
          status: 'success',
          transactionId: txn?.transactionId || response.data.requestId,
          message: response.data.response_description || 'Data sent successfully'
        }
      };
    }

    return {
      success: false,
      message: response.data.response_description || 'Transaction failed',
      data: response.data
    };
  }

  /**
   * Club Konnect - Purchase Implementation
   */
  async clubkonnectPurchase(data) {
    const response = await this.api.post('/data', {
      UserID: this.userId,
      APIKey: this.apiKey,
      MobileNetwork: this.getNetworkCode(data.network),
      DataPlan: data.vtuCode,
      MobileNumber: this.formatPhone(data.phone),
      RequestID: data.transactionRef,
      CallBackURL: data.callbackUrl
    });

    if (response.data.status === 'successful' || response.data.status === 'ORDER_RECEIVED') {
      return {
        success: true,
        data: {
          status: 'success',
          transactionId: response.data.transactionId || response.data.orderid,
          message: response.data.message || 'Data sent successfully'
        }
      };
    }

    return {
      success: false,
      message: response.data.message || 'Failed to deliver data',
      data: response.data
    };
  }

  /**
   * Check VTU Wallet Balance
   */
  async checkBalance() {
    try {
      let response;

      switch (this.provider) {
        case 'hubnet':
          response = await this.api.get('/balance', {
            params: { api_key: this.apiKey }
          });
          return {
            success: true,
            balance: parseFloat(response.data.balance) || 0,
            currency: 'GHS'
          };

        case 'vtpass':
          const auth = Buffer.from(`${this.userId}:${this.apiKey}`).toString('base64');
          response = await axios.get('https://vtpass.com/api/balance', {
            headers: { 'Authorization': `Basic ${auth}` }
          });
          return {
            success: true,
            balance: parseFloat(response.data.contents?.balance) || 0,
            currency: 'NGN'
          };

        default:
          response = await this.api.get('/balance', {
            params: { UserID: this.userId, APIKey: this.apiKey }
          });
          return {
            success: true,
            balance: parseFloat(response.data.balance) || 0
          };
      }
    } catch (error) {
      console.error('[VTU] Balance check error:', error.response?.data || error.message);
      return {
        success: false,
        message: 'Failed to check VTU balance',
        balance: 0
      };
    }
  }

  /**
   * Get Available Data Plans from Provider
   */
  async getDataPlans(network) {
    try {
      let response;

      switch (this.provider) {
        case 'hubnet':
          response = await this.api.get('/data/plans', {
            params: {
              api_key: this.apiKey,
              network: this.getNetworkCode(network)
            }
          });
          return { success: true, data: response.data.plans || response.data };

        case 'vtpass':
          response = await axios.get(
            `https://vtpass.com/api/service-variations?serviceID=${this.getNetworkCode(network)}`
          );
          return { success: true, data: response.data.content?.varations || [] };

        default:
          response = await this.api.get('/dataplans', {
            params: {
              UserID: this.userId,
              APIKey: this.apiKey,
              MobileNetwork: this.getNetworkCode(network)
            }
          });
          return { success: true, data: response.data.plans || response.data };
      }
    } catch (error) {
      console.error('[VTU] Plans fetch error:', error.response?.data || error.message);
      return { success: false, message: 'Failed to fetch data plans', data: [] };
    }
  }

  /**
   * Query Transaction Status
   */
  async queryTransaction(transactionRef) {
    try {
      let response;

      switch (this.provider) {
        case 'hubnet':
          response = await this.api.get('/transaction/status', {
            params: { api_key: this.apiKey, reference: transactionRef }
          });
          break;

        case 'vtpass':
          const auth = Buffer.from(`${this.userId}:${this.apiKey}`).toString('base64');
          response = await axios.post(
            'https://vtpass.com/api/requery',
            { request_id: transactionRef },
            { headers: { 'Authorization': `Basic ${auth}` } }
          );
          break;

        default:
          response = await this.api.get('/query', {
            params: { UserID: this.userId, APIKey: this.apiKey, RequestID: transactionRef }
          });
      }

      return { success: true, data: response.data };
    } catch (error) {
      console.error('[VTU] Query error:', error.response?.data || error.message);
      return { success: false, message: 'Failed to query transaction' };
    }
  }

  /**
   * Format phone number for Ghana (233 prefix)
   */
  formatPhone(phone) {
    let cleaned = phone.replace(/\D/g, '');

    if (cleaned.startsWith('233')) return cleaned;
    if (cleaned.startsWith('0')) return '233' + cleaned.substring(1);
    if (cleaned.length === 9) return '233' + cleaned;

    return cleaned;
  }

  /**
   * Detect network from Ghana phone number
   */
  detectNetwork(phone) {
    const cleaned = this.formatPhone(phone);
    const prefix = cleaned.substring(3, 5);

    const mtnPrefixes = ['24', '25', '53', '54', '55', '59'];
    const telecelPrefixes = ['20', '50'];
    const airteltigoPrefixes = ['26', '27', '56', '57'];

    if (mtnPrefixes.includes(prefix)) return 'MTN';
    if (telecelPrefixes.includes(prefix)) return 'TELECEL';
    if (airteltigoPrefixes.includes(prefix)) return 'AIRTELTIGO';

    return null;
  }
}

module.exports = new VTUService();
