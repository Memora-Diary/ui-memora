"use client";
import { useState } from "react";
import Image from "next/image";

const features = [
  {
    id: "conditions",
    title: "Complex Conditions",
    description: "Build sophisticated multi-condition workflows using AND/OR logic, time-based triggers, and smart contract events.",
    image: "/img/features/conditions.svg"
  },
  {
    id: "ai",
    title: "AI Monitoring",
    description: "Our advanced AI continuously monitors multiple data sources to detect when your conditions are met.",
    image: "/img/features/ai.svg"
  },
  {
    id: "blockchain",
    title: "Multi-Chain Support",
    description: "Execute actions across different blockchain networks with our cross-chain integration.",
    image: "/img/features/blockchain.svg"
  },
  {
    id: "security",
    title: "Decentralized Security",
    description: "Your conditions and triggers are secured by blockchain technology and executable smart contracts.",
    image: "/img/features/security.svg"
  }
];

export default function Features() {
  const [activeFeature, setActiveFeature] = useState(features[0].id);

  return (
    <section className="py-24 bg-lisabona-800">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Powerful Features
          </h2>
          <p className="text-lg text-lisabona-200">
            Everything you need to build and automate complex workflows
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            {features.map((feature) => (
              <div
                key={feature.id}
                className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                  activeFeature === feature.id
                    ? "bg-accent/20 border border-accent"
                    : "hover:bg-lisabona-700"
                }`}
                onClick={() => setActiveFeature(feature.id)}
              >
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-lisabona-200">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-accent to-purple-600 rounded-2xl blur-2xl opacity-20" />
            <div className="relative bg-lisabona-900 p-8 rounded-2xl border border-lisabona-700">
              {/* Replace with actual feature preview/demo */}
              <div className="aspect-video bg-lisabona-800 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
