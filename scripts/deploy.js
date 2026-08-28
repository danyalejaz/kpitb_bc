/* eslint-disable no-console */
const { ethers } = require("hardhat");

async function main() {
    const CertificateRegistry = await ethers.getContractFactory("CertificateRegistry");
    const certificateRegistry = await CertificateRegistry.deploy();

    await certificateRegistry.waitForDeployment();

    const address = await certificateRegistry.getAddress();
    console.log("CertificateRegistry deployed successfully.");
    console.log(`Contract address: ${address}`);
    console.log(`Copy this into frontend/.env as VITE_CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
