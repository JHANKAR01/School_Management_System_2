import React, { useState } from 'react';
import QRCode from 'qrcode.react';
import { Copy, DollarSign } from 'lucide-react';

interface UPIPaymentProps {
  studentId: string;
  invoiceId: string;
  amount: number;
  studentName: string;
  schoolVPA?: string;
}

const UPIPayment: React.FC<UPIPaymentProps> = ({
  studentId,
  invoiceId,
  amount,
  studentName,
  schoolVPA = 'school@upi',
}) => {
  const [showUTREntry, setShowUTREntry] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');

  const upiString = `upi://pay?pa=${schoolVPA}&am=${amount}&tn=${studentId}-${invoiceId}`;
  const gpayUrl = `https://pay.google.com/gp/w/u/0/?action=url&url=${encodeURIComponent(upiString)}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(upiString);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Fee Payment</h2>
          <p className="text-gray-600">{studentName}</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">Amount to Pay</p>
            <p className="text-4xl font-bold text-blue-600">₹{amount.toFixed(2)}</p>
            <p className="text-gray-600 text-xs mt-2">Invoice ID: {invoiceId}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg flex justify-center">
            <QRCode value={upiString} size={200} level="H" includeMargin={true} />
          </div>

          <div>
            <p className="text-center text-gray-700 font-medium mb-4">Scan QR Code or Tap a Button Below</p>
            <div className="space-y-3">
              <a
                href={`upi://pay?pa=${schoolVPA}&am=${amount}&tn=${studentId}-${invoiceId}`}
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-center transition"
              >
                Pay with UPI App
              </a>
              <button
                onClick={copyToClipboard}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <Copy className="h-4 w-4" />
                Copy Payment Details
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <button
              onClick={() => setShowUTREntry(!showUTREntry)}
              className="w-full text-blue-600 hover:text-blue-700 font-medium"
            >
              {showUTREntry ? 'Hide' : 'Paid? Enter UTR'} →
            </button>

            {showUTREntry && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID (UTR)</label>
                  <input
                    type="text"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="Enter 12-digit UTR number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    maxLength={12}
                  />
                </div>
                <button
                  disabled={!utrNumber || utrNumber.length < 12}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Payment Proof
                </button>
              </div>
            )}
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
            <p className="font-medium mb-2">Zero-Fee Payment</p>
            <p>No transaction fees. Amount will be received directly to school account.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UPIPayment;
