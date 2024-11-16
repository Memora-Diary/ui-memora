interface Trigger {
  condition: string;
  status: boolean;
  weight: number;
  operator?: 'AND' | 'OR';
}

export interface TransformedNFTData {
  id: string;
  image: string;
  triggers: Trigger[];
  action: number;
  balance: bigint;
  heir: string;
  isHeirSigned: boolean;
  isTriggerDeclared: boolean;
  judge: string;
  minter: string;
  triggerTimestamp: bigint;
} 