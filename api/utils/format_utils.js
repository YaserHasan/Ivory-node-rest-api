exports.formatProduct = (product, inDetails) => {
    const baseFormat = {
        id: product._id,
        name: product.name,
        category: {
            id: product.categoryID.id,
            name: product.categoryID.name,
        },
        price: product.price,
        imageURL: product.imageURL,
    };
    if (!inDetails) return baseFormat;
    return {
        ...baseFormat,
        description: product.description,
        specs: product.specs.map((spec) => {
            return {
                name: spec.name,
                value: spec.value
            }
        }),
    }
}