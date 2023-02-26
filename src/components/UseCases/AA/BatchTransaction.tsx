import React from "react";
import { BigNumber, ethers } from "ethers";
import { makeStyles } from "@material-ui/core/styles";

import Button from "../../Button";
import { useWeb3AuthContext } from "../../../contexts/SocialLoginContext";
import { useSmartAccountContext } from "../../../contexts/SmartAccountContext";
import {
  configInfo as config,
  showSuccessMessage,
  showErrorMessage,
} from "../../../utils";
import { TransactionReceipt } from '@ethersproject/providers'

const iFace = new ethers.utils.Interface(config.usdc.abi);

const BatchTransaction: React.FC = () => {
  const classes = useStyles();
  const { web3Provider } = useWeb3AuthContext();
  const { state: walletState, wallet } = useSmartAccountContext();

  const makeTx = async () => {
    console.log('I am Batch Trx');
    
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

      console.log('tx1 ', tx1);
      

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
      const transferCallData = iFace.encodeFunctionData('transfer', [config.hyphenLP.address, ethers.BigNumber.from("1000000")])
      const tx2 = {
        to: config.usdc.address,
        data: transferCallData,
      };
      console.log('transfer call');
      console.log('tx1 ', tx2);

      // todo check this for hyphen LP on Mumbai!
      txs.push(tx2);

      // const trx3 = {
      //   to: '0x4281d6888D7a3A6736B0F596823810ffBd7D4808',
      //   value: ethers.BigNumber.from("10000000000000000000"),
      //   data: '0x'
      // }

      // txs.push(trx3);

      const txResponse = await smartAccount.sendGaslessTransactionBatch({ transactions: txs });
      console.log("txResponse", txResponse);
      if(txResponse) {
        let receipt: TransactionReceipt = await txResponse.wait(2);
        let txn = {
          state: "Pending",
          txHash: receipt.transactionHash,
          explorerLink: `https://mumbai.polygonscan.com/tx/${receipt.transactionHash}`
        }
        // transactions.push(txn);
        // setTransactions(transactions);
        console.log("Receipt: ", receipt);
        console.log(txn)
        /*if(smartAccountAddress) {
          getTokenBalances(smartAccountAddress);
        }*/
      }


      // const response = await smartAccount.deployWalletUsingPaymaster();
      console.log(txResponse)
      showSuccessMessage(`Transaction sent: ${txResponse.hash}`);

      // check if tx is mined
      // Review
      // Note: txResponse.hash here is requestId and not transactionHash
      web3Provider.once(txResponse.hash, (transaction: any) => {
        // Emitted when the transaction has been mined
        console.log("txn_mined:", transaction);
        showSuccessMessage(`Transaction mined: ${txResponse.hash}`);
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