import React from "react";
import { Transaction, PaymasterMode } from "@biconomy-devx/account";
import "react-toastify/dist/ReactToastify.css";
import { Hex, encodeFunctionData, parseAbi } from "viem";
import Button from "../Button";
import { configInfo } from "../../utils";
import { polygonAmoy } from "viem/chains";
import { bundlerUrl, paymasterApiKey } from "../../utils/chainConfig";
import { toast } from "react-toastify";
import {
  Session,
  createSessionSmartAccountClient,
  getMultiSessionTxParams,
} from "@biconomy-devx/sessions";

const nftAddress = "0x1758f42Af7026fBbB559Dc60EcE0De3ef81f665e";
const receiver = "0x42138576848E839827585A3539305774D36B9602";
const amount = BigInt(50000000);

interface props {
  smartAccountAddress?: Hex;
  address?: string;
  session?: Session;
}

const UseMultiSession: React.FC<props> = ({
  smartAccountAddress,
  address,
  session,
}) => {
  console.log({ session });
  const sendUserOpWithData = async () => {
    if (!address || !smartAccountAddress || !session) {
      alert("Connect wallet first");
      return;
    }

    try {
      toast.info("Firing Tx", {
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
        session,
        true // if batching
      );

      const transferTx: Transaction = {
        to: configInfo.usdt.address,
        data: encodeFunctionData({
          abi: parseAbi(["function transfer(address _to, uint256 _value)"]),
          functionName: "transfer",
          args: [receiver, amount],
        }),
      };
      const nftMintTx: Transaction = {
        to: nftAddress,
        data: encodeFunctionData({
          abi: parseAbi(["function safeMint(address _to)"]),
          functionName: "safeMint",
          args: [smartAccountAddress],
        }),
      };

      const batchSessionParams = await getMultiSessionTxParams(
        ["ERC20", "ABI"],
        [transferTx, nftMintTx],
        session,
        polygonAmoy
      );

      console.log("...batchSessionParams", { ...batchSessionParams });

      // build user op
      const { wait } = await emulatedSmartAccount.sendTransaction(
        [transferTx, nftMintTx],
        {
          ...batchSessionParams,
          paymasterServiceData: { mode: PaymasterMode.SPONSORED },
        }
      );

      const { receipt } = await wait();
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
    !!session && (
      <Button
        title="Transfer Token and Mint NFT"
        onClickFunc={sendUserOpWithData}
      />
    )
  );
};

export default UseMultiSession;
