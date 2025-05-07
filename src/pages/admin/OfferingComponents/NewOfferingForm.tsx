import React, { useState } from "react";

export type ProductType =
  | "Physical Product"
  | "Digital Product"
  | "Service"
  | "Event";

interface NewOfferingFormProps {
  type: ProductType;
  onBack: () => void;
}

const steps = ["Product Details", "Checkout", "Preview"];

const NewOfferingForm: React.FC<NewOfferingFormProps> = ({ type, onBack }) => {
  const [step, setStep] = useState(0);

  const [physicalForm, setPhysicalForm] = useState({
    productName: "",
    category: "",
    description: "",
    descriptionEnabled: true,
    quantityType: "unlimited",
    quantity: "",
    customQuantity: "",
    priceType: "free",
    price: "",
    cta: "Buy Now",
    thumbnail: null as File | null,
    thumbnailUrl: "",
    images: [null, null, null] as (File | null)[],
    imagesUrl: ["", "", ""] as string[],
    customerDetails: ["Customer Name", "Email"],
    customFields: [] as string[],
    customFieldInput: "",
    emailSubject: "",
    emailBody: "",
  });

  const [digitalForm, setDigitalForm] = useState({
    productName: "",
    category: "",
    description: "",
    descriptionEnabled: true,
    fileFormat: [] as string[],
    uploadType: "file",
    file: null as File | null,
    fileUrl: "",
    quantityType: "unlimited",
    quantity: "",
    priceType: "free",
    price: "",
    cta: "Buy Now",
    thumbnail: null as File | null,
    thumbnailUrl: "",
    images: [null, null, null] as (File | null)[],
    imagesUrl: ["", "", ""] as string[],
    customerDetails: ["Customer Name", "Email"],
    customFields: [] as string[],
    customFieldInput: "",
    emailSubject: "",
    emailBody: "",
  });

  // Helper for checkboxes
  const toggleCustomerDetail = (field: string) => {
    setPhysicalForm((prev) => {
      const exists = prev.customerDetails.includes(field);
      return {
        ...prev,
        customerDetails: exists
          ? prev.customerDetails.filter((f) => f !== field)
          : [...prev.customerDetails, field],
      };
    });
  };

  // Helper for images
  const handleThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setPhysicalForm((prev) => ({
        ...prev,
        thumbnail: file,
        thumbnailUrl: URL.createObjectURL(file),
      }));
    }
  };
  const handleImageChange = (
    idx: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] || null;
    setPhysicalForm((prev) => {
      const newImages = [...prev.images];
      const newImagesUrl = [...prev.imagesUrl];
      newImages[idx] = file;
      newImagesUrl[idx] = file ? URL.createObjectURL(file) : "";
      return { ...prev, images: newImages, imagesUrl: newImagesUrl };
    });
  };

  const digitalFormats = [
    "PDF",
    "XLSX",
    "CSV",
    "DOC",
    "PPT",
    "ZIP",
    "MP3",
    "MP4",
  ];

  const toggleDigitalFormat = (fmt: string) => {
    setDigitalForm((prev) => {
      const exists = prev.fileFormat.includes(fmt);
      return {
        ...prev,
        fileFormat: exists
          ? prev.fileFormat.filter((f) => f !== fmt)
          : [...prev.fileFormat, fmt],
      };
    });
  };

  const handleDigitalThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setDigitalForm((prev) => ({
        ...prev,
        thumbnail: file,
        thumbnailUrl: URL.createObjectURL(file),
      }));
    }
  };
  const handleDigitalImageChange = (
    idx: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] || null;
    setDigitalForm((prev) => {
      const newImages = [...prev.images];
      const newImagesUrl = [...prev.imagesUrl];
      newImages[idx] = file;
      newImagesUrl[idx] = file ? URL.createObjectURL(file) : "";
      return { ...prev, images: newImages, imagesUrl: newImagesUrl };
    });
  };

  const toggleDigitalCustomerDetail = (field: string) => {
    setDigitalForm((prev) => {
      const exists = prev.customerDetails.includes(field);
      return {
        ...prev,
        customerDetails: exists
          ? prev.customerDetails.filter((f) => f !== field)
          : [...prev.customerDetails, field],
      };
    });
  };

  // Placeholder step content for each type
  const renderStepContent = () => {
    switch (type) {
      case "Physical Product":
        if (step === 0) {
          // Product Details Step
          return (
            <div className="bg-indigo-100 rounded-2xl p-8 mt-6 max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Left Side */}
                <div className="flex-1">
                  <label className="font-semibold">Product Name *</label>
                  <input
                    name="productName"
                    maxLength={50}
                    value={physicalForm.productName}
                    onChange={(e) =>
                      setPhysicalForm((f) => ({
                        ...f,
                        productName: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded p-2 mt-1 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="Type your product name..."
                  />
                  <div className="text-xs text-gray-500 text-right mb-2">
                    {physicalForm.productName.length}/50
                  </div>
                  <label className="font-semibold">Product Category/Type</label>
                  <input
                    name="category"
                    maxLength={50}
                    value={physicalForm.category}
                    onChange={(e) =>
                      setPhysicalForm((f) => ({
                        ...f,
                        category: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded p-2 mt-1 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="Type the category..."
                  />
                  <div className="text-xs text-gray-500 text-right mb-2">
                    {physicalForm.category.length}/50
                  </div>
                  <label className="font-semibold">Description</label>
                  <div className="flex items-center gap-2 mb-2">
                    <textarea
                      name="description"
                      value={physicalForm.description}
                      onChange={(e) =>
                        setPhysicalForm((f) => ({
                          ...f,
                          description: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      placeholder="Describe your product..."
                      rows={3}
                      disabled={!physicalForm.descriptionEnabled}
                    />
                    <div className="flex items-center ml-2">
                      <input
                        type="checkbox"
                        checked={physicalForm.descriptionEnabled}
                        onChange={(e) =>
                          setPhysicalForm((f) => ({
                            ...f,
                            descriptionEnabled: e.target.checked,
                          }))
                        }
                        className="accent-green-500 w-5 h-5"
                      />
                    </div>
                  </div>
                </div>
                {/* Right Side */}
                <div className="flex-1 flex flex-col gap-4">
                  {/* Quantity */}
                  <div className="mb-2 p-4 rounded-lg border border-indigo-200 bg-white">
                    <label className="font-semibold block mb-2">Quantity</label>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="quantityType"
                          value="unlimited"
                          checked={physicalForm.quantityType === "unlimited"}
                          onChange={(e) =>
                            setPhysicalForm((f) => ({
                              ...f,
                              quantityType: e.target.value,
                            }))
                          }
                          className="accent-green-500 w-5 h-5"
                        />
                        <span className="text-gray-700">Unlimited</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="quantityType"
                          value="onesize"
                          checked={physicalForm.quantityType === "onesize"}
                          onChange={(e) =>
                            setPhysicalForm((f) => ({
                              ...f,
                              quantityType: e.target.value,
                            }))
                          }
                          className="accent-green-500 w-5 h-5"
                        />
                        <span className="text-gray-700">One size/Qty:</span>
                        <input
                          name="quantity"
                          value={physicalForm.quantity}
                          onChange={(e) =>
                            setPhysicalForm((f) => ({
                              ...f,
                              quantity: e.target.value,
                            }))
                          }
                          className="border border-gray-300 rounded p-1 w-24 ml-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          placeholder="99999.99"
                          disabled={physicalForm.quantityType !== "onesize"}
                        />
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="quantityType"
                          value="custom"
                          checked={physicalForm.quantityType === "custom"}
                          onChange={(e) =>
                            setPhysicalForm((f) => ({
                              ...f,
                              quantityType: e.target.value,
                            }))
                          }
                          className="accent-green-500 w-5 h-5"
                        />
                        <span className="text-gray-700">Custom</span>
                        <input
                          name="customQuantity"
                          value={physicalForm.customQuantity}
                          onChange={(e) =>
                            setPhysicalForm((f) => ({
                              ...f,
                              customQuantity: e.target.value,
                            }))
                          }
                          className="border border-gray-300 rounded p-1 w-24 ml-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          placeholder="Custom..."
                          disabled={physicalForm.quantityType !== "custom"}
                        />
                      </label>
                    </div>
                  </div>
                  {/* Set Price */}
                  <div className="mb-2 p-4 rounded-lg border border-indigo-200 bg-white">
                    <label className="font-semibold block mb-2">
                      Set Price
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="priceType"
                          value="free"
                          checked={physicalForm.priceType === "free"}
                          onChange={(e) =>
                            setPhysicalForm((f) => ({
                              ...f,
                              priceType: e.target.value,
                            }))
                          }
                          className="accent-green-500 w-5 h-5"
                        />
                        <span className="text-gray-700">
                          Free/Complimentary
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="priceType"
                          value="paid"
                          checked={physicalForm.priceType === "paid"}
                          onChange={(e) =>
                            setPhysicalForm((f) => ({
                              ...f,
                              priceType: e.target.value,
                            }))
                          }
                          className="accent-green-500 w-5 h-5"
                        />
                        <span className="text-gray-700">$</span>
                        <input
                          name="price"
                          value={physicalForm.price}
                          onChange={(e) =>
                            setPhysicalForm((f) => ({
                              ...f,
                              price: e.target.value,
                            }))
                          }
                          className="border border-gray-300 rounded p-1 w-24 ml-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          placeholder="Amount"
                          disabled={physicalForm.priceType !== "paid"}
                        />
                      </label>
                    </div>
                  </div>
                  {/* CTA Button */}
                  <div className="mb-2 p-4 rounded-lg border border-indigo-200 bg-white">
                    <label className="font-semibold block mb-2">
                      CTA Button
                    </label>
                    <select
                      className="border border-gray-300 rounded p-2 w-full"
                      value={physicalForm.cta}
                      onChange={(e) =>
                        setPhysicalForm((f) => ({ ...f, cta: e.target.value }))
                      }
                    >
                      <option>Buy Now</option>
                      <option>Add to Cart</option>
                      <option>Learn More</option>
                      <option>Get Quote</option>
                    </select>
                  </div>
                </div>
              </div>
              {/* Images */}
              <div className="flex flex-col md:flex-row gap-8 mt-8">
                <div className="flex-1">
                  <label className="font-semibold">Thumbnail</label>
                  <div className="flex gap-4 mt-2">
                    <label className="w-24 h-24 bg-white border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer">
                      {physicalForm.thumbnailUrl ? (
                        <img
                          src={physicalForm.thumbnailUrl}
                          alt="thumb"
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-400 text-3xl">+</span>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleThumbChange}
                      />
                    </label>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="font-semibold">
                    Additional Images (Optional)
                  </label>
                  <div className="flex gap-4 mt-2">
                    {[0, 1, 2].map((i) => (
                      <label
                        key={i}
                        className="w-24 h-24 bg-white border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer"
                      >
                        {physicalForm.imagesUrl[i] ? (
                          <img
                            src={physicalForm.imagesUrl[i]}
                            alt={`img${i}`}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <span className="text-gray-400 text-3xl">+</span>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageChange(i, e)}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-8">
                <button
                  className="bg-green-500 hover:bg-green-600 text-white rounded px-8 py-2 font-semibold shadow"
                  onClick={() => setStep(1)}
                >
                  NEXT
                </button>
              </div>
            </div>
          );
        }
        if (step === 1) {
          // Checkout Step
          return (
            <div className="bg-indigo-100 rounded-2xl p-8 mt-6 max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <div className="font-semibold mb-2">
                    Choose Customer Details
                  </div>
                  <div className="flex flex-col gap-2">
                    {[
                      "Customer Name",
                      "Email",
                      "Contact Number",
                      "Shipping Address",
                      "Billing Address",
                    ].map((field) => (
                      <label key={field} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={physicalForm.customerDetails.includes(field)}
                          onChange={() => toggleCustomerDetail(field)}
                          className="accent-green-500 w-5 h-5"
                        />{" "}
                        {field}
                      </label>
                    ))}
                  </div>
                  <div className="mt-4 font-semibold">CUSTOM</div>
                  <div className="flex gap-2 mt-1">
                    <input
                      value={physicalForm.customFieldInput}
                      onChange={(e) =>
                        setPhysicalForm((f) => ({
                          ...f,
                          customFieldInput: e.target.value,
                        }))
                      }
                      className="border border-gray-300 rounded p-1 w-32 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      placeholder="Type..."
                    />
                    <button
                      className="bg-gray-200 px-2 rounded hover:bg-gray-300"
                      onClick={() => {
                        if (physicalForm.customFieldInput) {
                          setPhysicalForm((f) => ({
                            ...f,
                            customFields: [
                              ...f.customFields,
                              f.customFieldInput,
                            ],
                            customFieldInput: "",
                          }));
                        }
                      }}
                    >
                      ADD
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    {physicalForm.customFields.map((f, i) => (
                      <span
                        key={i}
                        className="inline-block bg-gray-100 px-2 py-1 rounded mr-1"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-semibold mb-2">Confirmation Email</div>
                  <input
                    className="w-full border border-gray-300 rounded p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="Subject"
                    value={physicalForm.emailSubject}
                    onChange={(e) =>
                      setPhysicalForm((f) => ({
                        ...f,
                        emailSubject: e.target.value,
                      }))
                    }
                  />
                  <textarea
                    className="w-full border border-gray-300 rounded p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="Email Body"
                    value={physicalForm.emailBody}
                    onChange={(e) =>
                      setPhysicalForm((f) => ({
                        ...f,
                        emailBody: e.target.value,
                      }))
                    }
                  />
                  <div className="text-xs text-blue-700 cursor-pointer hover:underline">
                    Edit text from main database
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-8">
                <button
                  className="bg-green-500 hover:bg-green-600 text-white rounded px-8 py-2 font-semibold shadow"
                  onClick={() => setStep(2)}
                >
                  NEXT
                </button>
              </div>
            </div>
          );
        }
        if (step === 2) {
          // Preview Step
          return (
            <div className="bg-indigo-100 rounded-2xl p-8 mt-6 max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Card View */}
                <div>
                  <div className="font-semibold mb-2">Card View</div>
                  <div className="border rounded w-32 h-40 flex flex-col items-center justify-center bg-white shadow p-2">
                    {physicalForm.thumbnailUrl ? (
                      <img
                        src={physicalForm.thumbnailUrl}
                        alt="thumb"
                        className="w-20 h-20 object-cover rounded mb-2"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded mb-2" />
                    )}
                    <div className="font-semibold text-xs text-center">
                      {physicalForm.productName || "Product Name"}
                    </div>
                    <div className="text-xs">
                      {physicalForm.priceType === "paid" && physicalForm.price
                        ? `$${physicalForm.price}`
                        : "$0"}
                    </div>
                  </div>
                </div>
                {/* Expanded View */}
                <div>
                  <div className="font-semibold mb-2">Expanded View</div>
                  <div className="border-2 border-blue-500 rounded w-64 h-96 flex flex-col items-center bg-black text-white shadow relative p-2">
                    <div className="w-full h-32 bg-gray-700 flex items-center justify-center mb-2">
                      {physicalForm.thumbnailUrl ? (
                        <img
                          src={physicalForm.thumbnailUrl}
                          alt="thumb"
                          className="h-full object-contain"
                        />
                      ) : (
                        <span className="text-white">(400x400)</span>
                      )}
                    </div>
                    <div className="p-2 text-lg font-bold text-center">
                      {physicalForm.productName || "Product Name"}
                    </div>
                    <div className="p-2 text-xs text-gray-300 text-center">
                      {physicalForm.descriptionEnabled &&
                      physicalForm.description
                        ? physicalForm.description
                        : "Product & description, price, cta, etc."}
                    </div>
                    <button className="bg-yellow-400 text-black px-4 py-2 rounded mt-2 font-semibold">
                      {physicalForm.cta}
                    </button>
                    <div className="mt-2">
                      Total Cost:{" "}
                      {physicalForm.priceType === "paid" && physicalForm.price
                        ? `$${physicalForm.price}`
                        : "$22"}
                    </div>
                    <button className="absolute top-2 right-2 text-white">
                      ✕
                    </button>
                  </div>
                </div>
                {/* Approve */}
                <div className="flex flex-col justify-between">
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white rounded px-8 py-2 font-semibold shadow"
                    style={{ marginTop: 0 }}
                  >
                    APPROVE
                  </button>
                </div>
              </div>
            </div>
          );
        }
        return null;
      case "Digital Product":
        if (step === 0) {
          // Product Details Step
          return (
            <div className="bg-[#e7eafe] rounded-2xl p-8 mt-6 max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Left Side */}
                <div className="flex-1 flex flex-col gap-2">
                  <label className="font-semibold">Product Name *</label>
                  <input
                    name="productName"
                    maxLength={50}
                    value={digitalForm.productName}
                    onChange={(e) =>
                      setDigitalForm((f) => ({
                        ...f,
                        productName: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded p-2 mt-1 mb-1 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                    placeholder="Type your product title..."
                  />
                  <div className="text-xs text-gray-500 text-right mb-2">
                    {digitalForm.productName.length}/50
                  </div>
                  <label className="font-semibold">
                    Product Category / Type
                  </label>
                  <input
                    name="category"
                    maxLength={50}
                    value={digitalForm.category}
                    onChange={(e) =>
                      setDigitalForm((f) => ({
                        ...f,
                        category: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded p-2 mt-1 mb-1 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                    placeholder="Type the category..."
                  />
                  <div className="text-xs text-gray-500 text-right mb-2">
                    {digitalForm.category.length}/50
                  </div>
                  <label className="font-semibold">File Format*</label>
                  <div className="flex flex-wrap gap-2 mb-2 mt-1">
                    {digitalFormats.map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        className={`px-2 py-1 rounded border text-xs font-semibold transition-colors duration-150 ${
                          digitalForm.fileFormat.includes(fmt)
                            ? "bg-indigo-500 text-white border-indigo-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-indigo-100"
                        }`}
                        onClick={() => toggleDigitalFormat(fmt)}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                  <label className="font-semibold">Description</label>
                  <div className="flex items-center gap-2 mb-2">
                    <textarea
                      name="description"
                      value={digitalForm.description}
                      onChange={(e) =>
                        setDigitalForm((f) => ({
                          ...f,
                          description: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                      placeholder="Describe your product..."
                      rows={4}
                      disabled={!digitalForm.descriptionEnabled}
                    />
                    <div className="flex items-center ml-2">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={digitalForm.descriptionEnabled}
                          onChange={(e) =>
                            setDigitalForm((f) => ({
                              ...f,
                              descriptionEnabled: e.target.checked,
                            }))
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-400 transition-all duration-200"></div>
                        <div
                          className={`absolute ml-[-2.2rem] mt-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${
                            digitalForm.descriptionEnabled
                              ? "translate-x-5"
                              : ""
                          }`}
                        ></div>
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-2">
                    {/* Thumbnail */}
                    <div>
                      <label className="font-semibold">Thumbnail</label>
                      <div className="w-24 h-24 bg-white border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer relative mt-1">
                        {digitalForm.thumbnailUrl ? (
                          <>
                            <img
                              src={digitalForm.thumbnailUrl}
                              alt="thumb"
                              className="w-full h-full object-cover rounded"
                            />
                            <button
                              className="absolute bottom-1 left-1 bg-white border border-gray-300 rounded p-1 text-xs"
                              onClick={() =>
                                setDigitalForm((f) => ({
                                  ...f,
                                  thumbnail: null,
                                  thumbnailUrl: "",
                                }))
                              }
                              type="button"
                            >
                              <span role="img" aria-label="delete">
                                ❌
                              </span>
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="text-gray-400 text-2xl">
                              400x400
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={handleDigitalThumbChange}
                            />
                          </>
                        )}
                      </div>
                    </div>
                    {/* Additional Images */}
                    <div>
                      <label className="font-semibold">
                        Additional Images (optional)
                      </label>
                      <div className="flex gap-2 mt-1">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-24 h-24 bg-white border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer relative"
                          >
                            {digitalForm.imagesUrl[i] ? (
                              <>
                                <img
                                  src={digitalForm.imagesUrl[i]}
                                  alt={`img${i}`}
                                  className="w-full h-full object-cover rounded"
                                />
                                <button
                                  className="absolute bottom-1 left-1 bg-white border border-gray-300 rounded p-1 text-xs"
                                  onClick={() =>
                                    setDigitalForm((f) => {
                                      const newImages = [...f.images];
                                      const newImagesUrl = [...f.imagesUrl];
                                      newImages[i] = null;
                                      newImagesUrl[i] = "";
                                      return {
                                        ...f,
                                        images: newImages,
                                        imagesUrl: newImagesUrl,
                                      };
                                    })
                                  }
                                  type="button"
                                >
                                  <span role="img" aria-label="delete">
                                    ❌
                                  </span>
                                </button>
                              </>
                            ) : (
                              <>
                                <span className="text-gray-400 text-2xl">
                                  400x400
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                  onChange={(e) =>
                                    handleDigitalImageChange(i, e)
                                  }
                                />
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Right Side */}
                <div className="flex-1 flex flex-col gap-4">
                  {/* Upload */}
                  <div className="p-4 rounded-lg border border-indigo-200 bg-white mb-2">
                    <label className="font-semibold block mb-2">
                      Upload Product
                    </label>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="uploadType"
                          value="file"
                          checked={digitalForm.uploadType === "file"}
                          onChange={(e) =>
                            setDigitalForm((f) => ({
                              ...f,
                              uploadType: e.target.value,
                            }))
                          }
                          className="accent-green-500 w-5 h-5"
                        />
                        <span>Upload</span>
                        <div className="flex items-center ml-2">
                          <input
                            type="file"
                            className="hidden"
                            id="digital-upload-file"
                            onChange={(e) =>
                              setDigitalForm((f) => ({
                                ...f,
                                file: e.target.files?.[0] || null,
                              }))
                            }
                            disabled={digitalForm.uploadType !== "file"}
                          />
                          <label
                            htmlFor="digital-upload-file"
                            className={`border border-gray-300 rounded px-2 py-1 bg-gray-50 cursor-pointer ${
                              digitalForm.uploadType !== "file"
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            Drag & Drop File
                          </label>
                          <button
                            type="button"
                            className="ml-2 px-3 py-1 bg-green-400 text-white rounded shadow disabled:opacity-50"
                            disabled={
                              digitalForm.uploadType !== "file" ||
                              !digitalForm.file
                            }
                          >
                            UPLOAD
                          </button>
                        </div>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="uploadType"
                          value="url"
                          checked={digitalForm.uploadType === "url"}
                          onChange={(e) =>
                            setDigitalForm((f) => ({
                              ...f,
                              uploadType: e.target.value,
                            }))
                          }
                          className="accent-green-500 w-5 h-5"
                        />
                        <span>Redirect to URL</span>
                        <input
                          type="text"
                          className="ml-2 border border-gray-300 rounded p-1 bg-white"
                          placeholder="http://"
                          value={digitalForm.fileUrl}
                          onChange={(e) =>
                            setDigitalForm((f) => ({
                              ...f,
                              fileUrl: e.target.value,
                            }))
                          }
                          disabled={digitalForm.uploadType !== "url"}
                        />
                      </label>
                    </div>
                  </div>
                  {/* Quantity */}
                  <div className="p-4 rounded-lg border border-indigo-200 bg-white mb-2">
                    <label className="font-semibold block mb-2">Quantity</label>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="quantityType"
                          value="unlimited"
                          checked={digitalForm.quantityType === "unlimited"}
                          onChange={(e) =>
                            setDigitalForm((f) => ({
                              ...f,
                              quantityType: e.target.value,
                            }))
                          }
                          className="accent-green-500 w-5 h-5"
                        />
                        <span className="text-gray-700">Unlimited</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="quantityType"
                          value="onesize"
                          checked={digitalForm.quantityType === "onesize"}
                          onChange={(e) =>
                            setDigitalForm((f) => ({
                              ...f,
                              quantityType: e.target.value,
                            }))
                          }
                          className="accent-green-500 w-5 h-5"
                        />
                        <span className="text-gray-700">One size/Qty:</span>
                        <input
                          name="quantity"
                          value={digitalForm.quantity}
                          onChange={(e) =>
                            setDigitalForm((f) => ({
                              ...f,
                              quantity: e.target.value,
                            }))
                          }
                          className="border border-gray-300 rounded p-1 w-24 ml-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                          placeholder="999999.99"
                          disabled={digitalForm.quantityType !== "onesize"}
                        />
                      </label>
                    </div>
                  </div>
                  {/* Set Price */}
                  <div className="p-4 rounded-lg border border-indigo-200 bg-white mb-2">
                    <label className="font-semibold block mb-2">
                      Set Price *
                    </label>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="priceType"
                          value="free"
                          checked={digitalForm.priceType === "free"}
                          onChange={(e) =>
                            setDigitalForm((f) => ({
                              ...f,
                              priceType: e.target.value,
                            }))
                          }
                          className="accent-green-500 w-5 h-5"
                        />
                        <span className="text-gray-700">
                          Free/Complimentary
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="priceType"
                          value="paid"
                          checked={digitalForm.priceType === "paid"}
                          onChange={(e) =>
                            setDigitalForm((f) => ({
                              ...f,
                              priceType: e.target.value,
                            }))
                          }
                          className="accent-green-500 w-5 h-5"
                        />
                        <span className="text-gray-700">USD</span>
                        <input
                          name="price"
                          value={digitalForm.price}
                          onChange={(e) =>
                            setDigitalForm((f) => ({
                              ...f,
                              price: e.target.value,
                            }))
                          }
                          className="border border-gray-300 rounded p-1 w-24 ml-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                          placeholder="999999.99"
                          disabled={digitalForm.priceType !== "paid"}
                        />
                      </label>
                    </div>
                  </div>
                  {/* CTA Button */}
                  <div className="p-4 rounded-lg border border-indigo-200 bg-white mb-2">
                    <label className="font-semibold block mb-2">
                      CTA Button*
                    </label>
                    <select
                      className="border border-gray-300 rounded p-2 w-full bg-white"
                      value={digitalForm.cta}
                      onChange={(e) =>
                        setDigitalForm((f) => ({ ...f, cta: e.target.value }))
                      }
                    >
                      <option>Buy Now</option>
                      <option>Add to Cart</option>
                      <option>Download Now</option>
                      <option>Get Quote</option>
                      <option>Book Service</option>
                      <option>Book Demo</option>
                      <option>Attend Workshop</option>
                      <option>Reserve Your Spot</option>
                      <option>Claim Free Trial</option>
                      <option>Learn More</option>
                    </select>
                  </div>
                  <div className="flex justify-end mt-2">
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white rounded px-8 py-2 font-semibold shadow"
                      onClick={() => setStep(1)}
                    >
                      NEXT
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        if (step === 1) {
          // Checkout Step
          return (
            <div className="bg-indigo-100 rounded-2xl p-8 mt-6 max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <div className="font-semibold mb-2">
                    Choose Customer Details
                  </div>
                  <div className="flex flex-col gap-2">
                    {[
                      "Customer Name",
                      "Email",
                      "Contact Number",
                      "Shipping Address",
                      "Billing Address",
                    ].map((field) => (
                      <label key={field} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={digitalForm.customerDetails.includes(field)}
                          onChange={() => toggleDigitalCustomerDetail(field)}
                          className="accent-green-500 w-5 h-5"
                        />{" "}
                        {field}
                      </label>
                    ))}
                  </div>
                  <div className="mt-4 font-semibold">CUSTOM</div>
                  <div className="flex gap-2 mt-1">
                    <input
                      value={digitalForm.customFieldInput}
                      onChange={(e) =>
                        setDigitalForm((f) => ({
                          ...f,
                          customFieldInput: e.target.value,
                        }))
                      }
                      className="border border-gray-300 rounded p-1 w-32 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      placeholder="Type..."
                    />
                    <button
                      className="bg-gray-200 px-2 rounded hover:bg-gray-300"
                      onClick={() => {
                        if (digitalForm.customFieldInput) {
                          setDigitalForm((f) => ({
                            ...f,
                            customFields: [
                              ...f.customFields,
                              f.customFieldInput,
                            ],
                            customFieldInput: "",
                          }));
                        }
                      }}
                    >
                      ADD
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    {digitalForm.customFields.map((f, i) => (
                      <span
                        key={i}
                        className="inline-block bg-gray-100 px-2 py-1 rounded mr-1"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-semibold mb-2">Confirmation Email</div>
                  <input
                    className="w-full border border-gray-300 rounded p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="Subject"
                    value={digitalForm.emailSubject}
                    onChange={(e) =>
                      setDigitalForm((f) => ({
                        ...f,
                        emailSubject: e.target.value,
                      }))
                    }
                  />
                  <textarea
                    className="w-full border border-gray-300 rounded p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="Email Body"
                    value={digitalForm.emailBody}
                    onChange={(e) =>
                      setDigitalForm((f) => ({
                        ...f,
                        emailBody: e.target.value,
                      }))
                    }
                  />
                  <div className="text-xs text-blue-700 cursor-pointer hover:underline">
                    Edit text from main database
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-8">
                <button
                  className="bg-green-500 hover:bg-green-600 text-white rounded px-8 py-2 font-semibold shadow"
                  onClick={() => setStep(2)}
                >
                  NEXT
                </button>
              </div>
            </div>
          );
        }
        if (step === 2) {
          // Preview Step
          return (
            <div className="bg-indigo-100 rounded-2xl p-8 mt-6 max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Card View */}
                <div>
                  <div className="font-semibold mb-2">Card View</div>
                  <div className="border rounded w-32 h-40 flex flex-col items-center justify-center bg-white shadow p-2">
                    {digitalForm.thumbnailUrl ? (
                      <img
                        src={digitalForm.thumbnailUrl}
                        alt="thumb"
                        className="w-20 h-20 object-cover rounded mb-2"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded mb-2" />
                    )}
                    <div className="font-semibold text-xs text-center">
                      {digitalForm.productName || "Product Name"}
                    </div>
                    <div className="text-xs">
                      {digitalForm.priceType === "paid" && digitalForm.price
                        ? `$${digitalForm.price}`
                        : "$0"}
                    </div>
                  </div>
                </div>
                {/* Expanded View */}
                <div>
                  <div className="font-semibold mb-2">Expanded View</div>
                  <div className="border-2 border-blue-500 rounded w-64 h-96 flex flex-col items-center bg-black text-white shadow relative p-2">
                    <div className="w-full h-32 bg-gray-700 flex items-center justify-center mb-2">
                      {digitalForm.thumbnailUrl ? (
                        <img
                          src={digitalForm.thumbnailUrl}
                          alt="thumb"
                          className="h-full object-contain"
                        />
                      ) : (
                        <span className="text-white">(400x400)</span>
                      )}
                    </div>
                    <div className="p-2 text-lg font-bold text-center">
                      {digitalForm.productName || "Product Name"}
                    </div>
                    <div className="p-2 text-xs text-gray-300 text-center">
                      {digitalForm.descriptionEnabled && digitalForm.description
                        ? digitalForm.description
                        : "Product & description, price, cta, etc."}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      AVAILABLE AS:{" "}
                      {digitalForm.fileFormat.length
                        ? digitalForm.fileFormat.join(", ")
                        : "-"}
                    </div>
                    <button className="bg-yellow-400 text-black px-4 py-2 rounded mt-2 font-semibold">
                      {digitalForm.cta}
                    </button>
                    <div className="mt-2">
                      Total Cost:{" "}
                      {digitalForm.priceType === "paid" && digitalForm.price
                        ? `$${digitalForm.price}`
                        : "$22"}
                    </div>
                    <button className="absolute top-2 right-2 text-white">
                      ✕
                    </button>
                  </div>
                </div>
                {/* Approve */}
                <div className="flex flex-col justify-between">
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white rounded px-8 py-2 font-semibold shadow"
                    style={{ marginTop: 0 }}
                  >
                    APPROVE
                  </button>
                </div>
              </div>
            </div>
          );
        }
        return null;
      case "Service":
        // For now, just show a placeholder. You can later import and use NewServiceForm here.
        return (
          <div className="bg-indigo-100 rounded-2xl p-8 mt-6 max-w-4xl mx-auto">
            <div className="text-xl font-bold mb-4">
              Service - {steps[step]}
            </div>
            <div className="text-gray-700">
              [Service {steps[step]} Form Here]
            </div>
          </div>
        );
      case "Event":
        return (
          <div className="bg-indigo-100 rounded-2xl p-8 mt-6 max-w-4xl mx-auto">
            <div className="text-xl font-bold mb-4">Event - {steps[step]}</div>
            <div className="text-gray-700">[Event {steps[step]} Form Here]</div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 overflow-y-auto max-h-screen">
      <h2 className="text-2xl font-bold text-black mb-4">New {type}</h2>
      {/* Stepper */}
      <div className="flex gap-4 mt-6 mb-8">
        {steps.map((s, i) => (
          <div
            key={s}
            className={`flex items-center gap-2 ${
              i === step ? "text-green-700 font-bold" : "text-gray-500"
            }`}
          >
            <div
              className={`rounded-full w-7 h-7 flex items-center justify-center border-2 ${
                i <= step
                  ? "bg-green-200 border-green-500"
                  : "bg-white border-gray-300"
              }`}
            >
              {i + 1}
            </div>
            <span>{s}</span>
            {i < steps.length - 1 && (
              <div className="w-8 h-0.5 bg-gray-300 mx-2" />
            )}
          </div>
        ))}
      </div>
      {/* Step Content */}
      {renderStepContent()}
      {/* Navigation */}
      <div className="flex justify-between mt-8 max-w-4xl mx-auto">
        <button
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          onClick={step === 0 ? onBack : () => setStep(step - 1)}
        >
          {step === 0 ? "Back" : "Previous"}
        </button>
        {step < steps.length - 1 ? (
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            onClick={() => setStep(step + 1)}
          >
            Next
          </button>
        ) : (
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            // onClick={handleSubmit}
          >
            Approve
          </button>
        )}
      </div>
    </div>
  );
};

export default NewOfferingForm;
