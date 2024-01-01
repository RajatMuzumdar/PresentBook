import { Route, Navigate } from "react-router-dom";

// This is just a placeholder. Replace this with your actual authentication check.
const isAuthenticated = true;

const PrivateRoute = ({ element, ...props }) => {
  return (
    <Route {...props} element={isAuthenticated ? element : <Navigate to="/" replace />} />
  );
};

export default PrivateRoute;
