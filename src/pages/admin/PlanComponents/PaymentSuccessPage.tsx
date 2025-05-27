import { CheckCircle } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
// If using Heroicons, else use any icon

const PaymentSuccessPage = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50">
    <CheckCircle className="h-24 w-24 text-green-500 mb-6" />
    <h1 className="text-3xl font-bold mb-2 text-green-700">
      Payment Successful!
    </h1>
    <p className="text-lg text-gray-700 mb-6 text-center">
      Thank you for your purchase. Your subscription has been updated.
    </p>
    <Link
      to="/admin/account/plans"
      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
    >
      Go to Plans
    </Link>
  </div>
);

export default PaymentSuccessPage;
