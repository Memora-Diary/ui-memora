"use client";
import { useEffect, useState } from "react";
import tippy from "tippy.js";
import Image from "next/image";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useSocial } from "@/context/SocialContext";

export default function Profile() {
  const { setShowAuthFlow } = useDynamicContext();
  const { connectedSocial, socialData, updateSocialData } = useSocial();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: '',
    username: ''
  });

  useEffect(() => {
    setEditForm({
      displayName: socialData?.displayName || editForm.displayName,
      bio: socialData?.bio || editForm.bio,
      username: socialData?.username || editForm.username
    });
  }, [socialData]);

  useEffect(() => {
    tippy("[data-tippy-content]");
  }, []);

  const handleConnectSocial = () => {
    setShowAuthFlow(true);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    updateSocialData({
      displayName: editForm.displayName,
      bio: editForm.bio,
      username: editForm.username
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (socialData) {
      setEditForm({
        displayName: socialData.displayName,
        bio: socialData.bio,
        username: socialData.username
      });
    }
    setIsEditing(false);
  };

  return (
    <section className="relative bg-light-base pb-12 pt-24 md:pt-28 dark:bg-lisabona-800">
      <div className="container px-4">
        <div className="flex flex-col items-center">
          <div className="mb-6 md:mb-8">
            <figure className="relative inline-block">
              <Image
                unoptimized
                width={120}
                height={120}
                src={socialData?.avatar || "/img/user/user_avatar.gif"}
                alt="user avatar"
                className="rounded-xl border-[5px] border-white dark:border-lisabona-600"
              />
              {(connectedSocial.farcaster || connectedSocial.telegram) && (
                <div
                  className="absolute -right-2 -bottom-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-green dark:border-lisabona-600"
                  data-tippy-content={`Verified ${socialData?.provider} User`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    className="h-[.875rem] w-[.875rem] fill-white"
                  >
                    <path fill="none" d="M0 0h24v24H0z"></path>
                    <path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"></path>
                  </svg>
                </div>
              )}
            </figure>
          </div>

          <div className="text-center">
            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editForm.displayName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full max-w-md rounded-lg border border-lisabona-100 py-2 px-4 dark:border-lisabona-600 dark:bg-lisabona-700 dark:text-white"
                  placeholder="Display Name"
                />
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full max-w-md rounded-lg border border-lisabona-100 py-2 px-4 dark:border-lisabona-600 dark:bg-lisabona-700 dark:text-white"
                  placeholder="Username"
                />
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full max-w-md rounded-lg border border-lisabona-100 py-2 px-4 dark:border-lisabona-600 dark:bg-lisabona-700 dark:text-white"
                  placeholder="Bio"
                  rows={3}
                />
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleSave}
                    className="rounded-full bg-accent py-2 px-6 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="rounded-full bg-lisabona-100 py-2 px-6 text-center font-semibold text-lisabona-700 transition-all hover:bg-lisabona-200 dark:bg-lisabona-600 dark:text-white dark:hover:bg-lisabona-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="mb-2 font-display text-3xl md:text-4xl font-medium text-lisabona-700 dark:text-white">
                  {socialData?.displayName || editForm.displayName || 'Anonymous User'}
                </h2>

                <button
                  onClick={handleEdit}
                  className="mb-6 rounded-full bg-lisabona-100 py-2 px-6 text-center font-semibold text-lisabona-700 transition-all hover:bg-lisabona-200 dark:bg-lisabona-600 dark:text-white dark:hover:bg-lisabona-500"
                >
                  Edit Profile
                </button>

                <div className="flex justify-center gap-4 mb-6">
                  {/* {!connectedSocial.farcaster && (
                    <button
                      onClick={handleConnectSocial}
                      className="rounded-full bg-accent py-2 px-6 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                    >
                      Connect Farcaster
                    </button>
                  )}
                  
                  {!connectedSocial.telegram && (
                    <button
                      onClick={handleConnectSocial}
                      className="rounded-full bg-accent py-2 px-6 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                    >
                      Connect Telegram
                    </button>
                  )} */}
                </div>

                <p className="mx-auto mb-2 max-w-xl text-base md:text-lg dark:text-lisabona-300">
                  {socialData?.bio || editForm.bio || 'No bio available'}
                </p>
              </>
            )}

            {socialData?.provider === 'farcaster' && socialData.fid && (
              <span className="text-sm md:text-base text-lisabona-400">
                Farcaster ID: {socialData.fid}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}