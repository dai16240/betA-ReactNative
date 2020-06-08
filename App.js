import React from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    StatusBar,
    TextInput,
    TouchableOpacity,
    Image,
    ToastAndroid,
    AsyncStorage,
    ActivityIndicator
  } from "react-native";
import { createStackNavigator, createAppContainer } from "react-navigation";
import SplashScreen from 'react-native-splash-screen';

class PredictionsScreen extends React.Component {
  static navigationOptions = {
    title: 'Προγνωστικά',
    headerStyle: {
      backgroundColor: '#16a085',
      height: 50,
      borderColor: '#F8EFBA',
      borderBottomWidth: 2
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
      fontSize: 16,
    },
  };

  state = {
    predictions: [],
    api_data: [],
    favourites: [],
    favIDs: [],
    query: '',
    loading: true
  }

  componentDidMount() {
    this.retrieveState();
    this.setState({
      loading: true
    })
    fetch('http://beta.computer/predictions')
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({
        api_data: responseJson.predictions,
        predictions: responseJson.predictions,
        loading: false
      })
    })
    .catch((error) => {
      console.log(error);
      this.setState({
        loading: false
      })
    })
  }

  handleSearch = text => {
    const formatQuery = text.toLowerCase();
    const dataToDisplay = this.state.api_data.filter(item => {
      const itemStr = item.gid + item.trnmnt + item.hm + item.aw + item.time;
      return itemStr.toLowerCase().includes(formatQuery);
    });
    this.setState({predictions: dataToDisplay, query: text})
  }

  storeState = async () => {
    try {
      await AsyncStorage.removeItem('FAVOURITES');
      await AsyncStorage.setItem('FAVOURITES', JSON.stringify(this.state.favourites));
    } catch (error) {
      console.log(error)
    }
    try {
      await AsyncStorage.removeItem('FAVIDS');
      await AsyncStorage.setItem('FAVIDS', JSON.stringify(this.state.favIDs));
    } catch (error) {
      console.log(error)
    }
  }

  retrieveState = async () => {
    try {
      const unParsed = await AsyncStorage.getItem('FAVOURITES');
      if (unParsed !== null) {
        const storedFavourites = JSON.parse(unParsed);
        this.setState({
          favourites: storedFavourites
        })
      }
     } catch (error) {
       console.log(error)
     }
     try {
      const unParsed = await AsyncStorage.getItem('FAVIDS');
      if (unParsed !== null) {
        const storedFavIDs = JSON.parse(unParsed);
        this.setState({
          favIDs: storedFavIDs
        })
      }
     } catch (error) {
       console.log(error)
     }
  }

  updateItemState(item) {
    prevFavourites = this.state.favourites;
    prevFavIDs = this.state.favIDs;
    if (prevFavIDs.indexOf(item.gid) == -1) {
      ToastAndroid.showWithGravity(
        'Προσθήκη...',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
      prevFavourites.push(item)
      prevFavIDs.push(item.gid);
      this.setState({
        favourites: prevFavourites,
        favIDs: prevFavIDs
      })
      this.storeState();
    }
    else {
      this.removeFromFavourites(item)
    }
  }

  removeFromFavourites(item) {
    prevFavourites = this.state.favourites;
    prevFavIDs = this.state.favIDs;
    if (prevFavIDs.indexOf(item.gid) != -1) {
      ToastAndroid.showWithGravity(
        'Αφαίρεση...',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
      newFavourites = prevFavourites.filter(e => e.gid != item.gid)
      newFavIDs = prevFavIDs.filter(e => e != item.gid)
      this.setState({
        favourites: newFavourites,
        favIDs: newFavIDs
      })
      this.storeState();
    }
  }

  renderItem = ({item}) => {
    icon = (this.state.favIDs.indexOf(item.gid) != -1) ? require('./fav_filled_peach.png') : require('./fav_outline_peach.png')
    return (
      <View style={{backgroundColor: '#dff9fb', borderBottomColor: '#c7ecee', borderBottomWidth: 3, borderBottomStartRadius: 10, borderBottomLeftRadius: 10, paddingTop: 10, paddingBottom: 10, paddingRight: 20, paddingLeft: 20, marginTop: 5, marginBottom: 5}}>
        <TouchableOpacity style={{width: 30, height: 30}} onPress={()=>this.updateItemState(item)}>
            <Image style={{marginTop: 10, alignSelf: 'flex-start', width: 15, height: 15}} source={icon} />
        </TouchableOpacity>
        <Image
          style={{width: 16, height: 12, alignSelf: 'flex-end'}}
          source={{uri: item.img}}
        />
        <Text style={{textAlign: 'right'}}>{item.trnmnt}</Text>
        <Text style={{marginTop: 5, marginBottom: 5, fontWeight: 'bold'}}>{item.hm} - {item.aw}</Text>
        <Text>Κωδ.: {item.gid}</Text>
        <Text>Ώρα: {item.time}</Text>
        <Text style={{textAlign: 'right'}}>1-X-2: {item.preds['1X2']}</Text>
        <Text style={{textAlign: 'right'}}>Under-Over: {item.preds['UO']}</Text>
        <Text style={{textAlign: 'right'}}>Goal-NoGoal: {item.preds['GNG']}</Text>
        <Text style={{textAlign: 'right'}}>Goals: {item.preds['GLS']}</Text>
      </View>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar
          backgroundColor="#16a085"
          barStyle="light-content"
        />
        {this.state.loading &&
          <ActivityIndicator style={{marginTop: 20}} size="large" color="#e74c3c" />
        }
        {
          (this.state.api_data.length == 0) &&
          (this.state.loading == false) &&
          <View style={{width: '85%', marginTop: 40}}>
            <Text style={{textAlign: 'center', fontSize: 16, marginBottom: 20}}>Κάτι πήγε στραβά! Ελέγξτε τη σύνδεσή σας στο διαδίκτυο και προσπαθήστε ξανά αργότερα.</Text>
            <TouchableOpacity style={{marginTop: 20, alignSelf: 'center', width: 100, height: 100}} onPress={()=>this.props.navigation.navigate('Favourites', {favourites: this.state.favourites, removeFromFavourites: this.removeFromFavourites.bind(this)})}>
              <Image style={{width: 100, height: 100, opacity: 0.9}} source={require('./fav_filled_peach.png')} />
          </TouchableOpacity>
          </View>
        }
        {(this.state.api_data.length > 0) &&
        <View style={{marginTop: 10, flexDirection: 'row'}}>
          <TextInput
            placeholder={'Αναζήτηση'}
            style={styles.searchBar}
            onChangeText={this.handleSearch}
          />
          <TouchableOpacity onPress={()=>this.props.navigation.navigate('Favourites', {favourites: this.state.favourites, removeFromFavourites: this.removeFromFavourites.bind(this)})}>
              <Image style={{marginTop: 10, alignSelf: 'flex-end', width: 30, height: 30}} source={require('./fav_filled_peach.png')} />
          </TouchableOpacity>
        </View>
        }
        <FlatList
          style={{width: '100%', marginBottom: 10, paddingRight: 20, paddingLeft: 20}}
          data={this.state.predictions}
          keyExtractor={(item)=>item.gid}
          renderItem={this.renderItem}
        />
      </View>
    );
  }
}

class FavouritesScreen extends React.Component {
  static navigationOptions = {
    title: 'Αγαπημένα',
    headerStyle: {
      backgroundColor: '#16a085',
      height: 50,
      borderColor: '#F8EFBA',
      borderBottomWidth: 2
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
      fontSize: 16,
    },
  };

  state = {
    favourites: []
  }

  componentDidMount() {
    this.setState({
      favourites: this.props.navigation.getParam('favourites')
    })
  }

  updateFavourites(item) {
    newFavs = this.state.favourites.filter(e => e.gid != item.gid)
    this.setState({
      favourites: newFavs
    })
    this.props.navigation.state.params.removeFromFavourites(item);
  }

  renderItem = ({item}) => {
    return (
      <View style={{backgroundColor: '#dff9fb', borderBottomColor: '#c7ecee', borderBottomWidth: 3, borderBottomStartRadius: 10, borderBottomLeftRadius: 10, paddingTop: 10, paddingBottom: 10, paddingRight: 20, paddingLeft: 20, marginTop: 5, marginBottom: 5}}>
        <TouchableOpacity style={{width: 30, height: 30}} onPress={()=>this.updateFavourites(item)}>
            <Image style={{marginTop: 10, alignSelf: 'flex-start', width: 15, height: 15}} source={require('./remove_icon.png')} />
        </TouchableOpacity>
        <Image
          style={{width: 16, height: 12, alignSelf: 'flex-end'}}
          source={{uri: item.img}}
        />
        <Text style={{textAlign: 'right'}}>{item.trnmnt}</Text>
        <Text style={{marginTop: 5, marginBottom: 5, fontWeight: 'bold'}}>{item.hm} - {item.aw}</Text>
        <Text>Κωδ.: {item.gid}</Text>
        <Text>Ώρα: {item.time}</Text>
        <Text style={{textAlign: 'right'}}>1-X-2: {item.preds['1X2']}</Text>
        <Text style={{textAlign: 'right'}}>Under-Over: {item.preds['UO']}</Text>
        <Text style={{textAlign: 'right'}}>Goal-NoGoal: {item.preds['GNG']}</Text>
        <Text style={{textAlign: 'right'}}>Goals: {item.preds['GLS']}</Text>
      </View>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar
          backgroundColor="#16a085"
          barStyle="light-content"
        />
        {
          (this.state.favourites.length == 0) &&
          <View style={{width: '85%', marginTop: 40}}>
            <Image style={{marginTop: 50, alignSelf: 'center', width: 100, height: 100, opacity: 0.5}} source={require('./fav_outline_peach.png')} />
            <Text style={{marginTop: 20, textAlign: 'center', fontSize: 16, marginBottom: 20}}>Δεν υπάρχουν αγαπημένα.</Text>
          </View>
        }
        <FlatList
          style={{width: '100%', marginTop: 10, marginBottom: 10, paddingRight: 20, paddingLeft: 20}}
          data={this.state.favourites}
          keyExtractor={(item)=>item.gid}
          renderItem={this.renderItem}
        />
      </View>
    );
  }
}

const AppNavigator = createStackNavigator(
  {
    Predictions: PredictionsScreen,
    Favourites: FavouritesScreen
  },
  {
    initialRouteName: "Predictions"
  }
);

const AppContainer = createAppContainer(AppNavigator);

export default class App extends React.Component {
  componentDidMount() {
    SplashScreen.hide();
  }

  render() {
    return <AppContainer />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  searchBar: {
    width: '80%',
    textAlign: 'center',
  }
});
