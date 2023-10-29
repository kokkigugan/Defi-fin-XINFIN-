# xdcX

## Intro - Liquid Staking Derivatives (LSDs) and xdcX

Liquid Staking Derivatives (LSDs) are a financial innovation that combines the benefits of staking and liquidity in the world of blockchain networks. Staking involves holding tokens to participate in network consensus and earn rewards, but it often requires locking up the tokens for a specific period, limiting their liquidity and utility. In the case of XDC the miminum amount is too high for most of the users.

LSDs address this limitation by creating derivative tokens that represent the staked assets. We've developed **xdcX** as a XRC20 token. By holding xdcX, token holders can retain ownership of their staked assets while also enjoying the benefits of liquidity, fungibility, and tradability that come with derivative tokens.

Some important **key features** of our implementation:

- The StakeManager contract will hold its value until it reaches a minimum of 10,000,000 XDC, at which point it will delegate the staking process. However, users will get xdcX from the very first delegation.
- Users have the flexibility to unstake their tokens at any time, as long as there is a sufficient amount staked, and the staked amount remains above of the minimum 10,000,000 XDC.
- xdcX is a yield-bearing XRC20 token, meaning it generates yields by simply holding it. When users redeem their tokens, they receive the amount of XDC staked plus the generated yield as a reward.



## Benefits of xdcX on the XDC Network

The primary purpose of xdcX is to unlock the value of staked assets, allowing users to access liquidity and engage in various decentralized finance (DeFi) activities. xdcX enables token holders to stake their assets and simultaneously receive derivative tokens that can be freely traded, used as collateral, or utilized in other DeFi applications. This opens up new possibilities for investors and users to maximize the utility and potential returns of their staked assets.

xdcX provide several advantages, including:

1. **Liquidity:** xdcX enables token holders to access liquidity for their staked assets, which are typically illiquid when directly staked. This liquidity empowers users to engage in additional financial activities, such as trading, borrowing, or providing liquidity on decentralized exchanges and lending platforms.

2. **Flexibility:** By holding xdcX, users can unstake or transfer their staked assets without waiting for the lock-up period to end. This flexibility allows token holders to adapt to changing market conditions, seize opportunities, or manage their staked assets according to their preferences.

3. **Diversification:** xdcX facilitates the creation of diverse financial products and investment strategies by combining staked assets with the broader DeFi ecosystem. Token holders can participate in yield farming, lending, or other DeFi protocols using their xdcX, thereby expanding their investment options and managing risk more effectively.

4. **Enhanced Returns:** xdcX provides the potential for additional returns beyond staking rewards. Token holders can leverage the liquidity of their derivative tokens to participate in various DeFi strategies that generate yield or benefit from the appreciation of the underlying assets.

Overall, Liquid Staking Derivatives offer a bridge between the benefits of staking and the liquidity and flexibility of traditional financial markets. They empower users to unlock the value of staked assets, engage in DeFi opportunities, and enjoy the advantages of liquidity and fungibility while still earning staking rewards.

## Compiling

```shell
npx hardhat clean
npx hardhat compile
```

## Deploying

To deploy contracts, run:

```bash
npx hardhat deployTokenHubMock --network <network>

npx hardhat deployXdcXProxy <admin> --network <network>
npx hardhat upgradeXdcXProxy <proxyAddress> --network <network>
npx hardhat deployXdcXImpl --network <network>

npx hardhat deployStakeManagerProxy <xdcX> <admin> <manager> <tokenHub> <bcDepositWallet> <bot> --network <network>
npx hardhat upgradeStakeManagerProxy <proxyAddress> --network <network>
npx hardhat deployStakeManagerImpl --network <network>
```

`network` should be either `mainnet` or `testnet`.

## Integration

Smart contract integration guide is at [link](INTEGRATION.md)
