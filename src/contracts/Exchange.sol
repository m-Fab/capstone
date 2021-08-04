// SPDX-License-Identifier: MIT

// Deposit & Withdraw Funds
// Manage Orders - Make or Cancel
// Handle Trades - Charge fees

pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/utils/math/SafeMath.sol";
import "./Token.sol";

/**
 * The Exchange contract
 */
contract Exchange {
	using SafeMath for uint;

	// Variables
  address public feeAccount; // The account that receives exchange fees
  uint256 public feePercent; // Fee percentage
  address constant ETHER = address(0); // store Ether in tokens mapping with blank address
  mapping (address => mapping (address => uint256)) public tokens;
  mapping (uint256 => _Order) public orders;
  uint256 public orderCount;
  mapping (uint256 => bool) public orderCancelled;
  

  // Events
  event Deposit(address indexed _token, address indexed _user, uint256 _amount, uint256 _balance);
  event Withdraw(address indexed _token, address indexed _user, uint256 _amount, uint256 _balance);
  event Order(uint256 _id, address _user, address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive, uint256 _timestamp);
  event Cancel(uint256 _id, address _user, address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive, uint256 _timestamp);

  // Structs
  struct _Order {
  	uint256 id;
  	address user;
  	address tokenGet;
  	uint256 amountGet;
  	address tokenGive;
  	uint256 amountGive;
  	uint256 timestamp;  	
  }  
  
  constructor(address _feeAccount, uint256 _feePercent) {
    feeAccount = _feeAccount;
    feePercent = _feePercent;
  }

  // Fallback: reverts if Ether is sent to this smart contract by mistake
  fallback() external {
  	revert();
  }
  
  function depositEther() payable public {
  	tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);
  	emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
  }

  function withdrawEther(uint256 _amount) public {
  	require(tokens[ETHER][msg.sender] >= _amount);
  	tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(_amount);
  	payable(msg.sender).transfer(_amount);
  	emit Withdraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);	
  }

  function depositToken(address _token, uint256 _amount) public {
  	require(_token != ETHER);
  	require(Token(_token).transferFrom(msg.sender, address(this), _amount));
  	tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);
  	emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
  }
  
  function withdrawToken(address _token, uint256 _amount) public {
  	require(_token != ETHER);
  	require(tokens[_token][msg.sender] >= _amount);
  	require(Token(_token).transfer(msg.sender, _amount));
  	tokens[_token][msg.sender] = tokens[_token][msg.sender].sub(_amount);
		emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
  }

  function balanceOf(address _token, address _user) public view returns(uint256) {
  	return tokens[_token][_user];
  }

  function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public {
  	orderCount = orderCount.add(1);
  	uint256 timestamp = block.timestamp;
  	orders[orderCount] = _Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, timestamp);
  	emit Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, timestamp);
  }

  function cancelOrder(uint256 _id) public {
  	_Order storage _order = orders[_id];
  	require(address(_order.user) == msg.sender);
  	require(_order.id == _id);
  	orderCancelled[_id] = true;
  	emit Cancel(_order.id, msg.sender, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive, block.timestamp);
  }
  
}

// TODO :
// [X] Set the fee account
// [X] Deposit Ether
// [X] Withdraw Ether
// [X] Deposit Token
// [X] Withdraw Token
// [X] Check Balances
// [X] Make Order
// [ ] Fill Order
// [X] Cancel Order
// [ ] Charge fees