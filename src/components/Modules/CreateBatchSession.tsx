import type { Policy as PolicyFromSDK } from "@biconomy/account"
import {
  Options,
  bigIntReplacer,
  mergeOptions,
  useCreateBatchSession,
  useSmartAccount,
  useUserOpWait
} from "@biconomy/use-aa"
import { makeStyles } from "@mui/styles"
import type React from "react"
import { useEffect, useState } from "react"
import type { Hex } from "viem"
import { useAccount } from "wagmi"
import { configInfo, showSuccessMessage } from "../../utils"
import { ErrorGuard } from "../../utils/ErrorGuard"
import { useHasSession } from "../../utils/useHasSession"
import Button from "../Button"
import UseBatchSession from "./UseBatchSession"

export type Policy = Omit<PolicyFromSDK, "sessionKeyAddress">

const CreateBatchSession: React.FC = () => {
  const classes = useStyles()
  const { address } = useAccount()
  const { smartAccountAddress } = useSmartAccount()
  const [hasSession, setHasSession] = useState<boolean>(false)
  const canResumeSession = useHasSession(smartAccountAddress, "BATCHED")

  const showUseSession = hasSession || canResumeSession

  const policyLeaves: Policy[] = [
    {
      interval: {
        validUntil: 0,
        validAfter: 0
      },
      contractAddress: configInfo.nft.address as Hex,
      functionSelector: "safeMint(address)",
      rules: [
        {
          offset: 0,
          condition: 0,
          referenceValue: smartAccountAddress
        }
      ],
      valueLimit: 0n
    },
    {
      interval: {
        validUntil: 0,
        validAfter: 0
      },
      contractAddress: configInfo.nft.address as Hex,
      functionSelector: "safeMint(address)",
      rules: [
        {
          offset: 0,
          condition: 0,
          referenceValue: smartAccountAddress
        }
      ],
      valueLimit: 0n
    }
  ]

  const {
    mutate,
    data: userOpResponse,
    error,
    isPending: isLoading
  } = useCreateBatchSession()

  const {
    isLoading: waitIsLoading,
    isSuccess: waitIsSuccess,
    error: waitError,
    data: waitData
  } = useUserOpWait(userOpResponse)

  useEffect(() => {
    if (waitIsSuccess) {
      setHasSession(true)
      showSuccessMessage(`Successful mint`, waitData?.receipt?.transactionHash)
    }
  }, [waitIsSuccess, waitData])

  const createSessionHandler = () =>
    mutate({
      policy: policyLeaves,
      options: mergeOptions([
        Options.Sponsored,
        Options.getIncreasedVerification(50)
      ])
    })

  return (
    <main className={classes.main}>
      <ErrorGuard errors={[error, waitError]}>
        <p style={{ color: "#7E7E7E" }}>
          Use Cases {"->"} Session {"->"} Create Batch Session
        </p>

        <h3 className={classes.subTitle}>Create Batch Session Flow</h3>

        <pre>policy: {JSON.stringify(policyLeaves, bigIntReplacer, 2)}</pre>

        {!!showUseSession ? (
          <UseBatchSession
            smartAccountAddress={smartAccountAddress}
            address={address!}
          />
        ) : (
          <Button
            title="Create Session"
            isLoading={isLoading || waitIsLoading}
            onClickFunc={createSessionHandler}
          />
        )}
      </ErrorGuard>
    </main>
  )
}

const useStyles = makeStyles(() => ({
  main: {
    padding: "10px 40px",
    color: "#EEEEEE"
  },
  subTitle: {
    color: "#FFB999",
    fontSize: 36,
    margin: 0
  },
  h3Title: {
    color: "#e6e6e6"
  }
}))

export default CreateBatchSession
