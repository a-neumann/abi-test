import { defineConfig } from "@wagmi/cli";
import { foundry } from "@wagmi/cli/plugins";

export default defineConfig({
    out: "app/abis.ts",
    plugins: [
        foundry({
            artifacts: "dist/contracts",
            exclude: [
                // Forge/foundry standard library
                "Std*",
                "Vm.sol/**",
                "Test.sol/**",
                "Script.sol/**",
                "Base.sol/**",
                "*console.sol/**",
                // Common interfaces & OpenZeppelin (provided by wagmi/viem)
                "IERC*",
                "ERC20.sol/**",
                "IMulticall3.sol/**",
                "Context.sol/**",
                "Ownable.sol/**",
                "draft-*.sol/**",
                // Scripts & tests
                "*.s.sol/**",
                "*.t.sol/**",
                "Mock*.sol/**",
            ],
        }),
    ],
});
