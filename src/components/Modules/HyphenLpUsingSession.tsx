import React, { useState } from "react";
import { ethers } from "ethers";
import { makeStyles } from "@mui/styles";

import Button from "../Button";
import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
import {
  configInfo as config,
  showSuccessMessage,
  showErrorMessage,
} from "../../utils";
import { createSessionKeyManagerModule } from "@biconomy/account";
import { CONTRACT_CALL_SESSION_VALIDATION_MODULE } from "../../utils/chainConfig";
import { EthersSigner } from "@biconomy/account";
import { useAccount } from "wagmi";
import { managerModuleAddr } from "../../utils/constants";
import { parseUnits } from "viem";

const HyphenLpUsingSession: React.FC = () => {
  const classes = useStyles();
  const { address } = useAccount();
  const { smartAccount, scwAddress } = useSmartAccountContext();
  const [loading, setLoading] = useState(false);

  const hyphenLpUsingSession = async () => {
    if (!scwAddress || !smartAccount || !address) {
      showErrorMessage("Please connect wallet first");
      return;
    }
    try {
      setLoading(true);
      let biconomySmartAccount = smartAccount;
      const sessionKeyManagerModuleAddr = managerModuleAddr;
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

      const newSigner = new EthersSigner(sessionSigner, 'ethers')

      // generate sessionManagerModule
      const sessionManagerModule = await createSessionKeyManagerModule({
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
        sessionSigner
      );

      const addLiquidityData = hyphenContract.interface.encodeFunctionData(
        "addTokenLiquidity",
        [config.usdc.address, parseUnits("0.01", 6)]
      ); // 1 USDC (mumbai USDC has 6 decimals)
      const tx1 = {
        to: config.hyphenLP.address,
        data: addLiquidityData,
        value: 0,
      };

      // build user op
      // with calldata to provide LP
      let userOpResponse = await biconomySmartAccount.sendTransaction(tx1, {
        params: {
          sessionSigner: newSigner,
          sessionValidationModule: ccSessionValidationModuleAddr,
        },
        simulationType: "validation_and_execution",
      });

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
