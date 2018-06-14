import React from 'react';
import { StyleSheet, Text, View, Image, Slider, AsyncStorage, Picker } from 'react-native';
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
    this.state = {
      bitcoinPrice: 0, 
      bitcoinStatus: null, 
      diferencia: null,
      minTiempo: 1,
      maxTiempo: 100
    };
    console.log('constructor');
    store.subscribe(() => {
      console.log('Suscribe');

      if(this.state.intervalo){
        console.log('clearInterval');
        clearInterval(this.state.intervalo);
      }

      this.setState({
        tiempo: store.getState().tiempo,
        // fuente: store.getState().fuente,
        intervalo: ((tiempoRecarga) => {
            return setInterval(() => {
              console.log('Inicia Intervalo');
              console.log('fuente: '+store.getState().fuente);
              console.log('tiempo de recarga: '+tiempoRecarga);
              fetch(store.getState().fuente)
              .then((response) => response.json())
              .then((responseJson) => {
                this.setState(previousState => {
                  const lastPrice = previousState.bitcoinPrice;
                  const newPrice = responseJson.ask;
                  console.log('New Ask Price: '+newPrice+' From: '+store.getState().fuente);
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
      this._loadInitialState();
    };
    
    _loadInitialState = async () => {
      console.log('_loadInitialState');
      try{
        const tiempoStorage = await AsyncStorage.getItem('tiempo');
        // const valueTiempo = tiempoStorage !== null ? tiempoStorage : 1;

        const fuenteStorage = await AsyncStorage.getItem('fuente');
        // const valueFuente = fuenteStorage !== null ? fuenteStorage : 'https://www.bitstamp.net/api/ticker/';

        console.log('Set initial tiempo: '+tiempoStorage);
        console.log('Set initial fuente: '+fuenteStorage);
        //Set State Tiempo
        this.setState({
          tiempo: tiempoStorage,
          fuente: fuenteStorage
        });
        //Set Store Tiempo
        store.dispatch({
          type: 'INIT',
          tiempo: tiempoStorage,
          fuente: fuenteStorage
        });

      } catch (error) {
        console.log('##ERROR## On get AsyncStorage');
        console.log(error);
      }
    };
    componentDidMount(){
      console.log('componentDidMount');
    }
    render(){
      const tiempoCambioHandle = (val) => {
        const setAsyncTiempo = async (val) => {
          try {
            console.log('Set AsyncStorage Tiempo: '+val);
            await AsyncStorage.setItem('tiempo', String(val));
          } catch (error) {
            console.log('##ERROR## On save AsyncStorage - Tiempo');
            console.log(error);
        }
      };
      setAsyncTiempo(val);
      store.dispatch({
        type: 'CHANGE_TIEMPO',
        tiempo: val
      });
    };
    const tiempoCambiandoHandle = (val) => {/*alert(val)*/};
      const setAsyncFuente = async (val) => {
        try {
          console.log('Set AsyncStorage fuente: '+val);
          await AsyncStorage.setItem('fuente', String(val));
        } catch (error) {
          console.log('##ERROR## On save AsyncStorage - Fuente');
          console.log(error);
        }
      };
      const fuenteCambioHandle = (index, val) => {
        console.log('cambio fuente',index,val);
        setAsyncFuente(index);
        store.dispatch({
          type: 'CHANGE_FUENTE',
          fuente: index
      });
    };
    return (
      <View style={styles.container}>
        <Fuente onChangeHandle={fuenteCambioHandle} fuente={this.state.fuente}/>
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
    const tiempo = parseInt(this.props.tiempo);
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

class Fuente extends React.Component {
  render(){
    return(
      <Picker
        selectedValue={this.props.fuente}
        style={styles.fuente}
        onValueChange={this.props.onChangeHandle}>
        <Picker.Item label="Bitex.la" value="https://bitex.la/api-v1/rest/btc_usd/market/ticker" />
        <Picker.Item label="BitStamp" value="https://www.bitstamp.net/api/ticker/" />
      </Picker>
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
    borderRadius: 50,
    width: 300,
    height: 50,
  },
  fuente: {
    height: 25, 
    width: 100,
    marginTop: -200,
    marginBottom: 150
  },

});
