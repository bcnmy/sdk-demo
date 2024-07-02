import { SessionLocalStorage } from "@biconomy/account"
import { useSession, useUserOpWait } from "@biconomy/use-aa"
import type React from "react"
import { useEffect } from "react"
import "react-toastify/dist/ReactToastify.css"
import { type Hex, encodeFunctionData, parseAbi } from "viem"
import { polygonAmoy } from "viem/chains"
import { configInfo, showSuccessMessage } from "../../utils"
import { ErrorGuard } from "../../utils/ErrorGuard"
import Button from "../Button"

interface props {
  smartAccountAddress: Hex
  address: string
  sessionID: string
}

const UseSession: React.FC<props> = ({ smartAccountAddress, sessionID }) => {
  const {
    mutate,
    data: userOpResponse,
    error,
    isPending: isLoading
  } = useSession()

  const {
    isLoading: waitIsLoading,
    isSuccess: waitIsSuccess,
    error: waitError,
    data: waitData
  } = useUserOpWait(userOpResponse)

  console.log(new SessionLocalStorage(smartAccountAddress))

  const mintTx = () =>
    mutate({
      transactions: {
        to: configInfo.nft.address,
        data: encodeFunctionData({
          abi: parseAbi(["function safeMint(address _to)"]),
          functionName: "safeMint",
          args: [smartAccountAddress as Hex]
        })
      }
    })

  useEffect(() => {
    if (waitIsSuccess) {
      showSuccessMessage(
        `Successful mint: ${polygonAmoy.blockExplorers.default.url}/tx/${waitData?.receipt?.transactionHash}`
      )
    }
  }, [waitIsSuccess, waitData])

  console.log(error, waitError)

  return (
    <ErrorGuard errors={[error, waitError]}>
      <Button
        title="Minft NFT"
        onClickFunc={mintTx}
        isLoading={isLoading || waitIsLoading}
      />
    </ErrorGuard>
  )
}

export default UseSession
