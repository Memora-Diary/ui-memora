"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useAuth } from "@/context/AuthContext";
import Loading from "@/components/loading";
import { useState, useCallback, useEffect } from "react";

export default function Hero() {
  const router = useRouter();
  const { setShowAuthFlow } = useDynamicContext();
  const { isLoggedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [shouldNavigate, setShouldNavigate] = useState(false);

  const handleGetStarted = useCallback(() => {
    setIsLoading(true);
    if (isLoggedIn) {
      setShouldNavigate(true);
    } else {
      setShowAuthFlow(true);
      setIsLoading(false);
    }
  }, [isLoggedIn, setShowAuthFlow]);

  useEffect(() => {
    if (shouldNavigate) {
      router.push("/dashboard");
      setShouldNavigate(false);
      setIsLoading(false);
    }
  }, [shouldNavigate, router]);

  return (
    <>
      {isLoading && <Loading />}
      <section className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black to-lisabona-900" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-5 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500 blur-[100px] animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <div className="inline-block mb-6 px-3 py-1 border border-accent/40 rounded-full bg-accent/10">
                <span className="text-accent text-sm">Powered by AI & Blockchain</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Create Smart <span className="text-accent">Conditional</span> Workflows for Web3
              </h1>
              
              <p className="text-lg text-lisabona-200 mb-8 leading-relaxed">
                Build complex, automated workflows that execute based on real-world events, 
                smart contract states, and AI-verified conditions. Perfect for DAOs, DeFi protocols, 
                and personal asset management.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleGetStarted}
                  className="px-8 py-4 bg-accent hover:bg-accent-dark rounded-xl text-white font-semibold transition-all"
                  disabled={isLoading}
                >
                  {isLoggedIn ? "Create Workflow" : "Start Building"}
                </button>
                
                <a href="#learn-more" 
                   className="px-8 py-4 border border-lisabona-200 hover:border-accent rounded-xl text-white font-semibold transition-all">
                  Learn More
                </a>
              </div>

              <div className="mt-8 flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-lisabona-900 bg-lisabona-700" />
                  ))}
                </div>
                <p className="text-lisabona-200">
                  <span className="text-white font-semibold">1000+</span> workflows created
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 bg-lisabona-800 p-6 rounded-2xl border border-lisabona-700">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-accent to-purple-600 rounded-2xl blur opacity-30" />
                <div className="relative">
                  <code className="text-sm text-lisabona-200 block">
                    <span className="text-accent">{"if"}</span>{" ("}<br/>
                    {"  "}<span className="text-green-400">userMarried</span>{" && "}<br/>
                    {"  "}<span className="text-blue-400">portfolioValue</span>{" > 1000000"}<br/>
                    {") "}<span className="text-accent">then</span>{" {"}<br/>
                    {"  transferAssets(spouse, 0.3)"}<br/>
                    {"}"}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}