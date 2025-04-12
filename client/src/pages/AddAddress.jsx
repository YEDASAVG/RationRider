import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

// input fields component

const InputField = ({ type, placeholder, name, handleChange, address }) => (
  <input
    className="w-full px-2 py-2.5 border border-gray-500/30 rounded outline-none text-gray-500 focus:border-primary transition"
    type={type}
    placeholder={placeholder}
    name={name}
    onChange={handleChange}
    value={address[name]}
    required
  />
);

const AddAddress = () => {

  const {axios, navigate, user} = useAppContext();

  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setAddress((prevAddress) => ({
      ...prevAddress,
      [name]: value,
    }));
  };


  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/address/add', {address});
      if(data.success){
        toast.success(data.message)
        navigate('/cart')
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  };

  useEffect(() => {
    if(!user) navigate('/cart')
  }, [user, navigate])

  return (
    <div className="mt-16 pb-16">
      <p className="text-2xl md:text-3xl text-gray-500">
        Add Shipping <span className="font-semibold text-primary">Address</span>{" "}
      </p>
      <div className="flex flex-col-reverse md:flex-row mt-10 justify-between">
        <div className="flex-1 max-w-md">
          <form onSubmit={onSubmitHandler} className="space-y-3 mt-6 text-sm">

            <div className="grid grid-cols-2 gap-4">
              <InputField handleChange={handleChange} address={address} name= 'firstName' type="text" placeholder="First Name" />

              <InputField handleChange={handleChange} address={address} name='lastName' type="text" placeholder="Last Name" />
            </div>

            <InputField handleChange={handleChange} address={address} name='email' type="email" placeholder="Email address" />
            <InputField handleChange={handleChange} address={address} name='street' type="text" placeholder="Street" />

            <div className="grid grid-cols-2 gap-4">
                <InputField handleChange={handleChange} address={address} name='city' type="text" placeholder="City" />
                <InputField handleChange={handleChange} address={address} name='state' type="text" placeholder="State" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <InputField handleChange={handleChange} address={address} name='zipCode' type="number" placeholder="Zip Code" />
                <InputField handleChange={handleChange} address={address} name='country' type="text" placeholder="country" />
            </div>

            <InputField handleChange={handleChange} address={address} name='phone' type="number" placeholder="Phone Number" />
            <button className="w-full py-3 mt-3 cursor-pointer bg-primary text-white font-medium hover:bg-primary-dull transition uppercase">Save Address</button>

          </form>
        </div>
        <img
          className="md:mr-16 mb-16 md:mt-0"
          src={assets.add_address_image}
          alt="Add Address"
        />
      </div>
    </div>
  );
};

export default AddAddress;
