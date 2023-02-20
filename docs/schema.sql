DROP TABLE IF EXISTS Ingredient;
DROP TABLE IF EXISTS Recipe;
DROP TABLE IF EXISTS IngredientList;

CREATE TABLE Ingredient (
    ingredient_id INTEGER PRIMARY KEY,
    ingredient_name TEXT NOT NULL
);

CREATE TABLE Recipe (
    recipe_id INTEGER PRIMARY KEY,
    recipe_name TEXT NOT NULL,
    cal_per_serving INTEGER NOT NULL,
    cost_per_serving MONEY NOT NULL
);

CREATE TABLE IngredientList (
    recipe_id INTEGER NOT NULL,
    ingredient_id INTEGER NOT NULL,
    amount TEXT NOT NULL,
    PRIMARY KEY (recipe_id, ingredient_id),
    FOREIGN KEY (recipe_id) REFERENCES Recipe(recipe_id),
    FOREIGN KEY (ingredient_id) REFERENCES Ingredient(ingredient_id)
);