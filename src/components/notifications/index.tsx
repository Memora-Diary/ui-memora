"use client";
import { useEffect, useState } from 'react';
import { PushAPI, CONSTANTS } from '@pushprotocol/restapi';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { isEthereumWallet } from '@dynamic-labs/ethereum';
import Image from 'next/image';

interface Notification {
  cta: string;
  title: string;
  message: string;
  icon: string;
  url: string;
  sid: string;
  app: string;
  image: string;
  blockchain: string;
  notification: {
    body: string;
    title: string;
  };
  timestamp: number;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { primaryWallet } = useDynamicContext();

  
  useEffect(() => {
    const initializePushProtocol = async () => {
      if (!primaryWallet?.connector) return;
      try {


        if (!isEthereumWallet(primaryWallet)) {
            throw new Error('Wallet is not an Ethereum wallet');
        }

        const signer = await primaryWallet.getWalletClient();


        const user = await PushAPI.initialize(signer, { env: CONSTANTS.ENV.STAGING });

        const pushChannelAddress = process.env.NEXT_PUBLIC_PUSH_CHANNEL_ADDRESS;
        if (pushChannelAddress) {
          await user.notification.subscribe(`eip155:11155111:${pushChannelAddress}`);
        }

        const inboxNotifications = await user.notification.list('INBOX');
        
        console.log("inboxNotifications", inboxNotifications)
        setNotifications(inboxNotifications);

        const stream = await user.initStream([CONSTANTS.STREAM.NOTIF]);
        stream.on(CONSTANTS.STREAM.NOTIF, (data) => {
            console.log("data", data)
          
            setNotifications((prev) => [data, ...prev]);
        });

        stream.connect();

        setIsLoading(false);

        return () => {
          stream.disconnect();
        };
      } catch (error) {
        console.error('Error initializing Push Protocol:', error);
        setIsLoading(false);
      }
    };

    initializePushProtocol();
  }, [primaryWallet]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Notifications</h2>
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-10">
            <div className="mb-4">
              <svg 
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification, index) => (
            <div
              key={index}
              className="p-6 bg-white dark:bg-lisabona-700 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200"
            >
              <div className="flex items-start space-x-4">
                {/* App Icon */}
                <div className="flex-shrink-0">
                  <Image
                    src={notification.icon || '/img/default-icon.png'}
                    alt={notification.app}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-accent">
                      {notification.app}
                    </p>
                    <span className="text-sm text-gray-400">
                      {notification.timestamp ? 
                        new Date(notification.timestamp).toLocaleDateString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                        : 
                        'Just now'
                      }
                    </span>
                  </div>
                  
                  <h3 className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                    {notification.notification.title}
                  </h3>
                  
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    {notification.notification.body}
                  </p>

                  {/* Notification Image if exists */}
                  {notification.image && (
                    <div className="mt-3">
                      <Image
                        src={notification.image}
                        alt="Notification image"
                        width={300}
                        height={200}
                        className="rounded-lg"
                      />
                    </div>
                  )}

                  {/* CTA Button if exists */}
                  {notification.cta && (
                    <div className="mt-4">
                      <a
                        href={notification.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                      >
                        {notification.cta}
                      </a>
                    </div>
                  )}

                  {/* Blockchain Badge */}
                  <div className="mt-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FF9100] text-lisabona-900">
                      {notification.blockchain}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}