// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";

contract GameRatio is Ownable {

    mapping (string => mapping(string => uint256)) GameSet;

    constructor() {}

    //입력받을 때는 1을 기준으로 입력 받음 ( 소수점은 입력 받을 수 없음) 왜냐면 
    function registerRatio(string memory _name, string memory _name2, uint256 _ratio) public onlyOwner returns (bool){
        
        uint256 ratio = 100*_ratio;
        GameSet[_name][_name2]=ratio;
        
        uint256 ratio2 = 100/_ratio;
        GameSet[_name2][_name] = ratio2;

        return true;

    }

    //100 기준으로 배수를 정함 (float이 없어서 저장할때 100 단위로 저장하기 때문) 값이 없으면 0을 리턴함
    function getratio(string memory _name, string memory _name2) public view returns(uint256) {
        if(GameSet[_name][_name2] != 0 ){
            return GameSet[_name][_name2];
        }
        else{
            return 0;
        }
    }

} 