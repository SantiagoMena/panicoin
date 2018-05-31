import { createStore } from 'redux';

const reducer = (state, action) =>{
	if(action.type === 'CHANGE'){
		alert(action.tiempo);
		return {
			...state,
			tiempo: action.tiempo
		};	
	} else {
		alert('boluuu');
	}
}

export default createStore(reducer, { tiempo: 1 });