// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {MockUSD} from "./MockUSD.sol";
import {IERC20} from "@openzeppelin-contracts-5.1.0/token/ERC20/IERC20.sol";

// ============ Library ============
library VaultMath {
    function calculateFee(uint256 amount, uint256 feeBps) internal pure returns (uint256) {
        return (amount * feeBps) / 10000;
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}

// ============ Interface ============
interface IVault {
    function deposit(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function getBalance(address user) external view returns (uint256);
}

// ============ Abstract Contract ============
abstract contract VaultBase {
    // ============ Enum ============
    enum VaultStatus {
        Active,
        Paused,
        Closed
    }

    // ============ Struct ============
    struct UserInfo {
        uint256 depositedAmount;
        uint256 lastDepositTime;
        uint256 rewardDebt;
        bool isWhitelisted;
    }

    // ============ Custom Errors ============
    error InsufficientBalance(uint256 requested, uint256 available);
    error VaultNotActive(VaultStatus currentStatus);
    error ZeroAmount();
    error Unauthorized(address caller);

    // ============ Events ============
    event Deposited(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed user, uint256 amount, uint256 fee);
    event StatusChanged(VaultStatus oldStatus, VaultStatus newStatus);
    event UserWhitelisted(address indexed user, bool status);

    // ============ State Variables ============
    VaultStatus public status;
    address public admin;

    // ============ Mappings ============
    mapping(address => UserInfo) public userInfo;
    mapping(address => mapping(address => uint256)) public allowances;

    // ============ Arrays ============
    address[] public depositors;
    uint256[3] public feeHistory; // Fixed-size array

    // ============ Modifiers ============
    modifier onlyAdmin() {
        if (msg.sender != admin) revert Unauthorized(msg.sender);
        _;
    }

    modifier whenActive() {
        if (status != VaultStatus.Active) revert VaultNotActive(status);
        _;
    }

    modifier nonZeroAmount(uint256 amount) {
        if (amount == 0) revert ZeroAmount();
        _;
    }

    // ============ Virtual Functions (must be implemented) ============
    function _beforeDeposit(address user, uint256 amount) internal virtual;
    function _afterWithdraw(address user, uint256 amount) internal virtual;

    // ============ Virtual Function with Default Implementation ============
    function getVaultName() public view virtual returns (string memory) {
        return "BaseVault";
    }
}

// ============ Concrete Contract ============
contract DemoVault is VaultBase, IVault {
    using VaultMath for uint256;

    // ============ Immutable & Constant ============
    MockUSD public immutable token;
    uint256 public constant MAX_FEE_BPS = 500; // 5%

    // ============ Additional State ============
    uint256 public withdrawalFeeBps;
    uint256 public totalDeposited;

    // ============ Tuple/Multiple Return Types ============
    struct VaultStats {
        uint256 totalDeposited;
        uint256 totalUsers;
        VaultStatus status;
    }

    constructor(address _token, uint256 _feeBps) {
        token = MockUSD(_token);
        withdrawalFeeBps = _feeBps;
        admin = msg.sender;
        status = VaultStatus.Active;
    }

    // ============ Interface Implementation ============
    function deposit(uint256 amount) external override whenActive nonZeroAmount(amount) {
        _beforeDeposit(msg.sender, amount);

        UserInfo storage user = userInfo[msg.sender];

        if (user.depositedAmount == 0) {
            depositors.push(msg.sender);
        }

        user.depositedAmount += amount;
        user.lastDepositTime = block.timestamp;
        totalDeposited += amount;

        token.transferFrom(msg.sender, address(this), amount);

        emit Deposited(msg.sender, amount, block.timestamp);
    }

    function withdraw(uint256 amount) external override whenActive nonZeroAmount(amount) {
        UserInfo storage user = userInfo[msg.sender];

        if (user.depositedAmount < amount) {
            revert InsufficientBalance(amount, user.depositedAmount);
        }

        uint256 fee = amount.calculateFee(withdrawalFeeBps);
        uint256 amountAfterFee = amount - fee;

        user.depositedAmount -= amount;
        totalDeposited -= amount;

        _afterWithdraw(msg.sender, amount);

        token.transfer(msg.sender, amountAfterFee);
        if (fee > 0) {
            token.transfer(admin, fee);
        }

        emit Withdrawn(msg.sender, amountAfterFee, fee);
    }

    function getBalance(address user) external view override returns (uint256) {
        return userInfo[user].depositedAmount;
    }

    // ============ Override Virtual Function ============
    function getVaultName() public pure override returns (string memory) {
        return "DemoVault";
    }

    // ============ Implement Abstract Functions ============
    function _beforeDeposit(address user, uint256 amount) internal override {
        // Hook for pre-deposit logic
        // Example: could check whitelist, limits, etc.
    }

    function _afterWithdraw(address user, uint256 amount) internal override {
        // Hook for post-withdraw logic
        // Example: could update rewards, emit additional events, etc.
    }

    // ============ Admin Functions ============
    function setStatus(VaultStatus newStatus) external onlyAdmin {
        VaultStatus oldStatus = status;
        status = newStatus;
        emit StatusChanged(oldStatus, newStatus);
    }

    function setWhitelist(address user, bool whitelisted) external onlyAdmin {
        userInfo[user].isWhitelisted = whitelisted;
        emit UserWhitelisted(user, whitelisted);
    }

    function batchWhitelistUsers(address[] calldata users, bool whitelisted) external onlyAdmin {
        for (uint256 i = 0; i < users.length; i++) {
            userInfo[users[i]].isWhitelisted = whitelisted;
            emit UserWhitelisted(users[i], whitelisted);
        }
    }

    struct UserUpdate {
        address user;
        uint256 rewardDebt;
        bool isWhitelisted;
    }

    function updateUser(UserUpdate calldata update) external onlyAdmin {
        UserInfo storage info = userInfo[update.user];
        info.rewardDebt = update.rewardDebt;
        info.isWhitelisted = update.isWhitelisted;
        emit UserWhitelisted(update.user, update.isWhitelisted);
    }

    function batchUpdateUsers(UserUpdate[] calldata updates) external onlyAdmin {
        for (uint256 i = 0; i < updates.length; i++) {
            UserInfo storage info = userInfo[updates[i].user];
            info.rewardDebt = updates[i].rewardDebt;
            info.isWhitelisted = updates[i].isWhitelisted;
            emit UserWhitelisted(updates[i].user, updates[i].isWhitelisted);
        }
    }

    function setWithdrawalFee(uint256 newFeeBps) external onlyAdmin {
        require(newFeeBps <= MAX_FEE_BPS, "Fee too high");

        // Shift fee history (using fixed array)
        feeHistory[2] = feeHistory[1];
        feeHistory[1] = feeHistory[0];
        feeHistory[0] = newFeeBps;

        withdrawalFeeBps = newFeeBps;
    }

    // ============ View Functions with Multiple Returns ============
    function getVaultStats() external view returns (VaultStats memory) {
        return VaultStats({
            totalDeposited: totalDeposited,
            totalUsers: depositors.length,
            status: status
        });
    }

    function getUserFullInfo(address user) external view returns (
        uint256 depositedAmount,
        uint256 lastDepositTime,
        uint256 rewardDebt,
        bool isWhitelisted
    ) {
        UserInfo memory info = userInfo[user];
        return (info.depositedAmount, info.lastDepositTime, info.rewardDebt, info.isWhitelisted);
    }

    // ============ Array Operations ============
    function getDepositorCount() external view returns (uint256) {
        return depositors.length;
    }

    function getDepositorAt(uint256 index) external view returns (address) {
        require(index < depositors.length, "Index out of bounds");
        return depositors[index];
    }

    // ============ Bytes and String Types ============
    function encodeUserData(address user) external pure returns (bytes memory) {
        return abi.encode(user);
    }

    // ============ Payable Function (for native ETH) ============
    receive() external payable {
        // Accept ETH donations
    }

    function withdrawETH() external onlyAdmin {
        (bool success, ) = payable(admin).call{value: address(this).balance}("");
        require(success, "ETH transfer failed");
    }
}
