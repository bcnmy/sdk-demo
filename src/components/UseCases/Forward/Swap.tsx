import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { makeStyles } from "@material-ui/core/styles";
import { CircularProgress } from "@material-ui/core";

import { RestRelayer } from "@biconomy/relayer";
import { CurrencyAmount, Token, TradeType } from "@uniswap/sdk-core";
import { AlphaRouter } from "@uniswap/smart-order-router";
import JSBI from "jsbi";
import { Percent } from "@uniswap/sdk-core";
// import { default as IUniswapV3PoolABI } from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
// import { default as QuoterABI } from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'
import Button from "../../Button";
import { useWeb3AuthContext } from "../../../contexts/SocialLoginContext";
import { useSmartAccountContext } from "../../../contexts/SmartAccountContext";
import {
  configInfo as config,
  showSuccessMessage,
  showInfoMessage,
  showErrorMessage,
} from "../../../utils";
import { GasLimit } from "@biconomy/core-types";

const ethersProvider = new ethers.providers.JsonRpcProvider(
  "https://goerli.infura.io/v3/d126f392798444609246423b06116c77"
);
// const poolAddress = "0x951b8635A3D7Aa2FD659aB93Cb81710536d90043"; // USDC WETH
// const quoterAddress = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'
// const poolContract = new ethers.Contract(
//   poolAddress,
//   IUniswapV3PoolABI.abi,
//   ethersProvider
// );

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

const Swap: React.FC = () => {
  const classes = useStyles();
  const { provider, web3Provider } = useWeb3AuthContext();
  const { state: walletState, wallet } = useSmartAccountContext();
  const [payment, setPayment] = useState<
    {
      symbol: string;
      value: string;
    }[]
  >([]);
  const [txnArray, setTxnArray] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeeOption = async () => {
      if (!wallet || !walletState || !web3Provider) return;
      try {
        setIsLoading(true);

        // to do transaction on smart account we need to set relayer
        const relayer = new RestRelayer({
          url: "https://sdk-relayer.staging.biconomy.io/api/v1/relay",
          socketServerUrl: 'wss://sdk-testing-ws.staging.biconomy.io/connection/websocket'
        });
        wallet.setRelayer(relayer);

        const txs = [];
        const wethContract = new ethers.Contract(
          config.dai.address,
          config.dai.abi,
          web3Provider
        );
        const approveTx = await wethContract.populateTransaction.approve(
          V3_SWAP_ROUTER_ADDRESS,
          ethers.utils.parseEther("0.01")
        );
        const tx1 = {
          to: config.dai.address,
          data: approveTx.data,
        };
        txs.push(tx1);
        const typedValueParsed = "100000000000000";
        const wethAmount = CurrencyAmount.fromRawAmount(
          WETH,
          JSBI.BigInt(typedValueParsed)
        );
        const route = await router.route(
          wethAmount,
          USDC,
          TradeType.EXACT_INPUT,
          {
            recipient: walletState.address,
            slippageTolerance: new Percent(5, 100),
            deadline: Math.floor(Date.now() / 1000 + 1800),
          }
        );
        console.log(`Quote Exact In: ${route?.quote.toFixed(2)}`);
        console.log(
          `Gas Adjusted Quote In: ${route?.quoteGasAdjusted.toFixed(2)}`
        );
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
        // txs.push(tx2);
        console.log("Tx array created", txs);
        setTxnArray(txs);

        // prepare refund txn batch before so that we have accurate token gas price
        const feeQuotes = await wallet.prepareRefundTransactionBatch({
          transactions: txs,
        });
        console.log("prepareRefundTransactionBatch", feeQuotes);
        const pmtArr: {
          symbol: string;
          value: string;
        }[] = [];
        for (let i = 0; i < feeQuotes.length; ++i) {
          const pmnt = parseFloat(
            (
              feeQuotes[i].payment / Math.pow(10, feeQuotes[i].decimal)
            ).toString()
          ).toFixed(5);
          pmtArr.push({
            symbol: feeQuotes[i].symbol,
            value: pmnt,
          });
        }
        setPayment(pmtArr);
        setIsLoading(false);
        console.log("pmtArr", pmtArr);
      } catch (err: any) {
        console.error(err);
        setIsLoading(false);
        showErrorMessage(err.message || "Error while fetching fee options");
      }
    };
    fetchFeeOption();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  const makeTx = async () => {
    if (!wallet || !walletState || !txnArray.length || !web3Provider) return;
    try {
      showInfoMessage("Batching transactions");

      const feeQuotes = await wallet.prepareRefundTransactionBatch({
        transactions: txnArray,
      });

      // making transaction with version, set feeQuotes[1].tokenGasPrice = 6
      const transaction = await wallet.createRefundTransactionBatch({
        transactions: txnArray,
        feeQuote: feeQuotes[1],
      });
      console.log("transaction", transaction);

      let gasLimit: GasLimit = {
        hex: "0x1E8480",
        type: "hex",
      };
      // send transaction internally calls signTransaction and sends it to connected relayer
      const txHash = await wallet.sendTransaction({
        tx: transaction,
        gasLimit,
      });
      console.log(txHash);
      // showSuccessMessage(`Transaction sent: ${txHash}`);

      // check if tx is mined
      web3Provider.once(txHash, (transaction: any) => {
        // Emitted when the transaction has been mined
        console.log("txn_mined:", transaction);
        showSuccessMessage(`Transaction mined: ${txHash}`);
      });
    } catch (err: any) {
      console.error(err);
      showErrorMessage(err.message || "Error in sending the transaction");
    }
  };

  return (
    <main className={classes.main}>
      <p style={{ color: "#7E7E7E" }}>
        Use Cases {"->"} Gas paid by user {"->"} Swap WETH to USDC
      </p>

      <h3 className={classes.subTitle}>Approve and Swap token on Uniswap</h3>

      <p>
        This magic bundle will approve WETH then swap it for USDC using Uniswap
        Pool.
      </p>

      <h3 className={classes.h3Title}>Transaction Batched</h3>
      <ul>
        <li>Approve WETH</li>
        <li>Swap to USDC</li>
      </ul>

      <h3 className={classes.h3Title}>Available Fee options</h3>

      {isLoading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: "0 0 40px 30px",
          }}
        >
          <CircularProgress
            color="secondary"
            style={{ width: 25, height: 25, marginRight: 10, color: "#fff" }}
          />{" "}
          {" Loading Fee Options"}
        </div>
      )}

      <ul>
        {payment.map((token, ind) => (
          <li className={classes.listHover} key={ind}>
            {token.value} {token.symbol}
          </li>
        ))}
      </ul>
      <Button title="Do transaction (One Click Swap)" onClickFunc={makeTx} />
    </main>
  );
};

