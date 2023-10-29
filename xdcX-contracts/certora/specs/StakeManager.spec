using XdcX as XdcX

methods{

    convertXdcToXdcX(uint256) returns (uint256) envfree;
    convertXdcXToXdc(uint256) returns (uint256) envfree;
    hasRole(bytes32, address) returns (bool) envfree;

    //variables
    BOT() returns (bytes32) envfree;

    // getters
    totalXdcXToBurn() returns (uint256) envfree;
    totalClaimableXdc() returns (uint256) envfree;
    getXdcXWithdrawLimit() returns (uint256) envfree;
    getTotalPooledXdc() returns (uint256) envfree;
    getUserRequestStatus(address, uint256) returns (bool, uint256) envfree;
    getContracts() returns (
            address _manager,
            address _xdcX,
            address _tokenHub,
            address _bcDepositWallet
        ) envfree;

    // XdcX.sol
    XdcX.totalSupply() returns (uint256) envfree;
    XdcX.balanceOf(address) returns (uint256) envfree;

    
    // ERC20Upgradable summarization
    transfer(address to, uint256 amount) returns (bool) => DISPATCHER(true);
}

rule userDepositsAndGetsCorrectAmountOfXdcX(address user, uint256 amount) {
    env e;
    require e.msg.sender == user;
    require e.msg.value == amount;

    uint256 xdcXAmount = convertXdcToXdcX(amount);
    uint256 userXdcXBalanceBefore = XdcX.balanceOf(user);

    deposit(e);

    uint256 userXdcXBalanceAfter = XdcX.balanceOf(user);

    assert userXdcXBalanceAfter == userXdcXBalanceBefore + xdcXAmount;
}

rule depositIncreasesTotalPooledXdc() {
    env e;

    uint256 pooledXdcBefore = getTotalPooledXdc();

    deposit(e);

    uint256 pooledXdcAfter = getTotalPooledXdc();

    assert pooledXdcAfter == pooledXdcBefore + e.msg.value;
}

rule totalSupplyIsCorrectAfterDeposit(address user, uint256 amount){
    env e;

    require e.msg.sender == user;
    require e.msg.value == amount;

    uint256 totalSupplyBefore = XdcX.totalSupply();

    require totalSupplyBefore + amount <= max_uint256;
    
    uint256 xdcXAmount = convertXdcToXdcX(amount);
    deposit(e);

    uint256 totalSupplyAfter = XdcX.totalSupply();

    assert amount != 0 => totalSupplyBefore + xdcXAmount == totalSupplyAfter;
}


rule totalSupplyDoesNotChangeAfterRequestWithdraw(uint256 unstakeXdcXAmount){
    env e;

    uint256 totalSupplyBefore = XdcX.totalSupply();

    requestWithdraw(e, unstakeXdcXAmount);

    uint256 totalSupplyAfter = XdcX.totalSupply();

    assert totalSupplyBefore == totalSupplyAfter;
}

rule totalSupplyDoesNotChangeAfterClaimWithdraw(uint256 idx){
    env e;

    uint256 totalSupplyBefore = XdcX.totalSupply();

    claimWithdraw(e, idx);

    uint256 totalSupplyAfter = XdcX.totalSupply();

    assert totalSupplyBefore == totalSupplyAfter;
}

rule erDoesNotChangeOnTransfer() {
    env e;
    uint256 oneEther = 10^18;
    uint256 erBefore = convertXdcXToXdc(oneEther);

    address otherUser; 
    uint256 amount;

    XdcX.transfer(e, otherUser, amount);

    uint256 erAfter = convertXdcXToXdc(oneEther);

    assert erBefore == erAfter;

}

// generic function `f` invoked with its specific `args`
rule userDoesNotChangeOtherUserBalance(method f, address otherUser){
    env e;
    calldataarg args;
    
    address manager;
    address _;
    manager, _, _, _ = getContracts();
    bytes32 BOT_ROLE = BOT();

    require !hasRole( BOT_ROLE, e.msg.sender);
    require e.msg.sender != manager;
    

    uint256 otherUserXdcXBalanceBefore = XdcX.balanceOf(otherUser);
    f(e,args);
    uint256 otherUserXdcXBalanceAfter = XdcX.balanceOf(otherUser);
    assert ((otherUser != e.msg.sender) => otherUserXdcXBalanceBefore == otherUserXdcXBalanceAfter);
}

rule bankRunSituation(){
    env e1;
    env e2;
    env e3;

    uint256 xdcxAmt1 = convertXdcToXdcX(e1.msg.value);
    deposit(e1);

    uint256 xdcxAmt2 = convertXdcToXdcX(e2.msg.value);
    deposit(e2);

    uint256 xdcxAmt3 = convertXdcToXdcX(e3.msg.value);
    deposit(e3);
    
    // All user unstakes
    // user1 unstakes
    require (XdcX.balanceOf(e1.msg.sender) == xdcxAmt1);
    requestWithdraw(e1, xdcxAmt1);
    
    bool isClaimable1;
    uint256 _amount1;
    isClaimable1, _amount1 = getUserRequestStatus(e1.msg.sender, 0);
    require isClaimable1 == true;

    claimWithdraw(e1, 0);

    // user2 unstakes
    require (XdcX.balanceOf(e2.msg.sender) == xdcxAmt2);
    requestWithdraw(e2, xdcxAmt2);

    bool isClaimable2;
    uint256 _amount2;
    isClaimable2, _amount2 = getUserRequestStatus(e2.msg.sender, 0);
    require isClaimable2 == true;

    claimWithdraw(e2, 0);

    // user3 unstakes
    require (XdcX.balanceOf(e3.msg.sender) == xdcxAmt3);
    requestWithdraw(e3, xdcxAmt3);

    bool isClaimable3;
    uint256 _amount3;
    isClaimable3, _amount3 = getUserRequestStatus(e3.msg.sender, 0);
    require isClaimable3 == true;

    claimWithdraw(e3, 0);

    assert (getTotalPooledXdc()==0 && totalClaimableXdc()==0) => (totalXdcXToBurn()==0 && getXdcXWithdrawLimit() == 0);
    assert(XdcX.balanceOf(e1.msg.sender) == 0);
    assert(XdcX.balanceOf(e2.msg.sender) == 0);
    assert(XdcX.balanceOf(e3.msg.sender) == 0);
}
