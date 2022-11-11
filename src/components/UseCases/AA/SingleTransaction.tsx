import React from "react";
import { ethers } from "ethers";
import { makeStyles } from "@material-ui/core/styles";

import Button from "../../Button";
import { useWeb3AuthContext } from "../../../contexts/SocialLoginContext";
import { useSmartAccountContext } from "../../../contexts/SmartAccountContext";
import {
  configInfo as config,
  showSuccessMessage,
  showErrorMessage,
} from "../../../utils";

const SingleTransaction: React.FC = () => {
  const classes = useStyles();
  const { web3Provider } = useWeb3AuthContext();
  const { state: walletState, wallet } = useSmartAccountContext();

  const makeTx = async () => {
    if (!wallet || !walletState || !web3Provider) return;
    try {
      let smartAccount = wallet;
      const usdcContract = new ethers.Contract(
        config.usdc.address,
        config.usdc.abi,
        web3Provider
      );
      console.log('AA single txn')
      console.log('smartAccount.address ', smartAccount.address)
      const approveUSDCTx = await usdcContract.populateTransaction.approve(
        config.hyphenLP.address,
        ethers.BigNumber.from("1000000"),
        { from: smartAccount.address }
      );
      console.log(approveUSDCTx.data)
      const tx1 = {
        to: config.usdc.address,
        data: approveUSDCTx.data,
      };



      const txResponse = await smartAccount.sendGasLessTransaction({ transaction: tx1 });
      console.log('tx response')
      console.log(txResponse.hash) // Note! : for AA this will actually be a request id
      

      // check if tx is mined
      // web3Provider.once(txHash.hash, (transaction: any) => {
      //   // Emitted when the transaction has been mined
      //   console.log("txn_mined:", transaction);
      //   showSuccessMessage(`Transaction mined: ${txHash.hash}`);
      // });
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

      <p style={{marginBottom: 30}}>
        This is an example gasless transaction to approve USDC.
      </p>

      <Button title="Make transaction" onClickFunc={makeTx} />
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
    color: "#fff",
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

export default SingleTransaction;
