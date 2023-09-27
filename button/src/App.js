import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import logo from './logo.svg';
import './App.css';
import CONTRACT_ABI from './smartcontract/contractABI-ORIGINAL.json';

function App() {
    const [web3, setWeb3] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [contract, setContract] = useState(null);
    const [isConnected, setIsConnected] = useState(false);  // State to track wallet connection
    const [userRequests, setUserRequests] = useState([]);
    const [selectedRequestIndex, setSelectedRequestIndex] = useState(null);
    const [transactionData, setTransactionData] = useState(null);


    const CONTRACT_OWNER_ADDRESS = ''; // Replace with the actual owner address
    const CONTRACT_ADDRESS = ''; // Splitter Contract Address

    useEffect(() => {
        window.ethereum.on('message', (message) => {
            console.log('MetaMask message:', message);
        });
    
        window.ethereum.on('transactionHash', (hash) => {
            console.log('Transaction hash:', hash);
        });
    
        if (window.ethereum) {
            // ... rest of your code
        }
    }, []);

    const handleConnectWallet = async () => {
        console.log("Connecting wallet...");
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                console.log("Connected accounts:", accounts);
    
                // Initialize web3
                const web3Instance = new Web3(window.ethereum);
                setWeb3(web3Instance);
    
                // Initialize contract
                const contractInstance = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
                setContract(contractInstance);
    
                setAccounts(accounts);
                setIsConnected(true);
            } catch (error) {
                console.error("Error connecting to wallet:", error);
            }
        } else {
            console.error("MetaMask not detected!");
        }
    };

    const fetchUserRequests = async () => {
        try {
            const { 0: requestors, 1: amounts, 2: messages, 3: names } = await contract.methods.getMyRequests(accounts[0]).call({ from: accounts[0] });
            const requests = requestors.map((_, index) => ({
                requestor: requestors[index],
                amount: amounts[index],
                message: messages[index],
                name: names[index]
            }));
            setUserRequests(requests);
        } catch (error) {
            console.error("Error fetching user requests:", error);
        }
    };
    
    useEffect(() => {
        if (contract && accounts.length > 0) {
            fetchUserRequests();
        }
    }, [contract, accounts]);
    

    const handleBuy = async () => {
    

        console.log("Web3 instance:", web3);
        console.log("Contract instance:", contract);
        console.log("Initiating buy...");
    
        if (!isConnected) {
            alert("Please connect your wallet first.");
            return;
        }

        console.log("Selected request index:", selectedRequestIndex, "Available requests:", userRequests);
        if (selectedRequestIndex === null || selectedRequestIndex >= userRequests.length) {
            alert("Please select a valid request.");
            return;
        }
    
        if (contract && accounts.length > 0) {
            const _request = selectedRequestIndex;

    
            const requestDetails = await contract.methods.getRequestDetails(accounts[0], _request).call({ from: accounts[0] });
            console.log("Request details:", requestDetails);
    
            const requestAmountInWei = requestDetails[1];  // Index 1 returns the amount from getRequestDetails
            const requestAmountInMatic = web3.utils.fromWei(requestAmountInWei, 'ether');
            
            console.log("Request amount in MATIC:", requestAmountInMatic);
            console.log("Request amount in Wei:", requestAmountInWei);
    
            try {
                console.log("About to send the transaction...");
                await contract.methods.payRequest(_request)
                .send({ from: accounts[0], value: requestAmountInWei, gas: 3000000 })
                .on('transactionHash', function(hash){
                    console.log('Transaction Hash:', hash);
                })
                .on('receipt', function(receipt) {
                    console.log('Receipt:', receipt);
                    setTransactionData(receipt);  // <-- Store the transaction data in the state
                })
                .on('confirmation', function(confirmationNumber, receipt){
                    console.log('Confirmation:', confirmationNumber);
                })
                .on('error', function(error, receipt) {
                    console.error('Error:', error);
                });
            } catch (error) {
                console.error("Error while trying to send the transaction:", error);
            }
            
        }
    };
    const handleCreateRequest = async () => {
        console.log("Create request button clicked!");
    
        if (!isConnected) {
            alert("Please connect your wallet first.");
            return;
        }
    
        if (contract && accounts.length > 0) {
            const amount = web3.utils.toWei("0.05", 'ether');  // Example amount in MATIC
            const message = "Sample request";  // Example message
    
            try {
                console.log("Attempting to create a request with:", {
                    user: accounts[0],
                    amount: amount,
                    message: message
                });
                const response = await contract.methods.createRequest(accounts[0], amount, message).send({ from: accounts[0] });
                console.log("Transaction response:", response);
                fetchUserRequests(); // Add this line
            } catch (error) {
                console.error("Error while trying to create the request:", error);
            }
        }
    };
    
    

    const handleOwnerWithdraw = async () => {
        console.log("Initiating owner's withdrawal...");
        console.log("Wallet connection status:", isConnected);

        if (!isConnected) {
            alert("Please connect your wallet first.");
            return;
        }
    
        // Check if the connected account is the owner
        if (accounts[0].toLowerCase() !== CONTRACT_OWNER_ADDRESS.toLowerCase()) {
            alert("Only the contract owner can withdraw.");
            return;
        }
        console.log("Contract instance:", contract);
        console.log("Accounts array:", accounts);
        if (contract && accounts.length > 0) {
            try {
                await contract.methods.withdraw().send({ from: accounts[0] });
            } catch (error) {
                console.error("Error while trying to withdraw funds:", error);
            }
        }
    };

    



return (
    <div className="App">
        <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <p>
                Splitter <code>Frontend App</code> Demo.
            </p>
            <a
                className="App-link"
                href="https://reactjs.org"
                target="_blank"
                rel="noopener noreferrer"
            >
                Xecret
            </a>
            <div>
                <button onClick={handleConnectWallet}>Connect Wallet</button>
                <button onClick={handleBuy}>Buy</button>
                <button onClick={handleCreateRequest}>Create Request</button> {/* New Button */}
            </div>
            <select value={selectedRequestIndex} onChange={e => setSelectedRequestIndex(e.target.value)}>
    {userRequests.map((request, index) => (
        <option value={index}>Request {index + 1}: {web3.utils.fromWei(request.amount.toString(), 'ether')} MATIC</option>
    ))}
</select>


            <div>
            
            <button onClick={handleOwnerWithdraw}>Owner Withdraw</button>
{/* <TransactionDetails /> */}

        </div>
        </header>
    </div>
);

}
export default App;