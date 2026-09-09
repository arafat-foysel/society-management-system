import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Members from "../pages/Members";
import MemberDetails from "../pages/MemberDetails";
import Deposits from "../pages/Deposits";
import Contributions from "../pages/Contributions";
import NotFound from "../pages/NotFound";

import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";


function AppRouter() {

    return (

        <BrowserRouter>

            <MainLayout>

                <Routes>

                    <Route
                        path="/"
                        element={<Home />}
                    />

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/members"
                        element={
                            <ProtectedRoute>
                                <Members />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/members/:id"
                        element={
                            <ProtectedRoute>
                                <MemberDetails />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/deposits"
                        element={
                            <ProtectedRoute>
                                <Deposits />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/contributions"
                        element={
                            <ProtectedRoute adminOnly>
                                <Contributions />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="*"
                        element={<NotFound />}
                    />

                </Routes>

            </MainLayout>

        </BrowserRouter>

    );

}


export default AppRouter;