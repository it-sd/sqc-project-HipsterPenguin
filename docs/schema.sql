DROP TABLE IF EXISTS IngredientList;
DROP TABLE IF EXISTS Ingredient;
DROP TABLE IF EXISTS StepList;
DROP TABLE IF EXISTS Recipe;


CREATE TABLE Ingredient (
    ingredient_id SERIAL PRIMARY KEY,
    ingredient_name TEXT NOT NULL
);

CREATE TABLE Recipe (
    recipe_id SERIAL PRIMARY KEY,
    recipe_name TEXT NOT NULL
);

CREATE TABLE IngredientList (
    recipe_id INTEGER NOT NULL,
    ingredient_id INTEGER NOT NULL,
    amount TEXT NOT NULL,
    PRIMARY KEY (recipe_id, ingredient_id),
    FOREIGN KEY (recipe_id) REFERENCES Recipe(recipe_id),
    FOREIGN KEY (ingredient_id) REFERENCES Ingredient(ingredient_id)
);

CREATE TABLE StepList (
    step_id SERIAL NOT NULL,
    recipe_id INTEGER NOT NULL,
    step_text TEXT NOT NULL,
    PRIMARY KEY (recipe_id, step_id),
    FOREIGN KEY (recipe_id) REFERENCES Recipe(recipe_id)
);

-- Test data
INSERT INTO Ingredient (ingredient_name) VALUES ('Cheddar Cheese'), ('Flour Tortilla');
INSERT INTO Recipe (recipe_name) VALUES ('Cheese Roll Up');
INSERT INTO IngredientList (recipe_id, ingredient_id, amount) VALUES (1, 1, '1 cup'), (1, 2, '1 Tortilla');;
INSERT INTO StepList (recipe_id, step_text)VALUES (1, '1.Roll up cheese in tortilla 2.Heat in microwave for 30 seconds 3.Cut into 4 pieces');
