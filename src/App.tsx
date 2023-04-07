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
      <div className={classes.bgCover}>
        <div className={classes.container}>
          <h1 className={classes.title}>
          <img width={35} style={
            {
              marginRight: 20,
            }
          } src="/logo.svg" alt="" />
            Biconomy SDK</h1>
          <p className={classes.subTitle}>
            Solve complex UX challenges with customisable SDK modules in
            minutes.
          </p>
          <Button
            title="Get Started"
            onClickFunc={connect}
            isLoading={eoaWalletLoading}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={classes.bgCover}>
      <TabsBody loading={loading} />
      <ToastContainer position="bottom-left" newestOnTop theme="dark" />
    </div>
  );
};

const useStyles = makeStyles(() => ({
  bgCover: {
    width: "100vw",
    height: "100vh",
    background: "linear-gradient(120.85deg, #3F2E27 23.78%, #0E1117 68.7%)",
    display: "flex",
    color: "#e6e6e6",
    justifyContent: "start",
    alignItems: "center",
    padding: "0px 20px",
  },
  container: {
    width: "60vw",
    height: "60vh",
    backgroundColor: "#151520",
    border: "1px solid #5B3320",
    padding: "32px",
    borderRadius: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "start",
    justifyContent: "center",
    gap: 20,
  },
  title: {
    margin: 0,
    fontSize: 50,
    color: "#ffb999",
  },
  subTitle: {
    fontSize: 22,
    margin: 0,
  },
}));

export default App;
