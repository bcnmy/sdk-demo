import React from "react";
import { ethers } from "ethers";
import { BiconomySmartAccountV2, createSessionKeyManagerModule } from "@biconomy/account"
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Hex, encodeFunctionData, parseAbi } from "viem";
import Button from "../Button";
import { configInfo } from "../../utils";
import { polygonMumbai } from "viem/chains";
import { managerModuleAddr } from "../../utils/constants";

interface props {
  smartAccount: BiconomySmartAccountV2;
  address: string;
  abiSVMAddress: string;
  sessionIDs: string[];
}

const UseABISVM: React.FC<props> = ({ 
  smartAccount, 
  address,
  abiSVMAddress,
  sessionIDs,
}) => {

  const sendUserOpWithData = async (
    to: string,
    data: string,
    value: string,
    sessionId: string,
    message?: string
  ) => {
    if (!address || !smartAccount || !address) {
      alert('Connect wallet first');
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
      
      // get session key from local storage
      const sessionKeyPrivKey = window.localStorage.getItem("sessionPKey");
      //console.log("sessionKeyPrivKey", sessionKeyPrivKey);
      if (!sessionKeyPrivKey) {
        alert("Session key not found please create session");
        return;
      }

      // USE SESION KEY AS SIGNER
      const provider = new ethers.providers.JsonRpcProvider(polygonMumbai.rpcUrls.default.http[0]);
      const sessionSigner = new ethers.Wallet(sessionKeyPrivKey, provider);

      // generate sessionModule
      const sessionModule = await createSessionKeyManagerModule({
        moduleAddress: managerModuleAddr,
        smartAccountAddress: address,
      });
      
      // set active module to sessionModule
      smartAccount = smartAccount.setActiveValidationModule(sessionModule);
      
      const tx = {
        to: to, 
        data: data,
        value: value,
      };

      //console.log("tx", tx);

      // build user op
      let userOpResponse = await smartAccount.sendTransaction([tx], {
        params: {
          sessionSigner: sessionSigner,
          sessionValidationModule: abiSVMAddress as Hex,
        },
      });

      console.log("userOpHash %o for Session Id %s", userOpResponse, sessionId);

      const { receipt } = await userOpResponse.wait(1);
      console.log(message + " => Success");
      //console.log("txHash", receipt.transactionHash);
      const polygonScanlink = `https://mumbai.polygonscan.com/tx/${receipt.transactionHash}`
      console.log("Check tx: ", polygonScanlink);
      toast.success(<a target="_blank" href={polygonScanlink}>Success Click to view transaction</a>, {
        position: "top-right",
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        });
    } catch(err: any) {
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
  }

    return(
      <div>
          {
            <div>
               <Button
                  title="Minft NFT"
                  onClickFunc={async() => {
                    await sendUserOpWithData(
                      configInfo.nft.address, 
                      encodeFunctionData({
                        abi: parseAbi(["function safeMint(address _to)"]),
                        functionName: "safeMint",
                        args: [address as Hex],
                    }), 
                    "0", 
                    sessionIDs[0], 
                    "Minting NFT");
                  }}
                />
            </div>
          }
        </div>
    )
  }
  
  export default UseABISVM;
