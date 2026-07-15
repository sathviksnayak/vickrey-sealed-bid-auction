import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";

import Browse from "./pages/browse/browse";
import Auction from "./pages/auction/auction";
import CreateAuction from "./pages/createauction/createauction";
import MyBids from "./pages/mybids/mybids";
import MyAuctions from "./pages/myauction/myauctions";
import Profile from "./pages/profile/profile";

function App() {
    return (
        <BrowserRouter>

            <Navbar />

            <Routes>

                <Route path="/" element={<Browse />} />

                <Route
                    path="/auction/:address"
                    element={<Auction />}
                />

                <Route
                    path="/create"
                    element={<CreateAuction />}
                />

                <Route
                    path="/my-bids"
                    element={<MyBids />}
                />

                <Route
                    path="/my-auctions"
                    element={<MyAuctions />}
                />

                <Route
                path="/profile"
                element ={<Profile/>}
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;