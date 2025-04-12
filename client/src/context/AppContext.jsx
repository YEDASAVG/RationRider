import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppContextProvider = ({children}) => {
    const currency = '₹'
    const navigate = useNavigate();
    const [user, setUser] = useState(null)
    const [isSeller, setIsSeller] = useState(false)
    const [showUserLogin, setShowUserLogin] = useState(false)
    const [products, setProducts] = useState([])
    const [cartItems, setCartItems] = useState({})
    const [searchQuery, setSearchQuery] = useState("")  // Changed to string
    const [isCartSyncing, setIsCartSyncing] = useState(false)

    // fetch seller status
    const fetchSeller = useCallback(async () => {
        try {
            const {data} = await axios.get('/api/seller/is-auth')
            setIsSeller(data.success)
        } catch (error) {
            setIsSeller(false)
            console.error('Seller auth failed:', error.message)
        }
    }, [])

    // fetch user auth status and data
    const fetchUser = useCallback(async () => {
        try {
            const {data} = await axios.get('/api/user/is-auth')
            if(data.success){
                setUser(data.user)
                setCartItems(data.user.cartItems || {})
            } else {
                setUser(null)
                setCartItems({})
            }
        } catch (error) {
            setUser(null)
            setCartItems({})
            console.error('Auth check failed:', error.message)
        }
    }, [])

    // fetch products
    const fetchProducts = useCallback(async () => {
        try {
            const {data} = await axios.get('/api/product/list')
            if(data.success){
                setProducts(data.products)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
            setProducts([])
        }
    }, [])

    // Cart functions with validation
    const addToCart = useCallback((itemId) => {
        if (!user) {
            toast.error("Please login first")
            setShowUserLogin(true)
            return
        }
        
        // Validate product exists
        const product = products.find(p => p._id === itemId)
        if (!product) {
            toast.error("Product not found")
            return
        }

        let cartData = structuredClone(cartItems)
        cartData[itemId] = (cartData[itemId] || 0) + 1
        setCartItems(cartData)
        toast.success("Added to cart")
    }, [user, products, cartItems])

    const updateCartItem = useCallback((itemId, quantity) => {
        if (!user) return
        if (quantity < 0) return
        
        const product = products.find(p => p._id === itemId)
        if (!product) {
            toast.error("Product not found")
            return
        }

        let cartData = structuredClone(cartItems)
        cartData[itemId] = quantity
        setCartItems(cartData)
        toast.success("Cart updated")
    }, [user, products, cartItems])

    const removeFromCart = useCallback((itemId) => {
        if (!user) return
        
        let cartData = structuredClone(cartItems)
        if(cartData[itemId]){
            cartData[itemId] -= 1
            if (cartData[itemId] === 0) {
                delete cartData[itemId]
            }
            setCartItems(cartData)
            toast.success("Removed from cart")
        }
    }, [user, cartItems])

    // Cart utility functions
    const getCartCount = useCallback(() => {
        return Object.values(cartItems).reduce((total, count) => total + count, 0)
    }, [cartItems])

    const getCartAmount = useCallback(() => {
        return Math.floor(Object.entries(cartItems).reduce((total, [itemId, count]) => {
            const item = products.find(p => p._id === itemId)
            return total + (item?.offerPrice || 0) * count
        }, 0) * 100) / 100
    }, [cartItems, products])

    // Debounced cart sync
    useEffect(() => {
        if (!user || isCartSyncing) return

        const timeoutId = setTimeout(async () => {
            setIsCartSyncing(true)
            try {
                // Changed from '/api/user/update' to '/api/cart/update'
                const {data} = await axios.post('/api/cart/update', {
                    userId: user._id,  // Add userId from user object
                    cartItems
                })
                if(!data.success){
                    toast.error(data.message)
                }
            } catch (error) {
                toast.error(error.message)
            } finally {
                setIsCartSyncing(false)
            }
        }, 1000) // Debounce for 1 second

        return () => clearTimeout(timeoutId)
    }, [cartItems, user])

    // Initial data fetch
    useEffect(() => {
        const controller = new AbortController()
        
        const init = async () => {
            try {
                await Promise.all([
                    fetchUser(),
                    fetchSeller(),
                    fetchProducts()
                ])
            } catch (error) {
                if (!controller.signal.aborted) {
                    console.error('Initialization failed:', error)
                }
            }
        }

        init()

        return () => controller.abort()
    }, [fetchUser, fetchSeller, fetchProducts])

    const value = {
        navigate, 
        user, setUser,
        isSeller, setIsSeller,
        showUserLogin, setShowUserLogin,
        products, currency,
        addToCart, updateCartItem, removeFromCart,
        cartItems, searchQuery, setSearchQuery,
        getCartCount, getCartAmount,
        axios, fetchProducts,
        setCartItems
    }

    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
}
export const useAppContext = () => {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error('useAppContext must be used within AppContextProvider')
    }
    return context
}
