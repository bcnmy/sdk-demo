import { Wallet as EOAWallet, JsonRpcProvider } from "ethers"
import type { BytesLike } from "ethers/utils"
import { toast } from "react-toastify"
import { activeChainId, getExplorer, getRPCProvider } from "./chainConfig"
import configInfo from "./configs/contractsInfo.json"

export { configInfo }

export interface Rule {
  offset: number
  condition: number
  referenceValue: string | BytesLike
}

export interface Permission {
  destContract: string
  functionSelector: string
  valueLimit: bigint
  rules: Rule[]
}

export function ellipseAddress(address = "", width = 10): string {
  if (!address) {
    return ""
  }
  return `${address.slice(0, width)}...${address.slice(-width)}`
}

export const getEOAWallet = (privateKey: string, provider: any) => {
  // defaults
  if (!provider) {
    // TODO Fetch rpc url as per active chain id
    provider = getRPCProvider(activeChainId)
  }

  const wallet = new EOAWallet(privateKey)

  if (typeof provider === "string") {
    return wallet.connect(new JsonRpcProvider(provider))
  } else {
    return wallet.connect(provider)
  }
}

export const showErrorMessage = (message: string) => {
  toast.error(message, {
    position: "bottom-left",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined
  })
}

export const showInfoMessage = (message: string) => {
  toast.info(message, {
    position: "bottom-left",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined
  })
}

export const showSuccessMessage = (message: string, txHash?: string) => {
  toast.success(message, {
    onClick: () => {
      window.open(`${getExplorer(activeChainId)}/tx/${txHash}`, "_blank")
    },
    position: "bottom-left",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined
  })
}

export const copyToClipBoard = (copyMe: string) => {
  // if (!copyMe) showErrorMessage("Nothing to copy");
  if (!copyMe) return
  try {
    navigator.clipboard.writeText(copyMe).then(() => {
      showSuccessMessage("SmartAccount address copied!")
    })
  } catch (err) {
    showErrorMessage("Failed to copy!")
  }
}

export const formatBalance = (value: string, decimals: number) => {
  const divideBy = BigInt(10) ** BigInt(decimals)
  const balance = (
    Number.parseFloat(value) / Number.parseFloat(divideBy.toString())
  ).toFixed(4)
  console.log(" formatBalance ", balance)
  return balance.toString()
}
