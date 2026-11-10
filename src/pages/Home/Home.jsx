import { useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import HowItWorks from "../../components/HowItWorks/HowItWorks";
import "./Home.css";

gsap.registerPlugin(ScrollTrigger);

function Home() {
    useEffect(() => {
        const text = "Shop pre-loved fashion.\nSwap what you don't wear.";
        const obj = { value: 0 };

        gsap.to(obj, {
            value: text.length,
            duration: 3,
            ease: "none",
            snap: "value",
            onUpdate: () => {
                const el = document.querySelector(".typewriter-text");

                if (el) {
                    el.textContent = text.substring(
                        0,
                        Math.floor(obj.value)
                    );
                }
            }
        });

        return () => gsap.killTweensOf(obj);
    }, []);

    useGSAP(() => {
        gsap.from(".hero-content", {
            x: -80,
            opacity: 0,
            duration: 1.2,
            ease: "power3.out"
        });

        gsap.from(".hero-image", {
            x: 80,
            opacity: 0,
            duration: 1.2,
            delay: 0.2,
            ease: "power3.out"
        });

        const slides = gsap.utils.toArray(".feature-slide");

        if (slides.length > 1) {
            gsap.to(".feature-track", {
                x: () => -(window.innerWidth * (slides.length - 1)),
                ease: "none",
                scrollTrigger: {
                    trigger: ".feature-scroll",
                    pin: true,
                    scrub: 1,
                    snap: 1 / (slides.length - 1),
                    invalidateOnRefresh: true,
                    end: () =>
                        `+=${window.innerWidth * (slides.length - 1)}`
                }
            });
        }

        gsap.fromTo(
            ".swap-banner img",
            {
                y: 80,
                scale: 1.15,
                opacity: 0
            },
            {
                y: 0,
                scale: 1,
                opacity: 1,
                duration: 1.4,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: ".swap-banner",
                    start: "top 75%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    const features = [
        {
            number: "01 — LOCAL SWAPS",
            title: (
                <>
                    Find something
                    <br />
                    <i>you'll love.</i>
                </>
            ),
            text: "Discover unique pieces from people around you and give your wardrobe a fresh direction.",
            link: "/browse",
            linkText: "EXPLORE CLOTHES ↗",
            image:
                "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=90",
            alt: "Fashion"
        },
        {
            number: "02 — FAIR VALUE",
            title: (
                <>
                    Give your clothes
                    <br />
                    <i>another life.</i>
                </>
            ),
            text: "Turn the pieces you no longer wear into something new through simple clothing exchanges.",
            link: "/add-clothing",
            linkText: "LIST YOUR CLOTHES ↗",
            image:
                "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1600&q=90",
            alt: "Fashion collection"
        },
        {
            number: "03 — SUSTAINABLE",
            title: (
                <>
                    Wear more.
                    <br />
                    <i>Waste less.</i>
                </>
            ),
            text: "Keep good clothes in circulation instead of letting them sit unused in your wardrobe.",
            link: "/browse",
            linkText: "START SWAPPING ↗",
            image:
                "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=90",
            alt: "Clothing"
        },
        {
            number: "04 — COMMUNITY",
            title: (
                <>
                    Clothes find
                    <br />
                    <i>new owners.</i>
                </>
            ),
            text: "Connect with real people, send swap requests and discover pieces from your community.",
            link: "/browse",
            linkText: "MEET THE COMMUNITY ↗",
            image:
                "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1600&q=90",
            alt: "Clothing collection"
        }
    ];

    return (
        <>
            <Navbar />

            <main className="home">

                {/* HERO */}
                <section className="hero">
                    <div className="hero-content">
                        <span className="hero-tag">
                            NEW SEASON SWAPS
                        </span>

                        <h1 className="typewriter">
                            <span className="typewriter-text"></span>
                            <span className="cursor">|</span>
                        </h1>

                        <p>
                            Discover quality clothing from people near you.
                            List your unused pieces, find something new,
                            and exchange without unnecessary spending.
                        </p>

                        <div className="hero-buttons">
                            <a
                                href="/browse"
                                className="shop-btn"
                            >
                                EXPLORE CLOTHES
                            </a>

                            <a
                                href="/add-clothing"
                                className="sell-btn"
                            >
                                LIST CLOTHING
                            </a>
                        </div>
                    </div>

                    <div className="hero-image">
                        <img
                            src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1600&q=90"
                            alt="Clothing collection"
                        />
                    </div>
                </section>

                {/* FEATURES */}
                <section className="feature-scroll">
                    <div className="feature-track">
                        {features.map((item, index) => (
                            <div
                                className="feature-slide"
                                key={index}
                            >
                                <div className="feature-text">
                                    <span>{item.number}</span>

                                    <h2>{item.title}</h2>

                                    <p>{item.text}</p>

                                    <a href={item.link}>
                                        {item.linkText}
                                    </a>
                                </div>

                                <div className="feature-photo">
                                    <img
                                        src={item.image}
                                        alt={item.alt}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SWAP BANNER */}
                <section className="swap-banner">
                    <div>
                        <span>
                            YOUR WARDROBE, REIMAGINED
                        </span>

                        <h2>
                            Don't let good clothes
                            <br />
                            sit unused.
                        </h2>

                        <p>
                            List them. Discover something better.
                            Make the exchange.
                        </p>

                        <a href="/add-clothing">
                            LIST YOUR CLOTHING →
                        </a>
                    </div>

                    <img
                        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=90"
                        alt="Fashion store"
                    />
                </section>

                {/* HOW IT WORKS */}
                <HowItWorks />

            </main>

            <Footer />
        </>
    );
}

export default Home;