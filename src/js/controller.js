import 'core-js/stable';
import 'regenerator-runtime/runtime';
import * as model from './model';
import recipeView from './views/recipeView';
import searchView from './views/searchView';
import resultsView from './views/resultsView';
import bookmarksView from './views/bookmarksView';
import paginationView from './views/paginationView';
import addRecipesView from './views/addRecipesView';
import { MODAL_CLOSE_SEC } from './config';

const recipeContainer = document.querySelector('.recipe');

if (module.hot) {
  module.hot.accept();
}

// https://forkify-api.herokuapp.com/v2

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    //update results view to mark selected
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);

    //1. loading recipe

    await model.loadRecipe(id);

    // 2. Rendering recipe
    recipeView.render(model.state.recipe); // public render method since need to pass prop but object is not created here
  } catch (e) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    // 1) get search query
    const query = searchView.getQuery();
    if (!query) return;
    else resultsView.renderSpinner();

    // 2) loading search results
    await model.loadSearchResult(query);

    // 3) render results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    // 4) render pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err);
  }
};
controlSearchResults();

const controlPagination = function (gotoPage) {
  // render new results
  resultsView.render(model.getSearchResultsPage(gotoPage));

  // render new pagination
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // update recipe serving in data(state)
  model.updateServings(newServings);

  // update the recipe view
  recipeView.update(model.state.recipe);
  // update the view
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddBookmark = function () {
  // add remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  //update recipe view
  recipeView.update(model.state.recipe);

  //render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  addRecipesView.renderSpinner();
  try {
    addRecipesView.renderSpinner();

    // upload new recipe
    await model.uploadRecipe(newRecipe);

    //show recipe
    addRecipesView.render(model.state.recipe);

    // show success
    addRecipesView.renderMessage();

    //render bookmarks
    bookmarksView.render(model.state.bookmarks);

    //change url id
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    //close form window
    setTimeout(() => {
      addRecipesView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(err);
    addRecipesView.renderError();
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipesView.addHandlerUpload(controlAddRecipe);
};

init();

// window.addEventListener('hashchange', controlRecipes);
// window.addEventListener('load', controlRecipes);
