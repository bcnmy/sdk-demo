import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Tab, Tabs } from "@material-ui/core";
import { ethers } from "ethers";
import { ToastContainer } from "react-toastify";

import SmartAccount from "@biconomy-sdk/smart-account";
import { LocalRelayer } from "@biconomy-sdk/relayer";

import { CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core'
import { AlphaRouter } from '@uniswap/smart-order-router'
import JSBI from 'jsbi';
import { Percent } from "@uniswap/sdk-core";
import { default as IUniswapV3PoolABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import { default as QuoterABI } from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'

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
  GOERLI: 5,
  POLYGON_MUMBAI: 80001,
  POLYGON_MAINNET: 137,
};

interface Immutables {
  factory: string
  token0: string
  token1: string
  fee: number
  tickSpacing: number
  maxLiquidityPerTick: ethers.BigNumber
}

interface State {
  liquidity: ethers.BigNumber
  sqrtPriceX96: ethers.BigNumber
  tick: number
  observationIndex: number
  observationCardinality: number
  observationCardinalityNext: number
  feeProtocol: number
  unlocked: boolean
}

const ethersProvider = new ethers.providers.JsonRpcProvider('https://goerli.infura.io/v3/d126f392798444609246423b06116c77')
const poolAddress = '0x951b8635A3D7Aa2FD659aB93Cb81710536d90043' // USDC WETH
const quoterAddress = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'
const poolContract = new ethers.Contract(poolAddress, IUniswapV3PoolABI.abi, ethersProvider)
const quoterContract = new ethers.Contract(quoterAddress, QuoterABI.abi, ethersProvider)

const V3_SWAP_ROUTER_ADDRESS = '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45';
const router = new AlphaRouter({ chainId: 5, provider: ethersProvider });

const WETH = new Token(
  5,
  '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
  18,
  'WETH',
  'Wrapped Ether'
);

const USDC = new Token(
  5,
  '0xb5B640E6414b6DeF4FC9B3C1EeF373925effeCcF',
  6,
  'USDC',
  'USD//C'
);

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
        supportedNetworksIds: [ChainId.GOERLI, ChainId.POLYGON_MUMBAI],
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

      // you may use EOA address my goerli SCW 0x1927366dA53F312a66BD7D09a88500Ccd16f175e
      const balanceParams = {
        chainId: 5,
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
    /*const contract = new ethers.Contract(
      config.contract.address,
      config.contract.abi,
      walletProvider
    );

    let { data } = await contract.populateTransaction.setQuote("Hello there");
    const tx1 = {
      to: config.contract.address,
      data: data,
    };*/

    // currently step 1 building wallet transaction
    const txs = [];

    const wethContract = new ethers.Contract(
      config.dai.address,
      config.dai.abi,
      walletProvider
    );

    const usdcContract = new ethers.Contract(
      config.usdc.address,
      config.usdc.abi,
      walletProvider
    );

    const hyphenContract = new ethers.Contract(
      config.hyphenLP.address,
      config.hyphenLP.abi,
      walletProvider
    );

    const approveTx = await wethContract.populateTransaction.approve(
      V3_SWAP_ROUTER_ADDRESS,
      ethers.utils.parseEther("0.1")
    );
    const tx1 = {
      to: config.dai.address,
      data: approveTx.data,
    };

    txs.push(tx1);

    const typedValueParsed = '1000000000000000'
    const wethAmount = CurrencyAmount.fromRawAmount(WETH, JSBI.BigInt(typedValueParsed));

    const route = await router.route(
      wethAmount,
      USDC,
      TradeType.EXACT_INPUT,
      {
        recipient: walletState.counterFactual,
        slippageTolerance: new Percent(5, 100),
        deadline: Math.floor(Date.now() / 1000 + 1800)
      }
    );

    console.log(`Quote Exact In: ${route?.quote.toFixed(2)}`);
    console.log(`Gas Adjusted Quote In: ${route?.quoteGasAdjusted.toFixed(2)}`);
    console.log(`Gas Used USD: ${route?.estimatedGasUsedUSD.toFixed(6)}`);

    const uniswapTx = {
      data: route?.methodParameters?.calldata,
      to: V3_SWAP_ROUTER_ADDRESS,
      value: ethers.BigNumber.from(route?.methodParameters?.value),
      from: walletState.counterFactual,
      gasPrice: ethers.BigNumber.from(route?.gasPriceWei),
    };

    console.log(uniswapTx);

    const tx2 = {
      to: uniswapTx.to,
      data: uniswapTx.data
    }

    txs.push(tx2);

    const transferTx = await usdcContract.populateTransaction.approve(
      config.hyphenLP.address,
      ethers.BigNumber.from("100000000")
    );
    const tx3 = {
      to: config.usdc.address,
      data: transferTx.data,
    };

    txs.push(tx3);

    const hyphenLPTx = await hyphenContract.populateTransaction.addTokenLiquidity(
      config.usdc.address,
      ethers.BigNumber.from("100000000")
    );

    const tx4 = {
      to: config.hyphenLP.address,
      data: hyphenLPTx.data,
    };

    txs.push(tx4);

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
          {"[ < Send Batch :: Approve WETH +=> Swap to USDC +=>  Approve USDC +=> Provide USDC Liquidity on Hyphen> ]"}
        </h3>
        <Button title="Do transaction (One Click LP)" onClickFunc={makeTx} />
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

const getPoolImmutables = async () => {
  const [factory, token0, token1, fee, tickSpacing, maxLiquidityPerTick] = await Promise.all([
    poolContract.factory(),
    poolContract.token0(),
    poolContract.token1(),
    poolContract.fee(),
    poolContract.tickSpacing(),
    poolContract.maxLiquidityPerTick(),
  ])

  const immutables: Immutables = {
    factory,
    token0,
    token1,
    fee,
    tickSpacing,
    maxLiquidityPerTick,
  }
  return immutables
}

const getPoolState = async () => {
  // note that data here can be desynced if the call executes over the span of two or more blocks.
  const [liquidity, slot] = await Promise.all([poolContract.liquidity(), poolContract.slot0()])

  const PoolState: State = {
    liquidity,
    sqrtPriceX96: slot[0],
    tick: slot[1],
    observationIndex: slot[2],
    observationCardinality: slot[3],
    observationCardinalityNext: slot[4],
    feeProtocol: slot[5],
    unlocked: slot[6],
  }

  return PoolState
}


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
