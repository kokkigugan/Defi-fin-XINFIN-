import {
  ethers,
  Finding,
  FindingSeverity,
  FindingType,
  HandleTransaction,
  TransactionEvent,
} from "forta-agent";
import {
  MAX_REWARD_THRESHOLD,
  MIN_REWARD_THRESHOLD,
  protocol,
  REWARD_EVENT,
  STAKE_MANAGER,
} from "./constants";

const handleTransaction: HandleTransaction = async (
  txEvent: TransactionEvent
) => {
  const findings: Finding[] = [];

  const xdcxRewardEvents = txEvent.filterLog(REWARD_EVENT, STAKE_MANAGER);

  xdcxRewardEvents.forEach((rewardEvents) => {
    const { _rewardsId, _amount } = rewardEvents.args;

    const normalizedValue = ethers.utils.formatEther(_amount);
    const minThreshold = ethers.utils.parseEther(MIN_REWARD_THRESHOLD);
    const maxThreshold = ethers.utils.parseEther(MAX_REWARD_THRESHOLD);

    if (_amount.lt(minThreshold)) {
      findings.push(
        Finding.fromObject({
          name: "Low XDCx Reward",
          description: `Low amount of XDCx Reward Received: ${normalizedValue}`,
          alertId: "XDCx-3",
          protocol: protocol,
          severity: FindingSeverity.High,
          type: FindingType.Info,
          metadata: {
            rewardsId: _rewardsId.toString(),
            amount: _amount.toString(),
          },
        })
      );
    }

    if (_amount.gt(maxThreshold)) {
      findings.push(
        Finding.fromObject({
          name: "High XDCx Reward",
          description: `High amount of XDCx Reward Received: ${normalizedValue}`,
          alertId: "XDCx-4",
          protocol: "XDCx Stader",
          severity: FindingSeverity.High,
          type: FindingType.Info,
          metadata: {
            _rewardsId,
            _amount,
          },
        })
      );
    }
  });

  return findings;
};

export { handleTransaction };
