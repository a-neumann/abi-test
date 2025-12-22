import { memo, useContext } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import { ChevronDown } from "lucide-react";
import { useConnection } from "wagmi";
import { ReadFunctionTester } from "./ReadFunctionTester";
import { WriteFunctionTester } from "./WriteFunctionTester";
import type { ResolvedContractConfig } from "../types";
import { Abi, AbiFunction } from "viem";
import { getContractId, resolveContractAddress } from "../utils";
import ContractsContext from "../contexts/ContractsContext";

const getFunctions = (abi: Abi): AbiFunction[] => {

    return abi.filter((item): item is AbiFunction => item.type === "function");
};

interface ContractTesterProps {
    contract: ResolvedContractConfig;
    expanded: boolean;
    toggleExpansion: (contractId: string) => void;
};

export const ContractTester: React.FC<ContractTesterProps> = memo(({ contract, expanded, toggleExpansion }) => {

    const { chainId } = useConnection();
    const { blockExplorerUrl } = useContext(ContractsContext);
    const functions = getFunctions(contract.abi);

    const viewFunctions = functions.filter(
        f => f.stateMutability === "view" || f.stateMutability === "pure"
    );
    const writeFunctions = functions.filter(
        f => f.stateMutability !== "view" && f.stateMutability !== "pure"
    );

    if (!chainId) {

        return null;
    }

    const contractAddress = resolveContractAddress(contract.address, chainId);

    if (!contractAddress) {

        return (
            <Alert severity="warning">
                Contract not deployed on chain {chainId}
            </Alert>
        );
    }

    return (

        <Accordion
            key={contract.name}
            expanded={expanded}
            onChange={() => toggleExpansion(getContractId(contract.name))}
            sx={{ mb: 2 }}
        >
            <AccordionSummary expandIcon={<ChevronDown />}>
                <Typography variant="h6">{contract.name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Address:{" "}
                        {blockExplorerUrl ? (
                            <Link
                                href={`${blockExplorerUrl}/address/${contractAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {contractAddress}
                            </Link>
                        ) : (
                            contractAddress
                        )}
                    </Typography>

                    {viewFunctions.length > 0 && (
                        <>
                            <Typography variant="h6" sx={{ mt: 2 }}>
                                Read Functions
                            </Typography>
                            {viewFunctions.map(func => (
                                <ReadFunctionTester
                                    key={func.name}
                                    func={func}
                                    contractName={contract.name}
                                    contractAddress={contractAddress}
                                    abi={contract.abi}
                                    enums={contract.enums}
                                />
                            ))}
                        </>
                    )}

                    {writeFunctions.length > 0 && (
                        <>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6">Write Functions</Typography>
                            {writeFunctions.map(func => (
                                <WriteFunctionTester
                                    key={func.name}
                                    func={func}
                                    contractName={contract.name}
                                    contractAddress={contractAddress}
                                    abi={contract.abi}
                                    enums={contract.enums}
                                />
                            ))}
                        </>
                    )}
                </Box>
            </AccordionDetails>
        </Accordion>
    );
});
