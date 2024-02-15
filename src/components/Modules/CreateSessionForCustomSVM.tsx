import React, { useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import { useAccount } from "wagmi";
import {
  Hex,
  encodeAbiParameters,
  encodeFunctionData,
  getFunctionSelector,
  parseEther,
  slice,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { createSessionKeyManagerModule, DEFAULT_SESSION_KEY_MANAGER_MODULE } from "@biconomy-devx/account";
import Button from "../Button";
import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
import { CONTRACT_CALL_SESSION_VALIDATION_MODULE } from "../../utils/chainConfig";
import { getActionForErrorMessage } from "../../utils/error-utils";
import {
  configInfo as config,
  showErrorMessage,
  showSuccessMessage,
} from "../../utils";

const CreateCustomSession: React.FC = () => {
  const classes = useStyles();
  const { address } = useAccount();
  const { scwAddress, smartAccount } = useSmartAccountContext();
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
      const ccSessionValidationModuleAddr =
        CONTRACT_CALL_SESSION_VALIDATION_MODULE;

      // -----> setMerkle tree tx flow
      // create dapp side session key
      const sessionPKey = generatePrivateKey();
      const sessionSigner = privateKeyToAccount(sessionPKey);
      const sessionKeyEOA = sessionSigner.address;
      console.log("sessionKeyEOA", sessionKeyEOA);

      // Optional: JUST FOR DEMO: update local storage with session key
      // If you have session key-pair on the client side you can keep using those without making part of any storage
      window.localStorage.setItem("sessionPKey", sessionPKey);

      console.log("here it works ");

      // Create an instance of Session Key Manager module from modules package
      // This module is responsible for below tasks/helpers:
      // a. Maintain session leaf storage in defined storage client (Biconomy by default using browser local storage which works for front-end apps)
      // b. Generate dummy signature for userOp estimations
      // c. Provides helpers to sign userOpHash with session key in the right format and generate proof for particular leaf
      const sessionManagerModule = await createSessionKeyManagerModule({
        moduleAddress: sessionKeyManagerModuleAddr,
        smartAccountAddress: scwAddress,
      });

      console.log("ever here? ");

      // Cretae session key data
      // Session key data is always corrsponding to the Session Validation Module being used
      // It always requires the public address of the session key
      // Rest of the details depends on the actual permissions

      const permission = [
        config.hyphenLP.address,
        slice(getFunctionSelector("addTokenLiquidity(address,uint256)"), 0, 4),
      ];

      const sessionKeyData = encodeAbiParameters(
        [
          { type: "address" },
          {
            type: "tuple",
            components: [{ type: "address" }, { type: "bytes4" }],
          },
        ],
        [sessionKeyEOA, [permission[0] as Hex, permission[1] as Hex]]
      );

      // Below helper gives you tx data to be used to make a call from Smart Account to enable session on-chain
      // This transaction needs a user signature and for gas sponsorship or ERC20 paymaster can be used.
      const sessionTxData = await sessionManagerModule.createSessionData([
        {
          validUntil: 0, // 0 value means extremes
          validAfter: 0, // 0 value means extremes
          sessionValidationModule: ccSessionValidationModuleAddr,
          sessionPublicKey: sessionKeyEOA,
          sessionKeyData: sessionKeyData,
        },
        // can optionally enable multiple leaves(sessions) altogether
      ]);
      console.log("sessionTxData", sessionTxData);

      // tx to set session key
      const tx2 = {
        to: sessionKeyManagerModuleAddr as Hex, // session manager module address
        value: BigInt(0),
        data: sessionTxData.data as Hex,
      };

      let transactionArray = [];
      if (enableSessionKeyModule) {
        // -----> enableModule session manager module
        const tx1 = await biconomySmartAccount.getEnableModuleData(
          sessionKeyManagerModuleAddr
        );
        transactionArray.push({
          to: tx1.to as Hex,
          value: BigInt(0),
          data: tx1.data as Hex,
        });
      }
      transactionArray.push(tx2);

      const approveCallData = encodeFunctionData({
        abi: config.usdc.abi,
        functionName: "approve",
        args: [config.hyphenLP.address, parseEther("100", "gwei")],
      });
      const tx3 = {
        to: config.usdc.address as Hex,
        value: BigInt(0),
        data: approveCallData,
      };
      transactionArray.push(tx3);

      // Building the user operation
      // If you're going to use sponsorship paymaster details can be provided at this step
      let userOpResponse = await smartAccount.sendTransaction(transactionArray);
      console.log("userOpHash", userOpResponse);
      const { transactionHash } = await userOpResponse.waitForTxHash();
      console.log("txHash", transactionHash);
      showSuccessMessage("Session Created Successfully", transactionHash);
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
            This is a single transaction to enable the sesion key manager module
            and make a session active on-chain using Contract call (ABI) session
            validation module.
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

export default CreateCustomSession;
