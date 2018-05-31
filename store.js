import { createStore } from 'redux';

const reducer = (state, action) =>{
	if(action.type === 'CHANGE'){
		return {
			...state,
			tiempo: action.tiempo
		};	
	} 
}

export default createStore(reducer, { tiempo: 1 });