certoraRun  contracts/StakeManager.sol \
            contracts/XdcX.sol \
--link      StakeManager:xdcX=XdcX \
--verify    StakeManager:certora/specs/StakeManager.spec \
--packages  @openzeppelin=node_modules/@openzeppelin \
--path      . \
--loop_iter 3 \
--settings -optimisticFallback=true --optimistic_loop \
--staging \
--msg "xdcx"
