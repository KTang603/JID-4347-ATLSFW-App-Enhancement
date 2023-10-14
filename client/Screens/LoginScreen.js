import React, { useState } from 'react';
import { Button, Text, TextInput, View, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import encryptWithPublicKey from '../utils/encryptionUtils.mjs';
import hashString from '../utils/hashingUtils.mjs';
import MY_IP_ADDRESS from '../environment_variables.mjs';
import { useSelector, useDispatch } from 'react-redux';
import { login } from '../redux/actions/loginAction';


const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [counter, setCounter] = useState(0);

  //redux stuff
  const dispatch = useDispatch();
 
  const isLogged = useSelector((store) => store.isLogged.isLogged);

  const handleLogin = async () => {
    try {

      const hashed_email = await hashString(email);
      const hashed_password = await hashString(password);

      // Send the user data to your backend
      console.log("handling login");
      console.log(hashed_email);
      console.log(hashed_password);
      const response = await axios.post('http://' + MY_IP_ADDRESS + ':5050/', {
          hashed_email,
          hashed_password,
        });

    console.log(response.data);
      const data = response.data;

      if (data.success) {
          console.log("successfully logged in");
          //send login action to store
          dispatch(login());
        // Handle success (e.g., navigate to another screen)
          navigation.navigate('Community Screen');
      } else {
          console.log("well what about this");
          console.log(data.message);
        // Handle error (e.g., display an error message)
        }
    } catch (error) {
      console.error('Error during login:', error.response.data.message);
        Alert.alert('Login Error', error.response.data.message,
          [{text:'Try Again',
            cancelable: true,
            },
          ],
        );
    }
  };
/* Login to Your Account */


  return (

    <View style={styles.container}>
      <Text style={styles.text}>New here?</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <View style={styles.buttonContainer}>
        <Button 
          title="Login"
          color="black"
          onPress={handleLogin} />
      </View>
      {isLogged ? <Text>logged in</Text> : <Text>not logged in</Text>}
      <Text style={styles.text}>New here?</Text>

      <View>
        <Button 
          title="Sign up here!"
          color="green"
          onPress={() => navigation.navigate('Sign Up')}
        />
      </View>
      
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 60,
  },
  buttonContainer: {
    marginRight:90,
    marginLeft:90,
    marginTop:0,
    paddingTop:1,
    paddingBottom:1,
    backgroundColor:'lightgray',
    borderRadius:8,
    borderWidth: 1,
    borderColor: 'black',
  },
  text: {
    fontWeight: 'bold',
    fontSize: 25,
    paddingTop: 70,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius:8,
    marginBottom: 12,
    padding: 8,
  },
});

export default LoginScreen;