//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";

import {IStakeManager} from "./interfaces/IStakeManager.sol";
import {IXdcX} from "./interfaces/IXdcX.sol";
import {ITokenHub} from "./interfaces/ITokenHub.sol";

/**
 * @title Stake Manager Contract
 * @dev Handles Staking of XDC on XDC
 */
contract StakeManager is
    IStakeManager,
    Initializable,
    PausableUpgradeable,
    AccessControlUpgradeable
{
    using SafeERC20Upgradeable for IERC20Upgradeable;

    uint256 public depositsDelegated; // total XDC delegated to validators on Beacon Chain

    uint256 public nextDelegateUUID;
    uint256 public minDelegateThreshold;

    uint256 private notDepositedYet;

    address private xdcX;
    address private tokenHub;

    bytes32 public constant BOT = keccak256("BOT");

    address private manager;
    address private proposedManager;
    mapping(uint256 => bool) public rewardsIdUsed;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @param _xdcX - Address of XdcX Token on XDC Chain
     * @param _admin - Address of the admin
     * @param _manager - Address of the manager
     * @param _tokenHub - Address of the manager
     * @param _bot - Address of the Bot
     */
    function initialize(
        address _xdcX,
        address _admin,
        address _manager,
        address _tokenHub,
        address _bot
    ) external override initializer {
        __AccessControl_init();
        __Pausable_init();

        require(
            ((_xdcX != address(0)) &&
                (_admin != address(0)) &&
                (_manager != address(0)) &&
                (_tokenHub != address(0)) &&
                (_bot != address(0))),
            "zero address provided"
        );

        _setRoleAdmin(BOT, DEFAULT_ADMIN_ROLE);
        _setupRole(DEFAULT_ADMIN_ROLE, _admin);
        _setupRole(BOT, _bot);

        manager = _manager;
        xdcX = _xdcX;
        tokenHub = _tokenHub;
        minDelegateThreshold = 10_000_000 * 1e18;

        emit SetManager(_manager);
        emit SetBotRole(_bot);
        emit SetMinDelegateThreshold(minDelegateThreshold);
    }


    ////////////////////////////////////////////////////////////
    /////                                                    ///
    /////              ***Deposit Flow***                    ///
    /////                                                    ///
    ////////////////////////////////////////////////////////////

    /**
     * @dev Allows user to deposit Xdc at XDC and mints XdcX for the user
     */
    function deposit() external payable override whenNotPaused {
        uint256 amount = msg.value;
        require(amount > 0, "Invalid Amount");

        notDepositedYet = amount;
        uint256 xdcXToMint = convertXdcToXdcX(amount);
        delete(notDepositedYet);

        IXdcX(xdcX).mint(msg.sender, xdcXToMint);
    }

    function depositsInContract() public view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Allows bot to transfer users' funds from this contract to botDepositWallet at Beacon Chain
     * @return _uuid - unique id against which this transfer event was logged
     * @return _amount - Amount of funds transferred for staking
     * @notice Use `getBotDelegateRequest` function to get more details of the logged data
     */
    function delegateXdc()
        external
        override
        whenNotPaused
        onlyRole(BOT)
        returns (uint256 _uuid, uint256 _amount)
    {
        _amount = depositsInContract();

        _uuid = nextDelegateUUID++; // post-increment : assigns the current value first and then increments

        // We require the bot to have at least minDelegateThreshold amount of XDC (10 millions XDC)
        // But only for the first delegation. After that, the bot can delegate any amount
        if (_uuid == 0) {
            require(_amount >= minDelegateThreshold, "Insufficient Deposit Amount");
        }
        
        depositsDelegated += _amount;

        // sends funds to BC
        _tokenHubTransferOut(_amount);

        emit Delegate(_uuid, _amount);
    }

    ////////////////////////////////////////////////////////////
    /////                                                    ///
    /////              ***Withdraw Flow***                   ///
    /////                                                    ///
    ////////////////////////////////////////////////////////////

    /**
     * @dev Allows user to request for unstake/withdraw funds
     * @param _amountInXdcX - Amount of XdcX to swap for withdraw
     * @notice User must have approved this contract to spend XdcX
     */
    function claimWithdraw(uint256 _amountInXdcX)
        external
        override
        whenNotPaused
    {
        require(_amountInXdcX > 0, "Invalid Amount");
        require(depositsDelegated > 0 || depositsInContract() > 0, "No delegation yet");

        // We can only undelegate if the amount of XDC to be withdrawn is less than 10 millions XDC
        uint256 withdrawLimit = getXdcXWithdrawLimit();
        uint256 totalXdcToWithdraw = convertXdcXToXdc(_amountInXdcX);
        require(
            totalXdcToWithdraw <= withdrawLimit,
            "Not enough XDC to withdraw"
        );

        if (depositsDelegated == 0) {
            // If there is no delegation, we can directly send the funds to the user
            assert(depositsInContract() >= totalXdcToWithdraw);
        } else {
            // If there is delegation, we need to undelegate the funds first
            _tokenHubUndelegate(totalXdcToWithdraw);
        }

        IERC20Upgradeable(xdcX).safeTransferFrom(
            msg.sender,
            address(this),
            _amountInXdcX
        );

        IXdcX(xdcX).burn(address(this), _amountInXdcX);

        AddressUpgradeable.sendValue(payable(msg.sender), totalXdcToWithdraw);

        emit Withdrawal(msg.sender, _amountInXdcX, totalXdcToWithdraw);
    }

    ////////////////////////////////////////////////////////////
    /////                                                    ///
    /////                 ***Setters***                      ///
    /////                                                    ///
    ////////////////////////////////////////////////////////////

    function proposeNewManager(address _address) external override onlyManager {
        require(manager != _address, "Old address == new address");
        require(_address != address(0), "zero address provided");

        proposedManager = _address;

        emit ProposeManager(_address);
    }

    function acceptNewManager() external override {
        require(
            msg.sender == proposedManager,
            "Accessible only by Proposed Manager"
        );

        manager = proposedManager;
        proposedManager = address(0);

        emit SetManager(manager);
    }

    function setBotRole(address _address) external override onlyManager {
        require(_address != address(0), "zero address provided");

        _setupRole(BOT, _address);

        emit SetBotRole(_address);
    }

    function revokeBotRole(address _address) external override onlyManager {
        require(_address != address(0), "zero address provided");

        _revokeRole(BOT, _address);

        emit RevokeBotRole(_address);
    }

    function setMinDelegateThreshold(uint256 _minDelegateThreshold)
        external
        override
        onlyManager
    {
        require(_minDelegateThreshold > 0, "Invalid Threshold");
        minDelegateThreshold = _minDelegateThreshold;

        emit SetMinDelegateThreshold(_minDelegateThreshold);
    }


    ////////////////////////////////////////////////////////////
    /////                                                    ///
    /////                 ***Getters***                      ///
    /////                                                    ///
    ////////////////////////////////////////////////////////////

    function getTotalPooledXdc() public view override returns (uint256) {
        return (depositsDelegated + depositsInContract() - notDepositedYet);
    }

    function getContracts()
        external
        view
        override
        returns (
            address _manager,
            address _xdcX,
            address _tokenHub
        )
    {
        _manager = manager;
        _xdcX = xdcX;
        _tokenHub = tokenHub;
    }

    function getXdcXWithdrawLimit()
        public
        view
        override
        returns (uint256 _xdcXWithdrawLimit)
    {
        if (depositsDelegated == 0) {
            return depositsInContract();
        }

        // We can only undelegate if the amount of XDC to be withdrawn is less than 10 millions XDC
        uint256 maxToUndelegate = depositsDelegated - minDelegateThreshold;
        
        _xdcXWithdrawLimit = convertXdcToXdcX(maxToUndelegate);
    }

    ////////////////////////////////////////////////////////////
    /////                                                    ///
    /////            ***Helpers & Utilities***               ///
    /////                                                    ///
    ////////////////////////////////////////////////////////////

    function _tokenHubTransferOut(uint256 _amount) private {
        bool isTransferred = ITokenHub(tokenHub).transferOut{
            value: (_amount)
        }(address(this), _amount);

        require(isTransferred, "TokenHub TransferOut Failed");
        emit TransferOut(_amount);
    }

    function _tokenHubUndelegate(uint256 _amount) private {
        bool isTransferred = ITokenHub(tokenHub).undelegate(_amount);

        require(isTransferred, "TokenHub Undelegation Failed");
    }

    /**
     * @dev Calculates amount of XdcX for `_amount` Xdc
     */
    function convertXdcToXdcX(uint256 _amount)
        public
        view
        override
        returns (uint256)
    {
        uint256 totalShares = IXdcX(xdcX).totalSupply();
        totalShares = totalShares == 0 ? 1 : totalShares;

        uint256 totalPooledXdc = getTotalPooledXdc();
        totalPooledXdc = totalPooledXdc == 0 ? 1 : totalPooledXdc;

        uint256 amountInXdcX = (_amount * totalShares) / totalPooledXdc;

        return amountInXdcX;
    }

    /**
     * @dev Calculates amount of Xdc for `_amountInXdcX` XdcX
     */
    function convertXdcXToXdc(uint256 _amountInXdcX)
        public
        view
        override
        returns (uint256)
    {
        uint256 totalShares = IXdcX(xdcX).totalSupply();
        totalShares = totalShares == 0 ? 1 : totalShares;

        uint256 totalPooledXdc = getTotalPooledXdc();
        totalPooledXdc = totalPooledXdc == 0 ? 1 : totalPooledXdc;

        uint256 amountInXdc = (_amountInXdcX * totalPooledXdc) / totalShares;

        return amountInXdc;
    }

    /**
     * @dev Flips the pause state
     */
    function togglePause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        paused() ? _unpause() : _pause();
    }

    // To receive XDC rewards from the Beacon Chain
    receive() external payable {
    }

    modifier onlyManager() {
        require(msg.sender == manager, "Accessible only by Manager");
        _;
    }
}
