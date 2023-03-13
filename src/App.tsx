import React from "react";
import { makeStyles } from "@mui/styles";
import { ToastContainer } from "react-toastify";
import TabsBody from "./components/TabsBody";
import { useSmartAccountContext } from "./contexts/SmartAccountContext";
import { useWeb3AuthContext } from "./contexts/SocialLoginContext";
import Button from "./components/Button";

const App: React.FC = () => {
  const classes = useStyles();
  const { connect, address, loading: eoaWalletLoading } = useWeb3AuthContext();
  const { loading } = useSmartAccountContext();

  if (!address) {
    return (
      <div
        className={classes.bgCover}
        style={{ display: "flex", justifyContent: "center" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
            maxWidth: 600,
            margin: "auto",
            textAlign: "center",
          }}
        >
          <h1 className={classes.title}>Biconomy SDK</h1>
          <p className={classes.subTitle}>
            Solve complex UX challenges with customisable SDK modules in
            minutes.
          </p>
          <Button
            title="Get Started"
            onClickFunc={connect}
            isLoading={eoaWalletLoading}
            style={{
              fontSize: 20,
              padding: "25px 15px",
              border: 0,
              borderRadius: 50,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={classes.bgCover}>
      {loading ? (
        <div className={classes.container}>
          <img src="/logo.svg" className={classes.animateBlink} alt="" />
        </div>
      ) : (
        <TabsBody />
      )}
      <ToastContainer />
    </div>
  );
};

const useStyles = makeStyles(() => ({
  bgCover: {
    backgroundColor: "#14171a",
    backgroundSize: "cover",
    width: "100%",
    minHeight: "100vh",
    color: "#fff",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "80vh",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    marginBottom: 10,
    fontSize: 50,
    background: "linear-gradient(90deg, #12ECB8 -2.21%, #00B4ED 92.02%)",
    "-webkit-background-clip": "text",
    "-webkit-text-fill-color": "transparent",
  },
  subTitle: {
    fontSize: 22,
    marginBottom: 30,
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

export default App;
