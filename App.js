import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';

export default class App extends React.Component {
  render() {
    return (
      <Panicoin />
    );
  }
}

class Panicoin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {bitcoinPrice: 0, bitcoinStatus: true};
    //const apiUrl = 'https://bitex.la/api-v1/rest/btc_usd/market/ticker';
    const apiUrl = 'https://www.bitstamp.net/api/ticker/';
    setInterval(() => {
      fetch(apiUrl)
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState(previousState => {
          const lastPrice = previousState.bitcoinPrice;
          const newPrice = responseJson.ask;
          console.log('New Ask Price: '+newPrice);
          return { bitcoinPrice: newPrice, bitcoinStatus: lastPrice <= newPrice};
        });
      });
    }, 3500);
  }
  render(){
    return (
      <View style={styles.container}>
        <Meme bitcoinStatus={this.state.bitcoinStatus}/>
        <Bitcoin bitcoinPrice={this.state.bitcoinPrice}/>
      </View>
    );
  }
}

class Meme extends React.Component {
  render(){
    const goodPics = [
      'https://media.giphy.com/media/xUOxeVWzTVwAnOm7m0/giphy.gif'
    ];
    const badPics = [
      'https://i.giphy.com/RgxAkfVQWwkjS.gif'
    ];
    const getPic = (ok) => {
      if(ok)
        return goodPics[0];
      else
        return badPics[0];
    };
    let bitcoinStatus = this.props.bitcoinStatus;
    let pic = {
      uri: getPic(bitcoinStatus),
    };
    return (
      <Image source={pic} style={styles.image}/>
    );
  }
}

class Bitcoin extends React.Component {
  render(){
    let precio = this.props.bitcoinPrice;
    return (
      <Text style={styles.text}>$ {precio}</Text>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    top: 150,
  },
  text: {
    color: '#000',
    fontSize: 20,
    flex:1
  },
  image: {
    width: 250,
    height: 250,
    flex:1
  }

});
