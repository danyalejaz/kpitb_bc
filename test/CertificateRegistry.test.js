const { expect } = require("chai");

describe("CertificateRegistry", function () {
    async function deployFixture() {
        const [owner, nonApprovedWallet] = await ethers.getSigners();
        const CertificateRegistry = await ethers.getContractFactory("CertificateRegistry");
        const contract = await CertificateRegistry.deploy();
        await contract.waitForDeployment();
        return { contract, owner, nonApprovedWallet };
    }

    it("approved issuer can issue a certificate and the stored fields match", async function () {
        const { contract } = await deployFixture();

        const tx = await contract.issueCertificate(
            "Ayesha Khan",
            "BS Computer Science",
            "CS-2021-014",
            2025
        );
        const receipt = await tx.wait();

        const parsedEvent = receipt.logs
            .map((log) => {
                try {
                    return contract.interface.parseLog(log);
                } catch (error) {
                    return null;
                }
            })
            .find((entry) => entry && entry.name === "CertificateIssued");

        const expectedId = ethers.keccak256(
            ethers.solidityPacked(
                ["string", "string", "string", "uint256"],
                ["Ayesha Khan", "CS-2021-014", "BS Computer Science", 2025]
            )
        );

        expect(parsedEvent.args.id).to.equal(expectedId);
        expect(parsedEvent.args.studentName).to.equal("Ayesha Khan");

        const stored = await contract.verifyCertificate(expectedId);
        expect(stored.studentName).to.equal("Ayesha Khan");
        expect(stored.degree).to.equal("BS Computer Science");
        expect(stored.rollNumber).to.equal("CS-2021-014");
        expect(stored.graduationYear).to.equal(2025);
        expect(stored.issuingUniversity).to.equal("University of Swabi");
        expect(stored.exists).to.equal(true);
        expect(stored.issuedAt).to.not.equal(0n);
    });

    it("verifyCertificate returns the correct record for a valid id", async function () {
        const { contract } = await deployFixture();

        await contract.issueCertificate(
            "Hina Shah",
            "BS Software Engineering",
            "SE-2020-006",
            2024
        );

        const id = ethers.keccak256(
            ethers.solidityPacked(
                ["string", "string", "string", "uint256"],
                ["Hina Shah", "SE-2020-006", "BS Software Engineering", 2024]
            )
        );

        const record = await contract.verifyCertificate(id);
        expect(record.studentName).to.equal("Hina Shah");
        expect(record.degree).to.equal("BS Software Engineering");
        expect(record.rollNumber).to.equal("SE-2020-006");
        expect(record.graduationYear).to.equal(2024);
        expect(record.issuingUniversity).to.equal("University of Swabi");
        expect(record.exists).to.equal(true);
    });

    it('a NON-approved wallet calling issueCertificate is reverted with "Not an approved issuer"', async function () {
        const { contract, nonApprovedWallet } = await deployFixture();
        const connected = contract.connect(nonApprovedWallet);

        await expect(
            connected.issueCertificate("Sara Ali", "BA English", "EN-2019-011", 2023)
        ).to.be.revertedWith("Not an approved issuer");
    });
});
