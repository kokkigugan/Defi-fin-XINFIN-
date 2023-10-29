// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UPIFundTransfer {
    address public owner;
    mapping(address => uint256) public balances;

    event FundTransferRequest(address indexed from, address indexed to, uint256 amount);
    event FundTransferred(address indexed from, address indexed to, uint256 amount);
    event BalanceChecked(address indexed account, uint256 balance);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this operation");
        _;
    }

    function requestTransfer(address to, uint256 amount) external {
        require(to != address(0), "Invalid recipient address");
        require(msg.sender != to, "Cannot send funds to yourself");
        require(balances[msg.sender] >= amount, "Insufficient balance");

        emit FundTransferRequest(msg.sender, to, amount);
    }

    function approveTransfer(address from, address to, uint256 amount) external onlyOwner {
        require(balances[from] >= amount, "Insufficient balance");
        balances[from] -= amount;
        balances[to] += amount;

        emit FundTransferred(from, to, amount);
    }

    function deposit() external payable {
        require(msg.value > 0, "You must send some XDC with the transaction");
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }

    function getBalance(address account) external view returns (uint256) {
        return balances[account];
    }
}
