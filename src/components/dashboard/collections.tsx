"use client";
import React, { useEffect, useState } from "react";
import tippy from "tippy.js";
import ActiveLegacy from "./ActiveLegacy";
import Inherited from "./Inherited";
import Notifications from "@/components/notifications";
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { isEthereumWallet } from '@dynamic-labs/ethereum';
import { NFTData } from "./types/ActiveLegacyTypes";

type TabType = "active" | "inherited" | "notifications";

interface CollectionsProps {
  nftDetails: NFTData[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

export default function Collections({ nftDetails, isLoading, onRefresh }: CollectionsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [previousTab, setPreviousTab] = useState<TabType>("active");
  const { primaryWallet } = useDynamicContext();

  useEffect(() => {
    tippy("[data-tippy-content]");
  }, []);

  useEffect(() => {
    const switchNetwork = async () => {
      if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;

      try {
        if (activeTab === "notifications") {
          await primaryWallet.switchNetwork(11155111);
        } else if (previousTab === "notifications") {
          await primaryWallet.switchNetwork(80002);
        }
      } catch (error) {
        console.error("Failed to switch network:", error);
      }
    };

    switchNetwork();
  }, [activeTab, previousTab, primaryWallet]);

  const handleTabClick = (tab: TabType) => {
    setPreviousTab(activeTab);
    setActiveTab(tab);
  };

  const tabs = [
    {
      id: "active",
      label: "My Workflows",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      id: "inherited",
      label: "Inherited",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
        </svg>
      )
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id as TabType)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-accent text-white"
                : "bg-lisabona-700/50 text-lisabona-200 hover:bg-lisabona-700"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
        {activeTab === "active" && (
          <ActiveLegacy 
            nftDetails={nftDetails}
            isLoading={isLoading}
            onRefresh={onRefresh}
          />
        )}
        {activeTab === "inherited" && <Inherited />}
        {activeTab === "notifications" && <Notifications />}
      </div>
    </div>
  );
}
