import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";

const Card = ({ children, style, variant = "default" }) => {
  const { theme } = useTheme();

  const getCardStyle = () => {
    const baseStyle = {
      borderRadius: 20,
      padding: 20,
      marginVertical: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 5,
    };

    switch (variant) {
      case "elevated":
        return {
          ...baseStyle,
          backgroundColor: theme.surface,
          borderWidth: 0,
          elevation: 8,
          shadowOpacity: 0.12,
        };
      case "outlined":
        return {
          ...baseStyle,
          backgroundColor: theme.surface,
          borderWidth: 1.5,
          borderColor: theme.border,
          elevation: 2,
        };
      case "gradient":
        return {
          ...baseStyle,
          backgroundColor: theme.surface,
          borderWidth: 0,
          elevation: 6,
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: theme.surface,
          borderWidth: 1,
          borderColor: theme.border,
        };
    }
  };

  return <View style={[getCardStyle(), style]}>{children}</View>;
};

export default Card;
