const { ethers } = require("ethers");
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();

  await voting.waitForDeployment();

  console.log("Voting contract deployed to:", await voting.getAddress());
  
  // Add some sample candidates for testing
  const contract = await hre.ethers.getContractAt("Voting", await voting.getAddress());
  
  // Add candidates for election 1 (Local Council Elections)
  await contract.addCandidate(1, 1, "Rajesh Kumar");
  await contract.addCandidate(1, 2, "Priya Sharma");
  await contract.addCandidate(1, 3, "Amit Patel");
  
  // Add candidates for election 2 (State Assembly Elections)
  await contract.addCandidate(2, 4, "Sunita Verma");
  await contract.addCandidate(2, 5, "Vikram Singh");
  
  console.log("Sample candidates added to the contract");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });