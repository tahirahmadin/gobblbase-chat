import React from "react";

type PhysicalFormType = {
  productName: string;
  category: string;
  description: string;
  descriptionEnabled: boolean;
  quantityType: string;
  quantity: string;
  customQuantity: string;
  priceType: string;
  price: string;
  cta: string;
  thumbnail: File | null;
  thumbnailUrl: string;
  images: (File | null)[];
  imagesUrl: string[];
  variedSizes?: string[];
};

type PhysicalProductFormProps = {
  form: PhysicalFormType;
  setForm: React.Dispatch<React.SetStateAction<PhysicalFormType>>;
  onNext: () => void;
};

const sizeOptions = ["S", "M", "L", "XL", "XXL"];

// Improved ToggleSwitch component
const ToggleSwitch = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none ${
      checked ? "bg-green-500" : "bg-gray-300"
    }`}
    aria-pressed={checked}
    aria-label={checked ? "Disable description" : "Enable description"}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
        checked ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

const PhysicalProductForm: React.FC<PhysicalProductFormProps> = ({
  form,
  setForm,
  onNext,
}) => {
  // For varied sizes selection
  const handleSizeToggle = (size: string) => {
    setForm((f) => {
      const selected = f.variedSizes || [];
      return {
        ...f,
        variedSizes: selected.includes(size)
          ? selected.filter((s: string) => s !== size)
          : [...selected, size],
      };
    });
  };

  // Image handlers
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setForm((f) => ({
        ...f,
        thumbnail: file,
        thumbnailUrl: URL.createObjectURL(file),
      }));
    }
  };
  const handleRemoveThumbnail = () => {
    setForm((f) => ({ ...f, thumbnail: null, thumbnailUrl: "" }));
  };
  const handleAdditionalImageChange = (
    i: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] || null;
    setForm((f) => {
      const newImages = [...f.images];
      const newImagesUrl = [...f.imagesUrl];
      newImages[i] = file;
      newImagesUrl[i] = file ? URL.createObjectURL(file) : "";
      return { ...f, images: newImages, imagesUrl: newImagesUrl };
    });
  };
  const handleRemoveAdditionalImage = (i: number) => {
    setForm((f) => {
      const newImages = [...f.images];
      const newImagesUrl = [...f.imagesUrl];
      newImages[i] = null;
      newImagesUrl[i] = "";
      return { ...f, images: newImages, imagesUrl: newImagesUrl };
    });
  };

  return (
    <div className="bg-[#e7eaff] rounded-xl p-6 max-w-4xl mx-auto">
      <div className="flex flex-wrap gap-6">
        {/* Left Column */}
        <div className="flex-1 min-w-[320px]">
          {/* Product Name */}
          <label className="block font-semibold mb-1">
            Product Name <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center mb-3">
            <input
              type="text"
              className="w-full border rounded px-2 py-1"
              maxLength={50}
              placeholder="Type your product title..."
              value={form.productName}
              onChange={(e) =>
                setForm({ ...form, productName: e.target.value })
              }
            />
            <span className="ml-2 text-xs text-gray-500">
              {form.productName.length}/50
            </span>
          </div>
          {/* Product Category/Type */}
          <label className="block font-semibold mb-1">
            Product Category/Type
          </label>
          <div className="flex items-center mb-3">
            <input
              type="text"
              className="w-full border rounded px-2 py-1"
              maxLength={50}
              placeholder="Type the category..."
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <span className="ml-2 text-xs text-gray-500">
              {form.category.length}/50
            </span>
          </div>
          {/* Description */}
          <div className="flex items-center mb-1">
            <label className="font-semibold mr-2">Description</label>
            <ToggleSwitch
              checked={form.descriptionEnabled}
              onChange={() =>
                setForm({
                  ...form,
                  descriptionEnabled: !form.descriptionEnabled,
                })
              }
            />
          </div>
          <textarea
            className="w-full border rounded px-2 py-1 mb-4"
            placeholder="Describe your product..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            disabled={!form.descriptionEnabled}
            rows={3}
          />
          {/* Images */}
          <div className="flex gap-6 mb-4 items-end">
            {/* Thumbnail */}

            <div className="flex flex-col items-center">
              <label className="block font-semibold mt-2">Thumbnail</label>
              <div className="relative border-2 border-dashed rounded w-24 h-24 flex items-center justify-center text-xs text-gray-400 bg-white">
                {form.thumbnailUrl ? (
                  <>
                    <img
                      src={form.thumbnailUrl}
                      alt="thumb"
                      className="w-full h-full object-cover rounded"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-white rounded-full px-1 text-xs text-red-500 border border-gray-300"
                      onClick={handleRemoveThumbnail}
                      aria-label="Remove thumbnail"
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <label className="w-full h-full flex items-center justify-center cursor-pointer">
                    <span className="text-gray-400 text-3xl">+</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleThumbnailChange}
                    />
                  </label>
                )}
              </div>
            </div>
            {/* Additional Images */}
            <div className="flex flex-col items-center">
              <label className={`font-semibold mt-2`}>
                Additional images (optional)
              </label>
              <div className="flex flex-row items-center">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center w-full px-2"
                  >
                    <div className="relative border-2 border-dashed rounded w-24 h-24 flex items-center justify-center text-xs text-gray-400 bg-white">
                      {form.imagesUrl[i] ? (
                        <>
                          <img
                            src={form.imagesUrl[i]}
                            alt={`img${i}`}
                            className="w-full h-full object-cover rounded"
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-white rounded-full px-1 text-xs text-red-500 border border-gray-300"
                            onClick={() => handleRemoveAdditionalImage(i)}
                            aria-label={`Remove image ${i + 1}`}
                          >
                            ×
                          </button>
                        </>
                      ) : (
                        <label className="w-full h-full flex items-center justify-center cursor-pointer">
                          <span className="text-gray-400 text-3xl">+</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleAdditionalImageChange(i, e)}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Right Column */}
        <div className="flex-1 min-w-[320px] flex flex-col gap-4">
          {/* Quantity */}
          <div className="border rounded-lg p-4 bg-white">
            <label className="block font-semibold mb-2">Quantity</label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={form.quantityType === "unlimited"}
                  onChange={() =>
                    setForm({ ...form, quantityType: "unlimited" })
                  }
                  className="accent-green-500"
                />
                Unlimited
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={form.quantityType === "oneSize"}
                  onChange={() => setForm({ ...form, quantityType: "oneSize" })}
                  className="accent-gray-500"
                />
                One size/Qty.
                <input
                  type="number"
                  className="ml-2 border rounded px-2 py-1 w-28"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: e.target.value })
                  }
                  disabled={form.quantityType !== "oneSize"}
                  placeholder="999999.99"
                />
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={form.quantityType === "variedSizes"}
                  onChange={() =>
                    setForm({ ...form, quantityType: "variedSizes" })
                  }
                  className="accent-gray-500"
                />
                Varied Sizes
                <div className="flex gap-2 ml-2">
                  {sizeOptions.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`border rounded px-2 py-1 text-xs bg-white ${
                        form.variedSizes && form.variedSizes.includes(size)
                          ? "bg-indigo-200 border-indigo-500 font-bold"
                          : ""
                      }`}
                      onClick={() => handleSizeToggle(size)}
                      disabled={form.quantityType !== "variedSizes"}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </label>
            </div>
          </div>
          {/* Set Price */}
          <div className="border rounded-lg p-4 bg-white">
            <label className="block font-semibold mb-2">
              Set Price <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="radio"
                checked={form.priceType === "free"}
                onChange={() => setForm({ ...form, priceType: "free" })}
                className="accent-green-500"
              />
              Free/Complimentary
            </div>
            <div className="flex items-center gap-2">
              <input
                type="radio"
                checked={form.priceType === "paid"}
                onChange={() => setForm({ ...form, priceType: "paid" })}
                className="accent-gray-500"
              />
              <input
                type="number"
                className="border rounded px-2 py-1 w-32"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                disabled={form.priceType !== "paid"}
                placeholder="999999.99"
              />
              <span className="ml-1">USD</span>
            </div>
          </div>
          {/* CTA Button */}
          <div>
            <label className="block font-semibold mb-1">
              CTA Button<span className="text-red-500">*</span>
            </label>
            <select
              className="border rounded px-2 py-1 w-full"
              value={form.cta}
              onChange={(e) => setForm({ ...form, cta: e.target.value })}
            >
              <option>Buy Now</option>
              <option>Add to Cart</option>
              {/* Add more options as needed */}
            </select>
          </div>
          {/* NEXT Button */}
          <div className="flex justify-end mt-4">
            <button
              className="bg-green-500 text-white px-8 py-2 rounded font-bold hover:bg-green-600"
              onClick={onNext}
            >
              NEXT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhysicalProductForm;
