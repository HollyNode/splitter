my-dapp/
│
├── frontend/               # Frontend React application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── assets/
│   │   ├── utils/
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── backend/                # Backend server (if needed)
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   ├── package.json
│   └── ...
│
├── smart-contract/         # Smart contract development
│   ├── contracts/
│   ├── migrations/
│   ├── test/
│   ├── truffle-config.js   # or hardhat.config.js if you're using Hardhat
│   └── ...
│
├── README.md
└── ...

The contract is designed to present core functionality as discussed. 

A transaction for an object (3-splice, 6-splice, etc) occurs when user purchases object

A metamask event triggers point-of-sale. 

Upon agreement of point-of-sale, user's funds are moved to splitter wallet contract

Splitter wallet contract governs the sale

Two wallet addresses, EVM-compliant, receive each a 50% take of the sale

Any residual payment that cannot be evenly divided remains in the splitter contract until withdrawn by owner of contract

SET-UP

Requirements:Metamask or other EVM compliant Wallet (Coinbase, Rainbow, Trust, BlockWallet, etc)You will need test MATIC (Mumbai) to load your wallet up for A/B testing.https://mumbaifaucet.com/ from Alchemy is the best. 

You can get .5 Mumbai per 24-hour cycle. That should be more than enough as your testing and paying gas in 5/1000 equivalents.

You will be compiling, deploying and can further test in debug contract on https://remix.ethereum.org/

Best Practices: Create a couple of accounts in your metamask. 1. Your Master, 2. Your Primary, 3. Your Secondary. Think of these in terms of Primary acts as vendor, secondary acts as User. Master acts as Treasurer/Controller.

Take contract and compile it, this will run it for errors and build ABI file. Assuming it compiles. You will use the ABI file and create/or update contractABI.json accordingly.

Also, in your front end, each time the contract is redeployed for whatever the reason, contractABI.json, Splitter-Contoller.sol files will have to be updated for the app/service/frontend.

The contract address will have to change in the front-end as well.

Once the contract is compiled and deployed, you can lookup the contract on TESTNET

https://mumbai.polygonscan.com/PRODUCTION
https://polygonscan.com/Test and Production operate the same way.

A completely simplified splitter contract would only be designed to receive a payment, take the payment and split it to two addresses. This contract does that but it also intuits the proper logic that it's interacting with a front-end schema, so it includes conditions for request, send, receive, clear old requests, add name create request, pay request, add history, get request history, get request details.

This intuits paper trails valuable for client, vendor, wallet owner, buyer, seller. Some of these roles overlap. 

Vendor can adjust accordingly. 

Both the Splitter-Controller.sol contract and the contractABI.json go into a smartcontract folder in your source folder.for app, import web3 and ethers npm libraries



CTAs

Connect Wallet

Create Request

Choose most recent request, if more than one

Buy

Metamask prompt, proceed


