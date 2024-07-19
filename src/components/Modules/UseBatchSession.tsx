import type { Transaction } from "@biconomy-devx/account"
import { Options, useBatchSession, useUserOpWait } from "@biconomy-devx/use-aa"
import type React from "react"
import { useEffect } from "react"
import "react-toastify/dist/ReactToastify.css"
import { type Hex, encodeFunctionData, parseAbi } from "viem"
import { configInfo, showSuccessMessage } from "../../utils"
import { ErrorGuard } from "../../utils/ErrorGuard"
import Button from "../Button"

interface props {
  smartAccountAddress?: Hex
  address?: string
}

const UseBatchSession: React.FC<props> = ({ smartAccountAddress }) => {
  const {
    mutate,
    data: userOpResponse,
    error,
    isPending: isLoading
  } = useBatchSession()

  const {
    isLoading: waitIsLoading,
    isSuccess: waitIsSuccess,
    error: waitError,
    data: waitData
  } = useUserOpWait(userOpResponse)

  const nftMintTx: Transaction = {
    to: configInfo.nft.address,
    data: encodeFunctionData({
      abi: parseAbi(["function safeMint(address _to)"]),
      functionName: "safeMint",
      args: [smartAccountAddress as Hex]
    })
  }

  const txTwice = () =>
    mutate({
      transactions: [nftMintTx, nftMintTx],
      correspondingIndexes: [0, 1],
      options: Options.getIncreasedVerification(50),
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
        title="Mint Twice"
        onClickFunc={txTwice}
        isLoading={isLoading || waitIsLoading}
      />
    </ErrorGuard>
  )
}

export default UseBatchSession
