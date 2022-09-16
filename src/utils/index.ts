import { BigNumber, ethers, Wallet as EOAWallet } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import configEIP2771 from "./configs/EIP2771.json";
import { toast } from "react-toastify";

export { configEIP2771 };

export function ellipseAddress(address = "", width = 10): string {
  if (!address) {
    return "";
  }
  return `${address.slice(0, width)}...${address.slice(-width)}`;
}

export const getEOAWallet = (privateKey: string, provider: any) => {
  // defaults
  if (!provider) {
    provider = "https://goerli.infura.io/v3/d126f392798444609246423b06116c77";
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
    position: "top-right",
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
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};

export const showSuccessMessage = (message: string) => {
  toast.success(message, {
    position: "top-right",
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
      showSuccessMessage("Copied!");
    });
  } catch (err) {
    showErrorMessage("Failed to copy!");
  }
};

export const formatBalance = (value: string) => {
  const balance = BigNumber.from(value);
  let res = ethers.utils.formatEther(balance);
  res = (+res).toFixed(4);
  console.log(res);
  return res;
};
