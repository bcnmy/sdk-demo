import {
  DEFAULT_SESSION_KEY_MANAGER_MODULE,
  type DanModuleInfo,
  PaymasterMode,
  type Session,
  SessionLocalStorage,
  type Transaction,
  createDANSessionKeyManagerModule,
  createERC20SessionDatum,
  getDANSessionKey
} from "@biconomy/account"
import { bigIntReplacer, useSmartAccount } from "@biconomy/use-aa"
import { makeStyles } from "@mui/styles"
import type React from "react"
import { useState } from "react"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { type Hex, encodeAbiParameters, parseUnits } from "viem"
import { useAccount } from "wagmi"
import Button from "../Button"
import UseDanSession from "./UseDanSession"

import { configInfo } from "../../utils"

const CreateDanSession: React.FC = () => {
  const classes = useStyles()
  const token = configInfo.usdc.address as Hex
  const amount = parseUnits("50".toString(), 6)

  const { address: eoa } = useAccount()
  const { smartAccountAddress, smartAccountClient } = useSmartAccount()
  const [session, setSession] = useState<Session | null>(null)
  const [danModuleInfo, setDanModuleInfo] = useState<
    undefined | DanModuleInfo
  >()

  const policy: any[] = [
    { interval: { validAfter: 0, validUntil: 0 } },
    "{SESSION_KEY}",
    token,
    eoa!,
    parseUnits("50".toString(), 6)
  ]

  const createDanSessionHandler = async () => {
    try {
      if (!smartAccountClient || !smartAccountAddress) {
        throw new Error("Smart Account not found")
      }
      console.log(
        "use",
        smartAccountClient,
        "address: ",
        smartAccountAddress,
        "to create the session"
      )

      const {
        sessionKeyEOA,
        mpcKeyId,
        ephSK,
        partiesNumber,
        threshold,
        eoaAddress
      } = await getDANSessionKey(smartAccountClient)

      setDanModuleInfo({
        mpcKeyId,
        ephSK,
        partiesNumber,
        threshold,
        eoaAddress,
        chainId: 80002
      })

      const sessionStorageClient = new SessionLocalStorage(smartAccountAddress)

      const sessionsModule = await createDANSessionKeyManagerModule({
        smartAccountAddress,
        sessionStorageClient
      })

      console.log("session module")
      console.log(sessionsModule)

      const createSessionDataParams = createERC20SessionDatum({
        interval: { validAfter: 0, validUntil: 0 },
        sessionKeyAddress: sessionKeyEOA,
        sessionKeyData: encodeAbiParameters(
          [
            { type: "address" },
            { type: "address" },
            { type: "address" },
            { type: "uint256" }
          ],
          [sessionKeyEOA, token, eoa!, amount]
        )
      })

      const { data: policyData, sessionIDInfo } =
        await sessionsModule.createSessionData([createSessionDataParams])

      console.log("sessionKeyEOA a", sessionKeyEOA, {
        matchedLeaf: await sessionStorageClient.getSessionData({
          sessionID: sessionIDInfo[0]
        })
      })

      const permitTx = {
        to: DEFAULT_SESSION_KEY_MANAGER_MODULE,
        data: policyData
      }

      const txs: Transaction[] = []

      const isDeployed = await smartAccountClient.isAccountDeployed()
      const enableSessionTx = await smartAccountClient.getEnableModuleData(
        DEFAULT_SESSION_KEY_MANAGER_MODULE
      )

      if (isDeployed) {
        const enabled = await smartAccountClient.isModuleEnabled(
          DEFAULT_SESSION_KEY_MANAGER_MODULE
        )
        if (!enabled) {
          txs.push(enableSessionTx)
        }
      } else {
        txs.push(enableSessionTx)
      }

      txs.push(permitTx)

      const userOpResponse = await smartAccountClient.sendTransaction(txs, {
        paymasterServiceData: { mode: PaymasterMode.SPONSORED },
        nonceOptions: {
          nonceKey: Date.now()
        }
      })

      console.log("userOpResponse", userOpResponse)

      const {
        receipt: { transactionHash },
        success
      } = await userOpResponse.wait()

      console.log("transactionHash", transactionHash)

      const resultingSession = {
        sessionStorageClient,
        sessionIDInfo
      }

      // Handle Success. Keep the "Session" (StorageClient and sessionIDs) and set it to the session
      success && setSession(resultingSession)
    } catch (error) {
      console.error("Error creating session:", error)
    }
  }

  return (
    <main className={classes.main}>
      <p style={{ color: "#7E7E7E" }}>
        Use Cases {"->"} Modules {"->"} {!!session ? "Use" : "Create"} Dan
        Session
      </p>

      <h3 className={classes.subTitle}>
        {!!session ? "Use" : "Create"} a Dan Session
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

      {!!session && danModuleInfo ? (
        <UseDanSession session={session} danModuleInfo={danModuleInfo!} />
      ) : (
        <Button title="Create Session" onClickFunc={createDanSessionHandler} />
      )}
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

export default CreateDanSession
