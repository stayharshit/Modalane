import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

import type { ProductStoreType } from "@/types";

interface CartTypes {
  cartItems: ProductStoreType[];
}

const initialState = {
  cartItems: [],
} as CartTypes;

const indexSameProduct = (state: CartTypes, action: ProductStoreType) => {
  const sameProduct = (product: ProductStoreType) =>
    product.id === action.id &&
    product.color === action.color &&
    product.size === action.size;

  return state.cartItems.findIndex(sameProduct);
};

type AddProductType = {
  product: ProductStoreType;
  count: number;
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addProduct: (state, action: PayloadAction<AddProductType>) => {
      const cartItems = state.cartItems;

      const index = indexSameProduct(state, action.payload.product);

      if (index !== -1) {
        const existingItem = cartItems[index];
        if (existingItem) {
          existingItem.count += action.payload.count;
        }
        return;
      }

      return {
        ...state,
        cartItems: [...state.cartItems, action.payload.product],
      };
    },
    removeProduct(state, action: PayloadAction<ProductStoreType>) {
      const index = indexSameProduct(state, action.payload);
      if (index !== -1) {
        state.cartItems.splice(index, 1);
      }
    },
    setCount(state, action: PayloadAction<AddProductType>) {
      const indexItem = indexSameProduct(state, action.payload.product);
      if (indexItem === -1) {
        return;
      }

      const targetItem = state.cartItems[indexItem];
      if (targetItem) {
        targetItem.count = action.payload.count;
      }
    },
    clearCart(state) {
      state.cartItems = [];
    },
  },
});

export const { addProduct, removeProduct, setCount, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
