import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useStateContext } from "../../context/StateContext";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";

const NavBar = () => {
    const { t } = useTranslation();
    const { userInfo } = useStateContext();
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const { i18n } = useTranslation();
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const fetchSubcategories = async () => {
        try {
            const res = await fetch("/api/subcategories");
            if (!res.ok) {
            throw new Error("Failed to fetch subcategories");
            }
            const data = await res.json();
            setSubcategories(data);
        } catch (error) {
            console.error("Error fetching subcategories:", error);
        } finally {
            setLoading(false);
        }
        };
    
        fetchSubcategories();
    }, []);
 
    if (!mounted) return null; // 🔥 prevents hydration error

    const isRTL = i18n.language === "ar"; // true if Arabic


const handleSearch = (e) => {
    e.preventDefault();

    if (!search.trim()) return;

    router.push(`/search?q=${encodeURIComponent(search)}`);
};

  
return (

<div className="navbar-container"  dir={isRTL ? "rtl" : "ltr"}>

    {userInfo ? (
    <div style={{ paddingLeft: 10, fontSize: 16 }}>
        <span style={{ marginRight: 8 }}>{t("welcome")}</span>
        <strong>{(userInfo.name).substring(0, (userInfo.name).indexOf(' '))}</strong>
    </div>
    ) : (
    /* you can replace with login/signup links/buttons if needed */
    <div style={{ paddingLeft: 10, fontSize: 14, opacity: 0.9 }}>{t("guest")}</div>
    )}

    <div className="navbar-top-row">

        <div className="navbar-links">
            <Link href="/" className="navbar-link">
                {isRTL ? "الرئيسية" : "Home"}
            </Link>

            {userInfo && (
                <Link href="/myorders" className="navbar-link">
                    {isRTL ? "طلباتي" : "My Orders"}
                </Link>
            )}
        </div>

        <form className="navbar-search" onSubmit={handleSearch}>
            <input
                type="text"
                placeholder={
                    isRTL
                        ? "ابحث عن منتج..."
                        : "Search product..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <button type="submit">
                {isRTL ? "بحث" : "Search"}
            </button>
        </form>

    </div>
    
    <div>
        {userInfo?.isAdmin ? 
            (
                <div className="subcategory-menu">
                    <Link href="/products/manage"  className="subcategory-link">Manage Products</Link>
                    <Link href="/orders/manage"    className="subcategory-link">Manage Orders</Link>
                </div> 
            ) : 
            (
                <div className="subcategory-menu">
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        subcategories.map((subcategory) => (
                            <Link key={subcategory._id} href={`/shop?subcategoryId=${subcategory._id}`} 
                                className="subcategory-link"
                            >
                                {isRTL ? subcategory.name?.ar : subcategory.name?.en}
                            </Link>
                        ))
                    )}
                </div>
            )
        }

    </div>
</div>

);

}
export default NavBar;
