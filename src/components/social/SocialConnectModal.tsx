import React from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { X } from "lucide-react";
import { useSocial, ALLOWED_SOCIAL_PROVIDERS } from '../../context/SocialContext';

interface SocialConnectModalProps {
  onClose: () => void;
}

interface SocialProvider {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const SOCIAL_PROVIDERS: SocialProvider[] = [
  {
    id: 'farcaster',
    name: 'Farcaster',
    icon: '/img/socials/farcaster.png',
    description: 'Connect your Farcaster account for on-chain social verification'
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: '/img/socials/telegram.png',
    description: 'Connect your Telegram account for instant messaging updates'
  }
];

const SocialConnectModal: React.FC<SocialConnectModalProps> = ({ onClose }) => {
  const { 
    handleLogOut, 
    user,
    setShowAuthFlow,
    primaryWallet 
  } = useDynamicContext();
  
  const { connectedSocial } = useSocial();
  
  const handleConnect = async (providerId: string) => {
    try {
      localStorage.setItem('currentSocialProvider', providerId);
      setShowAuthFlow(true);
      onClose();
    } catch (error) {
      console.error(`Failed to connect to ${providerId}:`, error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await handleLogOut();
      onClose();
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  const getProviderStatus = (providerId: string) => {
    return connectedSocial.provider === providerId && connectedSocial.isConnected;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-75" onClick={onClose} />
      
      <div className="relative w-full max-w-md p-6 bg-lisabona-800 rounded-lg shadow-xl border border-lisabona-600">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-lisabona-200 hover:text-white"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-xl font-bold mb-6 text-white">
          Connect Social Accounts
        </h2>

        <div className="space-y-4">
          {SOCIAL_PROVIDERS.map((provider) => (
            <div 
              key={provider.id}
              className="flex items-center justify-between p-4 border border-lisabona-600 rounded-lg bg-lisabona-700"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <img
                    src={provider.icon}
                    alt={provider.name}
                    className="w-8 h-8"
                  />
                  <span className="text-white">{provider.name}</span>
                </div>
                <p className="mt-1 text-sm text-lisabona-200">
                  {provider.description}
                </p>
              </div>
              <div>
                {getProviderStatus(provider.id) ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-green-500">Connected</span>
                    <button
                      onClick={handleDisconnect}
                      className="px-3 py-1 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect(provider.id)}
                    className="px-4 py-2 bg-accent rounded-lg text-white hover:bg-accent-dark transition-colors"
                    disabled={!primaryWallet}
                  >
                    {!primaryWallet ? 'Connect Wallet First' : 'Connect'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm text-lisabona-200">
          Connect your social accounts to enable AI-powered trigger detection.
          Each platform provides different types of life event detection.
        </p>
      </div>
    </div>
  );
};

export default SocialConnectModal;