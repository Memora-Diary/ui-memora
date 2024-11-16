export interface Trigger {
  condition: string;
  status: boolean;
  weight: number;
  operator?: 'AND' | 'OR';
}

export interface NFTData {
  id: bigint;
  judge: string;
  heir: string;
  isTriggerDeclared: boolean;
  isHeirSigned: boolean;
  minter: string;
  prompt: string;
  actions: number;
  triggerTimestamp: bigint;
  balance: bigint;
  uri: string;
  image: string;
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

export interface RawNFTData extends Array<any> {
  [0]: string;  // judge
  [1]: string;  // heir
  [2]: boolean; // isTriggerDeclared
  [3]: boolean; // isHeirSigned
  [4]: string;  // minter
  [5]: string;  // prompt
  [6]: number;  // actions
  [7]: bigint;  // triggerTimestamp
  [8]: bigint;  // balance
  [9]: string;  // uri
}