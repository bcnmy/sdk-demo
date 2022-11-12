import React, { useCallback, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
import { formatBalance, showErrorMessage } from "../../utils";

const Assets: React.FC = () => {
  const classes = useStyles();
  const { getSmartAccountBalance, isFetchingBalance, balance } =
    useSmartAccountContext();

  const getSmartAccountBalanceFunc = useCallback(async () => {
    const error = await getSmartAccountBalance();
    if (error) showErrorMessage(error);
  }, [getSmartAccountBalance]);

  useEffect(() => {
    getSmartAccountBalanceFunc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isFetchingBalance) {
    return (
      <div className={classes.containerLoader}>
        <img src="/logo.svg" className={classes.animateBlink} alt="" />
      </div>
    );
  }

  return (
    <main className={classes.main}>
      <h1 className="title">Biconomy SDK Demo</h1>
      {/* <button onClick={getSmartAccountBalanceFunc}>get balance</button> */}
      <div className={classes.container}>
        <div className={classes.element}>
          <div className={classes.balance}>
            <p>Tokens</p>
          </div>
          {balance.alltokenBalances.map((token, ind) => (
            <div className={classes.balance} key={ind}>
              <div className={classes.tokenTitle}>
                <img className={classes.img} alt="logo" src={token.logo_url} />
                <p>{token.contract_ticker_symbol}</p>
              </div>
              <p>{formatBalance(token.balance, token.contract_decimals)}</p>
            </div>
          ))}
        </div>
        <div className={classes.element} style={{ height: 250 }}>
          <div className={classes.balance}>
            <p>My Balance</p>
          </div>

          <p style={{ fontSize: 30, textAlign: "center", padding: 40 }}>
            $ {balance.totalBalanceInUsd}
          </p>
        </div>
      </div>
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
    fontSize: 28,
  },
  container: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
  },
  element: {
    width: "45%",
    height: "70vh",
    overflowY: "auto",
    border: "2px solid #145374",
    borderLeft: "solid 3px #145374",
    boxShadow: "5px 5px 0px #145374",
    borderRadius: 10,
  },
  balance: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 25,
    padding: "0 10px",
    borderBottom: "1px solid #145374",
  },
  tokenTitle: {
    display: "flex",
    flexFlow: "reverse",
    alignItems: "center",
  },
  img: {
    width: 35,
    height: 35,
    border: "1px solid #145374",
    borderRadius: "50%",
    marginRight: 10,
  },
  containerLoader: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "80vh",
    justifyContent: "center",
    alignItems: "center",
  },
  animateBlink: {
    animation: "$bottom_up 2s linear infinite",
    "&:hover": {
      transform: "scale(1.2)",
    },
  },
  "@keyframes bottom_up": {
    "0%": {
      transform: "translateY(0px)",
    },
    "25%": {
      transform: "translateY(20px)",
    },
    "50%": {
      transform: "translateY(0px)",
    },
    "75%": {
      transform: "translateY(-20px)",
    },
    "100%": {
      transform: "translateY(0px)",
    },
  },
}));

export default Assets;
