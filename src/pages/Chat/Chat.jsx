
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar/Navbar";
import "./Chat.css";

const API = "https://wearexchange-backend.onrender.com";

function Chat() {
    const { swapId } = useParams();
    const navigate = useNavigate();

    const savedUser = localStorage.getItem("user");
    const user = savedUser ? JSON.parse(savedUser) : null;

    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [otherUser, setOtherUser] = useState(null);

    const bottomRef = useRef(null);

    // LOAD MESSAGES
    const loadMessages = async (showLoading = false) => {
        if (!user?.id || !swapId) {
            setLoading(false);
            return;
        }

        try {
            if (showLoading) {
                setLoading(true);
            }

            const res = await axios.get(
                `${API}/api/messages/${swapId}`,
                {
                    params: {
                        userId: user.id
                    }
                }
            );

            setMessages(
                Array.isArray(res.data.messages)
                    ? res.data.messages
                    : []
            );

            if (res.data.otherUser) {
                setOtherUser(res.data.otherUser);
            }

        } catch (error) {
            console.log(
                "LOAD CHAT ERROR:",
                error.response?.data || error
            );
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    };

    // MARK MESSAGES AS READ
    const markMessagesRead = async () => {
        if (!user?.id || !swapId) {
            return;
        }

        try {
            await axios.patch(
                `${API}/api/messages/read/${swapId}/${user.id}`
            );
        } catch (error) {
            console.log(
                "MARK READ ERROR:",
                error.response?.data || error
            );
        }
    };

    // INITIAL LOAD + LIVE MESSAGE POLLING
    useEffect(() => {
        if (!user?.id || !swapId) {
            return;
        }

        loadMessages(true);
        markMessagesRead();

        const interval = setInterval(() => {
            loadMessages(false);
        }, 2000);

        return () => {
            clearInterval(interval);
        };
    }, [swapId]);

    // SCROLL TO BOTTOM
    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [messages]);

    // SEND MESSAGE
    const sendMessage = async (e) => {
        e.preventDefault();

        const text = message.trim();

        if (
            !text ||
            !user?.id ||
            !swapId ||
            sending
        ) {
            return;
        }

        try {
            setSending(true);

            const res = await axios.post(
                `${API}/api/messages`,
                {
                    swapId,
                    sender: user.id,
                    message: text
                }
            );

            setMessages((prev) => [
                ...prev,
                res.data
            ]);

            setMessage("");

        } catch (error) {
            console.log(
                "SEND MESSAGE ERROR:",
                error.response?.data || error
            );
        } finally {
            setSending(false);
        }
    };

    // LOGIN CHECK
    if (!user) {
        return (
            <>
                <Navbar />

                <div className="chat-empty">
                    <h2>Please login first</h2>

                    <button
                        onClick={() => navigate("/login")}
                    >
                        LOGIN
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <main className="chat-page">

                <button
                    className="chat-back"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>

                <div className="chat-container">

                    <div className="chat-header">
                        <div className="chat-user">
                            <div className="chat-avatar">
                                {otherUser?.profileImage ? (
                                    <img
                                        src={otherUser.profileImage}
                                        alt={otherUser?.name || "User"}
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    otherUser?.name
                                        ?.charAt(0)
                                        ?.toUpperCase() || "U"
                                )}
                            </div>

                            <h2>
                                {otherUser?.name || "User"}
                            </h2>
                        </div>
                    </div>

                    <div className="messages-area">

                        {loading ? (
                            <div className="chat-loading">
                                Loading...
                            </div>

                        ) : messages.length === 0 ? (
                            <div className="chat-start">
                                <div className="chat-start-icon">
                                    💬
                                </div>

                                <h3>
                                    Start the conversation
                                </h3>

                                <p>
                                    Send a message to discuss
                                    the swap.
                                </p>
                            </div>

                        ) : (
                            messages.map((item) => {
                                const mine =
                                    item.sender === user.id;

                                return (
                                    <div
                                        key={item._id}
                                        className={
                                            mine
                                                ? "message-row mine"
                                                : "message-row theirs"
                                        }
                                    >
                                        <div className="message-bubble">
                                            <p>
                                                {item.message}
                                            </p>

                                            <small>
                                                {new Date(
                                                    item.createdAt
                                                ).toLocaleTimeString(
                                                    [],
                                                    {
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    }
                                                )}
                                            </small>
                                        </div>
                                    </div>
                                );
                            })
                        )}

                        <div ref={bottomRef} />
                    </div>

                    <form
                        className="chat-input-area"
                        onSubmit={sendMessage}
                    >
                        <input
                            type="text"
                            placeholder="Write a message..."
                            value={message}
                            onChange={(e) =>
                                setMessage(e.target.value)
                            }
                        />

                        <button
                            type="submit"
                            disabled={
                                !message.trim() ||
                                sending
                            }
                        >
                            {sending ? "..." : "SEND →"}
                        </button>
                    </form>

                </div>
            </main>
        </>
    );
}

export default Chat;
