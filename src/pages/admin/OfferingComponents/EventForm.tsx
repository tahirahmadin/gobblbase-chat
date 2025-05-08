import React from "react";

type EventSlot = {
  date: string;
  start: string;
  end: string;
  seatType: "unlimited" | "limited";
  seats: string;
};

type EventFormType = {
  eventName: string;
  eventType: string;
  eventTypeOther: string;
  description: string;
  descriptionEnabled: boolean;
  timeZone: string;
  slots: EventSlot[];
  thumbnail: File | null;
  thumbnailUrl: string;
  images: (File | null)[];
  imagesUrl: string[];
  priceType: string;
  price: string;
  cta: string;
};

type EventFormProps = {
  form: EventFormType;
  setForm: React.Dispatch<React.SetStateAction<EventFormType>>;
  onNext: () => void;
};

const eventTypes = ["Event", "1:1 Session", "Workshop", "Webinar"];
const timeZones = [
  "Asia/Calcutta (GMT +5:30)",
  "America/New_York (GMT -4:00)",
  "Europe/London (GMT +1:00)",
  "Asia/Singapore (GMT +8:00)",
  // Add more as needed
];

const EventForm: React.FC<EventFormProps> = ({ form, setForm, onNext }) => {
  const slot = form.slots[0] || {
    date: "",
    start: "",
    end: "",
    seatType: "unlimited" as const,
    seats: "",
  };

  return (
    <div className="bg-indigo-100 rounded-2xl p-8 mt-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Side */}
        <div className="flex-1 flex flex-col gap-2">
          <label className="font-semibold">Event Name *</label>
          <input
            name="eventName"
            maxLength={50}
            value={form.eventName}
            onChange={(e) =>
              setForm((f) => ({ ...f, eventName: e.target.value }))
            }
            className="w-full border border-gray-300 rounded p-2 mt-1 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Type your product title..."
          />
          <div className="text-xs text-gray-500 text-right mb-2">
            {form.eventName?.length || 0}/50
          </div>
          <label className="font-semibold">Event Type*</label>
          <div className="flex gap-2 mb-2">
            {eventTypes.map((type) => (
              <button
                key={type}
                type="button"
                className={`px-3 py-1 rounded border text-xs font-semibold transition-colors duration-150 ${
                  form.eventType === type
                    ? "bg-indigo-500 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-indigo-100"
                }`}
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    eventType: type,
                    eventTypeOther: "",
                  }))
                }
              >
                {type}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs">Other, specify:</span>
            <input
              type="text"
              value={form.eventTypeOther}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  eventType: "Other",
                  eventTypeOther: e.target.value,
                }))
              }
              className="border border-gray-300 rounded p-1 w-40"
              placeholder="Other type..."
            />
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
              placeholder="Describe your product..."
              rows={3}
              disabled={!form.descriptionEnabled}
            />
            <div className="flex items-center ml-2">
              <input
                type="checkbox"
                checked={form.descriptionEnabled}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    descriptionEnabled: e.target.checked,
                  }))
                }
                className="accent-green-500 w-5 h-5"
              />
            </div>
          </div>
          <div className="flex gap-4 mt-2">
            {/* Thumbnail */}
            <div>
              <label className="font-semibold">Thumbnail</label>
              <div className="w-24 h-24 bg-white border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer relative mt-1">
                {form.thumbnailUrl ? (
                  <img
                    src={form.thumbnailUrl}
                    alt="thumb"
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <span className="text-gray-400 text-2xl">400x400</span>
                )}
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
                      <img
                        src={form.imagesUrl[i]}
                        alt={`img${i}`}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <span className="text-gray-400 text-2xl">400x400</span>
                    )}
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
                    <button
                      className="absolute bottom-1 left-1 bg-white border border-gray-300 rounded p-1 text-xs"
                      type="button"
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
                    >
                      <span role="img" aria-label="delete">
                        ❌
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Right Side */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Set Time Zone */}
          <div className="mb-2">
            <label className="font-semibold block mb-2">Set Time Zone</label>
            <select
              className="border border-gray-300 rounded p-2 w-full"
              value={form.timeZone}
              onChange={(e) =>
                setForm((f) => ({ ...f, timeZone: e.target.value }))
              }
            >
              {timeZones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
          {/* Set Slots */}
          <div className="mb-2 p-4 rounded-lg border border-indigo-200 bg-white">
            <label className="font-semibold block mb-2">Set Slots</label>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-center mb-2">
                <span className="text-xs">Date</span>
                <input
                  type="text"
                  placeholder="DDMMYYYY"
                  value={slot.date}
                  onChange={(e) =>
                    setForm((f) => {
                      const slots = [...f.slots];
                      slots[0] = { ...slots[0], date: e.target.value };
                      return { ...f, slots };
                    })
                  }
                  className="border border-gray-300 rounded p-1 w-24"
                />
                <span className="text-xs ml-2">Start</span>
                <input
                  type="text"
                  placeholder="hhmm"
                  value={slot.start}
                  onChange={(e) =>
                    setForm((f) => {
                      const slots = [...f.slots];
                      slots[0] = { ...slots[0], start: e.target.value };
                      return { ...f, slots };
                    })
                  }
                  className="border border-gray-300 rounded p-1 w-16"
                />
                <span className="text-xs ml-2">End</span>
                <input
                  type="text"
                  placeholder="hhmm"
                  value={slot.end}
                  onChange={(e) =>
                    setForm((f) => {
                      const slots = [...f.slots];
                      slots[0] = { ...slots[0], end: e.target.value };
                      return { ...f, slots };
                    })
                  }
                  className="border border-gray-300 rounded p-1 w-16"
                />
              </div>
              <div className="flex gap-4 items-center mb-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="seatType"
                    value="unlimited"
                    checked={slot.seatType === "unlimited"}
                    onChange={(e) =>
                      setForm((f) => {
                        const slots = [...f.slots];
                        slots[0] = { ...slots[0], seatType: "unlimited" };
                        return { ...f, slots };
                      })
                    }
                    className="accent-green-500 w-5 h-5"
                  />
                  <span className="text-gray-700">Unlimited</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="seatType"
                    value="limited"
                    checked={slot.seatType === "limited"}
                    onChange={(e) =>
                      setForm((f) => {
                        const slots = [...f.slots];
                        slots[0] = { ...slots[0], seatType: "limited" };
                        return { ...f, slots };
                      })
                    }
                    className="accent-green-500 w-5 h-5"
                  />
                  <span className="text-gray-700">Limited Seats</span>
                  <input
                    type="text"
                    placeholder="100"
                    value={slot.seats}
                    onChange={(e) =>
                      setForm((f) => {
                        const slots = [...f.slots];
                        slots[0] = { ...slots[0], seats: e.target.value };
                        return { ...f, slots };
                      })
                    }
                    className="border border-gray-300 rounded p-1 w-16 ml-2"
                    disabled={slot.seatType !== "limited"}
                  />
                </label>
                <button
                  className="ml-4 px-2 py-1 border border-gray-300 rounded bg-white text-xs"
                  type="button"
                  // onClick={...} // Add slot logic in the future
                >
                  ADD SLOT
                </button>
              </div>
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
                  placeholder="999999.99"
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
              <option>Reserve your Spot</option>
              <option>Register</option>
              <option>Book Now</option>
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
};

export default EventForm;
