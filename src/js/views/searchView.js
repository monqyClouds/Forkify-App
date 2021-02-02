// import all HTML selectors
import { elements } from './base';

export const getInput = () => elements.searchInput.value;

export const clearInput = () => { elements.searchInput.value = '' }

export const clearResults = () => {
    elements.searchResList.innerHTML = '';
    elements.searchResPages.innerHTML = '';
}

export const highlightSelected = id => {

    const resultsArr = Array.from(document.querySelectorAll('.results__link'));

    // Remove active class from all links
    resultsArr.forEach(el => {
        el.classList.remove('results__link--active')
    })

    // Add active class to selected link
    document.querySelector(`.results__link[href="#${id}"]`).classList.add('results__link--active');
}

// function to Limit the title length of search results 
export const limitRecipeTitle = (title, limit = 17) => {
    const newTitle = [];
    if (title.length > limit) {
        title.split(' ').reduce((acc, curr) => {
            if (acc + curr.length <= limit) {
                newTitle.push(curr);
            }
            return acc + curr.length;   // returned value is the new 'acc'
        }, 0)
        return `${newTitle.join(' ')} ...`;
    } return title
}

// function to insert search result items
const renderRecipe = recipe => {
    const markup = `
        <li>
            <a class="results__link" href="#${recipe.recipe_id}">
                <figure class="results__fig">
                    <img src="${recipe.image_url}" alt="${recipe.publisher}">
                </figure>
                <div class="results__data">
                    <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                    <p class="results__author">${recipe.publisher}</p>
                </div>
            </a>
        </li>
    `;
    elements.searchResList.insertAdjacentHTML("beforeEnd", markup);
}

// type: 'prev' or 'next'
const createButton = (page, type) => `
    <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
        <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
        </svg>
    </button>
`;

const renderButtons = (page, numResults, resPerPage) => {
    const pages = Math.ceil(numResults / resPerPage);

    let button;
    if (page === 1 && pages > 1) {
        button = createButton(page, 'next')
    } else if (page > 1 && page < pages) {
        button = `
        ${createButton(page, 'prev')}
        ${createButton(page, 'next')}
        `
    } else if (page === pages && pages > 1) {
        button = createButton(page, 'prev')
    }

    elements.searchResPages.insertAdjacentHTML('afterBegin', button);
}

// render results of current page
export const renderResults = (recipes, page = 1, resPerPage = 10) => {
    
    const start = (page - 1) * resPerPage;
    const end = page * resPerPage;

    // actual method that renders results on current page
    recipes.slice(start, end).forEach(renderRecipe);

    //render pagination buttons
    renderButtons(page, recipes.length, resPerPage);
}











































