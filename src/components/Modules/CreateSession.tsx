import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { makeStyles } from "@mui/styles";
import { BatchedSessionRouterModule, SessionKeyManagerModule } from "@biconomy-devx/modules";
import Button from "../Button";
import { useWeb3AuthContext } from "../../contexts/SocialLoginContext";
import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
import { showErrorMessage, showInfoMessage } from "../../utils";
import { defaultAbiCoder, hexConcat, hexZeroPad } from "ethers/lib/utils";
import { getActionForErrorMessage } from "../../utils/error-utils";

const CreateSession: React.FC = () => {
  const classes = useStyles();
  const { web3Provider } = useWeb3AuthContext();
  const { smartAccount, scwAddress } = useSmartAccountContext();
  const [loading, setLoading] = useState(false);
  const [isSessionKeyModuleEnabled, setIsSessionKeyModuleEnabled] = useState(false);

  useEffect(() => {
    let checkSessionModuleEnabled = async () => {
      setIsSessionKeyModuleEnabled(await _isSessionKeyModuleEnabled());
    }
    checkSessionModuleEnabled();
  } ,[isSessionKeyModuleEnabled]);

  const createSession = async (enableSessionKeyModule: boolean) => {
    if (!scwAddress || !smartAccount || !web3Provider) return;
    try {
      let biconomySmartAccount = smartAccount;
      const managerModuleAddr = "0x000000456b395c4e107e0302553B90D1eF4a32e9";
      const routerModuleAddr = "0x000008da71757c0e1d83ce56c823e25aa49bc058";
      const erc20ModuleAddr = "0x000000dB3D753A1da5A6074a9F74F39a0A779d33";
      const mockModuleAddr = "0xf36A0FD9EAa51f360Cd0e46caf13c30e86def8c5";

      

      // -----> setMerkle tree tx flow
      // create dapp side session key
      const sessionSigner = ethers.Wallet.createRandom();
      const sessionKeyEOA = await sessionSigner.getAddress();
      console.log("sessionKeyEOA", sessionKeyEOA)
      // BREWARE JUST FOR DEMO: update local storage with session key
      window.localStorage.setItem("sessionPKey", sessionSigner.privateKey);

      // generate sessionModule
      const sessionModule = await SessionKeyManagerModule.create({
        moduleAddress: managerModuleAddr,
        // sessionPubKey: sessionKeyEOA,
        smartAccountAddress: scwAddress,
      });

      const sessionRouterModule = await BatchedSessionRouterModule.create({
        moduleAddress: routerModuleAddr,
        // sessionPubKey: sessionKeyEOA,
        sessionKeyManagerModule: sessionModule,
        smartAccountAddress: scwAddress,
      });


      // cretae session key data
      const sessionKeyData = defaultAbiCoder.encode(
        ["address", "address", "address", "uint256"],
        [
          sessionKeyEOA,
          "0xdA5289fCAAF71d52a80A254da614a192b693e977",
          "0x42138576848E839827585A3539305774D36B9602",
          ethers.utils.parseUnits("50".toString(), 6).toHexString()
        ]
      );

       const sessionKeyData2 = hexZeroPad(sessionKeyEOA, 20);
      
      const sessionTxData = await sessionRouterModule.createSessionData([{
        validUntil: 0,
        validAfter: 0,
        sessionValidationModule: erc20ModuleAddr,
        sessionPublicKey: sessionKeyEOA,
        sessionKeyData: sessionKeyData,
      },
      {
        validUntil: 0,
        validAfter: 0,
        sessionValidationModule: mockModuleAddr,
        sessionPublicKey: sessionKeyEOA,
        sessionKeyData: sessionKeyData2,
      }
    ]);
      console.log("sessionTxData", sessionTxData);

      // tx to set session key
      const tx2 = {
        to: managerModuleAddr, // session manager module address
        data: sessionTxData,
      };
      
      let transactionArray = [];
      if(enableSessionKeyModule) {
        // -----> enableModule session manager module
        const tx1 = await biconomySmartAccount.getEnableModuleData(
          managerModuleAddr
        );
        transactionArray.push(tx1);

        const tx3 = await biconomySmartAccount.getEnableModuleData(
          routerModuleAddr
        );
        transactionArray.push(tx3);
      }
      transactionArray.push(tx2);
      let partialUserOp = await biconomySmartAccount.buildUserOp(
        transactionArray
      );

      const userOpResponse = await biconomySmartAccount.sendUserOp(
        partialUserOp
      );
      console.log(`userOp Hash: ${userOpResponse.userOpHash}`);
      const transactionDetails = await userOpResponse.wait();
      console.log("txHash", transactionDetails.receipt.transactionHash);
      showInfoMessage("Session Created Successfully");
      // update the session key //enableModule
      /*await sessionRouterModule.updateSessionStatus(
        {
          sessionPublicKey: sessionKeyEOA,
          sessionValidationModule: erc20ModuleAddr,
        },
        "ACTIVE"
      );

      await sessionRouterModule.updateSessionStatus(
        {
          sessionPublicKey: sessionKeyEOA,
          sessionValidationModule: mockModuleAddr,
        },
        "ACTIVE"
      );*/
    } catch (err: any) {
      console.error(err);
      setLoading(false);
      const errorAction = getActionForErrorMessage(err.message);
      showErrorMessage(errorAction || err.message || "Error in sending the transaction");
    }
  };

  const _isSessionKeyModuleEnabled = async (): Promise<boolean> => {
    if (!scwAddress || !smartAccount || !web3Provider) return false;
    try {
      let biconomySmartAccount = smartAccount;
      const managerModuleAddr = "0x000000456b395c4e107e0302553B90D1eF4a32e9";
      const isEnabled = await biconomySmartAccount.isModuleEnabled(managerModuleAddr);
      return isEnabled
    } catch (err: any) {
      console.error(err);
      setLoading(false);
      showErrorMessage(err.message || "Error in getting session key module status");
      return false;
    }
  }

  return (
    <main className={classes.main}>
      <p style={{ color: "#7E7E7E" }}>
        Use Cases {"->"} Session {"->"} Create Session
      </p>

      <h3 className={classes.subTitle}>Create Session Flow</h3>

      {isSessionKeyModuleEnabled ?
          <div>
            <p style={{ marginBottom: 20 }}>
              Session Key Manager Module is already enabled. Click on the button to create a new session.
            </p>

            <Button
              title="Create Session"
              isLoading={loading}
              onClickFunc={()=>{createSession(false)}}
            />
          </div>
        : <div>
          <p style={{ marginBottom: 20 }}>
            This is single transaction to enable the sesion manager module and set
            merkle root.
          </p>

          <Button
            title="Enable And Create Session"
            isLoading={loading}
            onClickFunc={()=>{createSession(true)}}
          />
        </div>
      }
    </main>
  );
};

const useStyles = makeStyles(() => ({
  main: {
    padding: "10px 40px",
    color: "#EEEEEE",
  },
  subTitle: {
    color: "#FFB999",
    fontSize: 36,
    margin: 0,
  },
  h3Title: {
    color: "#e6e6e6",
  },
}));

export default CreateSession;
