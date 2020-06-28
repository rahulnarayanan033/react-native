import React , { Component } from 'react';
import { Text , View , ScrollView , FlatList , Modal , StyleSheet , Button , Alert } from 'react-native';
import { Card , Icon , Rating , Input , AirbnbRating } from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { withNavigation } from 'react-navigation';
import { postFavorite , postComment } from '../redux/ActionCreators';
import Moment from 'moment';

const mapStateToProps = state => {
    return{
        dishes : state.dishes,
        comments : state.comments,
        favorites : state.favorites
    }
}

const mapDispatchToProps = dispatch => ({
    postFavorite : (dishId) => dispatch(postFavorite(dishId)),
    postComment : (dishId , rating , author , comment) => dispatch(postComment(dishId , rating , author , comment))
});

class PencilIcon extends Component {
    constructor(props){
        super(props);
        this.state = {
            showModal : false
        }
    }
    
    validate(){
        var regex = /^[a-zA-Z]+$/;
        if((this.author) === undefined){
            return(
                Alert.alert("Cannot be Empty")
            )
        }
        else if((this.author.length) < 3){
            return(
                Alert.alert("Must be equal to or more than 3 characters")
            )
        }
        else if((this.author.length) > 15){
            return(
                Alert.alert("Must be equal to or less than 15 characters")
            )
        }
        else if(regex.test(this.author) === false){
            return(
                Alert.alert("Must be contain only characters")
            )
        }
    }

    toggleModal(){
        this.setState({
            showModal : !this.state.showModal
        });
    }

    handleComment(){
        this.toggleModal();
        console.log(this.props.dishId + ' ' + this.rating + '' + this.author + ' ' + this.comment);
        this.props.postComment(this.props.dishId , this.rating , this.author , this.comment)
    }


    render(){
        return (
            <View>
               <Icon
                raised
                reverse
                name={'pencil'}
                type='font-awesome'
                color='#512DA8'
                onPress={() => this.toggleModal()}/>
                <Modal animationType={'slide'} transparent={false}
                visible={this.state.showModal}
                onDismiss={() => this.toggleModal() }
                onRequestClose={() => this.toggleModal()}>
                <View>
                    <Rating showRating
                        ratingCount={5}
                        onFinishRating={(input) => this.rating = input}/>
                    <Input name='author' placeholder='Author' leftIcon={<Icon name='user-o' type='font-awesome'  color='black' size={24}/>} onChangeText = {(input) => {this.author = input}} onBlur={() => this.validate()}/>
                    <Input name='comment' placeholder='Comment' leftIcon={{ type : 'font-awesome' , name : 'comment-o' }} onChangeText = {(input) => this.comment = input}/>
                    <View>
                        <Button title='Submit' color="#512DA8" onPress={(values) => this.handleComment(values)}/>
                    </View>
                    <View style={{ marginTop : 20 }}>
                        <Button type='submit' title='Cancel'color='grey' onPress={() => {this.toggleModal()}}/>
                    </View>
                </View>
                </Modal>
            </View>
        )
    }
}


function RenderDish(props) {
    const dish = props.dish;

    if(dish != null ) {
        return(
            <Card featuredTitle={dish.name}image={{ uri : baseUrl + dish.image }}>
                <Text style={{margin : 10}}>
                    {dish.description}
                </Text>
                <View style={styles.alignRow}>
                    <Icon
                        raised
                        reverse
                        name={ props.favorite ? 'heart' : 'heart-o' }
                        type='font-awesome'
                        color="#f50"
                        onPress={() => props.favorite ? console.log('Already favorite') : props.onPress()}
                    />
                    <PencilIcon dishId={props.dish.id} postComment={props.postComment} />
                </View>
            </Card>
        );
    }
    else {
        return(
            <View></View>
        );
    }
}



function RenderComments(props) {
    const comments = props.comments;
    const renderCommentItem = ({ item , index }) => {
        Moment.locale('en');
        return(
            <View key={index} style={{ margin : 10 }}>
                <Text style={{ fontSize:14 }}>{item.comment}</Text>
                <View><Rating style={{ flex : 1 , flexDirection : 'row' }} imageSize={20} readonly startingValue={item.rating} /></View>
                <Text style={{ fontSize:12 }}>-- {item.author} , {Moment(item.date).format("MMM D , YYYY ")}</Text>
            </View>
        );
    };
    return (
        <Card title="Comments">
            <FlatList
            data={comments}
            renderItem={renderCommentItem}
            keyExtractor={item => item.id.toString()}
            />
        </Card>
    );
}


class DishDetail extends Component {

    static navigationOptions = {
        title : 'Dish Details'
    }


    markFavorite(dishId){
        this.props.postFavorite(dishId);
    }



    render() {
        const dishId = this.props.navigation.getParam('dishId' , '');
        console.log([+dishId])
        return(
            <ScrollView>
                <RenderDish dish={this.props.dishes.dishes[+dishId]}
                favorite={this.props.favorites.some(el => el === dishId)}
                onPress={() => this.markFavorite(dishId)}
                postComment={this.props.postComment}/>
                <RenderComments comments={this.props.comments.comments.filter((comment) => comment.dishId === dishId)}/>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    alignRow : {
        justifyContent : 'center',
        flex : 1,
        flexDirection : 'row'
    }
})
connect(mapStateToProps , mapDispatchToProps)(PencilIcon);
export default withNavigation(connect(mapStateToProps , mapDispatchToProps)(DishDetail));