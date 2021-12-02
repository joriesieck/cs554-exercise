import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import './App.css';

function App() {
	const [ state, setState ] = useState({ message: '', name: '', room: '' });
	const [ chat, setChat ] = useState([]);

	const socketRef = useRef();

	useEffect(
		() => {
			socketRef.current = io.connect('http://localhost:4000');
			socketRef.current.on('connection', () => {
				console.log('connection');
				socketRef.current.emit('room_join', state.room)
			})
			socketRef.current.on('message', ({ name, message }) => {
				setChat([ ...chat, { name, message } ]);
			});
			socketRef.current.on('user_join', function(data) {
				console.log(data);
				setChat([ ...chat, { name: 'ChatBot', message: `${data} has joined the chat` } ]);
			});
			socketRef.current.onAny((eventName, ...args) => {
				console.log(eventName,args);
			})
			// socketRef.current.on('user_leave', function(data) {
			// 	console.log('data', data);
			// 	//setChat([ ...chat, { name: 'ChatBot', message: data } ]);
			// });
			return () => {
				console.log('useEffect');
				socketRef.current.disconnect();
			};
		},
		[ chat ]
	);
	const userjoin = (name, room) => {
		socketRef.current.emit('user_join', {name, room});
	};

	const onMessageSubmit = (e) => {
		e.preventDefault();
		let msgEle = document.getElementById('message');
		console.log([ msgEle.name ], msgEle.value);
		setState({ ...state, [msgEle.name]: msgEle.value });
		socketRef.current.emit('message', { name: state.name, message: msgEle.value, room: state.room });
		setState({ message: '', name: state.name, room: state.room });
		msgEle.value = '';
		msgEle.focus();
	};

	const renderChat = () => {
		return chat.map(({ name, message }, index) => (
			<div key={index}>
				<h3>
					{name}: <span>{message}</span>
				</h3>
			</div>
		));
	};

	return (
		<div>
			{state.name && (
				<div className='card'>
					<div className='render-chat'>
						<h1>Chat Log for {state.room}</h1>
						{renderChat()}
					</div>
					<form onSubmit={onMessageSubmit}>
						<h1>Messenger</h1>
						<div>
							<input name='message' id='message' variant='outlined' label='Message' />
						</div>
						<button>Send Message</button>
					</form>
				</div>
			)}

			{!state.name && (
				<form
					className='form'
					onSubmit={(e) => {
						console.log(document.getElementById('username_input').value);
						console.log(document.getElementById('room_input').value);
						e.preventDefault();
						setState({ 
							name: document.getElementById('username_input').value,
							room: document.getElementById('room_input').value
						 });
						userjoin(document.getElementById('username_input').value, document.getElementById('room_input').value);
						// userName.value = '';
					}}
				>
					<div className='form-group'>
						<label>
							User Name:
							<br />
							<input id='username_input' />
						</label>
					</div>
					<div className='form-group'>
						<label>
							Room Name:
							<br />
							<input id='room_input' />
						</label>
					</div>
					<br />

					<br />
					<br />
					<button type='submit'> Click to join</button>
				</form>
			)}
		</div>
	);
}

export default App;
