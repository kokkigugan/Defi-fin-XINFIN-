# XDCx Bot Operations Agent

## Supported Chains

- XDC

## Alerts

- XDCx-REWARD-CHANGE

  - Fired when Reward changes by more than 0.5 %
  - Severity is set to "Medium"
  - Type is set to "Info"
  - metadata: lastRewardAmount, curentRewardAmount

- XDCx-DAILY-REWARDS

  - Fired when Daily Rewards is not executed
  - Severity is set to "Critical"
  - Type is set to "Info"
  - metadata: lastRewardsTime

- XDCx-START-DELEGATION

  - Fired when StartDelegation is not executed for 36 hours
  - Severity is set to "Critical"
  - Type is set to "Info"
  - metadata: lastStartDelegationTime

- XDCx-COMPLETE-DELEGATION

  - Fired when CompleteDelegation is not executed for 12 hours past StartDelegation
  - Severity is set to "Critical"
  - Type is set to "Info"
  - metadata: lastStartDelegationTime, lastCompleteDelegationTime

- XDCx-START-UNDELEGATION

  - Fired when StartUndelegation is not executed for 7 days and 1 hours
  - Severity is set to "Critical"
  - Type is set to "Info"
  - metadata: lastStartUndelegationTime

- XDCx-UNDELEGATION-UPDATE

  - Fired when undelegationStarted is not executed for 12 hours past StartUndelegation
  - Severity is set to "Critical"
  - Type is set to "Info"
  - metadata: lastStartDelegationTime, lastUndelegationUpdateTime

- XDCx-COMPLETE-UNDELEGATION

  - Fired when CompleteUndelegation is not executed for 8 days and 12 hours past StartUndelegation
  - Severity is set to "Critical"
  - Type is set to "Info"
  - metadata: lastStartUndelegationTime, lastCompleteUndelegationTime
