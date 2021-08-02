pragma solidity ^0.5.16;

/**
 * The FMauro Token contract
 */
contract Token {
	string public name = "FMauro Token";
	string public symbol = "FMA";
	uint256 public decimals = 18;
	uint256 public totalSupply;

  constructor() public {
    totalSupply = 1000000 * (10 ** decimals);
  }
}
