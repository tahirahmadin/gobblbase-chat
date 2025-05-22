import React, { useState, useEffect } from "react";
import { ProductType } from "../../../types";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useBotConfig } from "../../../store/useBotConfig";

type UnifiedFormType = {
  // Common fields
  title?: string;
  category?: string;
  description?: string;
  descriptionEnabled?: boolean;
  price?: string;
  priceType?: string;
  cta?: string;
  thumbnail?: File | null;
  thumbnailUrl?: string;
  images?: (File | null)[];
  imagesUrl?: string[];
  quantityType?: string;
  quantity: number;
  // Digital
  fileFormat?: string;
  uploadType?: string;
  file?: File | null;
  fileUrl?: string;
  // Physical
  customQuantity?: number;
  variedSizes?: string[];
  variedQuantities?: Record<string, number>;
  // Service
  locationType?: string;
  address?: string;
  // Event
  eventType?: string;
  eventTypeOther?: string;
  timeZone?: string;
  slots?: Array<{
    date: Date | null;
    start: Date | null;
    end: Date | null;
    seatType: "unlimited" | "limited";
    seats: number;
  }>;
  quantityUnlimited?: boolean;
};

type UnifiedProductFormProps = {
  type: ProductType;
  form: UnifiedFormType;
  setForm: React.Dispatch<React.SetStateAction<UnifiedFormType>>;
  onNext: () => void;
};

const digitalFormats = [
  ".doc",
  ".xls",
  ".pdf",
  ".zip",
  ".psd",
  ".eps",
  ".svg",
  ".mp4",
];
const sizeOptions = ["S", "M", "L", "XL"];
const eventTypes = ["Event", "1:1 Session", "Workshop", "Webinar", "Other"];

