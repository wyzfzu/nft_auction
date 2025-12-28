const hre = require("hardhat");

/**
 * 验证可升级合约的实现合约
 * @param {string} implementationAddress - 实现合约地址
 * @param {Array} constructorArgs - 构造函数参数数组
 * @param {number} waitTime - 等待时间（毫秒），默认45000
 * @returns {Promise<boolean>} - 验证是否成功
 */
async function verifyImplementation(implementationAddress, constructorArgs = [], waitTime = 45000) {
    console.log(`\n🔍 开始验证实现合约: ${implementationAddress}`);
    console.log(`等待 ${waitTime / 1000} 秒区块确认...`);
    
    await new Promise(resolve => setTimeout(resolve, waitTime));
    
    try {
        console.log(`正在验证实现合约...`);
        await hre.run("verify:verify", {
            address: implementationAddress,
            constructorArguments: constructorArgs,
        });
        console.log("✅ 实现合约验证成功!");
        return true;
    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log("📋 实现合约已验证");
            return true;
        } else {
            console.log("❌ 实现合约验证失败:", error.message);
            console.log(`💡 可以稍后手动验证: npx hardhat verify --network sepolia ${implementationAddress} ${constructorArgs.join(' ')}`);
            return false;
        }
    }
}

/**
 * 验证代理合约（支持可升级合约）
 * @param {string} proxyAddress - 代理合约地址
 * @param {string} implementationAddress - 实现合约地址（可选，自动获取）
 * @param {number} waitTime - 等待时间（毫秒），默认30000
 * @returns {Promise<boolean>} - 验证是否成功
 */
async function verifyProxy(proxyAddress, implementationAddress = null, waitTime = 30000) {
    console.log(`\n🔍 开始验证代理合约: ${proxyAddress}`);
    console.log(`等待 ${waitTime / 1000} 秒区块确认...`);
    
    await new Promise(resolve => setTimeout(resolve, waitTime));
    
    try {
        console.log(`正在验证代理合约...`);
        
        // 方法1: 使用 Hardhat Upgrades 插件验证
        if (typeof hre.upgrades !== 'undefined' && hre.upgrades.verifyProxy) {
            await hre.upgrades.verifyProxy(proxyAddress);
            console.log("✅ 代理合约验证成功!");
            return true;
        } else {
            console.log("⚠️  Hardhat Upgrades 插件不可用，尝试其他方法...");
        }
    } catch (error) {
        // 继续尝试方法2
    }
    
    try {
        // 方法2: 如果没有实现地址，尝试获取
        let implAddress = implementationAddress;
        if (!implAddress && typeof hre.upgrades !== 'undefined') {
            try {
                implAddress = await hre.upgrades.erc1967.getImplementationAddress(proxyAddress);
                console.log(`📝 获取到实现合约地址: ${implAddress}`);
            } catch (e) {
                console.log("⚠️  无法自动获取实现合约地址");
            }
        }
        
        // 方法3: 直接验证代理合约（标准代理合约）
        console.log(`尝试直接验证代理合约...`);
        await hre.run("verify:verify", {
            address: proxyAddress,
            constructorArguments: implAddress ? [implAddress] : [],
        });
        console.log("✅ 代理合约验证成功!");
        return true;
        
    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log("📋 代理合约已验证");
            return true;
        } else if (error.message.includes("does not have bytecode")) {
            console.log("❌ 代理合约地址无效或未部署");
            return false;
        } else {
            console.log("❌ 代理合约验证失败:", error.message);
            
            // 提供手动验证建议
            if (implementationAddress) {
                console.log(`💡 可以稍后在 Etherscan 手动关联代理:`);
                console.log(`   1. 打开 https://sepolia.etherscan.io/address/${proxyAddress}`);
                console.log(`   2. 点击 "Contract" 标签`);
                console.log(`   3. 点击 "Is this a proxy?" → "Verify"`);
                console.log(`   4. 输入实现地址: ${implementationAddress}`);
            }
            return false;
        }
    }
}

/**
 * 验证完整的可升级合约（代理+实现）
 * @param {string} proxyAddress - 代理合约地址
 * @param {string} implementationAddress - 实现合约地址
 * @param {Array} constructorArgs - 构造函数参数数组
 * @returns {Promise<{proxy: boolean, implementation: boolean}>} - 验证结果
 */
async function verifyUpgradeableContract(proxyAddress, implementationAddress, constructorArgs = []) {
    console.log("🚀 开始验证可升级合约...");
    console.log(`代理地址: ${proxyAddress}`);
    console.log(`实现地址: ${implementationAddress}`);
    
    // 先验证实现合约
    const implResult = await verifyImplementation(implementationAddress, constructorArgs);
    
    if (!implResult) {
        console.log("⚠️  实现合约验证失败，代理合约验证可能也会失败");
    }
    
    // 再验证代理合约
    const proxyResult = await verifyProxy(proxyAddress, implementationAddress);
    
    return {
        implementation: implResult,
        proxy: proxyResult,
        proxyAddress,
        implementationAddress
    };
}

/**
 * 延迟等待函数（用于链上确认）
 * @param {number} seconds - 等待秒数
 */
async function delay(seconds) {
    console.log(`⏳ 等待 ${seconds} 秒...`);
    await new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

module.exports = {
    verifyImplementation,
    verifyProxy,
    verifyUpgradeableContract,
    delay
};