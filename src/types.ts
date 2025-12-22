import type { Abi } from "viem";

export type EnumMapping = Record<string, string[]>;

/** Config file format - abi can be array, file path, or undefined (fetched from API) */
export interface ContractConfig {
    name: string;
    /** ABI array, path to ABI JSON file (relative to config), or undefined to fetch from API */
    abi?: Abi | string;
    address: string | Record<number, `0x${string}`>;
    enums?: EnumMapping;
}

/** Resolved format for runtime use - abi is always resolved to Abi array */
export interface ResolvedContractConfig {
    name: string;
    abi: Abi;
    address: string | Record<number, `0x${string}`>;
    enums?: EnumMapping;
}

export type InputMode = "text" | "datetime";

export interface AddressOption {
    address: `0x${string}`;
    label: string;
}

/** Config file format - used when loading from abi-test.config.ts/js/json */
export interface AbiTestConfig {
    contracts: ContractConfig[];
    blockExplorerUrl?: string;
    rpcUrl?: string;
    chainId?: number;
    apiUrl?: string;
    apiKey?: string;
    port?: number;
}

/** Resolved config format - used at runtime after ABIs are resolved */
export interface ResolvedAbiTestConfig {
    contracts: ResolvedContractConfig[];
    blockExplorerUrl?: string;
    rpcUrl?: string;
    chainId?: number;
}
