/* eslint-disable react/jsx-pascal-case */
import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

import Onboarding from "./Onboarding/index";
import Assets from "./Assets/index";
import UseCases from "./UseCases/index";

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

function a11yProps(index: any) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    // backgroundColor: theme.palette.background.paper,
    display: "flex",
    width: "100%",
    // maxWidth: 1200,
    margin: "auto",
    height: "max-content",
    minHeight: "92vh",
    // border: "1px solid #D48158",
    // borderRadius: 5,
    "@media (max-width:699px)": {
      flexDirection: "column",
    },
  },
  tabs: {
    borderRight: `3px solid #3E497A`,
    padding: "30px 10px",
    width: "15%",
    "@media (max-width:699px)": {
      width: "90%",
      margin: "auto",
    },
  },
  tabpanel: {
    width: "85%",
    "@media (max-width:699px)": {
      width: "90%",
      margin: "auto",
      minHeight: "80vh",
    },
  },
}));

function App() {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);
  const [useCase, setUseCase] = React.useState(0);

  const handleChange = (event: any, newValue: any) => {
    setUseCase(0);
    setValue(newValue);
  };

  return (
    <div className={classes.root}>
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs"
        className={classes.tabs}
      >
        <Tab label="Onboarding" {...a11yProps(0)} />
        <Tab label="Assets" {...a11yProps(1)} />
        <Tab label="Use Cases" {...a11yProps(2)} />
      </Tabs>

      <TabPanel value={value} index={0}>
        <Onboarding setValue={setValue} />
      </TabPanel>

      <TabPanel value={value} index={1}>
        <Assets />
      </TabPanel>

      <TabPanel value={value} index={2}>
        <UseCases setUseCase={setUseCase} useCase={useCase} />
      </TabPanel>
    </div>
  );
}

export default App;
