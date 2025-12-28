# 环境说明
1. Solidity 0.8.28, node v22.2.0

1. 合约地址
2.1 升级前合约地址：
- 代理合约地址： 0xe66FB53C84Fae27A75d9c414C53e095Dd7b54215
- 实现合约地址： 0xb4D535253d2f2e697422bD66699C969eD8e8034f

2.2 升级后合约地址：
- 代理合约地址：0xb92CcF2A9dB4B02Ca7bd97f0560F6457d9956Fed
- 实现合约地址：

3. 测试
- `npx hardhat test`
- `npx hardhat coverage`

4. 部署
4.1 首次部署
- `npx hardhat deploy --network sepolia --tags deployWyzNftAuction`

4.1.1 部署日志
- 部署人地址:  0x64F60E7e1403f3F1F4fd3671d6984e784BaE1415
- 代理合约地址： 0xe66FB53C84Fae27A75d9c414C53e095Dd7b54215
- 实现合约地址： 0xb4D535253d2f2e697422bD66699C969eD8e8034f
- ⏳ 等待 60 秒...
- 🚀 开始验证合约...
- 🚀 开始验证可升级合约...
- 代理地址: 0xe66FB53C84Fae27A75d9c414C53e095Dd7b54215
- 实现地址: 0xb4D535253d2f2e697422bD66699C969eD8e8034f

- 🔍 开始验证实现合约: 0xb4D535253d2f2e697422bD66699C969eD8e8034f
- 等待 45 秒区块确认...
- 正在验证实现合约...
Successfully submitted source code for contract
contracts/WyzNftAuction.sol:WyzNftAuction at 0xb4D535253d2f2e697422bD66699C969eD8e8034f
for verification on the block explorer. Waiting for verification result...

Successfully verified contract WyzNftAuction on the block explorer.
https://sepolia.etherscan.io/address/0xb4D535253d2f2e697422bD66699C969eD8e8034f#code

- ✅ 实现合约验证成功!

- 🔍 开始验证代理合约: 0xe66FB53C84Fae27A75d9c414C53e095Dd7b54215
- 等待 30 秒区块确认...
- 正在验证代理合约...
- Verifying implementation: 0xb4D535253d2f2e697422bD66699C969eD8e8034f
The contract 0xb4D535253d2f2e697422bD66699C969eD8e8034f has already been verified on the block explorer. If you're trying to verify a partially verified contract, please use the --force flag.
https://sepolia.etherscan.io/address/0xb4D535253d2f2e697422bD66699C969eD8e8034f#code

- Verifying proxy: 0xe66FB53C84Fae27A75d9c414C53e095Dd7b54215
Failed to verify ERC1967Proxy contract at 0xe66FB53C84Fae27A75d9c414C53e095Dd7b54215: Already Verified
Linking proxy 0xe66FB53C84Fae27A75d9c414C53e095Dd7b54215 with implementation
Successfully linked proxy to implementation.
- 📋 代理合约已验证

- 📊 验证结果摘要:
==================
- 实现合约: ✅ 成功
- 代理合约: ✅ 成功


4.2 升级合约：
- `npx hardhat deploy --network sepolia --tags upgradeWyzNftAuction`

- 部署人地址:  0x64F60E7e1403f3F1F4fd3671d6984e784BaE1415
- 代理合约地址： 0xe66FB53C84Fae27A75d9c414C53e095Dd7b54215
- 升级后代理合约地址： 0xe66FB53C84Fae27A75d9c414C53e095Dd7b54215
- 升级后实现合约地址： 0x849C4948b1254be8DB379b9636730F2159cB0c48
- ⏳ 等待 60 秒...

- 🚀 开始验证合约...
- 🚀 开始验证可升级合约...
- 代理地址: 0xe66FB53C84Fae27A75d9c414C53e095Dd7b54215
- 实现地址: 0x849C4948b1254be8DB379b9636730F2159cB0c48

- 🔍 开始验证实现合约: 0x849C4948b1254be8DB379b9636730F2159cB0c48
- 等待 45 秒区块确认...
- 正在验证实现合约...
Successfully submitted source code for contract
contracts/WyzNftAuctionV2.sol:WyzNftAuctionV2 at 0x849C4948b1254be8DB379b9636730F2159cB0c48
for verification on the block explorer. Waiting for verification result...

Successfully verified contract WyzNftAuctionV2 on the block explorer.
https://sepolia.etherscan.io/address/0x849C4948b1254be8DB379b9636730F2159cB0c48#code

- ✅ 实现合约验证成功!

- 🔍 开始验证代理合约: 0xe66FB53C84Fae27A75d9c414C53e095Dd7b54215
- 等待 30 秒区块确认...
- 正在验证代理合约...
- Verifying implementation: 0x849C4948b1254be8DB379b9636730F2159cB0c48
The contract 0x849C4948b1254be8DB379b9636730F2159cB0c48 has already been verified on the block explorer. If you're trying to verify a partially verified contract, please use the --force flag.
https://sepolia.etherscan.io/address/0x849C4948b1254be8DB379b9636730F2159cB0c48#code

- Verifying proxy: 0xe66FB53C84Fae27A75d9c414C53e095Dd7b54215
Failed to verify ERC1967Proxy contract at 0xe66FB53C84Fae27A75d9c414C53e095Dd7b54215: Already Verified
Linking proxy 0xe66FB53C84Fae27A75d9c414C53e095Dd7b54215 with implementation
Successfully linked proxy to implementation.
- 📋 代理合约已验证

- 📊 合约升级验证结果摘要:
==================
- 实现合约: ✅ 成功
- 代理合约: ✅ 成功

5. 覆盖率
### 📊 测试覆盖率统计表

| File | % Stmts | % Branch | % Funcs | % Lines | Uncovered Lines |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **contracts/** | **86.05** | **60.53** | **66.67** | **85.96** | |
| &emsp;MyAggregatorV3.sol | 20 | 100 | 28.57 | 28.57 | 13,17,21,25,33 |
| &emsp;MyERC20.sol | 100 | 100 | 100 | 100 | |
| &emsp;MyERC721.sol | 33.33 | 16.67 | 50 | 25 | 17,18,22 |
| &emsp;WyzNftAuction.sol | 100 | 68.75 | 100 | 100 | |
| &emsp;WyzNftAuctionV2.sol | 100 | 100 | 100 | 100 | |
| **All files** | **86.05** | **60.53** | **66.67** | **85.96** | |
