const Token = artifacts.require("Token");
const Exchange = artifacts.require("Exchange");

module.exports = async function (deployer) {

  await deployer.deploy(Token);

  const accounts = await web3.eth.getAccounts();
  const feeAccounts = accounts[0];
  const feePercent = 10;
  
  await deployer.deploy(Exchange ,feeAccounts ,feePercent);
};
