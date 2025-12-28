import { useState, useCallback, useContext } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Chip from "@mui/material/Chip";
import { ChevronDown } from "lucide-react";
import { useReadContract } from "wagmi";
import type { Abi, AbiFunction } from "viem";
import { AbiInput } from "./AbiInput";
import { FunctionSignature } from "./FunctionSignature";
import { parseInputValue, formatResult, getFunctionId } from "../utils";
import type { EnumMapping } from "../types";
import ContractsContext from "../contexts/ContractsContext";
import AccordionContext from "../contexts/AccordionContext";

const isAddress = (value: string): boolean => /^0x[a-fA-F0-9]{40}$/.test(value);

interface ReadFunctionTesterProps {
    func: AbiFunction;
    contractName: string;
    contractAddress: `0x${string}`;
    abi: Abi;
    enums?: EnumMapping;
};

const renderResultWithLinks = (result: string, blockExplorerUrl?: string): React.ReactNode => {

    if (!blockExplorerUrl) {

        return result;
    }

    const addressRegex = /(0x[a-fA-F0-9]{40})/g;
    const parts = result.split(addressRegex);

    return parts.map((part, index) => {

        if (isAddress(part)) {

            return (
                <Link
                    key={index}
                    href={`${blockExplorerUrl}/address/${part}`}
                    target="_blank"
                    rel="noopener"
                >
                    {part}
                </Link>
            );
        }

        return part;
    });
};

export const ReadFunctionTester: React.FC<ReadFunctionTesterProps> = ({
    func,
    contractName,
    contractAddress,
    abi,
    enums,
}) => {

    const { blockExplorerUrl } = useContext(ContractsContext);
    const { isExpanded, toggle } = useContext(AccordionContext);
    const [inputs, setInputs] = useState<Record<string, string>>({});
    const [parsedArgs, setParsedArgs] = useState<unknown[] | undefined>(undefined);

    const functionId = getFunctionId(contractName, func.name);

    const { data, isLoading, error, refetch } = useReadContract({
        address: contractAddress,
        abi,
        functionName: func.name,
        args: parsedArgs,
        query: {
            enabled: parsedArgs !== undefined,
        },
    });

    const [parseError, setParseError] = useState<string | null>(null);

    const handleRead = useCallback(() => {

        try {

            setParseError(null);
            const args = func.inputs.map((input, idx) => {

                const key = input.name || `arg${idx}`;

                return parseInputValue(inputs[key] || "", input);
            });
            setParsedArgs(func.inputs.length > 0 ? args : []);

            if (parsedArgs !== undefined) {

                refetch();
            }
        } catch (e) {

            setParseError(e instanceof Error ? e.message : "Failed to parse inputs");
        }
    }, [func.inputs, inputs, parsedArgs, refetch]);

    const handleInputChange = (key: string, value: string) => {

        setInputs(prev => ({ ...prev, [key]: value }));
        setParsedArgs(undefined);
        setParseError(null);
    };

    return (
        <Accordion
            disableGutters
            id={functionId}
            expanded={isExpanded(functionId)}
            onChange={() => toggle(functionId)}
            elevation={2}
        >
            <AccordionSummary expandIcon={<ChevronDown />}>
                <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                        label={func.stateMutability}
                        size="small"
                        color={func.stateMutability === "pure" ? "secondary" : "info"}
                        variant="outlined"
                    />
                    <FunctionSignature func={func} />
                </Box>
            </AccordionSummary>
            <AccordionDetails>
                <Box display="flex" flexDirection="column" gap={2}>
                    {func.inputs.map((input, idx) => {

                        const key = input.name || `arg${idx}`;

                        return (
                            <AbiInput
                                key={key}
                                param={input}
                                value={inputs[key] || ""}
                                onChange={value => handleInputChange(key, value)}
                                enums={enums}
                            />
                        );
                    })}
                    <Button
                        variant="contained"
                        onClick={handleRead}
                        disabled={isLoading}
                        startIcon={isLoading ? <CircularProgress size={16} /> : null}
                        sx={{ maxWidth: { sm: 200 } }}
                    >
                        {isLoading ? "Reading..." : "Read"}
                    </Button>
                    {(error || parseError) && (
                        <Alert severity="error" sx={{ wordBreak: "break-word" }}>
                            {parseError || error?.message}
                        </Alert>
                    )}
                    {data !== undefined && (
                        <Alert severity="info" sx={{ p: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Result:
                            </Typography>
                            <Typography
                                component="pre"
                                sx={{
                                    fontFamily: "monospace",
                                    fontSize: "0.85rem",
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-word",
                                    m: 0,
                                }}
                            >
                                {renderResultWithLinks(formatResult(data), blockExplorerUrl)}
                            </Typography>
                        </Alert>
                    )}
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};
