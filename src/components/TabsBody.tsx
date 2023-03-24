/* eslint-disable react/jsx-pascal-case */
import * as React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@mui/styles";
import { styled, Theme, CSSObject } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import HomeIcon from "@mui/icons-material/Home";
import SavingsIcon from "@mui/icons-material/Savings";
import TokenIcon from "@mui/icons-material/Token";
import EvStationIcon from "@mui/icons-material/EvStation";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import BurstModeIcon from "@mui/icons-material/BurstMode";
import LegendToggleIcon from "@mui/icons-material/LegendToggle";
import GamesIcon from "@mui/icons-material/Games";
import ContactlessIcon from '@mui/icons-material/Contactless';
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import Onboarding from "./Onboarding/index";
import Navbar from "./Navbar";
import Assets from "./Balance";
import Collapse from "@mui/material/Collapse/Collapse";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import Faucet from "./Faucet";
// Account Abstraction
import AccountAbstraction from "./AA";
import MintNft from "./AA/MintNft";
import BatchMintNft from "./AA/BatchMintNft";
import AllowErc20 from "./AA/AllowErc20";
import BatchLiquidity from "./AA/BatchLiquidity";
// Forward
import ForwardFlow from "./Forward";
import MintNftForward from "./Forward/MintNft";
import BatchLiquidityForward from "./Forward/BatchLiquidity";

const drawerWidth = 260;
const onboardingList = [
  {
    name: "Home",
    icon: <HomeIcon />,
  },
  {
    name: "Faucet",
    icon: <SavingsIcon />,
  },
  {
    name: "Balance",
    icon: <AccountBalanceWalletIcon />,
  },
];

const AAList = [
  {
    name: "Allow ERC20 Token",
    icon: <TokenIcon />,
  },
  {
    name: "Mint NFT",
    icon: <InsertPhotoIcon />,
  },
  {
    name: "Batch Add Liquidity",
    icon: <GamesIcon />,
  },
  {
    name: "Batch Mint NFT",
    icon: <BurstModeIcon />,
  },
];

const ForwardList = [
  {
    name: "Batch Add Liquidity",
    icon: <GamesIcon />,
  },
  {
    name: "Mint NFT",
    icon: <InsertPhotoIcon />,
  },
];

