import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const defaultProfile = {
  photo: null,
  gender: 'women',
  height: 170,
  weight: 65,
  shoulder: 42,
  hip: 95,
  waist: 70,
  budget: 250,
  style: 'Casual',
  bodyType: 'Average',
};

export const useStylistStore = create(
  persist(
    (set, get) => ({
      profile: defaultProfile,
      profileComplete: false,
      recommendation: null,
      cart: [],
      tryOn: {
        currentImage: null,
        history: [],
      },

      setProfileField: (field, value) =>
        set((s) => ({ profile: { ...s.profile, [field]: value } })),
      setProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),
      markProfileComplete: () => set({ profileComplete: true }),

      setRecommendation: (recommendation) => set({ recommendation }),

      setTryOnImage: (image, entry) =>
        set((s) => ({
          tryOn: {
            currentImage: image,
            history: entry ? [...s.tryOn.history, entry] : s.tryOn.history,
          },
        })),
      resetTryOn: () =>
        set((s) => ({
          tryOn: { currentImage: s.profile.photo, history: [] },
        })),

      addToCart: (item) =>
        set((s) => {
          const existing = s.cart.find((c) => c.id === item.id);
          if (existing) {
            return {
              cart: s.cart.map((c) =>
                c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
              ),
            };
          }
          return { cart: [...s.cart, { ...item, quantity: 1 }] };
        }),
      removeFromCart: (id) => set((s) => ({ cart: s.cart.filter((c) => c.id !== id) })),
      updateQuantity: (id, delta) =>
        set((s) => ({
          cart: s.cart
            .map((c) => (c.id === id ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c))
            .filter((c) => c.quantity > 0),
        })),
      clearCart: () => set({ cart: [] }),

      reset: () =>
        set({
          profile: defaultProfile,
          profileComplete: false,
          recommendation: null,
          cart: [],
          tryOn: { currentImage: null, history: [] },
        }),
    }),
    {
      name: 'personal-stylist',
      partialize: (s) => ({
        profile: s.profile,
        profileComplete: s.profileComplete,
        cart: s.cart,
      }),
    }
  )
);

export const cartTotal = (cart) =>
  cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
