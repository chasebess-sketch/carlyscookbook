export type TemplateField = {
  key: string;
  label: string;
  type: "text" | "textarea";
  rows?: number; // only for textarea
};

export type RecipeTemplate = {
  id: string;
  name: string;
  description: string;
  fields: TemplateField[];
};

export const RECIPE_TEMPLATES: RecipeTemplate[] = [
  {
    id: "classic",
    name: "Classic Recipe",
    description: "Title, time, servings, ingredients, steps, notes",
    fields: [
      { key: "title", label: "Recipe Title", type: "text" },
      { key: "time", label: "Time", type: "text" },
      { key: "servings", label: "Servings", type: "text" },
      { key: "ingredients", label: "Ingredients", type: "textarea", rows: 8 },
      { key: "steps", label: "Steps", type: "textarea", rows: 10 },
      { key: "notes", label: "Notes", type: "textarea", rows: 4 }
    ]
  },
  {
    id: "baking",
    name: "Baking",
    description: "Oven temp, pan size, ingredients, steps, tips",
    fields: [
      { key: "title", label: "Recipe Title", type: "text" },
      { key: "ovenTemp", label: "Oven Temp", type: "text" },
      { key: "panSize", label: "Pan Size", type: "text" },
      { key: "ingredients", label: "Ingredients", type: "textarea", rows: 8 },
      { key: "directions", label: "Directions", type: "textarea", rows: 10 },
      { key: "tips", label: "Tips", type: "textarea", rows: 4 }
    ]
  },
  {
    id: "mealprep",
    name: "Meal Prep",
    description: "Servings, macros, ingredients, steps, storage",
    fields: [
      { key: "title", label: "Recipe Title", type: "text" },
      { key: "servings", label: "Servings", type: "text" },
      { key: "macros", label: "Macros", type: "text" },
      { key: "ingredients", label: "Ingredients", type: "textarea", rows: 8 },
      { key: "steps", label: "Steps", type: "textarea", rows: 10 },
      { key: "storage", label: "Storage", type: "textarea", rows: 4 }
    ]
  },
  {
    id: "drink",
    name: "Drink",
    description: "Glass, ingredients, method, garnish",
    fields: [
      { key: "title", label: "Drink Name", type: "text" },
      { key: "glass", label: "Glass", type: "text" },
      { key: "ingredients", label: "Ingredients", type: "textarea", rows: 6 },
      { key: "method", label: "Method", type: "textarea", rows: 8 },
      { key: "garnish", label: "Garnish", type: "text" }
    ]
  }
];
