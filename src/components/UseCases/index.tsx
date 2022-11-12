import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AddLPForward from "./Forward/AddLP";
import SwapForward from "./Forward/Swap";
import SingleTransaction from "./AA/SingleTransaction"
import BatchTransaction from "./AA/BatchTransaction"
import BatchDeployTxn from "./AA/BatchDeployTxn"

interface Props {
  useCase: number;
  setUseCase: any;
}

const UseCases: React.FC<Props> = ({ useCase, setUseCase }) => {
  const classes = useStyles();

  if (useCase === 1) {
    return <AddLPForward />;
  } else if (useCase === 2) {
    return <SwapForward />;
  } else if (useCase === 3) {
    return <SingleTransaction />;
  } else if (useCase === 4) {
    return <BatchTransaction />;
  } else if (useCase === 5) {
    return <BatchDeployTxn />;
  }

  return (
    <main className={classes.main}>
      <h3 className={classes.subTitle}>{"Smart Account Use Cases"}</h3>
      <p>User can do multiple things using smart account like → </p>
      <ul>
        <li>Forward flow - Paying gas fee in any token.</li>
        <li>
          Bundle - Batching multiple different transaction in a single transaction.
        </li>
        <li>
          Account Abstraction - Send gasless transaction ~ batch them and let paymaster pay for your transaction.
        </li>
      </ul>
      <p style={{ marginBottom: 25 }}>
        Here we have added some use cases from which users can test out the sdk.
      </p>

      <hr />
      <p className={classes.subSubTitle}>
        Forward Flow
      </p>

      <div className={classes.container}>
        <div className={classes.element} onClick={() => setUseCase(1)}>
          <p className={classes.text} style={{ textAlign: "left" }}>
            Batch User Pays:
          </p>
          <ul>
            <li style={{ marginBottom: 10 }}>
              Deploy Wallet if not already deployed.
            </li>
            <li style={{ marginBottom: 10 }}>Approve USDC.</li>
            <li style={{ marginBottom: 10 }}>
              Provide USDC Liquidity on Hyphen.
            </li>
          </ul>
        </div>

        <div className={classes.element} onClick={() => setUseCase(2)}>
          <p className={classes.text} style={{ textAlign: "left" }}>
            Batch User Pays:
          </p>
          <ul>
            <li style={{ marginBottom: 10 }}>Approve USDC.</li>
            <li style={{ marginBottom: 10 }}>Swap USDC to WETH on Uniswap</li>
          </ul>
        </div>
      </div>

      <hr />
      <p className={classes.subSubTitle}>
        AA ~ Gasless Flow
      </p>
      <div className={classes.container}>
        <div className={classes.element} onClick={() => setUseCase(3)}>
          <p className={classes.text} style={{ textAlign: "left" }}>
            Gasless transaction:
          </p>
          <ul>
            <li style={{ marginBottom: 10 }}>Approve USDC.</li>
            <li style={{ marginBottom: 10 }}>
              Send tx (paid via paymaster).
            </li>
          </ul>
        </div>

        <div className={classes.element} onClick={() => setUseCase(4)}>
          <p className={classes.text} style={{ textAlign: "left" }}>
            Batch Gasless:
          </p>
          <ul>
            <li style={{ marginBottom: 10 }}>Approve USDC.</li>
            <li style={{ marginBottom: 10 }}>Provide USDC Liquidity on Hyphen.</li>
          </ul>
        </div>

        <div className={classes.element} onClick={() => setUseCase(5)}>
          <p className={classes.text} style={{ textAlign: "left" }}>
            Batch Gasless:
          </p>
          <ul>
            <li style={{ marginBottom: 10 }}>
              Deploy Wallet if not already deployed.
            </li>
            <li style={{ marginBottom: 10 }}>Approve USDC.</li>
            <li style={{ marginBottom: 10 }}>Provide USDC Liquidity on Hyphen.</li>
          </ul>
        </div>
      </div>
    </main>
  );
};

const useStyles = makeStyles(() => ({
  main: {
    margin: "auto",
    padding: "10px 40px",
    maxWidth: 1200,
    color: "#a0aec0",
  },
  subTitle: {
    fontFamily: "Rubik",
    color: "#fff",
    fontSize: 28,
  },
  subSubTitle: {
    fontFamily: "Rubik",
    color: "#BDC2FF",
    fontSize: 20,
    margin: 20
  },
  container: {
    width: "100%",
    display: "flex",
    marginBottom: 40,
    gap: 20,
    "@media (max-width: 699px)": {
      width: "90%",
      flexDirection: "column",
    },
  },
  element: {
    cursor: "pointer",
    width: "30%",
    backgroundColor: "#1a1e23",
    height: 180,
    filter: "drop-shadow(0px 2px 24px rgba(0, 0, 0, 0.1))",
    border: "2px solid #393E46",
    borderLeft: "solid 3px #393E46",
    boxShadow: "5px 5px 0px #393E46",
    borderRadius: 12,
    // height: "max-content",
    padding: 25,
    alignItems: "center",

    "@media (max-width: 699px)": {
      width: "100%",
      marginBottom: 20,
    },

    "&:hover": {
      boxShadow: "2px 2px 0px #000000",
      // transform: "translate(5px, 5px)",
    },
  },
  text: {
    fontSize: 20,
    color: "#fff",
    // wordBreak: "break-all",
  },
  subText: {
    fontSize: 14,
    padding: 10,
    backgroundColor: "#FF996647",
  },
}));

export default UseCases;
