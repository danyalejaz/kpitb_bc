// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title CertificateRegistry
/// @notice Stub for the University of Swabi certificate registry contract.
/// @dev Logic will be filled in during the next implementation step.
contract CertificateRegistry {
    struct Certificate {
        string studentName;
        string degree;
        string rollNumber;
        uint256 graduationYear;
        string issuingUniversity;
        uint256 issuedAt;
        bool exists;
    }

    event CertificateIssued(
        bytes32 indexed id,
        string studentName,
        uint256 issuedAt
    );

    address public owner;
    mapping(address => bool) public approvedIssuers;
    mapping(address => string) public issuerUniversities;
    mapping(bytes32 => Certificate) internal certificates;

    constructor() {
        owner = msg.sender;
        approvedIssuers[msg.sender] = true;
        issuerUniversities[msg.sender] = "University of Swabi";
    }

    function issueCertificate(
        string calldata studentName,
        string calldata degree,
        string calldata rollNumber,
        uint256 graduationYear
    ) external virtual returns (bytes32) {
        // This is the gate that protects issuance: only wallets the owner has
        // approved can write certificates to the registry.
        require(approvedIssuers[msg.sender], "Not an approved issuer");

        // Same facts always produce the same ID, so the certificate can be
        // looked up and verified deterministically from its contents.
        bytes32 id = keccak256(
            abi.encodePacked(studentName, rollNumber, degree, graduationYear)
        );

        require(!certificates[id].exists, "Certificate already exists");

        string memory issuingUniversity = issuerUniversities[msg.sender];
        require(bytes(issuingUniversity).length > 0, "Issuer university not set");

        uint256 issuedAt = block.timestamp;

        certificates[id] = Certificate({
            studentName: studentName,
            degree: degree,
            rollNumber: rollNumber,
            graduationYear: graduationYear,
            issuingUniversity: issuingUniversity,
            issuedAt: issuedAt,
            exists: true
        });

        emit CertificateIssued(id, studentName, issuedAt);
        return id;
    }

    function verifyCertificate(bytes32 id)
        external
        view
        virtual
        returns (Certificate memory)
    {
        return certificates[id];
    }

    function addIssuer(address issuer) external virtual {
        require(msg.sender == owner, "Only owner can add issuer");
        approvedIssuers[issuer] = true;
    }

    function removeIssuer(address issuer) external virtual {
        require(msg.sender == owner, "Only owner can remove issuer");
        approvedIssuers[issuer] = false;
    }
}
