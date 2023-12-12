import React, { useState } from "react";
import { ethers } from "ethers";
import { makeStyles } from "@mui/styles";
import { PaymasterMode } from "@biconomy/paymaster";
import Button from "../Button";
import { useEthersSigner } from "../../contexts/ethers";
import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
import {
  configInfo as config,
  showSuccessMessage,
  showErrorMessage,
} from "../../utils";

const iFace = new ethers.utils.Interface(config.usdc.abi);

const BatchLiquidity: React.FC = () => {
  const classes = useStyles();
  const signer = useEthersSigner();
  const { smartAccount, scwAddress } = useSmartAccountContext();
  const [loading, setLoading] = useState(false);

  const makeTx = async () => {
    if (!scwAddress || !smartAccount || !signer) return;
    try {
      setLoading(true);
      const txs = [];

      const approveCallData = iFace.encodeFunctionData("approve", [
        config.hyphenLP.address,
        ethers.BigNumber.from("1000000"),
      ]);
      const tx1 = {
        to: config.usdc.address,
        data: approveCallData,
      };
      txs.push(tx1);

      const hyphenContract = new ethers.Contract(
        config.hyphenLP.address,
        config.hyphenLP.abi,
        signer
      );
      const addLiquidityData = hyphenContract.interface.encodeFunctionData("addTokenLiquidity", [config.usdc.address,
        ethers.BigNumber.from("1000000")])
      const tx2 = {
        to: config.hyphenLP.address,
        data: addLiquidityData,
      };
      txs.push(tx2);

      let userOp = await smartAccount.buildUserOp(txs, {
        paymasterServiceData: {
          mode: PaymasterMode.SPONSORED,
        },
      });
      const userOpResponse = await smartAccount.sendUserOp(userOp);
      console.log("userOpHash", userOpResponse);
      const { transactionHash } = await userOpResponse.waitForTxHash();
      console.log("txHash", transactionHash);
      showSuccessMessage(`Added batch liquidity ${transactionHash}`, transactionHash);
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
