import { useEffect } from "react";
import { useBalance, useChainId, useConnection, useSwitchChain } from "wagmi";
import AccordionContext, { useCreateAccordionContext } from "./contexts/AccordionContext";
import ContractsContext from "./contexts/ContractsContext";
import { ResolvedContractConfig } from "./types";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { ContractSearchBox } from "./components/ContractSearchBox";
import Alert from "@mui/material/Alert";
import { getContractId } from "./utils";
import { ContractTester } from "./components/ContractTester";
import { NetworkControl } from "./components/NetworkControl";
import { WalletControl } from "./components/WalletControl";

export interface AbiTestProps {
    contracts: ResolvedContractConfig[];
    /** Base URL for the block explorer (e.g., "https://etherscan.io"). If not set, links won't be rendered. */
    blockExplorerUrl?: string;
    chainId?: number;
};

const AbiTest: React.FC<AbiTestProps> = ({ contracts, blockExplorerUrl, chainId }) => {

    const accordion = useCreateAccordionContext();

    const { isConnected, address } = useConnection();
    const { data: balance, isError: balanceError } = useBalance({ address });
    const { mutate: switchChain } = useSwitchChain();
    const currentChainId = useChainId();

    useEffect(() => {

        if (chainId && isConnected) {

            switchChain({ chainId });
        }
    }, [chainId, isConnected, switchChain]);

    const hasNoBalance = balance && balance.value === 0n;
    const mainnetChainIds = [1, 137, 56, 43114, 42161, 10, 8453, 250, 100];
    const isMainnet = currentChainId && mainnetChainIds.includes(currentChainId);

    return (
        <ContractsContext.Provider value={{ contracts, blockExplorerUrl: blockExplorerUrl?.replace(/\/+$/, "") }}>
            <AccordionContext.Provider value={accordion}>
                <Container maxWidth="lg" sx={{ py: 4 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                        <Typography variant="h4">
                            ABI test dashboard
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                            <NetworkControl />
                            <WalletControl />
                        </Box>
                    </Box>

                    <ContractSearchBox contracts={contracts} />

                    {isConnected && isMainnet && (
                        <Alert severity="warning" sx={{ mb: 3 }}>
                            You are connected to a mainnet. Be careful when sending transactions as they will use real funds.
                        </Alert>
                    )}

                    {isConnected && hasNoBalance && (
                        <Alert severity="warning" sx={{ mb: 3 }}>
                            You have no ETH on this chain. You won't be able to send transactions.
                        </Alert>
                    )}

                    {isConnected && balanceError && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            Could not contact chain. Please check that the RPC endpoint is reachable.
                        </Alert>
                    )}

                    {contracts.map(contract => (
                        <ContractTester
                            key={contract.name}
                            contract={contract}
                            expanded={accordion.isExpanded(getContractId(contract.name))}
                            toggleExpansion={accordion.toggle}
                        />
                    ))}
                </Container>
            </AccordionContext.Provider>
        </ContractsContext.Provider>
    );
};

export default AbiTest;
