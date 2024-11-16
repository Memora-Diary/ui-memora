import React, { useEffect, useState, useMemo, useCallback } from "react";
import { DollarSign } from "lucide-react";
import NftAction from "../nft/NftAction";
import Image from "next/image";
import { nounsicon } from "@/data/nouns";
import {
  useContractWrite,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import MemoraABI from "@/data/MEMORA_ABI.json";
import { Address, getAddress, parseEther } from "viem";
import { useSocial } from "@/context/SocialContext";
import toast, { Toaster } from "react-hot-toast";
import SocialConnectModal from '../social/SocialConnectModal';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { ALLOWED_SOCIAL_PROVIDERS } from "@/context/SocialContext";


// {
//   "intentions": [
//     {
//       "condition": "When I get married || When I have a baby",
//       "action": "give",
//       "beneficiary": null,
//       "assets": {
//         "type": "money",
//         "amount": null,
//         "currency": "USD"
//       },
//       "timeframe": null,
//       "raw_text": "when I have I get married and when I have a baby, action give, beneficiary, I don't care. I just don't care the type of the amount and the money"
//     }
//   ],
//   "complex_conditions": []
// }


const aiTrainingData = [
  {
    condition: "When I get married",
    keywords: ["married", "wedding", "tie the knot"],
  },
  {
    condition: "When I get a promotion at work",
    keywords: ["promotion", "manager", "senior", "team lead"],
  },
  { condition: "When I have a baby", keywords: ["baby", "parent", "newborn"] },
  {
    condition: "When I move to a new house",
    keywords: ["new house", "move", "unpacked"],
  },
  {
    condition: "When I graduate",
    keywords: ["graduate", "graduation", "university"],
  },
  {
    condition: "When I get a new job",
    keywords: ["new job", "offer", "role", "position"],
  },
  {
    condition: "When I move abroad",
    keywords: ["move abroad", "new country", "expat"],
  },
  {
    condition: "When I go on holiday",
    keywords: ["holiday", "vacation", "trip"],
  },
  {
    condition: "When I pass away",
    keywords: ["died", "die", "death", "passed away"],
  },
  {
    condition: "When I win an ETHGlobal hackathon",
    keywords: ["ETHGlobal", "hackathon", "won"],
  },
];

export const actionTypes = [
  {
    id: 0,
    alt: "MANAGE_ACCOUNT",
    text: "Manage Account",
  },
  {
    id: 1,
    alt: "CLOSE_ACCOUNT",
    text: "Close Account",
  },
  {
    id: 2,
    alt: "TRANSFER_FUNDS",
    text: "Transfer Bitcoin",
  },
];

interface CreateActionProps {
  onSuccess?: () => void;
}

interface TriggerCondition {
  prompt: string;
  operator: 'AND' | 'OR';
}

// Add new types for the condition builder
interface ConditionGroup {
  id: string;
  type: 'group';
  operator: 'AND' | 'OR';
  conditions: (Condition | ConditionGroup)[];
}

interface Condition {
  id: string;
  type: 'condition';
  prompt: string;
  weight: number;
}

// Add this type for social tag display
interface SocialTag {
  provider: 'farcaster' | 'telegram';
  id: string | number;
  username: string;
  displayName?: string;
}

export default function CreateAction({ onSuccess }: CreateActionProps) {
  const { socialData } = useSocial();
  const [actionForm, setActionForm] = useState({
    conditionGroup: {
      id: 'root',
      type: 'group' as const,
      operator: 'AND' as const,
      conditions: [
        {
          id: '1',
          type: 'condition' as const,
          prompt: '',
          weight: 1,
        },
      ],
    } as ConditionGroup,
    action: actionTypes[0],
    claimer: "",
    metadata: nounsicon[0],
    phoneNumber: "",
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [showIconDropdown, setShowIconDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [fundAmount, setFundAmount] = useState("");
  const [tRBTCAmount, setTRBTCAmount] = useState("");
  const [mintedTokenId, setMintedTokenId] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number | null>(null);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const { user } = useDynamicContext();
  const [connectedSocialTag, setConnectedSocialTag] = useState<SocialTag | null>(null);

  const checksumAddress: Address = getAddress(
    process.env.NEXT_PUBLIC_MEMORA_CONTRACT_ADDRESS as `0x${string}`
  );

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const generateSuggestions = useMemo(
    () => (input: string) => {
      if (!input) return [];
      
      const inputLower = input.toLowerCase().trim();
      
      // Return all suggestions if input is very short (1-2 characters)
      if (inputLower.length <= 2) {
        return aiTrainingData.map(data => data.condition);
      }
      
      // Score-based matching system
      return aiTrainingData
        .map(data => {
          let score = 0;
          const condition = data.condition.toLowerCase();
          
          // Full match with condition
          if (condition.includes(inputLower)) {
            score += 10;
          }
          
          // Partial word matches in condition
          const inputWords = inputLower.split(' ');
          const conditionWords = condition.split(' ');
          
          inputWords.forEach(word => {
            if (word.length > 2) { // Only check words longer than 2 characters
              conditionWords.forEach(condWord => {
                // Partial word match
                if (condWord.includes(word) || word.includes(condWord)) {
                  score += 5;
                }
              });
            }
          });
          
          // Keyword matching with more flexibility
          data.keywords.forEach(keyword => {
            const keywordLower = keyword.toLowerCase();
            
            // Full keyword match
            if (keywordLower.includes(inputLower) || inputLower.includes(keywordLower)) {
              score += 8;
            }
            
            // Partial keyword match
            inputWords.forEach(word => {
              if (word.length > 2 && (keywordLower.includes(word) || word.includes(keywordLower))) {
                score += 3;
              }
            });
          });
          
          return {
            condition: data.condition,
            score
          };
        })
        .filter(item => item.score > 0) // Only keep items with matches
        .sort((a, b) => b.score - a.score) // Sort by score
        .map(item => item.condition) // Return only the conditions
        .slice(0, 5); // Limit to top 5 suggestions
    },
    []
  );

  useEffect(() => {
    if (activeSuggestionIndex !== null) {
      const newSuggestions = generateSuggestions(
        actionForm.triggers[activeSuggestionIndex].prompt
      );
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [actionForm.triggers, activeSuggestionIndex, generateSuggestions]);

  const handleFundAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const regex = /^[0-9]*[.,]?[0-9]*$/;

    if (value === "" || regex.test(value)) {
      setFundAmount(value.replace(",", "."));
    }
  };

  const handleTriggerChange = (index: number, value: string) => {
    const newTriggers = [...actionForm.triggers];
    newTriggers[index] = { ...newTriggers[index], prompt: value };
    setActionForm({ ...actionForm, triggers: newTriggers });
    setActiveSuggestionIndex(index);
  };

  const handleOperatorChange = (index: number, operator: 'AND' | 'OR') => {
    const newTriggers = [...actionForm.triggers];
    newTriggers[index] = { ...newTriggers[index], operator };
    setActionForm({ ...actionForm, triggers: newTriggers });
  };

  const addTrigger = () => {
    setActionForm({
      ...actionForm,
      triggers: [...actionForm.triggers, { prompt: "", operator: 'AND' }],
    });
  };

  const removeTrigger = (index: number) => {
    const newTriggers = actionForm.triggers.filter((_, i) => i !== index);
    setActionForm({ ...actionForm, triggers: newTriggers });
  };

  const convertUSDToTRBTC = (usdAmount: string) => {
    const rate = 0.000016;
    const tRBTC = parseFloat(usdAmount) * rate;
    return tRBTC.toFixed(8);
  };

  useEffect(() => {
    if (fundAmount) {
      const tRBTC = convertUSDToTRBTC(fundAmount);
      setTRBTCAmount(tRBTC);
    } else {
      setTRBTCAmount("");
    }
  }, [fundAmount]);

  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    isError: isWriteError,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
    data: transactionReceipt,
  } = useWaitForTransactionReceipt({
    hash,
  });


  // Add effect to update social tag when user changes
  useEffect(() => {
    if (user?.verifiedCredentials) {
      const social = user.verifiedCredentials.find(
        cred => ALLOWED_SOCIAL_PROVIDERS.includes(cred.oauthProvider as any)
      );
      
      if (social) {
        setConnectedSocialTag({
          provider: social.oauthProvider as 'farcaster' | 'telegram',
          id: social.oauthProvider === 'farcaster' 
            ? social.oauthMetadata?.fid 
            : social.oauthAccountId,
          username: social.oauthUsername || '',
          displayName: social.oauthDisplayName
        });
      } else {
        setConnectedSocialTag(null);
      }
    }
  }, [user]);

  // Update the handleWriteContract function
  const handleWriteContract = async () => {
    const toastId = toast.loading("Preparing transaction...");
    try {
      if (!connectedSocialTag) {
        toast.error("Please connect a social account");
        return;
      }

      // Serialize the condition group into a string
      const serializeConditions = (group: ConditionGroup): string => {
        return group.conditions.map((cond, index) => {
          if (cond.type === 'group') {
            return `(${serializeConditions(cond)})`;
          }
          return index === 0 ? cond.prompt : `${group.operator} ${cond.prompt}`;
        }).join(' ');
      };

      const combinedPrompt = serializeConditions(actionForm.conditionGroup);

      // Format social identifier with username instead of ID
      const socialIdentifier = `${connectedSocialTag.provider}:@${connectedSocialTag.username}`;

      await writeContract({
        address: checksumAddress,
        abi: MemoraABI,
        functionName: "mint",
        args: [
          actionForm.claimer,
          actionForm.action.id,
          combinedPrompt,
          actionForm.metadata.ipfsHash,
          socialIdentifier,
        ],
      });

      toast.loading("Transaction submitted. Waiting for confirmation...", {
        id: toastId,
      });
    } catch (error) {
      console.error("Contract write error:", error);
      toast.error(`Failed to send transaction`, { id: toastId });
    }
  };

  useEffect(() => {
    if (isWriteError) {
      toast.dismiss();
      toast.error(`Write error: ${writeError?.name}`);
    }
  }, [isWriteError, writeError]);

  const handleAddFunds = useCallback(
    async (tokenId: number) => {
      if (!tokenId || !tRBTCAmount) {
        toast.error("Invalid token ID or amount");
        return;
      }

      const toastId = toast.loading("Adding funds...");
      try {
        await writeContract({
          address: checksumAddress,
          abi: MemoraABI,
          functionName: "addFunds",
          args: [tokenId],
          value: parseEther(tRBTCAmount),
        });

        toast.success("Funds added successfully", { id: toastId });
      } catch (error) {
        console.error("Add funds error:", error);
        toast.error(`Failed to add funds`, { id: toastId });
      }
    },
    [tRBTCAmount, writeContract, checksumAddress]
  );

  useEffect(() => {
    if (isConfirmed && transactionReceipt) {
      toast.dismiss();
      const mintedTokenCoin = transactionReceipt?.logs[0]
        .topics[3] as `0x${string}`;
      const convertedTokenCoin = parseInt(mintedTokenCoin, 16);
      setMintedTokenId(convertedTokenCoin);

      console.log("Transaction confirmed:", transactionReceipt);
      toast.success("NFT minted successfully!");

      if (actionForm.action.id === 2 && tRBTCAmount) {
        handleAddFunds(convertedTokenCoin);
      }

      setActionForm({
        triggers: [{ prompt: "", operator: 'AND' }],
        action: actionTypes[0],
        claimer: "",
        metadata: nounsicon[0],
        phoneNumber: "",
      });
      setFundAmount("");
      setTRBTCAmount("");

      if (isMobile) {
        setCurrentStep(1);
      }

      onSuccess?.();
    } else if (confirmError) {
      toast.dismiss();
      toast.error(`Transaction failed: ${confirmError.message}`);
    }
  }, [
    isConfirmed,
    confirmError,
    transactionReceipt,
    actionForm.action.id,
    tRBTCAmount,
    handleAddFunds,
    isMobile,
    onSuccess,
  ]);

  const handleNextStep = () => {
    setCurrentStep(2);
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  // Add helper functions for condition management
  const addCondition = (groupId: string) => {
    const newCondition: Condition = {
      id: crypto.randomUUID(),
      type: 'condition',
      prompt: '',
      weight: 1,
    };

    setActionForm(prev => {
      const updateGroup = (group: ConditionGroup): ConditionGroup => {
        if (group.id === groupId) {
          return {
            ...group,
            conditions: [...group.conditions, newCondition],
          };
        }
        return {
          ...group,
          conditions: group.conditions.map(cond => 
            cond.type === 'group' ? updateGroup(cond) : cond
          ),
        };
      };

      return {
        ...prev,
        conditionGroup: updateGroup(prev.conditionGroup),
      };
    });
  };

  const addGroup = (parentGroupId: string) => {
    const newGroup: ConditionGroup = {
      id: crypto.randomUUID(),
      type: 'group',
      operator: 'AND',
      conditions: [{
        id: crypto.randomUUID(),
        type: 'condition',
        prompt: '',
        weight: 1,
      }],
    };

    setActionForm(prev => {
      const updateGroup = (group: ConditionGroup): ConditionGroup => {
        if (group.id === parentGroupId) {
          return {
            ...group,
            conditions: [...group.conditions, newGroup],
          };
        }
        return {
          ...group,
          conditions: group.conditions.map(cond => 
            cond.type === 'group' ? updateGroup(cond) : cond
          ),
        };
      };

      return {
        ...prev,
        conditionGroup: updateGroup(prev.conditionGroup),
      };
    });
  };

  // Move all these functions inside the component
  const updateConditionPrompt = (groupId: string, conditionId: string, value: string) => {
    setActionForm(prev => {
      const updateGroup = (group: ConditionGroup): ConditionGroup => {
        if (group.id === groupId) {
          return {
            ...group,
            conditions: group.conditions.map(cond => 
              cond.id === conditionId && cond.type === 'condition'
                ? { ...cond, prompt: value }
                : cond.type === 'group'
                ? updateGroup(cond)
                : cond
            ),
          };
        }
        return {
          ...group,
          conditions: group.conditions.map(cond => 
            cond.type === 'group' ? updateGroup(cond) : cond
          ),
        };
      };

      return {
        ...prev,
        conditionGroup: updateGroup(prev.conditionGroup),
      };
    });
  };

  const updateConditionWeight = (groupId: string, conditionId: string, weight: number) => {
    setActionForm(prev => {
      const updateGroup = (group: ConditionGroup): ConditionGroup => {
        if (group.id === groupId) {
          return {
            ...group,
            conditions: group.conditions.map(cond => 
              cond.id === conditionId && cond.type === 'condition'
                ? { ...cond, weight }
                : cond.type === 'group'
                ? updateGroup(cond)
                : cond
            ),
          };
        }
        return {
          ...group,
          conditions: group.conditions.map(cond => 
            cond.type === 'group' ? updateGroup(cond) : cond
          ),
        };
      };

      return {
        ...prev,
        conditionGroup: updateGroup(prev.conditionGroup),
      };
    });
  };

  const updateGroupOperator = (groupId: string, operator: 'AND' | 'OR') => {
    setActionForm(prev => {
      const updateGroup = (group: ConditionGroup): ConditionGroup => {
        if (group.id === groupId) {
          return {
            ...group,
            operator,
          };
        }
        return {
          ...group,
          conditions: group.conditions.map(cond => 
            cond.type === 'group' ? updateGroup(cond) : cond
          ),
        };
      };

      return {
        ...prev,
        conditionGroup: updateGroup(prev.conditionGroup),
      };
    });
  };

  const removeCondition = (groupId: string, conditionId: string) => {
    setActionForm(prev => {
      const removeEmptyGroups = (group: ConditionGroup): ConditionGroup | null => {
        // First, update the current group's conditions
        const updatedConditions = group.conditions
          .map(cond => {
            if (cond.id === conditionId) return null;
            if (cond.type === 'group') {
              const updatedGroup = removeEmptyGroups(cond);
              return updatedGroup;
            }
            return cond;
          })
          .filter((cond): cond is Condition | ConditionGroup => cond !== null);

        // If this is the root group and it's empty, keep at least one condition
        if (group.id === 'root' && updatedConditions.length === 0) {
          return {
            ...group,
            conditions: [{
              id: crypto.randomUUID(),
              type: 'condition',
              prompt: '',
              weight: 1,
            }]
          };
        }

        // If this is not the root group and it's empty, remove it
        if (group.id !== 'root' && updatedConditions.length === 0) {
          return null;
        }

        return {
          ...group,
          conditions: updatedConditions,
        };
      };

      const updatedGroup = removeEmptyGroups(prev.conditionGroup);
      return {
        ...prev,
        conditionGroup: updatedGroup || prev.conditionGroup,
      };
    });
  };

  // Render a condition group
  const ConditionGroupComponent = ({ group, depth = 0 }: { group: ConditionGroup; depth?: number }) => (
    <div className={`p-4 ${depth > 0 ? 'ml-4 border-l-2 border-lisabona-200 dark:border-lisabona-600' : ''}`}>
      <div className="flex items-center gap-2 mb-4">
        <select
          className="rounded-lg border-lisabona-100 py-2 px-3 dark:border-lisabona-600 dark:bg-lisabona-700 dark:text-white"
          value={group.operator}
          onChange={(e) => updateGroupOperator(group.id, e.target.value as 'AND' | 'OR')}
        >
          <option value="AND">AND</option>
          <option value="OR">OR</option>
        </select>
        <button
          onClick={() => addCondition(group.id)}
          className="py-2 px-4 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 dark:text-white"
        >
          + Add Condition
        </button>
        <button
          onClick={() => addGroup(group.id)}
          className="py-2 px-4 rounded-lg bg-blue/20 text-blue hover:bg-blue/30 dark:text-white"
        >
          + Add Group
        </button>
      </div>

      <div className="space-y-4">
        {group.conditions.map((condition) => (
          <div key={condition.id}>
            {condition.type === 'group' ? (
              <ConditionGroupComponent group={condition} depth={depth + 1} />
            ) : (
              <ConditionComponent condition={condition} groupId={group.id} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Render a single condition
  const ConditionComponent = ({ condition, groupId }: { condition: Condition; groupId: string }) => {
    // Initialize localValue with condition.prompt
    const [localValue, setLocalValue] = useState(condition.prompt);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [localSuggestions, setLocalSuggestions] = useState<string[]>([]);

    // Update localValue when condition.prompt changes
    useEffect(() => {
      setLocalValue(condition.prompt);
    }, [condition.prompt]);

    // Update suggestions when local value changes
    useEffect(() => {
      const newSuggestions = generateSuggestions(localValue);
      setLocalSuggestions(newSuggestions);
    }, [localValue]);

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalValue(value);
      setShowSuggestions(true);
    };

    // Handle suggestion click
    const handleSuggestionClick = (suggestion: string) => {
      setLocalValue(suggestion);
      updateConditionPrompt(groupId, condition.id, suggestion);
      setShowSuggestions(false);
    };

    // Update the actual condition when input loses focus
    const handleBlur = () => {
      updateConditionPrompt(groupId, condition.id, localValue);
      // Delay hiding suggestions to allow for clicks
      setTimeout(() => setShowSuggestions(false), 200);
    };

    return (
      <div className="flex gap-2 items-center relative">
        <div className="flex-1 relative">
          <input
            type="text"
            className="w-full rounded-lg border-lisabona-100 py-3 px-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent dark:border-lisabona-600 dark:bg-lisabona-700 dark:text-white"
            placeholder="Enter condition..."
            value={localValue}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            onBlur={handleBlur}
          />
          {showSuggestions && localSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-lisabona-700 rounded-lg shadow-lg">
              {localSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-2 hover:bg-lisabona-50 dark:hover:bg-lisabona-600 cursor-pointer"
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent blur from firing before click
                    handleSuggestionClick(suggestion);
                  }}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
        <input
          type="number"
          min="0"
          max="1"
          step="0.1"
          className="w-24 rounded-lg border-lisabona-100 py-3 px-3 dark:border-lisabona-600 dark:bg-lisabona-700 dark:text-white"
          value={condition.weight}
          onChange={(e) => updateConditionWeight(groupId, condition.id, parseFloat(e.target.value))}
        />
        <button
          onClick={() => removeCondition(groupId, condition.id)}
          className="p-3 text-red hover:bg-red/20 rounded-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    );
  };

  // Check if any social account is connected
  const hasSocialConnected = user?.verifiedCredentials?.some(
    cred => cred.provider === 'farcaster'
  );

  // Update the form rendering
  const renderForm = () => (
    <div className="w-full">
      <div className="mb-6">
        <label className="mb-2 block font-display text-lisabona-700 dark:text-white">
          When should this plan activate?
        </label>
        <ConditionGroupComponent group={actionForm.conditionGroup} />
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="block font-display text-lisabona-700 dark:text-white">
            Social Connection
          </label>
          <button
            onClick={() => setShowSocialModal(true)}
            className="text-sm text-accent hover:text-accent-dark"
          >
            {connectedSocialTag ? 'Change Connection' : 'Connect Account'}
          </button>
        </div>
        <div className="p-4 rounded-lg border dark:border-lisabona-600">
          {connectedSocialTag ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <img
                  src={`/img/socials/${connectedSocialTag.provider}.png`}
                  alt={connectedSocialTag.provider}
                  className="w-5 h-5"
                />
                <span className="text-lisabona-700 dark:text-white">
                  {connectedSocialTag.displayName}
                </span>
                <span className="text-sm text-lisabona-500 dark:text-lisabona-300">
                  @{connectedSocialTag.username}
                </span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                <span className="text-green-500">Connected</span>
              </div>
            </div>
          ) : (
            <div className="text-lisabona-500 dark:text-lisabona-300">
              Connect your social account to enable AI-powered trigger detection
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label
          htmlFor="action-type"
          className="mb-2 block font-display text-lisabona-700 dark:text-white"
        >
          What action should be taken?
        </label>
        <div className="relative">
          <button
            className="w-full flex items-center justify-between rounded-lg border border-lisabona-100 bg-white py-3.5 px-3 text-base dark:border-lisabona-600 dark:bg-lisabona-700 dark:text-white"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <span>{actionForm.action.text}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              className="h-4 w-4 fill-lisabona-500 dark:fill-white"
            >
              <path fill="none" d="M0 0h24v24H0z"></path>
              <path d="M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z"></path>
            </svg>
          </button>
          {showDropdown && (
            <div className="absolute z-10 w-full mt-2 py-2 bg-white rounded-lg shadow-xl dark:bg-lisabona-800">
              {actionTypes.map((elm, i) => (
                <button
                  key={i}
                  className="w-full px-4 py-2 text-left hover:bg-lisabona-50 dark:hover:bg-lisabona-600"
                  onClick={() => {
                    setActionForm({ ...actionForm, action: elm });
                    setShowDropdown(false);
                  }}
                >
                  {elm.text}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {actionForm.action.id === 2 && (
        <div className="mb-6">
          <label
            htmlFor="fund-amount"
            className="mb-2 block font-display text-lisabona-700 dark:text-white"
          >
            Amount to transfer (in USD)
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="fund-amount"
              className="w-full rounded-lg border-lisabona-100 py-3 pl-10 pr-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent dark:border-lisabona-600 dark:bg-lisabona-700 dark:text-white dark:placeholder:text-lisabona-300"
              placeholder="Enter amount in USD"
              value={fundAmount}
              onChange={handleFundAmountChange}
            />
          </div>
          {tRBTCAmount && (
            <p className="mt-2 text-sm text-lisabona-500 dark:text-lisabona-300">
              Equivalent: {tRBTCAmount} tRBTC
            </p>
          )}
        </div>
      )}

      <div className="mb-6">
        <label
          htmlFor="action-claimer"
          className="mb-2 block font-display text-lisabona-700 dark:text-white"
        >
          Who should carry out this action? (Enter wallet address)
        </label>
        <input
          type="text"
          id="action-claimer"
          className="w-full rounded-lg border-lisabona-100 py-3 px-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent dark:border-lisabona-600 dark:bg-lisabona-700 dark:text-white dark:placeholder:text-lisabona-300"
          placeholder="0x..."
          value={actionForm.claimer}
          onChange={(e) =>
            setActionForm({ ...actionForm, claimer: e.target.value })
          }
        />
      </div>

      <div className="mb-6">
        <label className="mb-2 block font-display text-lisabona-700 dark:text-white">
          Choose an icon for this plan
        </label>
        <div className="relative">
          <button
            className="w-full flex items-center justify-between rounded-lg border border-lisabona-100 bg-white py-3.5 px-3 text-base dark:border-lisabona-600 dark:bg-lisabona-700 dark:text-white"
            onClick={() => setShowIconDropdown(!showIconDropdown)}
          >
            <span className="flex items-center">
              <Image
                width={20}
                height={20}
                src={actionForm.metadata.imageSrc}
                alt="Selected icon"
                className="mr-2 rounded-full"
              />
              {actionForm.metadata.title}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              className="h-4 w-4 fill-lisabona-500 dark:fill-white"
            >
              <path fill="none" d="M0 0h24v24H0z"></path>
              <path d="M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z"></path>
            </svg>
          </button>
          {showIconDropdown && (
            <div className="absolute overflow-scroll overflow-x-hidden h-60 z-10 w-full mt-2 py-2 bg-white rounded-lg shadow-xl dark:bg-lisabona-800">
              {nounsicon.map((elm, i) => (
                <button
                  key={i}
                  className="w-full px-4 py-2 text-left hover:bg-lisabona-50 dark:hover:bg-lisabona-600 flex items-center"
                  onClick={() => {
                    setActionForm({ ...actionForm, metadata: elm });
                    setShowIconDropdown(false);
                  }}
                >
                  <Image
                    width={20}
                    height={20}
                    src={elm.imageSrc}
                    alt={elm.title}
                    className="mr-2 rounded-full"
                  />
                  {elm.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {isMobile && currentStep === 1 && (
        <button
          onClick={handleNextStep}
          className="w-full mt-6 rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
        >
          Next
        </button>
      )}

      {showSocialModal && (
        <SocialConnectModal onClose={() => setShowSocialModal(false)} />
      )}
    </div>
  );

  const renderMobileNftAction = () => (
    <div className="w-full">
      <NftAction
        metadata={actionForm.metadata}
        dataFarcaster={socialData}
        handleWriteContract={handleWriteContract}
        isWritePending={isWritePending}
        isConfirming={isConfirming}
        hash={hash}
      />
      <button
        onClick={handlePreviousStep}
        className="w-full mt-4 rounded-full bg-lisabona-100 py-3 px-8 text-center font-semibold text-lisabona-700 transition-all hover:bg-lisabona-200"
      >
        Back to Form
      </button>
    </div>
  );

  return (
    <div className="container mx-auto px-4">
      <h1 className="mb-6 font-display text-3xl md:text-4xl lg:text-5xl text-white text-center mt-10">
        Create Your Digital Legacy Plan
      </h1>
      <div className="flex flex-col lg:flex-row justify-center gap-6 mt-10">
        {!isMobile && (
          <div className="w-full lg:w-[350px] mb-6 lg:mb-0">
            <NftAction
              metadata={actionForm.metadata}
              dataFarcaster={socialData}
              handleWriteContract={handleWriteContract}
              isWritePending={isWritePending}
              isConfirming={isConfirming}
              hash={hash}
            />
          </div>
        )}
        {(!isMobile || (isMobile && currentStep === 1)) && renderForm()}
        {isMobile && currentStep === 2 && renderMobileNftAction()}
      </div>
      <Toaster />
    </div>
  );
}
