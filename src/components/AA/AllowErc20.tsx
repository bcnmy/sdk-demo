import React, { useState } from "react";
import { ethers } from "ethers";
import { makeStyles } from "@mui/styles";

import Button from "../Button";
import { useWeb3AuthContext } from "../../contexts/SocialLoginContext";
import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
import {
  configInfo as config,
  showErrorMessage,
  showSuccessMessage,
} from "../../utils";

const AllowErc20: React.FC = () => {
  const classes = useStyles();
  const { web3Provider } = useWeb3AuthContext();
  const { state: walletState, wallet } = useSmartAccountContext();
  const [ercAddress, setErcAddress] = useState(config.usdc.address);

  const makeTx = async () => {
    if (!wallet || !walletState || !web3Provider) return;
    try {
      let smartAccount = wallet;
      const usdcContract = new ethers.Contract(
        config.usdc.address,
        config.usdc.abi,
        web3Provider
      );
      console.log("smartAccount.address ", smartAccount.address);
      const approveUSDCTx = await usdcContract.populateTransaction.approve(
        config.hyphenLP.address,
        ethers.BigNumber.from("1000000"),
        { from: smartAccount.address }
      );
      console.log(approveUSDCTx.data);
      const tx1 = {
        to: config.usdc.address,
        data: approveUSDCTx.data,
      };

      const txResponse = await smartAccount.sendGaslessTransaction({
        transaction: tx1,
      });
      console.log("userOpHash", txResponse);
      const txHash = await txResponse.wait();
      console.log("txHash", txHash);
      showSuccessMessage(
        `Approved USDC ${txHash.transactionHash}`,
        txHash.transactionHash
      );
    } catch (err: any) {
      console.error(err);
      showErrorMessage(err.message || "Error in sending the transaction");
    }
  };

  return (
    <main className={classes.main}>
      <p style={{ color: "#7E7E7E" }}>
        Use Cases {"->"} Gasless {"->"} USDC Approve
      </p>

      <h3 className={classes.subTitle}>Approve USDC Gasless Flow</h3>

      <p>This is single transaction to give allowance on an ERC-20 contract.</p>
      <h3 className={classes.h3Title}>USDC erc-20 contract to approve</h3>

      <input
        type="text"
        placeholder="0x...."
        value={ercAddress}
        onChange={(e) => setErcAddress(e.target.value)}
        className={classes.input}
      />

      <Button title="Approve ERC-20" onClickFunc={makeTx} />
    </main>
  );
};

const useStyles = makeStyles(() => ({
  main: {
    margin: "auto",
    padding: "10px 40px",
  },
  subTitle: {
    fontFamily: "Rubik",
    color: "#BDC2FF",
    fontSize: 28,
  },
  h3Title: {
    color: "#fff",
  },
  input: {
    maxWidth: 350,
    width: "100%",
    padding: "12px 10px",
    margin: "8px 0",
    color: "#fff",
    boxSizing: "border-box",
    outlineColor: "#181818",
    backgroundColor: "#282A3A",
    border: "none",
    marginBottom: 20,
  },
}));

export default AllowErc20;
