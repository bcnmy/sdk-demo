import { useState } from "react";
import { makeStyles } from "@mui/styles";
import { styled } from "@mui/material/styles";
import LegendToggleIcon from "@mui/icons-material/LegendToggle";
import IconButton from "@mui/material/IconButton";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import { useWeb3AuthContext } from "../contexts/SocialLoginContext";
import { useSmartAccountContext } from "../contexts/SmartAccountContext";
import Button from "./Button";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { copyToClipBoard, ellipseAddress } from "../utils";

type INavBar = {
  open: boolean;
  handleDrawerOpen: () => void;
};

const drawerWidth = 260;
interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Navbar = ({ open, handleDrawerOpen }: INavBar) => {
  const classes = useStyles();
  const { disconnect } = useWeb3AuthContext();
  const { loading, selectedAccount, smartAccountsArray, setSelectedAccount } =
    useSmartAccountContext();

  const [showModal, setShowModal] = useState(false);
  const toggleLogoutButton = () => {
    showModal ? setShowModal(false) : setShowModal(true);
  };

  const disconnectWallet = () => {
    disconnect();
    setShowModal(false);
  };

  return (
    <AppBar position="fixed" open={open} classes={{ root: classes.nav }}>
      <div className={classes.flexContainer}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerOpen}
          edge="start"
          sx={{
            marginRight: 5,
            ...(open && { display: "none" }),
          }}
        >
          <LegendToggleIcon />
        </IconButton>
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
                        <ContentCopyIcon
                          className={classes.copyIcon}
                          style={{
                            textAlign: "center",
                          }}
                        />
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </Button>
          <Button title="Logout" onClickFunc={disconnectWallet} />
        </div>
      </div>
    </AppBar>
  );
};

const useStyles = makeStyles((theme: any) => ({
  nav: {
    height: "80px",
    width: "100%",
    boxShadow: "none !important",
    background: "rgba(0,0,0,0) !important",
    "@media (max-width:1100px)": {
      padding: "0 20px",
    },
  },
  flexContainer: {
    display: "flex",
    justifyContent: "end",
    alignItems: "center",
    margin: "auto",
    // maxWidth: 1400,
    padding: "0 10px",
    width: "100%",
  },
  walletBtnContainer: {
    display: "flex",
    alignItems: "center",
    gap: 20,
  },
  btnTitle: {
    opacity: 0.75,
    fontSize: 10,
    margin: 0,
    position: "absolute",
    top: 4,
  },
  modal: {
    position: "absolute",
    top: 24,
    right: 0,
    backgroundColor: "#151520",
    border: "1px solid #5B3320",
    width: "100%",
    lineHeight: "36px",
    padding: "2 8px",
    borderRadius: 12,
    cursor: "pointer",
    textAlign: "center",
    fontWeight: 600,
    transform: "translate(0%, 35%)",

    [theme.breakpoints.down("xs")]: {
      width: "auto",
    },
  },
  element: {
    padding: "0 5px",
    color: "#e6e6e6",
    display: "flex",
    // border: "1px solid #F5E8E4",
    justifyContent: "space-between",
    borderRadius: 10,
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
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  formControl: {
    margin: theme.spacing(1),
    width: 72,
  },
  copyIcon: {
    color: "#e6e6e6",
    "&:hover": {
      color: "#ffb999",
    },
  },
}));

export default Navbar;
