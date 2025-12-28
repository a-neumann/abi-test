import { useChainId, useChains, useConnection, useSwitchChain } from "wagmi";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Popover from "@mui/material/Popover";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { ChevronDown, Network } from "lucide-react";
import type { Chain } from "viem";

export const NetworkControl: React.FC = () => {

    const { isConnected } = useConnection();
    const chains = useChains();
    const currentChainId = useChainId();
    const { mutate: switchChain } = useSwitchChain();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const currentChain = chains.find(c => c.id === currentChainId);

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
                startIcon={<Network size={18} />}
                endIcon={<ChevronDown size={16} />}
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
                <Autocomplete
                    options={chains}
                    getOptionLabel={chain => chain.name}
                    value={currentChain || null}
                    onChange={handleChainSelect}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={params => (
                        <TextField
                            {...params}
                            placeholder="Search networks..."
                            size="small"
                            autoFocus
                        />
                    )}
                    renderOption={(props, chain) => (
                        <Box component="li" {...props} key={chain.id}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Network size={16} />
                                <Typography variant="body2">{chain.name}</Typography>
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
