"use client"

import { useState } from "react"
import { createPublicClient, createWalletClient, custom, parseUnits, type Address } from "viem"
import { mainnet } from "viem/chains"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IMT } from "@zk-kit/imt"
import { poseidon } from '@iden3/js-crypto';
import { AbiCoder } from "ethers";
// @ts-ignore
import * as snarkjs from 'snarkjs';
import { polygon } from "viem/chains"

// ERC20 ABI for the transfer function
const erc20Abi = [
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    type: "function",
  },
] as const

const claimAbi = [
  {
   "type":"function",
   "name":"claim",
   "inputs":[{"name":"proof","type":"bytes","internalType":"bytes"}],
   "outputs":[],
   "stateMutability":"nonpayable"},
 ] as const

const zkAirdropAddress= "0x1Ff3eBc4419dD15f7e06717618c5A06364Eb63Ec"

export default function Home() {
  const [account, setAccount] = useState<Address | null>(null)

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const walletClient = createWalletClient({
          chain: mainnet,
          transport: custom(window.ethereum),
        })
        const [address] = await walletClient.requestAddresses()
        setAccount(address)
      } catch (error) {
        console.error("Failed to connect wallet:", error)
      }
    } else {
      console.error("MetaMask is not installed")
    }
  }

  const sendERC20 = async () => {
    if (!account) return

    const merkleTree: IMT = new IMT(poseidon.hash, 2, 0, 2, [])
    merkleTree.insert(BigInt("0x2555e3a97c4ac9705D70b9e5B9b6cc6Fe2977A74"))
    merkleTree.insert(BigInt("0xbd8faF57134f9C5584da070cC0be7CA8b5A24953"))
    merkleTree.insert(BigInt("0xf765b983d05595C0fB56d341D12b9B59f337Fb6c"))
    console.log("Tree root: ", merkleTree.root)

    const index= merkleTree.indexOf(BigInt(account))
    const merkleProof = merkleTree.createProof(index)
    merkleProof.siblings = merkleProof.siblings.map((s) => s[0])

    const circuitInputs = {
      accountAddress: BigInt(account),
      siblings: merkleProof.siblings,
      pathIndices: merkleProof.pathIndices
    }

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(circuitInputs, "zkAirdrop.wasm", "zkAirdrop.zkey");

    console.log("proof:", proof)
    console.log("publicSignals: ", publicSignals)

    const defaultEncode= AbiCoder.defaultAbiCoder();
    const pr = defaultEncode.encode(
          ["uint256","uint256","uint256","uint256","uint256","uint256","uint256","uint256"],
          [proof.pi_a[0], proof.pi_a[1], proof.pi_b[0][1], proof.pi_b[0][0], proof.pi_b[1][1], proof.pi_b[1][0], proof.pi_c[0], proof.pi_c[1]]);

    const tokenAddress = "0x123456789..." as Address // Replace with actual ERC20 token address
    const recipientAddress = "0x987654321..." as Address // Replace with actual recipient address
    const amount = parseUnits("1.0", 18) // Adjust amount and decimals as needed

    try {
      const walletClient = createWalletClient({
        chain: polygon,
        transport: custom(window.ethereum),
      })

      const publicClient = createPublicClient({
        chain: polygon,
        transport: custom(window.ethereum),
      })

      const { request } = await publicClient.simulateContract({
        address: zkAirdropAddress,
        abi: claimAbi,
        functionName: "claim",
        args: [pr as `0x${string}`],
        account,
      })

      const hash = await walletClient.writeContract(request)
      console.log("Transaction sent:", hash)
    } catch (error) {
      console.error("Failed to send transaction:", error)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Simple ZK Airdrop</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {!account ? (
            <Button onClick={connectWallet}>Connect to MetaMask</Button>
          ) : (
            <>
              <p className="text-sm text-gray-500">Connected: {account}</p>
              <Button onClick={sendERC20}>Claim</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

