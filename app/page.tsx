"use client"

import { useState } from "react"
import { createPublicClient, createWalletClient, custom, parseUnits, type Address } from "viem"
import { mainnet } from "viem/chains"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

    const tokenAddress = "0x123456789..." as Address // Replace with actual ERC20 token address
    const recipientAddress = "0x987654321..." as Address // Replace with actual recipient address
    const amount = parseUnits("1.0", 18) // Adjust amount and decimals as needed

    try {
      const walletClient = createWalletClient({
        chain: mainnet,
        transport: custom(window.ethereum),
      })

      const publicClient = createPublicClient({
        chain: mainnet,
        transport: custom(window.ethereum),
      })

      const { request } = await publicClient.simulateContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "transfer",
        args: [recipientAddress, amount],
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

