import { useState } from "react";
import { AppBar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useWeb3AuthContext } from "../contexts/SocialLoginContext";
import { useSmartAccountContext } from "../contexts/SmartAccountContext";
import Button from "./Button";
import {
  copyToClipBoard,
  ellipseAddress,
  // showErrorMessage,
  // showSuccessMessage,
} from "../utils";

const Navbar = () => {
  const classes = useStyles();
  const { disconnect } = useWeb3AuthContext();
  const {
    // getSmartAccount,
    loading,
    selectedAccount,
    smartAccountsArray,
    setSelectedAccount,
  } = useSmartAccountContext();

  const [showModal, setShowModal] = useState(false);
  const toggleLogoutButton = () => {
    showModal ? setShowModal(false) : setShowModal(true);
  };

  // const getSmartAccountFunc = async () => {
  //   const error = await getSmartAccount();
  //   if (error) showErrorMessage(error);
  //   else showSuccessMessage("Fetched smart account state");
  // };

  const disconnectWallet = () => {
    disconnect();
    setShowModal(false);
  };

  return (
    <AppBar position="static" classes={{ root: classes.nav }}>
      <div className={classes.flexContainer}>
        <img src="img/logo.svg" alt="logo" className={classes.logo} />
        <div className={classes.walletBtnContainer}>
          {selectedAccount?.smartAccountAddress && (
            <p className={classes.btnTitle}>Smart Account Address</p>
          )}
          <Button
            title={
              selectedAccount
                ? ellipseAddress(selectedAccount.smartAccountAddress, 8)
                : "Connect Wallet"
            }
            onClickFunc={toggleLogoutButton}
            isLoading={loading}
            // style={{ marginTop: 6 }}
          >
            {showModal && (
              <div className={classes.modal}>
                {smartAccountsArray.length &&
                  smartAccountsArray.map((smartAcc, index) => (
                    <div className={classes.element} key={index}>
                      {/* <p className={classes.elementText}>v{smartAcc.version}</p> */}
                      <p
                        className={classes.elementText}
                        onClick={() => setSelectedAccount(smartAcc)}
                      >
                        {ellipseAddress(smartAcc.smartAccountAddress, 6)}
                      </p>
                      <p
                        onClick={() =>
                          copyToClipBoard(
                            selectedAccount?.smartAccountAddress || ""
                          )
                        }
                        className={classes.copyText}
                      >
                        📁
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </Button>
          {/* <FormControl className={classes.formControl}>
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
          </FormControl> */}
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
    borderBottom: "2px solid #393E46",
    "@media (max-width:1100px)": {
      padding: "0 20px",
    },
  },
  flexContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "auto",
    maxWidth: 1250,
    padding: "0 10px",
    // maxWidth: 1080,
    width: "90%",
  },
  logo: {
    height: "25px",
    marginTop: 2,
  },
  walletBtnContainer: {
    display: "flex",
    alignItems: "center",
    gap: 20,
  },
  btnTitle: {
    opacity: 0.56,
    fontSize: 12,
    position: "absolute",
    top: -10,
  },
  modal: {
    position: "absolute",
    top: 24,
    right: 10,
    backgroundColor: "#21325E",
    borderLeft: "2px solid #3E497A",
    borderRight: "2px solid #3E497A",
    boxShadow: "4px 5px #3E497A",
    width: "100%",
    // height: "36px",
    lineHeight: "36px",
    padding: "2 8px",
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
    padding: "0 5px",
    display: "flex",
    // border: "1px solid #F5E8E4",
    justifyContent: "space-between",
    borderRadius: 10,

    "&:hover": {
      backgroundColor: "#191F2A",
    },
  },
  elementText: {
    fontSize: 14,
    marginLeft: 5,
    marginRight: 5,
  },
  copyText: {
    margin: "auto",
    fontSize: 14,
    padding: "0 5px",
    "&:hover": {
      backgroundColor: "#2C3333",
    },
  },
  formControl: {
    margin: theme.spacing(1),
    width: 72,
  },
}));

export default Navbar;
