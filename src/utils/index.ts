import { BigNumber, Wallet as EOAWallet } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import configInfo from "./configs/contractsInfo.json";
import { toast } from "react-toastify";
import { activeChainId, getExplorer, getRPCProvider } from "./chainConfig";
import { BytesLike, hexConcat, hexZeroPad, hexlify } from "ethers/lib/utils";

export { configInfo };

export interface Rule {
  offset: number;
  condition: number;
  referenceValue: string | BytesLike;
}

export interface Permission {
  destContract: string;
  functionSelector: string;
  valueLimit: BigNumber;
  rules: Rule[];
}

export async function getABISVMSessionKeyData(
  sessionKey: string,
  permission: Permission,
): Promise<string> {
  let sessionKeyData = hexConcat([
    sessionKey,
    permission.destContract,
    permission.functionSelector,
    hexZeroPad(permission.valueLimit.toHexString(), 16),
    hexZeroPad(hexlify(permission.rules.length), 2), // this can't be more 2**11 (see below), so uint16 (2 bytes) is enough
  ]);

  for (let i = 0; i < permission.rules.length; i++) {
    sessionKeyData = hexConcat([
      sessionKeyData,
      hexZeroPad(hexlify(permission.rules[i].offset), 2), // offset is uint16, so there can't be more than 2**16/32 args = 2**11
      hexZeroPad(hexlify(permission.rules[i].condition), 1), // uint8
      permission.rules[i].referenceValue,
    ]);
  }
  return sessionKeyData;
}

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
