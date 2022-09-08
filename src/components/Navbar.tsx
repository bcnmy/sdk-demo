import { useState } from "react";
import {
  AppBar,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useWeb3Context } from "../contexts/Web3Context";
import { useSmartAccountContext } from "../contexts/SmartAccountContext";
import Button from "./Button";
import {
  copyToClipBoard,
  ellipseAddress,
  showErrorMessage,
  showSuccessMessage,
} from "../utils";

const Navbar = () => {
  const classes = useStyles();
  const { disconnect } = useWeb3Context();
  const { getSmartAccount, state, loading, version, versions, setVersion } =
    useSmartAccountContext();
  const [showLogout, setShowLogout] = useState(false);

  const toggleLogoutButton = () => {
    showLogout ? setShowLogout(false) : setShowLogout(true);
  };

  const getSmartAccountFunc = async () => {
    const error = await getSmartAccount();
    if (error) showErrorMessage(error);
    else showSuccessMessage("Fetched smart account state");
  };

  const disconnectWallet = () => {
    disconnect();
    setShowLogout(false);
  };

  return (
    <AppBar position="static" classes={{ root: classes.nav }}>
      <div className={classes.flexContainer}>
        <img src="img/logo.svg" alt="logo" className={classes.logo} />
        <div className={classes.walletBtnContainer}>
          <Button
            title={
              state ? ellipseAddress(state.address, 8) : "init SmartAccount"
            }
            onClickFunc={toggleLogoutButton}
            isLoading={loading}
          >
            {showLogout && (
              <div className={classes.modal}>
                <div
                  onClick={() => copyToClipBoard(state?.address || "")}
                  className={classes.element}
                >
                  📁 Copy Address
                </div>
                <div onClick={getSmartAccountFunc} className={classes.element}>
                  &#8633; Init Smart wallet
                </div>
                {/* <div onClick={toggleLogoutButton} className={classes.element}>
                  &uarr; Close Modal
                </div> */}
              </div>
            )}
          </Button>
          <FormControl className={classes.formControl}>
            <InputLabel id="demo-simple-select-label">Version</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={version}
              onChange={(event) => setVersion(event.target.value as string)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>

              {versions.map((ver) => (
                <MenuItem value={ver}>{ver}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button title="Logout" onClickFunc={disconnectWallet} />
        </div>
      </div>
    </AppBar>
  );
};

const useStyles = makeStyles((theme: any) => ({
  nav: {
    height: "70px",
    boxShadow: "none",
    background: "inherit",
    // marginBottom: "40px",
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
    marginLeft: 20,
    alignItems: "center",
    gap: 10,
  },
  modal: {
    position: "absolute",
    top: "12px",
    right: 0,
    backgroundColor: "#FFB4B4",
    color: "black",
    width: "100%",
    // height: "36px",
    lineHeight: "36px",
    padding: "10px",
    borderRadius: 10,
    cursor: "pointer",
    textAlign: "center",
    fontWeight: 600,
    transform: "translate(10%, 35%)",

    [theme.breakpoints.down("xs")]: {
      width: "auto",
    },
  },
  element: {
    width: "100%",
    // padding: "0 18px",
    borderRadius: 10,

    "&:hover": {
      color: "white",
      backgroundColor: "#000",
    },
  },
  formControl: {
    margin: theme.spacing(1),
    width: 72,
  },
}));

export default Navbar;
