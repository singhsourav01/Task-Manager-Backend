export const PORT = 3000;

export const JWT_ALGORITHM = "RS256";

export const API_ENDPOINTS = {
  STAR: "*",
  BASE: "/auth",
  SIGNUP: "/signup",
  SIGN_IN: "/signin",
}

export const API_RESPONSES = {
  SIGN_IN: "Sign in successful!",
  SIGN_UP: "Sign up successful!",
}

export const API_ERRORS = {
    SIGN_IN: "Invalid email or password.",
    SIGN_UP: "Email already exists.",
    ROUTE_NOT_FOUND: "Route not found.",
    SEND_PROPER_JSON: "Please send proper JSON.",
}