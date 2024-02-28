import React, { useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import CircularProgress from "@mui/material/CircularProgress";
import {
  PaymasterFeeQuote,
  PaymasterMode,
} from "@biconomy/account";

import Button from "../Button";
import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
import {
  configInfo as config,
  showErrorMessage,
  showSuccessMessage,
} from "../../utils";
import { Hex, encodeFunctionData, getContract } from "viem";
import { usePublicClient } from "wagmi";

const MintNftForward: React.FC = () => {
  const classes = useStyles();
  const publicClient = usePublicClient();
  const { smartAccount, scwAddress } = useSmartAccountContext();
  const [nftCount, setNftCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFee, setIsLoadingFee] = useState(false);

  const [spender, setSpender] = useState("");
  const [feeQuotesArr, setFeeQuotesArr] = useState<PaymasterFeeQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<PaymasterFeeQuote>();
  const [tx, setTx] = useState();

  useEffect(() => {
    const getNftCount = async () => {
      if (!scwAddress || !publicClient) return;
      const nftContract = getContract({
        address: config.nft.address as Hex,
        abi: config.nft.abi,
        client: publicClient,
      });
      const count = await nftContract.read.balanceOf([scwAddress as Hex]);
      console.log("count", Number(count));
      setNftCount(Number(count));
    };
    getNftCount();
    getFee();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scwAddress, publicClient]);

  const getFee = async () => {
    if (!smartAccount || !scwAddress || !publicClient) return;
    setIsLoadingFee(true);
    const mintData = encodeFunctionData({
      abi: config.nft.abi,
      functionName: "safeMint",
      args: [scwAddress as Hex],
    });
    const tx1 = {
      to: config.nft.address,
      value: 0,
      data: mintData,
    };
    setTx(tx1 as any);
    const feeQuotesResponse = await smartAccount.getTokenFees([tx1], {
      paymasterServiceData: { mode: PaymasterMode.ERC20 },
    });
    setSpender(feeQuotesResponse.tokenPaymasterAddress || "");
    const feeQuotes = feeQuotesResponse.feeQuotes as PaymasterFeeQuote[];
    setFeeQuotesArr(feeQuotes);
    console.log("getFeeQuotesForBatch", feeQuotes);
    setIsLoadingFee(false);
  };

  const makeTx = async () => {
    if (!smartAccount || !scwAddress || !publicClient) return;
    if (!selectedQuote) {
      showErrorMessage("Please select a fee quote");
      return;
    }
    try {
      setIsLoading(true);
      console.log("selected quote", selectedQuote);
      // const finalUserOp = { ...estimatedUserOp } as any;
      const userOpResponse = await smartAccount.sendTransaction(
        tx!,
        {
          paymasterServiceData: {
            feeQuote: selectedQuote,
            mode: PaymasterMode.ERC20,
            spender: spender as Hex,
            maxApproval: false,
          }
        }
      );

      console.log("userOpHash", userOpResponse);
      const { transactionHash } = await userOpResponse.waitForTxHash();
      console.log("txHash", transactionHash);
      showSuccessMessage(`Minted Nft ${transactionHash}`, transactionHash);
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
        {feeQuotesArr.map((token, ind) => (
          // <li className={classes.listHover} key={ind}>
          //   {parseFloat(
          //     (token.payment / Math.pow(10, token.decimal)).toString()
          //   ).toFixed(8)}{" "}
          //   {token.symbol}
          // </li>
          <div key={ind}>
            <input
              type="radio"
              onChange={() => setSelectedQuote(token)}
              style={{
                color: "#FFB999",
              }}
              name={token.symbol}
              id={token.symbol}
              checked={selectedQuote === token}
            />
            <label htmlFor={token.symbol}>
              {token?.maxGasFeeUSD?.toFixed(6)} {token.symbol}
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
