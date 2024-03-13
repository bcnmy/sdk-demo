import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { BiconomySmartAccountV2, createSessionKeyManagerModule } from "@biconomy/account"
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {getABISVMSessionKeyData} from "../../utils/index";
import { hexDataSlice, id, parseEther } from "ethers/lib/utils";
import { Hex } from "viem";
import UseABISVM from "./UseABISVM";
import Button from "../Button";
import { useAccount } from "wagmi";
import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
import { ABI_SVM, managerModuleAddr } from "../../utils/constants";

interface props {
  smartAccount: BiconomySmartAccountV2;
  address: string;
  provider: ethers.providers.Provider;
  nftContract: ethers.Contract;
  abiSVMAddress: string;
}

const CreateABISVM: React.FC<props> = () => {

    const [isSessionKeyModuleEnabled, setIsSessionKeyModuleEnabled] = useState <boolean>(false);
    const [isSessionActive, setIsSessionActive] = useState <boolean>(false);
    const [sessionIDs, setSessionIDs] = useState<string[]>([]);

    const { address } = useAccount();
    const { smartAccount, scwAddress } = useSmartAccountContext();
  
    useEffect(() => {
        let checkSessionModuleEnabled = async () => {
          if(!address || !smartAccount) {
            setIsSessionKeyModuleEnabled(false);
            return
          }
          try {
            const isEnabled = await smartAccount.isModuleEnabled(managerModuleAddr)
            console.log("isSessionKeyModuleEnabled", isEnabled);
            setIsSessionKeyModuleEnabled(isEnabled);
            return;
          } catch(err: any) {
            console.error(err)
            setIsSessionKeyModuleEnabled(false);
            return;
          }
        }
        checkSessionModuleEnabled() 
      },[isSessionKeyModuleEnabled, address, smartAccount])

      const createSession = async (enableSessionKeyModule: boolean) => {
        const toastMessage = 'Creating Sessions for ' + address; 
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
          alert("Please connect wallet first")
        }
        try {
          // -----> setMerkle tree tx flow
          // create dapp side session key
          const sessionSigner = ethers.Wallet.createRandom();
          const sessionKeyEOA = await sessionSigner.getAddress();
          console.log("sessionKeyEOA", sessionKeyEOA);
          // BREWARE JUST FOR DEMO: update local storage with session key
          window.localStorage.setItem("sessionPKey", sessionSigner.privateKey);
    
          // generate sessionModule
          const sessionModule = await createSessionKeyManagerModule({
            moduleAddress: managerModuleAddr,
            smartAccountAddress: address as Hex,
          });
    
          /**
           * Create Session Key Datas
           */

          const functionSelector = hexDataSlice(id("safeMint(address)"), 0, 4);
    
          const sessionKeyData = await getABISVMSessionKeyData(sessionKeyEOA, {
            destContract: "0xdd526eba63ef200ed95f0f0fb8993fe3e20a23d0",
            functionSelector: functionSelector,
            valueLimit: parseEther("0"),
            rules: [
              {
                offset: 0, // offset 0 means we are checking first parameter of safeMint (recipient address)
                condition: 0, // 0 = Condition.EQUAL
                referenceValue: ethers.utils.hexZeroPad(address!, 32) // recipient address
              },
            ],
          });
    
          /**
           * Create Data for the Session Enabling Transaction
           * We pass an array of session data objects to the createSessionData method
           */
          const sessionTxData = await sessionModule.createSessionData([
            {
                validUntil: 0,
                validAfter: 0,
                sessionValidationModule: ABI_SVM,
                sessionPublicKey: sessionKeyEOA as Hex,
                sessionKeyData: sessionKeyData as Hex,
            }
        ]);
          //console.log("sessionTxData", sessionTxData);
          setSessionIDs([...sessionTxData.sessionIDInfo]);
    
          // tx to set session key
          const setSessionTrx = {
            to: managerModuleAddr, // session manager module address
            data: sessionTxData.data,
          };
    
          const transactionArray = [];
    
          if (enableSessionKeyModule) {
            // -----> enableModule session manager module
            const enableModuleTrx = await smartAccount!.getEnableModuleData(
              managerModuleAddr
            );
            transactionArray.push(enableModuleTrx);
          }
    
          transactionArray.push(setSessionTrx)
    
          let userOpResponse = await smartAccount!.sendTransaction(transactionArray);
          
          const transactionDetails = await userOpResponse.wait();
          console.log("txHash", transactionDetails.receipt.transactionHash);
          console.log("Sessions Enabled");
          setIsSessionActive(true)
          toast.success(`Success! Sessions created succesfully`, {
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
          console.error(err)
        }
      }

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
        {isSessionKeyModuleEnabled&&!isSessionActive ? (
             <Button
             title="Create Session"
             onClickFunc={() => createSession(false)}
           />
        ) : (<div></div>)}
        {!isSessionKeyModuleEnabled&&!isSessionActive ? (
          <Button
          title="Enable Session Key Module and Create Session"
          onClickFunc={() => createSession(true)}
        />
        ) : (<div></div>)}
      {
        isSessionActive && (
          <UseABISVM
            smartAccount={smartAccount!}
            address={address!}
            abiSVMAddress={ABI_SVM}
            sessionIDs={sessionIDs}
          />
        )
      }
    </div>
    )
    
  }
  
  export default CreateABISVM;