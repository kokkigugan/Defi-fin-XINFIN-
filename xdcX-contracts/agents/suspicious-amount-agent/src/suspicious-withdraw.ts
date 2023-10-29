import {
  ethers,
  Finding,
  FindingSeverity,
  FindingType,
  HandleTransaction,
  TransactionEvent,
} from "forta-agent";

import {
  XDCX_UNSTAKE_THRESHOLD,
  protocol,
  REQUEST_WITHDRAW_EVENT,
  STAKE_MANAGER,
} from "./constants";

const handleTransaction: HandleTransaction = async (
  txEvent: TransactionEvent
) => {
  const findings: Finding[] = [];

  // filter the transaction logs for XDCx unstake events
  const xdcxUnstakeEvents = txEvent.filterLog(
    REQUEST_WITHDRAW_EVENT,
    STAKE_MANAGER
  );

  xdcxUnstakeEvents.forEach((unstakeEvents) => {
    const { _account, _amountInXdcX } = unstakeEvents.args;

    const normalizedValue = ethers.utils.formatEther(_amountInXdcX);
    const minThreshold = ethers.utils.parseEther(XDCX_UNSTAKE_THRESHOLD);

    if (_amountInXdcX.gt(minThreshold)) {
      findings.push(
        Finding.fromObject({
          name: "Large XDCx Unstake",
          description: `Large amount of XDCx unstaked: ${normalizedValue}`,
          alertId: "XDCx-LARGE-UNSTAKE",
          protocol: protocol,
          severity: FindingSeverity.High,
          type: FindingType.Info,
          metadata: {
            account: _account,
            amountInXDCx: _amountInXdcX.toString(),
          },
        })
      );
    }
  });

  return findings;
};

export { handleTransaction };
