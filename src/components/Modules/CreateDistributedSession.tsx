import type { PolicyWithoutSessionKey } from "@biconomy/account"
import {
  Options,
  bigIntReplacer,
  useCreateDistributedSession,
  useSmartAccount,
  useUserOpWait
} from "@biconomy/use-aa"
import { makeStyles } from "@mui/styles"
import type React from "react"
import { useEffect, useState } from "react"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import type { Hex } from "viem"
import { polygonAmoy } from "viem/chains"
import { showSuccessMessage } from "../../utils"
import { ErrorGuard } from "../../utils/ErrorGuard"
import Button from "../Button"
import UseDistributedSession from "./UseDistributedSession"

const CreateDistributedSession: React.FC = () => {
  const classes = useStyles()
  const nftAddress: Hex = "0x1758f42Af7026fBbB559Dc60EcE0De3ef81f665e"
  const { smartAccountAddress } = useSmartAccount()
  const [success, setSuccess] = useState<boolean>(false)

  const policy: PolicyWithoutSessionKey[] = [
    {
      contractAddress: nftAddress,
      functionSelector: "safeMint(address)",
      rules: [
        {
          offset: 0,
          condition: 0,
          referenceValue: smartAccountAddress
        }
      ],
      interval: {
        validUntil: 0,
        validAfter: 0
      },
      valueLimit: 0n
    }
  ]

  const {
    mutate,
    data: userOpResponse,
    error,
    isPending
  } = useCreateDistributedSession()

  const {
    isLoading: waitIsLoading,
    isSuccess: waitIsSuccess,
    error: waitError,
    data: waitData
  } = useUserOpWait(userOpResponse)

  const isLoading = waitIsLoading || isPending

  useEffect(() => {
    if (waitIsSuccess) {
      setSuccess(true)
      showSuccessMessage(
        `Successful mint: ${polygonAmoy.blockExplorers.default.url}/tx/${waitData?.receipt?.transactionHash}`
      )
    }
  }, [waitIsSuccess, waitData])

  const createDistributedSessionHandler = () =>
    mutate({
      policy,
      options: Options.Sponsored
    })

  return (
    <main className={classes.main}>
      <ErrorGuard errors={[error, waitError]}>
        <p style={{ color: "#7E7E7E" }}>
          Use Cases {"->"} Modules {"->"} {!!success ? "Use" : "Create"} Dan
          Session
        </p>

        <h3 className={classes.subTitle}>
          {!!success ? "Use" : "Create"} a Dan Session
        </h3>

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick={true}
          rtl={false}
          pauseOnFocusLoss={false}
          draggable={false}
          pauseOnHover={false}
          theme="dark"
        />

        <pre>policy: {JSON.stringify(policy, bigIntReplacer, 2)}</pre>

        {!!success ? (
          <UseDistributedSession smartAccountAddress={smartAccountAddress} />
        ) : (
          <Button
            isLoading={isLoading}
            title="Create Session"
            onClickFunc={createDistributedSessionHandler}
          />
        )}
      </ErrorGuard>
    </main>
  )
}

const useStyles = makeStyles(() => ({
  main: {
    margin: "auto",
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
  },
  listHover: {
    "&:hover": {
      color: "#FF9551"
    }
  }
}))

export default CreateDistributedSession
