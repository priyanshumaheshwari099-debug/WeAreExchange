
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeftRight,
  ArrowRight,
  CheckCircle2,
  PackageCheck,
  Truck,
  MapPin,
  CalendarDays,
  Search,
  Shirt,
  Sparkles,
  Clock3,
  ChevronRight,
  RefreshCw,
  ShieldCheck,
  Box,
  Menu,
  X
} from "lucide-react";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./MySwaps.css";

const API = "http://localhost:5000";

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

const getName = (user) => {
  if (!user) return "Member";
  if (typeof user === "string") return user;
  return user.name || user.email || "Member";
};

const getImage = (item) => {
  const image = item?.images?.[0] || item?.image;
  if (!image) return "";
  if (typeof image === "object") {
    return image.url || image.secure_url || "";
  }
  return image.startsWith("http") ? image : `${API}${image}`;
};

const formatDate = (date) => {
  if (!date) return "Date unavailable";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Date unavailable";
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const getItemTitle = (item) => item?.title || item?.name || "Clothing item";

const getItemTags = (item) =>
  [item?.category, item?.size, item?.condition]
    .filter(Boolean)
    .slice(0, 3);

export default function MySwaps() {
  const navigate = useNavigate();
  const user = getUser();
  const userId = user?.id || user?._id;

  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchSwaps = async () => {
      if (!userId) {
        setSwaps([]);
        setLoading(false);
        setError("Please log in to view your completed swaps.");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API}/api/swapping/completed/${encodeURIComponent(userId)}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Unable to load completed swaps.");
        }

        const records = Array.isArray(data)
          ? data
          : Array.isArray(data?.swaps)
            ? data.swaps
            : [];

        if (!cancelled) {
          setSwaps(records.filter((swap) => swap.status === "completed"));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message ||
            "Unable to connect to the server. Please try again."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSwaps();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const shippingCount = swaps.filter(
    (swap) => swap.deliveryMethod === "shipping"
  ).length;

  const localCount = swaps.filter(
    (swap) => swap.deliveryMethod === "local"
  ).length;

  const filteredSwaps = useMemo(() => {
    const term = search.trim().toLowerCase();

    return swaps.filter((swap) => {
      const method = swap.deliveryMethod || "unknown";

      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "shipping" && method === "shipping") ||
        (activeFilter === "local" && method === "local");

      const searchableText = [
        swap._id,
        getName(swap.requester),
        getName(swap.owner),
        getItemTitle(swap.offeredItem),
        getItemTitle(swap.requestedItem),
        swap.deliveryMethod
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesFilter && searchableText.includes(term);
    });
  }, [swaps, search, activeFilter]);

  const getMethodLabel = (method) => {
    if (method === "shipping") return "Ship items";
    if (method === "local") return "Local exchange";
    return "Delivery method";
  };

  const getRoleData = (swap, role) => {
    const details = swap.shippingDetails?.[role];
    const tracking = swap.trackingDetails?.[role];

    return {
      address: details,
      tracking
    };
  };

  const getConfirmation = (swap, role) => {
    return Boolean(swap.deliveryConfirmations?.[role]);
  };

  const renderItem = (item, label, number) => {
    const image = getImage(item);
    const tags = getItemTags(item);

    return (
      <div className="ms-item" key={`${label}-${number}`}>
        <div className="ms-item-image">
          {image ? (
            <img
              src={image}
              alt={getItemTitle(item)}
              loading="lazy"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="ms-item-placeholder">
              <Shirt size={32} strokeWidth={1.4} />
            </div>
          )}
          <span className="ms-item-number">{number}</span>
        </div>

        <div className="ms-item-info">
          <span className="ms-item-label">{label}</span>
          <h3>{getItemTitle(item)}</h3>

          {item?.brand && <p className="ms-item-brand">{item.brand}</p>}

          <div className="ms-item-tags">
            {tags.length ? (
              tags.map((tag, index) => (
                <span key={`${tag}-${index}`}>{tag}</span>
              ))
            ) : (
              <span>Pre-loved fashion</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderLocalDetails = (swap) => {
    const meeting = swap.meetingDetails || {};

    return (
      <div className="ms-details-grid">
        <div className="ms-detail-line">
          <span className="ms-detail-icon"><MapPin size={17} /></span>
          <div>
            <small>Meeting location</small>
            <strong>{meeting.location || "Location not recorded"}</strong>
          </div>
        </div>

        <div className="ms-detail-line">
          <span className="ms-detail-icon"><CalendarDays size={17} /></span>
          <div>
            <small>Meeting date</small>
            <strong>{formatDate(meeting.date)}</strong>
          </div>
        </div>

        <div className="ms-detail-line">
          <span className="ms-detail-icon"><Clock3 size={17} /></span>
          <div>
            <small>Meeting time</small>
            <strong>{meeting.time || "Time not recorded"}</strong>
          </div>
        </div>
      </div>
    );
  };

  const renderShippingDetails = (swap) => {
    const requester = getRoleData(swap, "requester");
    const owner = getRoleData(swap, "owner");

    const shipmentCards = [
      {
        key: "requester",
        title: "Requester shipment",
        person: getName(swap.requester),
        data: requester
      },
      {
        key: "owner",
        title: "Owner shipment",
        person: getName(swap.owner),
        data: owner
      }
    ];

    return (
      <div className="ms-shipping-grid">
        {shipmentCards.map((card) => {
          const address = card.data.address || {};
          const tracking = card.data.tracking || {};

          return (
            <div className="ms-shipment-card" key={card.key}>
              <div className="ms-shipment-title">
                <span className="ms-shipment-icon">
                  <Box size={17} />
                </span>
                <div>
                  <strong>{card.title}</strong>
                  <small>{card.person}</small>
                </div>
              </div>

              <div className="ms-shipment-detail">
                <span>Courier</span>
                <strong>{tracking.courier || "Not recorded"}</strong>
              </div>

              <div className="ms-shipment-detail">
                <span>Tracking ID</span>
                <strong className="ms-tracking-value">
                  {tracking.trackingId || "Not recorded"}
                </strong>
              </div>

              <div className="ms-shipment-detail">
                <span>Shipment status</span>
                <strong>
                  {tracking.status
                    ? String(tracking.status).replaceAll("_", " ")
                    : "Completed"}
                </strong>
              </div>

              {(address.city || address.state || address.pincode) && (
                <div className="ms-shipment-address">
                  <MapPin size={14} />
                  <span>
                    {[address.city, address.state, address.pincode]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="ms-page">
      <Navbar />

      <main className="ms-main">
        <section className="ms-hero">
          <div className="ms-hero-copy">
            <div className="ms-eyebrow">
              <span className="ms-eyebrow-line" />
              YOUR EXCHANGE JOURNEY
            </div>

            <h1>
              Good clothes deserve
              <br />
              <span>another chapter.</span>
            </h1>

            <p>
              Every completed swap gives clothing a new life. Revisit your
              exchanges and see the impact of sharing fashion responsibly.
            </p>

            <div className="ms-hero-actions">
              <Link to="/browse" className="ms-primary-button">
                Explore clothing <ArrowRight size={17} />
              </Link>

              <div className="ms-completed-caption">
                <CheckCircle2 size={17} />
                <span>Your completed exchanges</span>
              </div>
            </div>
          </div>

          <div className="ms-hero-art">
            <div className="ms-art-topline">
              <span><Sparkles size={15} /> CIRCULAR FASHION</span>
              <span>01 — 03</span>
            </div>

            <div className="ms-art-circle ms-art-circle-one" />
            <div className="ms-art-circle ms-art-circle-two" />

            <div className="ms-art-clothing">
              <div className="ms-art-piece ms-art-piece-one">
                <Shirt size={76} strokeWidth={1.1} />
              </div>
              <div className="ms-art-piece ms-art-piece-two">
                <Shirt size={104} strokeWidth={1.1} />
              </div>
              <div className="ms-art-piece ms-art-piece-three">
                <Shirt size={83} strokeWidth={1.1} />
              </div>
            </div>

            <div className="ms-art-bottom">
              <div>
                <span>THE BETTER WAY TO DRESS</span>
                <strong>Swap. Rewear. Repeat.</strong>
              </div>
              <div className="ms-art-arrow">
                <ArrowLeftRight size={23} />
              </div>
            </div>
          </div>
        </section>

        <section className="ms-overview">
          <div className="ms-overview-heading">
            <div>
              <span className="ms-section-label">YOUR ACTIVITY</span>
              <h2>Your exchange overview</h2>
            </div>
            <span className="ms-overview-note">
              <ShieldCheck size={16} /> Completed successfully
            </span>
          </div>

          <div className="ms-stats">
            <article className="ms-stat-card ms-stat-total">
              <div className="ms-stat-top">
                <span className="ms-stat-icon"><ArrowLeftRight size={21} /></span>
                <span className="ms-stat-index">01</span>
              </div>
              <span className="ms-stat-number">
                {loading ? "—" : swaps.length.toString().padStart(2, "0")}
              </span>
              <span className="ms-stat-label">Total completed swaps</span>
              <div className="ms-stat-bottom">
                <span>Successfully exchanged</span>
                <CheckCircle2 size={16} />
              </div>
            </article>

            <article className="ms-stat-card">
              <div className="ms-stat-top">
                <span className="ms-stat-icon ms-stat-icon-blue"><Truck size={21} /></span>
                <span className="ms-stat-index">02</span>
              </div>
              <span className="ms-stat-number">
                {loading ? "—" : shippingCount.toString().padStart(2, "0")}
              </span>
              <span className="ms-stat-label">Shipping exchanges</span>
              <div className="ms-stat-bottom">
                <span>Sent between members</span>
                <PackageCheck size={16} />
              </div>
            </article>

            <article className="ms-stat-card">
              <div className="ms-stat-top">
                <span className="ms-stat-icon ms-stat-icon-green"><MapPin size={21} /></span>
                <span className="ms-stat-index">03</span>
              </div>
              <span className="ms-stat-number">
                {loading ? "—" : localCount.toString().padStart(2, "0")}
              </span>
              <span className="ms-stat-label">Local exchanges</span>
              <div className="ms-stat-bottom">
                <span>Person-to-person swaps</span>
                <CheckCircle2 size={16} />
              </div>
            </article>
          </div>
        </section>

        <section className="ms-history">
          <div className="ms-history-heading">
            <div>
              <span className="ms-section-label">THE GOOD STUFF</span>
              <h2>Your swap collection</h2>
              <p>Clothing exchanged, connections made, waste reduced.</p>
            </div>

            <div className="ms-history-count">
              <span>{loading ? "—" : filteredSwaps.length}</span>
              <small>{filteredSwaps.length === 1 ? "EXCHANGE" : "EXCHANGES"}</small>
            </div>
          </div>

          <div className="ms-toolbar">
            <label className="ms-search">
              <Search size={19} />
              <input
                type="search"
                placeholder="Search items, members or swap ID..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="ms-clear-search"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </label>

            <div className="ms-filters" aria-label="Filter exchanges">
              {[
                { value: "all", label: "All swaps" },
                { value: "shipping", label: "Shipping" },
                { value: "local", label: "Local" }
              ].map((filter) => (
                <button
                  type="button"
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={activeFilter === filter.value ? "ms-filter-active" : ""}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="ms-state-card">
              <RefreshCw className="ms-spin" size={30} />
              <h3>Gathering your exchanges</h3>
              <p>Your completed swap collection is loading.</p>
            </div>
          ) : error ? (
            <div className="ms-state-card ms-state-error">
              <div className="ms-state-icon"><RefreshCw size={26} /></div>
              <h3>We couldn't load your swaps</h3>
              <p>{error}</p>
              <button
                type="button"
                className="ms-primary-button"
                onClick={() => window.location.reload()}
              >
                Try again <RefreshCw size={16} />
              </button>
            </div>
          ) : filteredSwaps.length === 0 ? (
            <div className="ms-empty-state">
              <div className="ms-empty-illustration">
                <div className="ms-empty-circle">
                  <Shirt size={43} strokeWidth={1.2} />
                </div>
                <span className="ms-empty-spark ms-empty-spark-one">✳</span>
                <span className="ms-empty-spark ms-empty-spark-two">✦</span>
              </div>

              <span className="ms-section-label">
                {search || activeFilter !== "all" ? "NO MATCHES FOUND" : "A FRESH START"}
              </span>

              <h3>
                {search || activeFilter !== "all"
                  ? "Nothing matches your search"
                  : "Your next great find is waiting"}
              </h3>

              <p>
                {search || activeFilter !== "all"
                  ? "Try another keyword or choose a different filter."
                  : "Explore pre-loved pieces, find your next favourite, and make your first exchange."}
              </p>

              {search || activeFilter !== "all" ? (
                <button
                  type="button"
                  className="ms-primary-button"
                  onClick={() => {
                    setSearch("");
                    setActiveFilter("all");
                  }}
                >
                  Clear filters <RefreshCw size={16} />
                </button>
              ) : (
                <Link to="/browse" className="ms-primary-button">
                  Find your next swap <ArrowRight size={17} />
                </Link>
              )}
            </div>
          ) : (
            <div className="ms-swap-list">
              {filteredSwaps.map((swap, index) => {
                const requesterConfirmed = getConfirmation(swap, "requester");
                const ownerConfirmed = getConfirmation(swap, "owner");

                const requesterName = getName(swap.requester);
                const ownerName = getName(swap.owner);

                return (
                  <article className="ms-swap-card" key={swap._id || index}>
                    <div className="ms-card-header">
                      <div className="ms-card-identity">
                        <span className="ms-card-number">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <span className="ms-card-kicker">COMPLETED EXCHANGE</span>
                          <h3>Swap #{String(swap._id || "").slice(-6).toUpperCase() || "—"}</h3>
                        </div>
                      </div>

                      <span className="ms-completed-pill">
                        <CheckCircle2 size={15} /> Completed
                      </span>
                    </div>

                    <div className="ms-participants">
                      <div className="ms-person">
                        <span className="ms-person-avatar">
                          {requesterName.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <small>REQUESTER</small>
                          <strong>{requesterName}</strong>
                        </div>
                      </div>

                      <div className="ms-exchange-symbol">
                        <ArrowLeftRight size={20} />
                      </div>

                      <div className="ms-person ms-person-owner">
                        <span className="ms-person-avatar ms-person-avatar-owner">
                          {ownerName.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <small>ITEM OWNER</small>
                          <strong>{ownerName}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="ms-items-heading">
                      <span>THE ITEMS</span>
                      <span className="ms-items-count">02 PIECES EXCHANGED</span>
                    </div>

                    <div className="ms-items-grid">
                      {renderItem(swap.offeredItem, "REQUESTER GAVE", "A")}
                      <div className="ms-items-exchange">
                        <ArrowLeftRight size={22} />
                      </div>
                      {renderItem(swap.requestedItem, "REQUESTER RECEIVED", "B")}
                    </div>

                    <div className="ms-delivery-block">
                      <div className="ms-delivery-heading">
                        <div className="ms-delivery-title-wrap">
                          <span className="ms-delivery-icon">
                            {swap.deliveryMethod === "local"
                              ? <MapPin size={19} />
                              : <Truck size={19} />}
                          </span>
                          <div>
                            <span className="ms-section-label">EXCHANGE METHOD</span>
                            <h4>{getMethodLabel(swap.deliveryMethod)}</h4>
                          </div>
                        </div>

                        <span className="ms-method-complete">
                          <CheckCircle2 size={15} /> Finalized
                        </span>
                      </div>

                      {swap.deliveryMethod === "local"
                        ? renderLocalDetails(swap)
                        : swap.deliveryMethod === "shipping"
                          ? renderShippingDetails(swap)
                          : (
                            <p className="ms-missing-details">
                              Delivery details were not recorded for this exchange.
                            </p>
                          )}
                    </div>

                    <div className="ms-card-footer">
                      <div className="ms-receipt-status">
                        <span className="ms-receipt-heading">
                          <ShieldCheck size={17} /> RECEIPT CONFIRMATION
                        </span>

                        <div className="ms-receipt-tags">
                          <span className={requesterConfirmed ? "ms-confirmed" : ""}>
                            <CheckCircle2 size={14} />
                            Requester {requesterConfirmed ? "confirmed" : "status unavailable"}
                          </span>
                          <span className={ownerConfirmed ? "ms-confirmed" : ""}>
                            <CheckCircle2 size={14} />
                            Owner {ownerConfirmed ? "confirmed" : "status unavailable"}
                          </span>
                        </div>
                      </div>

                      <div className="ms-card-footer-right">
                        <span className="ms-updated-date">
                          <CalendarDays size={15} />
                          {formatDate(swap.updatedAt || swap.createdAt)}
                        </span>

                        <button
                          type="button"
                          className="ms-view-button"
                          onClick={() => navigate(`/delivery/${swap._id}`)}
                        >
                          View exchange <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="ms-bottom-banner">
          <div className="ms-banner-icon"><Sparkles size={24} /></div>
          <div className="ms-banner-copy">
            <span>FASHION WITH A SECOND LIFE</span>
            <h3>One person's unused is another person's favourite.</h3>
            <p>Keep your wardrobe moving. Make your next exchange count.</p>
          </div>
          <Link to="/browse" className="ms-banner-button">
            Discover pieces <ArrowRight size={17} />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
