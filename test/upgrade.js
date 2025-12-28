const {ethers, deployments} = require("hardhat")
const {expect} = require("chai")

describe("Test WyzNftAuction Upgrade", async function() {
    it("Should Pass Upgreade", async function() {
        await testWyzNftAuctionUpgrade();
    })
})

async function testWyzNftAuctionUpgrade() {
    const [signer, buyer] = await ethers.getSigners();

    await deployments.fixture(["deployWyzNftAuction"]);

    const wyzNftAuctionProxy = await deployments.get("WyzNftAuctionProxy");

    const myERC721Factory = await ethers.getContractFactory("MyERC721");
    const myERC721 = await myERC721Factory.deploy();
    await myERC721.waitForDeployment();
    const myERC721Address = await myERC721.getAddress();

    console.log("myERC721 address: ", myERC721Address);

    for (let i = 0; i < 10; ++i) {
        await myERC721.mint(signer.address, i + 1);
    }

    console.log("myERC721 铸造10个.");

    const tokenId = 1;

    await myERC721.connect(signer).setApprovalForAll(wyzNftAuctionProxy.address, true);
    console.log("全部授权给拍卖市场");

    const nftAuction = await ethers.getContractAt("WyzNftAuction", wyzNftAuctionProxy.address);

    await nftAuction.createNftAuction(myERC721Address, tokenId, ethers.parseEther("0.01"), 10);

    const auction = await nftAuction.nftAuctions(0);

    console.log("创建拍卖成功，并开始拍卖: ", auction);

    const implAddress1 = await upgrades.erc1967.getImplementationAddress(wyzNftAuctionProxy.address);

    console.log("升级前逻辑合约地址: ", implAddress1);
    await deployments.fixture(["upgradeWyzNftAuction"]);

    const implAddress2 = await upgrades.erc1967.getImplementationAddress(wyzNftAuctionProxy.address);
    console.log("升级后逻辑合约地址: ", implAddress2);

    const auctionUp = await nftAuction.nftAuctions(0);
    console.log("合约升级后读取拍卖成功：", auctionUp);

    const nftAuctionUp = await ethers.getContractAt("WyzNftAuctionV2", wyzNftAuctionProxy.address);
    const msg = await nftAuctionUp.addCustom();
    console.log("升级后合约调用方法结果：", msg);

    expect(auctionUp.startTime).to.equal(auction.startTime);
}