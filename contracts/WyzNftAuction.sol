// SPDX-License-Identifier: MIT 
pragma solidity ^0.8;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "hardhat/console.sol";

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract WyzNftAuction is Initializable, UUPSUpgradeable {

    struct NftAuction {
        // 卖家
        address seller;
        // 开始时间
        uint256 beginTime;
        // 持续时间(秒)
        uint256 durationSeconds;
        // 是否结束
        bool ended;
        // 起始价格
        uint256 beginPrice;
        // 最高出价人
        address highestBidder;
        // 最高价
        uint256 highestPrice;
        // nft 合约
        address nftContractAddress;
        // nft token id
        uint256 nftTokenId;
        // nft 地址
        address nftTokenAddress;
    }

    mapping(uint256 => NftAuction) public nftAuctions;
    mapping(address => AggregatorV3Interface) public priceFeeds;

    uint256 public nextAuctionId;

    address public admin;

    function initialize() public initializer {
        admin = msg.sender;
    }

    function createNftAuction(
        address nftContractAddress,
        uint256 nftTokenId,
        uint256 beginPrice,
        uint256 durationSeconds
    ) public {
        require(admin == msg.sender, "Only admin can create Auction");
        require(beginPrice > 0, "Begin Price must be greater than 0");
        require(durationSeconds >= 10, "Duration must be greater than 10 seconds");

        IERC721(nftContractAddress).safeTransferFrom(msg.sender, address(this), nftTokenId);

        nftAuctions[nextAuctionId] = NftAuction({
            seller: msg.sender,
            beginTime: block.timestamp,
            durationSeconds: durationSeconds,
            ended: false,
            beginPrice: beginPrice,
            highestBidder: address(0),
            highestPrice: 0,
            nftContractAddress: nftContractAddress,
            nftTokenId: nftTokenId,
            nftTokenAddress: address(0)
        });

        nextAuctionId++;
    }

    function participateBid(uint256 auctionId, uint256 amount, address nftTokenAddress) external payable {
        NftAuction storage auction = nftAuctions[auctionId];
        require(!auction.ended && auction.beginTime + auction.durationSeconds > block.timestamp, "Auction has ended");

        uint currentNftAnswer = uint(getChainlinkDataFeedLatestAnswer(auction.nftTokenAddress));
        uint256 currentStartPriceValue = auction.beginPrice * currentNftAnswer;
        uint256 currentHighestPrice = auction.highestPrice * currentNftAnswer;
    
        uint payPrice;
        if (nftTokenAddress == address(0)) {
            // ETH
            amount = msg.value;
            payPrice = amount * uint(getChainlinkDataFeedLatestAnswer(address(0)));
        } else {
            payPrice = amount * uint(getChainlinkDataFeedLatestAnswer(nftTokenAddress));
        }

        require(payPrice > currentHighestPrice && payPrice >= currentStartPriceValue, "Bid must be greater than the current highest bid");

        if (nftTokenAddress != address(0)) {
            IERC20(nftTokenAddress).transferFrom(msg.sender, address(this), amount);
        }
        
        if (auction.highestPrice > 0) {
            if (auction.nftTokenAddress == address(0)) {
                (bool success, ) = payable(auction.highestBidder).call{value: auction.highestPrice}("");
                require(success, "Return last highest bid failed");
            } else {
                IERC20(auction.nftTokenAddress).transfer(auction.highestBidder, auction.highestPrice);
            }
        }

        auction.highestBidder = msg.sender;
        auction.highestPrice = amount;
        auction.nftTokenAddress = nftTokenAddress;
    }

    function endAuction(uint256 auctionId) external {
        NftAuction storage auction = nftAuctions[auctionId];
        require(!auction.ended && auction.beginTime + auction.durationSeconds > block.timestamp, "Auction has ended");

        if (auction.highestPrice > 0) {
            // NFT 转移给出价最高者
            IERC721(auction.nftContractAddress).safeTransferFrom(address(this), auction.highestBidder, auction.nftTokenId);
            // 转账给卖家
            if (auction.nftTokenAddress == address(0)) {
                (bool success, ) = payable(auction.seller).call{value: auction.highestPrice}("");
                require(success, "Transfer money to seller failed!");
            } else {
                IERC20(auction.nftTokenAddress).transfer(auction.seller, auction.highestPrice);
            }
        } else {
            // 无人出价
            IERC721(auction.nftContractAddress).safeTransferFrom(address(this),  auction.seller, auction.nftTokenId);
        }

        auction.ended = true;   
    }

    function setPriceFeed(address nftTokenAddress, address priceFeed) public {
        priceFeeds[nftTokenAddress] = AggregatorV3Interface(priceFeed);
    }

    function getChainlinkDataFeedLatestAnswer(address nftTokenAddress) public view returns(int) {
        AggregatorV3Interface aggr = priceFeeds[nftTokenAddress];
        (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound) = aggr.latestRoundData();

        return answer;
    }

    function _authorizeUpgrade(address) internal view override {
        // 只有管理员可以升级合约
        require(msg.sender == admin, "Only admin can upgrade");
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }
}