import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { ethers } from "ethers";

import { LocalRelayer } from "@biconomy-sdk/relayer";

import { CurrencyAmount, Token, TradeType } from "@uniswap/sdk-core";
import { AlphaRouter } from "@uniswap/smart-order-router";
import JSBI from "jsbi";
import { Percent } from "@uniswap/sdk-core";
import { default as IUniswapV3PoolABI } from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
// import { default as QuoterABI } from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'

import Button from "../Button";
import { useWeb3Context } from "../../contexts/Web3Context";
import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
import { getEOAWallet, configEIP2771 as config } from "../../utils";

// let biconomy: any;
let walletProvider, walletSigner;

interface Immutables {
  factory: string;
  token0: string;
  token1: string;
  fee: number;
  tickSpacing: number;
  maxLiquidityPerTick: ethers.BigNumber;
}

interface State {
  liquidity: ethers.BigNumber;
  sqrtPriceX96: ethers.BigNumber;
  tick: number;
  observationIndex: number;
  observationCardinality: number;
  observationCardinalityNext: number;
  feeProtocol: number;
  unlocked: boolean;
}

const ethersProvider = new ethers.providers.JsonRpcProvider(
  "https://goerli.infura.io/v3/d126f392798444609246423b06116c77"
);
const poolAddress = "0x951b8635A3D7Aa2FD659aB93Cb81710536d90043"; // USDC WETH
// const quoterAddress = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'
const poolContract = new ethers.Contract(
  poolAddress,
  IUniswapV3PoolABI.abi,
  ethersProvider
);
// const quoterContract = new ethers.Contract(quoterAddress, QuoterABI.abi, ethersProvider)

const V3_SWAP_ROUTER_ADDRESS = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";
const router = new AlphaRouter({ chainId: 5, provider: ethersProvider });

const WETH = new Token(
  5,
  "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
  18,
  "WETH",
  "Wrapped Ether"
);

const USDC = new Token(
  5,
  "0xb5B640E6414b6DeF4FC9B3C1EeF373925effeCcF",
  6,
  "USDC",
  "USD//C"
);

const AddLP: React.FC = () => {
  const classes = useStyles();
  const { provider } = useWeb3Context();
  const { state: walletState, wallet } = useSmartAccountContext();

  const makeTx = async () => {
    if (!wallet || !walletState) return;
    walletProvider = new ethers.providers.Web3Provider(provider);
    walletSigner = walletProvider.getSigner();
    // Example of regular signer and LocalRelayer
    // const relayer2 = new LocalRelayer(walletSigner);
    const relayer = new LocalRelayer(
      getEOAWallet(process.env.REACT_APP_PKEY || "", null)
    );
    // to do transaction on smart account we need to set relayer
    let smartAccount = wallet;
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

    /*const approveTx = await wethContract.populateTransaction.approve(
      V3_SWAP_ROUTER_ADDRESS,
      ethers.utils.parseEther("0.1")
    );
    const tx1 = {
      to: config.dai.address,
      data: approveTx.data,
    };

    txs.push(tx1);

    const typedValueParsed = "1000000000000000";
    const wethAmount = CurrencyAmount.fromRawAmount(
      WETH,
      JSBI.BigInt(typedValueParsed)
    );

    const route = await router.route(wethAmount, USDC, TradeType.EXACT_INPUT, {
      recipient: walletState.address,
      slippageTolerance: new Percent(5, 100),
      deadline: Math.floor(Date.now() / 1000 + 1800),
    });

    console.log(`Quote Exact In: ${route?.quote.toFixed(2)}`);
    console.log(`Gas Adjusted Quote In: ${route?.quoteGasAdjusted.toFixed(2)}`);
    console.log(`Gas Used USD: ${route?.estimatedGasUsedUSD.toFixed(6)}`);

    const uniswapTx = {
      data: route?.methodParameters?.calldata,
      to: V3_SWAP_ROUTER_ADDRESS,
      value: ethers.BigNumber.from(route?.methodParameters?.value),
      from: walletState.address,
      gasPrice: ethers.BigNumber.from(route?.gasPriceWei),
    };

    console.log(uniswapTx);

    const tx2 = {
      to: uniswapTx.to,
      data: uniswapTx.data,
    };

    txs.push(tx2);*/

    const approveUSDCTx = await usdcContract.populateTransaction.approve(
      config.hyphenLP.address,
      ethers.BigNumber.from("100000000")
    );
    const tx3 = {
      to: config.usdc.address,
      data: approveUSDCTx.data,
    };

    txs.push(tx3);

    const hyphenLPTx =
      await hyphenContract.populateTransaction.addTokenLiquidity(
        config.usdc.address,
        ethers.BigNumber.from("100000000")
      );

    const tx4 = {
      to: config.hyphenLP.address,
      data: hyphenLPTx.data,
    };

    txs.push(tx4);

    console.log(txs);

    const transaction = await smartAccount.createTransactionBatch(
       txs
     );

    // // send transaction internally calls signTransaction and sends it to connected relayer
    const sendTx = await smartAccount.sendTransaction(transaction);
    console.log(sendTx);

    console.log(await sendTx.wait(1));
  };

  return (
    <main className={classes.main}>
      <p style={{ color: "#7E7E7E" }}>
        Use Cases {"->"} Gas paid by user {"->"} Swap tokens and Add LP
      </p>

      <h3 className={classes.subTitle}>Swap and Add Liquidity in Hyphen</h3>

      <p>
        This magic bundle will swap WETH to USDC first and then provide the USDC
        liquidity to Hyphen Pool.
      </p>

      <h3>Transaction Batched</h3>
      <ul>
        {/*<li>Approve WETH</li>
        <li>Swap to USDC</li>*/}
        <li>Approve USDC</li>
        <li>Provide USDC Liquidity on Hyphen</li>
      </ul>

      <Button title="Do transaction (One Click LP)" onClickFunc={makeTx} />
      {/* <button onClick={makeTx} className={classes.walletBtn}></button> */}
    </main>
  );
};

const useStyles = makeStyles(() => ({
  main: {
    margin: "auto",
    padding: "10px 40px",
  },
  subTitle: {
    // textAlign: "center",
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
  const [factory, token0, token1, fee, tickSpacing, maxLiquidityPerTick] =
    await Promise.all([
      poolContract.factory(),
      poolContract.token0(),
      poolContract.token1(),
      poolContract.fee(),
      poolContract.tickSpacing(),
      poolContract.maxLiquidityPerTick(),
    ]);

  const immutables: Immutables = {
    factory,
    token0,
    token1,
    fee,
    tickSpacing,
    maxLiquidityPerTick,
  };
  return immutables;
};

const getPoolState = async () => {
  // note that data here can be desynced if the call executes over the span of two or more blocks.
  const [liquidity, slot] = await Promise.all([
    poolContract.liquidity(),
    poolContract.slot0(),
  ]);

  const PoolState: State = {
    liquidity,
    sqrtPriceX96: slot[0],
    tick: slot[1],
    observationIndex: slot[2],
    observationCardinality: slot[3],
    observationCardinalityNext: slot[4],
    feeProtocol: slot[5],
    unlocked: slot[6],
  };

  return PoolState;
};

export default AddLP;
