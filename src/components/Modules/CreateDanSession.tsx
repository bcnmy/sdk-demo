import {
  type CreateSessionDataParams,
  DEFAULT_SESSION_KEY_MANAGER_MODULE,
  PaymasterMode,
  type Session,
  SessionLocalStorage,
  type Transaction,
  createDANSessionKeyManagerModule,
  createERC20SessionDatum,
  createSessionKeyEOA,
  getChain
} from "@biconomy/account"
import { bigIntReplacer, useSmartAccount } from "@biconomy/use-aa"
import { makeStyles } from "@mui/styles"
import * as ed from "@noble/ed25519"
import { ethers } from "ethers"
import type React from "react"
import { useEffect, useState } from "react"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { type Hex, encodeAbiParameters, keccak256, parseUnits } from "viem"
import { useAccount, useClient } from "wagmi"
import Button from "../Button"
import UseDanSession from "./UseDanSession"

import {
  EOAAuth,
  type IBrowserWallet,
  type KeygenResponse,
  NetworkSigner,
  type TypedData,
  WalletProviderServiceClient
} from "@silencelaboratories/walletprovider-sdk"
import { configInfo } from "../../utils"

let ephSK: Uint8Array | null = null
let ephPK: Uint8Array | null = null

interface EIP6963ProviderInfo {
  uuid: string
  name: string
  icon: string
  rdns: string
}

interface RequestArguments {
  readonly method: string
  readonly params?: readonly unknown[] | object
}

interface EIP1193Provider {
  isStatus?: boolean
  host?: string
  path?: string

  request: (request: RequestArguments) => Promise<unknown>
}

export type WalletProviderDefs = {
  walletProviderId: string
  walletProviderUrl: string
}

export type Config = {
  walletProvider: WalletProviderDefs
}

const createWalletProviderService = async (config: Config) =>
  new WalletProviderServiceClient({
    walletProviderId: config.walletProvider.walletProviderId,
    walletProviderUrl: config.walletProvider.walletProviderUrl
  })

let selectedBrowserWallet: EIP1193Provider | null = null

// Sign data using the secret key stored on Browser Wallet
// It creates a popup window, presenting the human readable form of `request`
// Throws an error if User rejected signature
export class BrowserWallet implements IBrowserWallet {
  async signTypedData<T>(
    from: string,
    request: TypedData<T>
  ): Promise<unknown> {
    console.log(selectedBrowserWallet)

    //should be provider
    return await selectedBrowserWallet!.request({
      method: "eth_signTypedData_v4",
      params: [from, JSON.stringify(request)]
    })
  }
}

// Function to convert hex string to Uint8Array
function hexToUint8Array(hex: string) {
  if (hex.length % 2 !== 0) {
    throw new Error("Hex string must have an even number of characters")
  }
  const array = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    array[i / 2] = Number.parseInt(hex.substr(i, 2), 16)
  }
  return array
}

const CreateDanSession: React.FC = () => {
  const classes = useStyles()
  const token = configInfo.usdc.address as Hex
  const amount = parseUnits("50".toString(), 6)

  const { address: eoa, connector } = useAccount()
  const client = useClient()
  const { smartAccountAddress, smartAccountClient } = useSmartAccount()
  const [session, setSession] = useState<Session | null>(null)
  const [provider, setProvider] = useState<EIP1193Provider | null>(null)

  useEffect(() => {
    const fetchProvider = async () => {
      if (connector) {
        const prov = await connector.getProvider()
        prov && setProvider(prov as EIP1193Provider)
        selectedBrowserWallet = prov as EIP1193Provider
      }
    }
    fetchProvider()
  }, [connector])

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

      // const sk = ed.utils.randomPrivateKey();
      const sk = hexToUint8Array(import.meta.env.VITE_EPHEMERAL_KEY!)
      // Global variable for now
      ephSK = sk
      ephPK = await ed.getPublicKeyAsync(sk)

      const clusterConfig = {
        walletProvider: {
          walletProviderId: "WalletProvider",
          walletProviderUrl: "ws://localhost:8090/v1"
        }
      }

      const wpClient = await createWalletProviderService(clusterConfig)

      // Authenticate using EOA
      const eoaAuth = new EOAAuth(
        eoa!,
        new BrowserWallet(),
        ephPK,
        // Lifetime of one hour
        60 * 60
      )

      console.log("ephemeral public key:", ephPK)

      const threshold = 11
      const partiesNumber = 20

      const sdk = new NetworkSigner(wpClient, threshold, partiesNumber, eoaAuth)

      // Generate a new key
      const resp: KeygenResponse = await sdk.authenticateAndCreateKey(ephPK)

      console.log("keygen response:", resp)

      // resp.publicKey
      // get EOA from public key which will be session key EOA

      const pubKey = resp.publicKey

      if (pubKey.startsWith("0x")) {
        // const pubKey = resp.publicKey;
      }

      // Compute the Keccak-256 hash of the public key
      const hash = keccak256(("0x" + pubKey) as Hex)

      // The Ethereum address is the last 20 bytes of the hash
      const sessionKeyEOA = ("0x" + hash.slice(-40)) as Hex

      console.log("sessionKeyEOA a", sessionKeyEOA)

      const { sessionStorageClient } = await createSessionKeyEOA(
        smartAccountClient,
        getChain(80002)
      )

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

      console.log("policyData", policyData)
      console.log("sessionIDInfo", sessionIDInfo)

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
        paymasterServiceData: { mode: PaymasterMode.SPONSORED }
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

      {!!session ? (
        <UseDanSession session={session} />
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
