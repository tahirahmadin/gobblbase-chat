import { XCircle } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const PaymentCancelPage = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-red-50">
    <XCircle className="h-24 w-24 text-red-500 mb-6" />
    <h1 className="text-3xl font-bold mb-2 text-red-700">Payment Cancelled</h1>
    <p className="text-lg text-gray-700 mb-6">
      Your payment was not completed. No changes have been made to your
      subscription.
    </p>
    <Link
      to="/admin/account/plans"
      className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold shadow hover:bg-red-700 transition"
    >
      Back to Plans
    </Link>
  </div>
);

export default PaymentCancelPage;
