"use client";
import React from "react";
import { createContext, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
export const MyContext = createContext("");

export const MyContextProvider = ({ children }) => {
  const [name, setName] = useState("John Doe");
  const [age, setAge] = useState(1);
  const happyBirthday = () => setAge(age + 1);

  // State for storing selected recipes
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [likedRecipes, setlikedRecipes] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [likedMealIds, setLikedMealIds] = useState([]);

  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  const handleError = (e) => {
    setError(e.target.value);
  };

  const handleFirstNameChange = (e) => {
    setFirstName(e.target.value);
  };

  const handleLastNameChange = (e) => {
    setLastName(e.target.value);
  };
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  async function handleRegisterSubmit(e) {
    e.preventDefault();

    try {
      const { data } = await axios.post(
        "http://localhost:5000/users/register",
        {
          email,
          password,
          firstname: firstName,
          lastname: lastName,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(data);
      if (data?.msg === "SUCCESS") {
        setLoggedInUser(data.user); // Update UI based on logged-in user
        localStorage.setItem("token", data.token); // Consider security implications
        setEmail("");
        setPassword("");
        setError("");
        router.push("/plans");
      } else {
        // Handle cases where the message is not "SUCCESS"
        setError("Registration failed. Please try again.");
      }
    } catch (error) {
      setError(
        `Failed to register: ${error.response?.data?.error || error.message}`
      );
    }
  }

  async function fetchLikedmeals() {
    console.log(loggedInUser);
    const res = await fetch(
      `http://localhost:5000/api/wishlist/${loggedInUser?.userId}`
    );
    const data = await res.json();
    console.log(data.likedMeals);
    setLikedMealIds(data.likedMeals);
  }

  // Login submission
  async function handleLoginSubmit(e) {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "http://localhost:5000/users/login",
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(data);
      if (data?.msg === "SUCCESS") {
        setLoggedInUser(data.user);
      }

      router.push("/"); // Redirect to homepage or dashboard after successful login
    } catch (error) {
      setError("Failed to login"); // Update error message based on the actual error from the API
    }
  }

  // Logout
  function handleLogout() {
    // Remove token from storage and clear user state
    localStorage.removeItem("token");
    setEmail("");
    setLoggedInUser(null);
    setPassword("");
    setError(""); // Clear any errors
    router.push("/login"); // Redirect to login page after logout
  }

  // Function to add a meal to the selected recipes
  const handleSelectMeal = (selectedMeal) => {
    // Check if the meal is already in the selected recipes

    const isAlreadySelected = selectedRecipes.some(
      (meal) => meal._id === selectedMeal._id
    );

    console.log(selectedRecipes);
    if (!isAlreadySelected) {
      setSelectedRecipes([...selectedRecipes, selectedMeal]);
    }
  };

  // Function to add a meal to the liked list
  const handlelikedMeal = async (likedMeal) => {
    // Check if the meal is already in the selected recipes

    const isAlreadySelected = likedRecipes.some(
      (meal) => meal._id === likedMeal._id
    );

    if (!isAlreadySelected) {
      setlikedRecipes([...likedRecipes, likedMeal._id]);
    }
    if (loggedInUser) {
      const userId = loggedInUser.userId;
      const mealId = likedMeal._id;
      console.log(likedMeal._id);
      const { data } = await axios.post(
        "http://localhost:5000/api/wishlist",
        {
          userId,
          mealId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  };

  return (
    <MyContext.Provider
      value={{
        name,
        age,
        happyBirthday,
        handleRegisterSubmit,
        handleEmailChange,
        handlePasswordChange,
        handleError,
        email,
        handleSelectMeal,
        handlelikedMeal,
        handleLoginSubmit,
        password,
        handleLogout,
        firstName,
        lastName,
        likedMealIds,
        loggedInUser,
        likedRecipes,
        selectedRecipes,
        handleFirstNameChange,
        handleLastNameChange,
      }}
    >
      {children}
    </MyContext.Provider>
  );
};
