import React, { useState } from "react";
import { ethers } from "ethers";
import { makeStyles } from "@mui/styles";

import Button from "../../Button";
import { useWeb3AuthContext } from "../../../contexts/SocialLoginContext";
import { useSmartAccountContext } from "../../../contexts/SmartAccountContext";
import {
  configInfo as config,
  showInfoMessage,
  showErrorMessage,
} from "../../../utils";

const ApproveForward: React.FC = () => {
  const classes = useStyles();
  const { web3Provider } = useWeb3AuthContext();
  const { state: walletState, wallet } = useSmartAccountContext();
  const [ercAddress, setErcAddress] = useState(config.usdc.address);

  const makeTx = async () => {
    if (!wallet || !walletState || !web3Provider) return;
    if (!ethers.utils.isAddress(ercAddress)) {
      showErrorMessage("Invalid Address");
      return;
    }
    try {
      showInfoMessage("Building transaction...");
      let smartAccount = wallet;

      const usdcContract = new ethers.Contract(
        ercAddress,
        config.usdc.abi,
        web3Provider
      );
      const approveUSDCTx = await usdcContract.populateTransaction.approve(
        config.hyphenLP.address,
        ethers.BigNumber.from("1000000")
      );
      const tx = {
        to: config.usdc.address,
        data: approveUSDCTx.data,
      };

      // prepare refund txn batch before so that we have accurate token gas price
      const feeQuotes = await smartAccount.prepareRefundTransaction({
        transaction: tx,
      });
      console.log("prepareRefundTransaction", feeQuotes);
      showInfoMessage("Sign the transaction");

      // making transaction with version, set feeQuotes[1] usdc payment
      const transaction = await smartAccount.createRefundTransaction({
        transaction: tx,
        feeQuote: feeQuotes[1],
      });
      console.log("transaction", transaction);

      // send transaction internally calls signTransaction and sends it to connected relayer
      const txHash = await smartAccount.sendTransaction({
        tx: transaction,
        gasLimit: {
          hex: "0x1E8480",
          type: "hex",
        },
      });
      console.log("txHash", txHash);
    } catch (err: any) {
      console.error(err);
      showErrorMessage(err.message || "Error in sending the transaction");
    }
  };

  return (
    <main className={classes.main}>
      <p style={{ color: "#7E7E7E" }}>
        Use Cases {"->"} Forward {"->"} USDC Approve Transaction
      </p>

      <h3 className={classes.subTitle}>Approve Transaction</h3>

      <p>This is single transaction to approve an ERC-20 contract.</p>
      <p>Gas fee goes via user's smart contract wallet in ERC20 tokens.</p>

      <h3 className={classes.h3Title}>Enter any erc-20 contract to approve</h3>

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
  input: {
    maxWidth: 350,
    width: "100%",
    padding: "12px 20px",
    margin: "8px 0",
    boxSizing: "border-box",
    outlineColor: "#BDC2FF",
    backgroundColor: "#EFF5F5",
    border: "none",
    marginBottom: 20,
  },
}));

export default ApproveForward;
