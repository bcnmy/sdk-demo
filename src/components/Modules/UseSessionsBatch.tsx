import React, { useState } from "react";
import { ethers } from "ethers";
import { makeStyles } from "@mui/styles";
import {
  BatchedSessionRouterModule,
  SessionKeyManagerModule,
} from "@biconomy/modules";
import Button from "../Button";
import { useAccount } from "wagmi";
import { useEthersSigner } from "../../contexts/ethers";
import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
import {
  configInfo as config,
  showSuccessMessage,
  showErrorMessage,
} from "../../utils";
import {
  DEFAULT_BATCHED_SESSION_ROUTER_MODULE,
  DEFAULT_SESSION_KEY_MANAGER_MODULE,
} from "@biconomy/modules";
import { polygonMumbai } from "viem/chains";

const ERC20RouterTransfer: React.FC = () => {
  const classes = useStyles();
  const { address } = useAccount();
  const signer = useEthersSigner();
  const { smartAccount, scwAddress } = useSmartAccountContext();
  const [loading, setLoading] = useState(false);

  const erc20Transfer = async () => {
    if (!scwAddress || !smartAccount || !address) {
      showErrorMessage("Please connect wallet first");
      return;
    }
    try {
      setLoading(true);
      let biconomySmartAccount = smartAccount;
      const managerModuleAddr = DEFAULT_SESSION_KEY_MANAGER_MODULE;
      const erc20ModuleAddr = "0x000000D50C68705bd6897B2d17c7de32FB519fDA";
      const routerModuleAddr = DEFAULT_BATCHED_SESSION_ROUTER_MODULE;
      const mockSessionModuleAddr =
        "0x7Ba4a7338D7A90dfA465cF975Cc6691812C3772E";

      // get session key from local storage
      const sessionKeyPrivKey = window.localStorage.getItem("sessionPKey");

      if (!sessionKeyPrivKey) {
        showErrorMessage("Session key not found");
        return;
      }

      const provider = new ethers.providers.JsonRpcProvider(polygonMumbai.rpcUrls.public.http[0]);
      const sessionSigner = new ethers.Wallet(sessionKeyPrivKey, provider);
      console.log("sessionSigner", sessionSigner);

      // generate sessionModule
      const sessionModule = await SessionKeyManagerModule.create({
        moduleAddress: managerModuleAddr,
        smartAccountAddress: scwAddress,
      });
      const sessionRouterModule = await BatchedSessionRouterModule.create({
        moduleAddress: routerModuleAddr,
        sessionKeyManagerModule: sessionModule,
        smartAccountAddress: scwAddress,
      });

      // set active module to sessionRouterModule
      biconomySmartAccount =
        biconomySmartAccount.setActiveValidationModule(sessionRouterModule);

      // er20 transfer data generation
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
      const amountGwei = ethers.utils.parseUnits("0.1".toString(), decimals); // MAKE SURE SCW HAS ENOUGH USDC, otherwise user op will fail
      const data = (
        await tokenContract.populateTransaction.transfer(
          "0x42138576848E839827585A3539305774D36B9602", // receiver address
          amountGwei
        )
      ).data;
      const data2 = (
        await tokenContract.populateTransaction.transfer(
          "0x5a86A87b3ea8080Ff0B99820159755a4422050e6", // receiver address 2
          amountGwei
        )
      ).data;
      // generate tx data to erc20 transfer
      const tx1 = {
        to: "0xdA5289fCAAF71d52a80A254da614a192b693e977", //erc20 token address
        data: data,
        value: "0",
      };
      const tx2 = {
        to: "0xdA5289fCAAF71d52a80A254da614a192b693e977", //erc20 token address
        data: data2,
        value: "0",
      };

      let userOpResponse = await biconomySmartAccount.sendTransaction([tx1, tx2], {
        params: {
          batchSessionParams: [
            {
              sessionSigner: sessionSigner,
              sessionValidationModule: erc20ModuleAddr,
            },
            {
              sessionSigner: sessionSigner,
              sessionValidationModule: mockSessionModuleAddr,
            },
          ],
        },
      });

      console.log("userOpHash", userOpResponse);
      const { transactionHash } = await userOpResponse.waitForTxHash();
      const { success } = await userOpResponse.wait();
      if(success === "false") {
        setLoading(false);
        console.log("txHash", transactionHash);
        showErrorMessage("User op execution failed");
      } else {
        console.log("txHash", transactionHash);
        showSuccessMessage(`ERC20 Transfer ${transactionHash}`, transactionHash);
        setLoading(false);
      }
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

      <h3 className={classes.subTitle}>ERC20 Transfer via Batched Session Key Module</h3>

      <p style={{ marginBottom: 20 }}>
        This is an example gasless transaction to transfer ERC20 tokens using the Batched Session Key Router Module.
      </p>

      This transaction will transfer 0.1 USDC two times, make sure your SCW has enough USDC.

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

export default ERC20RouterTransfer;

