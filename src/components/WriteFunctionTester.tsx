import { useState, useCallback, useEffect, useContext } from "react";
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
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import type { Abi, AbiFunction, Log } from "viem";
import { AbiInput } from "./AbiInput";
import { FunctionSignature } from "./FunctionSignature";
import { LogsView } from "./LogsView";
import { parseInputValue, getFunctionId } from "../utils";
import type { EnumMapping } from "../types";
import AccordionContext from "../contexts/AccordionContext";
import ContractsContext from "../contexts/ContractsContext";

interface TransactionRecord {
    hash: `0x${string}`;
    status: "pending" | "confirmed" | "failed";
    logs?: Log[];
    timestamp: number;
};

interface WriteFunctionTesterProps {
    func: AbiFunction;
    contractName: string;
    contractAddress: `0x${string}`;
    abi: Abi;
    enums?: EnumMapping;
};

export const WriteFunctionTester: React.FC<WriteFunctionTesterProps> = ({
    func,
    contractName,
    contractAddress,
    abi,
    enums,
}) => {

    const { blockExplorerUrl } = useContext(ContractsContext);
    const { isExpanded, toggle } = useContext(AccordionContext);
    const [inputs, setInputs] = useState<Record<string, string>>({});
    const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
    const [visibleCount, setVisibleCount] = useState(3);

    const functionId = getFunctionId(contractName, func.name);

    const { writeContract, data: hash, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess, isError: isReceiptError, data: receipt } = useWaitForTransactionReceipt({
        hash,
    });

    const [parseError, setParseError] = useState<string | null>(null);

    useEffect(() => {

        if (hash) {

            setTransactions(prev => {

                const exists = prev.some(tx => tx.hash === hash);

                if (exists) return prev;

                return [
                    { hash, status: "pending", timestamp: Date.now() },
                    ...prev,
                ];
            });
        }
    }, [hash]);

    useEffect(() => {

        if (isSuccess && hash && receipt) {

            setTransactions(prev =>
                prev.map(tx =>
                    tx.hash === hash ?
                        { ...tx, status: "confirmed", logs: receipt.logs } :
                        tx
                )
            );
        }
    }, [isSuccess, hash, receipt]);

    useEffect(() => {

        if (isReceiptError && hash) {

            setTransactions(prev =>
                prev.map(tx =>
                    tx.hash === hash ? { ...tx, status: "failed" } : tx
                )
            );
        }
    }, [isReceiptError, hash]);

    const handleWrite = useCallback(() => {

        try {

            setParseError(null);
            const args = func.inputs.map((input, idx) => {

                const key = input.name || `arg${idx}`;

                return parseInputValue(inputs[key] || "", input);
            });

            writeContract({
                address: contractAddress,
                abi,
                functionName: func.name,
                args: func.inputs.length > 0 ? args : undefined,
            });
        } catch (e) {

            setParseError(e instanceof Error ? e.message : "Failed to parse inputs");
        }
    }, [func, inputs, contractAddress, abi, writeContract]);

    const handleInputChange = (key: string, value: string) => {

        setInputs(prev => ({ ...prev, [key]: value }));
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
                    {func.stateMutability === "payable" && (
                        <Chip
                            label="payable"
                            size="small"
                            color="warning"
                            variant="outlined"
                        />
                    )}
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
                        onClick={handleWrite}
                        disabled={isPending || isConfirming}
                        color="warning"
                        startIcon={
                            isPending || isConfirming ? <CircularProgress size={16} /> : null
                        }
                        sx={{ maxWidth: { sm: 200 } }}
                    >
                        {
                            isPending ? "Confirm in wallet..." :
                            isConfirming ? "Confirming..." :
                            "Write"
                        }
                    </Button>
                    {(error || parseError) && (
                        <Alert severity="error" sx={{ wordBreak: "break-word" }}>
                            {parseError || error?.message}
                        </Alert>
                    )}
                    {transactions.slice(0, visibleCount).map(tx => (
                        <Alert
                            key={tx.hash}
                            severity={tx.status === "confirmed" ? "success" : tx.status === "failed" ? "error" : "info"}
                            sx={{ wordBreak: "break-word" }}
                        >
                            <Typography variant="body2" fontWeight="bold">
                                {tx.status === "pending" ? "Pending..." : tx.status === "failed" ? "Failed" : "Confirmed"}
                            </Typography>
                            <Typography variant="body2" marginTop={0.5}>
                                Hash:{" "}
                                {blockExplorerUrl ? (
                                    <Link
                                        href={`${blockExplorerUrl}/tx/${tx.hash}`}
                                        target="_blank"
                                        rel="noopener"
                                    >
                                        {tx.hash}
                                    </Link>
                                ) : (
                                    tx.hash
                                )}
                            </Typography>
                            {tx.logs && tx.logs.length > 0 && (
                                <LogsView logs={tx.logs} />
                            )}
                        </Alert>
                    ))}
                    {(transactions.length > visibleCount || transactions.length > 0) && (
                        <Box display="flex" gap={2} alignItems="center" justifyContent="space-between">
                            {transactions.length > visibleCount ? (
                                <Button
                                    variant="text"
                                    onClick={() => setVisibleCount(prev => prev + 3)}
                                >
                                    Show more ({transactions.length - visibleCount} remaining)
                                </Button>
                            ) : (
                                <Box />
                            )}
                            {transactions.length > 0 && (
                                <Button
                                    variant="text"
                                    onClick={() => {

                                        setTransactions([]);
                                        setVisibleCount(3);
                                    }}
                                >
                                    Clear logs
                                </Button>
                            )}
                        </Box>
                    )}
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};
