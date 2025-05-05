import React, { useState, useRef } from "react";

const steps = ["Service Details", "Checkout", "Preview"];

const ctaOptions = [
  "Buy Now",
  "Add to Cart",
  "Download Now",
  "Sign up",
  "Book Service",
  "Book Demo",
  "Attend Workshop",
  "Reserve Your Spot",
  "Get Quote",
  "Claim Free Trial",
  "Learn More",
];

const imagePlaceholder = (
  <svg
    className="w-8 h-8 text-gray-300"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 7v10a4 4 0 004 4h10a4 4 0 004-4V7a4 4 0 00-4-4H7a4 4 0 00-4 4z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 11l4 4 4-4" />
  </svg>
);

const NewServiceForm: React.FC = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    quantityType: "unlimited",
    quantity: "",
    locationType: "online",
    address: "",
    priceType: "free",
    price: "",
    cta: ctaOptions[0],
    thumbnail: null as File | null,
    images: [null, null, null] as (File | null)[],
    thumbnailUrl: "",
    imagesUrl: ["", "", ""] as string[],
  });
  const [customFields, setCustomFields] = useState<string[]>([]);
  const [customFieldInput, setCustomFieldInput] = useState("");

  // Refs for file inputs
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const imgInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Image upload handlers
  const handleThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setForm((prev) => ({
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
    setForm((prev) => {
      const newImages = [...prev.images];
      const newImagesUrl = [...prev.imagesUrl];
      newImages[idx] = file;
      newImagesUrl[idx] = file ? URL.createObjectURL(file) : "";
      return { ...prev, images: newImages, imagesUrl: newImagesUrl };
    });
  };
  const handleThumbDelete = () => {
    setForm((prev) => ({ ...prev, thumbnail: null, thumbnailUrl: "" }));
    if (thumbInputRef.current) thumbInputRef.current.value = "";
  };
  const handleImageDelete = (idx: number) => {
    setForm((prev) => {
      const newImages = [...prev.images];
      const newImagesUrl = [...prev.imagesUrl];
      newImages[idx] = null;
      newImagesUrl[idx] = "";
      if (imgInputRefs[idx].current) imgInputRefs[idx].current!.value = "";
      return { ...prev, images: newImages, imagesUrl: newImagesUrl };
    });
  };

  // Step 1: Service Details
  const renderStep1 = () => (
    <div className="bg-indigo-100 rounded-2xl p-8 mt-6 max-w-4xl mx-auto h-full">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <label className="font-semibold">Service Name *</label>
          <input
            name="name"
            maxLength={50}
            value={form.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 mt-1 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Type your service name..."
          />
          <div className="text-xs text-gray-500 text-right mb-2">
            {form.name.length}/50
          </div>
          <label className="font-semibold">Service Category</label>
          <input
            name="category"
            maxLength={50}
            value={form.category}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 mt-1 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Type the category..."
          />
          <div className="text-xs text-gray-500 text-right mb-2">
            {form.category.length}/50
          </div>
          <label className="font-semibold">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 mt-1 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Describe your service..."
            rows={4}
          />
        </div>
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
                  checked={form.quantityType === "unlimited"}
                  onChange={handleChange}
                  className="accent-green-500 w-5 h-5"
                />
                <span
                  className={
                    form.quantityType === "unlimited"
                      ? "text-green-600 font-semibold"
                      : "text-gray-700"
                  }
                >
                  Unlimited
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="quantityType"
                  value="onesize"
                  checked={form.quantityType === "onesize"}
                  onChange={handleChange}
                  className="accent-green-500 w-5 h-5"
                />
                <span
                  className={
                    form.quantityType === "onesize"
                      ? "text-green-600 font-semibold"
                      : "text-gray-700"
                  }
                >
                  One size/Qty:
                </span>
                <input
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  className="border border-gray-300 rounded p-1 w-24 ml-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  disabled={form.quantityType !== "onesize"}
                  placeholder="99999.99"
                />
              </label>
            </div>
          </div>
          {/* Location */}
          <div className="mb-2 p-4 rounded-lg border border-indigo-200 bg-white">
            <label className="font-semibold block mb-2">Location</label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="locationType"
                  value="online"
                  checked={form.locationType === "online"}
                  onChange={handleChange}
                  className="accent-green-500 w-5 h-5"
                />
                <span
                  className={
                    form.locationType === "online"
                      ? "text-green-600 font-semibold"
                      : "text-gray-700"
                  }
                >
                  Online
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="locationType"
                  value="offline"
                  checked={form.locationType === "offline"}
                  onChange={handleChange}
                  className="accent-green-500 w-5 h-5"
                />
                <span
                  className={
                    form.locationType === "offline"
                      ? "text-green-600 font-semibold"
                      : "text-gray-700"
                  }
                >
                  Offline
                </span>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="border border-gray-300 rounded p-1 w-32 ml-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  disabled={form.locationType !== "offline"}
                  placeholder="Address"
                />
              </label>
            </div>
          </div>
          {/* Set Price */}
          <div className="mb-2 p-4 rounded-lg border border-indigo-200 bg-white">
            <label className="font-semibold block mb-2">Set Price *</label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="priceType"
                  value="free"
                  checked={form.priceType === "free"}
                  onChange={handleChange}
                  className="accent-green-500 w-5 h-5"
                />
                <span
                  className={
                    form.priceType === "free"
                      ? "text-green-600 font-semibold"
                      : "text-gray-700"
                  }
                >
                  Free/Complimentary
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="priceType"
                  value="paid"
                  checked={form.priceType === "paid"}
                  onChange={handleChange}
                  className="accent-green-500 w-5 h-5"
                />
                <input
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  className="border border-gray-300 rounded p-1 w-24 ml-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  disabled={form.priceType !== "paid"}
                  placeholder="99999.99"
                />
                <span className="ml-1">USD</span>
              </label>
            </div>
          </div>
          {/* CTA Button */}
          <div className="mb-2 p-4 rounded-lg border border-indigo-200 bg-white">
            <label className="font-semibold block mb-2">CTA Button*</label>
            <select
              name="cta"
              value={form.cta}
              onChange={handleChange}
              className="border border-gray-300 rounded p-2 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white text-gray-900"
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.01)" }}
            >
              {ctaOptions.map((opt) => (
                <option key={opt} className="text-green-700">
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {/* Image Upload Section */}
      <div className="flex gap-4 mt-6">
        {/* Thumbnail */}
        <div className="flex flex-col items-center">
          <div className="text-xs font-semibold mb-1">Thumbnail</div>
          <div className="relative group">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={thumbInputRef}
              onChange={handleThumbChange}
            />
            <div
              className="border-2 border-dashed border-gray-400 rounded w-24 h-24 flex items-center justify-center text-xs bg-white cursor-pointer hover:border-green-400"
              onClick={() => thumbInputRef.current?.click()}
            >
              {form.thumbnailUrl ? (
                <img
                  src={form.thumbnailUrl}
                  alt="Thumbnail"
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  {imagePlaceholder}
                  <span className="text-xs text-gray-400">400x400</span>
                </div>
              )}
            </div>
            {form.thumbnailUrl && (
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                <button
                  className="bg-blue-100 hover:bg-blue-200 p-1 rounded"
                  onClick={() => thumbInputRef.current?.click()}
                  type="button"
                >
                  <span role="img" aria-label="Edit">
                    ✏️
                  </span>
                </button>
                <button
                  className="bg-red-100 hover:bg-red-200 p-1 rounded"
                  onClick={handleThumbDelete}
                  type="button"
                >
                  <span role="img" aria-label="Delete">
                    ❌
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Additional Images */}
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="text-xs font-semibold mb-1">
              {i === 0 ? "Additional Images (optional)" : ""}
            </div>
            <div className="relative group">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={imgInputRefs[i]}
                onChange={(e) => handleImageChange(i, e)}
              />
              <div
                className="border-2 border-dashed border-gray-400 rounded w-24 h-24 flex items-center justify-center text-xs bg-white cursor-pointer hover:border-green-400"
                onClick={() => imgInputRefs[i].current?.click()}
              >
                {form.imagesUrl[i] ? (
                  <img
                    src={form.imagesUrl[i]}
                    alt={`Additional ${i + 1}`}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    {imagePlaceholder}
                    <span className="text-xs text-gray-400">400x400</span>
                  </div>
                )}
              </div>
              {form.imagesUrl[i] && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  <button
                    className="bg-blue-100 hover:bg-blue-200 p-1 rounded"
                    onClick={() => imgInputRefs[i].current?.click()}
                    type="button"
                  >
                    <span role="img" aria-label="Edit">
                      ✏️
                    </span>
                  </button>
                  <button
                    className="bg-red-100 hover:bg-red-200 p-1 rounded"
                    onClick={() => handleImageDelete(i)}
                    type="button"
                  >
                    <span role="img" aria-label="Delete">
                      ❌
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <button
        className="bg-green-400 hover:bg-green-500 text-white rounded px-8 py-2 mt-8 float-right font-semibold shadow"
        onClick={() => setStep(1)}
      >
        NEXT
      </button>
    </div>
  );

  // Step 2: Checkout
  const renderStep2 = () => (
    <div className="bg-indigo-100 rounded-2xl p-8 mt-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <div className="font-semibold mb-2">Choose Customer Details</div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked /> Customer Name
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked /> Email
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Contact Number
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Shipping Address
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Billing Address
            </label>
          </div>
          <div className="mt-4 font-semibold">CUSTOM</div>
          <div className="flex gap-2 mt-1">
            <input
              value={customFieldInput}
              onChange={(e) => setCustomFieldInput(e.target.value)}
              className="border border-gray-300 rounded p-1 w-32 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Type..."
            />
            <button
              className="bg-gray-200 px-2 rounded hover:bg-gray-300"
              onClick={() => {
                if (customFieldInput) {
                  setCustomFields([...customFields, customFieldInput]);
                  setCustomFieldInput("");
                }
              }}
            >
              ADD
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-600">
            {customFields.map((f, i) => (
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
          />
          <textarea
            className="w-full border border-gray-300 rounded p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Email Body"
          />
          <div className="text-xs text-blue-700 cursor-pointer hover:underline">
            Edit text from main database
          </div>
        </div>
      </div>
      <button
        className="bg-green-400 hover:bg-green-500 text-white rounded px-8 py-2 mt-8 float-right font-semibold shadow"
        onClick={() => setStep(2)}
      >
        NEXT
      </button>
    </div>
  );

  // Step 3: Preview
  const renderStep3 = () => (
    <div className="bg-indigo-100 rounded-2xl p-8 mt-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        <div>
          <div className="font-semibold mb-2">Card View</div>
          <div className="border rounded w-32 h-40 flex items-center justify-center bg-white shadow">
            Service Name
            <br />
            $10
          </div>
        </div>
        <div>
          <div className="font-semibold mb-2">Expanded View</div>
          <div className="border rounded w-64 h-80 flex flex-col items-center justify-center bg-black text-white shadow">
            <div className="w-full h-32 bg-gray-700 flex items-center justify-center">
              (400x400)
            </div>
            <div className="p-2">Service Name</div>
            <div className="p-2 text-xs">
              Product & description, location, price, cta, etc.
            </div>
            <button className="bg-yellow-400 text-black px-4 py-2 rounded mt-2 font-semibold">
              BUY NOW
            </button>
            <div className="mt-2">Total Cost: $22</div>
          </div>
        </div>
        <div className="flex flex-col justify-between">
          <button
            className="bg-green-400 hover:bg-green-500 text-white rounded px-8 py-2 font-semibold shadow"
            style={{ marginTop: 0 }}
          >
            APPROVE
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-black">New Service</h2>
      <div className="flex gap-4 mt-6">
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
      {step === 0 && renderStep1()}
      {step === 1 && renderStep2()}
      {step === 2 && renderStep3()}
    </div>
  );
};

export default NewServiceForm;
