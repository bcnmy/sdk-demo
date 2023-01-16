import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { makeStyles } from "@material-ui/core/styles";
import { CircularProgress } from "@material-ui/core";
import HDWalletProvider from "@truffle/hdwallet-provider"
import { RestRelayer } from "@biconomy/relayer";
import { GasLimit, ChainId } from "@biconomy/core-types";
import SmartAccount from "@biconomy/smart-account";
import Button from "../../Button";
import { useWeb3AuthContext } from "../../../contexts/SocialLoginContext";
import { useSmartAccountContext } from "../../../contexts/SmartAccountContext";
import {
  configInfo as config,
  showSuccessMessage,
  showInfoMessage,
  showErrorMessage,
} from "../../../utils";

const AddLPForward: React.FC = () => {
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
      setIsLoading(true);
      console.log('we here...')
      console.log(wallet, walletState, web3Provider);
      if (!wallet || !walletState || !web3Provider) return;
      const relayer = new RestRelayer({
        url: "https://sdk-relayer.staging.biconomy.io/api/v1/relay",
        socketServerUrl: 'wss://sdk-testing-ws.staging.biconomy.io/connection/websocket'
      });
      // to do transaction on smart account we need to set relayer
      let smartAccount = wallet;
      //set listener for transaction

      // await smartAccount.setRelayer(relayer);
      const txs = [];
      const usdcContract = new ethers.Contract(
        config.usdc.address,
        config.usdc.abi,
        web3Provider
      );
      const hyphenContract = new ethers.Contract(
        config.hyphenLP.address,
        config.hyphenLP.abi,
        web3Provider
      );
      const approveUSDCTx = await usdcContract.populateTransaction.approve(
        config.hyphenLP.address,
        ethers.BigNumber.from("1000000")
      );
      const tx1 = {
        to: config.usdc.address,
        data: approveUSDCTx.data,
      };
      txs.push(tx1);

      const hyphenLPTx =
        await hyphenContract.populateTransaction.addTokenLiquidity(
          config.usdc.address,
          ethers.BigNumber.from("1000000")
        );

      const tx2 = {
        to: config.hyphenLP.address,
        data: hyphenLPTx.data,
      };
      txs.push(tx2);
      console.log("Tx array created", txs);
      // prepare refund txn batch before so that we have accurate token gas price
      const feeQuotes = await smartAccount.prepareRefundTransactionBatch({
        transactions: txs,
      });
      console.log("prepareRefundTransactionBatch", feeQuotes);
      const pmtArr: {
        symbol: string;
        value: string;
      }[] = [];
      for (let i = 0; i < feeQuotes.length; ++i) {
        const pmnt = parseFloat(
          (feeQuotes[i].payment / Math.pow(10, feeQuotes[i].decimal)).toString()
        ).toFixed(8);
        pmtArr.push({
          symbol: feeQuotes[i].symbol,
          value: pmnt,
        });
      }
      setPayment(pmtArr);
      console.log("pmtArr", pmtArr);
      setTxnArray(txs);
      setIsLoading(false);
    };
    fetchFeeOption();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  const makeTx = async () => {
    if (!wallet || !walletState || !web3Provider || !txnArray) return;
    try {
      const relayer = new RestRelayer({
        url: "https://sdk-relayer.staging.biconomy.io/api/v1/relay",
        socketServerUrl: 'wss://sdk-testing-ws.staging.biconomy.io/connection/websocket'
      });

      // todo
      // update private key
      let provider = new HDWalletProvider(config.privateKey, 'https://polygon-mumbai.g.alchemy.com/v2/Q4WqQVxhEEmBYREX22xfsS2-s5EXWD31');
      const walletProvider = new ethers.providers.Web3Provider(provider as any);

      // get EOA address from wallet provider
      const eoa = await walletProvider.getSigner().getAddress();
      console.log(`EOA address: ${eoa}`);


      // const walletProvider = new ethers.providers.Web3Provider(provider);
      console.log("walletProvider", walletProvider);
      // New instance, all config params are optional
      const wallet2 = new SmartAccount(walletProvider, {
        // signType: SignTypeMethod.PERSONAL_SIGN,
        activeNetworkId: ChainId.POLYGON_MUMBAI,
        supportedNetworksIds: [ChainId.POLYGON_MUMBAI],
        // backendUrl: 'https://sdk-backend.staging.biconomy.io/v1',
        // socketServerUrl: 'wss://sdk-testing-ws.staging.biconomy.io/connection/websocket',
        // relayerUrl: 'https://sdk-relayer.staging.biconomy.io/api/v1/relay',
        // bundlerUrl: 'http://localhost:3005/rpc',
        networkConfig: [
          {
          chainId: ChainId.POLYGON_MUMBAI,
          dappAPIKey: '59fRCMXvk.8a1652f0-b522-4ea7-b296-98628499aee3',
          // if need to override // providerUrl: 
        },
        {
          chainId: ChainId.POLYGON_MAINNET,
          // dappAPIKey: todo
        }
      ]
      });
      console.log("wallet", wallet2);

      // Wallet initialization to fetch wallet info
      const smartAccount2 = await wallet2.init();

      // to do transaction on smart account we need to set relayer
      let smartAccount = wallet;
      // await smartAccount.setRelayer(relayer);
      showInfoMessage("Setting Relayer");

      // currently step 1 building wallet transaction
      const txs = [];

      const usdcContract = new ethers.Contract(
        config.usdc.address,
        config.usdc.abi,
        web3Provider
      );
      const hyphenContract = new ethers.Contract(
        config.hyphenLP.address,
        config.hyphenLP.abi,
        web3Provider
      );

      const approveUSDCTx = await usdcContract.populateTransaction.approve(
        config.hyphenLP.address,
        ethers.BigNumber.from("1000000")
      );
      const tx1 = {
        to: config.usdc.address,
        data: approveUSDCTx.data,
      };
      txs.push(tx1);

      const hyphenLPTx =
        await hyphenContract.populateTransaction.addTokenLiquidity(
          config.usdc.address,
          ethers.BigNumber.from("1000000")
        );
      const tx2 = {
        to: config.hyphenLP.address,
        data: hyphenLPTx.data,
      };
      // comment below line (if estimation fails) to double check reason is not hyophen LP
      txs.push(tx2);

      console.log("Tx array created", txs);

      // prepare refund txn batch before so that we have accurate token gas price
      const feeQuotes = await smartAccount.prepareRefundTransactionBatch({
        transactions: txs,
      });
      console.log("prepareRefundTransactionBatch", feeQuotes);
      const pmtArr: {
        symbol: string;
        value: string;
      }[] = [];
      for (let i = 0; i < feeQuotes.length; ++i) {
        const pmnt = parseFloat(
          (feeQuotes[i].payment / Math.pow(10, feeQuotes[i].decimal)).toString()
        ).toFixed(8);
        pmtArr.push({
          symbol: feeQuotes[i].symbol,
          value: pmnt,
        });
      }
      setPayment(pmtArr);
      console.log("pmtArr", pmtArr);
      showInfoMessage("Batching transactions");

      // making transaction with version, set feeQuotes[1].tokenGasPrice = 6
      const transaction = await smartAccount.createRefundTransactionBatch({
        transactions: txs,
        feeQuote: feeQuotes[1],
      });
      console.log("transaction", transaction);

      let gasLimit: GasLimit = {
        hex: "0x1E8480",
        type: "hex",
      };

      const signature = await smartAccount.signTransaction({tx: transaction, signer: smartAccount.getsigner()})

      // send transaction internally calls signTransaction and sends it to connected relayer
      console.log('smartAccount 2 owner ', smartAccount2.owner)
      console.log('smartAccount 2 address ', smartAccount2.address)
      const txHash = await smartAccount2.sendSignedTransaction({
        tx: transaction,
        gasLimit, 
        signature
      });
      console.log(txHash);
      
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
        Use Cases {"->"} Forward {"->"} USDC Liquidity on Hyphen
      </p>

      <h3 className={classes.subTitle}>Approve and Add Liquidity in Hyphen</h3>

      <p>
        This magic bundle will approve USDC then provide the USDC liquidity to
        Hyphen Pool
      </p>

      <h3 className={classes.h3Title}>Transaction Batched</h3>
      <ul>
        <li>Deploy Wallet if not already deployed</li>
        <li>Approve USDC</li>
        <li>Provide USDC Liquidity on Hyphen</li>
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
      <Button title="Do transaction (One Click LP)" onClickFunc={makeTx} />
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
    color: "#BDC2FF",
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

export default AddLPForward;