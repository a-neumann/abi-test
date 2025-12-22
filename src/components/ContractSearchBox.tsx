import { useState, useMemo, useCallback, useDeferredValue, useRef, useEffect, useContext } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Fab from "@mui/material/Fab";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { Search, X, ChevronsDownUp } from "lucide-react";
import type { AbiFunction } from "viem";
import type { ResolvedContractConfig } from "../types";
import { getContractId, getFunctionId } from "../utils";
import AccordionContext from "../contexts/AccordionContext";

interface SearchResult {
    type: "contract" | "function";
    contractName: string;
    functionName?: string;
    label: string;
};

interface SearchFieldProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    setSelectedIndex: (index: number) => void;
    handleKeyDown: (e: React.KeyboardEvent) => void;
    inputRef?: React.Ref<HTMLInputElement>;
};

const SearchField: React.FC<SearchFieldProps> = ({
    searchQuery,
    setSearchQuery,
    setSelectedIndex,
    handleKeyDown,
    inputRef,
}) => (
    <TextField
        fullWidth
        placeholder="Search contracts and functions..."
        value={searchQuery}
        onChange={e => {

            setSearchQuery(e.target.value);
            setSelectedIndex(0);
        }}
        onKeyDown={handleKeyDown}
        inputRef={inputRef}
        slotProps={{
            input: {
                startAdornment: (
                    <InputAdornment position="start">
                        <Search size={20} />
                    </InputAdornment>
                ),
                endAdornment: searchQuery && (
                    <InputAdornment position="end">
                        <IconButton
                            size="small"
                            onClick={() => {

                                setSearchQuery("");
                                setSelectedIndex(0);
                            }}
                        >
                            <X size={18} />
                        </IconButton>
                    </InputAdornment>
                ),
            },
        }}
        size="small"
    />
);

interface ResultsListProps {
    searchResults: SearchResult[];
    selectedIndex: number;
    handleResultSelect: (result: SearchResult) => void;
};

const ResultsList: React.FC<ResultsListProps> = ({
    searchResults,
    selectedIndex,
    handleResultSelect,
}) => {

    if (searchResults.length === 0) return null;

    return (
        <Paper
            sx={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                zIndex: 10,
                maxHeight: 300,
                overflow: "auto",
                mt: 0.5,
            }}
        >
            <List dense>
                {searchResults.map((result, index) => (
                    <ListItemButton
                        key={result.label}
                        selected={index === selectedIndex}
                        onClick={() => handleResultSelect(result)}
                    >
                        <ListItemText
                            primary={result.label}
                            secondary={result.type === "contract" ? "Contract" : "Function"}
                        />
                    </ListItemButton>
                ))}
            </List>
        </Paper>
    );
};

interface ContractSearchBoxProps {
    contracts: ResolvedContractConfig[];
};

export const ContractSearchBox: React.FC<ContractSearchBoxProps> = ({ contracts }) => {

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isSearchBarVisible, setIsSearchBarVisible] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const searchBarRef = useRef<HTMLDivElement>(null);
    const modalInputRef = useRef<HTMLInputElement>(null);
    const deferredSearchQuery = useDeferredValue(searchQuery);

    const { expand, collapseAll } = useContext(AccordionContext);

    useEffect(() => {

        const observer = new IntersectionObserver(
            ([entry]) => {

                setIsSearchBarVisible(entry.isIntersecting);
            },
            { threshold: 0 }
        );

        if (searchBarRef.current) {

            observer.observe(searchBarRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const searchResults = useMemo(() => {

        if (!deferredSearchQuery.trim()) return [];
        const query = deferredSearchQuery.toLowerCase();
        const results: SearchResult[] = [];

        contracts.forEach(contract => {

            if (contract.name.toLowerCase().includes(query)) {

                results.push({
                    type: "contract",
                    contractName: contract.name,
                    label: contract.name,
                });
            }

            const functions = contract.abi.filter(
                (item): item is AbiFunction => item.type === "function"
            );
            functions.forEach(func => {

                if (func.name.toLowerCase().includes(query)) {

                    results.push({
                        type: "function",
                        contractName: contract.name,
                        functionName: func.name,
                        label: `${contract.name}.${func.name}`,
                    });
                }
            });
        });

        return results;
    }, [deferredSearchQuery, contracts]);

    const handleResultSelect = useCallback((result: SearchResult) => {

        setSearchQuery("");
        setSelectedIndex(0);
        setIsModalOpen(false);

        const contractId = getContractId(result.contractName);
        expand(contractId);

        if (result.type === "function" && result.functionName) {

            const functionId = getFunctionId(result.contractName, result.functionName);
            expand(functionId);

            setTimeout(() => {

                document.getElementById(functionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
        } else {

            setTimeout(() => {

                document.getElementById(contractId)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
        }
    }, [expand]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {

        if (searchResults.length === 0) return;

        if (e.key === "ArrowDown") {

            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
        } else if (e.key === "ArrowUp") {

            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === "Enter") {

            e.preventDefault();
            handleResultSelect(searchResults[selectedIndex]);
        }
    }, [searchResults, selectedIndex, handleResultSelect]);

    return (
        <>
            <Box ref={searchBarRef} sx={{ position: "relative", mb: 3, display: "flex", gap: 1, alignItems: "center" }}>
                <SearchField
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    setSelectedIndex={setSelectedIndex}
                    handleKeyDown={handleKeyDown}
                />
                <Tooltip title="Collapse all">
                    <IconButton onClick={collapseAll} size="small">
                        <ChevronsDownUp size={20} />
                    </IconButton>
                </Tooltip>
                <ResultsList
                    searchResults={searchResults}
                    selectedIndex={selectedIndex}
                    handleResultSelect={handleResultSelect}
                />
            </Box>

            {!isSearchBarVisible && (
                <Fab
                    color="primary"
                    size="medium"
                    onClick={() => setIsModalOpen(true)}
                    sx={{
                        position: "fixed",
                        bottom: 24,
                        right: 24,
                        zIndex: 1000,
                    }}
                >
                    <Search size={24} />
                </Fab>
            )}

            <Dialog
                open={isModalOpen}
                onClose={() => {

                    setIsModalOpen(false);
                    setSearchQuery("");
                    setSelectedIndex(0);
                }}
                maxWidth="sm"
                fullWidth
                slotProps={{
                    paper: {
                        sx: { overflow: "visible" },
                    },
                    transition: {
                        onEntered: () => {

                            modalInputRef.current?.focus();
                        },
                    },
                }}
            >
                <DialogContent sx={{ overflow: "visible" }}>
                    <Box sx={{ position: "relative" }}>
                        <SearchField
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            setSelectedIndex={setSelectedIndex}
                            handleKeyDown={handleKeyDown}
                            inputRef={modalInputRef}
                        />
                        <ResultsList
                            searchResults={searchResults}
                            selectedIndex={selectedIndex}
                            handleResultSelect={handleResultSelect}
                        />
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};
