import { BigNumber, Wallet as EOAWallet } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import configInfo from "./configs/contractsInfo.json";
import { toast } from "react-toastify";
import { activeChainId, getExplorer, getRPCProvider } from "./chainConfig";

export { configInfo };

export function ellipseAddress(address = "", width = 10): string {
  if (!address) {
    return "";
  }
  return `${address.slice(0, width)}...${address.slice(-width)}`;
}

export const getEOAWallet = (privateKey: string, provider: any) => {
  // defaults
  if (!provider) {
    // TODO Fetch rpc url as per active chain id
    provider = getRPCProvider(activeChainId);
  }

  const wallet = new EOAWallet(privateKey);

  if (typeof provider === "string") {
    return wallet.connect(new JsonRpcProvider(provider));
  } else {
    return wallet.connect(provider);
  }
};

export const showErrorMessage = (message: string) => {
  toast.error(message, {
    position: "bottom-left",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};

export const showInfoMessage = (message: string) => {
  toast.info(message, {
    position: "bottom-left",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};

export const showSuccessMessage = (message: string, txHash?: string) => {
  toast.success(message, {
    onClick: () => {
      window.open(`${getExplorer(activeChainId)}/tx/${txHash}`, "_blank");
    },
    position: "bottom-left",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};

export const copyToClipBoard = (copyMe: string) => {
  // if (!copyMe) showErrorMessage("Nothing to copy");
  if (!copyMe) return;
  try {
    navigator.clipboard.writeText(copyMe).then(() => {
      showSuccessMessage("SmartAccount address copied!");
    });
  } catch (err) {
    showErrorMessage("Failed to copy!");
  }
};

export const formatBalance = (value: string, decimals: number) => {
  const divideBy = BigNumber.from(10).pow(BigNumber.from(decimals));
  const balance = (parseFloat(value) / parseFloat(divideBy.toString())).toFixed(
    4
  );
  console.log(" formatBalance ", balance);
  // let res = ethers.utils.formatEther(balance);
  return balance.toString();
};
