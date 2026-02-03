const axios = require('axios');

class VTUService {
  constructor() {
    this.baseURL = process.env.VTU_API_URL || 'https://www.clubkonnect.com/api';
    this.apiKey = process.env.VTU_API_KEY;
    this.userId = process.env.VTU_USER_ID;

    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Map network name to VTU provider code
  getNetworkCode(network) {
    const networkMap = {
      'MTN': '01',
      'TELECEL': '02', // Vodafone/Telecel
      'AIRTELTIGO': '03'
    };
    return networkMap[network.toUpperCase()] || '01';
  }

  // Purchase data bundle
  async purchaseData(data) {
    try {
      // This is a generic implementation - adjust based on your VTU provider's API
      const response = await this.api.post('/data', {
        UserID: this.userId,
        APIKey: this.apiKey,
        MobileNetwork: this.getNetworkCode(data.network),
        DataPlan: data.vtuCode,
        MobileNumber: this.formatPhone(data.phone),
        RequestID: data.transactionRef,
        CallBackURL: data.callbackUrl
      });

      // Check response status
      if (response.data.status === 'successful' || response.data.status === 'ORDER_RECEIVED') {
        return {
          success: true,
          data: {
            status: 'success',
            transactionId: response.data.transactionId || response.data.orderid,
            message: response.data.message || 'Data sent successfully'
          }
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to deliver data',
          data: response.data
        };
      }
    } catch (error) {
      console.error('VTU purchase error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'VTU service error',
        error: error.response?.data || error.message
      };
    }
  }

  // Check VTU wallet balance
  async checkBalance() {
    try {
      const response = await this.api.get('/balance', {
        params: {
          UserID: this.userId,
          APIKey: this.apiKey
        }
      });

      return {
        success: true,
        balance: parseFloat(response.data.balance) || 0
      };
    } catch (error) {
      console.error('VTU balance error:', error.response?.data || error.message);
      return {
        success: false,
        message: 'Failed to check VTU balance'
      };
    }
  }

  // Get available data plans
  async getDataPlans(network) {
    try {
      const response = await this.api.get('/dataplans', {
        params: {
          UserID: this.userId,
          APIKey: this.apiKey,
          MobileNetwork: this.getNetworkCode(network)
        }
      });

      return {
        success: true,
        data: response.data.plans || response.data
      };
    } catch (error) {
      console.error('VTU plans error:', error.response?.data || error.message);
      return {
        success: false,
        message: 'Failed to fetch data plans'
      };
    }
  }

  // Query transaction status
  async queryTransaction(transactionRef) {
    try {
      const response = await this.api.get('/query', {
        params: {
          UserID: this.userId,
          APIKey: this.apiKey,
          RequestID: transactionRef
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('VTU query error:', error.response?.data || error.message);
      return {
        success: false,
        message: 'Failed to query transaction'
      };
    }
  }

  // Format phone number for Ghana
  formatPhone(phone) {
    // Remove any spaces or special characters
    let cleaned = phone.replace(/\D/g, '');

    // If starts with 233, keep as is
    if (cleaned.startsWith('233')) {
      return cleaned;
    }

    // If starts with 0, replace with 233
    if (cleaned.startsWith('0')) {
      return '233' + cleaned.substring(1);
    }

    // If 9 digits, add 233
    if (cleaned.length === 9) {
      return '233' + cleaned;
    }

    return cleaned;
  }

  // Detect network from phone number
  detectNetwork(phone) {
    const cleaned = this.formatPhone(phone);
    const prefix = cleaned.substring(3, 5); // Get first 2 digits after country code

    // MTN prefixes
    const mtnPrefixes = ['24', '25', '53', '54', '55', '59'];
    // Telecel (Vodafone) prefixes
    const telecelPrefixes = ['20', '50'];
    // AirtelTigo prefixes
    const airteltigoPrefixes = ['26', '27', '56', '57'];

    if (mtnPrefixes.includes(prefix)) return 'MTN';
    if (telecelPrefixes.includes(prefix)) return 'TELECEL';
    if (airteltigoPrefixes.includes(prefix)) return 'AIRTELTIGO';

    return null;
  }
}

module.exports = new VTUService();
