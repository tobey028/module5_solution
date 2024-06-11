(function (global) {

  var dc = {};

  var homeHtml = "snippets/home-snippet.html";
  var allCategoriesUrl = "https://davids-restaurant.herokuapp.com/categories.json";
  var categoriesTitleHtml = "snippets/categories-title-snippet.html";
  var categoryHtml = "snippets/category-snippet.html";
  var menuItemsUrl = "https://davids-restaurant.herokuapp.com/menu_items.json?category=";
  var menuItemsTitleHtml = "snippets/menu-items-title.html";
  var menuItemHtml = "snippets/menu-item.html";

  // Define an array of category short names
  var categoryShortNames = ['L', 'D', 'S', 'SP', 'A', 'B']; // Add more as needed

  // Function to get a random category short name
  function getRandomCategoryShortName() {
    var randomIndex = Math.floor(Math.random() * categoryShortNames.length);
    return categoryShortNames[randomIndex];
  }

  // Load the home page snippet
  dc.loadHomePage = function () {
    // Load the home-snippet.html snippet
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      homeHtml,
      function (responseText) {
        document.querySelector("#main-content")
          .innerHTML = responseText;
      },
      false); // false here because we are getting just regular HTML
  };

  // Load menu items for a given category
  dc.loadMenuItems = function (categoryShort) {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      menuItemsUrl + categoryShort,
      buildAndShowMenuItemsHTML);
  };

  // Function to load random menu items
  dc.loadRandomMenuItems = function () {
    var randomCategoryShortName = getRandomCategoryShortName();
    dc.loadMenuItems(randomCategoryShortName);
  };

  global.$dc = dc;

})(window);

document.addEventListener("DOMContentLoaded", function (event) {
  $dc.loadHomePage();
  var specialTile = document.querySelector(".specials-tile");
  specialTile.addEventListener("click", function(event) {
    $dc.loadRandomMenuItems();
  });
});

// Helper functions
function showLoading(selector) {
  var html = "<div class='text-center'>";
  html += "<img src='images/ajax-loader.gif'></div>";
  document.querySelector(selector).innerHTML = html;
}

function buildAndShowMenuItemsHTML(categoryMenuItems) {
  // Load title snippet of menu items page
  $ajaxUtils.sendGetRequest(
    menuItemsTitleHtml,
    function (menuItemsTitleHtml) {
      // Retrieve single menu item snippet
      $ajaxUtils.sendGetRequest(
        menuItemHtml,
        function (menuItemHtml) {
          var menuItemsViewHtml =
            buildMenuItemsViewHtml(categoryMenuItems,
                                   menuItemsTitleHtml,
                                   menuItemHtml);
          insertHtml("#main-content", menuItemsViewHtml);
        },
        false);
    },
    false);
}

function buildMenuItemsViewHtml(categoryMenuItems,
                                menuItemsTitleHtml,
                                menuItemHtml) {

  menuItemsTitleHtml =
    insertProperty(menuItemsTitleHtml,
                   "name",
                   categoryMenuItems.category.name);
  menuItemsTitleHtml =
    insertProperty(menuItemsTitleHtml,
                   "special_instructions",
                   categoryMenuItems.category.special_instructions);

  var finalHtml = menuItemsTitleHtml;
  finalHtml += "<section class='row'>";

  var menuItems = categoryMenuItems.menu_items;
  var catShortName = categoryMenuItems.category.short_name;
  for (var i = 0; i < menuItems.length; i++) {
    var html = menuItemHtml;
    html =
      insertProperty(html, "short_name", menuItems[i].short_name);
    html =
      insertProperty(html,
                     "catShortName",
                     catShortName);
    html =
      insertItemPrice(html,
                      "price_small",
                      menuItems[i].price_small);
    html =
      insertItemPrice(html,
                      "price_large",
                      menuItems[i].price_large);
    html =
      insertProperty(html,
                     "name",
                     menuItems[i].name);
    html =
      insertProperty(html,
                     "description",
                     menuItems[i].description);

    if (i % 2 != 0) {
      html +=
        "<div class='clearfix visible-lg-block visible-md-block'></div>";
    }

    finalHtml += html;
  }

  finalHtml += "</section>";
  return finalHtml;
}

// Helper for inserting HTML for individual menu item price
function insertItemPrice(html,
                         pricePropName,
                         priceValue) {
  if (!priceValue) {
    return insertProperty(html, pricePropName, "");
  }

  priceValue = "$" + priceValue.toFixed(2);
  html = insertProperty(html, pricePropName, priceValue);
  return html;
}

// Function to insert HTML
function insertHtml(selector, html) {
  var targetElem = document.querySelector(selector);
  targetElem.innerHTML = html;
}

// Function to insert property values into HTML snippets
function insertProperty(string, propName, propValue) {
  var propToReplace = "{{" + propName + "}}";
  string = string
    .replace(new RegExp(propToReplace, "g"), propValue);
  return string;
}
