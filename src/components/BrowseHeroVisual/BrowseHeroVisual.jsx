import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import "./BrowseHeroVisual.css";

const clothes = [
    {
        className: "hero-card-1",
        image:"https://images.unsplash.com/photo-1754555009601-498e9873197e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        className: "hero-card-2",
        image:"https://images.unsplash.com/photo-1740711152088-88a009e877bb?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
        className: "hero-card-3",
                image:"https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=705&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",

    }
];

function BrowseHeroVisual() {
    useGSAP(() => {
        gsap.to(".hero-card-1", {
            y: -10,
            duration: 2.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });

        gsap.to(".hero-card-2", {
            y: 10,
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });

        gsap.to(".hero-card-3", {
            y: -8,
            duration: 2.8,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    });

    return (
        <div className="browse-hero-visual">
            {clothes.map((item, index) => (
                <div className={`hero-clothing-card ${item.className}`} key={index}>
                    <img src={item.image} alt="Clothing" />

                    {index === 2 && (
                        <span className="hero-new-badge">NEW</span>
                    )}
                </div>
            ))}
        </div>
    );
}

export default BrowseHeroVisual;