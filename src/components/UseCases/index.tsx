import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import AddLP from "./AddLP";

const UseCases: React.FC = () => {
  const classes = useStyles();
  const [useCase, setUseCase] = useState(0);

  useEffect(() => {
    setUseCase(0);
  }, []);

  if (useCase === 1) {
    return <AddLP />;
  }

  return (
    <main className={classes.main}>
      <h3 className={classes.subTitle}>{"[ < Use Cases Deploy > ]"}</h3>

      <div className={classes.container}>
        <div className={classes.element} onClick={() => setUseCase(1)}>
          <p className={classes.text}>
            Batch User Pays:
            <ul>
              <li>Deploy Wallet if not already deployed</li>
              {/*<li>Approve WETH</li>
              <li>Swap to USDC</li>*/}
              <li>Approve USDC</li>
              <li>Provide USDC Liquidity on Hyphen</li>
            </ul>
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
    textAlign: "center",
    marginBottom: 40,
  },
  container: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
  },
  element: {
    cursor: "pointer",
    width: "28%",
    border: "1px solid #D48158",
    borderRadius: 20,
    height: 200,
    padding: 15,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    wordBreak: "break-all",
  },
  subText: {
    fontSize: 14,
    padding: 10,
    backgroundColor: "#FF996647",
  },
}));

export default UseCases;
