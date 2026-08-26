import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Members from "../pages/Members";
import MemberDetails from "../pages/MemberDetails";
import Deposits from "../pages/Deposits";
import NotFound from "../pages/NotFound";

import MainLayout from "../layouts/MainLayout";

function AppRouter() {
    return (
        <BrowserRouter>
            <MainLayout>
                <Routes>
                    <Route path="/" element={<Home />} />

                    <Route path="/login" element={<Login />} />

                    <Route path="/dashboard" element={<Dashboard />} />

                    <Route path="/members" element={<Members />} />

                    <Route
                        path="/members/:id"
                        element={<MemberDetails />}
                    />

                    <Route path="/deposits" element={<Deposits />} />

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </MainLayout>
        </BrowserRouter>
    );
}

export default AppRouter;