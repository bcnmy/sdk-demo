import React from "react";
import {
  Session,
  createSessionSmartAccountClient,
  Transaction,
  getBatchSessionTxParams,
  PaymasterMode,
} from "@biconomy/account";
import "react-toastify/dist/ReactToastify.css";
import { Hex, encodeFunctionData, parseAbi } from "viem";
import Button from "../Button";
import { configInfo } from "../../utils";
import { polygonAmoy } from "viem/chains";
import { bundlerUrl, paymasterApiKey } from "../../utils/chainConfig";
import { toast } from "react-toastify";

const nftAddress = "0x1758f42Af7026fBbB559Dc60EcE0De3ef81f665e";
const receiver = "0x42138576848E839827585A3539305774D36B9602";
const amount = BigInt(50000000);

interface props {
  smartAccountAddress?: Hex;
  address?: string;
}

const UseBatchSession: React.FC<props> = ({ smartAccountAddress, address }) => {
  const sendUserOpWithData = async () => {
    if (!address || !smartAccountAddress) {
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
        smartAccountAddress,
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

      const txs = [transferTx, nftMintTx];
      const batchSessionParams = await getBatchSessionTxParams(
        txs,
        [0, 1],
        smartAccountAddress,
        // @ts-ignore
        polygonAmoy
      );

      console.log("...batchSessionParams", { ...batchSessionParams });

      // build user op
      const { wait } = await emulatedSmartAccount.sendTransaction(txs, {
        ...batchSessionParams,
        paymasterServiceData: { mode: PaymasterMode.SPONSORED },
      });

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
    <Button
      title="Transfer Token and Mint NFT"
      onClickFunc={sendUserOpWithData}
    />
  );
};

export default UseBatchSession;
