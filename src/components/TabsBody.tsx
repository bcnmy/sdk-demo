import { ExpandLess, ExpandMore } from "@mui/icons-material"
import ContactlessIcon from "@mui/icons-material/Contactless"
import EvStationIcon from "@mui/icons-material/EvStation"
import FiberNewIcon from "@mui/icons-material/FiberNew"
import GamesIcon from "@mui/icons-material/Games"
import HomeIcon from "@mui/icons-material/Home"
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto"
import SavingsIcon from "@mui/icons-material/Savings"
import Box from "@mui/material/Box"
import Collapse from "@mui/material/Collapse/Collapse"
import CssBaseline from "@mui/material/CssBaseline"
import MuiDrawer from "@mui/material/Drawer"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import { type CSSObject, type Theme, styled } from "@mui/material/styles"
import { makeStyles } from "@mui/styles"
import PropTypes from "prop-types"
/* eslint-disable react/jsx-pascal-case */
import * as React from "react"
import AccountAbstraction from "./AA"
import MintNft from "./AA/MintNft"
import Faucet from "./Faucet"
import ForwardFlow from "./Forward"
import MintNftForward from "./Forward/MintNft"
import CreateBatchSession from "./Modules/CreateBatchSession"
import CreateDanSession from "./Modules/CreateDanSession"
import CreateSession from "./Modules/CreateSession"
import Navbar from "./Navbar"
import Onboarding from "./Onboarding/index"

const drawerWidth = 320
const onboardingList = [
  {
    name: "Home",
    icon: <HomeIcon />
  },
  {
    name: "Faucet",
    icon: <SavingsIcon />
  }
  // {
  //   name: "Balance",
  //   icon: <AccountBalanceWalletIcon />,
  // },
]

const AAList = [
  {
    name: "Mint NFT",
    icon: <InsertPhotoIcon />
  }
]

const ForwardList = [
  {
    name: "Mint NFT",
    icon: <InsertPhotoIcon />
  }
]

const SessionList = [
  {
    name: "Single Session",
    icon: <GamesIcon />
  }
]

const SessionRouterList = [
  {
    name: "Batch Session",
    icon: <GamesIcon />
  }
]

const SessionDanList = [
  {
    name: "Dan Session",
    icon: <GamesIcon />
  }
]

