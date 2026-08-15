import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Product from "../components/Product"; // adjust path if needed

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subcatname, setSubcatname] = useState("");

  const router = useRouter();
  const { subcategoryId } = router.query;

  // ✅ Fetch data client-side from API route
  useEffect(() => {
  if (!subcategoryId) return; // wait until router is ready

    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/products?subcategoryId=${subcategoryId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await res.json();
        setProducts(data);
        setSubcatname(data.length > 0 ? data[0].subcategoryId.name.en : "");

      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [subcategoryId]);

  if (loading) {
    return <p>Loading products...</p>;
  }

  return (
    <div>
      <div className="products-heading">
        <h2>Shop</h2>
        <p>Browse for products of {subcatname} </p>
      </div>

      <div className="products-container">
        {products.length > 0 ? (
          products.map((product) => (
            <Product key={product._id} product={product} />
          ))
        ) : (
          <p>No products available</p>
        )}
      </div>
    </div>
  );
};

export default Shop;







/*
import React from "react";
import connectDB from "../../lib/db" ;
import Product  from "../components/Product"; // adjust path if needed

const Shop = ({ products }) => (
  <div>
    <div className="products-heading">
      <h2>Shop</h2>
      <p>Browse for products</p>
    </div>

    <div className="products-container">
      {products?.length > 0 ? (
        products.map((product) => (
          <Product key={product._id} product={product} />
        ))
      ) : (
        <p>No products available</p>
      )}
    </div>
  </div>
);

// ✅ Fetch data server-side from your new Next.js API route
export const getServerSideProps = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://${context.req.headers.host}`; // dynamic fallback
  await connectDB();
  
  const res = await fetch(`${baseUrl}/api/products`);
  const products = await res.json();

  return {
    props: { products },
  };
};

export default Shop;
*/


/*
import React from "react";
import { client } from "../../lib/client";
import {Product} from "../components";

const Shop = ({ products }) => (
<div>
    <div className="products-heading">
        <h2>Shop</h2>
        <p>Browse for products</p>
    </div>
    <div className="products-container">
        {products?.map((product) => (
        <Product key={product._id} product={product} />
        ))}
    </div>
</div>
);

export const getServerSideProps = async ({req,res}) => {
    const query = '*[_type == "product"]';
    const products = await client.fetch(query);

    res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=59');
    
    return {
        props: { products }
    };
}

export default Shop;
*/