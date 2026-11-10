
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./DeliveryOverview.css";

const API = "http://localhost:5000/api/swapping";

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

const getStatus = (swap, userId) => {
  const role =
    String(swap.requester?._id || swap.requester) === userId
      ? "requester"
      : "owner";

  const mine = swap.trackingDetails?.[role];
  const partner =
    swap.trackingDetails?.[role === "requester" ? "owner" : "requester"];

  if (swap.status === "completed") {
    return { label: "Completed", type: "completed", next: "Swap completed" };
  }

  if (!swap.deliveryMethod) {
    return { label: "Choose method", type: "action", next: "Choose delivery method" };
  }

  if (!swap.deliveryMethodConfirmedBy) {
    return { label: "Awaiting confirmation", type: "waiting", next: "Confirm delivery plan" };
  }

  if (swap.deliveryMethod === "local") {
    if (swap.meetingDetails?.confirmedBy) {
      return { label: "Meetup confirmed", type: "progress", next: "Complete your meetup" };
    }
    return { label: "Arrange meetup", type: "action", next: "Confirm meetup details" };
  }

  if (mine?.status === "Shipped" && partner?.status === "Shipped") {
    return { label: "Both parcels shipped", type: "progress", next: "Complete swap" };
  }

  return { label: "Shipping in progress", type: "progress", next: "Update shipping details" };
};

