import {
  Options,
  bigIntReplacer,
  useCreateSession,
  useSmartAccount,
  useUserOpWait
} from "@biconomy-devx/use-aa"
import { makeStyles } from "@mui/styles"
import type React from "react"
import { useEffect } from "react"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import type { Hex } from "viem"
import { polygonAmoy } from "viem/chains"
import { showSuccessMessage } from "../../utils"
import { ErrorGuard } from "../../utils/ErrorGuard"
import Button from "../Button"
import UseSession from "./UseSession"

const CreateSession: React.FC = () => {
  const classes = useStyles()

  const nftAddress: Hex = "0x1758f42Af7026fBbB559Dc60EcE0De3ef81f665e"

  const { smartAccountAddress: scwAddress } = useSmartAccount()

  const policy = [
    {
      contractAddress: nftAddress,
      functionSelector: "safeMint(address)",
      rules: [
        {
          offset: 0,
          condition: 0,
          referenceValue: scwAddress
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
    isPending: isLoading
  } = useCreateSession()

  // @ts-ignore
  const sessionID = userOpResponse?.session?.sessionIDInfo?.[0]
  console.log(sessionID)

  const {
    isLoading: waitIsLoading,
    isSuccess: waitIsSuccess,
    error: waitError,
    data: waitData
  } = useUserOpWait(userOpResponse)

  useEffect(() => {
    if (waitIsSuccess) {
      showSuccessMessage(`Successful mint`, waitData?.receipt?.transactionHash)
    }
  }, [waitIsSuccess, waitData])

  const createSessionHandler = () =>
    mutate({
      policy,
      options: Options.Sponsored
    })

  return (
    <main className={classes.main}>
      <ErrorGuard errors={[error, waitError]}>
        <p style={{ color: "#7E7E7E" }}>
          Use Cases {"->"} Modules {"->"} {sessionID ? "Use" : "Create"} Session
        </p>

        <h3 className={classes.subTitle}>
          {sessionID ? "Use" : "Create"} a Session
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

        {!!sessionID ? (
          <UseSession smartAccountAddress={scwAddress} />
        ) : (
          <Button
            title="Create Session"
            onClickFunc={createSessionHandler}
            isLoading={isLoading || waitIsLoading}
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

export default CreateSession
