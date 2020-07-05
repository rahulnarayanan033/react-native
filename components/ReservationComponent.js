import React , { Component } from 'react';
import { Text , View , ScrollView , StyleSheet , Picker , Switch , Button , Modal , Alert , Platform } from 'react-native';
import { Card } from 'react-native-elements';
import DatePicker from 'react-native-datepicker';
import * as Animatable from 'react-native-animatable';
import {Notifications} from 'expo';
import * as Permissions from 'expo-permissions';
import * as Calendar from 'expo-calendar';


class Reservation extends Component {
    constructor(props){
        super(props);
        this.state = {
            guests : 1,
            smoking : false,
            date : ''
        }
    }

    static nvaigationOptions = {
        title : 'Reserve Table',
    }

    handleReservation(){
        console.log(JSON.stringify(this.state));
        Alert.alert(
            'Your Reservation OK?',
            'Number of guests : ' + this.state.guests + '\n' + 'Smoking? ' + this.state.smoking + '\n' 
            + 'Date and Time : ' + this.state.date,
            [
                {
                    text : 'Cancel',
                    onPress : () => this.resetForm(),
                    style : 'cancel'
                },
                {
                    text : 'OK',
                    onPress : () => {
                        this.presentLocalNotification(this.state.date) ; 
                        this.addReservationToCalendar(this.state.date);
                        this.resetForm()
                    }
                }
            ],
            { cancelable : false }
        );
    }

    resetForm(){
        this.setState({
            guests : 1,
            smoking : false,
            date : ''
        });
    }

    async getDefaultCalendarSource() {
        const calendars = await Calendar.getCalendarsAsync();
        const defaultCalendars = calendars.filter(calendar => calendar.source === 'Default');
        return defaultCalendars[0].source;
    }

    async obtainCalendarPermission(){
        let calendarPermission = await Permissions.getAsync(Permissions.CALENDAR);
        if(calendarPermission.status !== 'granted'){
            calendarPermission = await Permissions.askAsync(Permissions.CALENDAR);
            if(calendarPermission !== 'granted'){
                Alert.alert('No permission given');
            }
        }
        return calendarPermission;
    }

    async addReservationToCalendar(date){
        await this.obtainCalendarPermission();
        const defaultCalendarSource = Platform.OS === 'ios' ? await this.getDefaultCalendarSource() : { isLocalAccount : true , name : 'Expo calendar' };
        Calendar.createCalendarAsync({
            title : 'Expo Calendar',
            color : 'blue',
            entityType : Calendar.EntityTypes.EVENT,
            sourceId : defaultCalendarSource.id,
            source : defaultCalendarSource,
            name : 'Calendar Name',
            ownerAccount : 'personal',
            accessLevel : Calendar.CalendarAccessLevel.OWNER,
        })
        .then(id => {
            Calendar.createEventAsync(id ,{
                title : 'Con Fusion Reservation Table',
                startDate : new Date(Date.parse(date)),
                endDate : new Date(Date.parse(date)).setMilliseconds(2*60*60*1000),
                timeZone : 'Asia/Hong_Kong',
                location : '121, Clear Water Bay Road, Clear Water Bay, Kowloon, Hong Kong'
            })
        })

    }

    async obtainNotificationPermission() {
        let permission = await Permissions.getAsync(Permissions.USER_FACING_NOTIFICATIONS);
        if(permission.status !== 'granted'){
            permission = await Permissions.askAsync(Permissions.USER_FACING_NOTIFICATIONS);
            if(permission.status !== 'granted'){
                Alert.alert('Permission not granted to show notifications');
            }
        }else{
            if(Platform.OS==='android'){
                Notifications.createChannelAndroidAsync('reservation',{
                    name : 'reservation',
                    sound : true ,
                    vibrate : true,
                    priority:'max'
                });
            }
        }
        return permission;
    }

    async presentLocalNotification(date) {
        await this.obtainNotificationPermission();
        Notifications.presentLocalNotificationAsync({
            title : 'Your Reservation',
            body : ' Reservation for ' + date + ' requested ',
            ios : {
                sound : true
            },
            android : {
                channelId : 'reservation',
                color : '#512DA8'
            }
        });
    }

    render(){
        return(
            <Animatable.View animation='zoomIn' duration={1000} delay={1000}>
                <ScrollView>
                    <View style={styles.formRow}>
                        <Text style={styles.formLabel}>Number Of Guests</Text>
                        <Picker style={styles.formItem}
                            selectedValue={this.state.guests}
                            onValueChange={(itemValue , itemIndex) => this.setState({guests : itemValue})}>
                            <Picker.Item label="1" value="1"/>
                            <Picker.Item label="2" value="2"/>
                            <Picker.Item label="3" value="3"/>
                            <Picker.Item label="4" value="4"/>
                            <Picker.Item label="5" value="5"/>
                            <Picker.Item label="6" value="6"/>
                        </Picker>
                    </View>
                    <View style={styles.formRow}>
                        <Text style={styles.formLabel}>Smoking/Non-Smoking</Text>
                        <Switch style={styles.formItem}
                                value={this.state.smoking}
                                trackColor="#512DA8"
                                onValueChange={(value) => this.setState({smoking : value})}>
                        </Switch>
                    </View>
                    <View style={styles.formRow}>
                        <Text style={styles.formLabel}>Date and Time</Text>
                        <DatePicker 
                        style={{ flex : 2 , marginRight : 20 }}
                        date={this.state.date}
                        format=''
                        mode='datetime'
                        placeholder='Select Date and Time'
                        confirmBtnText="Confirm"
                        cancelBtnText="Cancel"
                        customStyles={{
                            dateIcon : {
                                position : 'absolute',
                                left : 0,
                                top : 4,
                                marginLeft : 0
                            },
                            dateInput : {
                                marginLeft : 36
                            }
                        }}
                        onDateChange={(date) => {this.setState({date : date})}}/>
                    </View>
                    <View style={styles.formRow}>
                        <Button 
                        onPress={() => this.handleReservation()}
                        title="Reserve"
                        color="#512DA8"
                        accessibilityLabel="Learn more about this purple button"/>
                    </View>
                </ScrollView>
            </Animatable.View>
        );
    }
};

const styles = StyleSheet.create({
    formRow : {
        alignItems : 'center',
        justifyContent : 'center',
        flex : 1,
        flexDirection : 'row',
        margin : 20
    },
    formLabel : {
        fontSize : 18,
        flex : 2
    },
    formItem : {
        flex : 1
    },
    modal : {
        justifyContent : 'center',
        margin : 20
    },
    modalTitle : {
        fontSize: 24,
        fontWeight: 'bold',
        backgroundColor: '#512DA8',
        textAlign: 'center',
        color: 'white',
        marginBottom: 20
    },
    modalText: {
        fontSize: 18,
        margin: 10
    }

});

export default Reservation;