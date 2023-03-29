import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import ApproveForward from "./Forward/Approve";
import AddLPForward from "./Forward/AddLP";
// import SwapUniswap from "./Forward/Swap"
import SwapForward from "./Forward/Swap";
import SingleTransaction from "./AA/SingleTransaction";
import BatchTransaction from "./AA/BatchTransaction";
import BatchDeployTxn from "./AA/BatchDeployTxn";

interface Props {
  useCase: number;
  setUseCase: any;
}

const UseCases: React.FC<Props> = ({ useCase, setUseCase }) => {
  const classes = useStyles();

  if (useCase === 1) {
    return <ApproveForward />;
  } else if (useCase === 2) {
    return <AddLPForward />;
  } else if (useCase === 3) {
    return <SwapForward />;
  } else if (useCase === 4) {
    return <SingleTransaction />;
  } else if (useCase === 5) {
    return <BatchTransaction />;
  } else if (useCase === 6) {
    return <BatchDeployTxn />;
  }

  return (
    <main className="w-full h-full overflow-hidden flex flex-col items-start justify-start gap-8">
      <h1 className="text-4xl text-textPrimary">{"Smart Account Use Cases"}</h1>
      <div className="flex flex-col gap-2 text-white">
        <p>User can do multiple things using smart account like: </p>
        <ul className="ml-8 flex list-disc flex-col">
          <li>Forward flow - Paying gas fee in any token.</li>
          <li>
            Bundle - Batching multiple different transaction in a single
            transaction.
          </li>
          <li>
            Account Abstraction - Send gasless transaction ~ batch them and let
            paymaster pay for your transaction.
          </li>
        </ul>
      </div>
      <div className="flex w-full overflow-scroll pb-20 gap-8 items-start justify-start">
        <div className="w-1/2 flex flex-col gap-4">
          <h2 className="text-2xl mt-4 text-textPrimary">
            Forward Flow: <i>User's SCW pays in ERC20 </i>
          </h2>
          <div
            className="w-full p-8 cursor-pointer flex flex-col gap-4 items-start justify-start border-2 border-white hover:border-textPrimary transition-colors text-white border-dashed rounded-2xl"
            onClick={() => setUseCase(3)}
          >
            <h3 className="text-2xl text-textPrimary">
              Single transaction Forward:
            </h3>
            <ul className="ml-8 flex list-disc flex-col">
              <li>Arrpove any ERC20 contract</li>
              <li>Send tx (scw pays gas fee in USDC)</li>
            </ul>
          </div>

          <div
            className="w-full p-8 cursor-pointer flex flex-col gap-4 items-start justify-start border-2 border-white hover:border-textPrimary transition-colors text-white border-dashed rounded-2xl"
            onClick={() => setUseCase(4)}
          >
            <h3 className="text-2xl text-textPrimary">Batch User Pays:</h3>
            <ul className="ml-8 flex list-disc flex-col">
              <li>Deploy Wallet if not already deployed.</li>
              <li>Approve USDC.</li>
              <li>Provide USDC Liquidity on Hyphen.</li>
            </ul>
          </div>
        </div>
        <div className="w-1/2 flex flex-col gap-4">
          <h2 className="text-2xl mt-4 text-textPrimary">
            AA: <i>Gasless Flow, dapp pays tx fee </i>{" "}
          </h2>
          <div
            className="w-full p-8 cursor-pointer flex flex-col gap-4 items-start justify-start border-2 border-white hover:border-textPrimary transition-colors text-white border-dashed rounded-2xl"
            onClick={() => setUseCase(5)}
          >
            <h3 className="text-2xl text-textPrimary">Gasless transaction:</h3>
            <ul className="ml-8 flex list-disc flex-col">
              <li>Approve USDC.</li>
              <li>Send tx (paid via paymaster).</li>
            </ul>
          </div>
          

          <div
            className="w-full p-8 cursor-pointer flex flex-col gap-4 items-start justify-start border-2 border-white hover:border-textPrimary transition-colors text-white border-dashed rounded-2xl"
            onClick={() => setUseCase(6)}
          >
            <h3 className="text-2xl text-textPrimary">Batch Gasless:</h3>
            <ul className="ml-8 flex list-disc flex-col">
              <li>Approve USDC.</li>
              <li>Provide USDC Liquidity on Hyphen.</li>
            </ul>
          </div>

          <div
            className="w-full p-8 cursor-pointer flex flex-col gap-4 items-start justify-start border-2 border-white hover:border-textPrimary transition-colors text-white border-dashed rounded-2xl"
            onClick={() => setUseCase(7)}
          >
            <h3 className="text-2xl text-textPrimary">Deploy and Batch Gasless:</h3>
            <ul className="ml-8 flex list-disc flex-col">
              <li>Deploy Wallet if not already deployed.</li>
              <li>Approve USDC.</li>
              <li>Provide USDC Liquidity on Hyphen.</li>
            </ul>
          </div>
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
    fontStyle: "normal",
  },
  subSubTitle: {
    fontFamily: "Rubik",
    color: "#BDC2FF",
    fontSize: 20,
    margin: 20,
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
