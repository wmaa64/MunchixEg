import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const Context = createContext();

export const StateContext = ({ children }) => {
    const [showCart, setShowCart] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [totalQuantities, setTotalQuantities] = useState(0);
    const [qty, setQty] = useState(1);

    // 🔹 New global user state
    const [userInfo, setUserInfo] = useState(null);
  
    // Load from localStorage at startup
    useEffect(() => {
        const storedUser = localStorage.getItem("userInfo");
        if (storedUser) setUserInfo(JSON.parse(storedUser));
    }, []);

    // Save to localStorage whenever userInfo changes
    useEffect(() => {
        if (userInfo) localStorage.setItem("userInfo", JSON.stringify(userInfo));
        else localStorage.removeItem("userInfo");
    }, [userInfo]);

    // Logout function
    const logoutUser = () => {
        setUserInfo(null);
        localStorage.removeItem("userInfo");
        toast.success("Logged out successfully!");
    };
    
    let foundProduct;
    let index;

const onAdd = (product, quantity) => {
  const checkProductInCart = cartItems.find((item) => item._id === product._id);

  setTotalPrice(
    (prevTotalPrice) => prevTotalPrice + product.price * quantity
  );
  setTotalQuantities(
    (prevTotalQuantities) => prevTotalQuantities + quantity
  );

  if (checkProductInCart) {
    // ✅ properly return for all items, not just matched one
    const updatedCartItems = cartItems.map((cartProduct) => {
      if (cartProduct._id === product._id) {
        // Merge data safely (keep selectedCategories if new one has them)
        return {
          ...cartProduct,
          quantity: cartProduct.quantity + quantity,
          selectedCategories:
            product.selectedCategories || cartProduct.selectedCategories,
        };
      } else {
        return cartProduct;
      }
    });

    setCartItems(updatedCartItems);
  } else {
    // ✅ new product (meal or normal)
    const newProduct = {
      ...product,
      quantity,
      selectedCategories: product.selectedCategories || [],
    };
    setCartItems([...cartItems, newProduct]);
  }

  // ✅ safer toast message
  toast.success(
    `${quantity} ${product.name?.en || product.name} added to the cart.`
  );
};


    /*
    const onAdd = (product, quantity) => {
        const checkProductInCart = cartItems.find((item) => item._id === product._id );

        setTotalPrice((prevTotalPrice) => prevTotalPrice + product.price * quantity);
        setTotalQuantities((prevTotalQuantities) => prevTotalQuantities + quantity);

        if (checkProductInCart) {
            const updatedCartItems = cartItems.map((cartProduct) => {
                if (cartProduct._id === product._id)
                return { ...cartProduct, quantity: cartProduct.quantity + quantity, };
            });
            setCartItems(updatedCartItems);
        } else {
            product.quantity = quantity;
            setCartItems([...cartItems, { ...product }]);
        }
        
        toast.success(`${qty} ${product.name.en} added to the cart.`);
    };
*/
    const onRemove = (product) => {
        foundProduct = cartItems.find((item) => item._id === product._id);
        const newCartItems = cartItems.filter((item) => item._id !== product._id);
        setTotalPrice((prevTotalPrice) => prevTotalPrice - foundProduct.price * foundProduct.quantity);
        setTotalQuantities((prevTotalQuantities) => prevTotalQuantities - foundProduct.quantity);
        setCartItems(newCartItems);
    };

    const toggleCartItemQuantity = (id, value) => {
        foundProduct = cartItems.find((item) => item._id === id);
        index = cartItems.findIndex((product) => product._id === id);
        const newCartItems = cartItems.filter((item) => item._id !== id);
        
        if (value === "inc") {
            setCartItems([ ...newCartItems, { ...foundProduct, quantity: foundProduct.quantity + 1 },]);
            setTotalPrice((prevTotalPrice) => prevTotalPrice + foundProduct.price);
            setTotalQuantities((prevTotalQuantities) => prevTotalQuantities + 1);
        } else if (value === "dec") {
            if (foundProduct.quantity > 1) {
                setCartItems([ ...newCartItems, { ...foundProduct, quantity: foundProduct.quantity - 1 },]);                
                setTotalPrice((prevTotalPrice) => prevTotalPrice - foundProduct.price);
                setTotalQuantities((prevTotalQuantities) => prevTotalQuantities - 1);
            }
        }
    };

    const incQty = () => {
        setQty((prevQty) => prevQty + 1);
    };

    const decQty = () => {
        setQty((prevQty) => {
            if (prevQty - 1 < 1) return 1;
            return prevQty - 1;
        });
    };

return (
    <Context.Provider
        value={{showCart, setShowCart, cartItems, totalPrice, totalQuantities, qty, userInfo, setUserInfo, logoutUser,
        incQty, decQty, onAdd, toggleCartItemQuantity, onRemove,
        setCartItems, setTotalPrice, setTotalQuantities,
        }}
    >
        {children}
    </Context.Provider>
);
};

export const useStateContext = () => useContext(Context);    
