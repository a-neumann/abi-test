import erc20Abi from "./erc20.json";

const config = {
    contracts: [
        {
            name: "BAYCxx",
            abi: erc20Abi,
            address: "0x1ef840cfaaf7225f37388fcd1669ae7e17072ef4",
        },
    ],
    chainId: 1,
};

export default config;
