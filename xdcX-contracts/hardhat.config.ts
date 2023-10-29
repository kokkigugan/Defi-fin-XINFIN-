import { HardhatRuntimeEnvironment } from "hardhat/types";
import { HardhatUserConfig, task } from "hardhat/config";
import { deployDirect, deployProxy, upgradeProxy } from "./scripts/tasks";

import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-forta";

import {
  DEPLOYER_PRIVATE_KEY,
  CHAIN_RPC,
  CHAIN_ID,
  TESTNET_DEPLOYER_PRIVATE_KEY,
  TESTNET_CHAIN_RPC,
  TESTNET_CHAIN_ID,
  SCAN_API_KEY,
  GAS_PRICE,
} from "./environment";

task("deployTokenHubMock", "Deploy TokenHubMock Implementation only").setAction(
  async (args, hre: HardhatRuntimeEnvironment) => {
    await deployDirect(hre, "TokenHubMock");
  }
);

task("deployXdcXProxy", "Deploy XdcX Proxy only")
  .addPositionalParam("admin")
  .setAction(async ({ admin }, hre: HardhatRuntimeEnvironment) => {
    await deployProxy(hre, "XdcX", admin);
  });

task("upgradeXdcXProxy", "Upgrade XdcX Proxy")
  .addPositionalParam("proxyAddress")
  .setAction(async ({ proxyAddress }, hre: HardhatRuntimeEnvironment) => {
    await upgradeProxy(hre, "XdcX", proxyAddress);
  });

task("deployXdcXImpl", "Deploy XdcX Implementation only").setAction(
  async (args, hre: HardhatRuntimeEnvironment) => {
    await deployDirect(hre, "XdcX");
  }
);

task("deployStakeManagerProxy", "Deploy StakeManager Proxy only")
  .addPositionalParam("xdcX")
  .addPositionalParam("admin")
  .addPositionalParam("manager")
  .addPositionalParam("tokenHub")
  .addPositionalParam("bot")
  .setAction(
    async (
      { xdcX, admin, manager, tokenHub, bot },
      hre: HardhatRuntimeEnvironment
    ) => {
      await deployProxy(
        hre,
        "StakeManager",
        xdcX,
        admin,
        manager,
        tokenHub,
        bot
      );
    }
  );

task("upgradeStakeManagerProxy", "Upgrade StakeManager Proxy")
  .addPositionalParam("proxyAddress")
  .setAction(async ({ proxyAddress }, hre: HardhatRuntimeEnvironment) => {
    await upgradeProxy(hre, "StakeManager", proxyAddress);
  });

task(
  "deployStakeManagerImpl",
  "Deploy StakeManager Implementation only"
).setAction(async (args, hre: HardhatRuntimeEnvironment) => {
  await deployDirect(hre, "StakeManager");
});

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          evmVersion: "paris", // "shanghai" not supported
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    mainnet: {
      url: CHAIN_RPC,
      chainId: Number(CHAIN_ID),
      accounts: [DEPLOYER_PRIVATE_KEY],
    },
    testnet: {
      url: TESTNET_CHAIN_RPC,
      chainId: Number(TESTNET_CHAIN_ID),
      accounts: [TESTNET_DEPLOYER_PRIVATE_KEY],
    },
  },
  gasReporter: {
    currency: "USD",
    gasPrice: Number(GAS_PRICE),
  },
  etherscan: {
    apiKey: SCAN_API_KEY,
  },
};

export default config;
