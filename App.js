import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';

export default class App extends React.Component {
  render() {
    let pic = {
      uri: 'https://i.giphy.com/RgxAkfVQWwkjS.gif',
    };
    return (
      <View style={styles.container}>
        <Image source={pic} style={styles.image}/>
        <Text style={styles.text}>Llorela perro.com</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#ff8e18',
    fontSize: 20,
  },
  image: {
    width: 250,
    height: 250,
  }
});
