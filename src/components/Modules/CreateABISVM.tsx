import React, { useState } from "react";
import { Provider, ethers } from "ethers";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UseABISVM from "./UseABISVM";
import { useAccount } from "wagmi";
import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
import { BiconomySmartAccountV2, PaymasterMode } from "@biconomy-devx/account";
import {
  createSession,
  createSessionKeyEOA,
  Session,
  Policy,
} from "@biconomy-devx/sessions";

import { pad } from "viem";
import { polygonAmoy } from "viem/chains";
import Button from "../Button";

interface props {
  smartAccount: BiconomySmartAccountV2;
  address: string;
  provider: Provider;
  nftContract: ethers.Contract;
  abiSVMAddress: string;
}

const CreateABISVM: React.FC<props> = () => {
  const nftAddress = "0x1758f42Af7026fBbB559Dc60EcE0De3ef81f665e";
  const [activeSession, setActiveSession] = useState<Session | undefined>();
  const { address } = useAccount();
  const { smartAccount, scwAddress } = useSmartAccountContext();

  const createSessionHandler = async () => {
    const toastMessage = "Creating Sessions for " + address;
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
    if (!address || !smartAccount) {
      alert("Please connect wallet first");
    } else {
      try {
        const { sessionKeyAddress, sessionStorageClient } =
          await createSessionKeyEOA(smartAccount, polygonAmoy);

        const policy: Policy[] = [
          {
            sessionKeyAddress,
            contractAddress: nftAddress,
            functionSelector: "safeMint(address)",
            rules: [
              {
                offset: 0,
                condition: 0,
                referenceValue: scwAddress,
              },
            ],
            interval: {
              validUntil: 0,
              validAfter: 0,
            },
            valueLimit: 0n,
          },
        ];

        const { wait, session } = await createSession(
          smartAccount,
          policy,
          sessionKeyAddress,
          sessionStorageClient,
          {
            paymasterServiceData: {
              mode: PaymasterMode.SPONSORED,
            },
          }
        );
        const {
          receipt: { transactionHash },
          success,
        } = await wait();

        console.log("txHash", transactionHash);
        console.log("Sessions Enabled");
        success && setActiveSession(session);
        toast.success(`Success`, {
          position: "top-right",
          autoClose: 6000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      } catch (err: any) {
        console.error(err);
      }
    }
  };

  return (
    <div>
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

      {!!activeSession ? (
        <UseABISVM
          smartAccountAddress={scwAddress}
          address={address!}
          session={activeSession}
        />
      ) : (
        <Button
          title="Create Session"
          onClickFunc={() => createSessionHandler()}
        />
      )}
    </div>
  );
};

export default CreateABISVM;
