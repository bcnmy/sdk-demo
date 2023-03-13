import React, { useState } from "react";
// import { ethers } from "ethers";
import { makeStyles } from "@mui/styles";

import Button from "../Button";
// import { useWeb3AuthContext } from "../../contexts/SocialLoginContext";
import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
// import {
//   configInfo as config,
//   showInfoMessage,
//   showErrorMessage,
// } from "../../utils";

const Faucet: React.FC = () => {
  const classes = useStyles();
  // const { address, web3Provider } = useWeb3AuthContext();
  const { state: walletState } = useSmartAccountContext();
  const [scwAddress, setScwAddress] = useState(
    (walletState && walletState.address) || ""
  );

  const makeTx = async () => {};

  return (
    <main className={classes.main}>
      <h3 className={classes.subTitle}>Faucet</h3>

      <p>Get USDC and USDT test tokens.</p>
      <p>We will airdrop these tokens to the SCW address so you can test the SDK.</p>

      <h3 className={classes.h3Title}>You can change the address</h3>

      <input
        type="text"
        placeholder="0x...."
        value={scwAddress}
        onChange={(e) => setScwAddress(e.target.value)}
        className={classes.input}
      />

      <Button title="Get tokens" onClickFunc={makeTx} />
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

export default Faucet;
