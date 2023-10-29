# Integration guide

Liquid staking is achieved through `StakeManager` contract and the yield-bearing ERC-20 token `XdcX` is given to the user.

## 1. Stake XDC

Send XDC and receive liquid staking XdcX token.

```SOLIDITY
IStakeManager stakeManager = IStakeManager(STAKE_MANAGER_ADDRESS);
IStakeManager.deposit{value: msg.value}();
uint256 amountInXdcX = IXdcX(XDCX_ADDRESS).balanceOf(msg.sender);

emit StakeEvent(msg.sender, msg.value, amountInXdcX);
```

## 2. Unstake XDC

Send XdcX and create a withdrawal request.  
_XdcX approval should be given._

```SOLIDITY
require(
    IXdcX(XDCX_ADDRESS).approve(STAKE_MANAGER_ADDRESS, amount),
    "Not approved"
);
IStakeManager stakeManager = IStakeManager(STAKE_MANAGER_ADDRESS);
IStakeManager.claimWithdraw(amount);

emit Withdrawal(msg.sender, amount, totalXdcWithdrawn)
```


```
