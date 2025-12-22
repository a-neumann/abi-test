import { useBalance, useChains, useConnection, useConnectors, useEnsAvatar, useEnsName } from "wagmi";
import { connect, disconnect } from "wagmi/actions";
import { useConfig } from "wagmi";
import { mainnet } from "wagmi/chains";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { useState } from "react";
import { formatUnits } from "viem/utils";
import { LogOut, Wallet, ChevronDown, Copy, Check } from "lucide-react";
import Blockies from "blockies-react-svg";
import { formatAddress } from "../utils";

interface WalletControlProps {
    showBalance?: boolean;
}

export const WalletControl: React.FC<WalletControlProps> = ({ showBalance = true }) => {

    const config = useConfig();
    const { address, isConnected, chainId } = useConnection();
    const chains = useChains();
    const connectors = useConnectors();
    const { data: balance } = useBalance({ address });

    // ENS resolution (only on mainnet or when mainnet is available)
    const { data: ensName } = useEnsName({
        address,
        chainId: mainnet.id,
    });
    const { data: ensAvatar } = useEnsAvatar({
        name: ensName ?? undefined,
        chainId: mainnet.id,
    });

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [connectAnchorEl, setConnectAnchorEl] = useState<null | HTMLElement>(null);
    const [copied, setCopied] = useState(false);

    const chain = chains.find(c => c.id === chainId);
    const displayName = ensName || (address ? formatAddress(address) : "");

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {

        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {

        setAnchorEl(null);
    };

    const handleConnectClick = (event: React.MouseEvent<HTMLElement>) => {

        setConnectAnchorEl(event.currentTarget);
    };

    const handleConnectClose = () => {

        setConnectAnchorEl(null);
    };

    const handleCopyAddress = async () => {

        if (address) {

            await navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDisconnect = () => {

        disconnect(config);
        handleClose();
    };

    if (!isConnected) {

        return (
            <>
                <Button
                    variant="contained"
                    startIcon={<Wallet size={18} />}
                    onClick={handleConnectClick}
                    sx={{ textTransform: "none" }}
                >
                    Connect Wallet
                </Button>
                <Menu
                    anchorEl={connectAnchorEl}
                    open={Boolean(connectAnchorEl)}
                    onClose={handleConnectClose}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                    {connectors.map(connector => (
                        <MenuItem
                            key={connector.uid}
                            onClick={() => {

                                connect(config, { connector });
                                handleConnectClose();
                            }}
                        >
                            <ListItemIcon>
                                <Wallet size={18} />
                            </ListItemIcon>
                            <ListItemText>{connector.name}</ListItemText>
                        </MenuItem>
                    ))}
                </Menu>
            </>
        );
    }

    return (
        <>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {/* Wallet button */}
                <Tooltip title={address || ""} arrow>
                    <Button
                        onClick={handleClick}
                        sx={{
                            "textTransform": "none",
                            "color": "text.primary",
                            "bgcolor": "action.hover",
                            "&:hover": { bgcolor: "action.selected" },
                            "borderRadius": 2,
                            "px": 1.5,
                            "py": 0.75,
                        }}
                        endIcon={<ChevronDown size={16} />}
                    >
                        {ensAvatar ? (
                            <Avatar
                                src={ensAvatar}
                                sx={{
                                    width: 24,
                                    height: 24,
                                    mr: 1,
                                    border: "1px solid",
                                    borderColor: "divider",
                                }}
                            />
                        ) : (
                            <Box sx={{ width: 24, height: 24, mr: 1, borderRadius: "50%", overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
                                <Blockies address={address || ""} size={8} scale={3} />
                            </Box>
                        )}
                        <Typography variant="body2" fontWeight={500}>
                            {displayName}
                        </Typography>
                    </Button>
                </Tooltip>
            </Box>

            {/* Dropdown menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                PaperProps={{
                    sx: { minWidth: 240, mt: 1 },
                }}
            >
                {/* Address and avatar header */}
                <Box sx={{ px: 2, py: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                        {ensAvatar ? (
                            <Avatar
                                src={ensAvatar}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    border: "2px solid",
                                    borderColor: "divider",
                                }}
                            />
                        ) : (
                            <Box sx={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", border: "2px solid", borderColor: "divider" }}>
                                <Blockies address={address || ""} size={8} scale={5} />
                            </Box>
                        )}
                        <Box>
                            {ensName && (
                                <Typography variant="body2" fontWeight={600}>
                                    {ensName}
                                </Typography>
                            )}
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                {address ? formatAddress(address) : ""}
                            </Typography>
                        </Box>
                    </Box>

                    {chain && (
                        <Typography variant="body2" color="text.secondary">
                            {chain.name}
                        </Typography>
                    )}
                    {showBalance && balance && (
                        <Typography variant="body2" color="text.secondary">
                            {formatUnits(balance.value, balance.decimals)} {balance.symbol}
                        </Typography>
                    )}
                </Box>

                <Divider />

                {/* Copy address */}
                <MenuItem onClick={handleCopyAddress}>
                    <ListItemIcon>
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                    </ListItemIcon>
                    <ListItemText>{copied ? "Copied!" : "Copy Address"}</ListItemText>
                </MenuItem>

                <Divider />

                {/* Disconnect */}
                <MenuItem onClick={handleDisconnect} sx={{ color: "error.main" }}>
                    <ListItemIcon color="inherit">
                        <LogOut size={18} />
                    </ListItemIcon>
                    <ListItemText>Disconnect</ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
};
