// React root for rendering AbiTest in standalone mode (CLI)
import { createRoot } from "react-dom/client";
import AbiTest from "./AbiTest";
import type { ResolvedAbiTestConfig } from "./types";
import { createConfig, http, WagmiProvider } from "wagmi";
import * as chains from "wagmi/chains";
import type { Chain } from "viem";
import { ThemeProvider } from "@emotion/react";
import themeOptions from "./defaultTheme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import "@fontsource/jersey-10/index.css";

declare global {
    interface Window {
        __ABI_TEST_CONFIG__?: ResolvedAbiTestConfig;
    }
}

const abiTestConfig = window.__ABI_TEST_CONFIG__ ?? { contracts: [] };

const targetChain = (Object.values(chains) as Chain[])
    .find(c => typeof c === "object" && c && "id" in c && c.id === abiTestConfig.chainId);

if (!targetChain) {

    throw new Error(`Unknown chainId: ${abiTestConfig.chainId}`);
}

const rpcUrl = abiTestConfig.rpcUrl || targetChain.rpcUrls.default.http[0];

const popularTestnets: Chain[] = [
    chains.sepolia,
    chains.holesky,
    chains.polygonAmoy,
    chains.arbitrumSepolia,
    chains.optimismSepolia,
    chains.baseSepolia,
    chains.foundry,
].filter(c => c.id !== targetChain.id);

const allChains = [targetChain, ...popularTestnets] as const;

export const wagmiConfig = createConfig({
    chains: allChains,
    transports: Object.fromEntries(
        allChains.map(c => [c.id, c.id === targetChain.id ? http(rpcUrl) : http()])
    ) as Record<number, ReturnType<typeof http>>,
});

const root = document.getElementById("root");

if (root) {

    const queryClient = new QueryClient();

    createRoot(root).render(
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider theme={createTheme(themeOptions)}>
                    <CssBaseline />
                    <GlobalStyles
                        styles={t => ({
                            body: {
                                backgroundColor: t.palette.background.default,
                            },
                            input: {
                                "color-scheme": t.palette.mode,
                            },
                        })}
                    />
                    <AbiTest
                        contracts={abiTestConfig.contracts}
                        blockExplorerUrl={abiTestConfig.blockExplorerUrl}
                        chainId={abiTestConfig.chainId}
                    />
                </ThemeProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
