import React, { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { makeStyles } from "@mui/styles";
import {
  IHybridPaymaster,
  PaymasterMode,
  SponsorUserOperationDto,
} from "@biconomy/paymaster";

import Button from "../Button";
import { useWeb3AuthContext } from "../../contexts/SocialLoginContext";
import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
import {
  configInfo as config,
  showErrorMessage,
  showSuccessMessage,
} from "../../utils";

const MintErc20: React.FC = () => {
  const classes = useStyles();
  const { web3Provider } = useWeb3AuthContext();
  const { smartAccount, scwAddress } = useSmartAccountContext();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  const getBalance = useCallback(async () => {
    if (!scwAddress || !web3Provider) return;
    const erc20Contract = new ethers.Contract(
      config.terc20.address,
      config.terc20.abi,
      web3Provider
    );
    const count = await erc20Contract.balanceOf(scwAddress);
    console.log("count", Number(count));
    setBalance(Number(count));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getBalance();
  }, [getBalance, web3Provider]);

  const makeTx = async () => {
    if (!scwAddress || !web3Provider || !smartAccount) return;
    try {
      setLoading(true);
      const erc20Contract = new ethers.Contract(
        config.terc20.address,
        config.terc20.abi,
        web3Provider
      );
      const amountGwei = ethers.utils.parseEther("100");
      const data = erc20Contract.interface.encodeFunctionData("mint", [
        scwAddress,
        amountGwei,
      ]);
      const tx = {
        to: config.terc20.address,
        data: data,
      };
      let userOp = await smartAccount.buildUserOp([tx]);
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
        `Minted ERC20 ${receipt.transactionHash}`,
        receipt.transactionHash
      );
      setLoading(false);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      getBalance();
    } catch (err: any) {
      console.error(err);
      setLoading(false);
      showErrorMessage(err.message || "Error in sending the transaction");
    }
  };

  return (
    <main className={classes.main}>
      <p style={{ color: "#7E7E7E" }}>
        Use Cases {"->"} Gasless {"->"} Mint ERC-20
      </p>

      <h3 className={classes.subTitle}>Mint ERC20 Gasless Flow</h3>

      <p>This is single transaction to mint an test ERC-20 contract.</p>

      <p>
        Test ERC20 Token: {config.terc20.address}{" "}
        <span style={{ fontSize: 13, color: "#FFB4B4" }}>
          (same of goerli, mumbai, polygon)
        </span>
      </p>
      <p style={{ marginBottom: 30, marginTop: 30, fontSize: 24 }}>
        ERC20 Balance in SCW:{" "}
        {balance === null ? (
          <p style={{ color: "#7E7E7E", display: "contents" }}>fetching...</p>
        ) : (
          ethers.utils.formatEther(balance.toString())
        )}
      </p>

      <Button title="Mint ERC-20" isLoading={loading} onClickFunc={makeTx} />
    </main>
  );
};

const useStyles = makeStyles(() => ({
  main: {
    padding: "10px 40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "start",
    justifyContent: "center",
  },
  subTitle: {
    color: "#FFB999",
    fontSize: 36,
    margin: 0,
  },
  h3Title: {
    color: "#e6e6e6",
  },
  input: {
    maxWidth: 350,
    width: "100%",
    padding: "12px 10px",
    margin: "8px 0",
    color: "#e6e6e6",
    boxSizing: "border-box",
    outlineColor: "#181818",
    backgroundColor: "#282A3A",
    border: "none",
    marginBottom: 20,
  },
}));

export default MintErc20;
