
import { useState } from "react";
import "./ProductGallery.css";

const API = "https://wearexchange-backend.onrender.com";

function ProductGallery({ images = [] }) {

    const [activeIndex, setActiveIndex] = useState(0);

    const validImages = images.filter(Boolean);

    if (!validImages.length) {
        return (
            <div className="product-gallery-empty">
                <span>NO IMAGE</span>
            </div>
        );
    }

    const getImageUrl = image => {
        if (!image) return "";

        if (
            image.startsWith("http://") ||
            image.startsWith("https://")
        ) {
            return image;
        }

        return `${API}${image}`;
    };

    const nextImage = () => {
        setActiveIndex(prev =>
            prev === validImages.length - 1
                ? 0
                : prev + 1
        );
    };

    const previousImage = () => {
        setActiveIndex(prev =>
            prev === 0
                ? validImages.length - 1
                : prev - 1
        );
    };

    return (
        <div className="product-gallery">

            {/* MAIN IMAGE */}
            <div className="main-product-image">

                <img
                    src={getImageUrl(
                        validImages[activeIndex]
                    )}
                    alt={`Product ${activeIndex + 1}`}
                />

                {validImages.length > 1 && (
                    <>
                        <button
                            className="gallery-arrow gallery-prev"
                            onClick={previousImage}
                            type="button"
                        >
                            ‹
                        </button>

                        <button
                            className="gallery-arrow gallery-next"
                            onClick={nextImage}
                            type="button"
                        >
                            ›
                        </button>

                        <div className="image-counter">
                            {activeIndex + 1} / {validImages.length}
                        </div>
                    </>
                )}

            </div>

            {/* THUMBNAILS */}
            {validImages.length > 1 && (

                <div className="product-thumbnails">

                    {validImages.map(
                        (image, index) => (

                            <button
                                key={`${image}-${index}`}
                                type="button"
                                className={`product-thumbnail ${
                                    activeIndex === index
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    setActiveIndex(index)
                                }
                            >

                                <img
                                    src={getImageUrl(image)}
                                    alt={`Thumbnail ${index + 1}`}
                                />

                            </button>

                        )
                    )}

                </div>

            )}

        </div>
    );
}

export default ProductGallery;
