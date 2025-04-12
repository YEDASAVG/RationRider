 import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import { toast } from 'react-hot-toast';

const Cart = () => {
    const { products, cartItems, currency, removeFromCart, getCartAmount, updateCartItem, navigate, getCartCount,axios,user,setCartItems } = useAppContext()

    const [cartArray, setCartArray] = useState([])
    const [addresses, setAddresses] = useState([])
    const [showAddress, setShowAddress] = useState(false)
    const [selectedAddress, setSelectedAddress] = useState(null)
    const [paymentMethod, setPaymentMethod] = useState('COD')
    const [isProcessing, setIsProcessing] = useState(false)

    const getCart = () => {
        let tempArray = []
        for (const key in cartItems) {
            const product = products.find((item) => item._id === key)
            if (product) {  // Add null check
                const productWithQuantity = {
                    ...product,
                    quantity: cartItems[key]
                }
                tempArray.push(productWithQuantity)
            }
        }
        setCartArray(tempArray)
    }

    const getUserAddress = async () => {
        try {
            const { data } = await axios.get('/api/address/get')
            if (data.success) {
                setAddresses(data.addresses)
                if (data.addresses.length > 0) {
                    setSelectedAddress(data.addresses[0])
                } else {
                    toast.error(data.message)
                }
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const placeOrder = async () => {
        try {
            if(!selectedAddress) {
                return toast.error('Please select an address')
            }
            // place order with COD
            if (paymentMethod === 'COD') {
                const { data } = await axios.post('/api/order/cod', {
                    userId: user._id,
                    items: cartArray.map(item => ({
                        product: item._id,
                        quantity: item.quantity
                    })),
                    address: selectedAddress._id,
                    paymentMethod
                })
                if (data.success) {
                    toast.success(data.message)
                    setCartItems({})
                    navigate('/my-orders')
                } else {
                    toast.error(data.message)
                }
            } else {
                // place order with online payment

                const { data } = await axios.post('/api/order/stripe', {
                    userId: user._id,
                    items: cartArray.map(item => ({
                        product: item._id,
                        quantity: item.quantity
                    })),
                    address: selectedAddress._id,
                })
                if (data.success) {
                    window.location.replace(data.url)
                    toast.success(data.message)
                    navigate('/orders')
                } else {
                    toast.error(data.message)
                }
                setIsProcessing(false)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if(products.length > 0 && cartItems){
            getCart()
        }
    }, [products, cartItems])

    useEffect(() => {
        if (user) {
            getUserAddress()
        }
    }, [user])

    if (products.length === 0 || !cartItems || Object.keys(cartItems).length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <div className="w-64 h-64 mb-4 flex items-center justify-center">
                    <svg 
                        className="w-32 h-32 text-primary" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
                        />
                    </svg>
                </div>
                <h2 className="text-2xl font-medium mb-2">Your Cart is Empty</h2>
                <p className="text-gray-500 mb-4">Add items to your cart to start shopping</p>
                <button 
                    onClick={() => {navigate('/products'); scrollTo(0, 0)}}
                    className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-dull transition"
                >
                    Browse Products
                </button>
            </div>
        )
    }

    return (
        <div className="flex flex-col md:flex-row mt-16 max-w-7xl mx-auto px-4">
            <div className='flex-1 max-w-4xl'>
                <h1 className="text-3xl font-medium mb-6">
                    Shopping Cart <span className="text-sm text-primary">{getCartCount()} Items</span>
                </h1>

                <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-base font-medium pb-3">
                    <p className="text-left">Product Details</p>
                    <p className="text-center">Subtotal</p>
                    <p className="text-center">Action</p>
                </div>

                {cartArray.map((product, index) => (
                    <div key={index} className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 items-center text-sm md:text-base font-medium pt-3">
                        <div className="flex items-center md:gap-6 gap-3">
                            <div onClick={() => {
                                navigate(`/products/${product.category.toLowerCase()}/${product._id}`); scrollTo(0, 0);
                            }} className="cursor-pointer w-24 h-24 flex items-center justify-center border border-gray-300 rounded">
                                <img className="max-w-full h-full object-cover" src={product.image[0]} alt={product.name} />
                            </div>
                            <div>
                                <p className="md:hidden text-sm font-semibold mb-1">{product.name}</p>
                                <p className="hidden md:block font-semibold">{product.name}</p>
                                <div className="font-normal text-gray-500/70">
                                    <p>Weight: <span>{product.weight || "N/A"}</span></p>
                                    <div className='flex items-center'>
                                        <p>Qty:</p>
                                        <select 
                                            onChange={e => updateCartItem(product._id, Number(e.target.value))} 
                                            value={cartItems[product._id]} 
                                            className='outline-none'
                                        >
                                            {Array(20).fill('').map((_, index) => (
                                                <option key={index} value={index + 1}>{index + 1}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-center">{currency}{product.offerPrice * product.quantity}</p>
                        <button onClick={() => removeFromCart(product._id)} className="cursor-pointer mx-auto">
                            <img src={assets.remove_icon} alt="remove" className="inline-block w-6 h-6" />
                        </button>
                    </div>)
                )}

                <button onClick={() => {navigate('/products'); scrollTo(0, 0)}} className="group cursor-pointer flex items-center mt-8 gap-2 text-primary font-medium">
                    <img src={assets.arrow_right_icon_colored} alt="arrow" className="group-hover:-translate-x-1 transition" />
                    Continue Shopping
                </button>

            </div>

            <div className="md:ml-8 max-w-[360px] w-full bg-gray-100/40 p-5 max-md:mt-16 border border-gray-300/70 h-fit">
                <h2 className="text-xl md:text-xl font-medium">Order Summary</h2>
                <hr className="border-gray-300 my-5" />

                <div className="mb-6">
                    <p className="text-sm font-medium uppercase">Delivery Address</p>
                    <div className="relative flex justify-between items-start mt-2">
                        <p className="text-gray-500">{selectedAddress ? `${selectedAddress.street},${selectedAddress.city},${selectedAddress.state},${selectedAddress.country} ` : 'No address found'}</p>
                        <button onClick={() => setShowAddress(!showAddress)} className="text-primary hover:underline cursor-pointer">
                            Change
                        </button>
                        {showAddress && (
                            <div className="absolute top-12 py-1 bg-white border border-gray-300 text-sm w-full">
                                {addresses.map((address) => (<p onClick={() => {setSelectedAddress(address); setShowAddress(false)}} className="text-gray-500 p-2 hover:bg-gray-100">
                                    {address.street}, {address.city}, {address.state}, {address.country}
                                </p>))}
                                <p onClick={() => navigate('/add-address')} className="text-primary text-center cursor-pointer p-2 hover:bg-primary-dull/10">
                                    Add address
                                </p>
                            </div>
                        )}
                    </div>

                    <p className="text-sm font-medium uppercase mt-6">Payment Method</p>

                    <select onChange={e => setPaymentMethod(e.target.value)} className="w-full border border-gray-300 bg-white px-3 py-2 mt-2 outline-none">
                        <option value="COD">Cash On Delivery</option>
                        <option value="Online">Online Payment</option>
                    </select>
                </div>

                <hr className="border-gray-300" />

                <div className="text-gray-500 mt-4 space-y-2">
                    <p className="flex justify-between">
                        <span>Price</span><span>{currency}{getCartAmount()}</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Shipping Fee</span><span className="text-green-600">Free</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Tax (2%)</span><span>{currency}{(getCartAmount() * 0.02).toFixed(2)}</span>
                    </p>
                    <p className="flex justify-between text-lg font-medium mt-3">
                        <span>Total Amount:</span>
                        <span>{currency}{(getCartAmount() + getCartAmount() * 0.02).toFixed(2)}</span>
                    </p>
                </div>

                <button 
                    onClick={placeOrder} 
                    disabled={isProcessing}
                    className="w-full py-3 mt-6 cursor-pointer bg-primary text-white font-medium hover:bg-primary-dull transition disabled:bg-gray-400"
                >
                    {isProcessing 
                        ? 'Processing...' 
                        : paymentMethod === 'COD' 
                            ? 'Place Order' 
                            : 'Proceed to Checkout'
                    }
                </button>
            </div>
        </div>
    )
}

export default Cart
