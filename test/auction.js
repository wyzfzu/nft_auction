const {ethers, deployments} = require("hardhat")
const {expect} = require("chai")

describe("Test WyzNftAuction", async function() {
    it("Should Pass", async function() {
        await testWyzNftAuction();
    })
})

async function testWyzNftAuction() {
    const [signer, buyer] = await ethers.getSigners();
    console.log("signer address: ", signer.address, ", buyer address: ", buyer.address);
    await deployments.fixture(["deployWyzNftAuction"]);

    const nftAuctionProxy = await deployments.get("WyzNftAuctionProxy");
    console.log("nftAuctionProxy address: ", nftAuctionProxy.address);
    const nftAuction = await ethers.getContractAt("WyzNftAuction", nftAuctionProxy.address);

    const myERC20Factory = await ethers.getContractFactory("MyERC20");
    const myERC20 = await myERC20Factory.deploy();
    await myERC20.waitForDeployment();
    const myERC20Address = await myERC20.getAddress();

    console.log("myERC20 address: ", myERC20Address);

    let myERC20Tx = await myERC20.connect(signer).transfer(buyer, ethers.parseEther("1000"));
    await myERC20Tx.wait();

    const aggrV3 = await ethers.getContractFactory("MyAggregatorV3");
    const priceFeedEthDeploy = await aggrV3.deploy(ethers.parseEther("1"));
    const priceFeedEth = await priceFeedEthDeploy.waitForDeployment();
    const priceFeedEthAddress = await priceFeedEth.getAddress();
    console.log("eth feed: ", priceFeedEthAddress);

    const priceFeedUSDCDeploy = await aggrV3.deploy(ethers.parseEther("1"));
    const priceFeedUSDC = await priceFeedUSDCDeploy.waitForDeployment();
    const priceFeedUSDCAddress = await priceFeedUSDC.getAddress();
    console.log("USDC feed: ", priceFeedUSDCAddress);

    const tokenToUsd = [{
        token: ethers.ZeroAddress,
        priceFeed: priceFeedEthAddress
    }, {
        token: myERC20Address,
        priceFeed: priceFeedUSDCAddress
    }];

    for (let i = 0; i < tokenToUsd.length; ++i) {
        const {token, priceFeed} = tokenToUsd[i];
        console.log(`设置价格预言机: token=${token}, feed=${priceFeed}`);
        await nftAuction.setPriceFeed(token, priceFeed);
    }

    const myERC721Factory = await ethers.getContractFactory("MyERC721");
    const myERC721 = await myERC721Factory.deploy();
    await myERC721.waitForDeployment();
    const myERC721Address = await myERC721.getAddress();

    console.log("myERC721 address: ", myERC721Address);

    for (let i = 0; i < 10; ++i) {
        await myERC721.mint(signer.address, i + 1);
    }

    console.log("myERC721 铸造10个.");

    await myERC721.connect(signer).setApprovalForAll(nftAuctionProxy.address, true);
    console.log("全部授权给拍卖市场");

    let tx = await myERC20.connect(buyer).approve(nftAuctionProxy.address, ethers.MaxInt256);
    await tx.wait();

    await testEth(1, nftAuction, 0, signer, buyer, myERC20Address, myERC721Address, myERC721);
    await testERC20(2, nftAuction, 1, signer, buyer, myERC20Address, myERC721Address, myERC721);
    await testNoBid(3, nftAuction, 2, signer, myERC721Address, myERC721);
}

