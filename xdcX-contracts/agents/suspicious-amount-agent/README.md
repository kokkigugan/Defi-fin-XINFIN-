# XDCx Suspicious Amount Agent

## Supported Chains

- XDC

## Alerts

- XDCx-LARGE-MINT

  - Fired when XDCx is minted in large amount (500 XDCx)
  - Severity is set to "High"
  - Type is set to "Info"
  - metadata: to, value

- XDCx-LARGE-UNSTAKE

  - Fired when User unstakes large amount of XDCx (500 XDCx)
  - Severity is set to "High"
  - Type is set to "Info"
  - metadata: account, amountInXdcX,

- XDCx-ER-DROP

  - Fired when Exchange Rate Drops
  - Severity is set to "Critical"
  - Type is set to "Exploit"
  - metadata: lastER, currentER

- XDCx-SUPPLY-MISMATCH

  - Fired when ER \* XDCX_SUPPLY != TOTAL_POOLED_XDC
  - Severity is set to "Critical"
  - Type is set to "Exploit"
  - metadata: currentER, totalPooledXdc, currentSupply

- XDCx-SUPPLY-CHANGE

  - Fired when XDCx Supply Changes by 10%
  - Severity is set to "High"
  - Type is set to "Suspicious"
  - metadata: lastSupply, currentSupply
