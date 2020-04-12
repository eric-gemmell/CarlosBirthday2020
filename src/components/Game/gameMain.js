import React from "react";
import * as d3 from "d3";
import openSocket from 'socket.io-client';
import Person from "./person";
import MainCharacter from "./mainCharacter";

class Game extends React.Component {
	constructor(props){
		super(props);
		this.updateMousePosition = this.updateMousePosition.bind(this);
		this.state = {
			people:{},
			me:{"name":props.name,"size":10,"x":0,"y":0}
		}
		
	}
	render(){
		return (
			<svg className="MainSVG" ref={(svg) => this.svg = svg} onMouseMove={this.updateMousePosition} style={{"margin":"0","width":"100%","height":"100%"}}>
				<circle ref={(center) => this.centerOfScreenElement = center} cx="50%" cy="50%" r="1" />
				{Object.values(this.state.people).map((person) => (
					<Person person={person}
						mainCharacter={this.state.me} 
						centerCoordinates={this.centerCoordinates||{"x":0,"y":0}}
					/>
				))} 
				<MainCharacter me={this.state.me}/>
				
			</svg>
		);
	}

	componentDidMount() {
		this.socket = openSocket();
		this.socket.on("setup",(response) => {
			let people = response.data.people;
			let me = people[response.new_user_id];
			me.name = this.props.name;
			delete people[response.new_user_id];
			this.setState({
				people:people,
				me:me
			});
		});
		this.socket.on("update",(data) => {
			let people = data.people;
			delete people[this.state.me.id];
			this.setState({
				people:people
			});
		});
		this.updatePosition();
		this.updatePositionInterval = setInterval(() => this.updatePosition(), 50);
	}
	componentWillUnmount() {
		clearInterval(this.updatePositionInterval);
	}
	updatePosition(){
		let rect = this.centerOfScreenElement.getBoundingClientRect();
		this.centerCoordinates = {x:rect.x,y:rect.y};
		let newState = this.state;
		let dx = 0;
		let dy = 0;
		if(this.mousePosition){
			dx = (this.mousePosition.x - this.centerCoordinates.x);
			dy = (this.mousePosition.y - this.centerCoordinates.y);
		}
		let length = Math.max(0.001,Math.sqrt(dx*dx + dy*dy)-200);
		newState.me.x += dx/length*Math.min(length/100,1);	
		newState.me.y += dy/length*Math.min(length/100,1);
		this.setState(newState);
		this.socket.emit("update",this.state.me);
	}
	updateMousePosition(e){
		this.mousePosition = {x:e.clientX,y:e.clientY};
	}
}
export default Game;
