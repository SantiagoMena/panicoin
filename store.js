import { createStore } from 'redux';

const reducer = (state, action) =>{
	switch(action.type){
		case 'INIT':
			return {
				...state,
				tiempo: action.tiempo,
				fuente: action.fuente
			};
		break;
		case 'CHANGE_TIEMPO':
			return {
				...state,
				tiempo: action.tiempo
			};
		break;
		case 'CHANGE_FUENTE':
			return {
				...state,
				fuente: action.fuente
			};
		break;
		default:
			return {
				...state 
			};
		break;
	} 
}

export default createStore(reducer, { tiempo: 1, fuente: 'https://www.bitstamp.net/api/ticker/' });