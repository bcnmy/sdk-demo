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

const iFace = new ethers.utils.Interface(config.usdc.abi);

const BatchTransaction: React.FC = () => {
  const classes = useStyles();
  const { web3Provider } = useWeb3AuthContext();
  const { state: walletState, wallet } = useSmartAccountContext();

  const makeTx = async () => {
    if (!wallet || !walletState || !web3Provider) return;
    try {
      let smartAccount = wallet;
      const txs = []

      const approveCallData = iFace.encodeFunctionData('approve', [config.hyphenLP.address, ethers.BigNumber.from("1000000")])
      const tx1 = {
        to: config.usdc.address,
        data: approveCallData,
      };
      txs.push(tx1)

      const hyphenContract = new ethers.Contract(
        config.hyphenLP.address,
        config.hyphenLP.abi,
        web3Provider
      );
      const hyphenLPTx =
        await hyphenContract.populateTransaction.addTokenLiquidity(
          config.usdc.address,
          ethers.BigNumber.from("1000000"),
          {
            from: smartAccount.address
          }
        );
      const tx2 = {
        to: config.hyphenLP.address,
        data: hyphenLPTx.data,
      };
      // todo check this for hyphen LP on Mumbai!
      txs.push(tx2);

      const response = await smartAccount.sendGaslessTransactionBatch({ transactions: txs });

      // const response = await smartAccount.deployWalletUsingPaymaster();
      console.log(response)
      showSuccessMessage(`Transaction sent: ${response.hash}`);

      // check if tx is mined
      web3Provider.once(response.hash, (transaction: any) => {
        // Emitted when the transaction has been mined
        console.log("txn_mined:", transaction);
        showSuccessMessage(`Transaction mined: ${response.hash}`);
      });
    } catch (err: any) {
      console.error(err);
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

      <Button title="Do transaction (One Click LP)" onClickFunc={makeTx} />
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

export default BatchTransaction;