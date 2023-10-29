import {
  BlockEvent,
  ethers,
  EventType,
  Finding,
  FindingSeverity,
  FindingType,
  getEthersProvider,
  HandleBlock,
} from "forta-agent";
import {
  XDCx,
  XDCX_SUPPLY_CHANGE_HOURS,
  XDCX_SUPPLY_CHANGE_PCT,
  protocol,
  STAKE_MANAGER,
} from "./constants";

import abis from "./abi";
import { BigNumber } from "ethers";
import { getHours } from "./utils";

let lastSupply: BigNumber, lastSupplyTime: Date;
let supplyMismatch: boolean;

const handleBlock: HandleBlock = async (blockEvent: BlockEvent) => {
  const findings: Finding[] = [];

  if (blockEvent.type === EventType.REORG) return findings;

  const xdcX = new ethers.Contract(XDCx, abis.XdcX.abi, getEthersProvider());
  const stakeManager = new ethers.Contract(
    STAKE_MANAGER,
    abis.StakeManager.abi,
    getEthersProvider()
  );

  const oneEther = ethers.utils.parseEther("1");
  const currentER: BigNumber = await stakeManager.convertXdcXToXdc(oneEther, {
    blockTag: blockEvent.blockNumber,
  });
  const totalPooledXdc: BigNumber = await stakeManager.getTotalPooledXdc({
    blockTag: blockEvent.blockNumber,
  });
  const currentSupply: BigNumber = await xdcX.totalSupply({
    blockTag: blockEvent.blockNumber,
  });
  const currentSupplyTime: Date = new Date();

  if (
    currentER
      .mul(currentSupply)
      .div(oneEther)
      .sub(totalPooledXdc)
      .abs()
      .div(oneEther)
      .gt(1)
  ) {
    if (!supplyMismatch) {
      findings.push(
        Finding.fromObject({
          name: "XDCx Supply Mis-Match",
          description: `XDCx, ER and TotalPooledXdc doesn't match`,
          alertId: "XDCx-SUPPLY-MISMATCH",
          protocol: protocol,
          severity: FindingSeverity.Critical,
          type: FindingType.Exploit,
          metadata: {
            currentER: currentER.toString(),
            totalPooledXdc: totalPooledXdc.toString(),
            currentSupply: currentSupply.toString(),
          },
        })
      );
      supplyMismatch = true;
    }
  } else {
    supplyMismatch = false;
  }

  if (!lastSupply) {
    lastSupply = currentSupply;
    lastSupplyTime = currentSupplyTime;
    return findings;
  }
  const diffHours = getHours(
    currentSupplyTime.getTime() - lastSupplyTime.getTime()
  );
  if (diffHours > XDCX_SUPPLY_CHANGE_HOURS) {
    if (
      currentSupply
        .sub(lastSupply)
        .abs()
        .gt(lastSupply.mul(XDCX_SUPPLY_CHANGE_PCT).div(100))
    ) {
      findings.push(
        Finding.fromObject({
          name: "XDCx Supply Change",
          description: `XDCx Total Supply changed more than ${XDCX_SUPPLY_CHANGE_PCT} %`,
          alertId: "XDCx-SUPPLY-CHANGE",
          protocol: protocol,
          severity: FindingSeverity.High,
          type: FindingType.Suspicious,
          metadata: {
            lastSupply: lastSupply.toString(),
            currentSupply: currentSupply.toString(),
          },
        })
      );
    }

    lastSupplyTime = currentSupplyTime;
    lastSupply = currentSupply;
  }

  return findings;
};

export { handleBlock };
