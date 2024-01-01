import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./components/redux/store"; 
import SignIn from "./components/Signin";
import SignUp from "./components/Signup";
import HomePage from "./components/user-home-page";
import Header from "./components/Header";
import AttendancePage from "./components/Attendance";
import Profile from "./components/Profile";
import Summary from "./components/Summary";
const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Header />
        <Routes>
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/" element={<SignIn />} />
          <Route path="/user-home-page" element={<HomePage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/profile" element={<Profile/>}/>
          <Route path="/summary" element={<Summary/>}/>
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