const UnifiedProductForm: React.FC<UnifiedProductFormProps> = ({
  type,
  form,
  setForm,
  onNext,
}) => {
  const { activeBotData } = useBotConfig();
  const [thumbnailInputKey, setThumbnailInputKey] = useState(0);

  const getTitle = () => {
    switch (type) {
      case "digitalProduct":
        return "Product Name *";
      case "physicalProduct":
        return "Product Name *";
      case "Service":
        return "Service Name *";
      case "Event":
        return "Event Name *";
      default:
        return "Name *";
    }
  };

  return (
    <div className="bg-[#e7eafe] rounded-2xl p-4 mx-auto w-full">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <label className="font-semibold">{getTitle()}</label>
          <input
            maxLength={50}
            value={form.title || ""}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full border border-gray-300 rounded p-2 mt-1 mb-1 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
            placeholder={`Type your ${type.toLowerCase()} name...`}
          />
          <div className="text-xs text-gray-500 text-right mb-2">
            {form.title?.length}/50
          </div>

          <label className="font-semibold">Category / Type</label>
          <input
            maxLength={50}
            value={form.category || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, category: e.target.value }))
            }
            className="w-full border border-gray-300 rounded p-2 mt-1 mb-1 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
            placeholder="Type the category..."
          />
          <div className="text-xs text-gray-500 text-right mb-2">
            {(form.category || "").length}/50
          </div>

          {/* Digital Product Specific */}
          {type === "digitalProduct" && (
            <>
              <label className="font-semibold">File Format*</label>
              <div className="flex flex-wrap gap-1 mb-2 mt-1">
                {digitalFormats.map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    className={`px-2 py-1 rounded border text-xs font-semibold transition-colors duration-150 ${
                      form.fileFormat === fmt.toLocaleLowerCase()
                        ? "bg-indigo-500 text-white border-indigo-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-indigo-100"
                    }`}
                    onClick={() => {
                      console.log(form.fileFormat);
                      console.log(fmt.toLocaleLowerCase());
                      setForm((f) => {
                        return {
                          ...f,
                          fileFormat: fmt,
                        };
                      });
                    }}
                  >
                    {fmt.toLocaleUpperCase()}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Event Specific */}
          {type === "Event" && (
            <>
              <label className="font-semibold">Event Type*</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {eventTypes.map((eventType) => (
                  <button
                    key={eventType}
                    type="button"
                    className={`px-3 py-1 rounded border text-xs font-semibold transition-colors duration-150 ${
                      form.eventType === eventType
                        ? "bg-indigo-500 text-white border-indigo-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-indigo-100"
                    }`}
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        eventType,
                      }))
                    }
                  >
                    {eventType}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Description with inline toggle */}
          <div className="mb-2">
            <div className="flex items-center justify-between gap-3 mb-1">
              <label className="font-semibold mb-0">Description</label>
              <button
                type="button"
                aria-label={
                  form.descriptionEnabled
                    ? "Disable description"
                    : "Enable description"
                }
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                  form.descriptionEnabled ? "bg-green-500" : "bg-gray-300"
                }`}
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    descriptionEnabled: !f.descriptionEnabled,
                  }))
                }
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                    form.descriptionEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <textarea
              value={form.description || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
              placeholder="Describe your offering..."
              rows={3}
              disabled={!form.descriptionEnabled}
            />
          </div>

          {/* Images Section */}
          <div>
            <label className="font-semibold">Thumbnail & Images</label>
            <div className="text-xs">(*only .png, .jpg, .jpeg)</div>
            <div className="flex flex-wrap gap-2 mt-1">
              {/* If thumbnailUrl (new upload) exists, show it as main preview */}
              {form.thumbnailUrl ? (
                <div className="w-24 h-24 bg-white border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer relative">
                  <img
                    src={form.thumbnailUrl}
                    alt="thumb"
                    className="w-full h-full object-cover rounded"
                  />
                  <button
                    className="absolute bottom-1 left-1 bg-white border border-gray-300 rounded p-1 text-xs"
                    onClick={() => {
                      setForm((f) => ({
                        ...f,
                        thumbnail: null,
                        thumbnailUrl: "",
                      }));
                      setThumbnailInputKey((k) => k + 1);
                    }}
                    type="button"
                  >
                    <span role="img" aria-label="delete">
                      ❌
                    </span>
                  </button>
                </div>
              ) : (form.images || [])[0] ? (
                // If images array exists and first image is present, show all images
                (form.images || []).map((img, idx) => (
                  <div
                    key={idx}
                    className="w-24 h-24 bg-white border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer relative"
                  >
                    {img ? (
                      <img
                        src={
                          typeof img === "string"
                            ? img
                            : URL.createObjectURL(img)
                        }
                        alt={`img${idx}`}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">400x400</span>
                    )}
                    <button
                      className="absolute bottom-1 left-1 bg-white border border-gray-300 rounded p-1 text-xs"
                      onClick={() => {
                        const newImages = [...(form.images || [])];
                        newImages[idx] = null;
                        setForm((f) => ({ ...f, images: newImages }));
                        if (idx === 0) setThumbnailInputKey((k) => k + 1);
                      }}
                      type="button"
                    >
                      <span role="img" aria-label="delete">
                        ❌
                      </span>
                    </button>
                  </div>
                ))
              ) : (
                // Otherwise, show file input for new upload
                <label className="w-24 h-24 bg-white border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer relative">
                  <span className="text-gray-400 text-sm">400x400</span>
                  <input
                    key={thumbnailInputKey}
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
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Digital Product Specific */}
          {type === "digitalProduct" && (
            <div className="p-4 rounded-lg border border-indigo-200 bg-white mb-2">
              <label className="font-semibold block mb-2">Upload Product</label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="uploadType"
                    value="file"
                    checked={form.uploadType === "upload"}
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
                      disabled={form.uploadType !== "upload"}
                    />
                    <label
                      htmlFor="digital-upload-file"
                      className={`border border-gray-300 rounded px-2 py-1 bg-gray-50 cursor-pointer ${
                        form.uploadType !== "upload"
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      Drag & Drop File
                    </label>
                    <button
                      type="button"
                      className="ml-2 px-3 py-1 bg-green-400 text-white rounded shadow disabled:opacity-50"
                      disabled={form.uploadType !== "upload" || !form.file}
                    >
                      UPLOAD
                    </button>
                  </div>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="uploadType"
                    value="redirect"
                    checked={form.uploadType === "redirect"}
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
                    value={form.fileUrl || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, fileUrl: e.target.value }))
                    }
                    disabled={form.uploadType !== "redirect"}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Event Specific */}
          {type === "Event" && (
            <div className="mb-2 p-4 rounded-xl border border-indigo-300 bg-[#dbeafe]">
              <label className="font-semibold block mb-2">Set Slots</label>

              {(form.slots || []).map((slot, index) => (
                <div key={index} className="mb-4">
                  <div className="grid grid-cols-12 gap-2 items-center mb-2">
                    <div className="col-span-4 flex items-center gap-2">
                      <span className="text-xs font-semibold">Date</span>
                      <DatePicker
                        selected={slot.date}
                        onChange={(date: Date | null) =>
                          setForm((f) => {
                            const slots = [...(f.slots || [])];
                            slots[index] = {
                              ...slots[index],
                              date: date,
                            };
                            return { ...f, slots };
                          })
                        }
                        dateFormat="MM/dd/yyyy"
                        className="border border-gray-300 rounded p-1 w-32 text-xs"
                        placeholderText="Select date"
                        minDate={new Date()}
                        isClearable
                        showPopperArrow={false}
                      />
                    </div>
                    <div className="col-span-4 flex items-center gap-2">
                      <span className="text-xs font-semibold">Start</span>
                      <DatePicker
                        selected={slot.start}
                        onChange={(time: Date | null) =>
                          setForm((f) => {
                            const slots = [...(f.slots || [])];
                            slots[index] = {
                              ...slots[index],
                              start: time,
                              end:
                                time && slot.end && time > slot.end
                                  ? null
                                  : slot.end,
                            };
                            return { ...f, slots };
                          })
                        }
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeCaption="Time"
                        dateFormat="h:mm aa"
                        className="border border-gray-300 rounded p-1 w-24 text-xs"
                        placeholderText="Select time"
                        isClearable
                        showPopperArrow={false}
                        minTime={new Date(0, 0, 0, 0, 0, 0)}
                        maxTime={new Date(0, 0, 0, 23, 59, 0)}
                      />
                    </div>
                    <div className="col-span-4 flex items-center gap-2">
                      <span className="text-xs font-semibold">End</span>
                      <DatePicker
                        selected={slot.end}
                        onChange={(time: Date | null) =>
                          setForm((f) => {
                            const slots = [...(f.slots || [])];
                            slots[index] = {
                              ...slots[index],
                              end: time,
                            };
                            return { ...f, slots };
                          })
                        }
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeCaption="Time"
                        dateFormat="h:mm aa"
                        className="border border-gray-300 rounded p-1 w-24 text-xs"
                        placeholderText="Select time"
                        isClearable
                        showPopperArrow={false}
                        minTime={slot.start || new Date(0, 0, 0, 0, 0, 0)}
                        maxTime={new Date(0, 0, 0, 23, 59, 0)}
                      />
                    </div>
                  </div>
                  <div className="mb-2 text-xs font-semibold">
                    Slots/Session
                  </div>
                  <div className="flex items-center gap-6 mb-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`seatType-${index}`}
                        value="unlimited"
                        checked={slot.seatType === "unlimited"}
                        onChange={() =>
                          setForm((f) => {
                            const slots = [...(f.slots || [])];
                            slots[index] = {
                              ...slots[index],
                              seatType: "unlimited",
                            };
                            return { ...f, slots };
                          })
                        }
                        className="accent-green-500 w-5 h-5"
                      />
                      <span className="font-medium">Unlimited</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`seatType-${index}`}
                        value="limited"
                        checked={slot.seatType === "limited"}
                        onChange={() =>
                          setForm((f) => {
                            const slots = [...(f.slots || [])];
                            slots[index] = {
                              ...slots[index],
                              seatType: "limited",
                            };
                            return { ...f, slots };
                          })
                        }
                        className="accent-gray-500 w-5 h-5"
                      />
                      <span className="font-medium">Limited Seats</span>
                      <input
                        type="number"
                        placeholder="100"
                        value={slot.seats}
                        onChange={(e) =>
                          setForm((f) => {
                            const slots = [...(f.slots || [])];
                            slots[index] = {
                              ...slots[index],
                              seats: parseInt(e.target.value),
                            };
                            return { ...f, slots };
                          })
                        }
                        className="border border-gray-300 rounded p-1 w-16 text-xs"
                        disabled={slot.seatType !== "limited"}
                      />
                    </label>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="flex items-center gap-2 mt-2 px-3 py-1 bg-white border border-gray-400 rounded text-xs font-semibold hover:bg-indigo-100"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    slots: [
                      ...((f.slots as any) || []),
                      {
                        date: null,
                        start: null,
                        end: null,
                        seatType: "unlimited",
                        seats: 0,
                      },
                    ],
                  }))
                }
              >
                <span className="text-lg font-bold">+</span> ADD SLOT
              </button>
            </div>
          )}

          {/* Service Specific */}
          {type === "Service" && (
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
                    value={form.address || ""}
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
          )}

          {/* Physical Product Specific Quantity Section */}
          {type !== "Event" &&
            (type === "physicalProduct" ? (
              <div className="bg-white border border-indigo-300 rounded-xl p-4 mb-4">
                <label className="block font-semibold mb-2">Quantity</label>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="quantityType"
                      value="unlimited"
                      checked={form.quantityType === "unlimited"}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          quantityType: e.target.value,
                          quantityUnlimited: true,
                        }))
                      }
                      className="accent-green-500 w-5 h-5"
                    />
                    <span className="font-medium">Unlimited</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="quantityType"
                      value="oneSize"
                      checked={form.quantityType === "oneSize"}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          quantityType: e.target.value,
                          quantityUnlimited: false,
                        }))
                      }
                      className="accent-gray-500 w-5 h-5"
                    />
                    <span className="font-medium">One size/Qty.</span>
                    <input
                      type="number"
                      className="ml-2 border rounded px-2 py-1 w-32"
                      value={form.quantity || 0}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          quantity: parseInt(e.target.value) || 0,
                        }))
                      }
                      disabled={form.quantityType !== "oneSize"}
                      placeholder="99999.99"
                    />
                  </label>
                  <div className="flex items-start gap-2">
                    <input
                      type="radio"
                      name="quantityType"
                      value="variedSizes"
                      checked={form.quantityType === "variedSizes"}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          quantityType: e.target.value,
                          quantityUnlimited: false,
                        }))
                      }
                      className="accent-gray-500 w-5 h-5 mt-1"
                    />
                    <span className="font-medium mt-1">Varied Sizes</span>
                    <div className="grid grid-cols-2 gap-2 ml-2">
                      {sizeOptions.map((size) => (
                        <div key={size} className="flex flex-row items-center">
                          <button
                            type="button"
                            className={`border rounded px-4 py-1 text-xs font-semibold mb-1 w-16 ${
                              form.variedSizes?.includes(size)
                                ? "bg-indigo-200 border-indigo-500 font-bold"
                                : "bg-white border-gray-300"
                            }`}
                            onClick={() => {
                              if (form.quantityType !== "variedSizes") return;
                              setForm((f) => {
                                const selected = f.variedSizes || [];
                                let newVariedSizes;
                                let newVariedQuantities = {
                                  ...(f.variedQuantities || {}),
                                };
                                if (selected.includes(size)) {
                                  newVariedSizes = selected.filter(
                                    (s) => s !== size
                                  );
                                  delete newVariedQuantities[size];
                                } else {
                                  newVariedSizes = [...selected, size];
                                  newVariedQuantities[size] = 0;
                                }
                                return {
                                  ...f,
                                  variedSizes: newVariedSizes,
                                  variedQuantities: newVariedQuantities,
                                };
                              });
                            }}
                            disabled={form.quantityType !== "variedSizes"}
                          >
                            {size}
                          </button>
                          <input
                            type="number"
                            className="border rounded px-2 py-1 w-16 text-center text-xs"
                            placeholder="XXXXX"
                            value={form.variedQuantities?.[size] || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              setForm((f) => ({
                                ...f,
                                variedQuantities: {
                                  ...(f.variedQuantities || {}),
                                  [size]: parseInt(value) || 0,
                                },
                              }));
                            }}
                            disabled={
                              form.quantityType !== "variedSizes" ||
                              !form.variedSizes?.includes(size)
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Default/Common Quantity Section for other types
              <div className="mb-2 p-4 rounded-lg border bg-white">
                <label className="font-semibold block mb-2">Quantity</label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="quantityType"
                      value="unlimited"
                      checked={form.quantityType === "unlimited"}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          quantityType: e.target.value,
                          quantityUnlimited: true,
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
                      value="oneSize"
                      checked={form.quantityType === "oneSize"}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          quantityType: e.target.value,
                          quantityUnlimited: false,
                        }))
                      }
                      className="accent-green-500 w-5 h-5"
                    />
                    <span className="text-gray-700">One size/Qty:</span>
                    <input
                      type="number"
                      value={form.quantity || 0}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          quantity: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="border border-gray-300 rounded p-1 w-24 ml-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      placeholder="999999.99"
                      disabled={form.quantityType !== "oneSize"}
                    />
                  </label>
                </div>
              </div>
            ))}

          <div className="mb-2 p-4 rounded-lg border border-indigo-200 bg-white">
            <label className="font-semibold block mb-2">Set Price *</label>
            <div className="flex flex-col items-start gap-4">
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
                <span className="text-gray-700">{activeBotData?.currency}</span>
                <input
                  value={form.price || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  className="border border-gray-300 rounded p-1 w-24 ml-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  placeholder="999999.99"
                  disabled={form.priceType !== "paid"}
                />
              </label>
            </div>
          </div>

          <div className="mb-2 p-4 rounded-lg border border-indigo-200 bg-white">
            <label className="font-semibold block mb-2">CTA Button*</label>
            <input
              className="border border-gray-300 rounded p-2 w-full"
              value={form.cta || "Buy Now"}
              onChange={(e) => setForm((f) => ({ ...f, cta: e.target.value }))}
              placeholder="Buy Now"
            />
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
};

export default UnifiedProductForm;
