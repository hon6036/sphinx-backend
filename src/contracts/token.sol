// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.0.0/contracts/token/ERC20/ERC20.sol";


contract MyToken is ERC20 {
    uint256 public constant tokenpereth = 50;  // 1 ether = token 5개 
    address public tokenOwner;

    event Buy(address tokenowner, uint256 balance_owner, uint256 amount);

    constructor() ERC20("SphinxToken", "churr") {
        // Mint 100 tokens to msg.sender
        // Similar to how
        // 1 dollar = 100 cents
        // 1 token = 1 * (10 ** decimals)
        // _mint(msg.sender, 100 * 10**uint(decimals()));
        tokenOwner = msg.sender;
        _mint(msg.sender, 100*10**decimals());
    }

    function getTokenOwner() view public returns (address){ 
        return tokenOwner;
    }


    function buy(uint value) external payable returns (address, uint256, uint256){
        uint256 amount = msg.value * tokenpereth;
        emit Buy(tokenOwner, balanceOf(tokenOwner), amount);

        require(balanceOf(tokenOwner) >=  amount, "it is too much to tranasfer");
        transferFrom(tokenOwner, msg.sender, amount);
        return (tokenOwner,balanceOf(tokenOwner),amount);

    }  
 
}