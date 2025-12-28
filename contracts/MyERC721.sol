pragma solidity ^0.8;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyERC721 is ERC721, Ownable {
    string private myTokenURI;

    constructor() ERC721("WYZToy", "WYZToy") Ownable(msg.sender) {
    }

    function mint(address to, uint256 tokenId) external onlyOwner {
        _safeMint(to, tokenId);
    }

    function tokenURI(uint256 tokenId) public view override returns(string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return myTokenURI;
    }

    function setTokenURI(string memory newTokenURI) external onlyOwner {
        myTokenURI = newTokenURI;
    } 
}