import * as dotenv from "dotenv";
import * as path from "path";

import { ethers } from "ethers";

dotenv.config({ path: path.join(__dirname, ".env") });

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";
const TESTNET_DEPLOYER_PRIVATE_KEY = process.env.TESTNET_DEPLOYER_PRIVATE_KEY || "";
const CHAIN_RPC = process.env.CHAIN_RPC || "";
const TESTNET_CHAIN_RPC = process.env.TESTNET_CHAIN_RPC || "";
const CHAIN_ID = process.env.CHAIN_ID || "";
const TESTNET_CHAIN_ID = process.env.TESTNET_CHAIN_ID || "";
const SCAN_API_KEY = process.env.SCAN_API_KEY || "";
const GAS_PRICE = process.env.GAS_PRICE || 0;

export {
  DEPLOYER_PRIVATE_KEY,
  CHAIN_RPC,
  CHAIN_ID,
  TESTNET_DEPLOYER_PRIVATE_KEY,
  TESTNET_CHAIN_RPC,
  TESTNET_CHAIN_ID,
  SCAN_API_KEY,
  GAS_PRICE,
};
