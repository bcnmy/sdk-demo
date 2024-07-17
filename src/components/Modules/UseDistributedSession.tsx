import {
  Options,
  useSessionWithDistributedKey,
  useUserOpWait
} from "@biconomy-devx/use-aa"
import type React from "react"
import { useEffect } from "react"
import "react-toastify/dist/ReactToastify.css"
import { type Address, type Hex, encodeFunctionData, parseAbi } from "viem"
import { polygonAmoy } from "viem/chains"
import { configInfo, showSuccessMessage } from "../../utils"
import { ErrorGuard } from "../../utils/ErrorGuard"
import Button from "../Button"

interface props {
  smartAccountAddress: Address
}

const UseDistributedSession: React.FC<props> = ({ smartAccountAddress }) => {
  const {
    mutate,
    data: userOpResponse,
    error,
    isPending: isLoading
  } = useSessionWithDistributedKey()

  const {
    isLoading: waitIsLoading,
    isSuccess: waitIsSuccess,
    error: waitError,
    data: waitData
  } = useUserOpWait(userOpResponse)

  const mintTx = () =>
    mutate({
      transactions: {
        to: configInfo.nft.address,
        data: encodeFunctionData({
          abi: parseAbi(["function safeMint(address _to)"]),
          functionName: "safeMint",
          args: [smartAccountAddress as Hex]
        })
      },
      options: Options.Sponsored,
      smartAccountAddress
    })

  useEffect(() => {
    if (waitIsSuccess) {
      showSuccessMessage(`Successful mint`, waitData?.receipt?.transactionHash)
    }
  }, [waitIsSuccess, waitData])

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

export default UseDistributedSession
