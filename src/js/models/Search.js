import axios from 'axios';
import { proxy } from '../config';

export default class Search {
    constructor(query) {
        this.query = query;
    }

    async getResults(query) {
               
        try {
            const res = await axios(`${proxy}http://forkify-api.herokuapp.com/api/search?&q=${this.query}`);
            this.result = res.data.recipes; 
            //console.log(this.result);
    
        } catch(error) {
            alert(error);
        }
    }
}





