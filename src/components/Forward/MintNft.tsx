import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { makeStyles } from "@mui/styles";
import CircularProgress from "@mui/material/CircularProgress";

import Button from "../Button";
import { useWeb3AuthContext } from "../../contexts/SocialLoginContext";
import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
import {
  configInfo as config,
  showErrorMessage,
  showInfoMessage,
  showSuccessMessage,
} from "../../utils";
import { FeeQuote } from "@biconomy/core-types";

const MintNftForward: React.FC = () => {
  const classes = useStyles();
  const { web3Provider } = useWeb3AuthContext();
  const { state: walletState, wallet } = useSmartAccountContext();
  const [quote, setQuote] = useState<FeeQuote>();
  const [tx, setTx] = useState<any>();
  const [nftCount, setNftCount] = useState<number | null>(null);
  const [payment, setPayment] = useState<
  FeeQuote[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFee, setIsLoadingFee] = useState(false);

  useEffect(() => {
    const getNftCount = async () => {
      if (!walletState?.address || !web3Provider) return;
      const nftContract = new ethers.Contract(
        config.nft.address,
        config.nft.abi,
        web3Provider
      );
      const count = await nftContract.balanceOf(walletState?.address);
      console.log("count", Number(count));
      setNftCount(Number(count));
    };
    getNftCount();
    getFee();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletState?.address, web3Provider]);

  const getFee = async () => {
    if (!wallet || !walletState || !web3Provider) return;
    setIsLoadingFee(true);
      let smartAccount = wallet;
      const nftContract = new ethers.Contract(
        config.nft.address,
        config.nft.abi,
        web3Provider
      );
      console.log("smartAccount.address ", smartAccount.address);
      const safeMintTx = await nftContract.populateTransaction.safeMint(
        smartAccount.address
      );
      console.log(safeMintTx.data);
      const tx1 = {
        to: config.nft.address,
        data: safeMintTx.data,
      };
      setTx(tx1);
      // prepare refund txn batch before so that we have accurate token gas price
      const feeQuotes = await smartAccount.getFeeQuotes({
        transaction: tx1,
      });
      setPayment(feeQuotes);
      console.log("getFeeQuotesForBatch", feeQuotes);
      setIsLoadingFee(false);
  }

  const makeTx = async () => {
    if (!wallet || !walletState || !web3Provider) return;
    try {
      let smartAccount = wallet;
      setIsLoading(true);
      // const pmtArr: {
      //   symbol: string;
      //   value: string;
      // }[] = [];
      // for (let i = 0; i < feeQuotes.length; ++i) {
      //   const pmnt = parseFloat(
      //     (feeQuotes[i].payment / Math.pow(10, feeQuotes[i].decimal)).toString()
      //   ).toFixed(8);
      //   pmtArr.push({
      //     symbol: feeQuotes[i].symbol,
      //     value: pmnt,
      //   });
      // }
      showInfoMessage("Batching transactions");

      // making transaction with version, set feeQuotes[1].tokenGasPrice = 6
      if(!quote || !tx) throw new Error("Please select a fee option");
      const transaction = await smartAccount.createUserPaidTransaction({
        transaction: tx,
        feeQuote: quote,
      });
      console.log("transaction", transaction);

      // send transaction internally calls signTransaction and sends it to connected relayer
      const txHash = await smartAccount.sendUserPaidTransaction({
        tx: transaction
      });
      console.log(txHash);

      // check if tx is mined
      web3Provider.once(txHash, (transaction: any) => {
        // Emitted when the transaction has been mined
        console.log("txn_mined:", transaction);
        showSuccessMessage(`Transaction mined: ${txHash}`);
      });
      setIsLoading(false);
    } catch (err: any) {
      console.error(err);
      setIsLoading(false);
      showErrorMessage(err.message || "Error in sending the transaction");
    }
  };

  return (
    <main className={classes.main}>
      <p style={{ color: "#7E7E7E" }}>
        Use Cases {"->"} Gasless {"->"} Mint Nft
      </p>

      <h3 className={classes.subTitle}>Mint Nft Flow</h3>

      <p style={{ marginBottom: 20 }}>
        This is an example gasless transaction to Mint Nft.
      </p>
      <p style={{ marginBottom: 30 }}>
        Nft Balance in SCW:{" "}
        {nftCount === null ? (
          <p style={{ color: "#7E7E7E", display: "contents" }}>fetching...</p>
        ) : (
          nftCount
        )}
      </p>

      <h3 className={classes.h3Title}>Available Fee options</h3>

      {isLoadingFee && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: "0 0 40px 30px",
          }}
        >
          <CircularProgress
            color="secondary"
            style={{ width: 25, height: 25, marginRight: 10, color: "#e6e6e6" }}
          />{" "}
          {" Loading Fee Options"}
        </div>
      )}
      <ul
        style={{
          display: "flex",
          alignItems: "start",
          flexDirection: "column",
          justifyContent: "start",
          marginLeft: 0,
          gap: 8,
        }}
      >
        {payment.map((token: FeeQuote, ind) => (
          // <li className={classes.listHover} key={ind}>
          //   {parseFloat(
          //     (token.payment / Math.pow(10, token.decimal)).toString()
          //   ).toFixed(8)}{" "}
          //   {token.symbol}
          // </li>
          <div>
            <input
              type="radio"
              onChange={() => setQuote(token)}
              style={{
                color: "#FFB999",
              }}
              name={token.symbol}
              id={token.symbol}
              checked={quote === token}
            />
            <label htmlFor={token.symbol}>
              {parseFloat(
                (token.payment / Math.pow(10, token.decimal)).toString()
              ).toFixed(8)}{" "}
              {token.symbol}
            </label>
          </div>
        ))}
      </ul>

      <Button title="Mint NFT" isLoading={isLoading} onClickFunc={makeTx} />
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
    color: "#FFB999",
    fontSize: 36,
    margin: 0,
  },
  h3Title: {
    color: "#e6e6e6",
  },
  listHover: {
    "&:hover": {
      color: "#FF9551",
    },
  },
}));

export default MintNftForward;
