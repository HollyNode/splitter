// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Controller {

    // State Variables
    address public owner;
    address payable wallet1; 
    address payable wallet2;

    // Event Declaration
    event PaymentSplit(address indexed recipient1, uint256 amount1, address indexed recipient2, uint256 amount2);
    event PaymentSent(address indexed recipient, uint256 amount);

    // Struct Definitions
    struct userName {
        string name;
        bool hasName;
    }

    struct request {
        address requestor;
        uint256 amount;
        string message;
        string name;
    }

    struct sendReceive {
        string action;
        uint256 amount;
        string message;
        address otherPartyAddress;
        string otherPartyName;
    }

    // Mappings
    mapping(address => userName) names;
    mapping(address => request[]) requests;
    mapping(address => sendReceive[]) history;

    // Constructor
    constructor() {
        owner = msg.sender;
        wallet1 = payable(); // Replace with actual address
        wallet2 = payable(); // Replace with actual address
    }

     modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can call this function.");
        _;
    }

    function clearAllRequestsForUser(address user) public onlyOwner {
        delete requests[user];
    }

    function addName(string memory _name) public {
        userName storage newUserName = names[msg.sender];
        newUserName.name = _name;
        newUserName.hasName = true;
    }

    function createRequest(address user, uint256 _amount, string memory _message) public {
        request memory newRequest;
        newRequest.requestor = msg.sender;
        newRequest.amount = _amount;
        newRequest.message = _message;
        if(names[msg.sender].hasName){
            newRequest.name = names[msg.sender].name;
        }
        requests[user].push(newRequest);
    }

    function payRequest(uint256 _request) public payable {
    // Checks
    require(requests[msg.sender].length > 0, "No requests exist");  
    require(_request < requests[msg.sender].length, "Invalid request index");
    request[] storage myRequests = requests[msg.sender];
    request storage payableRequest = myRequests[_request];
    require(msg.value == payableRequest.amount, "Incorrect payment amount");
    
    // Effects
    addHistory(msg.sender, payableRequest.requestor, payableRequest.amount, payableRequest.message);
    myRequests[_request] = myRequests[myRequests.length-1];
    myRequests.pop();

    // Interactions
    uint amountToSend = msg.value / 2;
    wallet1.transfer(amountToSend);
    wallet2.transfer(amountToSend);
    emit PaymentSplit(wallet1, amountToSend, wallet2, amountToSend);
}

   function withdraw() public {
    // Checks
    require(msg.sender == owner, "Only owner can withdraw");
    uint balance = address(this).balance;

    // Effects
    uint amountToSend = balance / 2;

    // Interactions
    wallet1.transfer(amountToSend);
    wallet2.transfer(amountToSend);
    emit PaymentSent(wallet1, amountToSend);
    emit PaymentSent(wallet2, amountToSend);
}


    function addHistory(address sender, address receiver, uint256 _amount, string memory _message) private {
        sendReceive memory newSend;
        newSend.action = "Send";
        newSend.amount = _amount;
        newSend.message = _message;
        newSend.otherPartyAddress = receiver;
        if(names[receiver].hasName){
            newSend.otherPartyName = names[receiver].name;
        }
        history[sender].push(newSend);

        sendReceive memory newReceive;
        newReceive.action = "Receive";
        newReceive.amount = _amount;
        newReceive.message = _message;
        newReceive.otherPartyAddress = sender;
        if(names[sender].hasName){
            newReceive.otherPartyName = names[sender].name;
        }
        history[receiver].push(newReceive);
    }

    function getMyRequests(address _user, uint start, uint pageSize) 
    public view returns(address[] memory, uint256[] memory, string[] memory, string[] memory) 
{
    require(start < requests[_user].length, "Start index out of bounds");
    
    uint end = start + pageSize;
    if (end > requests[_user].length) {
        end = requests[_user].length;
    }
    
    address[] memory addrs = new address[](end - start);
    uint256[] memory amnt = new uint256[](end - start);
    string[] memory msge = new string[](end - start);
    string[] memory nme = new string[](end - start);
    
    for (uint i = start; i < end; i++) {
        request storage myRequests = requests[_user][i];
        addrs[i - start] = myRequests.requestor;
        amnt[i - start] = myRequests.amount;
        msge[i - start] = myRequests.message;
        nme[i - start] = myRequests.name;
    }
    
    return (addrs, amnt, msge, nme);
}


    function getRequestDetails(address _user, uint256 _index) public view returns(address, uint256, string memory, string memory) {
    require(_index < requests[_user].length, "Request index out of bounds");
    
    request storage specificRequest = requests[_user][_index];
    
    return (specificRequest.requestor, specificRequest.amount, specificRequest.message, specificRequest.name);
}


    function getMyHistory(address _user) public view returns(sendReceive[] memory) {
        return history[_user];
    }

    function getMyName(address _user) public view returns(userName memory) {
        return names[_user];
    }
}
