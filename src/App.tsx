import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { ToastContainer } from "react-toastify";
import Navbar from "./components/Navbar";
import TabsBody from "./components/TabsBody";
import { useSmartAccountContext } from "./contexts/SmartAccountContext";
import { useWeb3Context } from "./contexts/Web3Context";
import Button from "./components/Button";

const App: React.FC = () => {
  const classes = useStyles();
  const { connectWeb3, address } = useWeb3Context();
  const { loading } = useSmartAccountContext();
  console.log(address);
  if (!address) {
    return (
      <div
        className={classes.bgCover}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "30vh"
        }}
      >
        <h1>Biconomy SDK Demo</h1>
        <Button title="Get Started" onClickFunc={connectWeb3} />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className={classes.bgCover}>
      <Navbar />
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
    backgroundColor: "#fffef6",
    // backgroundImage: `url(img/bg.png)`,
    // backgroundSize: "cover",
    width: "100%",
    minHeight: "100vh",
  },
  container: {
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

export default App;
