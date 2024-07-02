import {
  type DanModuleInfo,
  PaymasterMode,
  type Session,
  createDANSessionKeyManagerModule
} from "@biconomy/account"
import { useSmartAccount } from "@biconomy/use-aa"
import type React from "react"
import "react-toastify/dist/ReactToastify.css"
import { type Hex, encodeFunctionData, parseAbi, parseUnits } from "viem"
import { configInfo } from "../../utils"
import Button from "../Button"

interface props {
  session: Session
  danModuleInfo: DanModuleInfo
}

const UseDanSession: React.FC<props> = ({
  session,
  danModuleInfo: {
    ephSK,
    mpcKeyId,
    threshold,
    partiesNumber,
    chainId,
    eoaAddress
  }
}) => {
  const token = configInfo.usdc.address as Hex
  const amount = parseUnits("1".toString(), 6)

  const sessionID = session.sessionIDInfo[0]
  console.log({ session, sessionID, eoaAddress })

  const { smartAccountAddress, smartAccountClient } = useSmartAccount()

  const transactions = {
    to: token,
    data: encodeFunctionData({
      abi: parseAbi(["function transfer(address _to, uint256 _value)"]),
      functionName: "transfer",
      args: [eoaAddress as Hex, amount]
    })
  }

  const useDanSessionHandler = async () => {
    if (!smartAccountClient || !smartAccountAddress) {
      throw new Error("Smart Account not found")
    }
    if (!session) {
      throw new Error("Session not found")
    }

    const sessionStorageClient = session.sessionStorageClient

    const matchedLeaf = await session.sessionStorageClient.getSessionData({
      sessionID
    })

    console.log("sessionKeyEoa b", matchedLeaf.sessionPublicKey, {
      matchedLeaf
    })

    smartAccountClient.setActiveValidationModule(
      await createDANSessionKeyManagerModule({
        smartAccountAddress,
        sessionStorageClient
      })
    )

    // Send the transactions using session params
    const { wait } = await smartAccountClient.sendTransaction(transactions, {
      paymasterServiceData: { mode: PaymasterMode.SPONSORED },
      nonceOptions: {
        nonceKey: Date.now()
      },
      params: {
        sessionID,
        danModuleInfo: {
          eoaAddress,
          ephSK,
          threshold,
          partiesNumber,
          chainId,
          mpcKeyId
        }
      }
    })
    // Wait for the createSessionTx
    const {
      receipt: { transactionHash },
      success
    } = await wait()

    success && console.log({ transactionHash })
  }

  return <Button title="Minft NFT" onClickFunc={useDanSessionHandler} />
}

export default UseDanSession
