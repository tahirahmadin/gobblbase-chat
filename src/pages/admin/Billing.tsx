import React, { useState, useEffect } from "react";
import { 
  getClient, 
  updateClientBillingDetails, 
  updateClientBillingMethod
} from "../../lib/serverActions";
import { useAdminStore } from "../../store/useAdminStore";
import { toast } from "react-hot-toast";
import CardModal from "./CardModal"; // Import the new card modal component

interface BillingDetails {
  "Individual/Organization Name"?: string;
  "Email"?: string;
  "Country"?: string;
  "State"?: string;
  "Address Line 1"?: string;
  "Address Line 2"?: string;
  "Zip Code"?: string;
}

interface CardMethod {
  cardType: string;
  cardNumber: number;
  expiry: string;
  default: boolean;
}

interface ClientData {
  billingDetails?: BillingDetails;
  billingMethod: CardMethod[];
}

interface DetailsForm {
  name: string;
  email: string;
  country: string;
  state: string;
  address1: string;
  address2: string;
  zipcode: string;
}

interface NewCardData {
  cardType: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  default: boolean;
}

const Billing = () => {
  const { adminId } = useAdminStore();
  
  const [billingData, setBillingData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);

  const [details, setDetails] = useState<DetailsForm>({
    name: "",
    email: "",
    country: "United States of America",
    state: "",
    address1: "",
    address2: "",
    zipcode: "",
  });
  
  const [history] = useState([
    { id: 102, date: "DD MM YYYY", amount: "$100", status: "pay" },
    { id: 101, date: "DD MM YYYY", amount: "$100", status: "paid" },
  ]);

  useEffect(() => {
    const fetchClientData = async () => {
      if (!adminId) return;
      
      setLoading(true);
      try {
        const data = await getClient(adminId);
        const clientData: ClientData = {
          ...data,
          billingMethod: data.billingMethod || []
        };
        
        setBillingData(clientData);
        
        if (clientData.billingDetails) {
          setDetails({
            name: clientData.billingDetails["Individual/Organization Name"] || "",
            email: clientData.billingDetails["Email"] || "",
            country: clientData.billingDetails["Country"] || "United States of America",
            state: clientData.billingDetails["State"] || "",
            address1: clientData.billingDetails["Address Line 1"] || "",
            address2: clientData.billingDetails["Address Line 2"] || "",
            zipcode: clientData.billingDetails["Zip Code"] || "",
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching client data:", error);
        toast.error("Failed to load billing data");
        setLoading(false);
      }
    };

    fetchClientData();
  }, [adminId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveBillingDetails = async () => {
    if (!adminId) return;
    
    setLoading(true);
    try {
      await updateClientBillingDetails(adminId, {
        "Individual/Organization Name": details.name,
        "Email": details.email,
        "Country": details.country,
        "State": details.state,
        "Zip Code": details.zipcode,
        "Address Line 1": details.address1,
        "Address Line 2": details.address2
      });
      
      toast.success("Billing details saved successfully");
    } catch (error) {
      console.error("Error saving billing details:", error);
      toast.error("Failed to save billing details");
    } finally {
      setLoading(false);
    }
  };

  const addCard = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const submitCard = async (newCardData: NewCardData) => {
    if (!adminId || !billingData) return;
    
    setLoading(true);
    try {
      // Remove spaces from card number before converting to number
      const cleanCardNumber = newCardData.cardNumber.replace(/\s/g, "");
      
      const newCard: CardMethod = {
        cardType: newCardData.cardType,
        // Convert to number (storing all 16 digits)
        cardNumber: parseInt(cleanCardNumber),
        expiry: newCardData.expiry,
        default: newCardData.default
      };
      
      let updatedBillingMethod = [...billingData.billingMethod, newCard];
      
      if (newCardData.default) {
        updatedBillingMethod = updatedBillingMethod.map((method, index) => ({
          ...method,
          default: index === updatedBillingMethod.length - 1
        }));
      }
      
      await updateClientBillingMethod(adminId, updatedBillingMethod);
      
      setBillingData({
        ...billingData,
        billingMethod: updatedBillingMethod
      });
      
      toast.success("Card added successfully");
      handleCloseModal();
    } catch (error) {
      console.error("Error adding card:", error);
      toast.error("Failed to add card");
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (index: number) => {
    if (selectedCardIndex === index) {
      setSelectedCardIndex(null);
    } else {
      setSelectedCardIndex(index);
    }
  };

  const setDefaultCard = async (index: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    if (!adminId || !billingData) return;
    
    setLoading(true);
    try {
      const updatedBillingMethod = billingData.billingMethod.map((method, i) => ({
        ...method,
        default: i === index
      }));
      
      await updateClientBillingMethod(adminId, updatedBillingMethod);
      
      setBillingData({
        ...billingData,
        billingMethod: updatedBillingMethod
      });
      
      toast.success("Default payment method updated");
      setSelectedCardIndex(null); 
    } catch (error) {
      console.error("Error setting default card:", error);
      toast.error("Failed to set default card");
    } finally {
      setLoading(false);
    }
  };
  
  const removeCard = async (index: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    if (!adminId || !billingData) return;
    
    setLoading(true);
    try {
      const updatedBillingMethod = billingData.billingMethod.filter((_, i) => i !== index);
      
      if (billingData.billingMethod[index].default && updatedBillingMethod.length > 0) {
        updatedBillingMethod[0].default = true;
      }
      
      await updateClientBillingMethod(adminId, updatedBillingMethod);
      
      setBillingData({
        ...billingData,
        billingMethod: updatedBillingMethod
      });
      
      toast.success("Card removed successfully");
      setSelectedCardIndex(null); 
    } catch (error) {
      console.error("Error removing card:", error);
      toast.error("Failed to remove card");
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (number: number) => {
    return `XXXX XXXX XXXX ${String(number).slice(-4)}`;
  };

  if (loading && !billingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Billing Details */}
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-6">Billing Details</h2>
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1">
                <label className="block font-medium mb-1">
                  Individual/Organisation Name
                </label>
                <input
                  name="name"
                  value={details.name}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 mb-2"
                  placeholder="Type your name or brand"
                />
              </div>
              <div className="flex-1">
                <label className="block font-medium mb-1">
                  Billing Email Address
                </label>
                <input
                  name="email"
                  value={details.email}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 mb-2"
                  placeholder="Type your email..."
                />
              </div>
              <div className="flex items-end">
                <button 
                  onClick={saveBillingDetails}
                  disabled={loading}
                  className="bg-green-200 hover:bg-green-300 text-green-900 font-semibold px-6 py-2 rounded shadow w-full md:w-auto"
                >
                  {loading ? 'SAVING...' : 'SAVE'}
                </button>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1">
                <label className="block font-medium mb-1">Country</label>
                <select
                  name="country"
                  value={details.country}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 mb-2"
                >
                  <option>United States of America</option>
                  <option>Canada</option>
                  <option>United Kingdom</option>
                  <option>India</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block font-medium mb-1">State</label>
                <input
                  name="state"
                  value={details.state}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 mb-2"
                  placeholder="State/Province"
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1">
                <label className="block font-medium mb-1">Address</label>
                <input
                  name="address1"
                  value={details.address1}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 mb-2"
                  placeholder="Address Line 1..."
                />
                <input
                  name="address2"
                  value={details.address2}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 mb-2"
                  placeholder="Address Line 2..."
                />
              </div>
              <div className="flex-1">
                <label className="block font-medium mb-1">
                  Zipcode (if applicable)
                </label>
                <input
                  name="zipcode"
                  value={details.zipcode}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 mb-2"
                  placeholder="Type your Pincode..."
                />
                <div className="flex items-end mt-2">
                  <button 
                    onClick={saveBillingDetails}
                    disabled={loading}
                    className="bg-green-200 hover:bg-green-300 text-green-900 font-semibold px-6 py-2 rounded shadow w-full md:w-auto"
                  >
                    {loading ? 'SAVING...' : 'SAVE'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <hr className="my-8" />
          {/* Billing History */}
          <h3 className="text-lg font-bold mb-4">Billing History</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-green-50 rounded-lg">
              <thead>
                <tr className="text-left text-gray-700">
                  <th className="px-4 py-2">INVOICE NO.</th>
                  <th className="px-4 py-2">CREATED</th>
                  <th className="px-4 py-2">AMOUNT</th>
                  <th className="px-4 py-2">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row.id} className="border-t border-green-100">
                    <td className="px-4 py-2">{row.id}</td>
                    <td className="px-4 py-2">{row.date}</td>
                    <td className="px-4 py-2">{row.amount}</td>
                    <td className="px-4 py-2">
                      {row.status === "pay" ? (
                        <button className="bg-green-200 hover:bg-green-300 text-green-900 font-semibold px-6 py-1 rounded shadow">
                          PAY
                        </button>
                      ) : (
                        <span className="text-gray-700">Paid</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Billing Method */}
        <div>
          <div className="bg-blue-100 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 bg-blue-400 rounded-t-lg text-white px-4 py-2 -mx-6 -mt-6">
              Billing Method
            </h3>
            <div className="mb-4">
              <div className="text-gray-700 font-semibold mb-2">
                Payment Cards
              </div>
              <div className="space-y-3">
                {billingData?.billingMethod && billingData.billingMethod.map((card, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg p-4 flex flex-col border-2 border-blue-200 relative cursor-pointer"
                    onClick={() => handleCardClick(i)}
                  >
                    <div className="flex justify-between mb-1">
                      <div className="font-semibold">{card.cardType}</div>
                      <div className="text-gray-500 text-sm">Exp. {card.expiry}</div>
                    </div>
                    <div className="text-gray-500">
                      {formatCardNumber(card.cardNumber)}
                    </div>
                    
                    {card.default && (
                      <span className="absolute top-2 right-2 bg-black text-white text-xs px-3 py-1 rounded-full">
                        Default Card
                      </span>
                    )}
                    
                    {/* Show action buttons for selected card */}
                    {selectedCardIndex === i && (
                      <div className="mt-3 flex w-full gap-2">
                        <button
                          onClick={(e) => setDefaultCard(i, e)}
                          className="bg-black text-white text-sm font-semibold py-1 px-2 rounded-full flex-1"
                        >
                          Set as Default
                        </button>
                        <button
                          onClick={(e) => removeCard(i, e)}
                          className="bg-green-500 text-white text-sm font-semibold py-1 px-2 rounded-full flex-1"
                        >
                          Remove Card
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <button 
                  onClick={addCard} 
                  className="w-full flex items-center justify-center border-2 border-blue-300 rounded-lg py-2 text-blue-700 font-semibold bg-blue-50 hover:bg-blue-200"
                >
                  <span className="mr-2 text-xl">+</span> Add Card
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Credit Card Modal Component */}
      <CardModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={submitCard}
        loading={loading}
      />
    </div>
  );
};

export default Billing;
