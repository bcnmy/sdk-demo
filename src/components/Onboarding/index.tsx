import React, { Dispatch, SetStateAction, useState } from "react";
// import { ethers } from "ethers";
import { makeStyles } from "@material-ui/core/styles";
import { LocalRelayer, RestRelayer } from "@biconomy-sdk/relayer";
import Button from "../Button";
// import { useWeb3Context } from "../../contexts/Web3Context";
import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
import {
  getEOAWallet,
  // configEIP2771 as config,
  showErrorMessage,
  showSuccessMessage,
} from "../../utils";

type OnboardingProps = {
  setValue: Dispatch<SetStateAction<number>>;
};

const Onboarding: React.FC<OnboardingProps> = ({ setValue }) => {
  const classes = useStyles();
  // const { provider } = useWeb3Context();
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
      const deployment = await relayer.deployWallet({config:state, context, index:0}); // index 0
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
      const relayer = new RestRelayer({
        url: "https://sdk-relayer.staging.biconomy.io/api/v1/relay",
      });
      smartAccount.setRelayer(relayer);

      const feeQuotes = await smartAccount.prepareDeployAndPayFees();
      console.log('feeQuotes ', feeQuotes);

      console.log('token address ', feeQuotes[1].address);

      const txHash = await smartAccount.deployAndPayFees(5, feeQuotes[1]);
      showSuccessMessage(`Tx hash ${txHash}`);
      //console.log(sendTx);
      console.log(txHash);

      await sleep(5000);

      getSmartAccount();
      showSuccessMessage("Smart Account deployed");
      setDeployLoading2(false);
    } catch (err: any) {
      setDeployLoading2(false);
      showErrorMessage(err.message.slice(0, 60));
      console.error("deploySmartAccount", err);
    }
  };

  function sleep(ms:any) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

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
