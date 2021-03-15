import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import Fortmatic from "fortmatic";
import NavHeader from "./NavHeader";
import Home from "./Home";
import Creator from "./Creator";
import Fan from "./Fan";

const initialState = {
  provider: null,
  connectedWallet: "",
  ethTransactions: [],
};

const providerOptions = {
  fortmatic: {
    package: Fortmatic, // required
    options: {
      key: process.env.FORTMATIC_KEY, // required
    },
  },
};

interface IProps {

}

interface IState {
  provider?: any;
  connectedWallet?: string;
  ethTransactions?: Array<any>; 
}

class App extends React.Component<IProps, IState> {
  web3Modal;

  constructor(props: any) {
    super(props);
    this.state = { ...initialState };
    this.web3Modal = new Web3Modal({
      cacheProvider: true, // optional
      providerOptions, // required
    });
    this.openWalletConnectModal = this.openWalletConnectModal.bind(this);
    this.disconnectWallet = this.disconnectWallet.bind(this);
  }

  async openWalletConnectModal() {
    let provider = this.state.provider;
    if (!provider) {
      const providerConnect = await this.web3Modal.connect();
      provider = new ethers.providers.Web3Provider(providerConnect); 
    }

    if (!this.state.connectedWallet) {
      this.setState({
        connectedWallet: "",
      });
      const fetchURL =
        "https://api.etherscan.io/api?module=account&action=txlist&address=" +
        this.state.connectedWallet +
        "&startblock=0&endblock=99999999&sort=desc&apikey=" +
        process.env.ETHERSCAN_KEY;
      const response = await fetch(fetchURL);
      const responseJson = await response.json();
      // First 5 transactions only.
      this.setState({ ethTransactions: responseJson.result.slice(0, 5) });
    }
  }

  async disconnectWallet() {
    await this.web3Modal.clearCachedProvider();
    this.setState({ ...initialState });
  }

  

  render() {
    return (
      <BrowserRouter>
        <NavHeader
          connectedWallet={this.state.connectedWallet}
          onWalletConnectClick={this.openWalletConnectModal}
          onDisconnectWallet={this.disconnectWallet}
        />
        <Switch>
          <Route exact path="/" component={Home} />
          <Route
            path={["/fan/:creatorAddress", "/fan"]}
            render={(routeProps) => (
              <Fan
                {...routeProps}
                provider={this.state.provider}
                connectedWallet={this.state.connectedWallet}
                onWalletConnectClick={this.openWalletConnectModal}
              />
            )}
          />
          <Route
            path="/creator"
            render={(routeProps) => (
              <Creator
                {...routeProps}
                connectedWallet={this.state.connectedWallet}
                ethTransactions={this.state.ethTransactions}
                provider={this.state.provider}
                onWalletConnectClick={this.openWalletConnectModal}
              />
            )}
          />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
