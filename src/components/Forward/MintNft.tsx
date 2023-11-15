import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { makeStyles } from "@mui/styles";
import CircularProgress from "@mui/material/CircularProgress";
import {
  IHybridPaymaster,
  PaymasterFeeQuote,
  PaymasterMode,
  SponsorUserOperationDto,
} from "@biconomy/paymaster";

import Button from "../Button";
import { useWeb3AuthContext } from "../../contexts/SocialLoginContext";
import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
import {
  configInfo as config,
  showErrorMessage,
  showSuccessMessage,
} from "../../utils";

const MintNftForward: React.FC = () => {
  const classes = useStyles();
  const { web3Provider } = useWeb3AuthContext();
  const { scwAddress, smartAccount } = useSmartAccountContext();
  const [nftCount, setNftCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFee, setIsLoadingFee] = useState(false);

  const [spender, setSpender] = useState("");
  const [feeQuotesArr, setFeeQuotesArr] = useState<PaymasterFeeQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<PaymasterFeeQuote>();
  const [estimatedUserOp, setEstimatedUserOp] = useState({});

  useEffect(() => {
    const getNftCount = async () => {
      if (!scwAddress || !web3Provider) return;
      const nftContract = new ethers.Contract(
        config.nft.address,
        config.nft.abi,
        web3Provider
      );
      const count = await nftContract.balanceOf(scwAddress);
      console.log("count", Number(count));
      setNftCount(Number(count));
    };
    getNftCount();
    getFee();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scwAddress, web3Provider]);

  const getFee = async () => {
    if (!smartAccount || !scwAddress || !web3Provider) return;
    setIsLoadingFee(true);
    const nftContract = new ethers.Contract(
      config.nft.address,
      config.nft.abi,
      web3Provider
    );
    console.log("smartAccount.address ", scwAddress);
    const safeMintTx = await nftContract.populateTransaction.safeMint(
      scwAddress
    );
    console.log(safeMintTx.data);
    const tx1 = {
      to: config.nft.address,
      data: safeMintTx.data,
    };
    let partialUserOp = await smartAccount.buildUserOp([tx1]);
    setEstimatedUserOp(partialUserOp);
    const biconomyPaymaster =
      smartAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>;
    const feeQuotesResponse =
      await biconomyPaymaster.getPaymasterFeeQuotesOrData(partialUserOp, {
        // here we are explicitly telling by mode ERC20 that we want to pay in ERC20 tokens and expect fee quotes
        mode: PaymasterMode.ERC20,
        // one can pass tokenList empty array. and it would return fee quotes for all tokens supported by the Biconomy paymaster
        tokenList: [],
        // preferredToken is optional. If you want to pay in a specific token, you can pass its address here and get fee quotes for that token only
        // preferredToken: config.preferredToken,
      });
    setSpender(feeQuotesResponse.tokenPaymasterAddress || "");
    const feeQuotes = feeQuotesResponse.feeQuotes as PaymasterFeeQuote[];
    setFeeQuotesArr(feeQuotes);
    console.log("getFeeQuotesForBatch", feeQuotes);
    setIsLoadingFee(false);
  };

  const makeTx = async () => {
    if (!smartAccount || !scwAddress || !web3Provider) return;
    if (!selectedQuote) {
      showErrorMessage("Please select a fee quote");
      return;
    }
    try {
      setIsLoading(true);
      console.log("selected quote", selectedQuote);
      // const finalUserOp = { ...estimatedUserOp } as any;
      const finalUserOp = await smartAccount.buildTokenPaymasterUserOp(
        estimatedUserOp,
        {
          feeQuote: selectedQuote,
          spender: spender,
          maxApproval: false,
        }
      );
      const biconomyPaymaster =
        smartAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>;
      const paymasterAndDataWithLimits =
        await biconomyPaymaster.getPaymasterAndData(finalUserOp, {
          mode: PaymasterMode.ERC20, // - mandatory // now we know chosen fee token and requesting paymaster and data for it
          feeTokenAddress: selectedQuote?.tokenAddress,
          // - optional by default false
          // This flag tells the paymaster service to calculate gas limits for the userOp
          // since at this point callData is updated callGasLimit may change and based on paymaster to be used verification gas limit may change
          calculateGasLimits: true,
        });
      console.log("paymasterAndDataWithLimits", paymasterAndDataWithLimits);
      // below code is only needed if you sent the glaf calculateGasLimits = true
      if (
        paymasterAndDataWithLimits?.callGasLimit &&
        paymasterAndDataWithLimits?.verificationGasLimit &&
        paymasterAndDataWithLimits?.preVerificationGas
      ) {
        // Returned gas limits must be replaced in your op as you update paymasterAndData.
        // Because these are the limits paymaster service signed on to generate paymasterAndData
        // If you receive AA34 error check here..

        finalUserOp.callGasLimit = paymasterAndDataWithLimits.callGasLimit;
        finalUserOp.verificationGasLimit =
          paymasterAndDataWithLimits.verificationGasLimit;
        finalUserOp.preVerificationGas =
          paymasterAndDataWithLimits.preVerificationGas;
      }
      // update finalUserOp with paymasterAndData and send it to smart account
      finalUserOp.paymasterAndData =
        paymasterAndDataWithLimits.paymasterAndData;
      console.log("finalUserOp", finalUserOp);

      const userOpResponse = await smartAccount.sendUserOp(finalUserOp);
      console.log("userOpHash", userOpResponse);
      const { receipt } = await userOpResponse.wait(1);
      console.log("txHash", receipt.transactionHash);
      showSuccessMessage(
        `Minted Nft ${receipt.transactionHash}`,
        receipt.transactionHash
      );
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
