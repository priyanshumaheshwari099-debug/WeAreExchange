
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Truck, MapPin, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./NotificationMessages.css";

const API = "http://localhost:5000";

const getSavedUser = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const googleUser = JSON.parse(localStorage.getItem("googleUser") || "null");
    if (user?.id || user?._id) 
      return user;
    if (googleUser?.id || googleUser?._id) 
      return googleUser;
    return user || googleUser;
  } catch {
    return null;
  }
};

const getId = (value) => String(value?._id || value?.id || value || "");

function NotificationMessages() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getSavedUser);
  const [chats, setChats] = useState([]);
  const [deliveryAlerts, setDeliveryAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const [search, setSearch] = useState("");

  const userId = getId(user?.id || user?._id);

  const refreshUser = useCallback(() => setUser(getSavedUser()), []);

  const loadChats = useCallback(async () => {
    const currentUser = getSavedUser();
    const currentUserId = getId(currentUser?.id || currentUser?._id);
    setUser(currentUser);

    if (!currentUserId) {
      setChats([]);
      setDeliveryAlerts([]);
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.get(
        `${API}/api/messages/conversations/${currentUserId}`
      );
      const conversations = Array.isArray(data) ? data : [];
      setChats(conversations);

      const results = await Promise.all(
        conversations.map(async (chat) => {
          const swapId = getId(chat.swapId || chat._id);
          if (!swapId) return null;

          try {
            const response = await axios.get(`${API}/api/swapping/${swapId}`);
            const swap = response.data?.swap || response.data;
            const isParticipant =
              getId(swap.requester) === currentUserId ||
              getId(swap.owner) === currentUserId;
            const selectedBy = getId(swap.deliveryMethodSelectedBy);

            if (
              !isParticipant ||
              swap.status !== "accepted" ||
              !swap.deliveryMethod ||
              swap.deliveryMethodConfirmedBy ||
              selectedBy === currentUserId
            ) {
              return null;
            }

            return { swapId, swap, chat };
          } catch {
            return null;
          }
        })
      );

      setDeliveryAlerts(results.filter(Boolean));
    } catch (error) {
      console.error("LOAD CONVERSATIONS ERROR:", error.response?.data || error);
      setChats([]);
      setDeliveryAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("googleLogin", refreshUser);
    window.addEventListener("profileUpdated", refreshUser);
    loadChats();

    const interval = setInterval(loadChats, 5000);

    return () => {
      window.removeEventListener("googleLogin", refreshUser);
      window.removeEventListener("profileUpdated", refreshUser);
      clearInterval(interval);
    };
  }, [loadChats, refreshUser]);

  const confirmMethod = async (swapId) => {
    const currentUser = getSavedUser();
    const currentUserId = getId(currentUser?.id || currentUser?._id);
    if (!currentUserId) return navigate("/login");

    try {
      setConfirming(swapId);
      await axios.patch(
        `${API}/api/swapping/delivery-confirm/${swapId}`,
        { userId: currentUserId }
      );
      toast.success("Delivery method confirmed!");
      await loadChats();
      navigate(`/delivery/${swapId}`);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to confirm delivery method."
      );
    } finally {
      setConfirming(null);
    }
  };

  const deleteChat = async (swapId) => {
    if (!userId || !swapId) return;
    if (!window.confirm("Delete this conversation?")) return;

    try {
      setDeleting(swapId);
      await axios.delete(
        `${API}/api/messages/conversations/${userId}/${swapId}`
);
      setChats((prev) =>
        prev.filter((chat) => getId(chat.swapId || chat._id) !== swapId)
      );
      setDeliveryAlerts((prev) => prev.filter((item) => item.swapId !== swapId));
    } catch (error) {
      console.error("DELETE CHAT ERROR:", error.response?.data || error);
      toast.error("Unable to delete conversation.");
    } finally {
      setDeleting(null);
    }
  };

  const filteredChats = chats.filter((chat) => {
    const name = chat.otherUser?.name || "";
    const message =
      typeof chat.lastMessage === "string"
        ? chat.lastMessage
        : chat.lastMessage?.message || "";
    const query = search.toLowerCase();
    return name.toLowerCase().includes(query) ||
      message.toLowerCase().includes(query);
  });

  if (!userId) {
    return (
      <>
        <Navbar />
        <main className="notification-login">
          <div className="login-message-box">
            <div className="login-message-icon">✉</div>
            <span className="login-message-label">WEAREXCHANGE</span>
            <h2>Login to view messages</h2>
            <p>Sign in to continue your clothing swap conversations.</p>
            <button onClick={() => navigate("/login")}>
              LOGIN TO CONTINUE <span>↗</span>
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="notification-page">
        <section className="notification-wrapper">
          <header className="notification-top">
            <div>
              <span className="notification-label">WEAREXCHANGE</span>
              <h1>Messages</h1>
              <p>Your clothing swap conversations</p>
            </div>
            <div className="conversation-total">
              <strong>{chats.length}</strong>
              <span>CONVERSATIONS</span>
            </div>
          </header>

          {deliveryAlerts.length > 0 && (
            <section className="delivery-confirm-alerts">
              <h2>Delivery Confirmation</h2>
              <p>The other participant selected an exchange method. Please confirm it.</p>
              {deliveryAlerts.map(({ swapId, swap, chat }) => (
                <article className="delivery-confirm-alert" key={swapId}>
                  <div className="delivery-confirm-icon">
                    {swap.deliveryMethod === "shipping"
                      ? <Truck size={23} />
                      : <MapPin size={23} />}
                  </div>
                  <div className="delivery-confirm-info">
                    <h3>{chat.otherUser?.name || "Swap participant"}</h3>
                    <p>
                      Selected method: <strong>
                        {swap.deliveryMethod === "shipping"
                          ? "Ship Items"
                          : "Exchange Locally"}
                      </strong>
                    </p>
                    <span>Waiting for your confirmation</span>
                  </div>
                  <button
                    className="delivery-confirm-btn"
                    disabled={confirming === swapId}
                    onClick={() => confirmMethod(swapId)}
                  >
                    <CheckCircle size={16} />
                    {confirming === swapId ? "Confirming..." : "Confirm Delivery"}
                  </button>
                </article>
              ))}
            </section>
          )}

          <div className="notification-tools">
            <div className="notification-search">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m16 16 4 4" />
              </svg>
              <input
                type="search"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search conversations"
              />
              {search && (
                <button onClick={() => setSearch("")} aria-label="Clear search">×</button>
              )}
            </div>
            <span className="conversation-result">{filteredChats.length} RESULTS</span>
          </div>

          <div className="notification-list">
            {loading ? (
              <p>Loading messages...</p>
            ) : filteredChats.length === 0 ? (
              <div className="notification-empty">
                <div className="empty-icon"><span>✉</span></div>
                <span className="empty-label">YOUR INBOX</span>
                <h2>{search ? "No matching conversations" : "No conversations yet"}</h2>
                <p>
                  {search
                    ? "Try another name or message."
                    : "Your clothing swap conversations will appear here."}
                </p>
                <button onClick={() => navigate("/swap-requests")}>
                  VIEW SWAP REQUESTS <span>↗</span>
                </button>
              </div>
            ) : (
              filteredChats.map((chat, index) => {
                const otherUser = chat.otherUser || {};
                const swapId = getId(chat.swapId || chat._id);
                const lastMessage =
                  typeof chat.lastMessage === "string"
                    ? chat.lastMessage
                    : chat.lastMessage?.message || "Start a conversation";
                const photo = otherUser.profileImage || otherUser.photoURL || "";

                return (
                  <article className="notification-card" key={swapId || index}>
                    <span className="conversation-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="notification-avatar">
                      {photo ? (
                        <img src={photo} alt={otherUser.name || "User"}
                          onError={(e) => { e.currentTarget.style.display = "none"; }} />
                      ) : (
                        <span>{(otherUser.name || "U").charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="notification-info">
                      <div className="notification-name-row">
                        <h3>{otherUser.name || "WearExchange User"}</h3>
                      </div>
                      <p title={lastMessage}>{lastMessage}</p>
                      <div className="conversation-meta">
                        <span>Clothing Swap</span><b>•</b>
                        <small>Conversation {index + 1}</small>
                      </div>
                    </div>
                    <div className="notification-actions">
                      <button className="open-chat-btn"
                        onClick={() => navigate(`/chat/${swapId}`)} disabled={!swapId}>
                        OPEN CHAT <span>↗</span>
                      </button>
                      <button className="delete-chat-btn"
                        onClick={() => deleteChat(swapId)}
                        disabled={deleting === swapId || !swapId}>
                        {deleting === swapId ? "..." : "Delete"}
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default NotificationMessages;
