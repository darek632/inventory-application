const { body, validationResult, matchedData } = require("express-validator");
const db = require("../db/queries");

// here will be a list of all of my controller functions. 

//express-validator validator functions

const validatePart = [
  body("name").trim()
    .notEmpty().withMessage("Name is required.")
    .isLength({ max: 100 }).withMessage("Name must be 100 characters or fewer."),
  body("description").optional({ values: "falsy" }).trim()
    .isLength({ max: 500 }).withMessage("Description must be 500 characters or fewer."),
  body("price")
    .isFloat({ min: 0, max: 99999999.99 }).withMessage("Price must be a number of 0 or more."),
  body("quantity")
    .isInt({ min: 0 }).withMessage("Quantity must be a whole number of 0 or more."),
  body("brand_id")
    .isInt({ min: 1 }).withMessage("Choose a brand.")
    .bail()
    .custom(async (value) => {
      if (!(await db.getBrand(value))) throw new Error("That brand does not exist.");
    }),
  body("category_id")
    .isInt({ min: 1 }).withMessage("Choose a category.")
    .bail()
    .custom(async (value) => {
      if (!(await db.getCategory(value))) throw new Error("That category does not exist.");
    }),
];

const validateBrand = [
  body("name").trim()
    .notEmpty().withMessage("Name is required.")
    .isLength({ max: 100 }).withMessage("Name must be 100 characters or fewer."),
  body("description").optional({ values: "falsy" }).trim()
    .isLength({ max: 500 }).withMessage("Description must be 500 characters or fewer."),
];

const validateCategory = validateBrand;


// for brand and category dropdowns for adding/editing parts
//...data used to combine everything passed to the function into a data object. 
// this will then later be used to access for rendering.

//helper to use same form for edit and new but with different data

async function renderPartForm(res, { status = 200, ...data }) {
  const [brands, categories] = await Promise.all([
    db.getAllBrands(),
    db.getAllCategories(),
  ]);
  res.status(status).render("parts/form", { ...data, brands, categories });
}

// ALL GET controllers

exports.partNewGet = async (req, res) => {
  await renderPartForm(res, { title: "Add part", action: "/parts/new", part: {} });
};




exports.inventoryGet = async (req,res) => { 

    const allParts = await db.getAllParts();

    
    res.render("index", {title: "Bike parts", allParts})
};

exports.allBrandsGet = async (req,res) => { 
    const allBrands = await db.getAllBrands();

    res.render("brands/index", {title: "All brands", brands: allBrands})

}

exports.oneBrandGet = async (req,res) => { 

    const {id} = req.params;

    if(!Number.isInteger(Number(id))) {
        return res.status(404).send("Brand not found");
    }

    const brand = await db.getOneBrand(id); 

    if(!brand) { 
        return res.status(404).send("Brand not found");
    }

    const brandItems = await db.getBrandItems(id);

    res.render("brands/brand", {brand, brandItems})

}

exports.allCategoriesGet = async (req,res) => { 
    const allCategories = await db.getAllCategories();

    res.render("categories/index", {title: "All categories", categories: allCategories});
}

exports.oneCategoryGet = async (req,res) => { 
    const {id} = req.params;
    if(!Number.isInteger(Number(id))) {
        return res.status(404).send("Brand not found");
    }
    const category = await db.getOneCategory(id);

    if (!category) {
        return res.status(404).send("Category not found");
    }

    const categoryItems = await db.getCategoryItems(id);

    res.render("categories/category", {category, categoryItems})

}

exports.onePartGet = async (req, res) => {
  const { id } = req.params;

  if (!Number.isInteger(Number(id))) {
    return res.status(404).send("Part not found");
  }

  const part = await db.getPart(id);
  if (!part) {
    return res.status(404).send("Part not found");
  }

  res.render("parts/part", { title: part.name, part });
};

//EDIT/ POST "part" controllers

exports.partNewPost = [
    validatePart, async (req,res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
      return renderPartForm(res, {
        status: 400,
        title: "Add part",
        action: "/parts/new",
        part: req.body,
        errors: errors.array(),
      });

    }
   const id = await db.insertPart(matchedData(req));
   res.redirect(`/parts/${id}`);
    },
];

exports.partEditGet = async (req, res) => {
  const { id } = req.params;
  if (!Number.isInteger(Number(id))) return res.status(404).send("Part not found");

  const part = await db.getPart(id);
  if (!part) return res.status(404).send("Part not found");

  await renderPartForm(res, {
    title: `Edit ${part.name}`,
    action: `/parts/${id}/edit`,
    part,
  });
};

exports.partEditPost = [
    validatePart, 
    async (req,res) => { 
        const {id} = req.params;

        if(!Number.isInteger(Number(id))) return res.status(404).send("Part not found");

        const errors = validationResult(req);
        if(!errors.isEmpty()) { 

            return renderPartForm(res, {
            status: 400,
            title: "Edit part",
            action: `/parts/${id}/edit`,
            part: {...req.body,id},
            errors: errors.array(),
            });
        }

        const updated = await db.updatePart(id,matchedData(req));
        if (!updated) return res.status(404).send("Part not found");
        res.redirect(`/parts/${id}`);
        
    }
];

// EDIT/POST "brand" controllers

