import React, { Dispatch, SetStateAction, useState } from "react";
import { makeStyles } from "@mui/styles";
import { LocalRelayer } from "@biconomy/relayer";
import Button from "../Button";
// import { useWeb3Context } from "../../contexts/Web3Context";
import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
import {
  getEOAWallet,
  showErrorMessage,
  showInfoMessage,
} from "../../utils";
// import { activeChainId } from "../../utils/chainConfig";

type OnboardingProps = {
  setValue: Dispatch<SetStateAction<number>>;
};

const Onboarding: React.FC<OnboardingProps> = ({ setValue }) => {
  const classes = useStyles();
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

      console.log("relayer", relayer);
      const context = smartAccount.getSmartAccountContext();

      const deployment = await relayer.deployWallet({
        config: state,
        context,
        index: 0,
      }); // index 0

      const res = await deployment.wait(1);
      console.log(res);
      getSmartAccount();
      showInfoMessage("Smart Account deployed");
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
      setDeployLoading1(true);

      const tx = await smartAccount.deployWalletUsingPaymaster();
      console.log(tx);
      const res = await tx.wait(1);
      console.log(res);
      getSmartAccount();
      showInfoMessage("Smart Account deployed");
      setDeployLoading1(false);
    } catch (err: any) {
      setDeployLoading2(false);
      showErrorMessage(err.message.slice(0, 60));
      console.error("deploySmartAccount", err);
    }
  };

  return (
    <main className={classes.main}>
      <h3 className={classes.subTitle}>{"Deploy Smart Account"}</h3>
      <p>
        Welcome onboard! This is the demo of the new Biconomy SDK. You need to
        deploy your smart account wallet to get started.
      </p>
      {/* <p>Wallet Deployment → </p> */}
      {state?.isDeployed ? (
        <div className={classes.container2}>
          <p className={classes.text} style={{ color: "#47EB78" }}>
            Your Smart Account is already created.
          </p>
          <Button
            title="Go to Use Cases"
            isLoading={deployLoading1}
            onClickFunc={() => setValue(3)}
          />
        </div>
      ) : (
        <div className={classes.container}>
          <div
            style={{
              display: "flex",
              justifyContent: "stretch",
              gap: 20,
              width: "100%",
              height: "100%",
              alignItems: "center",
            }}
          >
            <div className={classes.element}>
              <p className={classes.text}>
                Demo dapp pays for the wallet deployment cost.
              </p>
              <ul style={{ width: "100%" }}>
                <li style={{ marginBottom: 20 }}>Single click deployment.</li>
                <li style={{ marginBottom: 20 }}>
                  Relayers deploys / funds the wallet deployment for you.
                </li>
              </ul>
              <Button
                title="Deploy Smart Account"
                isLoading={deployLoading1}
                onClickFunc={deploySmartAccount1}
              />
            </div>

            <div className={classes.element}>
              <p className={classes.text}>
                User pays for wallet deployment cost.
              </p>
              <ul style={{ width: "100%" }}>
                <li style={{ marginBottom: 20 }}>
                  You have to deposit funds in the counter factual address.
                </li>
                <li style={{ marginBottom: 20 }}>
                  Copy your counter factual address from navbar.
                </li>
                <li style={{ marginBottom: 0 }}>
                  Get USDC funds from our testnet faucet and deploy.
                </li>
              </ul>
              <Button
                title="Deploy Smart Account"
                isLoading={deployLoading2}
                onClickFunc={deploySmartAccount2}
              />
            </div>

            <div className={classes.element}>
              <p className={classes.text}>
                Deploy Account along with first transaction.
              </p>
              <ul style={{ width: "100%" }}>
                <li style={{ marginBottom: 20 }}>
                  User pay for deployment along with the first transaction.
                </li>
                <li style={{ marginBottom: 10 }}>
                  Select bundled transaction which deploys the wallet and add
                  liquidity to Hyphen bridge.
                </li>
              </ul>
              <Button title="Go to Use Cases" onClickFunc={() => setValue(3)} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

const useStyles = makeStyles(() => ({
  main: {
    padding: "10px 40px",
    width: "100%",
    height: "100%",
    gap: 20,
    color: "#e6e6e6",
    display: "flex",
    flexDirection: "column",
    alignItems: "start",
    justifyContent: "center",
  },
  subTitle: {
    color: "#FFB999",
    fontSize: 36,
    margin: 0,
  },
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "space-between",
    "@media (max-width: 899px)": {
      width: "90%",
      flexDirection: "column",
    },
  },
  element: {
    width: "100%",
    height: "max-content",
    minHeight: "410px",
    backgroundColor: "#151520",
    borderRadius: 12,
    padding: 25,
    gap: 8,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    border: "1px solid #5B3320",
    alignItems: "start",
    "@media (max-width: 899px)": {
      width: "100%",
      marginBottom: 20,
      height: "max-content",
    },
  },
  text: {
    fontSize: 20,
    color: "#e6e6e6",
    // wordBreak: "break-all",
  },
  subText: {
    fontSize: 14,
    padding: 10,
    backgroundColor: "#FF996647",
  },
  container2: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "start",
  },
}));

export default Onboarding;
