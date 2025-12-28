const { ethers, upgrades, network } = require("hardhat");
const fs = require("fs");
const path = require("path");
const { verifyUpgradeableContract, delay } = require("./verify_contract");
const networkName = network.name;
const shouldVerify = !['hardhat', 'localhost'].includes(networkName);

module.exports = async function ({deployments}) {
    const { save } = deployments;
    const [ deployer ] = await ethers.getSigners();
    console.log("部署人地址: ", deployer.address);

    const savePath = path.resolve(__dirname, "./.cache/proxyNftAuction.json");
    if (!fs.existsSync(savePath)) {
        throw new Error(`缓存文件不存在: ${savePath}`);
    }
    const saveData = fs.readFileSync(savePath, "utf-8");
    // console.log("proxy file data: ", saveData);

    const {nftAuctionProxyAddress, nftAuctionProxyImplAddress, abi} = JSON.parse(saveData);

    console.log("代理合约地址：", nftAuctionProxyAddress);

    // 2. 验证代理地址有效性
    if (!nftAuctionProxyAddress || nftAuctionProxyAddress === "0x" || nftAuctionProxyAddress.length !== 42) {
        throw new Error(`无效的代理地址: ${proxyAddress}`);
    }

    const wyzNftAuctionV2Factory = await ethers.getContractFactory("WyzNftAuctionV2");
    const wyzNftAuctionV2Proxy = await upgrades.upgradeProxy(nftAuctionProxyAddress, wyzNftAuctionV2Factory, {call: {fn: "admin"}});
    await wyzNftAuctionV2Proxy.waitForDeployment();
    const wyzNftAuctionV2ProxyAddress = await wyzNftAuctionV2Proxy.getAddress();
    const nftAuctionProxyV2ImplAddress = await upgrades.erc1967.getImplementationAddress(wyzNftAuctionV2ProxyAddress);
    console.log("升级后代理合约地址：", wyzNftAuctionV2ProxyAddress);
    console.log("升级后实现合约地址：", nftAuctionProxyV2ImplAddress);

    const savePathV2 = path.resolve(__dirname, "./.cache/proxyNftAuctionV2.json");
    fs.writeFileSync(savePathV2, JSON.stringify({
        proxyAddress: wyzNftAuctionV2ProxyAddress,
        nftAuctionProxyV2ImplAddress,
        abi: wyzNftAuctionV2Factory.interface.format("json"),
    }))

    await save("WyzNftAuctionProxyV2", { abi, address: wyzNftAuctionV2ProxyAddress});

    if (shouldVerify) {
        // 可以调整等待时间（网络拥堵时增加）
        await delay(60); // 等待60秒，确保区块浏览器同步

        // 3. 验证实现合约（关键修复）
        console.log("\n🚀 开始验证合约...");
        
        const verificationResult = await verifyUpgradeableContract(
            wyzNftAuctionV2ProxyAddress,
            nftAuctionProxyV2ImplAddress,
            [] // 如果没有构造函数参数，留空数组
        );
        
        // 输出验证摘要
        console.log("\n📊 合约升级验证结果摘要:");
        console.log("==================");
        console.log(`实现合约: ${verificationResult.implementation ? '✅ 成功' : '❌ 失败'}`);
        console.log(`代理合约: ${verificationResult.proxy ? '✅ 成功' : '❌ 失败'}`);
    }
}

module.exports.tags = ["upgradeWyzNftAuction"];