import { makeStyles } from "@mui/styles"
import type React from "react"
import { useEffect, useState } from "react"
import { type Hex, encodeFunctionData } from "viem"

import {
  useSendTransaction,
  useSmartAccount,
  useUserOpWait
} from "@biconomy/use-aa"
import { configInfo as config, showSuccessMessage } from "../../utils"
import { ErrorGuard } from "../../utils/ErrorGuard"
import Button from "../Button"

const Faucet: React.FC = () => {
  const classes = useStyles()
  const { smartAccountAddress: scwAddress } = useSmartAccount()
  const [address, setAddress] = useState(scwAddress)

  const {
    mutate,
    data: userOpResponse,
    error,
    isPending
  } = useSendTransaction()
  const {
    isSuccess: waitIsSuccess,
    error: waitError,
    isLoading: waitIsLoading,
    data: waitData
  } = useUserOpWait(userOpResponse)

  const drip = () =>
    mutate({
      transactions: {
        to: config.faucet.address as Hex,
        data: encodeFunctionData({
          abi: config.faucet.abi,
          functionName: "drip",
          args: [address as Hex]
        })
      }
    })

  useEffect(() => {
    waitIsSuccess &&
      showSuccessMessage(`Successful mint`, waitData?.receipt?.transactionHash)
  }, [waitIsSuccess, waitData])

  return (
    <main className={classes.main}>
      <ErrorGuard errors={[error, waitError]}>
        <h3 className={classes.subTitle}>Faucet</h3>
        <p>
          Get USDC and USDT test tokens. We will airdrop these tokens to the SCW
          address so you can test the SDK.
        </p>
        <h3 className={classes.h3Title}>You can also change the address</h3>
        <input
          type="text"
          placeholder="0x...."
          value={scwAddress}
          onChange={(e) => setAddress(e.target.value as Hex)}
          className={classes.input}
        />

        <Button
          title="Get tokens"
          onClickFunc={drip}
          isLoading={isPending || waitIsLoading}
        />
      </ErrorGuard>
    </main>
  )
}

const useStyles = makeStyles(() => ({
  main: {
    padding: "10px 40px",
    width: "100%",
    height: "100%",
    gap: 20,
    color: "#e6e6e6",
    display: "flex",
    flexDirection: "column",
    alignItems: "start"
    // justifyContent: "center",
  },
  subTitle: {
    color: "#FFB999",
    fontSize: 36,
    margin: 0
  },
  h3Title: {
    color: "#FFB999",
    margin: 0
  },
  container: {
    // backgroundColor: "rgb(29, 31, 33)",
  },
  containerBtn: {
    display: "flex",
    gap: 15
    // justifyContent: "space-between",
  },
  tab: {
    padding: "5px 15px",
    backgroundColor: "#FCF8E8",
    marginBottom: 10
  },
  listHover: {
    "&:hover": {
      color: "#FF9551"
    }
  },
  input: {
    maxWidth: 350,
    width: "100%",
    padding: "12px 12px",
    color: "#e6e6e6",
    outline: "1px solid #5B3320",
    backgroundColor: "#151520",
    borderRadius: 6,
    border: "none"
  }
}))

export default Faucet
