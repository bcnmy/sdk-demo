import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import Button from "../Button";
// import { useWeb3Context } from "../../contexts/Web3Context";
import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
import { showErrorMessage, showInfoMessage } from "../../utils";
import { PaymasterMode, createPaymaster } from "@biconomy/account";
import { useAccount, useWalletClient, useWriteContract } from "wagmi";
import { Hex, formatEther, parseEther } from "viem";
// import { showErrorMessage, showInfoMessage } from "../../utils";
// import { activeChainId } from "../../utils/chainConfig";

type OnboardingProps = {
  setValue: Dispatch<SetStateAction<number>>;
};

const Onboarding: React.FC<OnboardingProps> = ({ setValue }) => {
  const classes = useStyles();
  const { smartAccount, scwAddress } = useSmartAccountContext();
  const { data: walletClient } = useWalletClient();

  const [smartAccountNativeBalance, setSmartAccountNativeBalance] = useState(BigInt(0));
  const [isScwDeployed, setisScwDeployed] = useState(false);
  const [requirePrefund, setRequirePrefund] = useState(false);
  const [requirePrefundAmount, setRequirePrefundAmount] = useState(BigInt(0));
  const [loading, setLoading] = useState(false);
  const [deployLoading1, setDeployLoading1] = useState(false);
  const [deployLoading2, setDeployLoading2] = useState(false);
  const [prefundLoading, setPrefundLoading] = useState(false);

  // const deploySmartAccountSponsored = async () => {
  //   try {
  //     if (!smartAccount) {
  //       showErrorMessage("Init Smart Account First");
  //       return;
  //     }
  //     setDeployLoading1(true);
      
  //     const tx = await smartAccount.deploy({paymasterServiceData: {mode: PaymasterMode.SPONSORED}});
  //     await tx.wait();

  //     showInfoMessage(`Smart Account deployed at address : ${scwAddress}`);
  //     setDeployLoading1(false);
  //   } catch (err: any) {
  //     setDeployLoading1(false);
  //     showErrorMessage(err.message.slice(0, 60));
  //     console.error("deploySmartAccount", err);
  //   }
  // };

  useEffect(() => {
    const setBalance = async () => {
      const balances = await smartAccount?.getBalances();
      setSmartAccountNativeBalance(balances ? balances[0]?.amount : BigInt(0));
    }
    setBalance();
  })

  const deploySmartAccount = async () => {
    try {
      if (!smartAccount) {
        showErrorMessage("Init Smart Account First");
        return;
      }
      setDeployLoading1(true);

      const deployTx = {
        to: scwAddress,
        data: "0x"
      }
      const requiredBalanceForDeploy = await smartAccount.getGasEstimate([deployTx])
      const [saNativeBalance] = await smartAccount.getBalances();

      if (saNativeBalance.amount < requiredBalanceForDeploy) {
        showErrorMessage("Insufficient balance in Smart Account for deployment");
        setRequirePrefund(true);
        setRequirePrefundAmount(requiredBalanceForDeploy);
      }

      const tx = await smartAccount.deploy();
      await tx.wait();

      showInfoMessage(`Smart Account deployed at address : ${scwAddress}`);
      setDeployLoading1(false);
    } catch (err: any) {
      setDeployLoading2(false);
      showErrorMessage(err.message.slice(0, 60));
      console.error("deploySmartAccount", err);
    }
  };

  const prefundSA = async () => {
    setPrefundLoading(true);
    try {
      await walletClient?.sendTransaction({
        to: scwAddress as Hex,
        value: requirePrefundAmount
      })
      setRequirePrefund(false);
      setPrefundLoading(false);
    } catch (error) {
      showErrorMessage("Error in prefunding Smart Account");
      setPrefundLoading(false);
    }
  }

  useEffect(() => {
    const isDeployed = async () => {
      setLoading(true);
      const dep = await smartAccount?.isAccountDeployed();
      if (dep) setisScwDeployed(true);
      setLoading(false);
    };
    if (smartAccount && scwAddress) isDeployed();
  }, [scwAddress, smartAccount]);

  return (
    <main className={classes.main}>
      <h3 className={classes.subTitle}>{"Deploy Smart Account"}</h3>
      <p>
        Welcome onboard! This is the demo of the new Biconomy Nexus SDK. You need to
        deploy your smart account wallet to get started.
      </p>
      {/* <p>Wallet Deployment → </p> */}
      {loading ? (
        <div className={classes.container2}>
          <p className={classes.text}>Fetching state...</p>
        </div>
      ) : isScwDeployed ? (
        <div className={classes.container2}>
          <p
            className={classes.text}
            style={{ color: "#47EB78", marginBottom: 30 }}
          >
            Your Smart Account is already created at address {scwAddress}
          </p>
          <small>Smart Account Balance: {formatEther(smartAccountNativeBalance)}</small>
          <Button
            title="Go to Use Cases"
            // isLoading={deployLoading1}
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
            }}
          >
            {/* <div className={classes.element}>
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
                onClickFunc={deploySmartAccountSponsored}
              />
            </div> */}

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
              {
                requirePrefund ? 
                <>
                  <Button
                    title="Prefund your Smart Account"
                    isLoading={prefundLoading}
                    onClickFunc={prefundSA}
                  />
                  <small style={{color: "red"}}>Required amount for deploy {formatEther(requirePrefundAmount)}</small>
                  <small>Recommended: Send at least <b>0.05 ETH</b> to {scwAddress} for future transactions.</small>
                </>
                :
                <Button
                  title="Deploy Smart Account"
                  isLoading={deployLoading1}
                  onClickFunc={deploySmartAccount}
                />
              }
            </div>

            <div
              className={classes.element}
              style={{ minHeight: 300, maxWidth: 500 }}
            >
              <p className={classes.text}>
                Deploy Account along with first transaction.
              </p>
              <ul style={{ width: "100%" }}>
                <li style={{ marginBottom: 20 }}>
                  User pay for deployment along with the first transaction.
                </li>
                <li style={{ marginBottom: 10 }}>
                  Select any transaction from the provided list and it will
                  deploy the account along with the transaction.
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
    marginTop: 20,
    // justifyContent: "center",
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
