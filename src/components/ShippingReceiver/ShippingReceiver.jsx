
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API = "https://wearexchange-backend.onrender.com/api/swapping";
const IMAGE_API = "https://wearexchange-backend.onrender.com";

export default function ShippingReceiver({ swap, userId, role, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const otherRole = role === "requester" ? "owner" : "requester";
  const incoming = swap.trackingDetails?.[role === "requester" ? "owner" : "requester"];
  const received = swap.deliveryConfirmations?.[role];
  const item = role === "requester" ? swap.requestedItem : swap.offeredItem;

  const confirmReceipt = async () => {
    try {
      setLoading(true);
      await axios.patch(`${API}/delivery-received/${swap._id}`, { userId });
      toast.success("Parcel received successfully!");
      onUpdate?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not confirm receipt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="delivery-section">
      <div className="delivery-section-title">
        <div>
          <span className="delivery-small-label">INCOMING DELIVERY</span>
          <h2>Receive Your Parcel</h2>
          <p>Track the item coming from your swap partner.</p>
        </div>
        <span className={`delivery-status ${received ? "completed" : ""}`}>
          {received ? "Received" : incoming?.status || "Not Shipped"}
        </span>
      </div>

      <div className="delivery-form-card">
        <h3>Item You're Receiving</h3>
        <div className="delivery-product">
          <div className="delivery-product-image">
            {item?.images?.[0] ? (
              <img
                src={
                  item.images[0].startsWith("http")
                    ? item.images[0]
                    : `${IMAGE_API}${item.images[0]}`
                }
                alt={item.title || "Clothing item"}
              />
            ) : "👕"}
          </div>
          <div>
            <h3>{item?.title || "Clothing item"}</h3>
            <p>{item?.category || "Clothing"} {item?.size ? `• Size ${item.size}` : ""}</p>
          </div>
        </div>

        <div className="delivery-tracking-grid">
          <article>
            <span>COURIER</span>
            <b>{incoming?.courier || "Not added yet"}</b>
          </article>
          <article>
            <span>TRACKING ID</span>
            <b>{incoming?.trackingId || "Not added yet"}</b>
          </article>
          <article>
            <span>PARCEL STATUS</span>
            <b>{incoming?.status || "Not Shipped"}</b>
          </article>
        </div>

        {received ? (
          <div className="delivery-complete-message">
            <span>✓</span>
            <div>
              <b>Receipt confirmed</b>
              <p>Your confirmation has been saved.</p>
            </div>
          </div>
        ) : incoming?.status === "Shipped" ? (
          <button className="delivery-primary" disabled={loading} onClick={confirmReceipt}>
            {loading ? "Confirming..." : "Confirm Receipt ✓"}
          </button>
        ) : (
          <div className="delivery-waiting">
            <span>📦</span>
            <div>
              <b>Waiting for your partner to ship</b>
              <p>The receipt button will appear after the parcel is marked as shipped.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
