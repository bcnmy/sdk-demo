import React, { useMemo } from "react";
import "react-toastify/dist/ReactToastify.css";
import { Hex, encodeFunctionData, parseAbi } from "viem";
import Button from "../Button";
import { ethers } from "ethers";
import { configInfo } from "../../utils";
import { Session, SessionLocalStorage, createDANSessionKeyManagerModule } from "@biconomy/account";
import { useSmartAccount } from "@biconomy/use-aa";

interface props {
  session: Session;
}

const UseDanSession: React.FC<props> = ({ session }) => {
  const { smartAccountAddress, smartAccountClient } = useSmartAccount();

  const transactions = useMemo(
    () => ({
      to: configInfo.nft.address,
      data: encodeFunctionData({
        abi: parseAbi(["function safeMint(address _to)"]),
        functionName: "safeMint",
        args: [smartAccountAddress as Hex],
      }),
    }),
    [smartAccountAddress]
  );

  const useDanSessionHandler = async () => {
    if (!smartAccountClient || !smartAccountAddress) {
      throw new Error("Smart Account not found");
    }
    if (!session) {
      throw new Error("Session not found");
    }

    const sessionStorageClient = new SessionLocalStorage(smartAccountAddress);

    const sessionsModule = await createDANSessionKeyManagerModule({
      smartAccountAddress,
      sessionStorageClient
    })

    // Review if needed. or already baked in
    smartAccountClient.setActiveValidationModule(sessionsModule as any);
 
    // Send the transactions using session params
    const { wait } = await smartAccountClient.sendTransaction(transactions, {
      params: {
        // take it from the session
      },
    });
    // Wait for the createSessionTx
    const {
      receipt: { transactionHash },
      success,
    } = await wait();

    // Handle Success....
  };

  return <Button title="Minft NFT" onClickFunc={useDanSessionHandler} />;
};

export default UseDanSession;
