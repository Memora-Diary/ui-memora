import type { Metadata } from "next";
import Home from "@/app/home";

export const metadata: Metadata = {
  title: "Heirary - Secure your digital legacy",
  description: "Heirary is a secure digital legacy platform",
};

export default function Page() {
  return (
    <>
      <Home />
    </>
  );
}
