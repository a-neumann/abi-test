import { useChainId, useChains, useConnection, useSwitchChain } from "wagmi";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Popover from "@mui/material/Popover";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { ChevronDown, Network, TriangleAlert } from "lucide-react";
import type { Chain } from "viem";

const filterOptions = createFilterOptions<Chain>({
    stringify: chain => `${chain.name} ${chain.id}`,
});

interface NetworkControlProps {
    targetChainId?: number;
}

export const NetworkControl: React.FC<NetworkControlProps> = ({ targetChainId }) => {

    const { isConnected } = useConnection();
    const chains = useChains();
    const currentChainId = useChainId();
    const { mutate: switchChain } = useSwitchChain();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const currentChain = chains.find(c => c.id === currentChainId);
    const targetChain = targetChainId ? chains.find(c => c.id === targetChainId) : undefined;

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {

        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {

        setAnchorEl(null);
    };

    const handleChainSelect = (_event: React.SyntheticEvent, chain: Chain | null) => {

        if (chain) {

            switchChain({ chainId: chain.id });
            handleClose();
        }
    };

    if (!isConnected) {

        return null;
    }

    return (
        <>
            <Button
                onClick={handleClick}
                startIcon={
                    (targetChainId && currentChainId !== targetChainId) ?
                        <TriangleAlert size={18} /> :
                        <Network size={18} />
                }
                endIcon={<ChevronDown size={16} />}
                color={targetChainId && currentChainId !== targetChainId ? "warning" : "inherit"}
            >
                <Typography variant="body2" fontWeight={500}>
                    {currentChain?.name || "Unknown"}
                </Typography>
            </Button>

            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{
                    paper: {
                        sx: { marginTop: 1, padding: 2, minWidth: 280 },
                    },
                }}
            >
                <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                    Switch Network
                </Typography>
                {targetChain && currentChainId !== targetChainId && (
                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => {

                            switchChain({ chainId: targetChain.id });
                            handleClose();
                        }}
                        sx={{ marginBottom: 1.5 }}
                    >
                        Switch to {targetChain.name}
                    </Button>
                )}
                <Autocomplete
                    options={chains}
                    getOptionLabel={chain => chain.name}
                    filterOptions={filterOptions}
                    value={currentChain || null}
                    onChange={handleChainSelect}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={params => (
                        <TextField
                            {...params}
                            placeholder="Search by name or chain ID..."
                            size="small"
                            autoFocus
                        />
                    )}
                    renderOption={(props, chain) => (
                        <Box component="li" {...props} key={chain.id}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                                <Network size={16} />
                                <Typography variant="body2">{chain.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    ({chain.id})
                                </Typography>
                                {chain.id === currentChainId && (
                                    <Typography variant="caption" color="primary" sx={{ ml: "auto" }}>
                                        Connected
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    )}
                />
            </Popover>
        </>
    );
};
