import {
  PaymasterMode,
  type Session,
  type Transaction,
  createSessionSmartAccountClient,
  getChain
} from "@biconomy/account"
import { useSmartAccount } from "@biconomy/use-aa"
import type React from "react"
import "react-toastify/dist/ReactToastify.css"
import { type Hex, encodeFunctionData, parseAbi } from "viem"
import { biconomyPaymasterApiKey, bundlerUrl } from "../../utils/chainConfig"
import Button from "../Button"

const withSponsorship = {
  paymasterServiceData: { mode: PaymasterMode.SPONSORED }
}
interface props {
  session: Session
}

const UseDanSession: React.FC<props> = ({ session }) => {
  const nftAddress: Hex = "0x1758f42Af7026fBbB559Dc60EcE0De3ef81f665e"
  const chain = getChain(80002)

  const { smartAccountAddress } = useSmartAccount()

  const nftMintTx: Transaction = {
    to: nftAddress,
    data: encodeFunctionData({
      abi: parseAbi(["function safeMint(address _to)"]),
      functionName: "safeMint",
      args: [smartAccountAddress]
    })
  }

  const useDanSessionHandler = async () => {
    if (!smartAccountAddress) {
      throw new Error("Smart Account not found")
    }
    if (!session) {
      throw new Error("Session not found")
    }

    const smartAccountWithSession = await createSessionSmartAccountClient(
      {
        accountAddress: smartAccountAddress, // Set the account address on behalf of the user
        biconomyPaymasterApiKey,
        bundlerUrl,
        chainId: chain.id
      },
      session,
      "DAN"
    )

    // Send the transactions using session params
    const { wait } = await smartAccountWithSession.sendSessionTransaction(
      [session, chain, null],
      nftMintTx,
      withSponsorship
    )

    const {
      receipt: { transactionHash },
      success
    } = await wait()

    success && console.log({ transactionHash })
  }

  return <Button title="Minft NFT" onClickFunc={useDanSessionHandler} />
}

export default UseDanSession
