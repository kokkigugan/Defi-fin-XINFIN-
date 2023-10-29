import {
  ethers,
  Finding,
  FindingSeverity,
  FindingType,
  HandleTransaction,
  TransactionEvent,
} from "forta-agent";
import {
  BEP20_TRANSFER_EVENT,
  XDCx,
  XDCX_MINT_THRESHOLD,
  protocol,
} from "./constants";

const handleTransaction: HandleTransaction = async (
  txEvent: TransactionEvent
) => {
  const findings: Finding[] = [];

  // filter the transaction logs for XDCx mint events
  const xdcxMintEvents = txEvent
    .filterLog(BEP20_TRANSFER_EVENT, XDCx)
    .filter((transferEvent) => {
      const { from } = transferEvent.args;
      return from === "0x0000000000000000000000000000000000000000";
    });

  xdcxMintEvents.forEach((mintEvent) => {
    const { to, value } = mintEvent.args;

    const normalizedValue = ethers.utils.formatEther(value);
    const minThreshold = ethers.utils.parseEther(XDCX_MINT_THRESHOLD);

    if (value.gt(minThreshold)) {
      findings.push(
        Finding.fromObject({
          name: "Large XDCx Mint",
          description: `Large amount of XDCx minted: ${normalizedValue}`,
          alertId: "XDCx-LARGE-MINT",
          protocol: protocol,
          severity: FindingSeverity.High,
          type: FindingType.Info,
          metadata: {
            to,
            value: value.toString(),
          },
        })
      );
    }
  });

  return findings;
};

export { handleTransaction };
