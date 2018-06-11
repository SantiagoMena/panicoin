import React from 'react';
import { StyleSheet, Text, View, Image, Slider, AsyncStorage } from 'react-native';
import { AppLoading, Asset, Font } from 'expo';
import { FontAwesome } from '@expo/vector-icons';
import store from './store';
import TimerMixin from 'react-timer-mixin';

function cacheImages(images) {
  return images.map(image => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}

function cacheFonts(fonts) {
  return fonts.map(font => Font.loadAsync(font));
}

export default class App extends React.Component {
  state = {
    isReady: false,
  };

  async _loadAssetsAsync() {
    const imageAssets = cacheImages([
      require('./assets/images/up.gif'),
      require('./assets/images/down.gif'),
      require('./assets/images/same.gif'),
      require('./assets/images/load.gif'),
    ]);

    const fontAssets = cacheFonts([FontAwesome.font]);

    await Promise.all([...imageAssets, ...fontAssets]);
  }

  render() {
    if (!this.state.isReady) {
      return (
        <AppLoading
          startAsync={this._loadAssetsAsync}
          onFinish={() => this.setState({ isReady: true })}
          onError={console.warn}
        />
      );
    }

    return (
      <Panicoin />
    );
  }
}

class Panicoin extends React.Component {
  constructor(props) {
    super(props);
    const tiempo = (async ()  => {
      try{
        const tiempo = await AsyncStorage.getItem('tiempo');
        if(tiempo !== null){
          return tiempo;
        } else {
          return 1;
        }
      } catch (error) {
        console.log('##ERROR## On get AsyncStorage');
      }
    })();
    
    this.state = {
      bitcoinPrice: 0, 
      bitcoinStatus: null, 
      diferencia: null,
      tiempo: tiempo,
      minTiempo: 1,
      maxTiempo: 100
    };
    store.subscribe(() => {
      this.setState({
        tiempo: store.getState().tiempo,
        intervalo: ((tiempoRecarga) => {
            //const apiUrl = 'https://bitex.la/api-v1/rest/btc_usd/market/ticker';
            const apiUrl = 'https://www.bitstamp.net/api/ticker/';
            console.log(tiempoRecarga);
            return setInterval(() => {
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
                  const diferencia = newPrice - lastPrice == newPrice ? '' : newPrice - lastPrice;
                  const strDiferencia = diferencia > 0 ? `+`+diferencia : diferencia;
                  return { bitcoinPrice: newPrice, bitcoinStatus: bitcoinStatus, diferencia: strDiferencia };
                });
              });
            }, tiempoRecarga);
          })(store.getState().tiempo * 1000)
        });
      });
    };
    componentDidMount(){
      store.dispatch({
        type: 'CHANGE',
        tiempo: this.state.tiempo
      });
    }
  render(){
    const tiempoCambioHandle = (val) => {
      const setAsyncTiempo = async (val) => {
        try {
          await AsyncStorage.setItem('tiempo', val);
        } catch (error) {
          console.log('##ERROR## On save AsyncStorage - Tiempo');
        }
      };
      setAsyncTiempo();
      clearInterval(this.state.intervalo);
      store.dispatch({
        type: 'CHANGE',
        tiempo: val
      });
    };
    const tiempoCambiandoHandle = (val) => {/*alert(val)*/};
    return (
      <View style={styles.container}>
        <Tiempo tiempo={this.state.tiempo} maxTiempo={this.state.maxTiempo} minTiempo={this.state.minTiempo} tiempoCambiandoHandle={tiempoCambiandoHandle} tiempoCambioHandle={tiempoCambioHandle}/>
        <Diferencia diferencia={this.state.diferencia} />
        <Meme bitcoinStatus={this.state.bitcoinStatus} />
        <Bitcoin bitcoinPrice={this.state.bitcoinPrice} />
      </View>
    );
  }
}

class Tiempo extends React.Component {
  render(){
    const tiempo = this.props.tiempo;
    const minTiempo = this.props.minTiempo;
    const maxTiempo = this.props.maxTiempo;
    const tiempoCambioHandle = this.props.tiempoCambioHandle;
    const tiempoCambiandoHandle = this.props.tiempoCambiandoHandle;
    return(
        <View>
          <Text>Tiempo de recarga: {tiempo} segundos</Text>
          <Slider
          style={styles.slider}
          step={1}
          minimumValue={minTiempo}
          maximumValue={maxTiempo}
          value={tiempo}
          onValueChange={(val) => tiempoCambiandoHandle(val)}
          onSlidingComplete={ (val) => tiempoCambioHandle(val)}
          />
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
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#000',
    fontSize: 20,
  },
  image: {
    width: 250,
    height: 250,
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
  },
  slider: { 
    width: 300,
    height: 50,
  },

});
