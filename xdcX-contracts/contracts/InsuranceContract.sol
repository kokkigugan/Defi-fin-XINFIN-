// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract InsuranceRequest {
    address public owner;  // Address of the contract owner
    uint256 public premium; // Premium amount to be paid
    uint256 public coverageAmount; // Amount covered by insurance
    uint256 public requestTimestamp; // Timestamp when the request was made
    uint256 public coveragePeriod; // Duration of coverage in seconds
    bool public isClaimed; // Flag to indicate if a claim has been made

    event PremiumPaid(address payer, uint256 amount);
    event ClaimSubmitted(address claimant, uint256 claimAmount);
    event CoverageExpired();

    constructor(uint256 _premium, uint256 _coverageAmount, uint256 _coveragePeriod) {
        owner = msg.sender;
        premium = _premium;
        coverageAmount = _coverageAmount;
        coveragePeriod = _coveragePeriod;
        requestTimestamp = block.timestamp;
        isClaimed = false;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can call this function");
        _;
    }

    modifier notExpired() {
        require(block.timestamp < (requestTimestamp + coveragePeriod), "Insurance coverage has expired");
        _;
    }

    modifier notClaimed() {
        require(!isClaimed, "Claim has already been submitted");
        _;
    }

    function payPremium() external payable notExpired notClaimed {
        require(msg.value == premium, "Incorrect premium amount sent");
        emit PremiumPaid(msg.sender, msg.value);
    }

    function submitClaim(uint256 claimAmount) external onlyOwner notExpired notClaimed {
        require(claimAmount <= coverageAmount, "Claim amount exceeds coverage");
        isClaimed = true;
        emit ClaimSubmitted(msg.sender, claimAmount);
    }

    function expireCoverage() external onlyOwner {
        require(block.timestamp >= (requestTimestamp + coveragePeriod), "Insurance coverage has not expired yet");
        isClaimed = true; // Automatically mark as claimed when coverage expires
        emit CoverageExpired();
    }

    receive() external payable {
        // Handle unexpected ETH transfers to the contract
    }
}
