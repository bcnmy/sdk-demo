import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { makeStyles } from "@mui/styles";
import { SessionKeyManagerModule } from "@biconomy/modules";
import Button from "../Button";
import { useAccount } from "wagmi";
import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
import {   configInfo as config, showErrorMessage, showInfoMessage } from "../../utils";
import { defaultAbiCoder } from "ethers/lib/utils";
import { getActionForErrorMessage } from "../../utils/error-utils";
import { DEFAULT_SESSION_KEY_MANAGER_MODULE } from "@biconomy/modules";
import { ERC20_SESSION_VALIDATION_MODULE } from "../../utils/chainConfig";
import { useEthersSigner } from "../../contexts/ethers";

const CreateSession: React.FC = () => {
  const classes = useStyles();
  const { address } = useAccount();
  const signer = useEthersSigner();
  const { smartAccount, scwAddress } = useSmartAccountContext();
  const [loading, setLoading] = useState(false);
  const [isSessionKeyModuleEnabled, setIsSessionKeyModuleEnabled] =
    useState(false);

  useEffect(() => {
    let checkSessionModuleEnabled = async () => {
      if (!scwAddress || !smartAccount || !address) {
        setIsSessionKeyModuleEnabled(false);
        return;
      }
      try {
        let biconomySmartAccount = smartAccount;
        const sessionKeyManagerModuleAddr = DEFAULT_SESSION_KEY_MANAGER_MODULE;
        // Checks if Session Key Manager module is enabled on the smart account.
        // Before using session keys this module must be enabled.
        // If not, createSession transaction will also enable this module along with storing session info on-chain.
        const isEnabled = await biconomySmartAccount.isModuleEnabled(
          sessionKeyManagerModuleAddr
        );
        console.log("isSessionKeyModuleEnabled", isEnabled);
        setIsSessionKeyModuleEnabled(isEnabled);
        return;
      } catch (err: any) {
        console.error(err);
        setLoading(false);
        setIsSessionKeyModuleEnabled(false);
        return;
      }
    };
    checkSessionModuleEnabled();
  }, [isSessionKeyModuleEnabled, scwAddress, smartAccount, address]);

  const createSession = async (enableSessionKeyModule: boolean) => {
    if (!scwAddress || !smartAccount || !address) {
      showErrorMessage("Please connect wallet first");
      return;
    }
    try {
      let biconomySmartAccount = smartAccount;
      const sessionKeyManagerModuleAddr = DEFAULT_SESSION_KEY_MANAGER_MODULE;
      const erc20SessionValidationModuleAddr = ERC20_SESSION_VALIDATION_MODULE;

      // -----> setMerkle tree tx flow
      // create dapp side session key
      const sessionSigner = ethers.Wallet.createRandom();
      const sessionKeyEOA = await sessionSigner.getAddress();
      console.log("sessionKeyEOA", sessionKeyEOA);

      // Optional: JUST FOR DEMO: update local storage with session key
      // If you have session key-pair on the client side you can keep using those without making part of any storage
      window.localStorage.setItem("sessionPKey", sessionSigner.privateKey);

      // Create an instanbce of Session Key Manager module from modules package
      // This module is responsible for below tasks/helpers:
      // a. Maintain session leaf storage in defined storage client (Biconomy by default using browser local storage which works for front-end apps)
      // b. Generate dummy signature for userOp estimations
      // c. Provides helpers to sign userOpHash with session key in the right format and generate proof for particular leaf 
      const sessionManagerModule = await SessionKeyManagerModule.create({
        moduleAddress: sessionKeyManagerModuleAddr,
        smartAccountAddress: scwAddress,
      });

      const tokenContract = new ethers.Contract(
        config.usdc.address,
        config.usdc.abi,
        signer
      );
      let decimals = 18;

      try {
        decimals = await tokenContract.decimals();
      } catch (error) {
        throw new Error("invalid token address supplied");
      }

      // Cretae session key data
      // Session key data is always corrsponding to the Session Validation Module being used
      // It always requires the public address of the session key
      // Rest of the details depends on the actual permissions
      // Here, our ERC20 Session Validation Module verifies ERC20 address, receiver and max amount 
      // 
      const sessionKeyData = defaultAbiCoder.encode(
        ["address", "address", "address", "uint256"],
        [
          sessionKeyEOA,
          config.usdc.address, // erc20 token address
          "0x42138576848E839827585A3539305774D36B9602", // receiver address // You must send to same receiver when making use of the session
          ethers.utils.parseUnits("50".toString(), decimals).toHexString(), // 50 usdc amount
        ]
      );

      // Below helper gives you tx data to be used to make a call from Smart Account to enable session on-chain
      // This transaction needs a user signature and for gas sponsorship or ERC20 paymaster can be used.
      const sessionTxData = await sessionManagerModule.createSessionData([
        {
          validUntil: 0, // 0 value means extremes 
          validAfter: 0, // 0 value means extremes 
          sessionValidationModule: erc20SessionValidationModuleAddr,
          sessionPublicKey: sessionKeyEOA,
          sessionKeyData: sessionKeyData,
        },
        // can optionally enable multiple leaves(sessions) altogether
      ]);
      console.log("sessionTxData", sessionTxData);

      // tx to set session key
      const tx2 = {
        to: sessionKeyManagerModuleAddr, // session manager module address
        data: sessionTxData.data,
      };

      let transactionArray = [];
      if (enableSessionKeyModule) {
        // -----> enableModule session manager module
        const tx1 = await biconomySmartAccount.getEnableModuleData(
          sessionKeyManagerModuleAddr
        );
        transactionArray.push(tx1);
      }
      transactionArray.push(tx2);

      // Building the user operation
      // If you're going to use sponsorship paymaster details can be provided at this step
      let partialUserOp = await biconomySmartAccount.buildUserOp(
        transactionArray,
        {
          skipBundlerGasEstimation: false,
        }
      );

      // This will send user operation to potentially enable session key manager module and set the session
      const userOpResponse = await biconomySmartAccount.sendUserOp(
        partialUserOp
      );

      console.log(`userOp Hash: ${userOpResponse.userOpHash}`);
      const transactionDetails = await userOpResponse.wait();
      console.log("txHash", transactionDetails.receipt.transactionHash);
      showInfoMessage("Session Created Successfully");
    } catch (err: any) {
      console.error(err);
      setLoading(false);
      const errorAction = getActionForErrorMessage(err.message);
      showErrorMessage(
        errorAction || err.message || "Error in sending the transaction"
      );
    }
  };

  return (
    <main className={classes.main}>
      <p style={{ color: "#7E7E7E" }}>
        Use Cases {"->"} Session {"->"} Create Session
      </p>

      <h3 className={classes.subTitle}>Create Session Flow</h3>

      {isSessionKeyModuleEnabled ? (
        <div>
          <p style={{ marginBottom: 20 }}>
            Session Key Manager Module is already enabled ✅. Click on the
            button to create a new session.
          </p>

          <Button
            title="Create Session"
            isLoading={loading}
            onClickFunc={() => {
              createSession(false);
            }}
          />
        </div>
      ) : (
        <div>
          <p style={{ marginBottom: 20 }}>
            This is a single transaction to enable the sesion key manager module and
            make a session active on-chain using ERC20 session validation module.
          </p>

          <Button
            title="Enable Module And Create Session"
            isLoading={loading}
            onClickFunc={() => {
              createSession(true);
            }}
          />
        </div>
      )}
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
