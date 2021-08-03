// SPDX-License-Identifier: <SPDX-License>

pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/utils/math/SafeMath.sol";

/**
 * The FMauro Token contract
 */
contract Token {
	using SafeMath for uint;

	// Variables
	string public name = "FMauro Token";
	string public symbol = "FMA";
	uint256 public decimals = 18;
	uint256 public totalSupply;
	mapping (address => uint256) public balanceOf;

	// Events
	event Transfer(address indexed from, address indexed to, uint256 value);

  constructor() {
    totalSupply = 1000000 * (10 ** decimals);
    balanceOf[msg.sender] = totalSupply;
  }

  function transfer(address _to, uint256 _value) public returns (bool success) {
  	require (_to != address(0));
  	require (balanceOf[msg.sender] >= _value);
  	
  	balanceOf[msg.sender] = balanceOf[msg.sender].sub(_value);
  	balanceOf[_to] = balanceOf[_to].add(_value);
  	emit Transfer(msg.sender, _to, _value);
  	
  	return true;
  }

}
 