const TabsBody = ({ loading }: { loading: boolean }) => {
  const classes = useStyles()
  const [pageIndex, setPageIndex] = React.useState(0)
  const [useCase, setUseCase] = React.useState(0)
  const [open, setOpen] = React.useState(true)
  const [isAAOpen, setIsAAOpen] = React.useState(true)
  const [isForwardOpen, setIsForwardOpen] = React.useState(true)
  const [isSessionOpen, setIsSessionOpen] = React.useState(true)
  const [isSessionRouterOpen, setIsSessionRouterOpen] = React.useState(true)
  const [isDanOpen] = React.useState(true)

  const handleChange = (_: any, newValue: any) => {
    if (newValue >= 4 && newValue <= 7) {
      setIsAAOpen(true)
    }
    setUseCase(0)
    setPageIndex(newValue)
  }

  const handleDrawerOpen = () => {
    setOpen(true)
  }

  return loading ? (
    <div className={classes.container}>
      <img width={50} src="/logo.svg" className={classes.animateBlink} alt="" />
    </div>
  ) : (
    <Box sx={{ display: "flex", width: "100%", height: "calc(100vh - 80px)" }}>
      <CssBaseline />
      <Navbar open={open} handleDrawerOpen={handleDrawerOpen} />
      {/* Left Panel */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          "& .MuiDrawer-paper": {
            background: "rgba(0,0,0,0)",
            color: "#e6e6e6",
            border: 0,
            borderRight: `1.5px solid rgba(255,255,255,0.1)`
          },
          "& .MuiTypography-root": {
            fontSize: 14
          }
        }}
      >
        <DrawerHeader>
          <img src="/logo.svg" alt="logo" width={25} />
        </DrawerHeader>
        {/* <Divider style={{ borderColor: "#323a43", borderWidth: 1 }} /> */}
        <List
          sx={{
            display: "block"
          }}
        >
          {onboardingList.map((ele, index) => (
            <ListItem key={ele.name} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5
                }}
                onClick={(e: any) => handleChange(e, index)}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                    color: pageIndex === index ? "#FFB999" : "#e6e6e6"
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
        {/* <Divider style={{ borderColor: "#323a43", borderWidth: 1 }} /> */}
        <List
          sx={{
            display: "block"
          }}
        >
          <ListItemButton
            onClick={(e: any) => {
              setIsAAOpen(!isAAOpen)
              handleChange(e, 2)
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : "auto",
                justifyContent: "center",
                color: pageIndex === 2 ? "#FFB999" : "#e6e6e6"
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
                      px: 2.5
                    }}
                    onClick={(e: any) => handleChange(e, index + 3)}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : "auto",
                        justifyContent: "center",
                        color: pageIndex === index + 3 ? "#FFB999" : "#e6e6e6"
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
        <List
          sx={{
            display: "block"
          }}
        >
          <ListItemButton
            onClick={(e: any) => {
              setIsForwardOpen(!isForwardOpen)
              handleChange(e, 5)
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : "auto",
                justifyContent: "center",
                color: pageIndex === 5 ? "#FFB999" : "#e6e6e6"
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
                      px: 2.5
                    }}
                    onClick={(e: any) => handleChange(e, index + 6)}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : "auto",
                        justifyContent: "center",
                        color: pageIndex === index + 6 ? "#FFB999" : "#e6e6e6"
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

        {/* Session Left Panel */}
        <List
          sx={{
            display: "block"
          }}
        >
          <ListItemButton
            onClick={(e: any) => {
              setIsSessionOpen(!isSessionOpen)
              handleChange(e, 8)
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : "auto",
                justifyContent: "center",
                color: pageIndex === 8 ? "#FFB999" : "#e6e6e6"
              }}
            >
              <FiberNewIcon />
            </ListItemIcon>
            <ListItemText
              primary="Session Keys Demo"
              sx={{ opacity: open ? 1 : 0 }}
            />
            {isSessionOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={isSessionOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {SessionList.map((ele, index) => (
                <ListItem
                  key={ele.name}
                  disablePadding
                  sx={{ display: "block" }}
                >
                  <ListItemButton
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? "initial" : "center",
                      px: 2.5
                    }}
                    onClick={(e: any) => handleChange(e, index + 9)}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : "auto",
                        justifyContent: "center",
                        color: pageIndex === index + 9 ? "#FFB999" : "#e6e6e6"
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
          <List sx={{ display: "block" }}>
            <ListItemButton
              onClick={(e: any) => {
                setIsSessionRouterOpen(!isSessionRouterOpen)
                handleChange(e, 8)
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : "auto",
                  justifyContent: "center",
                  color: pageIndex === 12 ? "#FFB999" : "#e6e6e6"
                }}
              >
                <FiberNewIcon />
              </ListItemIcon>
              <ListItemText
                primary="Batched Session Router Demo"
                sx={{ opacity: open ? 1 : 0 }}
              />
              {isSessionRouterOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={isSessionRouterOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {SessionRouterList.map((ele, index) => (
                  <ListItem
                    key={ele.name}
                    disablePadding
                    sx={{ display: "block" }}
                  >
                    <ListItemButton
                      sx={{
                        minHeight: 48,
                        justifyContent: open ? "initial" : "center",
                        px: 2.5
                      }}
                      onClick={(e: any) => handleChange(e, index + 12)}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 3 : "auto",
                          justifyContent: "center",
                          color:
                            pageIndex === index + 12 ? "#FFB999" : "#e6e6e6"
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

          <List sx={{ display: "block" }}>
            <ListItemButton
              onClick={(e: any) => {
                setIsSessionRouterOpen(!isDanOpen)
                handleChange(e, 8)
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : "auto",
                  justifyContent: "center",
                  color: pageIndex === 13 ? "#FFB999" : "#e6e6e6"
                }}
              >
                <FiberNewIcon />
              </ListItemIcon>
              <ListItemText primary="Dan Demo" sx={{ opacity: open ? 1 : 0 }} />
              {isDanOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={isDanOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {SessionDanList.map((ele, index) => (
                  <ListItem
                    key={ele.name}
                    disablePadding
                    sx={{ display: "block" }}
                  >
                    <ListItemButton
                      sx={{
                        minHeight: 48,
                        justifyContent: open ? "initial" : "center",
                        px: 2.5
                      }}
                      onClick={(e: any) => handleChange(e, index + 13)}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 3 : "auto",
                          justifyContent: "center",
                          color: pageIndex === index + 1 ? "#FFB999" : "#e6e6e6"
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
        </List>
      </Drawer>

      {/* content menu */}
      <TabPanel value={pageIndex} index={0}>
        <Onboarding setValue={setPageIndex} />
      </TabPanel>
      <TabPanel value={pageIndex} index={1}>
        <Faucet />
      </TabPanel>
      {/* <TabPanel value={pageIndex} index={2}>
        <Assets />
      </TabPanel> */}
      <TabPanel value={pageIndex} index={2}>
        <AccountAbstraction
          pageIndexChange={handleChange}
          setUseCase={setUseCase}
          useCase={useCase}
        />
      </TabPanel>
      {/* <TabPanel value={pageIndex} index={4}>
        <MintErc20 />
      </TabPanel> */}
      <TabPanel value={pageIndex} index={3}>
        <MintNft />
      </TabPanel>
      {/* <TabPanel value={pageIndex} index={7}>
        <BatchMintNft />
      </TabPanel> */}

      <TabPanel value={pageIndex} index={5}>
        <ForwardFlow
          pageIndexChange={handleChange}
          setUseCase={setUseCase}
          useCase={useCase}
        />
      </TabPanel>
      <TabPanel value={pageIndex} index={6}>
        <MintNftForward />
      </TabPanel>

      <TabPanel value={pageIndex} index={8}>
        {/* <SessionFlow
          pageIndexChange={handleChange}
          setUseCase={setUseCase}
          useCase={useCase}
        /> */}
      </TabPanel>
      <TabPanel value={pageIndex} index={9}>
        <CreateSession />
      </TabPanel>
      <TabPanel value={pageIndex} index={12}>
        <CreateBatchSession />
      </TabPanel>
      <TabPanel value={pageIndex} index={13}>
        <CreateDanSession />
      </TabPanel>
    </Box>
  )
}

function TabPanel(props: any) {
  const classes = useStyles()
  const { children, value, index, ...other } = props

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
  )
}
TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired
}

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen
  }),
  overflowX: "hidden"
})

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`
  }
})

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  width: "100%",
  justifyContent: "space-between",
  padding: theme.spacing(0, 2),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar
}))

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open"
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme)
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme)
  })
}))

export default TabsBody

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    display: "flex",
    width: "100%",
    margin: "auto",
    height: "max-content",
    minHeight: "92vh",
    "@media (max-width:699px)": {
      flexDirection: "column"
    }
  },
  container: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
    justifyContent: "center"
  },
  tabs: {
    borderRight: `1.5px solid #323a43`,
    padding: "30px 10px",
    width: "15%",
    "@media (max-width:699px)": {
      width: "90%",
      margin: "auto"
    }
  },
  tabpanel: {
    width: "100%",
    height: "100%",
    "@media (max-width:699px)": {
      width: "100%",
      margin: "auto",
      minHeight: "80vh"
    }
  },
  animateBlink: {
    animation: "$blink 4s linear infinite"
  },
  "@keyframes blink": {
    "0%": {
      opacity: "0"
    },
    "25%": {
      opacity: "100"
    },
    "50%": {
      opacity: "0"
    },
    "75%": {
      opacity: "100"
    },
    "100%": {
      opacity: "0"
    }
  }
}))
