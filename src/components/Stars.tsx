"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Stars() {
  const { theme } = useTheme();
  const [stars, setStars] = useState<
    {
      left: string;
      top: string;
      delay: string;
    }[]
  >([]);

  const randomNum = (minNum: number, maxNum: number) => {
    return Math.random() * (maxNum - minNum + 1) + minNum;
  };

  useEffect(() => {
    const generateStars = () => {
      const starsArray = new Array(30).fill(null).map(() => {
        return {
          left: randomNum(0, document.body.offsetWidth) + "px",
          top: randomNum(0, document.body.offsetHeight) + "px",
          delay: randomNum(0, 3) + "s",
        };
      });
      setStars(starsArray);
    };
    if (theme === "dark") {
      generateStars();
    } else {
      setStars([]);
    }
  }, [theme]);

  return (
    <div>
      {stars.map((item, key) => (
        <div
          className="fixed w-[5px] h-[5px] bg-[#17ff19] opacity-0"
          key={key}
          style={{
            animation: "fadein 3s linear 0s infinite normal forwards",
            top: item.top,
            left: item.left,
            animationDelay: item.delay,
          }}
        ></div>
      ))}
      <style jsx>{`
        @keyframes fadein {
          from {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @-webkit-keyframes fadein {
          from {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
