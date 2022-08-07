import React, { useState } from "react";
import { AppBar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useWeb3Context } from "../contexts/Web3Context";
import { ellipseAddress } from "../utils";


const Navbar = () => {
  const classes = useStyles();
  const { connectWeb3, disconnect, address } = useWeb3Context();
  const [showLogout, setShowLogout] = useState(false);

  const toggleLogoutButton = () => {
    showLogout ? setShowLogout(false) : setShowLogout(true);
  };

  const disconnectWallet = () => {
    disconnect();
    setShowLogout(false);
  };

  return (
    <AppBar position="static" classes={{ root: classes.nav }}>
      <div className={classes.flexContainer}>
        <img src="img/logo.svg" alt="logo" className={classes.logo} />
        <button
          className={classes.walletBtn}
          onClick={address ? toggleLogoutButton : connectWeb3}
        >
          <div>{address ? ellipseAddress(address, 6) : "Connect Wallet"}</div>
          {showLogout && (
            <div onClick={disconnectWallet} className={classes.logout}>
              Logout
            </div>
          )}
        </button>
      </div>
    </AppBar>
  );
};

const useStyles = makeStyles((theme: any) => ({
  nav: {
    height: "70px",
    boxShadow: "none",
    background: "inherit",
    marginBottom: "40px",
    borderBottom: "2px solid black",
    "@media (max-width:1100px)": {
      padding: "0 20px",
    },
  },
  flexContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "auto",
    padding: 0,
    maxWidth: 1080,
    width: "100%",
  },
  logo: {
    height: "25px",
    marginTop: 2,
  },
  walletBtnContainer: {
    display: "flex",
    position: "relative",
    marginLeft: 20,
    alignItems: "center",
  },
  walletBtn: {
    background: "#FFB4B4",
    position: "relative",
    cursor: "pointer",
    border: 0,
    outline: "none",
    boxShadow: "5px 5px 0px #100F0F",
    height: 40,
    lineHeight: "36px",
    padding: "18px 8px",
    display: "flex",
    alignItems: "center",
    color: "black",

    "@media (max-width:599px)": {
      padding: 0,
    },

    "&:hover": {
      backgroundColor: "#FFC4C4",
    },

    "& div": {
      "@media (max-width:599px)": {
        margin: 0,
        display: "none",
      },
    },
  },
  logout: {
    position: "absolute",
    backgroundColor: "#e3e3e3",
    color: "black",
    width: "100%",
    height: "36px",
    lineHeight: "36px",
    padding: "0 18px",
    borderRadius: "18px",
    top: "40px",
    right: "0",
    cursor: "pointer",
    textAlign: "center",
    fontWeight: 600,

    "&:hover": {
      color: "white",
      backgroundColor: "#000",
    },

    [theme.breakpoints.down("xs")]: {
      width: "auto",
    },
  },
}));

export default Navbar;
