import React, { useState } from "react";
import { makeStyles } from "@mui/styles";
import { Hex, encodeFunctionData } from "viem";

import Button from "../Button";
import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
import {
  configInfo as config,
  showErrorMessage,
  showInfoMessage,
  showSuccessMessage,
} from "../../utils";

const Faucet: React.FC = () => {
  const classes = useStyles();
  const { smartAccount, scwAddress } = useSmartAccountContext();
  const [address, setAddress] = useState(scwAddress);

  const makeTx = async () => {
    if (!smartAccount || !scwAddress) {
      showErrorMessage("Please connect your wallet");
      return;
    }
    showInfoMessage("Initiating Faucet...");
    try {
      const faucetTxData = encodeFunctionData({
        abi: config.faucet.abi,
        functionName: "drip",
        args: [address as Hex],
      });
      const tx1 = {
        to: config.faucet.address as Hex,
        value: BigInt(0),
        data: faucetTxData,
      };
      let userOpResponse = await smartAccount.sendTransaction(tx1);
      console.log("userOpHash", userOpResponse);
      const { transactionHash } = await userOpResponse.waitForTxHash();
      console.log("txHash", transactionHash);
      showSuccessMessage(`Tokens sent ${transactionHash}`, transactionHash);
    } catch (error: any) {
      console.error(error);
      showErrorMessage(error.message);
    }
  };

  return (
    <main className={classes.main}>
      <h3 className={classes.subTitle}>Faucet</h3>

      <p>
        Get USDC and USDT test tokens. We will airdrop these tokens to the SCW
        address so you can test the SDK.
      </p>

      <h3 className={classes.h3Title}>You can also change the address</h3>

      <input
        type="text"
        placeholder="0x...."
        value={scwAddress}
        onChange={(e) => setAddress(e.target.value)}
        className={classes.input}
      />

      <Button title="Get tokens" onClickFunc={makeTx} />
    </main>
  );
};

const useStyles = makeStyles(() => ({
  main: {
    padding: "10px 40px",
    width: "100%",
    height: "100%",
    gap: 20,
    color: "#e6e6e6",
    display: "flex",
    flexDirection: "column",
    alignItems: "start",
    // justifyContent: "center",
  },
  subTitle: {
    color: "#FFB999",
    fontSize: 36,
    margin: 0,
  },
  h3Title: {
    color: "#FFB999",
    margin: 0,
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
  input: {
    maxWidth: 350,
    width: "100%",
    padding: "12px 12px",
    color: "#e6e6e6",
    outline: "1px solid #5B3320",
    backgroundColor: "#151520",
    borderRadius: 6,
    border: "none",
  },
}));

export default Faucet;
