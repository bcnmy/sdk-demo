import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { makeStyles } from "@mui/styles";
import { CircularProgress } from "@mui/material";
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
  showSuccessMessage,
  showErrorMessage,
} from "../../utils";

const BatchLiquidity: React.FC = () => {
  const classes = useStyles();
  const { provider, web3Provider } = useWeb3AuthContext();
  const { smartAccount, scwAddress } = useSmartAccountContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFee, setIsLoadingFee] = useState(false);

  const [spender, setSpender] = useState("");
  const [feeQuotesArr, setFeeQuotesArr] = useState<PaymasterFeeQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<PaymasterFeeQuote>();
  const [estimatedUserOp, setEstimatedUserOp] = useState({});

  // pre calculate the fee
  useEffect(() => {
    const fetchFeeOption = async () => {
      setIsLoading(true);
      setIsLoadingFee(true);
      setFeeQuotesArr([]);
      if (!smartAccount || !scwAddress || !web3Provider) return;
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
      setIsLoading(false);
    };
    fetchFeeOption();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

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

      const userOpResponse = await smartAccount.sendUserOp(finalUserOp);
      console.log("userOpHash", userOpResponse);
      const { receipt } = await userOpResponse.wait(1);
      console.log("txHash", receipt.transactionHash);
      showSuccessMessage(
        `Batch Add Hyphen Liq ${receipt.transactionHash}`,
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
      <Button
        title="Do transaction (One Click LP)"
        isLoading={isLoading}
        onClickFunc={makeTx}
      />
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
      color: "#FFB999",
    },
  },
}));

export default BatchLiquidity;
