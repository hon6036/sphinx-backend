// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.0.0/contracts/token/ERC20/ERC20.sol";


contract SphinxToken is ERC20 {
    uint256 public constant tokenpereth = 1;  // 1 ether = token 5개 
    address private tokenOwner;
    uint256 public temp;

    event Buy(address tokenowner, uint256 balance_owner, uint256 amount);
    event Balance(address address1, address address2, uint256 balance_owner, uint256 balance_sender,uint256 value);

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


    function buy() external payable returns (address, uint256){
        uint256 amount = msg.value * tokenpereth;
        emit Buy(tokenOwner, balanceOf(tokenOwner), amount);

        require(balanceOf(tokenOwner) >=  amount, "it is too much to tranasfer");
        _transfer(tokenOwner, msg.sender, amount);
        return (msg.sender, amount);
    }  

    function getbalance(address user) public {
        temp = balanceOf(user);
    }

    function transferToken(address from, address to, uint256 value) public payable returns(address, address, uint256) {
        require(balanceOf(from)>= value, "it is too much to tranasfer");
        emit Balance(from, to, balanceOf(from), balanceOf(from),value);
        getbalance(msg.sender);
        _transfer(from,to,value);
        return (from,to,balanceOf(from));
    }   

 
}