import React, { Component } from 'react';
import Web3 from 'web3';
import styled from 'styled-components';

// Create styled components
const Container = styled.div`
  font-family: Arial, sans-serif;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
  text-align: center;
  width: 300px;
  margin: 0 auto;
`;

const H1 = styled.h1`
  font-size: 24px;
  margin-bottom: 10px;
`;

const P = styled.p`
  font-size: 16px;
  margin-bottom: 5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 5px;
  margin: 5px 0;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

class InsuranceRequest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      owner: '', // Initialize as empty
      premium: 0, // Initialize as 0
      coverageAmount: 0, // Initialize as 0
      coveragePeriod: 0, // Initialize as 0
      isClaimed: false,
      claimAmount: 0,
      web3: null,
      contract: null,
      account: null,
    };
  }

  async componentDidMount() {
    try {
      if (typeof window.ethereum !== 'undefined') {
        // Initialize web3.js
        const web3 = new Web3(window.ethereum);
        await window.ethereum.enable();

        const contract = new web3.eth.Contract(contractABI, contractAddress);
        const accounts = await web3.eth.getAccounts();

        this.setState({
          web3,
          contract,
          account: accounts[0],
        });

        // Fetch contract data
        const owner = await contract.methods.owner().call();
        const premium = await contract.methods.premium().call();
        const coverageAmount = await contract.methods.coverageAmount().call();
        const coveragePeriod = await contract.methods.coveragePeriod().call();
        const isClaimed = await contract.methods.isClaimed().call();

        this.setState({
          owner,
          premium,
          coverageAmount,
          coveragePeriod,
          isClaimed,
        });
      } else {
        console.log('No Ethereum wallet detected. Please install XinPay or MetaMask.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  payPremium = async () => {
    try {
      const { account, contract, premium, web3 } = this.state;
      const value = web3.utils.toWei(premium.toString(), 'ether');
      await contract.methods.payPremium().send({ from: account, value });
      this.setState({ isClaimed: false });
    } catch (error) {
      console.error('Error:', error);
    }
  }

  submitClaim = async () => {
    try {
      const { account, contract, claimAmount } = this.state;
      await contract.methods.submitClaim(claimAmount).send({ from: account });
      this.setState({ isClaimed: true });
    } catch (error) {
      console.error('Error:', error);
    }
  }

  render() {
    const { owner, premium, coverageAmount, coveragePeriod, isClaimed, claimAmount } = this.state;

    return (
      <Container>
        <H1>Insurance Request</H1>
        <P>
          <strong>Owner:</strong>
          <Input
            type="text"
            value={owner}
            onChange={(e) => this.setState({ owner: e.target.value })}
          />
        </P>
        <P>
          <strong>Premium:</strong>
          <Input
            type="number"
            value={premium}
            onChange={(e) => this.setState({ premium: e.target.value })}
          />
          XDC
        </P>
        <P>
          <strong>Coverage Amount:</strong>
          <Input
            type="number"
            value={coverageAmount}
            onChange={(e) => this.setState({ coverageAmount: e.target.value })}
          />
          XDC
        </P>
        <P>
          <strong>Coverage Period:</strong>
          <Input
            type="number"
            value={coveragePeriod}
            onChange={(e) => this.setState({ coveragePeriod: e.target.value })}
          />
          seconds
        </P>
        <P>
          <strong>Claim Status:</strong> {isClaimed ? 'Claimed' : 'Not Claimed'}
        </P>
        <Button onClick={this.payPremium} disabled={isClaimed}>
          Pay Premium
        </Button>
        <Input
          type="number"
          placeholder="Enter claim amount"
          value={claimAmount}
          onChange={(e) => this.setState({ claimAmount: e.target.value })}
        />
        <Button onClick={this.submitClaim} disabled={isClaimed || claimAmount <= 0}>
          Submit Claim
        </Button>
      </Container>
    );
  }
}

export default InsuranceRequest;
