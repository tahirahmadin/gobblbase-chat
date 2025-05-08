import React from "react";

type DigitalFormType = {
  productName: string;
  category: string;
  description: string;
  descriptionEnabled: boolean;
  fileFormat: string[];
  uploadType: string;
  file: File | null;
  fileUrl: string;
  quantityType: string;
  quantity: string;
  priceType: string;
  price: string;
  cta: string;
  thumbnail: File | null;
  thumbnailUrl: string;
  images: (File | null)[];
  imagesUrl: string[];
};

type DigitalProductFormProps = {
  form: DigitalFormType;
  setForm: React.Dispatch<React.SetStateAction<DigitalFormType>>;
  onNext: () => void;
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

const DigitalProductForm: React.FC<DigitalProductFormProps> = ({
  form,
  setForm,
  onNext,
}) => (
  <div className="bg-[#e7eafe] rounded-2xl p-8 mt-6 max-w-4xl mx-auto">
    <div className="flex flex-col md:flex-row gap-8">
      {/* Left Side */}
      <div className="flex-1 flex flex-col gap-2">
        <label className="font-semibold">Product Name *</label>
        <input
          name="productName"
          maxLength={50}
          value={form.productName}
          onChange={(e) =>
            setForm((f) => ({ ...f, productName: e.target.value }))
          }
          className="w-full border border-gray-300 rounded p-2 mt-1 mb-1 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          placeholder="Type your product title..."
        />
        <div className="text-xs text-gray-500 text-right mb-2">
          {form.productName.length}/50
        </div>
        <label className="font-semibold">Product Category / Type</label>
        <input
          name="category"
          maxLength={50}
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          className="w-full border border-gray-300 rounded p-2 mt-1 mb-1 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          placeholder="Type the category..."
        />
        <div className="text-xs text-gray-500 text-right mb-2">
          {form.category.length}/50
        </div>
        <label className="font-semibold">File Format*</label>
        <div className="flex flex-wrap gap-2 mb-2 mt-1">
          {digitalFormats.map((fmt) => (
            <button
              key={fmt}
              type="button"
              className={`px-2 py-1 rounded border text-xs font-semibold transition-colors duration-150 ${
                form.fileFormat.includes(fmt)
                  ? "bg-indigo-500 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-indigo-100"
              }`}
              onClick={() => {
                setForm((f) => {
                  const exists = f.fileFormat.includes(fmt);
                  return {
                    ...f,
                    fileFormat: exists
                      ? f.fileFormat.filter((ff) => ff !== fmt)
                      : [...f.fileFormat, fmt],
                  };
                });
              }}
            >
              {fmt}
            </button>
          ))}
        </div>
        <label className="font-semibold">Description</label>
        <div className="flex items-center gap-2 mb-2">
          <textarea
            name="description"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            className="w-full border border-gray-300 rounded p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
            placeholder="Describe your product..."
            rows={4}
            disabled={!form.descriptionEnabled}
          />
          <div className="flex items-center ml-2">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.descriptionEnabled}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    descriptionEnabled: e.target.checked,
                  }))
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-400 transition-all duration-200"></div>
              <div
                className={`absolute ml-[-2.2rem] mt-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${
                  form.descriptionEnabled ? "translate-x-5" : ""
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
              {form.thumbnailUrl ? (
                <>
                  <img
                    src={form.thumbnailUrl}
                    alt="thumb"
                    className="w-full h-full object-cover rounded"
                  />
                  <button
                    className="absolute bottom-1 left-1 bg-white border border-gray-300 rounded p-1 text-xs"
                    onClick={() =>
                      setForm((f) => ({
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
                  <span className="text-gray-400 text-2xl">400x400</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
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
                  {form.imagesUrl[i] ? (
                    <>
                      <img
                        src={form.imagesUrl[i]}
                        alt={`img${i}`}
                        className="w-full h-full object-cover rounded"
                      />
                      <button
                        className="absolute bottom-1 left-1 bg-white border border-gray-300 rounded p-1 text-xs"
                        onClick={() =>
                          setForm((f) => {
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
                      <span className="text-gray-400 text-2xl">400x400</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setForm((f) => {
                            const newImages = [...f.images];
                            const newImagesUrl = [...f.imagesUrl];
                            newImages[i] = file;
                            newImagesUrl[i] = file
                              ? URL.createObjectURL(file)
                              : "";
                            return {
                              ...f,
                              images: newImages,
                              imagesUrl: newImagesUrl,
                            };
                          });
                        }}
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
          <label className="font-semibold block mb-2">Upload Product</label>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="uploadType"
                value="file"
                checked={form.uploadType === "file"}
                onChange={(e) =>
                  setForm((f) => ({ ...f, uploadType: e.target.value }))
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
                    setForm((f) => ({
                      ...f,
                      file: e.target.files?.[0] || null,
                    }))
                  }
                  disabled={form.uploadType !== "file"}
                />
                <label
                  htmlFor="digital-upload-file"
                  className={`border border-gray-300 rounded px-2 py-1 bg-gray-50 cursor-pointer ${
                    form.uploadType !== "file"
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  Drag & Drop File
                </label>
                <button
                  type="button"
                  className="ml-2 px-3 py-1 bg-green-400 text-white rounded shadow disabled:opacity-50"
                  disabled={form.uploadType !== "file" || !form.file}
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
                checked={form.uploadType === "url"}
                onChange={(e) =>
                  setForm((f) => ({ ...f, uploadType: e.target.value }))
                }
                className="accent-green-500 w-5 h-5"
              />
              <span>Redirect to URL</span>
              <input
                type="text"
                className="ml-2 border border-gray-300 rounded p-1 bg-white"
                placeholder="http://"
                value={form.fileUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fileUrl: e.target.value }))
                }
                disabled={form.uploadType !== "url"}
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
                className="border border-gray-300 rounded p-1 w-24 ml-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                placeholder="999999.99"
                disabled={form.quantityType !== "onesize"}
              />
            </label>
          </div>
        </div>
        {/* Set Price */}
        <div className="p-4 rounded-lg border border-indigo-200 bg-white mb-2">
          <label className="font-semibold block mb-2">Set Price *</label>
          <div className="flex flex-col gap-2">
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
                className="border border-gray-300 rounded p-1 w-24 ml-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                placeholder="999999.99"
                disabled={form.priceType !== "paid"}
              />
            </label>
          </div>
        </div>
        {/* CTA Button */}
        <div className="p-4 rounded-lg border border-indigo-200 bg-white mb-2">
          <label className="font-semibold block mb-2">CTA Button*</label>
          <select
            className="border border-gray-300 rounded p-2 w-full bg-white"
            value={form.cta}
            onChange={(e) => setForm((f) => ({ ...f, cta: e.target.value }))}
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
            onClick={onNext}
          >
            NEXT
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default DigitalProductForm;
