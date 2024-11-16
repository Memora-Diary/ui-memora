import type { Metadata } from "next";
import Footers from "@/components/footers";
import Headers from "@/components/headers";
import Hero from "@/components/home/hero";
import Process from "@/components/home/process";
import Features from "@/components/home/features";
import dynamic from 'next/dynamic';

const Showcase = dynamic(() => import('@/components/home/showcase'), {
  ssr: false,
});

export const metadata: Metadata = {
  title: "Heirary - Conditional Workflows for Web3",
  description: "Build complex, automated workflows that execute based on real-world events, smart contract states, and AI-verified conditions.",
};

export default function Home() {
  return (
    <>
      <Headers />
      <main className="bg-lisabona-900">
        <Hero />
        <Process />
        <Features />
        <Showcase />
      </main>
      <Footers />
    </>
  );
}
