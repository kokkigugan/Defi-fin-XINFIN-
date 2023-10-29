//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

interface IStakeManager {
    struct BotDelegateRequest {
        uint256 startTime;
        uint256 endTime;
        uint256 amount;
    }

    struct BotUndelegateRequest {
        uint256 startTime;
        uint256 endTime;
        uint256 amount;
        uint256 amountInXdcX;
    }

    struct WithdrawalRequest {
        uint256 uuid;
        uint256 amountInXdcX;
        uint256 startTime;
    }

    function initialize(
        address _xdcX,
        address _admin,
        address _manager,
        address _tokenHub,
        address _bot
    ) external;

    function deposit() external payable;

    function depositsInContract() external view returns (uint256);

    function delegateXdc()
        external
        returns (uint256 _uuid, uint256 _amount);

    function claimWithdraw(uint256 _amountInXdcX) external;

    function proposeNewManager(address _address) external;

    function acceptNewManager() external;

    function setBotRole(address _address) external;

    function revokeBotRole(address _address) external;

    function setMinDelegateThreshold(uint256 _minDelegateThreshold) external;

    function getTotalPooledXdc() external view returns (uint256);

    function getContracts()
        external
        view
        returns (
            address _manager,
            address _xdcX,
            address _tokenHub
        );

    function getXdcXWithdrawLimit()
        external
        view
        returns (uint256 _xdcXWithdrawLimit);

    function convertXdcToXdcX(uint256 _amount) external view returns (uint256);

    function convertXdcXToXdc(uint256 _amountInXdcX)
        external
        view
        returns (uint256);

    event Delegate(uint256 _uuid, uint256 _amount);
    event TransferOut(uint256 _amount);
    event RequestWithdraw(address indexed _account, uint256 _amountInXdcX);
    event Undelegate(uint256 _uuid, uint256 _amount);
    event Redelegate(uint256 _rewardsId, uint256 _amount);
    event SetManager(address indexed _address);
    event ProposeManager(address indexed _address);
    event SetBotRole(address indexed _address);
    event RevokeBotRole(address indexed _address);
    event SetMinDelegateThreshold(uint256 _minDelegateThreshold);
    event SetMinUndelegateThreshold(uint256 _minUndelegateThreshold);
    event SetRedirectAddress(address indexed _address);
    event Withdrawal(
        address indexed _account,
        uint256 _xdcXAmount,
        uint256 _xdcAmount
    );

}
