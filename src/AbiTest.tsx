import { useBalance, useConnection } from "wagmi";
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
import { WalletControl } from "./components/WalletControl";

export interface AbiTestProps {
    contracts: ResolvedContractConfig[];
    /** Base URL for the block explorer (e.g., "https://etherscan.io"). If not set, links won't be rendered. */
    blockExplorerUrl?: string;
};

const AbiTest: React.FC<AbiTestProps> = ({ contracts, blockExplorerUrl }) => {

    const accordion = useCreateAccordionContext();

    const { isConnected, address } = useConnection();
    const { data: balance, isError: balanceError } = useBalance({ address });

    const hasNoBalance = balance && balance.value === 0n;

    return (
        <ContractsContext.Provider value={{ contracts, blockExplorerUrl: blockExplorerUrl?.replace(/\/+$/, "") }}>
            <AccordionContext.Provider value={accordion}>
                <Container maxWidth="lg" sx={{ py: 4 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                        <Typography variant="h4">
                            ABI test dashboard
                        </Typography>
                        <WalletControl />
                    </Box>

                    <ContractSearchBox contracts={contracts} />

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
