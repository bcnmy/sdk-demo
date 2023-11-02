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
import { DEFAULT_SESSION_KEY_MANAGER_MODULE  } from "@biconomy/modules";

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
      const managerModuleAddr = DEFAULT_SESSION_KEY_MANAGER_MODULE;
      const erc20ModuleAddr = "0x000000D50C68705bd6897B2d17c7de32FB519fDA";

      // get session key from local storage
      const sessionKeyPrivKey = window.localStorage.getItem("sessionPKey");

      console.log("sessionKeyPrivKey", sessionKeyPrivKey);
      if (!sessionKeyPrivKey) {
        showErrorMessage("Session key not found");
        return;
      }
      const sessionSigner = new ethers.Wallet(sessionKeyPrivKey);
      console.log("sessionSigner", sessionSigner);

      // generate sessionModule
      const sessionModule = await SessionKeyManagerModule.create({
        moduleAddress: managerModuleAddr,
        smartAccountAddress: scwAddress,
      });

      // set active module to sessionModule
      biconomySmartAccount =
        biconomySmartAccount.setActiveValidationModule(sessionModule);

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
        "0x42138576848E839827585A3539305774D36B9602", // receiver address
        ethers.utils.parseUnits("5".toString(), decimals)
      );

      // TODO // get these from config
      // generate tx data to erc20 transfer
      const tx1 = {
        to: "0xdA5289fCAAF71d52a80A254da614a192b693e977", //erc20 token address
        data: data,
        value: "0",
      };

      // build user op
      let userOp = await biconomySmartAccount.buildUserOp([tx1], {
        overrides: {
          // signature: "0x0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000456b395c4e107e0302553b90d1ef4a32e9000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000db3d753a1da5a6074a9f74f39a0a779d3300000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000001800000000000000000000000000000000000000000000000000000000000000080000000000000000000000000bfe121a6dcf92c49f6c2ebd4f306ba0ba0ab6f1c000000000000000000000000da5289fcaaf71d52a80a254da614a192b693e97700000000000000000000000042138576848e839827585a3539305774d36b96020000000000000000000000000000000000000000000000000000000002faf08000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000041feefc797ef9e9d8a6a41266a85ddf5f85c8f2a3d2654b10b415d348b150dabe82d34002240162ed7f6b7ffbc40162b10e62c3e35175975e43659654697caebfe1c00000000000000000000000000000000000000000000000000000000000000"
          // callGasLimit: 2000000, // only if undeployed account
          // verificationGasLimit: 700000
        },
        skipBundlerGasEstimation: false,
        params: {
          sessionSigner: sessionSigner,
          sessionValidationModule: erc20ModuleAddr,
        },
      });

      // send user op
      const userOpResponse = await biconomySmartAccount.sendUserOp(userOp, {
        sessionSigner: sessionSigner,
        sessionValidationModule: erc20ModuleAddr,
      });

      console.log("userOpHash", userOpResponse);
      const { receipt } = await userOpResponse.wait(1);
      console.log("txHash", receipt.transactionHash);
      showSuccessMessage(
        `ERC20 Transfer ${receipt.transactionHash}`,
        receipt.transactionHash
      );
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
        This is an example gasless transaction to transfer ERC20 tokens.
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