//1. import router from express
//2. call router on our router variable
// 3.require controller functions to direct the server to execute 
// these during a routed request
const { Router } = require("express");
const inventoryController = require("../controllers/inventoryController");
const inventoryRouter = Router();

// all
inventoryRouter.get("/", inventoryController.inventoryGet);

//parts

inventoryRouter.get("/parts/new", inventoryController.partNewGet);
inventoryRouter.post("/parts/new", inventoryController.partNewPost);

inventoryRouter.get("/parts/:id", inventoryController.onePartGet);

inventoryRouter.get("/parts/:id/edit", inventoryController.partEditGet);
inventoryRouter.post("/parts/:id/edit", inventoryController.partEditPost);



//brands

inventoryRouter.get("/brands",inventoryController.allBrandsGet);

inventoryRouter.get("/brands/new", inventoryController.brandNewGet);
inventoryRouter.post("/brands/new", inventoryController.brandNewPost);

inventoryRouter.get("/brands/:id", inventoryController.oneBrandGet);

inventoryRouter.get("/brands/:id/edit", inventoryController.brandEditGet);
inventoryRouter.post("/brands/:id/edit", inventoryController.brandEditPost);


//categories

inventoryRouter.get("/categories", inventoryController.allCategoriesGet);

inventoryRouter.get("/categories/new", inventoryController.categoryNewGet);
inventoryRouter.post("/categories/new", inventoryController.categoryNewGet);

inventoryRouter.get("/categories/:id", inventoryController.oneCategoryGet);

inventoryRouter.get("/categories/:id/edit", inventoryController.categoryEditGet);
inventoryRouter.post("/categories/:id/edit", inventoryController.categoryEditPost);

inventoryRouter.post("/parts/:id/delete",inventoryController.partDeletePost);
inventoryRouter.post("/brands/:id/delete",inventoryController.brandDeletePost);
inventoryRouter.post("/categories/:id/delete",inventoryController.categoryDeletePost);





module.exports = inventoryRouter;