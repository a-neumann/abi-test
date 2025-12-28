// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {ERC20} from "@openzeppelin-contracts-5.1.0/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin-contracts-5.1.0/access/Ownable.sol";

/**
 * @title MockUSD
 * @notice A fake USDC token for testing purposes with mint functionality
 * @dev This is for testing only and should never be used in production
 */
contract MockUSD is ERC20, Ownable {

    event Minted(address indexed to, uint256 amount);

    constructor() ERC20("Mock USD Coin", "MUSD") Ownable(msg.sender) {}

    /**
     * @notice Returns the number of decimals (USDC uses 6 decimals)
     */
    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /**
     * @notice Mints tokens to a specified address (only owner)
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        emit Minted(to, amount);
    }
}
