"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const NotFoundPage = () => {
  const [timeLeft, setTimeLeft] = useState("36:00:00");

  useEffect(() => {
    const interval = setInterval(() => {
      const [hours, minutes, seconds] = timeLeft.split(":").map(Number);
      let newSeconds = seconds - 1;
      let newMinutes = minutes;
      let newHours = hours;

      if (newSeconds < 0) {
        newSeconds = 59;
        newMinutes -= 1;
      }
      if (newMinutes < 0) {
        newMinutes = 59;
        newHours -= 1;
      }
      if (newHours < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft(
        `${newHours.toString().padStart(2, "0")}:${newMinutes
          .toString()
          .padStart(2, "0")}:${newSeconds.toString().padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  return (
    <div className="min-h-screen bg-jacarta-900 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-block mb-8 px-3 py-1 border border-accent/40 rounded-full bg-accent/10">
          <span className="text-accent text-sm">ETHGlobal Bangkok Hackathon Project</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          404 - Time&apos;s Up! ⏰
        </h1>
        
        <div className="text-2xl md:text-4xl font-mono text-accent mb-8">
          {timeLeft}
        </div>
        
        <p className="text-lg text-jacarta-200 mb-8">
          Oops! This page is still in our backlog. We built this during ETHGlobal Bangkok and 
          had to make some tough choices about what features to include in our 36-hour sprint.
          <br/><br/>
          <span className="text-accent">But hey, that&apos;s what hackathons are about!</span>
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <Link 
            href="/"
            className="px-8 py-4 bg-accent hover:bg-accent-dark rounded-xl text-white font-semibold transition-all"
          >
            Back to Homepage
          </Link>
          
          <a 
            href="https://ethglobal Bangkok.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 border border-jacarta-200 hover:border-accent rounded-xl text-white font-semibold transition-all"
          >
            Learn About ETHGlobal Bangkok
          </a>
        </div>

        <div className="mt-12 p-6 bg-jacarta-800 rounded-xl border border-jacarta-700">
          <code className="text-sm text-jacarta-200 block text-left">
            <span className="text-accent">if</span> (pageExists) {"{"}
            <br/>
            {"  "}return <span className="text-green-400">page</span>;
            <br/>
            {"}"} <span className="text-accent">else</span> {"{"}
            <br/>
            {"  "}<span className="text-red-400">throw</span> <span className="text-blue-400">&quot;Not enough time in hackathon!&quot;</span>;
            <br/>
            {"}"}
          </code>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage; 