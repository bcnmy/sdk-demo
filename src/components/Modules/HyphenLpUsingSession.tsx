import React, { useState } from "react";
import { ethers } from "ethers";
import { makeStyles } from "@mui/styles";
import { SessionKeyManagerModule } from "@biconomy/modules";

import Button from "../Button";
import { useEthersSigner } from "../../contexts/ethers";
import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
import {
  configInfo as config,
  showSuccessMessage,
  showErrorMessage,
} from "../../utils";
import { DEFAULT_SESSION_KEY_MANAGER_MODULE } from "@biconomy/modules";
import { CONTRACT_CALL_SESSION_VALIDATION_MODULE } from "../../utils/chainConfig";

const HyphenLpUsingSession: React.FC = () => {
  const classes = useStyles();
  const signer = useEthersSigner();
  const { smartAccount, scwAddress } = useSmartAccountContext();
  const [loading, setLoading] = useState(false);

  const hyphenLpUsingSession = async () => {
    if (!scwAddress || !smartAccount || !signer) {
      showErrorMessage("Please connect wallet first");
      return;
    }
    try {
      setLoading(true);
      let biconomySmartAccount = smartAccount;
      const sessionKeyManagerModuleAddr = DEFAULT_SESSION_KEY_MANAGER_MODULE;
      const ccSessionValidationModuleAddr =
        CONTRACT_CALL_SESSION_VALIDATION_MODULE;

      // get session key from local storage
      const sessionKeyPrivKey = window.localStorage.getItem("sessionPKey");

      if (!sessionKeyPrivKey) {
        showErrorMessage("Session key not found");
        return;
      }
      const sessionSigner = new ethers.Wallet(sessionKeyPrivKey);
      console.log("sessionSigner", sessionSigner);

      // generate sessionManagerModule
      const sessionManagerModule = await SessionKeyManagerModule.create({
        moduleAddress: sessionKeyManagerModuleAddr,
        smartAccountAddress: scwAddress,
      });

      // set active module to sessionManagerModule
      // This time we will make use of enabled session hence transaction needs to via go through session manager module
      // Hence it is set as runtime active module
      biconomySmartAccount =
        biconomySmartAccount.setActiveValidationModule(sessionManagerModule);

      const hyphenContract = new ethers.Contract(
        config.hyphenLP.address,
        config.hyphenLP.abi,
        signer
      );

      const addLiquidityData = hyphenContract.interface.encodeFunctionData(
        "addTokenLiquidity",
        [config.usdc.address, ethers.BigNumber.from("1000000")]
      ); // 1 USDC (mumbai USDC has 6 decimals)
      const tx1 = {
        to: config.hyphenLP.address,
        data: addLiquidityData,
        value: "0",
      };

      // build user op
      // with calldata to provide LP
      let userOp = await biconomySmartAccount.buildUserOp([tx1], {
        skipBundlerGasEstimation: false, // can skip this if paymasterServiceData is being provided for sponsorship mode
        // These are required (as query params in session storage) to be able to find the leaf and generate proof for the dummy signature (which is in turn used for estimating gas values)
        params: {
          sessionSigner: sessionSigner,
          sessionValidationModule: ccSessionValidationModuleAddr,
        },
      });

      // send user operation
      const userOpResponse = await biconomySmartAccount.sendUserOp(
        userOp,
        // below params are required for passing on this information to session key manager module to create padded signature
        {
          sessionSigner: sessionSigner,
          sessionValidationModule: ccSessionValidationModuleAddr,
          // optionally can also provide simulationType
          simulationType: "validation_and_execution",
        }
      );

      console.log("userOpHash", userOpResponse);
      const { transactionHash } = await userOpResponse.waitForTxHash();
      console.log("txHash", transactionHash);
      showSuccessMessage(`LP Deposit ${transactionHash}`, transactionHash);
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setLoading(false);
      showErrorMessage(err.message || "Error in sending the transaction");
    }
  };

  return (
    <main className={classes.main}>
      <p style={{ color: "#7E7E7E" }}>
        Use Cases {"->"} Gasless {"->"} Deposit into Hyphen Pool using session
        key
      </p>

      <h3 className={classes.subTitle}>
        Deposit into Hyphen Pool via Session Key
      </h3>

      <p style={{ marginBottom: 20 }}>
        This is an example to Deposit into Hyphen Pool making use of enabled
        session. Requires prior approval from smart account
      </p>

      <Button
        title="Send Tokens"
        isLoading={loading}
        onClickFunc={hyphenLpUsingSession}
      />
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

export default HyphenLpUsingSession;
