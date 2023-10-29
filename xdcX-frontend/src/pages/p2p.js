import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ethers } from 'ethers';
import styled from 'styled-components'; // Import styled-components

const Container = styled.div`
  font-family: Arial, sans-serif;
  text-align: center;
`;

const Heading = styled.h1`
  font-size: 24px;
  margin-bottom: 16px;
`;

const BalanceText = styled.p`
  font-size: 16px;
  margin-bottom: 16px;
`;

const InputContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
`;

const Input = styled.input`
  padding: 8px;
  margin-right: 8px;
`;

const Button = styled.button`
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
`;

const TransactionMessage = styled.p`
  font-size: 16px;
`;

const UPIFundTransfer = () => {
  const [balance, setBalance] = useState(0);
  const [amountToWithdraw, setAmountToWithdraw] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [transactionMessage, setTransactionMessage] = useState('');

  useEffect(() => {
    async function loadBalance() {
      try {
        if (typeof window !== 'undefined' && window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const address = await signer.getAddress();
          const walletBalance = await provider.getBalance(address);
          const xdcBalance = ethers.utils.formatUnits(walletBalance, 'wei');
          setBalance(xdcBalance);
        }
      } catch (error) {
        console.error('Error loading balance:', error);
      }
    }
    loadBalance();
  }, []);

  async function handleWithdraw() {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const recipient = recipientAddress; // The recipient's address
        const amount = parseFloat(amountToWithdraw);

        // Convert the amount to wei (1 XDC = 1e18 wei)
        const weiAmount = ethers.utils.parseUnits(amount.toString(), 'ether');

        if (weiAmount.gt(balance)) {
          setTransactionMessage('Insufficient balance to transfer.');
          return;
        }

        // Send a transaction directly to the recipient's address
        const tx = {
          to: recipient,
          value: weiAmount,
        };

        const txResponse = await signer.sendTransaction(tx);
        await txResponse.wait();

        setTransactionMessage(`Transaction successful: Transferred ${amount} XDC to ${recipient}.`);
        loadBalance();
      }
    } catch (error) {
      console.error('Error transferring:', error);
      setTransactionMessage(`Transaction failed: ${error.message}`);
    }
  }

  return (
    <Container>
      <Heading>P2P Fund Transfer</Heading>
      <BalanceText>Your Balance: {balance} XDC</BalanceText>
      <InputContainer>
        <Input
          type="text"
          placeholder="Recipient Address"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
        />
        <Input
          type="number"
          placeholder="Amount to Transfer (XDC)"
          value={amountToWithdraw}
          onChange={(e) => setAmountToWithdraw(e.target.value)}
        />
        <Button onClick={handleWithdraw}>Transfer</Button>
      </InputContainer>
      <TransactionMessage>{transactionMessage}</TransactionMessage>
    </Container>
  );
};

export default UPIFundTransfer;
