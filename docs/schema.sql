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
    recipe_name TEXT NOT NULL,
    cal_per_serving INTEGER NOT NULL,
    cost_per_serving MONEY NOT NULL
);

CREATE TABLE IngredientList (
    recipe_id SERIAL NOT NULL,
    ingredient_id INTEGER NOT NULL,
    amount TEXT NOT NULL,
    PRIMARY KEY (recipe_id, ingredient_id),
    FOREIGN KEY (recipe_id) REFERENCES Recipe(recipe_id),
    FOREIGN KEY (ingredient_id) REFERENCES Ingredient(ingredient_id)
);

CREATE TABLE StepList (
    recipe_id SERIAL NOT NULL,
    step_number INTEGER NOT NULL,
    step_text TEXT NOT NULL,
    PRIMARY KEY (recipe_id, step_number),
    FOREIGN KEY (recipe_id) REFERENCES Recipe(recipe_id)
);

-- Test data
INSERT INTO Ingredient (ingredient_name) VALUES ('Cheddar Cheese'), ('Flour Tortilla');
INSERT INTO Recipe (recipe_name, cal_per_serving, cost_per_serving) VALUES ('Cheese Roll Up', 100, 1.00);
INSERT INTO IngredientList (recipe_id, ingredient_id, amount) VALUES (1, 1, '1 cup'), (1, 2, '1 Tortilla');;
INSERT INTO StepList (recipe_id, step_number, step_text) VALUES (1, 1, 'Roll up cheese in tortilla');
INSERT INTO StepList (recipe_id, step_number, step_text) VALUES (1, 2, 'Cut into 4 pieces');
