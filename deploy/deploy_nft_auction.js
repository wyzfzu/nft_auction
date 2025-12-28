const {deployments, upgrades, ethers} = require("hardhat");
const hre = require("hardhat");
const { verifyUpgradeableContract, delay } = require("./verify_contract");

const fs = require("fs");
const path = require("path");

const networkName = hre.network.name;
const shouldVerify = !['hardhat', 'localhost'].includes(networkName);

module.exports = async function ({deployments}) {
    const { save } = deployments;
    const [ deployer ] = await ethers.getSigners();
    console.log("部署人地址: ", deployer.address);

    const nftAuctionFactory = await ethers.getContractFactory("WyzNftAuction");
    const nftAuctionProxy = await upgrades.deployProxy(nftAuctionFactory, [], {
        initializer: "initialize",
    });
    await nftAuctionProxy.waitForDeployment();
    const nftAuctionProxyAddress = await nftAuctionProxy.getAddress();
    console.log("代理合约地址：", nftAuctionProxyAddress);
    const nftAuctionProxyImplAddress = await upgrades.erc1967.getImplementationAddress(nftAuctionProxyAddress);
    console.log("实现合约地址：", nftAuctionProxyImplAddress);

    const savePath = path.resolve(__dirname, "./.cache/proxyNftAuction.json");

    fs.writeFileSync(savePath, JSON.stringify({
        nftAuctionProxyAddress, 
        nftAuctionProxyImplAddress,
        abi: nftAuctionFactory.interface.format("json")
    }));

    await save("WyzNftAuctionProxy", {
        abi: nftAuctionFactory.interface.format("json"),
        address: nftAuctionProxyAddress,
    });
    
    if (shouldVerify) {
        // 可以调整等待时间（网络拥堵时增加）
        await delay(60); // 等待60秒，确保区块浏览器同步

        // 3. 验证实现合约（关键修复）
        console.log("\n🚀 开始验证合约...");
        
        const verificationResult = await verifyUpgradeableContract(
            nftAuctionProxyAddress,
            nftAuctionProxyImplAddress,
            [] // 如果没有构造函数参数，留空数组
        );
        
        // 输出验证摘要
        console.log("\n📊 验证结果摘要:");
        console.log("==================");
        console.log(`实现合约: ${verificationResult.implementation ? '✅ 成功' : '❌ 失败'}`);
        console.log(`代理合约: ${verificationResult.proxy ? '✅ 成功' : '❌ 失败'}`);
    }
};

module.exports.tags = ["deployWyzNftAuction"];