import React, { useState } from "react";
import { ethers } from "ethers";
import { makeStyles } from "@mui/styles";

import Button from "../Button";
import { useWeb3AuthContext } from "../../contexts/SocialLoginContext";
import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
import {
  configInfo as config,
  showErrorMessage,
  showInfoMessage,
  showSuccessMessage,
} from "../../utils";
import {
  IHybridPaymaster,
  PaymasterMode,
  SponsorUserOperationDto,
} from "@biconomy/paymaster";

const Faucet: React.FC = () => {
  const classes = useStyles();
  const { web3Provider } = useWeb3AuthContext();
  const { smartAccount, scwAddress } = useSmartAccountContext();
  const [address, setAddress] = useState(scwAddress);

  const makeTx = async () => {
    if (!smartAccount || !web3Provider || !scwAddress) {
      showErrorMessage("Please connect your wallet");
      return;
    }
    showInfoMessage("Initiating Faucet...");
    try {
      const faucetContract = new ethers.Contract(
        config.faucet.address,
        config.faucet.abi,
        web3Provider
      );
      const faucetTxData = await faucetContract.populateTransaction.drip(
        address
      );
      const tx1 = {
        to: config.faucet.address,
        data: faucetTxData.data,
      };
      let userOp = await smartAccount.buildUserOp([tx1]);
      const biconomyPaymaster =
        smartAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>;
      let paymasterServiceData: SponsorUserOperationDto = {
        mode: PaymasterMode.SPONSORED,
      };
      const paymasterAndDataResponse =
        await biconomyPaymaster.getPaymasterAndData(
          userOp,
          paymasterServiceData
        );
      userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;
      const userOpResponse = await smartAccount.sendUserOp(userOp);
      console.log("userOpHash", userOpResponse);
      const { receipt } = await userOpResponse.wait(1);
      console.log("txHash", receipt.transactionHash);
      showSuccessMessage(
        `Tokens sent ${receipt.transactionHash}`,
        receipt.transactionHash
      );
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
