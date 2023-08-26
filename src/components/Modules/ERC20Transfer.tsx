import React, { useState } from "react";
import { ethers } from "ethers";
import { makeStyles } from "@mui/styles";
import { SessionKeyManagerModule } from "@biconomy-devx/modules";

import Button from "../Button";
import { useWeb3AuthContext } from "../../contexts/SocialLoginContext";
import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
import {
  configInfo as config,
  showSuccessMessage,
  showErrorMessage,
} from "../../utils";

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
      const erc20ModuleAddr = "0x000000dB3D753A1da5A6074a9F74F39a0A779d33";

      // get session key from local storage
      const sessionKeyEOA = window.localStorage.getItem("sessionPKey");

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

      const tokenContract = new ethers.Contract(config.usdc.address, config.usdc.abi, web3Provider)
      let decimals = 18

      try {
        decimals = await tokenContract.decimals()
      } catch (error) {
        throw new Error('invalid token address supplied')
      }
      const amountGwei = ethers.utils.parseUnits("5".toString(), decimals)
      const data = (await tokenContract.populateTransaction.transfer("0x42138576848E839827585A3539305774D36B9602", amountGwei)).data

      // generate tx data to erc20 transfer
      const tx1 = {
        to: "0xdA5289fCAAF71d52a80A254da614a192b693e977", //erc20 token address
        data: data, 
        value: "0"
      };

      // build user op
      let userOp = await biconomySmartAccount.buildUserOp([tx1], {
        callGasLimit: 2000000,
        verificationGasLimit: 2000000,
      },
      true);

      // send user op
      const userOpResponse = await biconomySmartAccount.sendUserOp(userOp, {
        sessionSigner: sessionSigner,
        sessionValidationModule: erc20ModuleAddr,
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
