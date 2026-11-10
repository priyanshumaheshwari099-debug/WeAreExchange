
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, CheckCircle2, Clock3, MapPin, Package, Truck, ShieldCheck, RefreshCw } from "lucide-react";
import "./Delivery Confirmation.css";

const API = "http://localhost:5000";

const getSavedUser = () => {
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

const getId = (value) =>
  String(value?._id || value?.id || value || "");

export default function DeliveryConfirmation() {
  const { swapId } = useParams();
  const navigate = useNavigate();
  const user = getSavedUser();
  const userId = getId(user?._id || user?.id);

  const [swap, setSwap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  const loadSwap = async () => {
    try {
      setError("");
      const res = await axios.get(`${API}/api/swapping/${swapId}`);
      const data = res.data?.swap || res.data;
      setSwap(data);
    } catch (err) {
      setError(err.response?.data?.message || "Delivery details load nahi ho sake. Dobara try karo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSwap();
  }, [swapId]);

  const selectedByMe =
    getId(swap?.deliveryMethodSelectedBy) === userId;

  const alreadyConfirmed = Boolean(swap?.deliveryMethodConfirmedBy);
  const isShipping = String(swap?.deliveryMethod || "").toLowerCase().includes("ship");

  const handleConfirm = async () => {
    if (!userId) {
      setError("Please login again to confirm the delivery method.");
      return;
    }

    try {
      setConfirming(true);
      setError("");

      await axios.patch(
        `${API}/api/swapping/delivery-confirm/${swapId}`,
        { userId }
      );

      await loadSwap();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Confirmation nahi ho payi. Dobara try karo."
      );
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="dc-page">
        <div className="dc-state">
          <RefreshCw className="dc-spin" size={28} />
          <h2>Loading confirmation...</h2>
          <p>Delivery details check ki ja rahi hain.</p>
        </div>
      </div>
    );
  }

  if (!swap || error && !swap) {
    return (
      <div className="dc-page">
        <div className="dc-state">
          <Package size={42} />
          <h2>Details load nahi hui</h2>
          <p>{error || "Swap request nahi mili."}</p>
          <button className="dc-primary" onClick={() => navigate("/delivery")}>
            Back to Deliveries
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="dc-page">
      <div className="dc-shell">
        <button
          className="dc-back"
          onClick={() => navigate("/delivery")}
        >
          <ArrowLeft size={18} /> Back to deliveries
        </button>

        <section className="dc-card">
          <div className="dc-top">
            <div className="dc-brand-icon">
              {isShipping ? <Truck size={30} /> : <MapPin size={30} />}
            </div>
            <span className={`dc-pill ${alreadyConfirmed ? "dc-pill-success" : "dc-pill-pending"}`}>
              {alreadyConfirmed ? "Confirmed" : "Action required"}
            </span>
          </div>

          <p className="dc-eyebrow">WEAREXCHANGE · DELIVERY SETUP</p>
          <h1>
            {alreadyConfirmed
              ? "Delivery method confirmed"
              : selectedByMe
                ? "Waiting for confirmation"
                : "Confirm your delivery method"}
          </h1>
          <p className="dc-subtitle">
            {alreadyConfirmed
              ? "Both users can now continue to the delivery details."
              : selectedByMe
                ? "You selected this method. The other participant needs to confirm before you continue."
                : "The other participant selected a delivery method for this swap. Please review and confirm it."}
          </p>

          <div className="dc-method-card">
            <div className="dc-method-icon">
              {isShipping ? <Truck size={27} /> : <MapPin size={27} />}
            </div>
            <div className="dc-method-copy">
              <span className="dc-label">SELECTED DELIVERY METHOD</span>
              <h2>{isShipping ? "Ship Items" : "Exchange Locally"}</h2>
              <p>
                {isShipping
                  ? "The participants will arrange shipment of their items."
                  : "The participants will coordinate a local handover."}
              </p>
            </div>
            <CheckCircle2 className="dc-method-check" size={23} />
          </div>

          <div className="dc-info-row">
            <div className="dc-info-icon"><ShieldCheck size={20} /></div>
            <div>
              <strong>Both participants must agree</strong>
              <p>The delivery process continues after the other participant confirms this method.</p>
            </div>
          </div>

          {error && (
            <div className="dc-error" role="alert">{error}</div>
          )}

          {alreadyConfirmed ? (
            <div className="dc-status dc-status-success">
              <CheckCircle2 size={21} />
              <div>
                <strong>Confirmation complete</strong>
                <p>Delivery method has been confirmed.</p>
              </div>
            </div>
          ) : selectedByMe ? (
            <div className="dc-status">
              <Clock3 size={21} />
              <div>
                <strong>Waiting for the other participant</strong>
                <p>They need to open this page and confirm the selected method.</p>
              </div>
            </div>
          ) : (
            <div className="dc-actions">
              <button
                className="dc-primary"
                onClick={handleConfirm}
                disabled={confirming}
              >
                {confirming ? "Confirming..." : "Confirm delivery method"}
                {!confirming && <CheckCircle2 size={19} />}
              </button>
              <p>Only confirm if you agree with the selected method.</p>
            </div>
          )}

          {alreadyConfirmed && (
            <button
              className="dc-primary dc-continue"
              onClick={() => navigate(`/delivery/${swapId}`)}
            >
              Continue to delivery details
              <ArrowLeft className="dc-arrow-right" size={19} />
            </button>
          )}

          <div className="dc-footer">
            <span><ShieldCheck size={15} /> Secure swap process</span>
            <span>Swap ID: {String(swapId).slice(-8)}</span>
          </div>
        </section>
      </div>
    </main>
  );
}
