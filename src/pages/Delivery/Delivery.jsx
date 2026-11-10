import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./Delivery.css";

const API = "http://localhost:5000/api/swapping";

const emptyAddress = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
  country: "India"
};

const emptyMeeting = { location: "", date: "", time: "" };

const states = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
];

const getUser = () => {
  try {
    return JSON.parse(
      localStorage.getItem("user") ||
      localStorage.getItem("googleUser") ||
      "null"
    );
  } catch {
    return null;
  }
};

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return String(value._id || value.id || value.userId || "");
};

const getStatus = (status) =>
  String(status || "").replace(/_/g, " ").toLowerCase();

const getError = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  "Something went wrong. Please try again.";

export default function Delivery() {
  const { swapId } = useParams();
  const navigate = useNavigate();

  const [swap, setSwap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [address, setAddress] = useState(emptyAddress);
  const [meeting, setMeeting] = useState(emptyMeeting);
  const [courier, setCourier] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [methodChoice, setMethodChoice] = useState("shipping");

  const user = useMemo(() => getUser(), []);
  const userId = getId(user?._id || user?.id || user?.userId);
  const requesterId = getId(swap?.requester);
  const ownerId = getId(swap?.owner);
  const role = userId && userId === requesterId ? "requester" : "owner";
  const otherRole = role === "requester" ? "owner" : "requester";

  const myAddress = swap?.shippingDetails?.[role] || {};
  const otherAddress = swap?.shippingDetails?.[otherRole] || {};
  const myTracking = swap?.trackingDetails?.[role] || {};
  const otherTracking = swap?.trackingDetails?.[otherRole] || {};
  const confirmations = swap?.deliveryConfirmations || {};
  const myReceived = Boolean(confirmations[role]);
  const otherReceived = Boolean(confirmations[otherRole]);
  const method = swap?.deliveryMethod || "";
  const methodConfirmed = Boolean(swap?.deliveryMethodConfirmedBy);
  const isAccepted = swap?.status === "accepted";
  const isCompleted = swap?.status === "completed";
  const isOwner = role === "owner";

  const loadSwap = useCallback(async (showLoader = false) => {
    if (!swapId) {
      setLoading(false);
      return;
    }

    if (showLoader) setLoading(true);

    try {
      const response = await axios.get(`${API}/${swapId}`);
      const data = response.data?.swap || response.data;

      if (!data?._id) {
        throw new Error("Swap details were not found.");
      }

      setSwap(data);

      const currentRole =
        userId && getId(data.requester) === userId
          ? "requester"
          : "owner";

      const savedAddress = data.shippingDetails?.[currentRole] || {};
      const savedMeeting = data.meetingDetails || {};
      const savedTracking = data.trackingDetails?.[currentRole] || {};

      setAddress({ ...emptyAddress, ...savedAddress });
      setMeeting({
        location: savedMeeting.location || "",
        date: savedMeeting.date
          ? String(savedMeeting.date).slice(0, 10)
          : "",
        time: savedMeeting.time || ""
      });
      setCourier(savedTracking.courier || "");
      setTrackingId(savedTracking.trackingId || "");
      setMethodChoice(data.deliveryMethod || "shipping");
    } catch (error) {
      toast.error(getError(error));
    } finally {
      setLoading(false);
    }
  }, [swapId, userId]);

  useEffect(() => {
    loadSwap(true);
  }, [loadSwap]);

  const runAction = async (action, body = {}) => {
    if (!userId) {
      toast.info("Please log in to continue.");
      navigate("/login");
      return null;
    }

    setSaving(action);

    try {
      const response = await axios.patch(
        `${API}/${action}/${swapId}`,
        { ...body, userId }
      );

      toast.success(response.data?.message || "Updated successfully.");
      await loadSwap();
      return response.data;
    } catch (error) {
      toast.error(getError(error));
      return null;
    } finally {
      setSaving("");
    }
  };

  const selectMethod = async () => {
    if (!isOwner) {
      toast.info("Only the item owner can choose the delivery method.");
      return;
    }

    if (!["shipping", "local"].includes(methodChoice)) {
      toast.error("Please select a delivery method.");
      return;
    }

    await runAction("delivery-method", {
      method: methodChoice,
      deliveryMethod: methodChoice
    });
  };

  const confirmMethod = async () => {
    if (!method) {
      toast.error("The delivery method has not been selected yet.");
      return;
    }

    if (isOwner) {
      toast.info("The other participant needs to confirm this method.");
      return;
    }

    await runAction("delivery-confirm");
  };

  const saveAddress = async (event) => {
    event.preventDefault();

    const clean = Object.fromEntries(
      Object.entries(address).map(([key, value]) => [
        key,
        typeof value === "string" ? value.trim() : value
      ])
    );

    const required = [
      "firstName", "lastName", "email", "phone",
      "street", "city", "state", "pincode"
    ];

    if (required.some((key) => !clean[key])) {
      toast.error("Please complete all required address fields.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(clean.phone)) {
      toast.error("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!/^\d{6}$/.test(clean.pincode)) {
      toast.error("Enter a valid 6-digit PIN code.");
      return;
    }

    await runAction("shipping-address", {
      address: clean,
      role
    });
  };

  const saveTracking = async (event) => {
    event.preventDefault();

    if (!myAddress.confirmed) {
      toast.info("Save your shipping address first.");
      return;
    }

    if (!courier.trim() || !trackingId.trim()) {
      toast.error("Enter both courier name and tracking ID.");
      return;
    }

    await runAction("tracking", {
      role,
      courier: courier.trim(),
      trackingId: trackingId.trim(),
      status: "Shipped"
    });
  };

  const saveMeeting = async (event) => {
    event.preventDefault();

    if (!meeting.location.trim() || !meeting.date || !meeting.time) {
      toast.error("Please complete the meetup details.");
      return;
    }

    if (new Date(`${meeting.date}T${meeting.time}`) < new Date()) {
      toast.error("Please select a future meetup time.");
      return;
    }

    await runAction("meeting-details", {
      ...meeting,
      role
    });
  };

  const confirmMeeting = async () => {
    if (!swap?.meetingDetails?.location ||
        !swap?.meetingDetails?.date ||
        !swap?.meetingDetails?.time) {
      toast.info("Meetup details are not complete yet.");
      return;
    }

    await runAction("meeting-confirm", { role });
  };

  const confirmReceived = async () => {
    if (myReceived) {
      toast.info("You have already confirmed receipt.");
      return;
    }

    const confirmed = window.confirm(
      "Have you actually received the item from the other participant?"
    );

    if (!confirmed) return;

    await runAction("delivery-received", { role });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="delivery-page">
          <div className="delivery-loading">
            <span className="delivery-spinner" />
            <p>Preparing your delivery workspace...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!swap) {
    return (
      <>
        <Navbar />
        <main className="delivery-page">
          <div className="delivery-empty">
            <div className="delivery-empty-icon">!</div>
            <h2>Delivery details unavailable</h2>
            <p>We couldn't load this swap. Please try again.</p>
            <button
              className="delivery-primary-btn"
              onClick={() => loadSwap(true)}
            >
              Try again
            </button>
            <button
              className="delivery-secondary-btn"
              onClick={() => navigate("/swap-requests")}
            >
              Back to swap requests
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!userId || ![requesterId, ownerId].includes(userId)) {
    return (
      <>
        <Navbar />
        <main className="delivery-page">
          <div className="delivery-empty">
            <div className="delivery-empty-icon">🔒</div>
            <h2>Participant access required</h2>
            <p>Please log in with the account involved in this swap.</p>
            <button
              className="delivery-primary-btn"
              onClick={() => navigate("/login")}
            >
              Log in
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const offeredItem =
    typeof swap.offeredItem === "object" ? swap.offeredItem : null;
  const requestedItem =
    typeof swap.requestedItem === "object" ? swap.requestedItem : null;
      const steps = [
    { label: "Method", done: Boolean(methodConfirmed) },
    {
      label: method === "local" ? "Meetup" : "Shipping",
      done: method === "local"
        ? Boolean(swap.meetingDetails?.confirmedBy)
        : Boolean(
            swap.shippingDetails?.requester?.confirmed &&
            swap.shippingDetails?.owner?.confirmed
          )
    },
    { label: "Receipt", done: myReceived && otherReceived }
  ];

  return (
    <>
      <Navbar />

      <main className="delivery-page">
        <div className="delivery-shell">
          <section className="delivery-hero">
            <div className="delivery-hero-copy">
              <div className="delivery-eyebrow">
                <span className="delivery-eyebrow-dot" />
                WEAREXCHANGE / SWAP MANAGEMENT
              </div>

              <h1>Make the exchange <span>seamless.</span></h1>
              <p>
                Coordinate your delivery, share the details yourself, and
                confirm the exchange when your item arrives.
              </p>

              <div className="delivery-hero-meta">
                <span className="delivery-meta-chip">
                  <span className="delivery-meta-dot" />
                  {isCompleted ? "Exchange completed" : "Swap delivery"}
                </span>
                <span className="delivery-meta-id">
                  Ref: {String(swap._id).slice(-8).toUpperCase()}
                </span>
              </div>
            </div>

            <div className="delivery-status-card">
              <div className="delivery-status-icon">
                {isCompleted ? "✓" : "↗"}
              </div>
              <span className="delivery-status-label">CURRENT STATUS</span>
              <strong>{isCompleted ? "Completed" : getStatus(swap.status)}</strong>
              <span className="delivery-status-caption">
                {isCompleted
                  ? "Both participants confirmed receipt."
                  : "Keep your swap details up to date."}
              </span>
              <div className="delivery-progress">
                {steps.map((step, index) => (
                  <div className="delivery-progress-step" key={step.label}>
                    <span className={step.done ? "done" : ""}>
                      {step.done ? "✓" : `0${index + 1}`}
                    </span>
                    <small>{step.label}</small>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {!isAccepted && !isCompleted && (
            <div className="delivery-notice">
              <div className="delivery-notice-icon">i</div>
              <div>
                <strong>Swap approval is required first</strong>
                <p>
                  Delivery actions become available after the swap request
                  has been accepted.
                </p>
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="delivery-completed-banner">
              <div className="delivery-completed-check">✓</div>
              <div>
                <strong>Your exchange is complete!</strong>
                <p>
                  Both participants have confirmed receiving their items.
                  Thank you for keeping clothing in circulation.
                </p>
              </div>
            </div>
          )}

          <section className="delivery-section">
            <div className="delivery-section-heading">
              <div>
                <span className="delivery-section-kicker">01 / PLAN</span>
                <h2>Choose your delivery method</h2>
                <p>The owner selects a method; the other participant confirms it.</p>
              </div>
              <span className="delivery-step">STEP 01</span>
            </div>

            <div className="delivery-method-grid">
              <button
                type="button"
                className={`delivery-method-card ${methodChoice === "shipping" ? "selected" : ""} ${method === "shipping" ? "active-method" : ""}`}
                onClick={() => setMethodChoice("shipping")}
                disabled={!isAccepted || isCompleted || !isOwner || Boolean(methodConfirmed)}
              >
                <span className="delivery-method-icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z" />
                    <path d="m3.5 7.7 8.5 4.5 8.5-4.5M12 12.2V21M7.5 5.3l9 4.6" />
                  </svg>
                </span>
                <span className="delivery-method-content">
                  <strong>Ship your items</strong>
                  <small>Exchange through a courier you arrange yourself.</small>
                  <span className="delivery-method-tag">TRACKING DETAILS</span>
                </span>
                <span className="delivery-method-radio">
                  {methodChoice === "shipping" ? "✓" : ""}
                </span>
              </button>

              <button
                type="button"
                className={`delivery-method-card ${methodChoice === "local" ? "selected" : ""} ${method === "local" ? "active-method" : ""}`}
                onClick={() => setMethodChoice("local")}
                disabled={!isAccepted || isCompleted || !isOwner || Boolean(methodConfirmed)}
              >
                <span className="delivery-method-icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                </span>
                <span className="delivery-method-content">
                  <strong>Exchange locally</strong>
                  <small>Meet in person at an agreed public location.</small>
                  <span className="delivery-method-tag">MEETUP DETAILS</span>
                </span>
                <span className="delivery-method-radio">
                  {methodChoice === "local" ? "✓" : ""}
                </span>
              </button>
            </div>

            {isAccepted && !isCompleted && isOwner && !methodConfirmed && (
              <div className="delivery-form-footer method-footer">
                <p className="delivery-muted">
                  {method
                    ? "You can update the selection before the other participant confirms."
                    : "Choose a method to start the delivery process."}
                </p>
                <button
                  className="delivery-primary-btn"
                  onClick={selectMethod}
                  disabled={Boolean(saving)}
                >
                  {saving === "delivery-method" ? "Saving..." : "Save delivery method"}
                  <span>→</span>
                </button>
              </div>
            )}

            {method && (
              <div className="delivery-confirmation-status">
                <span className={`delivery-status-dot ${methodConfirmed ? "is-success" : "is-pending"}`} />
                <div>
                  <strong>
                    {method === "shipping" ? "Shipping selected" : "Local meetup selected"}
                  </strong>
                  <p>
                    {methodConfirmed
                      ? "Delivery method confirmed."
                      : isOwner
                        ? "Waiting for the other participant to confirm."
                        : "Review the selected method and confirm to continue."}
                  </p>
                </div>
                {!methodConfirmed && !isOwner && isAccepted && (
                  <button
                    className="delivery-secondary-btn"
                    onClick={confirmMethod}
                    disabled={Boolean(saving)}
                  >
                    {saving === "delivery-confirm" ? "Confirming..." : "Confirm method"}
                  </button>
                )}
              </div>
            )}

            <div className="delivery-info-banner">
              <span className="delivery-info-symbol">i</span>
              <p>
                You fill in your own information. No one needs permission to
                enter or update their own address, tracking, or meetup details.
                Only the required confirmation is sent to the other participant.
              </p>
            </div>
          </section>

          {isAccepted && methodConfirmed && method === "shipping" && (
            <>
              <section className="delivery-section">
                <div className="delivery-section-heading">
                  <div>
                    <span className="delivery-section-kicker">02 / ADDRESS</span>
                    <h2>Your shipping address</h2>
                    <p>Each participant enters and maintains their own address.</p>
                  </div>
                  <span className="delivery-step">STEP 02</span>
                </div>

                <div className="delivery-address-overview">
                  <div className="delivery-mini-card">
                    <div className="delivery-mini-card-top">
                      <span className="delivery-mini-icon">⌂</span>
                      <span className={`delivery-pill ${myAddress.confirmed ? "is-success" : "is-pending"}`}>
                        {myAddress.confirmed ? "Address saved" : "Your address"}
                      </span>
                    </div>
                    <h3>Your address</h3>
                    <p>
                      {myAddress.street
                        ? `${myAddress.street}, ${myAddress.city}, ${myAddress.state} ${myAddress.pincode}`
                        : "Add your shipping address below."}
                    </p>
                  </div>

                  <div className="delivery-mini-card">
                    <div className="delivery-mini-card-top">
                      <span className="delivery-mini-icon">↗</span>
                      <span className={`delivery-pill ${otherAddress.confirmed ? "is-success" : "is-pending"}`}>
                        {otherAddress.confirmed ? "Address saved" : "Awaiting partner"}
                      </span>
                    </div>
                    <h3>Partner's address</h3>
                    <p>
                      {otherAddress.confirmed
                        ? "Your exchange partner has saved their address."
                        : "Your partner will add their own address."}
                    </p>
                  </div>
                </div>
                                <div className="delivery-panel">
                  <div className="delivery-panel-heading">
                    <span className="delivery-step-icon">01</span>
                    <div>
                      <h3>Shipping information</h3>
                      <p>Fill in your own delivery details.</p>
                    </div>
                  </div>

                  <form className="delivery-form" onSubmit={saveAddress}>
                    <div className="delivery-form-grid">
                      <label className="delivery-field">
                        <span>First name <b>*</b></span>
                        <input value={address.firstName} onChange={(e) => setAddress({ ...address, firstName: e.target.value })} placeholder="Enter first name" required disabled={isCompleted} />
                      </label>
                      <label className="delivery-field">
                        <span>Last name <b>*</b></span>
                        <input value={address.lastName} onChange={(e) => setAddress({ ...address, lastName: e.target.value })} placeholder="Enter last name" required disabled={isCompleted} />
                      </label>
                      <label className="delivery-field">
                        <span>Email address <b>*</b></span>
                        <input type="email" value={address.email} onChange={(e) => setAddress({ ...address, email: e.target.value })} placeholder="you@example.com" required disabled={isCompleted} />
                      </label>
                      <label className="delivery-field">
                        <span>Mobile number <b>*</b></span>
                        <input type="tel" inputMode="numeric" maxLength="10" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="10-digit mobile number" required disabled={isCompleted} />
                      </label>
                      <label className="delivery-field delivery-field-full">
                        <span>Street address <b>*</b></span>
                        <input value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} placeholder="House number, street, area" required disabled={isCompleted} />
                      </label>
                      <label className="delivery-field">
                        <span>State <b>*</b></span>
                        <select value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value, city: "" })} required disabled={isCompleted}>
                          <option value="">Select state</option>
                          {states.map((state) => <option key={state} value={state}>{state}</option>)}
                        </select>
                      </label>
                      <label className="delivery-field">
                        <span>City <b>*</b></span>
                        <input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} placeholder="Enter city" required disabled={isCompleted} />
                      </label>
                      <label className="delivery-field">
                        <span>PIN code <b>*</b></span>
                        <input inputMode="numeric" maxLength="6" value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })} placeholder="6-digit PIN code" required disabled={isCompleted} />
                      </label>
                      <label className="delivery-field">
                        <span>Country</span>
                        <input value="India" readOnly />
                      </label>
                    </div>

                    <div className="delivery-form-footer">
                      <span className="delivery-save-status">
                        <span className={`delivery-status-dot ${myAddress.confirmed ? "is-success" : "is-pending"}`} />
                        {myAddress.confirmed ? "Address saved successfully" : "Your address has not been saved"}
                      </span>
                      {!isCompleted && (
                        <button className="delivery-primary-btn" type="submit" disabled={Boolean(saving)}>
                          {saving === "shipping-address" ? "Saving..." : myAddress.confirmed ? "Update my address" : "Save my address"}
                          <span>→</span>
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </section>

              <section className="delivery-section">
                <div className="delivery-section-heading">
                  <div>
                    <span className="delivery-section-kicker">03 / TRACK</span>
                    <h2>Shipment details</h2>
                    <p>Enter the courier and tracking ID after arranging shipment.</p>
                  </div>
                  <span className="delivery-step">STEP 03</span>
                </div>

                <div className="delivery-tracking-grid">
                  <div className="delivery-tracking-card">
                    <span className="delivery-tracking-symbol">↗</span>
                    <div>
                      <span className="delivery-tracking-label">YOUR SHIPMENT</span>
                      <h3>{myTracking.courier || "Courier not added"}</h3>
                      <p className="delivery-tracking-number">
                        {myTracking.trackingId || "Tracking ID pending"}
                      </p>
                      <span className={`delivery-pill ${myTracking.status === "Shipped" || myTracking.status === "Delivered" ? "is-success" : "is-pending"}`}>
                        {myTracking.status || "Not Shipped"}
                      </span>
                    </div>
                  </div>

                  <div className="delivery-tracking-card">
                    <span className="delivery-tracking-symbol">□</span>
                    <div>
                      <span className="delivery-tracking-label">PARTNER'S SHIPMENT</span>
                      <h3>{otherTracking.courier || "Awaiting partner"}</h3>
                      <p className="delivery-tracking-number">
                        {otherTracking.trackingId || "Tracking ID pending"}
                      </p>
                      <span className={`delivery-pill ${otherTracking.status === "Shipped" || otherTracking.status === "Delivered" ? "is-success" : "is-pending"}`}>
                        {otherTracking.status || "Not Shipped"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="delivery-panel">
                  <div className="delivery-panel-heading">
                    <span className="delivery-step-icon">02</span>
                    <div>
                      <h3>Register your shipment</h3>
                      <p>Only enter tracking details after you have shipped the parcel.</p>
                    </div>
                  </div>

                  <form className="delivery-form tracking-form" onSubmit={saveTracking}>
                    <div className="delivery-form-grid">
                      <label className="delivery-field">
                        <span>Courier / delivery service <b>*</b></span>
                        <input value={courier} onChange={(e) => setCourier(e.target.value)} placeholder="e.g. India Post" required disabled={isCompleted || !myAddress.confirmed} />
                      </label>
                      <label className="delivery-field">
                        <span>Tracking ID <b>*</b></span>
                        <input value={trackingId} onChange={(e) => setTrackingId(e.target.value)} placeholder="Enter your tracking number" required disabled={isCompleted || !myAddress.confirmed} />
                      </label>
                    </div>
                    <div className="delivery-form-footer">
                      <span className="delivery-save-status">
                        <span className={`delivery-status-dot ${myTracking.status === "Shipped" || myTracking.status === "Delivered" ? "is-success" : "is-pending"}`} />
                        {myTracking.status || "Not Shipped"}
                      </span>
                      {!isCompleted && (
                        <button className="delivery-primary-btn" type="submit" disabled={Boolean(saving) || !myAddress.confirmed}>
                          {saving === "tracking" ? "Saving..." : "Save shipment details"}
                          <span>→</span>
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </section>
            </>
          )}

          {isAccepted && methodConfirmed && method === "local" && (
            <section className="delivery-section">
              <div className="delivery-section-heading">
                <div>
                  <span className="delivery-section-kicker">02 / MEET</span>
                  <h2>Plan your local meetup</h2>
                  <p>Suggest a convenient public place, date, and time.</p>
                </div>
                <span className="delivery-step">STEP 02</span>
              </div>

              <div className="delivery-panel">
                <div className="delivery-panel-heading">
                  <span className="delivery-step-icon">01</span>
                  <div>
                    <h3>Meetup details</h3>
                    <p>Enter or update the meetup information yourself.</p>
                  </div>
                </div>

                <form className="delivery-form" onSubmit={saveMeeting}>
                  <div className="delivery-form-grid">
                    <label className="delivery-field delivery-field-full">
                      <span>Meeting location <b>*</b></span>
                      <input value={meeting.location} onChange={(e) => setMeeting({ ...meeting, location: e.target.value })} placeholder="e.g. Main entrance of a public shopping centre" required disabled={isCompleted} />
                    </label>
                    <label className="delivery-field">
                      <span>Date <b>*</b></span>
                      <input type="date" min={new Date().toLocaleDateString("en-CA")} value={meeting.date} onChange={(e) => setMeeting({ ...meeting, date: e.target.value })} required disabled={isCompleted} />
                    </label>
                    <label className="delivery-field">
                      <span>Time <b>*</b></span>
                      <input type="time" value={meeting.time} onChange={(e) => setMeeting({ ...meeting, time: e.target.value })} required disabled={isCompleted} />
                    </label>
                  </div>

                  <div className="delivery-form-footer">
                    <span className="delivery-save-status">
                      <span className={`delivery-status-dot ${swap.meetingDetails?.confirmedBy ? "is-success" : "is-pending"}`} />
                      {swap.meetingDetails?.confirmedBy ? "Meetup confirmed" : "Waiting for confirmation"}
                    </span>
                    {!isCompleted && (
                      <button className="delivery-primary-btn" type="submit" disabled={Boolean(saving)}>
                        {saving === "meeting-details" ? "Saving..." : "Save meetup details"}
                        <span>→</span>
                      </button>
                    )}
                  </div>
                </form>

                {swap.meetingDetails?.location && (
                  <div className="delivery-meeting-summary">
                    <span className="delivery-meeting-pin">⌖</span>
                    <div>
                      <span className="delivery-tracking-label">PROPOSED MEETUP</span>
                      <h3>{swap.meetingDetails.location}</h3>
                      <p>
                        {swap.meetingDetails.date
                          ? new Date(swap.meetingDetails.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "long",
                              year: "numeric"
                            })
                          : "Date pending"}
                        {swap.meetingDetails.time ? ` · ${swap.meetingDetails.time}` : ""}
                      </p>
                    </div>
                    {!swap.meetingDetails.confirmedBy && !isOwner && !isCompleted && (
                      <button className="delivery-secondary-btn" onClick={confirmMeeting} disabled={Boolean(saving)}>
                        {saving === "meeting-confirm" ? "Confirming..." : "Confirm meetup"}
                      </button>
                    )}
                    {swap.meetingDetails.confirmedBy && (
                      <span className="delivery-pill is-success">Confirmed</span>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}          {isAccepted && methodConfirmed && (
            <section className="delivery-section">
              <div className="delivery-section-heading">
                <div>
                  <span className="delivery-section-kicker">04 / COMPLETE</span>
                  <h2>Receipt confirmation</h2>
                  <p>Confirm only after you have actually received your exchange item.</p>
                </div>
                <span className="delivery-step">FINAL STEP</span>
              </div>

              <div className="delivery-receipt-grid">
                <div className="delivery-receipt-card">
                  <div className="delivery-receipt-avatar">YOU</div>
                  <div className="delivery-receipt-copy">
                    <span className="delivery-tracking-label">YOUR CONFIRMATION</span>
                    <h3>{myReceived ? "Receipt confirmed" : "Have you received your item?"}</h3>
                    <p>
                      {myReceived
                        ? "Your receipt confirmation has been recorded."
                        : "Confirm once your partner's item has arrived or been handed over."}
                    </p>
                  </div>
                  <span className={`delivery-pill ${myReceived ? "is-success" : "is-pending"}`}>
                    {myReceived ? "Confirmed" : "Pending"}
                  </span>
                  {!myReceived && !isCompleted && (
                    <button
                      className="delivery-primary-btn delivery-receipt-btn"
                      onClick={confirmReceived}
                      disabled={Boolean(saving)}
                    >
                      {saving === "delivery-received" ? "Confirming..." : "I received my item"}
                      <span>✓</span>
                    </button>
                  )}
                </div>

                <div className="delivery-receipt-card">
                  <div className="delivery-receipt-avatar partner">↗</div>
                  <div className="delivery-receipt-copy">
                    <span className="delivery-tracking-label">PARTNER CONFIRMATION</span>
                    <h3>{otherReceived ? "Partner received the item" : "Awaiting partner"}</h3>
                    <p>
                      {otherReceived
                        ? "Your partner has confirmed receipt."
                        : "A notification should be sent when your partner confirms receipt."}
                    </p>
                  </div>
                  <span className={`delivery-pill ${otherReceived ? "is-success" : "is-pending"}`}>
                    {otherReceived ? "Confirmed" : "Pending"}
                  </span>
                </div>
              </div>

              {myReceived && !otherReceived && (
                <div className="delivery-notice">
                  <div className="delivery-notice-icon">✓</div>
                  <div>
                    <strong>Your confirmation has been recorded</strong>
                    <p>
                      The swap will complete after the other participant also
                      confirms receipt.
                    </p>
                  </div>
                </div>
              )}

              {myReceived && otherReceived && (
                <div className="delivery-completed-banner">
                  <div className="delivery-completed-check">✓</div>
                  <div>
                    <strong>Both items received — exchange complete</strong>
                    <p>Your swap is marked complete by the system.</p>
                  </div>
                </div>
              )}
            </section>
          )}

          <footer className="delivery-page-footer">
            <div className="delivery-footer-mark">W.</div>
            <div>
              <strong>Better exchanges, less waste.</strong>
              <p>Keep your details accurate and confirm receipt honestly.</p>
            </div>
            <button
              className="delivery-secondary-btn"
              onClick={() => navigate("/swap-requests")}
            >
              Back to swap requests
            </button>
          </footer>
        </div>
      </main>

      <Footer />
    </>
  );
}