import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { paymentAPI } from '../config/api';
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const [data, setData] = useState(null);

  const reference = searchParams.get('reference') || searchParams.get('trxref');

  useEffect(() => {
    if (reference) {
      verifyPayment();
    } else {
      setStatus('failed');
      setMessage('No payment reference found');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  const verifyPayment = async () => {
    try {
      const response = await paymentAPI.verifyGuest(reference);

      if (response.data.success) {
        setStatus('success');
        setMessage('Payment successful! Data has been delivered.');
        setData(response.data.data);
      } else {
        setStatus('failed');
        setMessage(response.data.message || 'Payment verification failed');
      }
    } catch (error) {
      setStatus('failed');
      setMessage(error.response?.data?.message || 'Failed to verify payment');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ArrowPathIcon className="h-10 w-10 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">{message}</p>

            {data && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left max-w-sm mx-auto">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Data</span>
                    <span className="font-medium">{data.dataAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Network</span>
                    <span className="font-medium">{data.network}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Recipient</span>
                    <span className="font-medium">{data.recipientPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {data.deliveryStatus}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/buy-data" className="btn btn-primary">
                Buy More Data
              </Link>
              <Link to="/track-order" className="btn btn-secondary">
                Track Orders
              </Link>
            </div>
          </div>
        );

      case 'failed':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircleIcon className="h-12 w-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/buy-data" className="btn btn-primary">
                Try Again
              </Link>
              <Link to="/" className="btn btn-secondary">
                Go Home
              </Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full">
        <div className="card p-8">
          {renderContent()}
        </div>

        {reference && (
          <p className="text-center text-sm text-gray-400 mt-4">
            Reference: {reference}
          </p>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;
