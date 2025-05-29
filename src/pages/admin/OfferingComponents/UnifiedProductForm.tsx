import React, { useState, useEffect } from "react";
import { ProductType } from "../../../types";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useBotConfig } from "../../../store/useBotConfig";
import { X } from "lucide-react";

// Add styles for DatePicker
const datePickerStyles = `
  .react-datepicker-popper {
    z-index: 9999 !important;
  }
  .react-datepicker-wrapper {
    display: inline-block;
  }
  .react-datepicker {
    font-family: inherit;
    font-size: 0.9rem;
  }
`;

// Format file size for display
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
  else return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

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
  fileName?: string;
  // Physical
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

type FormErrors = {
  title?: string;
  category?: string;
  description?: string;
  price?: string;
  quantity?: string;
  slots?: string;
  slotDetails?: Array<Record<string, string>>;
  variedQuantities?: {
    [key: string]: string;
  };
};

type UnifiedProductFormProps = {
  type: ProductType;
  form: UnifiedFormType;
  setForm: React.Dispatch<React.SetStateAction<UnifiedFormType>>;
  onNext: () => void;
  editMode?: boolean;
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
  editMode = false,
}) => {
  const { activeBotData } = useBotConfig();
  const [thumbnailInputKey, setThumbnailInputKey] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({});
  const [userTimeZone, setUserTimeZone] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Title validation
    if (!form.title) {
      newErrors.title = "Title is required";
    } else if (form.title.length > 50) {
      newErrors.title = "Title must be 50 characters or less";
    }

    // Category validation
    if (!form.category) {
      newErrors.category = "Category is required";
    } else if (form.category.length > 20) {
      newErrors.category = "Category must be 20 characters or less";
    }

    // Description validation
    if (!form.description) {
      newErrors.description = "Description is required";
    } else if (form.description.length > 300) {
      newErrors.description = "Description must be 300 characters or less";
    }

    // Quantity validation (skip for Event)
    if (type !== "Event") {
      if (!form.quantityType) {
        newErrors.quantity = "Please select a quantity type";
      } else if (form.quantityType === "oneSize" && !form.quantityUnlimited) {
        if (form.quantity === 0 || form.quantity === undefined) {
          newErrors.quantity = "Please enter a quantity";
        } else if (form.quantity < 0) {
          newErrors.quantity = "Quantity cannot be negative";
        }
      } else if (form.quantityType === "variedSizes") {
        if (!form.variedSizes || form.variedSizes.length === 0) {
          newErrors.quantity = "Please select at least one size";
        } else {
          const variedErrors: Record<string, string> = {};
          form.variedSizes.forEach((size) => {
            const qty = form.variedQuantities?.[size];
            if (qty === 0 || qty === undefined) {
              variedErrors[size] = "Please enter a quantity";
            } else if (qty < 0) {
              variedErrors[size] = "Quantity cannot be negative";
            }
          });
          if (Object.keys(variedErrors).length > 0) {
            newErrors.variedQuantities = variedErrors;
          }
        }
      }
    }

    // Price validation
    if (!form.priceType) {
      newErrors.price = "Please select a price type";
    } else if (form.priceType === "paid") {
      if (!form.price || form.price === "0") {
        newErrors.price = "Please enter a price";
      } else {
        const priceNum = parseFloat(form.price);
        if (isNaN(priceNum) || priceNum < 0) {
          newErrors.price = "Price must be a positive number";
        }
      }
    }

    // Enhanced Event Slots validation
    if (type === "Event") {
      if (!form.slots || form.slots.length === 0) {
        newErrors.slots = "Please add at least one slot";
      } else {
        const slotErrors = form.slots.map((slot, index) => {
          const errors: Record<string, string> = {};

          // Date validation
          if (!slot.date) {
            errors.date = "Date is required";
          } else {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (slot.date < today) {
              errors.date = "Date cannot be in the past";
            }
          }

          // Time validation
          if (!slot.start) {
            errors.start = "Start time is required";
          }
          if (!slot.end) {
            errors.end = "End time is required";
          }

          // Validate start time is before end time
          if (slot.start && slot.end) {
            const startTime = new Date(slot.start);
            const endTime = new Date(slot.end);

            if (startTime >= endTime) {
              errors.end = "End time must be after start time";
            }

            // Check if slot duration is at least 15 minutes
            const duration = endTime.getTime() - startTime.getTime();
            if (duration < 15 * 60 * 1000) {
              errors.end = "Slot duration must be at least 15 minutes";
            }
          }

          // Seat validation for limited seats
          if (slot.seatType === "limited") {
            if (!slot.seats || slot.seats <= 0) {
              errors.seats = "Please enter a valid number of seats";
            } else if (slot.seats > 1000) {
              errors.seats = "Maximum 1000 seats allowed per slot";
            }
          }

          return errors;
        });

        const hasErrors = slotErrors.some(
          (errors) => Object.keys(errors).length > 0
        );
        if (hasErrors) {
          newErrors.slotDetails = slotErrors;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    const isValid = validateForm();
    console.log("Form validation result:", isValid);
    console.log("Current form errors:", errors);
    if (isValid) {
      onNext();
    } else {
      // Scroll to the first error
      const firstErrorElement = document.querySelector(".border-red-500");
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  };

  const getTitle = () => {
    switch (type) {
      case "digitalProduct":
        return "Product";
      case "physicalProduct":
        return "Product";
      case "Service":
        return "Service";
      case "Event":
        return "Event";
      default:
        return "Name";
    }
  };

  return (
    <div className="mx-auto w-full">
      <style>{datePickerStyles}</style>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side */}
        <div className="flex-1 flex flex-col gap-2 min-w-0 ">
          <label className="font-semibold">{getTitle()} Name*</label>
          <input
            maxLength={50}
            value={form.title || ""}
            onChange={(e) => {
              setForm((f) => ({ ...f, title: e.target.value }));
              if (errors.title) {
                setErrors((prev) => ({ ...prev, title: undefined }));
              }
            }}
            className={`w-full border ${
              errors.title ? "border-red-500" : "border-gray-300"
            } rounded p-2 mt-1 mb-1 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white`}
            placeholder={`Type ${getTitle()} title...`}
          />
          <div className="flex justify-between">
            <div className="text-xs text-red-500">{errors.title}</div>
            <div className="text-xs text-gray-500">{form.title?.length}/50</div>
          </div>

          <label className="font-semibold">Category / Type*</label>
          <input
            maxLength={20}
            value={form.category || ""}
            onChange={(e) => {
              setForm((f) => ({ ...f, category: e.target.value }));
              if (errors.category) {
                setErrors((prev) => ({ ...prev, category: undefined }));
              }
            }}
            className={`w-full border ${
              errors.category ? "border-red-500" : "border-gray-300"
            } rounded p-2 mt-1 mb-1 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white`}
            placeholder="Type the category..."
          />
          <div className="flex justify-between">
            <div className="text-xs text-red-500">{errors.category}</div>
            <div className="text-xs text-gray-500">
              {(form.category || "").length}/20
            </div>
          </div>

          {/* Digital Product Specific */}
          {type === "digitalProduct" && (
            <>
              {/* <label className="font-semibold">File Format*</label>
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
              </div> */}
            </>
          )}

          {/* Event Specific */}
          {type === "Event" && (
            <>
              <label className="font-semibold">Event Type</label>
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
              <label className="font-semibold mb-0">Description*</label>
            </div>
            <textarea
              value={form.description || ""}
              onChange={(e) => {
                setForm((f) => ({ ...f, description: e.target.value }));
                if (errors.description) {
                  setErrors((prev) => ({ ...prev, description: undefined }));
                }
              }}
              className={`w-full border ${
                errors.description ? "border-red-500" : "border-gray-300"
              } rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white`}
              placeholder="Describe your offering..."
              rows={3}
              maxLength={300}
            />
            <div className="flex justify-between">
              <div className="text-xs text-red-500">{errors.description}</div>
              <div className="text-xs text-gray-500">
                {(form.description || "").length}/300
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div>
            <label className="font-semibold">Thumbnail & Images</label>
            <div className="text-xs">(*png, jpg, jpeg only - max 1 MB)</div>
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
                    accept=".png,.jpg,.jpeg"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file) {
                        // Check if file type is allowed
                        const allowedTypes = [
                          "image/png",
                          "image/jpeg",
                          "image/jpg",
                        ];
                        if (!allowedTypes.includes(file.type)) {
                          alert("Please upload only PNG, JPG, or JPEG files");
                          return;
                        }
                        // Check file size (1MB = 1024 * 1024 bytes)
                        if (file.size > 1024 * 1024) {
                          alert("File size must be less than 1MB");
                          return;
                        }
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
        <div className="flex-1 flex flex-col gap-4 min-w-0 ">
          {/* Digital Product Specific */}
          {type === "digitalProduct" && (
            <div className="p-4 rounded-lg border border-indigo-200 bg-white mb-2">
              <label className="font-semibold block mb-2">Upload Product</label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="uploadType"
                    value="upload"
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
                          fileName: e.target.files?.[0]?.name || "",
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
                {/* Status line */}
                <div className="mt-2 text-sm">
                  {form.uploadType === "upload" && (
                    <>
                      {(form.file || form.fileName) && (
                        <div className="flex items-center gap-2">
                          <div className="flex justify-between items-center px-2 py-1 border w-[80%] bg-[#CEFFDC] border-2 border-[#6AFF97]">
                            <span className="text-sm truncate">
                              {form.file ? form.file.name : form.fileName}
                            </span>
                            {form.file && (
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {formatFileSize(form.file.size)}
                              </span>
                            )}
                          </div>
                          {form.file && (
                            <button
                              type="button"
                              onClick={() => {
                                setForm((f) => ({
                                  ...f,
                                  file: null,
                                  fileName: "",
                                }));
                              }}
                              className="hover:text-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                      {/* {form.uploadType === "upload" &&
                        editMode &&
                        form.fileUrl && (
                          <a
                            href={form.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            View attachment
                          </a>
                        )} */}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Event Specific */}
          {type === "Event" && (
            <div className="p-4 rounded-xl border border-indigo-200 bg-[#ffffff]">
              <label className="font-semibold block mb-2">Set Slots</label>
              <div className="text-xs text-gray-500 mb-2">
                Timezone: {userTimeZone}
              </div>
              {errors.slots && (
                <div className="text-xs text-red-500 mb-2">{errors.slots}</div>
              )}

              {(form.slots || []).map((slot, index) => (
                <div key={index} className="mb-4 relative">
                  {(form.slots || []).length > 1 && (
                    <button
                      type="button"
                      className="absolute -right-2 -top-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      onClick={() => {
                        setForm((f) => ({
                          ...f,
                          slots: (f.slots || []).filter((_, i) => i !== index),
                        }));
                      }}
                    >
                      ×
                    </button>
                  )}
                  <div className="grid grid-cols-12 gap-2 items-start mb-2">
                    <div className="col-span-6 flex items-center gap-2">
                      <span className="text-xs font-semibold">Event Date:</span>
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
                        className={`border ${
                          errors.slotDetails?.[index]?.date
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded p-1 w-32 text-xs`}
                        placeholderText="Select date"
                        minDate={new Date()}
                        isClearable
                        showPopperArrow={false}
                      />
                      {errors.slotDetails?.[index]?.date && (
                        <div className="text-xs text-red-500">
                          {errors.slotDetails[index].date}
                        </div>
                      )}
                    </div>
                    <div className="col-span-6 flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">
                          Start time:
                        </span>
                        <DatePicker
                          selected={slot.start ? new Date(slot.start) : null}
                          onChange={(time: Date | null) =>
                            setForm((f) => {
                              const slots = [...(f.slots || [])];
                              slots[index] = {
                                ...slots[index],
                                start: time,
                                end:
                                  time && slot.end && time > new Date(slot.end)
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
                          className={`border ${
                            errors.slotDetails?.[index]?.start
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded p-1 w-24 text-xs`}
                          placeholderText="Select time"
                          isClearable
                          showPopperArrow={false}
                          minTime={new Date(0, 0, 0, 0, 0, 0)}
                          maxTime={new Date(0, 0, 0, 23, 59, 0)}
                          portalId="root"
                          popperClassName="react-datepicker-popper"
                          popperPlacement="bottom-start"
                          calendarClassName="react-datepicker-calendar"
                          wrapperClassName="react-datepicker-wrapper"
                        />
                        {errors.slotDetails?.[index]?.start && (
                          <div className="text-xs text-red-500">
                            {errors.slotDetails[index].start}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">End time:</span>
                        <DatePicker
                          selected={slot.end ? new Date(slot.end) : null}
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
                          className={`border ${
                            errors.slotDetails?.[index]?.end
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded p-1 w-24 text-xs`}
                          placeholderText="Select time"
                          isClearable
                          showPopperArrow={false}
                          minTime={
                            slot.start
                              ? new Date(slot.start)
                              : new Date(0, 0, 0, 0, 0, 0)
                          }
                          maxTime={new Date(0, 0, 0, 23, 59, 0)}
                          portalId="root"
                          popperClassName="react-datepicker-popper"
                          popperPlacement="bottom-start"
                          calendarClassName="react-datepicker-calendar"
                          wrapperClassName="react-datepicker-wrapper"
                        />
                        {errors.slotDetails?.[index]?.end && (
                          <div className="text-xs text-red-500">
                            {errors.slotDetails[index].end}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mb-2 text-sm font-semibold mt-5">
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
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="100"
                        value={slot.seats === 0 ? "" : slot.seats}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow empty value
                          if (value === "") {
                            setForm((f) => {
                              const slots = [...(f.slots || [])];
                              slots[index] = {
                                ...slots[index],
                                seats: 0,
                              };
                              return { ...f, slots };
                            });
                            return;
                          }
                          // Only allow numbers
                          if (!/^\d*$/.test(value)) return;
                          const numValue = parseInt(value);
                          setForm((f) => {
                            const slots = [...(f.slots || [])];
                            slots[index] = {
                              ...slots[index],
                              seats: numValue,
                            };
                            return { ...f, slots };
                          });
                        }}
                        onKeyDown={(e) => {
                          // Prevent non-numeric characters
                          if (
                            !/^\d$/.test(e.key) &&
                            e.key !== "Backspace" &&
                            e.key !== "Delete" &&
                            e.key !== "ArrowLeft" &&
                            e.key !== "ArrowRight" &&
                            e.key !== "Tab"
                          ) {
                            e.preventDefault();
                          }
                        }}
                        className={`border ${
                          errors.slotDetails?.[index]?.seats
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded p-1 w-16 text-sm`}
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
            <div className=" p-4 rounded-lg border border-indigo-200 bg-white">
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
                    className="border border-gray-300 rounded p-1 w-40 ml-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 w-full"
                    placeholder="Address"
                    disabled={form.locationType !== "offline"}
                    maxLength={50}
                  />
                  <div className="text-xs text-gray-500 ml-2">
                    {(form.address || "").length}/50
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Physical Product Specific Quantity Section */}
          {type !== "Event" &&
            (type === "physicalProduct" ? (
              <div className="bg-white border border-indigo-200 rounded-xl p-4">
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
                      className="accent-green-500 w-5 h-5"
                    />
                    <span className="font-medium">One size/Qty.</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={form.quantity === 0 ? "" : form.quantity}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow empty value
                        if (value === "") {
                          setForm((f) => ({
                            ...f,
                            quantity: 0,
                          }));
                          return;
                        }
                        // Only allow numbers
                        if (!/^\d*$/.test(value)) return;

                        const numValue = parseInt(value);
                        if (numValue < 0) return;
                        setForm((f) => ({
                          ...f,
                          quantity: numValue,
                        }));
                        if (errors.quantity) {
                          setErrors((prev) => ({
                            ...prev,
                            quantity: undefined,
                          }));
                        }
                      }}
                      onKeyDown={(e) => {
                        // Prevent minus sign
                        if (e.key === "-") {
                          e.preventDefault();
                        }
                      }}
                      className={`border ${
                        errors.quantity ? "border-red-500" : "border-gray-300"
                      } rounded p-1 w-24 ml-2 focus:outline-none focus:ring-2 focus:ring-indigo-300`}
                      placeholder="Enter quantity"
                      disabled={form.quantityType !== "oneSize"}
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
                    <div className="grid grid-cols-1 gap-2 ml-2">
                      {sizeOptions.map((size) => (
                        <div key={size} className="flex flex-row items-center">
                          <button
                            type="button"
                            className={`border rounded px-4 py-1 text-xs font-semibold w-16 ${
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
                            className={`border ${
                              errors.variedQuantities?.[size]
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded px-2 py-1 w-16 text-center text-xs`}
                            placeholder="XXXXX"
                            value={form.variedQuantities?.[size] || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Only allow positive integers
                              if (!/^\d*$/.test(value)) return;
                              const numValue = parseInt(value) || 0;
                              setForm((f) => ({
                                ...f,
                                variedQuantities: {
                                  ...(f.variedQuantities || {}),
                                  [size]: numValue,
                                },
                              }));
                              if (errors.variedQuantities?.[size]) {
                                setErrors((prev) => {
                                  const newVariedQuantities = {
                                    ...prev.variedQuantities,
                                  };
                                  delete newVariedQuantities[size];
                                  return {
                                    ...prev,
                                    variedQuantities: newVariedQuantities,
                                  };
                                });
                              }
                            }}
                            onKeyDown={(e) => {
                              // Prevent non-numeric characters
                              if (
                                !/^\d$/.test(e.key) &&
                                e.key !== "Backspace" &&
                                e.key !== "Delete" &&
                                e.key !== "ArrowLeft" &&
                                e.key !== "ArrowRight" &&
                                e.key !== "Tab"
                              ) {
                                e.preventDefault();
                              }
                            }}
                            disabled={
                              form.quantityType !== "variedSizes" ||
                              !form.variedSizes?.includes(size)
                            }
                          />
                          {errors.variedQuantities?.[size] && (
                            <div className="text-xs text-red-500 pl-2">
                              {errors.variedQuantities[size]}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Default/Common Quantity Section for other types
              <div className="p-4 rounded-lg border bg-white">
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
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={form.quantity === 0 ? "" : form.quantity}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow empty value
                        if (value === "") {
                          setForm((f) => ({
                            ...f,
                            quantity: 0,
                          }));
                          return;
                        }
                        // Only allow numbers
                        if (!/^\d*$/.test(value)) return;

                        const numValue = parseInt(value);
                        if (numValue < 0) return;
                        setForm((f) => ({
                          ...f,
                          quantity: numValue,
                        }));
                        if (errors.quantity) {
                          setErrors((prev) => ({
                            ...prev,
                            quantity: undefined,
                          }));
                        }
                      }}
                      onKeyDown={(e) => {
                        // Prevent minus sign
                        if (e.key === "-") {
                          e.preventDefault();
                        }
                      }}
                      className={`border ${
                        errors.quantity ? "border-red-500" : "border-gray-300"
                      } rounded p-1 w-24 ml-2 focus:outline-none focus:ring-2 focus:ring-indigo-300`}
                      placeholder="Enter quantity"
                      disabled={form.quantityType !== "oneSize"}
                    />
                  </label>
                </div>
              </div>
            ))}

          <div className="p-4 rounded-lg border border-indigo-200 bg-white">
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
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Prevent negative numbers
                    if (parseFloat(value) < 0) return;
                    setForm((f) => ({ ...f, price: value }));
                    if (errors.price) {
                      setErrors((prev) => ({ ...prev, price: undefined }));
                    }
                  }}
                  onKeyDown={(e) => {
                    // Prevent minus sign
                    if (e.key === "-") {
                      e.preventDefault();
                    }
                  }}
                  className={`border ${
                    errors.price ? "border-red-500" : "border-gray-300"
                  } rounded p-1 w-24 ml-2 focus:outline-none focus:ring-2 focus:ring-indigo-300`}
                  placeholder="999999.99"
                  disabled={form.priceType !== "paid"}
                />
              </label>
              {errors.price && (
                <div className="text-xs text-red-500">{errors.price}</div>
              )}
            </div>
          </div>

          {/* <div className="p-4 rounded-lg border border-indigo-200 bg-white">
            <label className="font-semibold block mb-2">CTA Button*</label>
            <input
              className="border border-gray-300 rounded p-2 w-full"
              value={form.cta || "Buy Now"}
              onChange={(e) => setForm((f) => ({ ...f, cta: e.target.value }))}
              placeholder="Buy Now"
            />
          </div> */}

          <div className="flex justify-end mt-2">
            <button
              className="bg-green-500 hover:bg-green-600 text-white rounded px-8 py-2 font-semibold shadow"
              onClick={handleNext}
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
