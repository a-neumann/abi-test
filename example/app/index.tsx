import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { createConfig, http, WagmiProvider } from "wagmi";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { foundry } from "viem/chains";
import { AbiTest, type ResolvedContractConfig } from "abi-test";
import { mockUsdAbi, demoVaultAbi } from "./abis";
import { MockUSDAddresses, DemoVaultAddresses } from "./addresses";
import { Home } from "./Home";

const config = createConfig({
    chains: [foundry],
    connectors: [injected()],
    transports: {
        [foundry.id]: http(),
    },
});

const contracts: ResolvedContractConfig[] = [
    {
        name: "MockUSD",
        abi: mockUsdAbi,
        address: MockUSDAddresses,
    },
    {
        name: "DemoVault",
        abi: demoVaultAbi,
        address: DemoVaultAddresses,
        enums: {
            VaultStatus: ["Active", "Paused", "Closed"],
        },
    },
];

// Create MUI theme
const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#1976d2",
        },
        secondary: {
            main: "#dc004e",
        },
    },
});

// Create React Query client
const queryClient = new QueryClient();

createRoot(document.body).render(
    <StrictMode>
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <HashRouter>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/dev" element={<AbiTest chainId={foundry.id} contracts={contracts} />} />
                        </Routes>
                    </HashRouter>
                </ThemeProvider>
            </QueryClientProvider>
        </WagmiProvider>
    </StrictMode>
);
