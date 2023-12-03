import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Switch, ScrollView, Button, Alert, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useSelector, useDispatch } from "react-redux";
import { setVend } from '../../redux/actions/vendAction';
import axios from "axios";
import MY_IP_ADDRESS from "../../environment_variables.mjs";
import { setUserInfo } from "../../redux/actions/userInfoAction";
import ArticleForm from '../../Screens/ArticleForm';

const VendorProfile = () => {
  const initialized = useSelector((store) => store.isInit.isInit);
  const dispatch = useDispatch();

  const [selectedTab, setSelectedTab] = useState('article');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [savedPath, setSavedPath] = useState(null);
  const userInfo = useSelector((store) => store.userInfo.userInfo);

  const toggleInterest = interest => {
    setSelectedInterests(prevSelectedInterests =>
      prevSelectedInterests.includes(interest)
        ? prevSelectedInterests.filter(i => i !== interest)
        : [...prevSelectedInterests, interest],
    );
  };

  const selectTab = (tab) => {
    setSelectedTab(tab);
  };

  const switchEditMode = () => {
    setEditMode(true);
  };

  const saveChanges = async () => {
    setEditMode(false);
    if (imageUri) {
      const newPath = await saveImageLocally(imageUri);
      setSavedPath(newPath);
    }
    // after request for successful discovery page creation
    // Mimi: if you refactor the save flow, just use the line below
    dispatch(setVend());
  };

  const saveImageLocally = async (fileUri) => {
    const fileName = fileUri.split('/').pop();
    const newPath = FileSystem.documentDirectory + fileName;

    try {
      await FileSystem.moveAsync({
        from: fileUri,
        to: newPath,
      });
      console.log('Image saved at', newPath);
      return newPath;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const pickImage = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled && result.assets && result.assets.length > 0) {
      console.log(result.assets[0].uri);
      setImageUri(result.assets[0].uri);
    }
  };

  const Checkbox = ({ isSelected, onToggle }) => {
    return (
      <TouchableOpacity style={styles.checkbox} onPress={onToggle}>
        {isSelected && <View style={styles.checkboxSelected} />}
      </TouchableOpacity>
    );
  };

  const interestsList = ['Events', 'Tips/Tricks (DIY)', 'News', 'Shopping'];

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}></View>
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={pickImage} disabled={!editMode}>
            <Image
              source={imageUri ? { uri: imageUri } : require('./user.jpg')}
              style={styles.profileImage}
            />
          </TouchableOpacity>
          <Text style={styles.name}>{userInfo["first_name"] + " " + userInfo["last_name"]}</Text>
          {editMode && (
            <Button title="Change Profile Picture" onPress={pickImage} />
          )}
          <View style={styles.infoContainer}>
            <TouchableOpacity
              style={[styles.infoTab, selectedTab === 'article' && styles.selectedTab]}
              onPress={() => selectTab('article')}
            >
              <Text style={selectedTab === 'article' && styles.selectedTabText}>Create Article</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.infoTab, selectedTab === 'discovery' && styles.selectedTab]}
              onPress={() => selectTab('discovery')}
            >
              <Text style={selectedTab === 'discovery' && styles.selectedTabText}>Discovery Page</Text>
            </TouchableOpacity>
          </View>
        </View>
        {selectedTab === 'article' ? (
          <ArticleForm />
        ) : (
          <View style={styles.detailsSection}>
            <Text style={styles.interestText}>What sustainable information are you interested in?</Text>
            {interestsList.map(interest => (
              <View key={interest} style={styles.interestItem}>
                <Checkbox
                  isSelected={selectedInterests.includes(interest)}
                  onToggle={() => toggleInterest(interest)}
                />
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      {/* Footer section */}
      <View style={styles.footer}>
        {!editMode ? (
          <TouchableOpacity style={styles.editProfileButton} onPress={switchEditMode}>
            <Text>Edit Profile</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.editProfileButton} onPress={saveChanges}>
            <Text>Save Changes</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: '#02833D', // A green color similar to the one in the image.
    padding: 50,
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: -50, // Negative margin to pull the profile section up, overlapping the header
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'white', // Adjust color as needed to match the background
    overflow: 'hidden',
    backgroundColor: 'white', // Assuming a white background for the profile picture
    zIndex: 1,
  },
  name: {
    fontSize: 14, // Adjust the size as needed
    fontWeight: 'bold', // Use 'normal', 'bold', '100', '200', ... '900'
    marginVertical: 8,
    color: '#000000',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  infoTab: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsSection: {
    padding: 16,
    color: '#424242',
  },
  notificationSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 'auto',
  },
  editProfileButton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    alignSelf: 'center',
  },
  selectedTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
  },
  selectedTabText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  notificationText: {
    marginRight: 8,
  },
  interestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  checkbox: {
    height: 20,
    width: 20,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#bcbcbc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxSelected: {
    height: 12,
    width: 12,
    borderRadius: 1,
    backgroundColor: '#000',
  },
  interestText: {
    fontSize: 15,
    color: '#424242',
    padding: 3,
  },
  footer: {
    backgroundColor: 'white',
    marginBottom: 20,
  },
  contactSection: {
    padding: 16,
    color: '#424242',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default VendorProfile;