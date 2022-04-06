// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.1;

contract SupplyChainMultiSig{
    address owner;
    constructor(){
        owner = msg.sender;
    }
    //3 states of a product. First one is the default state
    //When The Product is added to the blockchain, it is marked as ready for sale.
    //With the multi signature of product owner and the receiver the status will be changed to Received
    //More States of the product can be added easily due to the flxible structure of the contract itself
    enum Status {NotReadyForSale, ReadyForSale, Received}
    mapping (uint => Status) public productStatus;
    mapping (uint => mapping(address => bool)) isProductOwner;
    mapping (uint => mapping(address => bool)) isProductReceiver;
    event ReadyToBeReceived(
        uint id,
        address receiver,
        uint txIndex
    );
    event ProductReceived(
        uint id,
        address receiver,
        uint txIndex
    );
    struct Transaction{
        uint id;
        Status status;
        bool executed;
        address confirmer;
    }
    //The Transactions Array which will hold all the available contracts which has 2 states 1. Not Executed 2. Executed
    //More states can be handled just add to Status enum and use the function confirmTransaction when necessary
    //One party pushes the transaction into the array and the other party confirms it.
    Transaction [] public transactions;
    modifier isAdded(uint _id){
        require(productStatus[_id] == Status.NotReadyForSale, "Product Already Added");
        _;
    }
    modifier isOwner(uint _id){
        require(isProductOwner[_id][msg.sender],"Is Not Product Owner");
        _;
    }
    modifier canBeConfirmed(uint _txIndex){
        require(!transactions[_txIndex].executed, "Transaction Already Executed");
        require(transactions[_txIndex].confirmer == msg.sender, "Cannot Confirm Transaction With this Wallet");
        _;
    }
    function addProduct (uint _id) public {
        productStatus[_id] = Status.ReadyForSale;
        isProductOwner[_id][msg.sender] = true;
    }
    function shipProduct (uint _id, address receiver) public isOwner(_id) {
        uint _txIndex = transactions.length;
        isProductReceiver[_id][receiver] = true;
        _pushTransaction(receiver, _id, Status.Received);
        emit ReadyToBeReceived(_id, receiver, _txIndex);
    }
    function receiveProduct (uint _id, uint _txIndex) public {
        _confirmTransaction(_txIndex);
        emit ProductReceived(_id, msg.sender, _txIndex);
    }
    function _pushTransaction (address _confirmer, uint _id, Status _status) internal{
        transactions.push(Transaction({
            id: _id,
            status: _status,
            confirmer: _confirmer,
            executed: false
        }));
    }
    function _confirmTransaction(uint _txIndex) internal canBeConfirmed(_txIndex){
        productStatus[transactions[_txIndex].id] = transactions[_txIndex].status;
        transactions[_txIndex].executed = true;
    }
}