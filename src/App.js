
// Update App.js to include User route


import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import HomePage from "./components/HomePage";
import RegisterPage from "./components/RegisterPage";

import User from "./components/User"; // ✅ import User page
import Orders from "./components/Pages/Orders";



import ProductData from './components/Pages/ProductData';
import RideData from './components/Pages/RideData';
import LiveData from './components/Pages/LiveData';
import SalesData from './components/Pages/SalesData';


import Drivers from './components/Drivers';

import Settings from "./components/Pages/Settings"; // ✅ import Settings page


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />

        <Route path="/settings" element={<Settings />} />
        <Route path="/users" element={<User />} /> {/* ✅ new route */}


<Route path="/orders" element={<Orders />} />



                <Route path="/products" element={<ProductData />} />
        <Route path="/rides" element={<RideData />} />
        <Route path="/live-data" element={<LiveData />} />
        <Route path="/sales-data" element={<SalesData />} />
     
        <Route path="/drivers" element={<Drivers />} />


        <Route path="/settings" element={<Settings />} /> {/* ✅ new route */}

      </Routes>
    </Router>
  );
}


export default App;


