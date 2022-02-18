// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

//for erc-721 token 
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


 contract SphinxNFT is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenId;
    address private tokenContract;
    mapping(uint256 => uint256) private priceMap; // nfttokenID => tokenvalue
    mapping(uint256 => address) private ownerMap;  // nfttokenID => nftOwner 
    mapping (uint256 => string) private _tokenURIs;

    event BuyImage(address msg_sender);

    constructor(address _tokenContract) ERC721("SphinxToken","spin") { // nftname="Sphinx", nfySymbol = "spin";
        tokenContract = _tokenContract;
    }

    function getTokenID() internal returns(uint256){
        _tokenId.increment();
        return _tokenId.current();
    }


    //make a item to nft (from game)
    function registerNFT (string calldata _uri) external returns (uint256) {
        uint256 newItemID = getTokenID();
    
        _mint(msg.sender,newItemID);
        _tokenURIs[newItemID] = _uri;

        ownerMap[newItemID] = msg.sender;
        return newItemID;
    }

    //make a item to nft (from item market)
    function registerNFTToMarket(string calldata _uri, uint256 tokenvalue) external returns(uint256) {
        uint256 newItemID = getTokenID();
    
        _mint(msg.sender,newItemID);
        _tokenURIs[newItemID] = _uri;

        ownerMap[newItemID] = msg.sender;
        priceMap[newItemID] = tokenvalue;
        return newItemID;
    }

    //get nft value when 
    function getNFTValue(uint256 tokenId) view public returns (uint256) {
        return priceMap[tokenId];
    }

    //get uri from the nft
    function getUri(uint256 tokenId) view public returns(string memory) {
        return _tokenURIs[tokenId];
    }
    
    function buyimgnft(uint256 tokenId) public returns(address, address, uint256) {
        require(getNFTValue(tokenId) != 0 ,"this token cannot buy");
        emit BuyImage(msg.sender);

        (bool check, bytes memory data) = address(tokenContract).call(abi.encodeWithSignature("transferToken(address,address,uint256)",msg.sender,ownerOf(tokenId),getNFTValue(tokenId)));
        (address sender, address receipt, uint256 amount) = abi.decode(data, (address,address, uint256));
        require (check == true,"token contract is not true");
        _transfer(ownerMap[tokenId],msg.sender,tokenId);
        return (sender,receipt, amount);
    }
    


}