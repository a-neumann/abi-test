import { createContext, useContext } from "react";
import { ResolvedContractConfig } from "../types";

interface ContractsContextValue {
    contracts: ResolvedContractConfig[];
    blockExplorerUrl?: string;
};

const ContractsContext = createContext<ContractsContextValue>({ contracts: [] });

export const useContractsContext = () => useContext(ContractsContext);

export default ContractsContext;
