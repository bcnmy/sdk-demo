import React, { useState } from "react";
import { ethers } from "ethers";
import { makeStyles } from "@mui/styles";
import { SessionKeyManagerModule } from "@biconomy-devx/modules";

import Button from "../Button";
import { useWeb3AuthContext } from "../../contexts/SocialLoginContext";
import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
import { showErrorMessage, showSuccessMessage } from "../../utils";

const ERC20Transfer: React.FC = () => {
  const classes = useStyles();
  const { web3Provider } = useWeb3AuthContext();
  const { smartAccount, scwAddress } = useSmartAccountContext();
  const [loading, setLoading] = useState(false);

  const erc20Transfer = async () => {
    if (!scwAddress || !smartAccount || !web3Provider) return;
    try {
      setLoading(true);
      let biconomySmartAccount = smartAccount;
      const managerModuleAddr = "0x000000456b395c4e107e0302553B90D1eF4a32e9";

      // get session key from local storage
      const sessionKeyEOA = await window.localStorage.getItem("sessionPKey");
      console.log("sessionKeyEOA", sessionKeyEOA);
      if (!sessionKeyEOA) {
        showErrorMessage("Session key not found");
        return;
      }
      const sessionSigner = new ethers.Wallet(sessionKeyEOA);
      console.log("sessionSigner", sessionSigner);

      // generate sessionModule
      const sessionModule = await SessionKeyManagerModule.create({
        moduleAddress: managerModuleAddr,
        sessionPubKey: sessionKeyEOA,
        smartAccountAddress: scwAddress,
      });

      // set active module to sessionModule
      biconomySmartAccount =
        biconomySmartAccount.setActiveValidationModule(sessionModule);

      // generate tx data to erc20 transfer
      const tx1 = {
        to: "0x43Eb7ebe789BC8a749Be41089a963D7e68759a6A", //erc20 token address
        data: "0x", // todo uodate
      };

      // build user op
      let userOp = await biconomySmartAccount.buildUserOp([tx1]);

      // send user op
      const userOpResponse = await biconomySmartAccount.sendUserOp(userOp, {
        sessionSigner: sessionSigner,
        sessionValidationModule: managerModuleAddr,
      });

      console.log("userOpHash", userOpResponse);
      const { receipt } = await userOpResponse.wait(1);
      console.log("txHash", receipt.transactionHash);
      showSuccessMessage(
        `Minted Nft ${receipt.transactionHash}`,
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
