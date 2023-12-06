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
import { ERC20_SESSION_VALIDATION_MODULE } from "../../utils/chainConfig";

const ERC20Transfer: React.FC = () => {
  const classes = useStyles();
  const signer = useEthersSigner();
  const { smartAccount, scwAddress } = useSmartAccountContext();
  const [loading, setLoading] = useState(false);

  const erc20Transfer = async () => {
    if (!scwAddress || !smartAccount || !signer) {
      showErrorMessage("Please connect wallet first");
      return;
    }
    try {
      setLoading(true);
      let biconomySmartAccount = smartAccount;
      const sessionKeyManagerModuleAddr = DEFAULT_SESSION_KEY_MANAGER_MODULE;
      const erc20SessionValidationModuleAddr = ERC20_SESSION_VALIDATION_MODULE;

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

      const { data } = await tokenContract.populateTransaction.transfer(
        "0x42138576848E839827585A3539305774D36B9602", // receiver address // Has to be the same receiver for which session permissions are set
        ethers.utils.parseUnits("5".toString(), decimals)
      );

      // generate tx data to erc20 transfer
      // NOTE: It can only be used for single transaction and not part of batch calldata
      // If you want to make use of batch calldata then you need to use the session router module
      const tx1 = {
        to: config.usdc.address, //erc20 token address
        data: data,
        value: "0",
      };

      // build user op
      // with calldata to transfer ERC20 tokens
      let userOp = await biconomySmartAccount.buildUserOp([tx1], {
        skipBundlerGasEstimation: false, // can skip this if paymasterServiceData is being provided for sponsorship mode
        // These are required (as query params in session storage) to be able to find the leaf and generate proof for the dummy signature (which is in turn used for estimating gas values)
        params: {
          sessionSigner: sessionSigner,
          sessionValidationModule: erc20SessionValidationModuleAddr,
        },
      });

      // send user operation
      const userOpResponse = await biconomySmartAccount.sendUserOp(userOp, 
        // below params are required for passing on this information to session key manager module to create padded signature
        {
        sessionSigner: sessionSigner,
        sessionValidationModule: erc20SessionValidationModuleAddr,
        // optionally can also provide simulationType
        simulationType: 'validation_and_execution'
      });

      console.log("userOpHash", userOpResponse);
      const { transactionHash } = await userOpResponse.waitForTxHash();
      console.log("txHash", transactionHash);
      showSuccessMessage(`ERC20 Transfer ${transactionHash}`, transactionHash);
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
        Use Cases {"->"} Gasless {"->"} ERC20 Transfer
      </p>

      <h3 className={classes.subTitle}>ERC20 Transfer via Session Key</h3>

      <p style={{ marginBottom: 20 }}>
        This is an example to transfer ERC20 tokens makin use of enabled session.
      </p>

      <Button
        title="Send Tokens"
        isLoading={loading}
        onClickFunc={erc20Transfer}
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

export default ERC20Transfer;
