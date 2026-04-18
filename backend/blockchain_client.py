"""
blockchain_client.py
Connects to local Hardhat node and provides functions for logging events and managing consent.
"""

import json
import os
from web3 import Web3

# --- Connect to Hardhat node ---
w3 = Web3(Web3.HTTPProvider('http://localhost:8545'))
if not w3.is_connected():
    raise ConnectionError("❌ Cannot connect to Hardhat node. Is 'npx hardhat node' running?")
print("✅ Connected to Hardhat node")

# --- Load contract ABI and address from deployment.json ---
deployment_path = os.path.join(os.path.dirname(__file__), "../blockchain/deployment.json")
if not os.path.exists(deployment_path):
    raise FileNotFoundError(f"❌ deployment.json not found at {deployment_path}. Run 'npm run deploy' first.")

with open(deployment_path, "r") as f:
    deployment_info = json.load(f)

CONTRACT_ADDRESS = deployment_info["address"]
CONTRACT_ABI = deployment_info["abi"]

contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)

# --- Default accounts (Hardhat test accounts) ---
# We'll use account #0 as the "system" caller for logging events.
DEFAULT_ACCOUNT = w3.eth.accounts[0]
w3.eth.default_account = DEFAULT_ACCOUNT

# --- Patient Address Mapping (MRN -> Ethereum address) ---
# In a real system, this would be stored in DB. For demo, we map to Hardhat accounts #1, #2, #3.
PATIENT_ADDRESSES = {
    "MRN-2024-00041": w3.eth.accounts[1],  # Mrs. Sharma
    "MRN-2024-00082": w3.eth.accounts[2],  # Mr. Gupta
    "MRN-2024-00113": w3.eth.accounts[3],  # Mr. Kapoor
    "MRN-2024-00124": w3.eth.accounts[4],  # Mrs. Menon
    "MRN-2024-08741": w3.eth.accounts[5],  # Priya Sharma (for consent demo)
}

def get_patient_address(mrn: str) -> str:
    """Return Ethereum address for a given MRN. Fallback to default account if not found."""
    return PATIENT_ADDRESSES.get(mrn, DEFAULT_ACCOUNT)


def log_access(patient_mrn: str, action: str) -> str:
    """
    Log an action on the blockchain.
    Returns the transaction hash as a hex string.
    """
    patient_address = get_patient_address(patient_mrn)
    tx_hash = contract.functions.logAccess(patient_address, action).transact()
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    return receipt.transactionHash.hex()


def grant_consent(patient_mrn: str, provider_address: str, duration_seconds: int, data_scope: str) -> str:
    """
    Grant consent from a patient to a provider.
    Returns transaction hash.
    """
    patient_address = get_patient_address(patient_mrn)
    tx_hash = contract.functions.grantConsent(
        provider_address,
        duration_seconds,
        data_scope
    ).transact({'from': patient_address})
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    return receipt.transactionHash.hex()


def revoke_consent(patient_mrn: str, provider_address: str) -> str:
    """
    Revoke consent.
    Returns transaction hash.
    """
    patient_address = get_patient_address(patient_mrn)
    tx_hash = contract.functions.revokeConsent(provider_address).transact({'from': patient_address})
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    return receipt.transactionHash.hex()


def check_consent(patient_mrn: str, provider_address: str) -> bool:
    """Check if consent is currently active."""
    patient_address = get_patient_address(patient_mrn)
    return contract.functions.checkConsent(patient_address, provider_address).call()


if __name__ == "__main__":
    # Quick test
    print("Testing blockchain client...")
    tx = log_access("MRN-2024-00041", "Test log from blockchain_client")
    print(f"Logged access, tx hash: {tx}")