const TabsBody = () => {
  const classes = useStyles();
  const [pageIndex, setPageIndex] = React.useState(0);
  const [useCase, setUseCase] = React.useState(0);
  const [open, setOpen] = React.useState(true);
  const [isAAOpen, setIsAAOpen] = React.useState(false);
  const [isForwardOpen, setIsForwardOpen] = React.useState(false);

  const handleChange = (event: any, newValue: any) => {
    setUseCase(0);
    setPageIndex(newValue);
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Navbar open={open} handleDrawerOpen={handleDrawerOpen} />
      {/* Left Panel */}
      <Drawer
        variant="permanent"
        open={open}
        className={classes.drawer}
        sx={{
          "& .MuiDrawer-paper": {
            backgroundColor: "#14171a",
            color: "#fff",
            borderRight: "2px solid #323a43",
          },
          "& .MuiTypography-root": {
            fontSize: 14,
          },
        }}
      >
        <DrawerHeader>
          <img src="img/logo.svg" alt="logo" className={classes.logo} />

          <IconButton onClick={handleDrawerClose} sx={{ color: "#fff" }}>
            <LegendToggleIcon />
          </IconButton>
        </DrawerHeader>
        <Divider style={{ borderColor: "#323a43", borderWidth: 1 }} />
        <List
          sx={{
            display: "block",
            "& .MuiListItemButton-root": {
              "&:hover": {
                backgroundColor: "#1a1f23",
              },
            },
          }}
        >
          {onboardingList.map((ele, index) => (
            <ListItem key={ele.name} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                }}
                onClick={(e: any) => handleChange(e, index)}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                    color: pageIndex === index ? "#1da1f2" : "#fff",
                  }}
                >
                  {ele.icon}
                </ListItemIcon>
                <ListItemText
                  primary={ele.name}
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        {/* AA Left Panel */}
        <Divider style={{ borderColor: "#323a43", borderWidth: 1 }} />
        <List
          sx={{
            display: "block",
            "& .MuiListItemButton-root": {
              "&:hover": {
                backgroundColor: "#1a1f23",
              },
            },
          }}
        >
          <ListItemButton
            onClick={(e: any) => {
              setIsAAOpen(!isAAOpen);
              handleChange(e, 3);
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : "auto",
                justifyContent: "center",
                color: pageIndex === 3 ? "#1da1f2" : "#fff",
              }}
            >
              <EvStationIcon />
            </ListItemIcon>
            <ListItemText
              primary="Account Abstraction"
              sx={{ opacity: open ? 1 : 0 }}
            />
            {isAAOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={isAAOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {AAList.map((ele, index) => (
                <ListItem
                  key={ele.name}
                  disablePadding
                  sx={{ display: "block" }}
                >
                  <ListItemButton
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? "initial" : "center",
                      px: 2.5,
                    }}
                    onClick={(e: any) => handleChange(e, index + 4)}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : "auto",
                        justifyContent: "center",
                        color: pageIndex === index + 4 ? "#1da1f2" : "#fff",
                      }}
                    >
                      {ele.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={ele.name}
                      sx={{ opacity: open ? 1 : 0 }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
        </List>
        {/* Forward Left Panel */}
        <Divider style={{ borderColor: "#323a43", borderWidth: 1 }} />
        <List
          sx={{
            display: "block",
            "& .MuiListItemButton-root": {
              "&:hover": {
                backgroundColor: "#1a1f23",
              },
            },
          }}
        >
          <ListItemButton
            onClick={(e: any) => {
              setIsForwardOpen(!isForwardOpen);
              handleChange(e, 8);
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : "auto",
                justifyContent: "center",
                color: pageIndex === 8 ? "#1da1f2" : "#fff",
              }}
            >
              <ContactlessIcon />
            </ListItemIcon>
            <ListItemText
              primary="Pay gas in ERC20"
              sx={{ opacity: open ? 1 : 0 }}
            />
            {isForwardOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={isForwardOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {ForwardList.map((ele, index) => (
                <ListItem
                  key={ele.name}
                  disablePadding
                  sx={{ display: "block" }}
                >
                  <ListItemButton
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? "initial" : "center",
                      px: 2.5,
                    }}
                    onClick={(e: any) => handleChange(e, index + 9)}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : "auto",
                        justifyContent: "center",
                        color: pageIndex === index + 9 ? "#1da1f2" : "#fff",
                      }}
                    >
                      {ele.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={ele.name}
                      sx={{ opacity: open ? 1 : 0 }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
        </List>
      </Drawer>

      <DrawerHeader />

      {/* content menu */}
      <TabPanel value={pageIndex} index={0}>
        <Onboarding setValue={setPageIndex} />
      </TabPanel>
      <TabPanel value={pageIndex} index={1}>
        <Faucet />
      </TabPanel>
      <TabPanel value={pageIndex} index={2}>
        <Assets />
      </TabPanel>
      <TabPanel value={pageIndex} index={3}>
        <AccountAbstraction setUseCase={setUseCase} useCase={useCase} />
      </TabPanel>
      <TabPanel value={pageIndex} index={4}>
        <AllowErc20 />
      </TabPanel>
      <TabPanel value={pageIndex} index={5}>
        <MintNft />
      </TabPanel>
      <TabPanel value={pageIndex} index={6}>
        <BatchLiquidity />
      </TabPanel>
      <TabPanel value={pageIndex} index={7}>
        <BatchMintNft />
      </TabPanel>

      <TabPanel value={pageIndex} index={8}>
        <ForwardFlow setUseCase={setUseCase} useCase={useCase} />
      </TabPanel>
      <TabPanel value={pageIndex} index={9}>
        <BatchLiquidityForward />
      </TabPanel>
      <TabPanel value={pageIndex} index={10}>
        <MintNftForward />
      </TabPanel>
    </Box>
  );
};

function TabPanel(props: any) {
  const classes = useStyles();
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      className={classes.tabpanel}
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}
TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default TabsBody;

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    display: "flex",
    width: "100%",
    margin: "auto",
    height: "max-content",
    minHeight: "92vh",
    "@media (max-width:699px)": {
      flexDirection: "column",
    },
  },
  drawer: {
    backgroundColor: "#323a43",
  },
  logo: {
    width: "70%",
    margin: "auto",
  },
  tabs: {
    borderRight: `1.5px solid #323a43`,
    padding: "30px 10px",
    width: "15%",
    "@media (max-width:699px)": {
      width: "90%",
      margin: "auto",
    },
  },
  tabpanel: {
    width: "90%",
    marginTop: 66,
    "@media (max-width:699px)": {
      width: "100%",
      margin: "auto",
      marginTop: 66,
      minHeight: "80vh",
    },
  },
}));
