import {
  ERC20_ABI,
  type Session,
  SessionLocalStorage,
  createDANSessionKeyManagerModule,
  getChain
} from "@biconomy/account"
import { useSmartAccount } from "@biconomy/use-aa"
import type React from "react"
import { useMemo } from "react"
import "react-toastify/dist/ReactToastify.css"
import { type Hex, encodeFunctionData, parseAbi, parseUnits } from "viem"
import { useAccount } from "wagmi"
import { configInfo } from "../../utils"
import Button from "../Button"

interface props {
  session: Session,
  mpcKeyId: string
}

// Function to convert hex string to Uint8Array
function hexToUint8Array(hex: string) {
  if (hex.length % 2 !== 0) {
    throw new Error("Hex string must have an even number of characters")
  }
  const array = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    array[i / 2] = Number.parseInt(hex.substr(i, 2), 16)
  }
  return array
}

const UseDanSession: React.FC<props> = ({ session, mpcKeyId }) => {
  const token = configInfo.usdc.address as Hex
  const amount = parseUnits("20".toString(), 6)

  const { address: eoa } = useAccount()
  const { smartAccountAddress, smartAccountClient } = useSmartAccount()

  console.log("use dan session: ", smartAccountAddress)
  console.log(session)

  const transactions = useMemo(
    () => ({
      to: token,
      data: encodeFunctionData({
        abi: parseAbi(["function transfer(address _to, uint256 _value)"]),
        functionName: "transfer",
        args: [eoa!, amount]
      })
    }),
    [token, eoa, amount]
  )

  const useDanSessionHandler = async () => {
    if (!smartAccountClient || !smartAccountAddress) {
      throw new Error("Smart Account not found")
    }
    if (!session) {
      throw new Error("Session not found")
    }

    const sessionStorageClient = new SessionLocalStorage(smartAccountAddress)

    const sessionsModule = await createDANSessionKeyManagerModule({
      smartAccountAddress,
      sessionStorageClient
    })

    // Review if needed. or already baked in
    smartAccountClient.setActiveValidationModule(sessionsModule as any)

    console.log(
      "active validation module ",
      smartAccountClient.activeValidationModule
    )

    const sk = hexToUint8Array(import.meta.env.VITE_EPHEMERAL_KEY!)

    console.log("use DAN session ever here? =============>")

    const sessionID = session.sessionIDInfo[0]

    const sessionKeyEOA = (
      await session.sessionStorageClient.getSessionData({ sessionID })
    ).sessionPublicKey

    console.log("sessionKeyEOA b", sessionKeyEOA)

    // Send the transactions using session params
    const { wait } = await smartAccountClient.sendTransaction(transactions, {
      params : {
      sessionID: sessionID,
      danModuleInfo:  {
        eoaAddress: eoa as Hex,
        ephSK: sk,
        threshold: 11,
        partiesNumber: 20,
        // sessionKeyEOA,
        chainId: 80002,
        mpcKeyId: mpcKeyId as Hex,
      }
    }
    })
    // Wait for the createSessionTx
    const {
      receipt: { transactionHash },
      success
    } = await wait()

    success && console.log({ transactionHash })

    // Handle Success....
  }

  return <Button title="Minft NFT" onClickFunc={useDanSessionHandler} />
}

export default UseDanSession
