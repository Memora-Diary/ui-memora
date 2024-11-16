"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useAuth } from "@/context/AuthContext";
import Loading from "@/components/loading";

const SponsorFeature: React.FC<{ name: string; description: string; logoSrc: string }> = ({ name, description, logoSrc }) => (
  <div className="flex items-center space-x-4 mb-4 bg-white/10 p-4 rounded-lg">
    <Image src={logoSrc} alt={`${name} logo`} width={60} height={60} className="rounded-full" />
    <div className="text-left">
      <h3 className="text-xl font-semibold text-white">{name}</h3>
      <p className="text-white text-sm">{description}</p>
    </div>
  </div>
);

const CallToAction: React.FC = () => {
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
      <section className="bg-gradient-to-r from-blue-600 to-indigo-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl mb-8">
            <span className="block">Heirary: Your Digital Legacy, Secured</span>
            <span className="block text-indigo-200 text-2xl mt-2">
              Powered by Cutting-Edge Blockchain Technology
            </span>
          </h2>
          

          <div className="bg-white/20 p-6 rounded-lg shadow-lg mb-12">
            <h3 className="text-2xl font-bold text-white mb-4">Rootstock</h3>
            <p className="text-white mb-4">Secure your digital legacy on Bitcoin robust L2 network with full EVM compatibility</p>
            <Image src="https://ethglobal.b-cdn.net/organizations/ggpyp/square-logo/default.png" alt="Nouns-Inspired Heirary Art" width={200} height={200} className="mx-auto rounded-lg" />
          </div>

          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-md shadow">
              <button
                onClick={handleGetStarted}
               className="inline-block rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                disabled={isLoading}
              >
                {isLoggedIn ? "Access Your Digital Vault" : "Secure Your Legacy Now"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CallToAction;