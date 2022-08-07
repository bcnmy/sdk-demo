import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Tab, Tabs } from "@material-ui/core";
import { ethers } from "ethers";
import { ToastContainer } from "react-toastify";

import SmartAccount from "@biconomy-sdk/smart-account";
import { LocalRelayer } from "@biconomy-sdk/relayer";

import Navbar from "./components/Navbar";
import Button from "./components/Button";
import { useWeb3Context } from "./contexts/Web3Context";
import {
  getEOAWallet,
  configEIP2771 as config,
  showErrorMessage,
  showSuccessMessage,
} from "./utils";

// let biconomy: any;
let walletProvider, walletSigner;

const ChainId = {
  // Ethereum
  MAINNET: 1,
  ROPSTEN: 3,
  RINKEBY: 4,
  GOERLI: 5,
  KOVAN: 42,
  MUMBAI: 80001,
};

let smartAccount: SmartAccount | undefined;

const App: React.FC = () => {
  const classes = useStyles();
  const { address, provider } = useWeb3Context();
  const [walletState, setWalletState] = useState({
    counterFactual: "0xabcd",
    isDeployed: false,
    balance: "",
  });

  const [value, setValue] = React.useState(0);
  const [initLoading, setInitLoading] = useState(false);
  const [deployLoading, setDeployLoading] = useState(false);
  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  const getSmartAccount = async () => {
    if (!provider) {
      showErrorMessage("Wallet not connected");
      return;
    }
    try {
      setInitLoading(true);
      walletProvider = new ethers.providers.Web3Provider(provider);
      walletSigner = walletProvider.getSigner();

      // New instance
      const wallet = new SmartAccount(walletProvider, {
        // these are all optional
        activeNetworkId: ChainId.GOERLI,
        supportedNetworksIds: [ChainId.GOERLI, ChainId.MUMBAI],
        backend_url: "http://localhost:3001/v1",
      });

      // Initalising
      smartAccount = await wallet.init();
      console.log("smartAccount", smartAccount);

      // can get counter factual wallet address
      // const address = await smartAccount.getAddress();
      // console.log("counter factual wallet address: ", address);

      // get address, isDeployed and other data
      const state = await smartAccount.getSmartAccountState();
      showSuccessMessage("Fetched smart account state");
      console.log("getSmartAccountState", state);

      // ethAdapter could be used like this
      const bal = await smartAccount.ethersAdapter().getBalance(state.address);
      showSuccessMessage("Fetched balance");

      const balanceParams = {
        chainId: 137,
        eoaAddress: state.address,
        tokenAddresses: [],
      };
      const balFromSdk = await smartAccount.getAlltokenBalances(balanceParams);
      console.log(balFromSdk);

      const usdBalFromSdk = await smartAccount.getTotalBalanceInUsd(
        balanceParams
      );
      console.log(usdBalFromSdk);

      setWalletState({
        counterFactual: state.address,
        isDeployed: state.isDeployed,
        balance: bal.toString(),
      });

      // Check if the smart wallet is deployed or not
      // const isDeployed = await smartAccount.isDeployed(); // can pass chainId here
      // console.log(isDeployed);
      setInitLoading(false);
    } catch (err: any) {
      showErrorMessage(err.message.slice(0, 60));
      setInitLoading(false);
      console.error("getSmartAccount", err);
    }
  };

  const deploySmartAccount = async () => {
    try {
      if (!smartAccount) {
        showErrorMessage("Init Smart Account First");
        return;
      }
      setDeployLoading(true);
      // you can create instance of local relayer with current signer or any other private key signer
      const relayer = new LocalRelayer(
        getEOAWallet(process.env.REACT_APP_PKEY || "", null)
      );
      console.log(relayer);
      const state = await smartAccount.getSmartAccountState();
      const context = smartAccount.getSmartAccountContext();
      const deployment = await relayer.deployWallet(state, context); // index 0
      const res = await deployment.wait(1);
      console.log(res);
      showSuccessMessage("Smart Account deployed");
      setDeployLoading(false);
    } catch (err: any) {
      setDeployLoading(false);
      showErrorMessage(err.message.slice(0, 60));
      console.error("deploySmartAccount", err);
    }
  };

  const makeTx = async () => {
    if (!smartAccount) return;
    walletProvider = new ethers.providers.Web3Provider(provider);
    walletSigner = walletProvider.getSigner();
    // Example of regular signer and LocalRelayer
    // const relayer2 = new LocalRelayer(walletSigner);
    const relayer = new LocalRelayer(
      getEOAWallet(process.env.REACT_APP_PKEY || "", null)
    );
    // to do transaction on smart account we need to set relayer
    smartAccount = smartAccount.setRelayer(relayer);

    // building external txn
    const contract = new ethers.Contract(
      config.contract.address,
      config.contract.abi,
      walletProvider
    );

    let { data } = await contract.populateTransaction.setQuote("Hello there");
    const tx1 = {
      to: config.contract.address,
      data: data,
    };

    // currently step 1 building wallet transaction
    const txs = [];
    txs.push(tx1);

    const daiContract = new ethers.Contract(
      config.dai.address,
      config.dai.abi,
      walletProvider
    );

    const approveTx = await daiContract.populateTransaction.approve(
      config.contract.address,
      ethers.utils.parseEther("0.1")
    );
    const tx2 = {
      to: config.dai.address,
      data: approveTx.data,
    };

    txs.push(tx2);

    console.log(txs);

    const transaction = await smartAccount.createSmartAccountTransactionBatch(
      txs
    );

    // send transaction internally calls signTransaction and sends it to connected relayer
    const sendTx = await smartAccount.sendTransaction(transaction);
    console.log(sendTx);

    console.log(await sendTx.wait(1));

    // console.log("Owner of smart wallet is ", smartAccount.owner);
  };

  return (
    <div className={classes.bgCover}>
      <Navbar />
      <main className={classes.main}>
        <h1 className="title">Biconomy SDK Demo</h1>
        <div>
          <p>EOA Address: {address}</p>

          <hr style={{ margin: "20px 0" }} />

          <h3 className={classes.subTitle}>{"[ < Smart Account > ]"}</h3>
          <div className={classes.container}>
            <div className={classes.containerBtn}>
              <p>Counter Factual Address:</p>
              <p>{walletState.counterFactual}</p>
            </div>
            <div className={classes.containerBtn} style={{ gap: 40 }}>
              <p>Smart Wallet Deplyed:</p>
              <p>{walletState.isDeployed === true ? "true" : "false"}</p>
            </div>
            <p>Balances of the wallet:</p>

            <div style={{ backgroundColor: "#FCF8E8", width: "max-content" }}>
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label="simple tabs"
              >
                <Tab label="Goerli" {...a11yProps(0)} />
                <Tab label="Polygon Mumbai" {...a11yProps(1)} />
              </Tabs>
            </div>
            <TabPanel value={value} index={0}>
              <pre>
                {`{
  balance: ${true}
  balanceInUsd: $${0}
  usdtBalance: ${0}
}
`}
              </pre>
            </TabPanel>
            <TabPanel value={value} index={1}>
              <pre>
                {`{
  balance: ${1}
  balanceInUsd: $${0}
  usdtBalance: ${1}
}
`}
              </pre>
            </TabPanel>

            <div className={classes.containerBtn}>
              <Button
                title="Init Smart Account"
                isLoading={initLoading}
                onClickFunc={getSmartAccount}
              />
              <Button
                title="Deploy Smart Account"
                isLoading={deployLoading}
                onClickFunc={deploySmartAccount}
              />
            </div>
          </div>
        </div>

        <hr style={{ margin: "20px 0" }} />

        <h3 className={classes.subTitle}>
          {"[ < Send Batch :: SetQuote and Approve DAI> ]"}
        </h3>
        <Button title="do transaction" onClickFunc={makeTx} />
        {/* <button onClick={makeTx} className={classes.walletBtn}></button> */}

        <ToastContainer />
      </main>
    </div>
  );
};

const useStyles = makeStyles(() => ({
  bgCover: {
    backgroundColor: "#fffef6",
    // backgroundImage: `url(img/bg.png)`,
    // backgroundSize: "cover",
    width: "100%",
    minHeight: "100vh",
  },
  main: {
    maxWidth: 800,
    margin: "auto",
  },
  subTitle: {
    textAlign: "center",
  },
  container: {
    // backgroundColor: "rgb(29, 31, 33)",
  },
  containerBtn: {
    display: "flex",
    gap: 15,
    // justifyContent: "space-between",
  },
  tab: {
    padding: "5px 15px",
    backgroundColor: "#FCF8E8",
    marginBottom: 10,
  },
}));

export default App;

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

function TabPanel(props: TabPanelProps) {
  const classes = useStyles();
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      className={classes.tab}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

function a11yProps(index: any) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}
