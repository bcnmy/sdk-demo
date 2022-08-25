import React, { Dispatch, SetStateAction, useState } from "react";
import { ethers } from "ethers";
import { makeStyles } from "@material-ui/core/styles";
import { LocalRelayer } from "@biconomy-sdk/relayer";
import Button from "../Button";
import { useWeb3Context } from "../../contexts/Web3Context";
import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
import {
  getEOAWallet,
  configEIP2771 as config,
  showErrorMessage,
  showSuccessMessage,
} from "../../utils";

type OnboardingProps = {
  setValue: Dispatch<SetStateAction<number>>;
};

const Onboarding: React.FC<OnboardingProps> = ({ setValue }) => {
  const classes = useStyles();
  const { provider } = useWeb3Context();
  const {
    state,
    wallet: smartAccount,
    getSmartAccount,
  } = useSmartAccountContext();

  const [deployLoading1, setDeployLoading1] = useState(false);
  const [deployLoading2, setDeployLoading2] = useState(false);

  const deploySmartAccount1 = async () => {
    try {
      if (!smartAccount || !state) {
        showErrorMessage("Init Smart Account First");
        return;
      }
      setDeployLoading1(true);
      // you can create instance of local relayer with current signer or any other private key signer
      const relayer = new LocalRelayer(
        getEOAWallet(process.env.REACT_APP_PKEY || "", null)
      );
      // console.log(relayer);
      const context = smartAccount.getSmartAccountContext();
      const deployment = await relayer.deployWallet(state, context); // index 0
      const res = await deployment.wait(1);
      console.log(res);
      getSmartAccount();
      showSuccessMessage("Smart Account deployed");
      setDeployLoading1(false);
    } catch (err: any) {
      setDeployLoading1(false);
      showErrorMessage(err.message.slice(0, 60));
      console.error("deploySmartAccount", err);
    }
  };

  const deploySmartAccount2 = async () => {
    try {
      if (!smartAccount || !state) {
        showErrorMessage("Init Smart Account First");
        return;
      }
      setDeployLoading2(true);
      const walletProvider = new ethers.providers.Web3Provider(provider);
      const biconomyFeeCollector = "0x7306aC7A32eb690232De81a9FFB44Bb346026faB"; // should be tx.origin or relayer
      const relayer = new LocalRelayer(
        getEOAWallet(process.env.REACT_APP_PKEY || "", null)
      );
      smartAccount.setRelayer(relayer);

      const usdcContract = new ethers.Contract(
        config.usdc.address,
        config.usdc.abi,
        walletProvider
      );

      // get Fee Options
      const tokenGasPrice = 6;
      // estimate using gas estimator
      // estimate wallet deployment and send first transaction : 339253
      const feesToPay = tokenGasPrice * (261884 + 77369);

      const deploymentFeeTx = await usdcContract.populateTransaction.transfer(
        biconomyFeeCollector,
        ethers.BigNumber.from(feesToPay)
      );

      const tx = {
        to: config.usdc.address,
        data: deploymentFeeTx.data,
      };

      const context = smartAccount.getSmartAccountContext();
      console.log(state, context);
      // Here I need to create transaction batch with deployment and send refund to the relayer
      // createTransaction which pays relayer and relayer auto deploys wallet
      //const deployment = await relayer.deployWallet(state, context); // index 0
      //const res = await deployment.wait(1);
      //console.log(res);

      // createRefundTransaction approach once estimation is fixed...

      const transaction = await smartAccount.createTransaction(tx);
      //console.log("tx hash", transaction);

      // send transaction internally calls signTransaction and sends it to connected relayer
      const txHash = await smartAccount.sendTransaction(transaction);
      showSuccessMessage(`Tx hash ${txHash}`);
      //console.log(sendTx);
      //console.log(await sendTx.wait(1));

      getSmartAccount();
      showSuccessMessage("Smart Account deployed");
      setDeployLoading2(false);
    } catch (err: any) {
      setDeployLoading2(false);
      showErrorMessage(err.message.slice(0, 60));
      console.error("deploySmartAccount", err);
    }
  };

  return (
    <main className={classes.main}>
      <h3 className={classes.subTitle}>{"[ < Deploy Smart Account > ]"}</h3>

      {state?.isDeployed ? (
        <div className={classes.container2}>
          <p className={classes.text} style={{ marginBottom: 30 }}>
            Your Smart Account is already created.
          </p>
          <Button
            title="Go to Use Cases"
            isLoading={deployLoading1}
            onClickFunc={() => setValue(2)}
          />
        </div>
      ) : (
        <div className={classes.container}>
          <div className={classes.element}>
            <p className={classes.text}>Dapp Pays for Wallet Deployment Cost</p>
            <Button
              title="Deploy Smart Account"
              isLoading={deployLoading1}
              onClickFunc={deploySmartAccount1}
            />
          </div>
          <div className={classes.element}>
            <p className={classes.text}>User Pays for Wallet Deployment Cost</p>

            <p className={classes.subText}>
              Please deposit usdc in your smart wallet address to pay for wallet deployment
              cost.
            </p>

            <Button
              title="Deploy Smart Account"
              isLoading={deployLoading2}
              onClickFunc={deploySmartAccount2}
            />
          </div>
          <div className={classes.element}>
            <p className={classes.text}>
              Deploy Account along with my First Transaction
            </p>
            <Button title="Go to Use Cases" onClickFunc={() => setValue(2)} />
          </div>
        </div>
      )}
    </main>
  );
};

const useStyles = makeStyles(() => ({
  main: {
    margin: "auto",
    padding: "10px 40px",
  },
  subTitle: {
    textAlign: "center",
    marginBottom: 40,
  },
  container: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
  },
  element: {
    width: "28%",
    border: "1px solid #D48158",
    borderRadius: 20,
    height: 200,
    padding: 15,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    wordBreak: "break-all",
  },
  subText: {
    fontSize: 14,
    padding: 10,
    backgroundColor: "#FF996647",
  },
  container2: {
    textAlign: "center",
    marginTop: 80,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
}));

export default Onboarding;
