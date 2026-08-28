import { ethers } from "ethers";
import { saveCertificateRecord } from "@/lib/supabase";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as
  | string
  | undefined;
const SEPOLIA_RPC_URL = import.meta.env.VITE_SEPOLIA_RPC_URL as
  | string
  | undefined;
const SEPOLIA_CHAIN_ID = "0xaa36a7";

const CERTIFICATE_REGISTRY_ABI = [
  "function issueCertificate(string studentName,string degree,string rollNumber,uint256 graduationYear) external returns (bytes32)",
  "function verifyCertificate(bytes32 id) external view returns (tuple(string studentName,string degree,string rollNumber,uint256 graduationYear,string issuingUniversity,uint256 issuedAt,bool exists))",
  "event CertificateIssued(bytes32 indexed id,string studentName,uint256 issuedAt)",
] as const;

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}

export interface CertificateData {
  studentName: string;
  degree: string;
  rollNumber: string;
  year: string;
  issuingUniversity?: string;
  issuedAt?: string;
}

export interface VerifyResult {
  found: boolean;
  certificate?: CertificateData;
}

export interface IssueResult {
  certificateId: string;
  transactionHash: string;
  databaseSaved: boolean;
  databaseError?: string;
}

function getContractAddress() {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Missing VITE_CONTRACT_ADDRESS in frontend .env");
  }

  return CONTRACT_ADDRESS;
}

function getReadProvider() {
  if (SEPOLIA_RPC_URL) {
    return new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
  }

  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }

  throw new Error("Missing VITE_SEPOLIA_RPC_URL or MetaMask provider");
}

async function ensureSepolia(provider: ethers.BrowserProvider) {
  const network = await provider.getNetwork();
  if (network.chainId === 11155111n) return;

  await provider.send("wallet_switchEthereumChain", [
    { chainId: SEPOLIA_CHAIN_ID },
  ]);
}

function normalizeCertificateId(id: string) {
  const trimmed = id.trim();
  if (!ethers.isHexString(trimmed, 32)) {
    throw new Error("Certificate ID must be a bytes32 hex value.");
  }

  return trimmed;
}

export async function verifyCertificate(id: string): Promise<VerifyResult> {
  const provider = getReadProvider();
  const contract = new ethers.Contract(
    getContractAddress(),
    CERTIFICATE_REGISTRY_ABI,
    provider,
  );
  const record = await contract.verifyCertificate(normalizeCertificateId(id));

  if (!record.exists) return { found: false };

  return {
    found: true,
    certificate: {
      studentName: record.studentName,
      degree: record.degree,
      rollNumber: record.rollNumber,
      year: record.graduationYear.toString(),
      issuingUniversity: record.issuingUniversity,
      issuedAt: new Date(Number(record.issuedAt) * 1000).toLocaleString(),
    },
  };
}

export async function connectWallet(): Promise<string> {
  if (!window.ethereum) {
    throw new Error("MetaMask is required to connect a wallet.");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  await ensureSepolia(provider);
  const signer = await provider.getSigner();

  return signer.address;
}

export async function issueCertificate(
  data: CertificateData,
): Promise<IssueResult> {
  if (!window.ethereum) {
    throw new Error("MetaMask is required to issue a certificate.");
  }

  const graduationYear = BigInt(data.year.trim());
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  await ensureSepolia(provider);
  const signer = await provider.getSigner();
  const issuerAddress = await signer.getAddress();
  const contract = new ethers.Contract(
    getContractAddress(),
    CERTIFICATE_REGISTRY_ABI,
    signer,
  );

  const tx = await contract.issueCertificate(
    data.studentName.trim(),
    data.degree.trim(),
    data.rollNumber.trim(),
    graduationYear,
  );
  const receipt = await tx.wait();
  const event = receipt.logs
    .map((log: ethers.Log) => {
      try {
        return contract.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find(
      (log: ethers.LogDescription | null) => log?.name === "CertificateIssued",
    );

  const certificateId = event?.args.id ?? ethers.ZeroHash;
  const transactionHash = receipt.hash;
  const databaseResult = await saveCertificateRecord({
    certificate_id: certificateId,
    student_name: data.studentName.trim(),
    degree: data.degree.trim(),
    roll_number: data.rollNumber.trim(),
    graduation_year: Number(graduationYear),
    issuing_university: "University of Swabi",
    issuer_address: issuerAddress,
    transaction_hash: transactionHash,
  });

  return {
    certificateId,
    transactionHash,
    databaseSaved: databaseResult.saved,
    databaseError: databaseResult.error,
  };
}

export async function getCertificateMetadata(id: string): Promise<object> {
  const result = await verifyCertificate(id);
  return result.certificate ?? {};
}
