import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useStateContext } from "../../../context/StateContext";
import { useTranslation } from "react-i18next";
import { Button, IconButton } from "@mui/material";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";

const MealBuilder = () => {
  const router = useRouter();
  const { i18n } = useTranslation();
  const { id } = router.query;
  const [meal, setMeal] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const { decQty, incQty, qty, onAdd, setShowCart } = useStateContext();

  useEffect(() => {
    if (!id) return;

    const fetchMeal = async () => {
      try {
        const mealRes = await fetch(`/api/products/${id}`);
        const mealData = await mealRes.json();

        const allProductsRes = await fetch("/api/products");
        const allData = await allProductsRes.json();

        setMeal(mealData);
        setAllProducts(allData);
      } catch (error) {
        console.error("Error loading meal:", error);
      }
    };

    fetchMeal();
  }, [id]);

  const isRTL = i18n.language === "ar"; // true if Arabic

  // Quantity adjustment per sub-item
  const handleQuantityChange = (category, productId, delta, maxQty) => {
    setSelectedItems((prev) => {
      const current = prev[category]?.[productId]?.quantity || 0;
      const newQty = Math.max(0, Math.min(maxQty, current + delta));


      const newState = {
          ...prev,
          [category]: {
            ...prev[category],
            [productId]: newQty > 0 ? { quantity: newQty } : undefined,
          },
      };
  
      console.log("🧩 updated selectedItems:", newState);
      return newState;
    });
  };

  // Validation before adding to basket
  const validateSelections = () => {
    if (!meal) return false;
    for (let comp of meal.mealComponents) {
      const categoryItems = Object.values(selectedItems[comp.category] || {}).filter(
        (item) => item && typeof item.quantity === "number"
      );
      const selectedCount = categoryItems.reduce(
        (sum, item) => sum + (item.quantity || 0),
        0
      );
      if (selectedCount !== comp.quantity) {
        alert(
          `Please select ${comp.quantity} item(s) for ${comp.category}. Currently selected: ${selectedCount}`
        );
        return false;
      }
    }
    return true;
  };

const handleAddMeal = () => {
  if (!validateSelections()) return;

  // Build selectedCategories from current selectedItems state
  const selectedCategories = Object.entries(selectedItems)
    .map(([category, productsMap]) => {
      const selectedItemsList = Object.entries(productsMap)
        .map(([productId, { quantity }]) => {
          if (!quantity || quantity <= 0) return null;
          const product = allProducts.find((p) => p._id === productId);
          if (!product) return null; 
          return {
            product: {
              _id: product._id,
              name: product.name,
              price: product.price,
              image: product.image,
            },
            quantity,
          };
        })
        .filter(Boolean);

      return selectedItemsList.length > 0
        ? { category, selectedItems: selectedItemsList }
        : null;
    })
    .filter(Boolean);

  console.log("✅ Built selectedCategories:", selectedCategories);

  const selectedTotal = selectedCategories.reduce(
    (sum, cat) =>
      sum +
      cat.selectedItems.reduce(
        (s, si) => s + (si.product?.price || 0) * si.quantity,
        0
      ),
    0
  );

  const totalPrice =
    meal.price > 0
      ? meal.price + (meal.overprice || 0)
      : selectedTotal + (meal.overprice || 0);

  const summary = (meal.overprice != 0)?  
        (selectedCategories.map((cat) =>
          `${cat.category}: ${cat.selectedItems.map((si) => 
              `${si.quantity}x ${si.product?.name?.en  || si.product?.name} @ ${si.product?.price } EGP`
            ).join(" + ")}`
        ).join(" | ")).concat( ` | Overprice: ${meal.overprice} EGP` )

      : (selectedCategories.map((cat) =>
          `${cat.category}: ${cat.selectedItems
            .map(
              (si) => `${si.quantity}x ${si.product?.name?.en  || si.product?.name}`
            ).join(" + ")}`
        ).join(" | "));


  const fullMeal = {
    ...meal,
    producttype: "meal",
    selectedCategories,
    price: totalPrice,
    totalPrice,
    quantity: qty,
    image: meal.image,
    displayName: `${meal.name.en} (${summary})`,
  };

  console.log("🧾 Adding meal to cart:", fullMeal);

  onAdd(fullMeal, qty);
  //setShowCart(true);
  alert(`Meal added to basket! Total: ${totalPrice} EGP`);
  router.push("/checkout");
  
};


  if (!meal) return <p>Loading meal details...</p>;

  return (
    <div className="meal-construction-wrapper"  dir={isRTL ? "rtl" : "ltr"}>

      <h1>{isRTL ? meal.name.ar : meal.name.en}</h1>
      
      <img  src={meal.image}  alt={isRTL ? meal.name.ar : meal.name.en}/>

      <p>{isRTL ? meal.description.ar : meal.description.en}</p>

      <h2>{isRTL ? "بناء طعامك" : "Build Your Meal"}</h2>

      {/* Render categories */}
      {meal.mealComponents.map((comp, index) => (
        <div  className="meal-main-categories"    key={index} >
          
          <h3> {comp.category.toUpperCase()} (Choose {comp.quantity})  </h3>

          <div className="meal-category" >
            {allProducts
              .filter((p) =>
                comp.products.map((pid) => pid.toString()).includes(p._id)
              )
              .map((p) => {
                const qtySelected =
                  selectedItems[comp.category]?.[p._id]?.quantity || 0;
                return (
                  <div  className="category-card"
                    key={p._id}
                    style={{
                      border:
                        qtySelected > 0 ? "2px solid #f02d34" : "1px solid #ccc",
                      borderRadius: "10px",
                      padding: "10px",
                      width: "160px",
                      textAlign: "center",
                    }}
                  >
                    <img
                      src={p.image}
                      alt={p.name.en}
                      style={{ width: "100%", height: "100px", objectFit: "cover", borderRadius: "8px", }}
                    />

                    <p>{isRTL ? p.name.ar : p.name.en}</p>
                    <p>{p.price} {isRTL ? "ج.م" : "EGP"}</p>

                    {/* Quantity per subitem */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <IconButton
                        size="medium"
                        onClick={() =>
                          handleQuantityChange(
                            comp.category,
                            p._id,
                            -1,
                            comp.quantity
                          )
                        }
                      >
                        <AiOutlineMinus className="minus-plus"/>
                      </IconButton>

                      <span>{qtySelected}</span>

                      <IconButton
                        size="medium"
                        onClick={() =>
                          handleQuantityChange(
                            comp.category,
                            p._id,
                            1,
                            comp.quantity
                          )
                        }
                      >
                        <AiOutlinePlus className="minus-plus"/>
                      </IconButton>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}

      {/* Overall meal quantity */}
      <div className="overall-meal-section" style={{ marginTop: "30px" }}>
        
        <h3>{ isRTL ? "الكمية من الوجبة" : "Meal Quantity:"}</h3>
        
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <IconButton size="small" onClick={decQty}>
            <AiOutlineMinus className="minus-plus"/>
          </IconButton>

          <span>{qty}</span>

          <IconButton size="small" onClick={incQty}>
            <AiOutlinePlus className="minus-plus"/>
          </IconButton>
        </div>
      </div>

      <Button 
        variant="contained"
        color="primary"
        onClick={handleAddMeal}
        sx={{ marginTop: "20px",  
              fontSize: {
                xs: "35px",
                sm: "16px",
              },
        }}
      >
        {isRTL ? "إضافة الوجبة إلى السلة" : "Add Meal to Basket"}
      </Button>

    </div>
  );
};

export default MealBuilder;
