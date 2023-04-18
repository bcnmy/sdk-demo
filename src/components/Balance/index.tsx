import React, { useCallback, useEffect } from "react";
import { makeStyles } from "@mui/styles";

import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
import { formatBalance, showErrorMessage } from "../../utils";

const Assets: React.FC = () => {
  const classes = useStyles();
  const { getSmartAccountBalance, isFetchingBalance, balance } =
    useSmartAccountContext();
  console.log("🚀 ~ file: index.tsx:10 ~ balance:", balance);

  const getSmartAccountBalanceFunc = useCallback(async () => {
    const error = await getSmartAccountBalance();
    if (error) showErrorMessage(error);
  }, [getSmartAccountBalance]);

  useEffect(() => {
    getSmartAccountBalanceFunc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // const FetchImage = async (token: any) => {
  //   return await fetch(token.logo_url, { method: "HEAD" })
  //     .then((res) => {
  //       if (res.ok) {
  //         return token.logo_url;
  //       } else {
  //         return null;
  //       }
  //     })
  //     .catch(
  //       (err) =>
  //         // <PaidIcon className={classes.img} />
  //         null
  //     );
  // };

  if (isFetchingBalance || balance.alltokenBalances.length === 0) {
    return (
      <div className={classes.containerLoader}>
        <img
          width={50}
          src="/logo.svg"
          className={classes.animateBlink}
          alt=""
        />
      </div>
    );
  }

  return (
    <main className={classes.main}>
      <h1 className={classes.subTitle}>Smart Account Balance</h1>
      {/* <button onClick={getSmartAccountBalanceFunc}>get balance</button> */}
      <div className={classes.container}>
        <div className={classes.element}>
          <div className={classes.balance}>
            <p>Tokens</p>
          </div>
          {balance.alltokenBalances.map((token, ind) => (
            <div className={classes.balance} key={ind}>
              <div className={classes.tokenTitle}>
                <img
                  className={classes.img}
                  src={token.logo_url}
                  onError={({ currentTarget }) => {
                    currentTarget.src =
                      "https://cdn.icon-icons.com/icons2/3947/PNG/512/cash_currency_money_finance_exchange_coin_bitcoin_icon_251415.png";
                  }}
                  alt=""
                />
                <p>{token.contract_ticker_symbol}</p>
              </div>
              <p>{formatBalance(token.balance, token.contract_decimals)}</p>
            </div>
          ))}
        </div>
        <div className={classes.element}>
          <div className={classes.balance}>
            <p>My Balance</p>
          </div>

          <p style={{ fontSize: 108, textAlign: "center", color: "#FFB999" }}>
            ${balance.totalBalanceInUsd}
          </p>
        </div>
      </div>
    </main>
  );
};

const useStyles = makeStyles(() => ({
  main: {
    maxWidth: 1600,
    padding: "10px 40px",
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  subTitle: {
    color: "#FFB999",
    fontSize: 36,
    margin: 0,
  },
  container: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    height: "100%",
    width: "100%",
  },
  element: {
    width: "100%",
    maxHeight: 600,
    height: 400,
    overflowY: "auto",
    border: "1px solid #5B3320",
    backgroundColor: "#151520",
    borderRadius: 12,
  },
  balance: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 25,
    padding: "0 10px",
    borderBottom: "1px solid #2C3333",
  },
  tokenTitle: {
    display: "flex",
    flexFlow: "reverse",
    alignItems: "center",
  },
  img: {
    width: 35,
    height: 35,
    border: "1px solid #2C3333",
    borderRadius: "50%",
    marginRight: 10,
  },
  containerLoader: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  animateBlink: {
    animation: "$blink 4s linear infinite",
  },
  "@keyframes blink": {
    "0%": {
      opacity: "0",
    },
    "25%": {
      opacity: "100",
    },
    "50%": {
      opacity: "0",
    },
    "75%": {
      opacity: "100",
    },
    "100%": {
      opacity: "0",
    },
  },
}));

export default Assets;
