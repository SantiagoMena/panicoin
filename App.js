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
    this.state = {bitcoinPrice: 0, bitcoinStatus: null, diferencia: null};
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
          const bitcoinStatus = (() => {
            if(newPrice == lastPrice || newPrice - lastPrice == newPrice)
              return `igual`;
            else if(newPrice > lastPrice)
              return `subio`;
            else
              return `bajo`;
          })();
          const diferencia = newPrice - lastPrice == newPrice ? 0 : newPrice - lastPrice;
          const strDiferencia = diferencia > 0 ? `+`+diferencia : diferencia;
          return { bitcoinPrice: newPrice, bitcoinStatus: bitcoinStatus, diferencia: strDiferencia};
        });
      });
    }, 1000);
  }
  render(){
    return (
      <View style={styles.container}>
        <Diferencia diferencia={this.state.diferencia} />
        <Meme bitcoinStatus={this.state.bitcoinStatus} />
        <Bitcoin bitcoinPrice={this.state.bitcoinPrice} />
      </View>
    );
  }
}

class Meme extends React.Component {
  render(){
    const goodPics = [
      require('./assets/images/up.gif')
    ];
    const badPics = [
      require('./assets/images/down.gif')
    ];
    const samePics = [
      require('./assets/images/same.gif')
    ];
    const loadingPics = [
      require('./assets/images/load.gif')
    ];

    const getPic = (status) => {
      if(status == `subio`)
        return goodPics[0];
      else if(status == `bajo`)
        return badPics[0];
      else if(status == `igual`)
        return samePics[0];
      else
        return loadingPics[0];
    };
    const bitcoinStatus = this.props.bitcoinStatus;
    const pic = getPic(bitcoinStatus);
    return (
      <Image source={pic} style={styles.image}/>
    );
  }
}

class Bitcoin extends React.Component {
  render(){
    let precio = this.props.bitcoinPrice  === 0 ? '...' : this.props.bitcoinPrice;
    return (
      <Text style={styles.text}>$ {precio}</Text>
    );
  }
}

class Diferencia extends React.Component {
  render(){
    let diferencia = this.props.diferencia;
    return(
      <Text style={diferencia < 0 ? styles.diferenciaBajo : styles.diferenciaSubio}>{diferencia == 0 ? `` : diferencia}</Text>
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
  },
  diferencia: {
    color: 'black',
    fontSize: 20,

  },
  diferenciaSubio: {
    color: 'green',
  },
  diferenciaBajo: {
    color: 'red',
  }

});
