const {ethes, ethers} = require("hardhat");

const main = async () =>{
      const contractFactory = await ethers.getContractFactory("NFTMARKETPLACE");
      const contract = await contractFactory.deploy();
      await contract.deployed();
      console.log("Contract is been deployed on ",contract.address);
}

const runmain = async () =>{
      try {
            await main();
            process.exit(0);
      } catch (error) {
            console.log(error);
            process.exit(1);
      }
}

runmain();