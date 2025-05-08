import jwt from 'jsonwebtoken';
import axios from 'axios';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;

export const verifyToken = async (req, res, next) => {
  try {
    console.log("AUTH_SERVICE_URL:", AUTH_SERVICE_URL);
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    console.log("VERIFYING TOKEN ... ");
    
    // Verify token with auth service
    try {
      const response = await axios.get(`${AUTH_SERVICE_URL}/api/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("VERIFYING TOKEN: ", response.data);

      console.log("RESPONSE DATA: ", response.data)
      
      // Set the user data regardless of verification status
      req.user = {
        ...response.data.user,
        userId: response.data.user.id // Make sure userId is set
      };
      next();
    } catch (axiosError) {
      console.error("Auth Service Error:", {
        message: axiosError.message,
        response: axiosError.response?.data,
        status: axiosError.response?.status,
        url: `${AUTH_SERVICE_URL}/api/auth/verify`
      });
      throw axiosError;
    }
  } catch (error) {
    console.error("Authentication Error:", error);
    return res.status(401).json({ 
      message: 'Authentication failed',
      details: error.message 
    });
  }
};

export const checkRole = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      if (!roles.includes(req.user.role)) {
        console.log(`Access denied. User role: ${req.user.role}, Required roles: ${roles.join(', ')}`);
        return res.status(403).json({ 
          message: 'Access denied',
          details: `User role ${req.user.role} not in allowed roles: ${roles.join(', ')}`
        });
      }

      next();
    } catch (error) {
      console.error("Role Check Error:", error);
      return res.status(403).json({ message: 'Access denied' });
    }
  };
}; 