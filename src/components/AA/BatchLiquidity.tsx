import React, { useState } from "react";
import { makeStyles } from "@mui/styles";
import { Hex, encodeFunctionData, parseEther, parseUnits } from "viem";
import Button from "../Button";
import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
import {
  configInfo as config,
  showSuccessMessage,
  showErrorMessage,
} from "../../utils";
import { PaymasterMode } from "@biconomy-devx/account";

const BatchLiquidity: React.FC = () => {
  const classes = useStyles();
  const { smartAccount, scwAddress } = useSmartAccountContext();
  const [loading, setLoading] = useState(false);

  const makeTx = async () => {
    if (!scwAddress || !smartAccount) return;
    try {
      setLoading(true);

      const approveCallData = encodeFunctionData({
        abi: config.usdc.abi,
        functionName: "approve",
        args: [config.hyphenLP.address, parseEther("0.001", "gwei")],
      });
      const tx1 = {
        to: config.usdc.address as Hex,
        value: BigInt(0),
        data: approveCallData,
      };

      const addLiquidityData = encodeFunctionData({
        abi: config.hyphenLP.abi,
        functionName: "addTokenLiquidity",
        args: [config.usdc.address, parseEther("0.001", "gwei")],
      });
      const tx2 = {
        to: config.hyphenLP.address as Hex,
        value: BigInt(0),
        data: addLiquidityData,
      };

      let { waitForTxHash } = await smartAccount.sendTransaction([tx1, tx2], { paymasterServiceData: { mode: PaymasterMode.SPONSORED } });
      const { transactionHash } = await waitForTxHash();
      console.log("txHash", transactionHash);
      showSuccessMessage(
        `Added batch liquidity ${transactionHash}`,
        transactionHash
      );
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setLoading(false);
      showErrorMessage(err.message || "Error in sending the transaction");
    }
  };

  return (
    <main className={classes.main}>
      <p style={{ color: "#7E7E7E" }}>
        Use Cases {"->"} Gasless {"->"} USDC Liquidity on Hyphen
      </p>

      <h3 className={classes.subTitle}>Approve and Add Liquidity in Hyphen</h3>

      <p>
        This magic bundle will approve USDC then provide the USDC liquidity to
        Hyphen Pool
      </p>

      <h3 className={classes.h3Title}>Transaction Batched</h3>
      <ul>
        <li>Approve USDC</li>
        <li>Provide USDC Liquidity on Hyphen</li>
      </ul>

      <Button
        title="Do transaction (One Click LP)"
        isLoading={loading}
        onClickFunc={makeTx}
      />
    </main>
  );
};

const useStyles = makeStyles(() => ({
  main: {
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
      color: "#FF9551",
    },
  },
}));

export default BatchLiquidity;