export default function DeliveryOverview() {
  const navigate = useNavigate();
  const user = getUser();
  const userId = String(user?.id || user?._id || "");

  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const loadSwaps = useCallback(async () => {
    if (!userId) {
      navigate("/login");
      return;
    }

    try {
      const res = await axios.get(`${API}/user-deliveries/${userId}`);
      setSwaps(Array.isArray(res.data) ? res.data : res.data.swaps || []);
    } catch (err) {
      console.error("Delivery overview error:", err);
      setSwaps([]);
    } finally {
      setLoading(false);
    }
  }, [userId, navigate]);

  useEffect(() => {
    loadSwaps();
  }, [loadSwaps]);

  const getStep = (swap) => {
    if (swap.status === "completed") return 4;
    if (!swap.deliveryMethod) return 1;
    if (!swap.deliveryMethodConfirmedBy) return 2;

    if (swap.deliveryMethod === "local") {
      return swap.meetingDetails?.confirmedBy ? 4 : 2;
    }

    const requesterShipped =
      swap.trackingDetails?.requester?.status === "Shipped";
    const ownerShipped = swap.trackingDetails?.owner?.status === "Shipped";

    if (requesterShipped && ownerShipped) return 4;
    return 3;
  };

  const openDelivery = (swap) => {
    const selectedByMe =
      String(swap.deliveryMethodSelectedBy || "") === userId;

    const needsConfirmation =
      swap.deliveryMethod &&
      !swap.deliveryMethodConfirmedBy &&
      !selectedByMe;

    navigate(
      needsConfirmation
        ? `/delivery-confirmation/${swap._id}`
        : `/delivery/${swap._id}`
    );
  };

  const summary = useMemo(() => {
    const completed = swaps.filter((s) => s.status === "completed").length;
    const waiting = swaps.filter((s) => {
      const status = getStatus(s, userId);
      return status.type === "waiting" || status.type === "action";
    }).length;

    return {
      total: swaps.length,
      completed,
      waiting,
      progress: swaps.length - completed
    };
  }, [swaps, userId]);

  const filteredSwaps = useMemo(() => {
    const query = search.trim().toLowerCase();

    return swaps.filter((swap) => {
      const status = getStatus(swap, userId);
      const id = String(swap._id || "").slice(-8).toLowerCase();
      const requested = swap.requestedItem?.title || "";
      const offered = swap.offeredItem?.title || "";

      const matchesSearch =
        !query ||
        id.includes(query) ||
        requested.toLowerCase().includes(query) ||
        offered.toLowerCase().includes(query) ||
        status.label.toLowerCase().includes(query);

      const matchesFilter =
        filter === "all" ||
        (filter === "progress" && status.type === "progress") ||
        (filter === "waiting" &&
          (status.type === "waiting" || status.type === "action")) ||
        (filter === "completed" && status.type === "completed");

      return matchesSearch && matchesFilter;
    });
  }, [swaps, search, filter, userId]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="delivery-loading">
          <div className="delivery-loading-mark">W</div>
          <p>Loading your exchanges...</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="delivery-page">
        <div className="delivery-shell">
          <section className="delivery-hero">
            <div className="delivery-hero-copy">
              <span className="delivery-kicker">
                <span className="delivery-kicker-dot" />
                WEAREXCHANGE / DELIVERY CENTER
              </span>

              <h1>
                Every swap has
                <br />
                <span>a next step.</span>
              </h1>

              <p>
                Keep track of your clothing exchanges, coordinate delivery
                and complete every swap in one place.
              </p>

              <div className="delivery-hero-note">
                <span className="delivery-shield">✓</span>
                Your exchanges, organised from start to finish
              </div>
            </div>

            <div className="delivery-hero-art" aria-hidden="true">
              <div className="delivery-art-ring delivery-art-ring-one" />
              <div className="delivery-art-ring delivery-art-ring-two" />
              <div className="delivery-art-box">
                <span>W</span>
                <div className="delivery-art-box-tape" />
              </div>
              <span className="delivery-art-orbit delivery-art-orbit-one">↗</span>
              <span className="delivery-art-orbit delivery-art-orbit-two">✓</span>
              <div className="delivery-art-caption">
                <span>SWAP</span>
                <strong>IN MOTION</strong>
              </div>
            </div>
          </section>

          <section className="delivery-summary" aria-label="Delivery summary">
            <article className="delivery-stat">
              <span className="delivery-stat-icon stat-icon-blue">↔</span>
              <div>
                <p>Total exchanges</p>
                <strong>{summary.total}</strong>
              </div>
              <span className="delivery-stat-index">01</span>
            </article>

            <article className="delivery-stat">
              <span className="delivery-stat-icon stat-icon-purple">◷</span>
              <div>
                <p>In progress</p>
                <strong>{summary.progress}</strong>
              </div>
              <span className="delivery-stat-index">02</span>
            </article>

            <article className="delivery-stat">
              <span className="delivery-stat-icon stat-icon-amber">!</span>
              <div>
                <p>Needs attention</p>
                <strong>{summary.waiting}</strong>
              </div>
              <span className="delivery-stat-index">03</span>
            </article>

            <article className="delivery-stat">
              <span className="delivery-stat-icon stat-icon-green">✓</span>
              <div>
                <p>Completed</p>
                <strong>{summary.completed}</strong>
              </div>
              <span className="delivery-stat-index">04</span>
            </article>
          </section>

          <section className="delivery-list-section">
            <div className="delivery-list-heading">
              <div>
                <span className="delivery-section-eyebrow">YOUR ACTIVITY</span>
                <h2>Your exchanges</h2>
                <p>Each swap, its current status and what to do next.</p>
              </div>
              <button
                className="delivery-request-link"
                onClick={() => navigate("/swap-requests")}
              >
                Swap requests <span>↗</span>
              </button>
            </div>

            <div className="delivery-toolbar">
              <label className="delivery-search">
                <span aria-hidden="true">⌕</span>
                <input
                  type="search"
                  placeholder="Search items or swap ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search exchanges"
                />
                {search && (
                  <button
                    type="button"
                    className="delivery-clear-search"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </label>

              <div className="delivery-filters" aria-label="Filter exchanges">
                {[
                  ["all", "All swaps"],
                  ["progress", "In progress"],
                  ["waiting", "Needs action"],
                  ["completed", "Completed"]
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={`delivery-filter ${filter === value ? "selected" : ""}`}
                    onClick={() => setFilter(value)}
                    aria-pressed={filter === value}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {swaps.length === 0 ? (
              <div className="delivery-empty">
                <div className="delivery-empty-icon">↔</div>
                <h3>Your exchange journey starts here</h3>
                <p>
                  Accepted swaps will appear here when you are ready to
                  arrange delivery.
                </p>
                <button
                  className="delivery-primary"
                  onClick={() => navigate("/swap-requests")}
                >
                  View swap requests <span>→</span>
                </button>
              </div>
            ) : filteredSwaps.length === 0 ? (
              <div className="delivery-empty delivery-empty-small">
                <div className="delivery-empty-icon">⌕</div>
                <h3>No matching exchanges</h3>
                <p>Try another search or choose a different status filter.</p>
                <button
                  className="delivery-reset-button"
                  onClick={() => {
                    setSearch("");
                    setFilter("all");
                  }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="delivery-overview-list">
                {filteredSwaps.map((swap) => {
                  const step = getStep(swap);
                  const status = getStatus(swap, userId);
                  const method =
                    swap.deliveryMethod === "shipping"
                      ? "Shipping"
                      : swap.deliveryMethod === "local"
                        ? "Local exchange"
                        : "Delivery method not selected";

                  const steps = [
                    "Choose method",
                    "Confirm plan",
                    "Send items",
                    "Complete swap"
                  ];

                  return (
                    <article className="delivery-overview-card" key={swap._id}>
                      <div className="delivery-card-top">
                        <div className="delivery-card-identity">
                          <span className="delivery-card-icon">↔</span>
                          <div>
                            <span className="delivery-card-overline">
                              SWAP ID / {String(swap._id).slice(-8).toUpperCase()}
                            </span>
                            <h3>{method}</h3>
                          </div>
                        </div>

                        <span className={`delivery-status status-${status.type}`}>
                          <span className="delivery-status-dot" />
                          {status.label}
                        </span>
                      </div>

                      <div className="delivery-item-pair">
                        {[swap.requestedItem, swap.offeredItem].map((item, i) => {
                          const image = item?.images?.[0];
                          const imageUrl = image
                            ? image.startsWith("http")
                              ? image
                              : `http://localhost:5000${image.startsWith("/") ? "" : "/"}${image}`
                            : "";

                          return (
                            <div className="delivery-item" key={item?._id || i}>
                              <div className="delivery-item-photo">
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={item?.title || "Clothing item"}
                                    loading="lazy"
                                  />
                                ) : (
                                  <span className="delivery-no-image">W</span>
                                )}
                                <span className="delivery-photo-number">
                                  0{i + 1}
                                </span>
                              </div>

                              <div className="delivery-item-details">
                                <span className="delivery-item-role">
                                  {i === 0 ? "YOU RECEIVE" : "YOU SEND"}
                                </span>
                                <h4>{item?.title || "Clothing item"}</h4>
                                <p>{item?.category || "Clothing"}</p>
                              </div>
                            </div>
                          );
                        })}

                        <div className="delivery-exchange-symbol" aria-hidden="true">
                          ⇄
                        </div>
                      </div>

                      <div className="delivery-progress-heading">
                        <span>EXCHANGE PROGRESS</span>
                        <strong>{Math.min(step, 4)} of 4 steps</strong>
                      </div>

                      <div className="delivery-progress-track">
                        {steps.map((label, i) => {
                          const done =
                            i + 1 < step || swap.status === "completed";
                          const active =
                            i + 1 === step && swap.status !== "completed";

                          return (
                            <div
                              key={label}
                              className={`delivery-progress-step ${done ? "done" : ""} ${active ? "current" : ""}`}
                            >
                              <span className="delivery-progress-circle">
                                {done ? "✓" : `0${i + 1}`}
                              </span>
                              <span className="delivery-progress-label">
                                {label}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="delivery-card-bottom">
                        <div className="delivery-next-step">
                          <span className="delivery-next-icon">↳</span>
                          <div>
                            <span>YOUR NEXT STEP</span>
                            <strong>{status.next}</strong>
                          </div>
                        </div>

                        <button
                          className="delivery-primary"
                          onClick={() => openDelivery(swap)}
                        >
                          {swap.status === "completed"
                            ? "View details"
                            : "Continue"}
                          <span>→</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <div className="delivery-list-footer">
              <span>
                Showing <strong>{filteredSwaps.length}</strong> of{" "}
                <strong>{swaps.length}</strong> exchanges
              </span>
              <span className="delivery-footer-trust">
                <span>✓</span> Thoughtful swaps. Better wardrobes.
              </span>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
