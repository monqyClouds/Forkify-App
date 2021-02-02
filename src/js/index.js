// Global app controller

import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';

 

/** Global state of the app
 * - Search object
 * - Current recipe object
 * - Liked recipes
 */
const state = {};


/**
 * SEARCH CONTROLLER;
 */

const controlSearch = async () => {
    // 1. Get the query from the view
    const query = searchView.getInput();

    if (query) {
        // 2. New search object and add to state
        state.search = new Search(query);

        // 3. Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            // 4. Search for recipes
            await state.search.getResults();
    
            // 5. Render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (err) {
            alert('Somethig wrong with the search...')
            clearLoader();
        }

    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

// // Testing
// window.addEventListener('load', e => {
//     e.preventDefault();
//     controlSearch();
// });

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline')
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
})


/**
 * RECIPE CONTROLLER;
 */
const controlRecipe = async () => {
    // Get ID from url
    const id = window.location.hash.replace('#', '');

    if (id) {
        // Prepare the UI for the changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Highlight selected search item
        if (state.search) searchView.highlightSelected(id);

        // Create new Recipe objects
        state.recipe = new Recipe(id);

        try {
            // Get recipe data and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

    
            // Calculate Servings
            state.recipe.calcTime();
            state.recipe.calcServings();
    
            // Render recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );
            

        } catch (error) {
            alert('Error processing recipe')
        }
    }
}

['hashchange', 'load'].forEach(el => window.addEventListener(el, controlRecipe));


/**
 * LIST CONTROLLER;
**/

const controlList = () => {
    // Create a new list if there is none yet

    if (!state.list) state.list = new List();
    
    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    })
}

// Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    
    const id = e.target.closest('.shopping__item').dataset.itemid;
    
    // Handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);
        
        // delete from UI
        listView.deleteItem(id)

        // Handle the count update
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value);
        if (val >= 0) state.list.updateCount(id, val);
    }   
})

// Restore shopping list on page reload



/**
 * LIKES CONTROLLER;
 */

const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    // User has not liked current recipe
    if (!state.likes.isLiked(currentID)) {
        // Add like to the state
        const newLike = state.likes.addLike (
            currentID, 
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        )

        // toggle the like button
        likesView.toggleLikeBtn(true);

        // Add like to the UI list
        likesView.renderLike(newLike);

    // User has liked current recipe    
    } else {
        // Remove like from the state
        state.likes.deleteLike(currentID);

        // toggle the like button
        likesView.toggleLikeBtn(false);

        // Remove like from the UI list
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
}


// Restore liked recipes and shopping list on page load
window.addEventListener('load', () => {
    state.likes = new Likes();
    state.list = new List();

    // Restore likes & list
    state.likes.readStorage();
    state.list.readStorage();

    // Toggle like menu btn
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render existing likes & shopping list
    state.likes.likes.forEach(like => likesView.renderLike(like));
    state.list.items.forEach(item => {
        //const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    })
})

// Handling recipe btn clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        //decrease btn is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }

    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        //increase btn is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);

    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        controlList(); 

    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Like controler
        controlLike();
    }
    
}) 








































