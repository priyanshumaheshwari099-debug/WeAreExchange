import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import "./Preloader.css";

function Preloader() {
  const loader = useRef(null);
  const [number, setNumber] = useState(1);

  useEffect(() => {
    let count = 1;

    const interval = setInterval(() => {
      count++;
      setNumber(count);

      if (count === 100) {
        clearInterval(interval);

        gsap.to(loader.current, {
          yPercent: -100,
          duration: 1,
          ease: "power4.inOut",
        });
      }
    }, 18);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="preloader" ref={loader}>
     <div className="preloader-number">
  <span>{String(number).padStart(3, "0").slice(0, 1)}</span>
  <span>{String(number).padStart(3, "0").slice(1, 2)}</span>
  <span>{String(number).padStart(3, "0").slice(2, 3)}</span>
</div>

      <div className="preloader-name">
        WEAR<span>EXCHANGE</span>
      </div>
    </div>
  );
}

export default Preloader;