async function testEth(tokenId, nftAuction, auctionId, signer, buyer, myERC20Address, myERC721Address, myERC721) {
    await nftAuction.createNftAuction(myERC721Address, tokenId, ethers.parseEther("0.01"), 10);

    const auction = await nftAuction.nftAuctions(auctionId);

    console.log("创建拍卖成功，并开始拍卖: ", auction);

    // 参与拍卖
    console.log("用户[", buyer.address, "]参与竞价，价格: ", ethers.parseEther("0.01"));
    let tx = await nftAuction.connect(buyer).participateBid(auctionId, 0, ethers.ZeroAddress, {value: ethers.parseEther("0.01")});
    await tx.wait();

    console.log("用户[", buyer.address, "]参与竞价，价格: ", ethers.parseEther("0.02"));
    tx = await nftAuction.connect(buyer).participateBid(auctionId, ethers.parseEther("0.02"), myERC20Address);
    await tx.wait();

    console.log("用户[", buyer.address, "]参与竞价，价格: ", ethers.parseEther("0.03"));
    tx = await nftAuction.connect(buyer).participateBid(auctionId, 0, ethers.ZeroAddress, {value: ethers.parseEther("0.03")});
    await tx.wait();

    // 模拟等待拍卖
    await new Promise(resolve => setTimeout(resolve, 5 * 1000));

    await nftAuction.connect(signer).endAuction(auctionId);
    console.log("拍卖结束");

    const auctionResult = await nftAuction.nftAuctions(auctionId);
    console.log("拍卖结束后，拍卖结果：", auctionResult);

    // 验证拍卖结果
    expect(auctionResult.highestBidder).to.equal(buyer.address);
    expect(auctionResult.highestPrice).to.equal(ethers.parseEther("0.03")); 
    const owner = await myERC721.ownerOf(tokenId);
    console.log("owner now: ", owner);
    expect(owner).to.equal(buyer.address);
}

async function testERC20(tokenId, nftAuction, auctionId, signer, buyer, myERC20Address, myERC721Address, myERC721) {
    await nftAuction.createNftAuction(myERC721Address, tokenId, ethers.parseEther("0.01"), 10);

    const auction = await nftAuction.nftAuctions(auctionId);

    console.log("创建拍卖[", auctionId, "]成功，并开始拍卖: ", auction);

    // 参与拍卖
    console.log("用户[", buyer.address, "]参与竞价，价格: ", ethers.parseEther("0.01"));
    let tx = await nftAuction.connect(buyer).participateBid(auctionId, 0, ethers.ZeroAddress, {value: ethers.parseEther("0.01")});
    await tx.wait();

    console.log("用户[", buyer.address, "]参与竞价，价格: ", ethers.parseEther("0.02"));
    tx = await nftAuction.connect(buyer).participateBid(auctionId, ethers.parseEther("0.02"), myERC20Address);
    await tx.wait();

    // 模拟等待拍卖
    await new Promise(resolve => setTimeout(resolve, 5 * 1000));

    await nftAuction.connect(signer).endAuction(auctionId);
    console.log("[", auctionId, "]拍卖结束");

    const auctionResult = await nftAuction.nftAuctions(auctionId);
    console.log("拍卖结束后，拍卖[", auctionId, "]结果：", auctionResult);

    // 验证拍卖结果
    expect(auctionResult.highestBidder).to.equal(buyer.address);
    expect(auctionResult.highestPrice).to.equal(ethers.parseEther("0.02")); 
    const owner = await myERC721.ownerOf(tokenId);
    console.log("owner now: ", owner);
    expect(owner).to.equal(buyer.address);
}

async function testNoBid(tokenId, nftAuction, auctionId, signer, myERC721Address, myERC721) {
    await nftAuction.createNftAuction(myERC721Address, tokenId, ethers.parseEther("0.01"), 10);

    const auction = await nftAuction.nftAuctions(auctionId);

    console.log("创建拍卖成功，并开始拍卖: ", auction);

    // 模拟等待拍卖
    await new Promise(resolve => setTimeout(resolve, 5 * 1000));

    await nftAuction.connect(signer).endAuction(auctionId);
    console.log("拍卖结束");

    const auctionResult = await nftAuction.nftAuctions(auctionId);
    console.log("拍卖结束后，拍卖结果：", auctionResult);

    // 验证拍卖结果
    expect(auctionResult.highestBidder).to.equal(ethers.ZeroAddress);
    expect(auctionResult.highestPrice).to.equal(ethers.parseEther("0")); 
    const owner = await myERC721.ownerOf(tokenId);
    expect(owner).to.equal(auction.seller);
}