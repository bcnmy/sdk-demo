import React, { useState } from "react";
import { ethers } from "ethers";
import { makeStyles } from "@mui/styles";
import { BatchedSessionRouterModule, SessionKeyManagerModule } from "@biconomy-devx/modules";

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
      const managerModuleAddr = "0x6E49e404BD70bcc4756F1057d2E2e6000cD38e1e";
      const erc20ModuleAddr = "0x3A25b00638fF5bDfD4f300beF39d236041C073c0";
      const mockModuleAddr = "0x3cc90ADcBB94069c40630D409fBe5c64b2eC336B";
      const routerModuleAddr = "0x58464D89f5763FAea0eEc57AE6E28C9CdB03b41B";

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
        // sessionPubKey: sessionKeyEOA,
        smartAccountAddress: scwAddress,
      });

      const sessionRouterModule = await BatchedSessionRouterModule.create({
        moduleAddress: routerModuleAddr,
        // sessionPubKey: sessionKeyEOA,
        sessionKeyManagerModule: sessionModule,
        smartAccountAddress: scwAddress,
      });

      // set active module to sessionModule
      biconomySmartAccount =
        biconomySmartAccount.setActiveValidationModule(sessionRouterModule);

      const tokenContract = new ethers.Contract(config.usdc.address, config.usdc.abi, web3Provider)
      let decimals = 18

      try {
        decimals = await tokenContract.decimals()
      } catch (error) {
        throw new Error('invalid token address supplied')
      }
      const amountGwei = ethers.utils.parseUnits("5".toString(), decimals)
      const data = (await tokenContract.populateTransaction.transfer("0x42138576848E839827585A3539305774D36B9602", amountGwei)).data
      const data2 = (await tokenContract.populateTransaction.transfer("0x5a86A87b3ea8080Ff0B99820159755a4422050e6", amountGwei)).data

      // generate tx data to erc20 transfer
      const tx1 = {
        to: "0xdA5289fCAAF71d52a80A254da614a192b693e977", //erc20 token address
        data: data, 
        value: "0"
      };

      const tx2 = {
        to: "0xdA5289fCAAF71d52a80A254da614a192b693e977", //erc20 token address
        data: data2, 
        value: "0"
      };



    
      // build user op
      let userOp = await biconomySmartAccount.buildUserOp([tx1, tx1] ,{
        overrides: {
        // signature: "0x0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000456b395c4e107e0302553b90d1ef4a32e9000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000db3d753a1da5a6074a9f74f39a0a779d3300000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000001800000000000000000000000000000000000000000000000000000000000000080000000000000000000000000bfe121a6dcf92c49f6c2ebd4f306ba0ba0ab6f1c000000000000000000000000da5289fcaaf71d52a80a254da614a192b693e97700000000000000000000000042138576848e839827585a3539305774d36b96020000000000000000000000000000000000000000000000000000000002faf08000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000041feefc797ef9e9d8a6a41266a85ddf5f85c8f2a3d2654b10b415d348b150dabe82d34002240162ed7f6b7ffbc40162b10e62c3e35175975e43659654697caebfe1c00000000000000000000000000000000000000000000000000000000000000"
        callGasLimit: 400000, // only if undeployed account
        verificationGasLimit: 900000
      },
      skipBundlerGasEstimation: true,
      params: {
        batchSessionParams: [{
        sessionSigner: sessionSigner,
        // sessionID: "7dae106e0e",
        sessionValidationModule: erc20ModuleAddr,
      },
      {
      sessionSigner: sessionSigner,
      // sessionID: "9900285f4c",
      sessionValidationModule: mockModuleAddr,
    }]}});

      console.log("userOp sig", userOp.signature);

      // send user op
      const userOpResponse = await biconomySmartAccount.sendUserOp(userOp, {
        batchSessionParams: [{
        sessionSigner: sessionSigner,
        // sessionID: "7dae106e0e",
        sessionValidationModule: erc20ModuleAddr,
      },
      {
      sessionSigner: sessionSigner,
      // sessionID: "9900285f4c",
      sessionValidationModule: mockModuleAddr,
    }]});

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
