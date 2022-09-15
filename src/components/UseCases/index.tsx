import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AddLP from "./AddLP";

interface Props {
  useCase: number;
  setUseCase: any;
}

const UseCases: React.FC<Props> = ({ useCase, setUseCase }) => {
  const classes = useStyles();

  if (useCase === 1) {
    return <AddLP />;
  }

  return (
    <main className={classes.main}>
      <h3 className={classes.subTitle}>{"Smart Account Use Cases"}</h3>
      <p>User can do multiple things using smart account like → </p>
      <ul>
        <li>Paying gas fee in any token.</li>
        <li>
          Batching multiple different transaction in a single transaction.
        </li>
      </ul>
      <p style={{ marginBottom: 25 }}>
        Here we have added some use cases FROM which users can test out the sdk.
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

        <div className={classes.element} onClick={() => setUseCase(1)}>
          <p className={classes.text} style={{ textAlign: "left" }}>
            Batch User Pays:
          </p>
          <ul>
            <li style={{ marginBottom: 10 }}>Approve USDC.</li>
            <li style={{ marginBottom: 10 }}>
              Swap USDC to WETH
            </li>
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
  },
  subTitle: {
    fontFamily: "Rubik",
    fontSize: 24,
    // textAlign: "center",
  },
  container: {
    width: "100%",
    display: "flex",
    // justifyContent: "space-between",
    gap: 20,
    "@media (max-width: 699px)": {
      width: "90%",
      flexDirection: "column",
    },
  },
  element: {
    cursor: "pointer",
    width: "27%",
    border: "2px solid #FFC4C4",
    borderLeft: "solid 3px #FFC4C4",
    boxShadow: "5px 5px 0px #FFC4C4",
    borderRadius: 12,
    height: "max-content",
    padding: 25,
    justifyContent: "space-between",
    alignItems: "center",
    
    "@media (max-width: 699px)": {
      width: "100%",
      marginBottom: 20,
    },

    "&:hover": {
      boxShadow: "2px 2px 0px #FFC4C4",
      // transform: "translate(5px, 5px)",
    },
  },
  text: {
    fontSize: 18,
    // wordBreak: "break-all",
  },
  subText: {
    fontSize: 14,
    padding: 10,
    backgroundColor: "#FF996647",
  },
}));

export default UseCases;
