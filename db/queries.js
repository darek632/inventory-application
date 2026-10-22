const pool = require("./pool");

async function getAllParts() { 

    const {rows} = await pool.query(
        `SELECT parts.*,
           brands.name AS brand,
           categories.name AS category
    FROM parts
    JOIN brands ON parts.brand_id = brands.id
    JOIN categories ON parts.category_id = categories.id
    ORDER BY parts.id`
    );
    return rows;
}

async function getAllBrands() { 
    const { rows} = await pool.query(`
        SELECT * FROM brands ORDER BY name`);
    
        return rows;
   
}

async function getOneBrand(id) { 
    const {rows} = await pool.query(` SELECT * FROM brands WHERE id = $1`, [id]);
    return rows[0];

}

async function getBrandItems(brandId) {

    const {rows} = await pool.query(
        `SELECT parts.*,categories.name AS category
        FROM parts 
        JOIN categories ON parts.category_id = categories.id 
        WHERE parts.brand_id = $1`, [brandId]);

    return rows;

}

async function getAllCategories() { 

     const { rows} = await pool.query(`
        SELECT * FROM categories ORDER BY name`);
    
        return rows;

}


async function getOneCategory(id) { 
      const {rows} = await pool.query(` SELECT * FROM categories WHERE id = $1`, [id]);
    return rows[0];

}

async function getCategoryItems(categoryId) {
      const {rows} = await pool.query(
        `SELECT parts.*,brands.name AS brand
        FROM parts 
        JOIN brands ON parts.brand_id = brands.id 
        WHERE parts.category_id = $1`, [categoryId]);

    return rows;


}
 
async function getPart(id) { 
    const {rows} = await pool.query(
        `SELECT parts.*, brands.name AS brand, categories.name AS category
        FROM parts
        JOIN brands ON parts.brand_id = brands.id 
        JOIN categories ON parts.category_id = categories.id
        WHERE parts.id = $1`, [id]);

    return rows[0];

}

// ALL GET queries

// POST queries - add new or edit existing item

async function insertPart({name, description, price, quantity,brand_id, category_id}) { 
    const {rows} = await pool.query(
        `INSERT INTO parts (name,description,price,quantity,brand_id,category_id)
        VALUES($1,$2,$3,$4,$5,$6)
        RETURNING id`, [name,description||null,price,quantity,brand_id,category_id]);
    
    return rows[0].id;
}

async function updatePart(id, { name, description, price, quantity, brand_id, category_id }) {
  const { rowCount } = await pool.query(
    `UPDATE parts
     SET name = $1, description = $2, price = $3,
         quantity = $4, brand_id = $5, category_id = $6
     WHERE id = $7`,
    [name, description || null, price, quantity, brand_id, category_id, id]
  );
  return rowCount;
}

async function insertBrand({ name, description }) {
  const { rows } = await pool.query(
    "INSERT INTO brands (name, description) VALUES ($1, $2) RETURNING id",
    [name, description || null]
  );
  return rows[0].id;
}

async function updateBrand(id, { name, description }) {
  const { rowCount } = await pool.query(
    "UPDATE brands SET name = $1, description = $2 WHERE id = $3",
    [name, description || null, id]
  );
  return rowCount;
}

async function insertCategory({ name, description }) {
  const { rows } = await pool.query(
    "INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id",
    [name, description || null]
  );
  return rows[0].id;
}
 
async function updateCategory(id, { name, description }) {
  const { rowCount } = await pool.query(
    "UPDATE categories SET name = $1, description = $2 WHERE id = $3",
    [name, description || null, id]
  );
  return rowCount;
}

async function deletePart(id) { 
    const {rowCount} = await pool.query("DELETE FROM parts WHERE id = $1", [id]);
    //DELETE query returns the number of rows that were deleted.
    //rowCount will either be 0 if failed or 1 if sucessful.
    return rowCount;
}

async function deleteBrand(id) {
    const {rowCount} = await pool.query("DELETE FROM brands WHERE id = $1", [id]);
    return rowCount;

}

async function deleteCategory(id) { 
     const {rowCount} = await pool.query("DELETE  FROM categories WHERE id = $1", [id])

     return rowCount;
}



module.exports = { 
    getAllParts,
    getAllBrands,
    getOneBrand,
    getBrandItems,
    getAllCategories,
    getOneCategory,
    getCategoryItems,
    getPart,
    insertPart,
    updatePart,
    insertBrand,
    updateBrand,
    insertCategory,
    updateCategory,
    deletePart,
    deleteBrand,
    deleteCategory,
}