const useStyles = makeStyles(() => ({
  main: {
    margin: "auto",
    padding: "10px 40px",
    color: "#EEEEEE",
  },
  subTitle: {
    fontFamily: "Rubik",
    color: "#BDC2FF",
    fontSize: 28,
  },
  h3Title: {
    color: "#fff",
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
  listHover: {
    "&:hover": {
      color: "#FF9551",
    },
  },
}));

// const getPoolImmutables = async () => {
//   const [factory, token0, token1, fee, tickSpacing, maxLiquidityPerTick] =
//     await Promise.all([
//       poolContract.factory(),
//       poolContract.token0(),
//       poolContract.token1(),
//       poolContract.fee(),
//       poolContract.tickSpacing(),
//       poolContract.maxLiquidityPerTick(),
//     ]);

//   const immutables: Immutables = {
//     factory,
//     token0,
//     token1,
//     fee,
//     tickSpacing,
//     maxLiquidityPerTick,
//   };
//   return immutables;
// };

// const getPoolState = async () => {
//   // note that data here can be desynced if the call executes over the span of two or more blocks.
//   const [liquidity, slot] = await Promise.all([
//     poolContract.liquidity(),
//     poolContract.slot0(),
//   ]);

//   const PoolState: State = {
//     liquidity,
//     sqrtPriceX96: slot[0],
//     tick: slot[1],
//     observationIndex: slot[2],
//     observationCardinality: slot[3],
//     observationCardinalityNext: slot[4],
//     feeProtocol: slot[5],
//     unlocked: slot[6],
//   };

//   return PoolState;
// };

export default Swap;
