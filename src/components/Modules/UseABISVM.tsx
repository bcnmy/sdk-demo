import React from "react";
import { PaymasterMode } from "@biconomy-devx/account";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Hex, encodeFunctionData, parseAbi } from "viem";
import Button from "../Button";
import { configInfo } from "../../utils";
import { polygonAmoy } from "viem/chains";
import { bundlerUrl, paymasterApiKey } from "../../utils/chainConfig";
import {
  Session,
  createSessionSmartAccountClient,
} from "@biconomy-devx/sessions";

interface props {
  smartAccountAddress: Hex;
  address: string;
  session: Session;
}

const UseABISVM: React.FC<props> = ({
  smartAccountAddress,
  address,
  session,
}) => {
  const sendUserOpWithData = async () => {
    if (!address || !smartAccountAddress || !address) {
      alert("Connect wallet first");
      return;
    }

    try {
      toast.info("Firing tx", {
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
        to: configInfo.nft.address,
        data: encodeFunctionData({
          abi: parseAbi(["function safeMint(address _to)"]),
          functionName: "safeMint",
          args: [smartAccountAddress as Hex],
        }),
      };

      // build user op
      let userOpResponse = await emulatedSmartAccount.sendTransaction(tx, {
        paymasterServiceData: {
          mode: PaymasterMode.SPONSORED,
        },
      });
      console.log(
        "userOpHash %o for Session Id %s",
        userOpResponse,
        session.sessionID
      );

      const { receipt, success } = await userOpResponse.wait(1);

      const scanLink = `${polygonAmoy.blockExplorers.default.url}/tx/${receipt.transactionHash}`;
      success &&
        toast.success(
          <a target="_blank" href={scanLink}>
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
        await sendUserOpWithData();
      }}
    />
  );
};

export default UseABISVM;
