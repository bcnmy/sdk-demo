/* eslint-disable react/jsx-pascal-case */
import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

import Onboarding from "./Onboarding/index";
import Assets from "./Assets/index";
import UseCases from "./UseCases/index";
import { tabs } from "../setup";
import ApproveForward from "./UseCases/Forward/Approve";
import AddLPForward from "./UseCases/Forward/AddLP";
import SingleTransaction from "./UseCases/AA/SingleTransaction";
import BatchTransaction from "./UseCases/AA/BatchTransaction";
import BatchDeployTxn from "./UseCases/AA/BatchDeployTxn";

function App() {
  const [value, setValue] = React.useState(0);
  const [useCase, setUseCase] = React.useState(0);

  const handleChange = (event: any, newValue: any) => {
    setUseCase(0);
    setValue(newValue);
  };

  const renderComponent = () => {
    switch (useCase) {
      case 0:
        return <Onboarding setValue={setUseCase} />;
      case 1:
        return <Assets />;
      case 2:
        return <UseCases useCase={0} setUseCase={setUseCase} />;
      case 3:
        return <ApproveForward />;
      case 4:
        return <AddLPForward />;
      case 5:
        return <SingleTransaction />;
      case 6:
        return <BatchTransaction />;
      case 7:
        return <BatchDeployTxn />;
      default:
        return <UseCases useCase={0} setUseCase={setUseCase} />;
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-start px-4">
      <div className="w-full h-full px-4 bg-blue-10 rounded-2xl flex items-start justify-start">
        <nav className="w-[15%] border-r border-blue-24 py-8 rounded-l-2xl h-full flex flex-col gap-4 items-center justify-start">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`${
                useCase === index
                  ? "text-textActive hover:text-textActive"
                  : "text-white hover:text-textPrimary"
              } w-full h-16 flex items-center justify-center transition-colors`}
              onClick={() => setUseCase(index)}
            >
              {tab.emoji + " " + tab.name}
            </button>
          ))}
        </nav>
        <div className="w-full transition-all rounded-r-2xl h-full p-8">
          {renderComponent()}
        </div>
      </div>
    </div>
  );
}

export default App;
