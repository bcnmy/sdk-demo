import React from "react";
import {
  PaymasterMode,
  SessionData,
  createSessionSmartAccountClient,
} from "@biconomy/account";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Hex, encodeFunctionData, parseAbi } from "viem";
import Button from "../Button";
import { configInfo } from "../../utils";
import { polygonAmoy } from "viem/chains";
import { bundlerUrl, paymasterApiKey } from "../../utils/chainConfig";

interface props {
  smartAccountAddress: Hex;
  address: string;
  session: SessionData;
}

const UseABISVM: React.FC<props> = ({
  smartAccountAddress,
  address,
  session,
}) => {
  const sendUserOpWithData = async (
    to: string,
    data: string,
    value: string,
    sessionId: string,
    message?: string
  ) => {
    if (!address || !smartAccountAddress || !address) {
      alert("Connect wallet first");
      return;
    }

    const toastMessage = message;
    console.log(toastMessage);
    try {
      toast.info(toastMessage, {
        position: "top-right",
        autoClose: 15000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });

      const emulatedSmartAccount = await createSessionSmartAccountClient(
        {
          accountAddress: smartAccountAddress, // Set the account address on behalf of the user
          bundlerUrl,
          biconomyPaymasterApiKey: paymasterApiKey,
          chainId: polygonAmoy.id,
        },
        session
      );

      const tx = {
        to: to,
        data: data,
        value: value,
      };

      // build user op
      let userOpResponse = await emulatedSmartAccount.sendTransaction(tx, {
        paymasterServiceData: {
          mode: PaymasterMode.SPONSORED,
        },
      });
      console.log("userOpHash %o for Session Id %s", userOpResponse, sessionId);

      const { receipt } = await userOpResponse.wait(1);
      console.log(message + " => Success");
      const polygonScanlink = `${polygonAmoy.blockExplorers.default.url}/tx/${receipt.transactionHash}`;
      console.log("Check tx: ", polygonScanlink);
      toast.success(
        <a target="_blank" href={polygonScanlink}>
          Success Click to view transaction
        </a>,
        {
          position: "top-right",
          autoClose: 6000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        }
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err.message, {
        position: "top-right",
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  return (
    <Button
      title="Minft NFT"
      onClickFunc={async () => {
        await sendUserOpWithData(
          configInfo.nft.address,
          encodeFunctionData({
            abi: parseAbi(["function safeMint(address _to)"]),
            functionName: "safeMint",
            args: [address as Hex],
          }),
          "0",
          session.sessionID,
          "Minting NFT"
        );
      }}
    />
  );
};

export default UseABISVM;
