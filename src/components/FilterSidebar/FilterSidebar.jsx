import { useState } from "react";
import "./FilterSidebar.css";

function FilterSidebar({ filters, setFilters }) {
    const [open, setOpen] = useState({
        category: true,
        price: true,
        size: false,
        condition: false,
        sort: false
    });

    // Same category names as AddClothing.jsx
    const categories = [
        "Men's Wear",
        "Women's Wear",
        "Kids Wear",
        "Footwear",
        "Winter Wear",
        "Sports Wear",
        "Ethnic Wear",
        "Accessories",
        "Others",
        "Top",
        "Jeans"
    ];

    const sizes = [
        "XS",
        "S",
        "M",
        "L",
        "XL",
        "XXL",
        "Free Size"
    ];

    const conditions = [
        "New",
        "Like New",
        "Good",
        "Fair"
    ];

    const toggleSection = (section) => {
        setOpen((prev) => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // CATEGORY
    const selectCategory = (category) => {
        setFilters((prev) => ({
            ...prev,
            category:
                prev.category === category
                    ? ""
                    : category
        }));
    };

    // PRICE
    const changePrice = (field, value) => {
        setFilters((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    // SIZE
    const toggleSize = (size) => {
        setFilters((prev) => {
            const selected = prev.sizes.includes(size);

            return {
                ...prev,
                sizes: selected
                    ? prev.sizes.filter(
                          (item) => item !== size
                      )
                    : [...prev.sizes, size]
            };
        });
    };

    // CONDITION
    const selectCondition = (condition) => {
        setFilters((prev) => ({
            ...prev,
            condition:
                prev.condition === condition
                    ? ""
                    : condition
        }));
    };

    // SORT
    const selectSort = (sort) => {
        setFilters((prev) => ({
            ...prev,
            sort
        }));
    };

    // CLEAR
   const clearFilters = () => {
    setFilters({
        category: "",
        minPrice: "",
        maxPrice: "",
        sizes: [],
        condition: "",
        sort: "latest"
    });
};

    return (
        <aside className="filter-sidebar">

            {/* =========================
                HEADER
            ========================= */}

            <div className="filter-header">

                <div>
                    <span>FILTERS</span>

                    <h2>
                        Refine Results
                    </h2>
                </div>

                <button
                    type="button"
                    onClick={clearFilters}
                >
                    CLEAR
                </button>

            </div>

            {/* =========================
                CATEGORY
            ========================= */}

            <div className="filter-block">

                <button
                    type="button"
                    className="filter-heading"
                    onClick={() =>
                        toggleSection("category")
                    }
                >
                    <span>CATEGORY</span>

                    <b>
                        {open.category ? "−" : "+"}
                    </b>
                </button>

                {open.category && (
                    <div className="filter-content">

                        {categories.map((category) => {

                            const selected =
                                filters.category ===
                                category;

                            return (
                                <div
                                    className="category-group"
                                    key={category}
                                >

                                    <button
                                        type="button"
                                        className={
                                            selected
                                                ? "category-main selected"
                                                : "category-main"
                                        }
                                        onClick={() =>
                                            selectCategory(
                                                category
                                            )
                                        }
                                    >
                                        <span>
                                            {category}
                                        </span>

                                        <small>
                                            {selected
                                                ? "✓"
                                                : ""}
                                        </small>
                                    </button>

                                </div>
                            );
                        })}

                    </div>
                )}

            </div>

            {/* =========================
                PRICE
            ========================= */}

            <div className="filter-block">

                <button
                    type="button"
                    className="filter-heading"
                    onClick={() =>
                        toggleSection("price")
                    }
                >
                    <span>PRICE</span>

                    <b>
                        {open.price ? "−" : "+"}
                    </b>
                </button>

                {open.price && (
                    <div className="filter-content">

                        <div className="price-display">

                            <div>
                                <small>MIN</small>

                                <strong>
                                    ₹
                                    {filters.minPrice ||
                                        0}
                                </strong>
                            </div>

                            <div>
                                <small>MAX</small>

                                <strong>
                                    {filters.maxPrice
                                        ? `₹${filters.maxPrice}`
                                        : "Any"}
                                </strong>
                            </div>

                        </div>

                        <div className="price-input-row">

                            <input
                                type="number"
                                min="0"
                                value={
                                    filters.minPrice
                                }
                                onChange={(e) =>
                                    changePrice(
                                        "minPrice",
                                        e.target.value
                                    )
                                }
                            />

                            <span>—</span>

                            <input
                                type="number"
                                min="0"
                                value={
                                    filters.maxPrice
                                }
                                placeholder="MAX"
                                onChange={(e) =>
                                    changePrice(
                                        "maxPrice",
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                    </div>
                )}

            </div>

            {/* =========================
                SIZE
            ========================= */}

            <div className="filter-block">

                <button
                    type="button"
                    className="filter-heading"
                    onClick={() =>
                        toggleSection("size")
                    }
                >
                    <span>SIZE</span>

                    <b>
                        {open.size ? "−" : "+"}
                    </b>
                </button>

                {open.size && (
                    <div className="filter-content">

                        <div className="size-grid">

                            {sizes.map((size) => {

                                const selected =
                                    filters.sizes.includes(
                                        size
                                    );

                                return (
                                    <button
                                        type="button"
                                        key={size}
                                        className={
                                            selected
                                                ? "size-active"
                                                : ""
                                        }
                                        onClick={() =>
                                            toggleSize(
                                                size
                                            )
                                        }
                                    >
                                        {size}
                                    </button>
                                );
                            })}

                        </div>

                    </div>
                )}

            </div>

            {/* =========================
                CONDITION
            ========================= */}

            <div className="filter-block">

                <button
                    type="button"
                    className="filter-heading"
                    onClick={() =>
                        toggleSection("condition")
                    }
                >
                    <span>CONDITION</span>

                    <b>
                        {open.condition
                            ? "−"
                            : "+"}
                    </b>
                </button>

                {open.condition && (
                    <div className="filter-content">

                        <div className="condition-list">

                            {conditions.map(
                                (condition) => {

                                    const selected =
                                        filters.condition ===
                                        condition;

                                    return (
                                        <button
                                            type="button"
                                            key={condition}
                                            className={
                                                selected
                                                    ? "condition-active"
                                                    : ""
                                            }
                                            onClick={() =>
                                                selectCondition(
                                                    condition
                                                )
                                            }
                                        >
                                            <i></i>

                                            {condition}
                                        </button>
                                    );
                                }
                            )}

                        </div>

                    </div>
                )}

            </div>

            {/* =========================
                SORT
            ========================= */}

            <div className="filter-block">

                <button
                    type="button"
                    className="filter-heading"
                    onClick={() =>
                        toggleSection("sort")
                    }
                >
                    <span>SORT BY</span>

                    <b>
                        {open.sort ? "−" : "+"}
                    </b>
                </button>

                {open.sort && (
                    <div className="filter-content">

                        <div className="sort-list">

                            <button
                                type="button"
                                className={
                                    filters.sort ===
                                    "latest"
                                        ? "sort-active"
                                        : ""
                                }
                                onClick={() =>
                                    selectSort(
                                        "latest"
                                    )
                                }
                            >
                                <span></span>
                                Latest
                            </button>

                            <button
                                type="button"
                                className={
                                    filters.sort ===
                                    "oldest"
                                        ? "sort-active"
                                        : ""
                                }
                                onClick={() =>
                                    selectSort(
                                        "oldest"
                                    )
                                }
                            >
                                <span></span>
                                Oldest
                            </button>

                            <button
                                type="button"
                                className={
                                    filters.sort ===
                                    "low"
                                        ? "sort-active"
                                        : ""
                                }
                                onClick={() =>
                                    selectSort(
                                        "low"
                                    )
                                }
                            >
                                <span></span>
                                Price: Low to High
                            </button>

                            <button
                                type="button"
                                className={
                                    filters.sort ===
                                    "high"
                                        ? "sort-active"
                                        : ""
                                }
                                onClick={() =>
                                    selectSort(
                                        "high"
                                    )
                                }
                            >
                                <span></span>
                                Price: High to Low
                            </button>

                        </div>

                    </div>
                )}

            </div>

        </aside>
    );
}

export default FilterSidebar;