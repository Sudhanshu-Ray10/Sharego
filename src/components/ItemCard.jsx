import React from 'react';

const ItemCard = ({ item }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 m-4">
      <h2 className="text-xl font-bold">{item.title}</h2>
      <p className="text-gray-600">{item.description}</p>
      <p className="text-sm text-gray-500">Category: {item.category}</p>
      <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">Request Item</button>
    </div>
  );
};

export default ItemCard;
