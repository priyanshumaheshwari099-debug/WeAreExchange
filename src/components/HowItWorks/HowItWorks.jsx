import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./HowItWorks.css";

gsap.registerPlugin(ScrollTrigger);

function HowItWorks() {
    const sectionRef = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 70%",
                    toggleActions: "play none none reverse"
                }
            });

            tl.from(".how-top", {
                y: 60,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out"
            })
            .from(".how-line", {
                scaleX: 0,
                transformOrigin: "left center",
                duration: 1.2,
                ease: "power3.inOut"
            }, "-=0.4")
            .from(".how-step", {
                y: 70,
                opacity: 0,
                scale: 0.94,
                duration: 0.7,
                stagger: 0.16,
                ease: "power3.out"
            }, "-=0.8");
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const steps = [
        {
            number: "01",
            title: "Signup / Login",
            text: "Create your WearExchange account and join the clothing swap community."
        },
        {
            number: "02",
            title: "List Your Clothes",
            text: "Add clothes you no longer wear with photos, size, condition and details."
        },
        {
            number: "03",
            title: "Discover",
            text: "Browse available clothes and find something you would love to swap."
        },
        {
            number: "04",
            title: "Send Request",
            text: "Choose one of your clothes and send a swap request to the owner."
        },
        {
            number: "05",
            title: "Connect",
            text: "Once accepted, chat with the other user and discuss your exchange."
        },
        {
            number: "06",
            title: "Swap",
            text: "Complete the exchange and give your clothes a second life."
        }
    ];

    return (
        <section className="how-section" ref={sectionRef}>
            <div className="how-wrapper">

                <div className="how-top">
                    <div>
                        <span className="how-mini-title">THE SIMPLE WAY</span>

                        <h2>
                            How <span>WearExchange</span>
                            <br />
                            works
                        </h2>
                    </div>

                   
                </div>

                <div className="how-timeline">

                    <div className="how-line"></div>

                    <div className="how-steps">
                        {steps.map((step, index) => (
                            <div className="how-step" key={step.number}>

                                <div className="how-dot">
                                    <span>{step.number}</span>
                                </div>

                                <div className="how-card">
                                    <div className="how-card-top">
                                        <span>STEP {step.number}</span>
                                        <span className="how-arrow">↗</span>
                                    </div>

                                    <h3>{step.title}</h3>

                                    <p>{step.text}</p>
                                </div>

                            </div>
                        ))}
                    </div>

                </div>

               

            </div>
        </section>
    );
}

export default HowItWorks;