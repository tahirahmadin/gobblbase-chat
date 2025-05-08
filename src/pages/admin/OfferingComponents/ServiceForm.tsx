import React from "react";

type ServiceFormType = {
  serviceName: string;
  category: string;
  description: string;
  descriptionEnabled: boolean;
  quantityType: string;
  quantity: string;
  locationType: string;
  address: string;
  priceType: string;
  price: string;
  cta: string;
  thumbnail: File | null;
  thumbnailUrl: string;
  images: (File | null)[];
  imagesUrl: string[];
};

type ServiceFormProps = {
  form: ServiceFormType;
  setForm: React.Dispatch<React.SetStateAction<ServiceFormType>>;
  onNext: () => void;
};

const ServiceForm: React.FC<ServiceFormProps> = ({ form, setForm, onNext }) => (
  <div className="bg-indigo-100 rounded-2xl p-8 mt-6 max-w-4xl mx-auto">
    <div className="flex flex-col md:flex-row gap-8">
      {/* Left Side */}
      <div className="flex-1">
        <label className="font-semibold">Service Name *</label>
        <input
          name="serviceName"
          maxLength={50}
          value={form.serviceName}
          onChange={(e) =>
            setForm((f) => ({ ...f, serviceName: e.target.value }))
          }
          className="w-full border border-gray-300 rounded p-2 mt-1 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder="Type your service name..."
        />
        <div className="text-xs text-gray-500 text-right mb-2">
          {form.serviceName.length}/50
        </div>
        <label className="font-semibold">Service Category</label>
        <input
          name="category"
          maxLength={50}
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          className="w-full border border-gray-300 rounded p-2 mt-1 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder="Type the category..."
        />
        <div className="text-xs text-gray-500 text-right mb-2">
          {form.category.length}/50
        </div>
        <label className="font-semibold">Description</label>
        <div className="flex items-center gap-2 mb-2">
          <textarea
            name="description"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            className="w-full border border-gray-300 rounded p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Describe your service..."
            rows={3}
            disabled={!form.descriptionEnabled}
          />
          <div className="flex items-center ml-2">
            <input
              type="checkbox"
              checked={form.descriptionEnabled}
              onChange={(e) =>
                setForm((f) => ({ ...f, descriptionEnabled: e.target.checked }))
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
                checked={form.quantityType === "unlimited"}
                onChange={(e) =>
                  setForm((f) => ({ ...f, quantityType: e.target.value }))
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
                checked={form.quantityType === "onesize"}
                onChange={(e) =>
                  setForm((f) => ({ ...f, quantityType: e.target.value }))
                }
                className="accent-green-500 w-5 h-5"
              />
              <span className="text-gray-700">One size/Qty:</span>
              <input
                name="quantity"
                value={form.quantity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, quantity: e.target.value }))
                }
                className="border border-gray-300 rounded p-1 w-24 ml-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="99999.99"
                disabled={form.quantityType !== "onesize"}
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
                onChange={(e) =>
                  setForm((f) => ({ ...f, locationType: e.target.value }))
                }
                className="accent-green-500 w-5 h-5"
              />
              <span className="text-gray-700">Online</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="locationType"
                value="offline"
                checked={form.locationType === "offline"}
                onChange={(e) =>
                  setForm((f) => ({ ...f, locationType: e.target.value }))
                }
                className="accent-green-500 w-5 h-5"
              />
              <span className="text-gray-700">Offline</span>
              <input
                name="address"
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
                className="border border-gray-300 rounded p-1 w-40 ml-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="Address"
                disabled={form.locationType !== "offline"}
              />
            </label>
          </div>
        </div>
        {/* Set Price */}
        <div className="mb-2 p-4 rounded-lg border border-indigo-200 bg-white">
          <label className="font-semibold block mb-2">Set Price *</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="priceType"
                value="free"
                checked={form.priceType === "free"}
                onChange={(e) =>
                  setForm((f) => ({ ...f, priceType: e.target.value }))
                }
                className="accent-green-500 w-5 h-5"
              />
              <span className="text-gray-700">Free/Complimentary</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="priceType"
                value="paid"
                checked={form.priceType === "paid"}
                onChange={(e) =>
                  setForm((f) => ({ ...f, priceType: e.target.value }))
                }
                className="accent-green-500 w-5 h-5"
              />
              <span className="text-gray-700">USD</span>
              <input
                name="price"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
                className="border border-gray-300 rounded p-1 w-24 ml-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="99999.99"
                disabled={form.priceType !== "paid"}
              />
            </label>
          </div>
        </div>
        {/* CTA Button */}
        <div className="mb-2 p-4 rounded-lg border border-indigo-200 bg-white">
          <label className="font-semibold block mb-2">CTA Button*</label>
          <select
            className="border border-gray-300 rounded p-2 w-full"
            value={form.cta}
            onChange={(e) => setForm((f) => ({ ...f, cta: e.target.value }))}
          >
            <option>Buy Now</option>
            <option>Book Now</option>
            <option>Get Quote</option>
            <option>Learn More</option>
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
            {form.thumbnailUrl ? (
              <img
                src={form.thumbnailUrl}
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
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (file) {
                  setForm((f) => ({
                    ...f,
                    thumbnail: file,
                    thumbnailUrl: URL.createObjectURL(file),
                  }));
                }
              }}
            />
          </label>
        </div>
      </div>
      <div className="flex-1">
        <label className="font-semibold">Additional Images (Optional)</label>
        <div className="flex gap-4 mt-2">
          {[0, 1, 2].map((i) => (
            <label
              key={i}
              className="w-24 h-24 bg-white border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer"
            >
              {form.imagesUrl[i] ? (
                <img
                  src={form.imagesUrl[i]}
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
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setForm((f) => {
                    const newImages = [...f.images];
                    const newImagesUrl = [...f.imagesUrl];
                    newImages[i] = file;
                    newImagesUrl[i] = file ? URL.createObjectURL(file) : "";
                    return { ...f, images: newImages, imagesUrl: newImagesUrl };
                  });
                }}
              />
            </label>
          ))}
        </div>
      </div>
    </div>
    <div className="flex justify-end mt-8">
      <button
        className="bg-green-500 hover:bg-green-600 text-white rounded px-8 py-2 font-semibold shadow"
        onClick={onNext}
      >
        NEXT
      </button>
    </div>
  </div>
);

export default ServiceForm;
