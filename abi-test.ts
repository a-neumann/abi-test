import { erc20Abi } from "viem";

const config = {
    contracts: [
        {
            name: "WETH",
            abi: erc20Abi,
            address: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
        },
        {
            name: "LINK",
            abi: erc20Abi,
            address: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
        },
    ],
    chainId: 11155111,
};

export default config;
