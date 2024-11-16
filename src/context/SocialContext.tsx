// SocialContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

interface FarcasterProfile {
  bio: {
    text: string;
    // Add other properties if they exist in the profile
  };
  // Add other profile properties if they exist
}

interface FarcasterMetadata {
  active_status: string;
  custody_address: string;
  display_name: string;
  fid: number;
  follower_count: number;
  following_count: number;
  object: string;
  pfp_url: string;
  power_badge: boolean;
  profile: FarcasterProfile;
  username: string;
  verifications: any[];
  verified_addresses: {
    eth_addresses: string[];
    sol_addresses: string[];
  };
}

interface FarcasterCredential {
  address: string;
  format: string;
  id: string;
  oauthAccountId: string;
  oauthAccountPhotos: string[];
  oauthDisplayName: string;
  oauthMetadata: FarcasterMetadata;
  oauthProvider: string;
  oauthUsername: string;
  publicIdentifier: string;
}

interface SocialData {
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  fid?: number; // Optional as only Farcaster has this
  provider: 'farcaster' | 'telegram' | null;
}

interface SocialContextType {
  connectedSocial: {
    provider: 'farcaster' | 'telegram' | null;
    isConnected: boolean;
  };
  socialData: SocialData | null;
  updateSocialData: (data: Partial<SocialData>) => void;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const ALLOWED_SOCIAL_PROVIDERS = ['farcaster', 'telegram'] as const;

export const SocialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [connectedSocial, setConnectedSocial] = useState({
    provider: null as 'farcaster' | 'telegram' | null,
    isConnected: false
  });
  const [socialData, setSocialData] = useState<SocialData | null>(null);
  const { user } = useDynamicContext();

  useEffect(() => {
    // Check for both Farcaster and Telegram credentials
    const farcasterCred = user?.verifiedCredentials?.find(
      cred => cred.oauthProvider === 'farcaster'
    ) as FarcasterCredential | undefined;

    const telegramCred = user?.verifiedCredentials?.find(
      cred => cred.oauthProvider === 'telegram'
    );

    if (farcasterCred) {
      setConnectedSocial({
        provider: 'farcaster',
        isConnected: true
      });
      setSocialData({
        username: farcasterCred.oauthUsername || '',
        displayName: farcasterCred.oauthDisplayName || '',
        avatar: farcasterCred.oauthAccountPhotos?.[0] || '',
        bio: farcasterCred.oauthMetadata.profile.bio.text || '',
        fid: farcasterCred.oauthMetadata.fid || 0,
        provider: 'farcaster'
      });
    } else if (telegramCred) {
      setConnectedSocial({
        provider: 'telegram',
        isConnected: true
      });
      setSocialData({
        username: telegramCred.oauthUsername || '',
        displayName: telegramCred.oauthDisplayName || '',
        avatar: telegramCred.oauthAccountPhotos?.[0] || '',
        bio: '',
        provider: 'telegram'
      });
    } else {
      setConnectedSocial({
        provider: null,
        isConnected: false
      });
      setSocialData(null);
    }
  }, [user]);

  const updateSocialData = (data: Partial<SocialData>) => {
    setSocialData(prev => prev ? { ...prev, ...data } : null);
  };

  return (
    <SocialContext.Provider value={{ 
      connectedSocial, 
      socialData, 
      updateSocialData 
    }}>
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (context === undefined) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};