import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import FilterSidebar from "../../components/FilterSidebar/FilterSidebar";
import BrowseHeroVisual from "../../components/BrowseHeroVisual/BrowseHeroVisual";
import "./Browse.css";

gsap.registerPlugin(ScrollTrigger);

const API = "http://localhost:5000";
const DEFAULT_IMAGE =
    "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=900&q=85";

function Browse() {
    const navigate = useNavigate();
    const rotatingWord = useRef(null);

    const [clothes, setClothes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        category: "",
        minPrice: "",
        maxPrice: "",
        sizes: [],
        condition: "",
        sort: "latest"
    });

    const priceReady =
        filters.minPrice !== "" && filters.maxPrice !== "";

    useGSAP(() => {
        const words = [
            "fresh",
            "unique",
            "stylish",
            "wearable",
            "different"
        ];

        let index = 0;

        const changeWord = () => {
            const el = rotatingWord.current;
            if (!el) return;

            gsap.timeline()
                .to(el, {
                    y: -18,
                    opacity: 0,
                    duration: 0.25,
                    ease: "power2.in"
                })
                .call(() => {
                    index = (index + 1) % words.length;
                    el.textContent = words[index];
                })
                .fromTo(
                    el,
                    { y: 18, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.4,
                        ease: "power3.out"
                    }
                );
        };

        const interval = setInterval(changeWord, 2200);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const getClothes = async () => {
            try {
                const response = await axios.get(`${API}/api/clothing`);
                setClothes(
                    Array.isArray(response.data)
                        ? response.data
                        : []
                );
            } catch (error) {
                console.log("Clothing Error:", error);
            } finally {
                setLoading(false);
            }
        };

        getClothes();
    }, []);

    const filteredClothes = clothes
        .filter((item) => {
            if (!filters.category) return true;

            return (
                String(item.category || "")
                    .trim()
                    .toLowerCase() ===
                String(filters.category)
                    .trim()
                    .toLowerCase()
            );
        })
        .filter((item) => {
            // Price filter tabhi chalega jab dono prices enter hon
            if (!priceReady) return true;

            const price = Number(item.value) || 0;
            const min = Number(filters.minPrice);
            const max = Number(filters.maxPrice);

            return price >= min && price <= max;
        })
        .filter((item) => {
            if (!filters.sizes.length) return true;

            const itemSize = String(item.size || "")
                .trim()
                .toLowerCase();

            return filters.sizes.some(
                (size) =>
                    String(size)
                        .trim()
                        .toLowerCase() === itemSize
            );
        })
        .filter((item) => {
            if (!filters.condition) return true;

            return (
                String(item.condition || "")
                    .trim()
                    .toLowerCase() ===
                String(filters.condition)
                    .trim()
                    .toLowerCase()
            );
        })
        .sort((a, b) => {
            const valueA = Number(a.value || 0);
            const valueB = Number(b.value || 0);

            if (filters.sort === "low") {
                return valueA - valueB;
            }

            if (filters.sort === "high") {
                return valueB - valueA;
            }

            const dateA = new Date(
                a.createdAt || 0
            ).getTime();

            const dateB = new Date(
                b.createdAt || 0
            ).getTime();

            return filters.sort === "oldest"
                ? dateA - dateB
                : dateB - dateA;
        });

    useGSAP(
        () => {
            if (loading) return;

            gsap.from(
                ".browse-kicker, .browse-title, .browse-description",
                {
                    x: -30,
                    opacity: 0,
                    duration: 0.7,
                    stagger: 0.1,
                    ease: "power3.out"
                }
            );

            gsap.from(".browse-action", {
                x: 30,
                opacity: 0,
                duration: 0.6,
                ease: "power3.out"
            });
        },
        [loading]
    );

    // Product animation after every filter change
    useEffect(() => {
        if (loading) return;
        if (!priceReady && (
            filters.minPrice !== "" ||
            filters.maxPrice !== ""
        )) {
            return;
        }

        const products = document.querySelectorAll(
            ".browse-product"
        );

        if (!products.length) return;

        gsap.fromTo(
            products,
            {
                opacity: 0,
                y: 30
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.55,
                stagger: 0.07,
                ease: "power3.out"
            }
        );
    }, [
        loading,
        priceReady,
        filteredClothes.length,
        filters.category,
        filters.sizes,
        filters.condition,
        filters.sort
    ]);

    const clearFilters = () => {
        setFilters({
            category: "",
            minPrice: "",
            maxPrice: "",
            sizes: [],
            condition: "",
            sort: "latest"
        });
    };

    return (
        <>
            <Navbar />

            <main className="browse">
                <section className="browse-hero">
                    <div className="browse-heading">
                        <span className="browse-kicker">
                            WEAREXCHANGE / MARKETPLACE
                        </span>

                        <h1 className="browse-title">
                            Discover
                            <br />
                            something{" "}
                            <em>
                                <span ref={rotatingWord}>
                                    fresh
                                </span>
                                .
                            </em>
                        </h1>

                        <p className="browse-description">
                            Explore unique clothing listed by our
                            community. Find pieces you love and give
                            your wardrobe something different.
                        </p>

                      
                    </div>

                    <BrowseHeroVisual clothes={clothes} />
                </section>

                <section className="browse-tools">
                    <div className="browse-count">
                        <span>COLLECTION</span>
                        <strong>
                            {filteredClothes.length} ITEMS
                        </strong>
                    </div>

                    <span className="filter-note">
                        FILTER & REFINE YOUR SELECTION
                    </span>
                </section>

                {loading ? (
                    <div className="browse-state">
                        <div className="loader"></div>
                        <span>LOADING COLLECTION</span>
                    </div>
                ) : (
                    <div className="browse-content">
                        <FilterSidebar
                            filters={filters}
                            setFilters={setFilters}
                        />

                        <section className="browse-products">
                            {!priceReady &&
                            (filters.minPrice !== "" ||
                                filters.maxPrice !== "") ? (
                                <div className="browse-state empty">
                                    <span>PRICE RANGE</span>

                                    <h2>
                                        Enter initial and final
                                        price.
                                    </h2>
                                </div>
                            ) : filteredClothes.length ===
                              0 ? (
                                <div className="browse-state empty">
                                    <span>NO ITEMS FOUND</span>

                                    <h2>
                                        Try changing your
                                        filters.
                                    </h2>

                                    <button
                                        onClick={clearFilters}
                                    >
                                        CLEAR FILTERS →
                                    </button>
                                </div>
                            ) : (
                                filteredClothes.map(
                                    (clothing, index) => {
                                        const image =
                                            clothing.images
                                                ?.length
                                                ? `${API}${clothing.images[0]}`
                                                : DEFAULT_IMAGE;

                                        return (
                                            <article
                                                className="browse-product"
                                                key={
                                                    clothing._id
                                                }
                                            >
                                                <div className="browse-image">
                                                    <img
                                                        src={image}
                                                        alt={
                                                            clothing.title ||
                                                            "Clothing"
                                                        }
                                                        onError={(
                                                            e
                                                        ) => {
                                                            e.currentTarget.src =
                                                                DEFAULT_IMAGE;
                                                        }}
                                                    />

                                                    <span className="product-number">
                                                        {String(
                                                            index +
                                                                1
                                                        ).padStart(
                                                            2,
                                                            "0"
                                                        )}
                                                    </span>

                                                    <span className="condition">
                                                        {
                                                            clothing.condition
                                                        }
                                                    </span>

                                                    <button
                                                        className="quick-view"
                                                        onClick={() =>
                                                            navigate(
                                                                `/product/${clothing._id}`
                                                            )
                                                        }
                                                    >
                                                        VIEW
                                                    </button>
                                                </div>

                                                <div className="browse-info">
                                                    <div className="product-category">
                                                        {
                                                            clothing.category
                                                        }
                                                    </div>

                                                    <h3>
                                                        {
                                                            clothing.title
                                                        }
                                                    </h3>

                                                    {clothing.brand && (
                                                        <p className="brand">
                                                            {
                                                                clothing.brand
                                                            }
                                                        </p>
                                                    )}

                                                    <div className="browse-bottom">
                                                        <span>
                                                            SIZE{" "}
                                                            {
                                                                clothing.size
                                                            }
                                                        </span>

                                                        <strong>
                                                            {clothing.value
                                                                ? `₹${clothing.value}`
                                                                : "SWAP"}
                                                        </strong>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    }
                                )
                            )}
                        </section>
                    </div>
                )}
            </main>

            <Footer />
        </>
    );
}

export default Browse;