const renderBrandForm = (res, {status = 200,...data}) => 
    res.status(status).render("brands/form",data);

exports.brandNewGet = (req,res) => { 
    renderBrandForm(res,{title:"Add brand", action :"/brands/new", brand: {}});

}

exports.brandNewPost = [
    validateBrand,
    async (req,res) => {
        const form = {title: "Add brand", action: "/brands/new", brand: req.body};
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            return renderBrandForm(res, {status: 400,...form,errors: errors.array()})
        }

        try {
            const id = await db.insertBrand(matchedData(req));
            res.redirect(`/brands/${id}`);

        } catch (err) {
            if(err.code !== "23505") throw err;
            renderBrandForm(res, {
                status: 400,
                ...form,
                errors: [{msg: "A brand with that name already exists"}],
            });
        }
    },
]

exports.brandEditGet = async (req,res) => {
    const {id} =  req.params;

    const brand = await db.getOneBrand(id);

    renderBrandForm(res, {
        title: `Edit ${brand.name}`,
        action: `/brands/${id}/edit`,
        brand,
    });

    // the request-response cycle ends by calling res.render within the helper function renderbrandform

};

exports.brandEditPost = [
  validateBrand,
  async (req, res) => {
    const { id } = req.params;
    if (!Number.isInteger(Number(id))) return res.status(404).send("Brand not found");

    const form = { title: "Edit brand", action: `/brands/${id}/edit`, brand: { ...req.body, id } };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return renderBrandForm(res, { status: 400, ...form, errors: errors.array() });
    }
    try {
      const updated = await db.updateBrand(id, matchedData(req));
      if (!updated) return res.status(404).send("Brand not found");
      res.redirect(`/brands/${id}`);
    } catch (err) {
      if (err.code !== "23505") throw err;
      renderBrandForm(res, {
        status: 400,
        ...form,
        errors: [{ msg: "A brand with that name already exists." }],
      });
    }
  },
];

//EDIT/POST controllers for categories

const renderCategoryForm = (res, { status = 200, ...data }) =>
  res.status(status).render("categories/form", data);

exports.categoryNewGet = (req, res) => {
  renderCategoryForm(res, { title: "Add category", action: "/category/new", category: {} });
};


exports.categoryNewPost = [
    validateCategory,
    async (req,res) => {
        const form = {title: "Add category",action: "/categories/new",category: req.body}
          const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return renderCategoryForm(res, { status: 400, ...form, errors: errors.array() });
    }
 
    try {
      const id = await db.insertCategory(matchedData(req));
      res.redirect(`/categories/${id}`);
    } catch (err) {
      if (err.code !== "23505") throw err; // 23505 = unique violation
      renderCategoryForm(res, {
        status: 400,
        ...form,
        errors: [{ msg: "A category with that name already exists." }],
      });
    }
  },
    
]

exports.categoryEditGet = async (req,res) => { 
    const {id} = req.params;

    if(!Number.isInteger(Number(id))) return res.status(404).send("Category not found");

    const category = await db.getOneCategory(id);
    if (!category) return res.status(404).send("Category not found");
 
  renderCategoryForm(res, {
    title: `Edit ${category.name}`,
    action: `/categories/${id}/edit`,
    category,
  });


};

exports.categoryEditPost = [
  validateCategory,
  async (req, res) => {
    const { id } = req.params;
    if (!Number.isInteger(Number(id))) return res.status(404).send("Category not found");
 
    const form = {
      title: "Edit category",
      action: `/categories/${id}/edit`,
      category: { ...req.body, id },
    };
 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return renderCategoryForm(res, { status: 400, ...form, errors: errors.array() });
    }
 
    try {
      const updated = await db.updateCategory(id, matchedData(req));
      if (!updated) return res.status(404).send("Category not found");
      res.redirect(`/categories/${id}`);
    } catch (err) {
      if (err.code !== "23505") throw err;
      renderCategoryForm(res, {
        status: 400,
        ...form,
        errors: [{ msg: "A category with that name already exists." }],
      });
    }
  },
];

exports.partDeletePost = async (req,res) => { 
    const {id} = req.params;

    if(!Number.isInteger(Number(id))) return res.status(404).send("Part not found");

    await db.deletePart(id);

    res.redirect("/");
};

exports.brandDeletePost = async (req,res) => { 
    const {id} = req.params;

      if (!Number.isInteger(Number(id))) return res.status(404).send("Brand not found");

      try {
        const deleted = await db.deleteBrand(id);
        if(!deleted) return res.status(404).send("Brand not found");
        res.redirect("/brands");
      } catch (err) {
        if (err.code !== "23503") throw err;
        res.status(409).send("This brand still has parts. Move or delete them first.")
      }

}

exports.categoryDeletePost = async (req,res) => { 
    const {id} = req.params;

      if (!Number.isInteger(Number(id))) return res.status(404).send("Category not found");

      try {
        const deleted = await db.deleteCategory(id);
        if(!deleted) return res.status(404).send("Category not found");
        res.redirect("/categories");
      } catch (err) {
        if (err.code !== "23503") throw err;
        res.status(409).send("This category still has parts. Move or delete them first.")
      }

}

//update views for anchor tags/buttons and redirects 







